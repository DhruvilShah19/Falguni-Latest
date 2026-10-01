const https = require('https');
const key = "AIzaSyAKm3lkXENu0lVNWw5VPAVHAZotDmjEjKU";
const address = "Sonal Park Society, Memnagar, Ahmedabad, Gujarat, India";
const params = new URLSearchParams({ address, components: 'country:IN', key });

https.get(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json, null, 2));
  });
});
