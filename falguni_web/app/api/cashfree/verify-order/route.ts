import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json(
        { message: 'Missing order_id parameter.' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.CASHFREE_API_URL?.replace(/\/orders\/?$/, '') || 'https://api.cashfree.com/pg';
    const apiUrl = `${baseUrl}/orders/${order_id}`;
    
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
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
    };

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error during verification:', data);
      return NextResponse.json(
        { message: data.message || 'Failed to verify payment with Cashfree.' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'An internal error occurred while verifying the payment.' },
      { status: 500 }
    );
  }
}
