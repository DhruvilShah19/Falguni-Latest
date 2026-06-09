const admin = require('firebase-admin');
const serviceAccount = require('./service_account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  const q1 = await db.collection('Orders').where('orderID', '==', 'TBDVB8MB').get();
  q1.forEach(d => console.log('Found by orderID:', d.id, d.data().status));
  
  const q2 = await db.collection('Orders').doc('TBDVB8MB').get();
  if (q2.exists) console.log('Found by docID:', q2.id, q2.data().status);
}

run().then(() => process.exit(0)).catch(e => console.error(e));
