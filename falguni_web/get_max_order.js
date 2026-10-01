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
  const snapshot = await db.collection('Orders').orderBy('orderID', 'desc').limit(1).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Max Order: ${data.orderID}`);
  });
}
run();
