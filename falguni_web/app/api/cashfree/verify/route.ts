import { NextResponse } from 'next/server';
import { promoteDraftOrder, markExistingOrderReceived } from '@/lib/orderPromotion';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const rawBaseUrl = process.env.CASHFREE_API_URL || '';
  const baseUrl = rawBaseUrl.replace(/\/orders\/?$/, '') || 'https://api.cashfree.com/pg';

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

    let hasSuccessPayment = false;

    // 2. Fetch Payment Details
    try {
      const payRes = await fetch(`${baseUrl}/orders/${orderId}/payments`, { headers });
      if (payRes.ok) {
        const payList = await payRes.json();
        if (Array.isArray(payList) && payList.length > 0) {
          const successPayment = payList.find((p: any) => p.payment_status === 'SUCCESS');
          if (successPayment) {
            hasSuccessPayment = true;
            paymentMethod = successPayment.payment_group || '';
            cfPaymentTime = successPayment.payment_time || '';
          }
        }
      }
    } catch (e) {
      // Payment fetch error shouldn't block the main order data
      console.error('Failed to fetch payments', e);
    }

    const amount = Number(orderData.order_amount) || 0;
    const status = orderData.order_status || 'UNKNOWN';

    const isPaid = status === 'PAID' || hasSuccessPayment;

    // 3. Update Firestore securely from the backend if payment is successful.
    // promoteDraftOrder does the read-check-create-delete atomically in a
    // transaction, so this racing with the webhook (which can fire around
    // the same time) can't create two Orders documents for one payment.
    if (isPaid) {
      try {
        const cashFreeDetails = {
          cf_order_id: orderId,
          order_status: 'PAID',
          order_amount: amount,
          order_currency: 'INR',
          created_at: cfPaymentTime || new Date().toISOString(),
        };

        const result = await promoteDraftOrder(orderId, cashFreeDetails);

        if (result.promoted) {
          console.log(`[Admin] Successfully moved draft ${orderId} to real Order ${result.newOrderId}.`);
        } else {
          // Draft was already gone -- either the webhook promoted it first,
          // or this is an old-style order. Just make sure it's marked
          // Received rather than creating anything new.
          const updated = await markExistingOrderReceived(orderId, cashFreeDetails);
          if (updated) {
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
