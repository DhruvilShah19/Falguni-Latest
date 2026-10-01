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
  const snapshot = await db.collection('Orders').where('orderID', '==', 8).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Order: ${data.orderID}, total: ${data.total}, subTotal: ${data.subTotal}`);
  });
}
run();
