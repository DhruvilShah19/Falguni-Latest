import { adminDb } from './lib/firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const snapshot = await adminDb.collection('Orders').orderBy('orderID', 'desc').limit(5).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Order: ${data.orderID}, total: ${data.total}, subTotal: ${data.subTotal}`);
  });
}
run().catch(console.error);
