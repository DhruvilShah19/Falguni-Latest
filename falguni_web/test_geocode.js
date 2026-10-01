const https = require('https');
require('dotenv').config({ path: '.env.local' });

const key = process.env.GOOGLE_MAPS_GEOCODING_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const address = "Vastrapur, Ahmedabad - 380015, Gujarat, India"; // Just a sample
const params = new URLSearchParams({ address, components: 'country:IN', key });

https.get(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json, null, 2));
  });
});
