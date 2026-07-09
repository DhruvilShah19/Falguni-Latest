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
async function check() {
  const { adminDb } = await import('./lib/firebase-admin.js');
  const snap = await adminDb.collection('Orders').get();
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (!data.vendorID) {
      console.log(`Order ${data.orderID} STILL has no vendorID!`);
    }
  });
  process.exit(0);
}
check();
