import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

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
    cartSnapshot.forEach((doc) => {
      const item = doc.data();
      subTotal += Number(item.price || 0); // "price" field is the item's total cost in Cart
    });

    // 2. Validate and Apply Server-Side Coupon
    let discountedTotal = subTotal;
    if (cart_details?.couponCode) {
      const couponSnap = await adminDb.collection('Coupons').where('coupon', '==', cart_details.couponCode).limit(1).get();
      if (!couponSnap.empty) {
        const couponData = couponSnap.docs[0].data();
        const discountPercentage = Number(couponData.discount || 0);
        if (discountPercentage > 0) {
          discountedTotal = subTotal - (subTotal * discountPercentage) / 100;
        }
      }
    }

    // 3. Apply Delivery Fee securely if not pickup
    let finalTotal = discountedTotal;
    if (cart_details && !cart_details.isPickup) {
      const deliverySnap = await adminDb.collection('Delivery Fee').doc('Delivery Fee').get();
      if (deliverySnap.exists) {
        const fee = Number(deliverySnap.data()?.['Delivery Fee'] || 0);
        finalTotal += fee;
      }
    }

    // 4. Final strict validation of calculated amount
    const order_amount = Number(finalTotal.toFixed(2));
    if (order_amount <= 0) {
      return NextResponse.json({ message: 'Invalid order amount calculated.' }, { status: 400 });
    }

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
