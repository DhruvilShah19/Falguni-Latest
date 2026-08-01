import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { promoteDraftOrder, markExistingOrderReceived } from '@/lib/orderPromotion';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');
    const rawBody = await req.text();

    if (!signature || !timestamp || !rawBody) {
      console.error('[Cashfree Webhook] Missing required headers or body');
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    if (!clientSecret) {
      console.error('[Cashfree Webhook] Server misconfiguration: No Client Secret');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 1. Verify Cashfree Cryptographic Signature
    const data = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', clientSecret)
      .update(data)
      .digest('base64');

    if (expectedSignature !== signature) {
      console.error('[Cashfree Webhook] Invalid Signature Detected! Possible unauthorized access attempt.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse Payload
    const payload = JSON.parse(rawBody);

    // 3. Process Successful Payments
    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = payload.data?.order?.order_id;
      const paymentStatus = payload.data?.payment?.payment_status;

      if (orderId && paymentStatus === 'SUCCESS') {
        // promoteDraftOrder does the read-check-create-delete atomically in
        // a transaction, so this racing with the client-triggered /verify
        // call (which can fire around the same time) can't create two
        // Orders documents for one payment.
        const cashFreeDetails = {
          cf_order_id: orderId,
          order_status: 'PAID',
          order_amount: payload.data.order.order_amount,
          order_currency: payload.data.order.order_currency,
          created_at: payload.data.payment.payment_time,
          cf_payment_id: payload.data.payment.cf_payment_id,
        };

        const result = await promoteDraftOrder(orderId, cashFreeDetails);

        if (result.promoted) {
          console.log(`[Webhook SUCCESS] Promoted DraftOrder ${orderId} to Official Order ${result.newOrderId}`);
        } else {
          // It's possible the frontend verify route got to it slightly
          // faster. Just ensure it's not a genuinely missing order.
          const updated = await markExistingOrderReceived(orderId, cashFreeDetails);
          if (updated) {
            console.log(`[Webhook SILENT] Order ${orderId} was already promoted by frontend. Marked Received.`);
          } else {
            console.warn(`[Webhook WARNING] Draft Order ${orderId} not found, and not in Official Orders. Investigation may be needed.`);
          }
        }
      }
    }

    // 4. Return explicit 200 OK so Cashfree knows we received it
    return NextResponse.json({ status: 'OK' }, { status: 200 });

  } catch (error) {
    console.error('[Cashfree Webhook] Error processing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
