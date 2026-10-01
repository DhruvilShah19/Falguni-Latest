import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { buildDeliveryQuote, DeliveryQuoteError } from '@/lib/deliveryQuote';
import { getAuth } from 'firebase-admin/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, customer_details, order_meta, order_note, cart_details } = body;

    const customerId = customer_details?.customer_id;
    if (!customerId) {
      return NextResponse.json({ message: 'Customer ID is required.' }, { status: 400 });
    }

    try {
      const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
      if (!token || (await getAuth().verifyIdToken(token)).uid !== customerId) throw new Error('Unauthorized');
    } catch {
      return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
    }

    // 0. Enforce Store Status (Open / Closed for new orders)
    const storeStatusDoc = await adminDb.collection('Store Settings').doc('Store Status').get();
    if (storeStatusDoc.exists) {
      const storeStatus = storeStatusDoc.data();
      if (storeStatus?.isOpen === false) {
        return NextResponse.json(
          {
            message:
              storeStatus?.closedMessage ||
              'Our store is currently closed for new orders. Please check back during operating hours (9:00 AM – 9:00 PM)!',
            isStoreClosed: true,
          },
          { status: 403 }
        );
      }
    }

    // Recompute the reviewed quote immediately before charging.
    const quote = await buildDeliveryQuote(customerId, cart_details || {});
    const { items, subTotal, discountedTotal, discountPercentage, appliedCouponCode, fee, finalTotal } = quote;
    const order_amount = finalTotal;
    if (!Number.isFinite(order_amount) || order_amount <= 0) {
      return NextResponse.json({ message: 'Invalid order amount calculated.' }, { status: 400 });
    }
    const expectedTotal = Number(cart_details?.expectedTotal);
    if (!Number.isFinite(expectedTotal) || Math.round(expectedTotal * 100) !== Math.round(finalTotal * 100)) {
      return NextResponse.json({ message: 'Your cart or delivery price changed. Please refresh the delivery quote before paying.', quote: { ...quote, items: undefined } }, { status: 409 });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Calculate week number (same as Flutter's Week.current().weekNumber)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);

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

    if (!vendorID) {
      const firstVendor = items.find(i => i.vendorId || i.vendorID)?.vendorId || items.find(i => i.vendorId || i.vendorID)?.vendorID;
      if (firstVendor) {
        vendorID = firstVendor;
      } else {
        try {
          const anyVendorSnap = await adminDb.collection('vendors').limit(1).get();
          if (!anyVendorSnap.empty) {
            vendorID = anyVendorSnap.docs[0].id;
          }
        } catch (_e) {
          // best-effort
        }
      }
    }

    // Fetch user's CurrentMarketID and sync phone to root user doc if missing
    let currentMarketID = '';
    try {
      const userDocRef = adminDb.collection('users').doc(customerId);
      const userDocSnap = await userDocRef.get();
      if (userDocSnap.exists) {
        const userData = userDocSnap.data();
        currentMarketID = userData?.['CurrentMarketID'] || '';
        
        // Sync phone to root user doc if it's missing or empty so Flutter admin doesn't crash
        const providedPhone = cart_details?.phone || customer_details?.customer_phone || '';
        if (providedPhone && (!userData?.phone || userData?.phone.trim() === '')) {
          await userDocRef.update({
            phone: providedPhone,
            Phone: providedPhone
          });
        }
      }
    } catch (e) {
      console.error('Error fetching/updating user doc:', e);
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
      total: finalTotal,
      couponCode: appliedCouponCode || null,
      couponDiscount: discountPercentage,
      discountedSubTotal: discountedTotal,
      deliveryFee: fee,
      deliveryCalculation: quote.delivery,
      deliveryPolicyVersion: 2,
      deliveryAddress: cart_details?.isPickup ? '' : (cart_details?.deliveryAddress || ''),
      pickupAddress: cart_details?.isPickup
        ? `${cart_details?.pickupStoreTitle ? cart_details.pickupStoreTitle + ': ' : ''}${cart_details?.pickupStoreAddress || 'Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Mahavir Nagar Society, Vastrapur, Ahmedabad, Gujarat 380015'}`
        : '',
      isPickup: !!cart_details?.isPickup,
      pickupStoreTitle: cart_details?.pickupStoreTitle || (cart_details?.isPickup ? 'Falguni Gruh Udhyog - Vastrapur Flagship' : ''),
      pickupContactName: cart_details?.pickupContactName || cart_details?.fullName || customer_details.customer_name || '',
      pickupContactPhone: cart_details?.pickupContactPhone || cart_details?.phone || customer_details.customer_phone || '',
      houseNumber: '',
      closesBusStop: '',
      phone: cart_details?.phone || customer_details.customer_phone || '',
      paymentType: 'Cash Free',
      paymentMethod: 'Online (Cashfree)',
      cashfreeOrderId: order_id,
      cashFreeDetails: {
        order_id: order_id,
        cf_order_id: order_id,
        order_status: 'ACTIVE',
        order_amount: order_amount,
        order_currency: 'INR',
      },
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
      { message: error instanceof DeliveryQuoteError ? error.message : 'An internal error occurred while connecting to the payment gateway.' },
      { status: 500 }
    );
  }
}
