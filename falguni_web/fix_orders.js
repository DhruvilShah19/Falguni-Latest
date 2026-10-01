import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const credential = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};
const app = initializeApp({ credential: cert(credential) });
const db = getFirestore(app);

async function run() {
  const snapshot = await db.collection('Orders').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.total === undefined) {
      let correctTotal = data.cashFreeDetails?.order_amount;
      if (correctTotal === undefined) {
         correctTotal = (data.discountedSubTotal || data.subTotal || 0) + (data.deliveryFee || 0);
      }
      await doc.ref.update({ total: correctTotal });
      console.log(`Updated Order ${data.orderID} with total: ${correctTotal}`);
      count++;
    }
  }
  console.log(`Fixed ${count} orders!`);
}
run();
