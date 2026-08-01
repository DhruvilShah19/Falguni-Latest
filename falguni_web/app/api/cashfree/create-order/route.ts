import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getRoadDistanceEstimateKm, parseWeightToKg, calculateDeliveryFee, STUDIO_FALGUNI_LATLNG } from '@/lib/deliveryPricing';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, customer_details, order_meta, order_note, cart_details } = body;

    const customerId = customer_details?.customer_id;
    if (!customerId) {
      return NextResponse.json({ message: 'Customer ID is required.' }, { status: 400 });
    }

    // 1. Calculate Server-Side Subtotal securely from the Database Cart
    const cartSnapshot = await adminDb.collection('users').doc(customerId).collection('Cart').get();
    if (cartSnapshot.empty) {
      return NextResponse.json({ message: 'Cart is empty.' }, { status: 400 });
    }

    let subTotal = 0;
    let totalWeightKg = 0;
    cartSnapshot.forEach((doc) => {
      const item = doc.data();
      subTotal += Number(item.price || 0); // "price" field is the item's total cost in Cart
      const qty = item.quantity || 1;
      const w = parseWeightToKg(item.selected || item.unitname1 || '');
      totalWeightKg += (w * qty);
    });

    // 2. Validate and Apply Server-Side Coupon
    let discountedTotal = subTotal;
    if (cart_details?.isApp) {
      const userSnap = await adminDb.collection('users').doc(customerId).get();
      if (userSnap.exists) {
        const couponReward = Number(userSnap.data()?.['Coupon Reward'] || 0);
        if (couponReward > 0) {
          discountedTotal = subTotal - (subTotal * couponReward) / 100;
        }
      }
    } else if (cart_details?.couponCode) {
      const couponSnap = await adminDb.collection('Coupons').where('coupon', '==', cart_details.couponCode).limit(1).get();
      if (!couponSnap.empty) {
        const couponData = couponSnap.docs[0].data();
        const discountPercentage = Number(couponData.percentage || 0);
        if (discountPercentage > 0) {
          discountedTotal = subTotal - (subTotal * discountPercentage) / 100;
        }
      }
    }

    let finalTotal = discountedTotal;
    let fee = 0;
    if (cart_details && !cart_details.isPickup) {
      const deliveryAddress = cart_details.deliveryAddress || '';
      // If lat/lng weren't submitted, distance = Infinity forces the
      // weight-based outstation branch below -- the deliberate "charge more
      // rather than accidentally undercharge" fallback for an unresolvable
      // delivery location.
      const distanceKm = (cart_details.deliveryLat && cart_details.deliveryLng)
        ? getRoadDistanceEstimateKm(STUDIO_FALGUNI_LATLNG.lat, STUDIO_FALGUNI_LATLNG.lng, Number(cart_details.deliveryLat), Number(cart_details.deliveryLng))
        : Infinity;
      fee = calculateDeliveryFee(distanceKm, deliveryAddress, subTotal, totalWeightKg).fee;
      finalTotal += fee;
    }

    // 4. Final strict validation of calculated amount
    const order_amount = Number(finalTotal.toFixed(2));
    if (order_amount <= 0) {
      return NextResponse.json({ message: 'Invalid order amount calculated.' }, { status: 400 });
    }

    // 5. Securely Build the Draft Order on the Server
    const items: any[] = [];
    cartSnapshot.forEach((doc) => items.push(doc.data()));

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Calculate week number (same as Flutter's Week.current().weekNumber)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);

    let discountPercentage = 0;
    if (cart_details?.couponCode) {
      const couponSnap = await adminDb.collection('Coupons').where('coupon', '==', cart_details.couponCode).limit(1).get();
      if (!couponSnap.empty) {
        discountPercentage = Number(couponSnap.docs[0].data().percentage || 0);
      }
    } else if (cart_details?.isApp) {
      const userSnap = await adminDb.collection('users').doc(customerId).get();
      if (userSnap.exists) {
        discountPercentage = Number(userSnap.data()?.['Coupon Reward'] || 0);
      }
    }

    // Fetch vendorID and orderID from Firestore (same as Flutter app)
    let vendorID = '';
    let nextOrderID = 100000;
    try {
      const vendorIdSnap = await adminDb.collection('Vendor ID').doc('Vendor ID').get();
      if (vendorIdSnap.exists) {
        vendorID = vendorIdSnap.data()?.['Vendor ID'] || '';
      }
      if (vendorID) {
        const vendorSnap = await adminDb.collection('vendors').doc(vendorID).get();
        if (vendorSnap.exists) {
          nextOrderID = (Number(vendorSnap.data()?.['orderID']) || 0) + 1;
        }
      }
    } catch (e) {
      console.error('Error fetching vendor details:', e);
    }

    // Fetch user's CurrentMarketID from their user doc
    let currentMarketID = '';
    try {
      const userDocSnap = await adminDb.collection('users').doc(customerId).get();
      if (userDocSnap.exists) {
        currentMarketID = userDocSnap.data()?.['CurrentMarketID'] || '';
      }
    } catch (e) {
      console.error('Error fetching user market ID:', e);
    }

    // Use DateTime.now().toString() format as uid (matches Flutter's checkout)
    const uid = now.toISOString();

    await adminDb.collection('DraftOrders').doc(order_id).set({
      uid: uid,
      userID: customerId,
      userId: customerId,
      userEmail: customer_details.customer_email || '',
      userName: cart_details?.fullName || customer_details.customer_name || '',
      orderID: nextOrderID,
      marketID: currentMarketID,
      vendorID: vendorID,
      deliveryBoyID: '',
      orders: items.map(i => ({
        name: i.name || '',
        productName: i.name || '',
        image1: i.image1 || '',
        quantity: i.quantity || 1,
        price: i.price || 0,
        selectedPrice: i.selectedPrice || 0,
        selected: i.selected || '',
        vendorId: i.vendorId || vendorID || '',
        productID: i.productID || '',
        category: i.category || '',
        totalRating: i.totalRating || 0,
        totalNumberOfUserRating: i.totalNumberOfUserRating || 0,
        id: i.productID || '',
      })),
      items: items.map(i => ({
        name: i.name || '',
        image1: i.image1 || '',
        quantity: i.quantity || 1,
        price: i.price || 0,
        selected: i.selected || '',
        vendorId: i.vendorId || vendorID || '',
        productID: i.productID || '',
      })),
      subTotal: subTotal,
      couponCode: cart_details?.couponCode || null,
      couponDiscount: discountPercentage,
      discountedSubTotal: discountedTotal,
      deliveryFee: fee,
      total: order_amount,
      deliveryAddress: cart_details?.isPickup ? '' : (cart_details?.deliveryAddress || ''),
      pickupAddress: cart_details?.isPickup ? 'Pick Up' : '',
      houseNumber: '',
      closesBusStop: '',
      phone: cart_details?.phone || customer_details.customer_phone || '',
      paymentType: 'Online',
      paymentMethod: 'Online',
      cashfreeOrderId: order_id,
      status: 'Pending Payment',
      confirmationStatus: false,
      acceptDelivery: false,
      accept: false,
      weekNumber: weekNumber,
      date: `${dayName}, ${now.toLocaleDateString('en-US', { month: 'long' })} ${now.getDate()}`,
      day: dayName,
      month: (now.getMonth() + 1).toString(),
      year: now.getFullYear().toString(),
      timeCreated: dateStr,
      createdAt: new Date(),
    });

    const apiUrl = process.env.CASHFREE_API_URL?.endsWith('/orders') 
      ? process.env.CASHFREE_API_URL 
      : `${process.env.CASHFREE_API_URL}/orders`;
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!apiUrl || !clientId || !clientSecret) {
      console.error('Missing Cashfree environment variables.');
      return NextResponse.json(
        { message: 'Payment configuration is missing on the server.' },
        { status: 500 }
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-client-secret': clientSecret,
      'x-api-version': '2023-08-01',
      'x-request-id': order_id || crypto.randomUUID(),
    };

    const requestBody = {
      order_amount,
      order_id,
      order_currency: 'INR',
      customer_details,
      order_meta,
      order_note,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to initialize payment with Cashfree.' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'An internal error occurred while connecting to the payment gateway.' },
      { status: 500 }
    );
  }
}
