const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'falguni-admin' });
async function test() {
  const db = admin.firestore();
  const snapshot = await db.collection('Products').limit(1).get();
  snapshot.forEach(doc => {
    console.log(doc.data().image1);
  });
}
test();
