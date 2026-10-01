import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { buildDeliveryQuote, DeliveryQuoteError } from '@/lib/deliveryQuote';

export async function POST(request: Request) {
  let uid: string;
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
    if (!token) throw new Error('Missing token');
    uid = (await getAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ message: 'Please sign in again.' }, { status: 401 });
  }
  try {
    const details = await request.json();
    const { items: _items, ...quote } = await buildDeliveryQuote(uid, details);
    return NextResponse.json(quote, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof DeliveryQuoteError ? error.message : 'Unable to calculate delivery. Please try again.' }, { status: 422 });
  }
}
