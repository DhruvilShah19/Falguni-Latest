import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const baseUrl = process.env.CASHFREE_API_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    return NextResponse.json({ error: 'Server missing Cashfree credentials' }, { status: 500 });
  }

  const headers = {
    'x-client-id': clientId,
    'x-client-secret': clientSecret,
    'x-api-version': '2023-08-01',
    'Accept': 'application/json'
  };

  try {
    // 1. Fetch Order details
    const orderRes = await fetch(`${baseUrl}/orders/${orderId}`, { headers });
    
    if (orderRes.status === 404) {
      return NextResponse.json({ error: 'Order not found on Cashfree' }, { status: 404 });
    }
    
    if (!orderRes.ok) {
      const errText = await orderRes.text();
      return NextResponse.json({ error: `Cashfree API Error: ${orderRes.status} ${errText}` }, { status: orderRes.status });
    }

    const orderData = await orderRes.json();
    
    let customerName = '';
    let customerPhone = '';
    let paymentMethod = '';
    let cfPaymentTime = '';

    if (orderData.customer_details) {
      customerName = orderData.customer_details.customer_name || '';
      customerPhone = orderData.customer_details.customer_phone || '';
    }

    // 2. Fetch Payment Details
    try {
      const payRes = await fetch(`${baseUrl}/orders/${orderId}/payments`, { headers });
      if (payRes.ok) {
        const payList = await payRes.json();
        if (Array.isArray(payList) && payList.length > 0) {
          const successPayment = payList.find(p => p.payment_status === 'SUCCESS') || payList[0];
          paymentMethod = successPayment.payment_group || '';
          cfPaymentTime = successPayment.payment_time || '';
        }
      }
    } catch (e) {
      // Payment fetch error shouldn't block the main order data
      console.error('Failed to fetch payments', e);
    }

    const amount = Number(orderData.order_amount) || 0;
    const status = orderData.order_status || 'UNKNOWN';

    const isPaid = status === 'PAID';

    // 3. Update Firestore securely from the backend if payment is successful
    if (isPaid) {
      try {
        const draftOrdersRef = adminDb.collection('DraftOrders');
        const draftDoc = await draftOrdersRef.doc(orderId).get();
        
        if (draftDoc.exists) {
          // ── WE HAVE A DRAFT ORDER! ──
          const draftData = draftDoc.data();
          
          // Create the Official Order in the Orders collection
          const newOrderRef = await adminDb.collection('Orders').add({
            ...draftData,
            status: 'Received',
            paymentStatus: 'Success',
            cashfreeDetails: {
              cf_order_id: orderId,
              order_status: 'PAID',
              order_amount: amount,
              order_currency: 'INR',
              created_at: cfPaymentTime || new Date().toISOString(),
            }
          });
          
          // Delete the Draft
          await draftDoc.ref.delete();
          console.log(`[Admin] Successfully moved draft ${orderId} to real Order ${newOrderRef.id}.`);
          
        } else {
          // Fallback just in case they used the old flow where it was directly inserted into Orders
          const ordersRef = adminDb.collection('Orders');
          const querySnapshot = await ordersRef.where('cashfreeOrderId', '==', orderId).limit(1).get();
          
          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await docRef.update({
              status: 'Received',
              paymentStatus: 'Success',
              cashfreeDetails: {
                cf_order_id: orderId,
                order_status: 'PAID',
                order_amount: amount,
                order_currency: 'INR',
                created_at: cfPaymentTime || new Date().toISOString(),
              }
            });
            console.log(`[Admin] Successfully updated existing order ${orderId} to Received.`);
          } else {
            console.error(`[Admin] Order with cashfreeOrderId ${orderId} not found in DraftOrders or Orders!`);
          }
        }
      } catch (adminErr) {
        console.error('[Admin] Firestore update error:', adminErr);
        // We still return isPaid so frontend can handle it, but log the critical failure
      }
    }

    return NextResponse.json({
      cfOrderId: orderId,
      cfStatus: status,
      isPaid,
      amount,
      customerName,
      customerPhone,
      paymentMethod,
      cfPaymentTime
    });

  } catch (err: any) {
    return NextResponse.json({ error: `Server Error: ${err.message}` }, { status: 500 });
  }
}
