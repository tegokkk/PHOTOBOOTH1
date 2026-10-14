const https = require('https');
https.get('https://riri-frontend-three.vercel.app', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const scripts = [...html.matchAll(/src=\"(\/_next\/static\/chunks\/app\/.*?)\"/g)].map(m => m[1]);
    let found = false;
    let pending = scripts.length;
    scripts.forEach(scriptPath => {
      https.get('https://riri-frontend-three.vercel.app' + scriptPath, (sRes) => {
        let js = '';
        sRes.on('data', d => js += d);
        sRes.on('end', () => {
          if (js.includes('0909')) { console.log('FOUND 0909 in ' + scriptPath); found = true; }
          if (js.includes('1234')) { console.log('FOUND 1234 in ' + scriptPath); }
          pending--;
          if (pending === 0 && !found) console.log('NOT FOUND');
        });
      });
    });
  });
});
