import { adminDb } from './firebase-admin';
import { calculateDeliveryFee, getRoadDistanceEstimateKm, parseWeightToKg, STUDIO_FALGUNI_LATLNG, volumetricWeightKg, estimatePackedWeight, DEFAULT_PACKING_BUFFER } from './deliveryPricing';

export class DeliveryQuoteError extends Error {}

// Resolve the address server-side: client coordinates must not determine the bill.
async function resolveDestination(address: string) {
  const key = process.env.GOOGLE_MAPS_GEOCODING_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) throw new DeliveryQuoteError('Delivery address verification is unavailable. Please contact the store.');
  const params = new URLSearchParams({ address, components: 'country:IN', key });
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { 
    signal: AbortSignal.timeout(10000), 
    cache: 'no-store',
    headers: { 'Referer': 'https://www.falgunigruhudhyog.in/' }
  });
  if (!response.ok) throw new DeliveryQuoteError('Could not verify the delivery address. Please try again.');
  const data = await response.json();
  const result = data.results?.[0];
  const state = result?.address_components?.find((c: { types: string[] }) => c.types.includes('administrative_area_level_1'))?.long_name;
  if (data.status !== 'OK' || !result || !state) {
    throw new DeliveryQuoteError('Please enter a complete delivery address with city, state and PIN code.');
  }
  return { ...result.geometry.location, state } as { lat: number; lng: number; state: string };
}

export async function buildDeliveryQuote(customerId: string, details: Record<string, unknown>) {
  const cartSnapshot = await adminDb.collection('users').doc(customerId).collection('Cart').get();
  if (cartSnapshot.empty) throw new DeliveryQuoteError('Cart is empty.');
  const items = cartSnapshot.docs.map(doc => doc.data());
  let subTotal = 0;
  for (const item of items) {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity <= 0) throw new DeliveryQuoteError('A cart item has an invalid price or quantity.');
    subTotal += price;
  }
  let discountPercentage = 0;
  let appliedCouponCode: string | null = null;
  const couponSystem = await adminDb.collection('Coupon System').doc('Coupon System').get();
  if (!couponSystem.exists || couponSystem.data()?.Status !== false) {
    if (details.isApp === true) {
      const user = await adminDb.collection('users').doc(customerId).get();
      discountPercentage = Number(user.data()?.['Coupon Reward'] || 0);
    } else if (typeof details.couponCode === 'string' && details.couponCode) {
      const coupons = await adminDb.collection('Coupons').where('coupon', '==', details.couponCode).limit(1).get();
      if (!coupons.empty) {
        discountPercentage = Number(coupons.docs[0].data().percentage || 0);
        appliedCouponCode = details.couponCode;
      }
    }
  }
  if (!Number.isFinite(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) throw new DeliveryQuoteError('Invalid coupon configuration. Please contact the store.');
  const discountedTotal = Math.round(subTotal * (1 - discountPercentage / 100) * 100) / 100;
  let delivery = null;
  if (details.isPickup !== true) {
    if (typeof details.deliveryAddress !== 'string' || !details.deliveryAddress.trim()) throw new DeliveryQuoteError('Select a delivery address.');
    const destination = await resolveDestination(details.deliveryAddress);
    const settingsDoc = await adminDb.collection('Delivery Settings').doc('Framework').get();
    const settings = settingsDoc.data() || {};
    const origin = settings.storeOrigin || STUDIO_FALGUNI_LATLNG;
    if (![origin.lat, origin.lng].every(Number.isFinite) || Math.abs(origin.lat) > 90 || Math.abs(origin.lng) > 180) throw new DeliveryQuoteError('Invalid dispatch location configuration.');
    const distanceKm = getRoadDistanceEstimateKm(origin.lat, origin.lng, destination.lat, destination.lng);
    let actualWeight = 0;
    let volumetricWeight = 0;
    const volumetricEnabled = settings.volumetricEnabled === true;
    if (distanceKm > 15) {
      for (const item of items) {
        // Shipping metadata is maintained by the store, never accepted from the request.
        let product = item.productID ? await adminDb.collection('Products').doc(String(item.productID)).get() : null;
        if (item.productID && !product?.exists) {
          const matches = await adminDb.collection('Products').where('productID', '==', String(item.productID)).limit(1).get();
          product = matches.empty ? null : matches.docs[0];
        }
        const variant = product?.data()?.shippingVariants?.[item.selected || item.unitname1];
        const label = String(item.selected || item.unitname1 || '');
        if (!variant?.actualWeightKg && !/^\s*\d+(?:\.\d+)?\s*(kg|gm|g)\s*$/i.test(label)) throw new DeliveryQuoteError(`Shipping weight is missing for ${item.name || 'a cart item'}. Please contact the store.`);
        const weight = Number(variant?.actualWeightKg ?? parseWeightToKg(label));
        if (!Number.isFinite(weight) || weight <= 0) throw new DeliveryQuoteError('Invalid product shipping weight.');
        actualWeight += weight * Number(item.quantity);
        if (volumetricEnabled) {
          if (!variant) throw new DeliveryQuoteError(`Package measurements are missing for ${item.name || 'a cart item'}.`);
          volumetricWeight += volumetricWeightKg(Number(variant.lengthCm), Number(variant.widthCm), Number(variant.heightCm), Number(settings.volumetricDivisor)) * Number(item.quantity);
        }
      }
    }
    const packingBuffer = settings.packingBuffer || DEFAULT_PACKING_BUFFER;
    const estimatedPackedWeight = distanceKm > 15 && !volumetricEnabled && packingBuffer.enabled !== false
      ? estimatePackedWeight(actualWeight, Number(packingBuffer.multiplier ?? 1.25), Number(packingBuffer.tareKg ?? 0.25))
      : actualWeight;
    delivery = {
      ...calculateDeliveryFee(distanceKm, destination.state, discountedTotal, estimatedPackedWeight, volumetricWeight),
      distanceKm, destination, distanceMethod: 'haversine-times-1.3', state: destination.state, origin,
      actualWeight, volumetricWeight, estimatedPackedWeight,
      packingBuffer: !volumetricEnabled && distanceKm > 15 ? packingBuffer : null,
      weightBasis: distanceKm <= 15 ? 'not-applicable' : volumetricEnabled ? 'actual-or-volumetric' : packingBuffer.enabled !== false ? 'buffered-product-weight-estimate' : 'product-weight-estimate',
    };
  }
  const fee = delivery?.fee ?? 0;
  return { items, subTotal, discountedTotal, discountPercentage, appliedCouponCode, delivery, fee, finalTotal: Math.round((discountedTotal + fee) * 100) / 100 };
}
