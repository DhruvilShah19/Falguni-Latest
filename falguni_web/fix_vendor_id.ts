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
async function fixOrders() {
  const { adminDb } = await import('./lib/firebase-admin.js');
  const snap = await adminDb.collection('Orders').get();
  
  let count = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.vendorID && data.orders && data.orders.length > 0) {
      // Find the first vendorId from the cart items
      let vId = data.orders[0].vendorId;
      if (vId) {
        console.log(`Fixing order ${data.orderID}: setting vendorID = ${vId}`);
        await doc.ref.update({ vendorID: vId });
        count++;
      } else {
        console.log(`Warning: order ${data.orderID} has no vendorId in cart items.`);
      }
    }
  }
  console.log(`Successfully updated ${count} old orders to add vendorID at root.`);
  process.exit(0);
}
fixOrders();
