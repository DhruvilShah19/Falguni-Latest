const https = require('https');
const key = "AIzaSyAKm3lkXENu0lVNWw5VPAVHAZotDmjEjKU";
const params = new URLSearchParams({ input: "Vastrapur", key, components: 'country:in' });

https.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json, null, 2));
  });
});
