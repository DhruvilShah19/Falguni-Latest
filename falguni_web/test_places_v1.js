const https = require('https');
const key = "AIzaSyAKm3lkXENu0lVNWw5VPAVHAZotDmjEjKU";
const data = JSON.stringify({ input: "Vastrapur", includedRegionCodes: ["in"] });

const req = https.request('https://places.googleapis.com/v1/places:autocomplete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': key,
    'Content-Length': data.length
  }
}, (res) => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(resData), null, 2)));
});

req.write(data);
req.end();
