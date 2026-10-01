const https = require('https');
require('dotenv').config({ path: '.env.local' });

const key = process.env.GOOGLE_MAPS_GEOCODING_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const params = new URLSearchParams({ input: "Vastrapur", key, components: 'country:in' });

https.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json, null, 2));
  });
});
