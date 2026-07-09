import * as fs from 'fs';
const envConfig = fs.readFileSync('.env.local', 'utf8');
envConfig.split(/\r?\n/).forEach(line => {
  if (line && line.includes('=')) {
    const idx = line.indexOf('=');
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
});

async function getOldOrders() {
  const { adminDb } = await import('./lib/firebase-admin.js');
  try {
    const ordersSnap = await adminDb.collection('Orders').get();
    const oldOrders: any[] = [];
    
    ordersSnap.forEach((doc) => {
      const data = doc.data();
      const orderID = data.orderID;
      const uid = data.uid;
      
      let isOldWebOrder = false;
      
      // If it has a huge order ID (web used random 6 digits)
      if (typeof orderID === 'number' && orderID > 100000) {
        isOldWebOrder = true;
      }
      
      // If timestamp (uid) is invalid or not an ISO string
      const date = new Date(uid);
      if (isNaN(date.getTime()) || uid === data.userID) {
        isOldWebOrder = true;
      }
      
      if (isOldWebOrder) {
        oldOrders.push({
          orderID: orderID,
          uid: uid,
          customer: data.userID,
          total: data.total
        });
      }
    });

    console.log('--- Old Missed Web Orders ---');
    if (oldOrders.length === 0) {
      console.log('No old web orders found.');
    } else {
      oldOrders.forEach(o => {
        console.log(`Order ID: ${o.orderID} (UID: ${o.uid}) - Total: ${o.total}`);
      });
    }
    console.log(`Total count: ${oldOrders.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Error fetching orders:', err);
    process.exit(1);
  }
}

getOldOrders();
