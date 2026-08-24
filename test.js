const https = require('https');
https.get('https://unsplash.com/napi/search/photos?query=indian+spices+table&per_page=5', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        json.results.forEach(r => console.log(r.id, r.alt_description));
    } catch(e) { console.log("Error parsing", e) }
  });
}).on('error', console.error);
