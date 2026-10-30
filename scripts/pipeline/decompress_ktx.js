const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else res.push(p);
  });
  return res;
}

const all = walk('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\compressed');
let count = 0;
all.forEach(p => {
  if (p.endsWith('.ktx')) {
    const buf = fs.readFileSync(p);
    if (buf[0] === 0x1f && buf[1] === 0x8b) {
      const unzipped = zlib.gunzipSync(buf);
      fs.writeFileSync(p, unzipped);
      count++;
      console.log(`Decompressed: ${path.basename(p)} (${buf.length} -> ${unzipped.length} bytes)`);
    }
  }
});

console.log(`Successfully decompressed ${count} KTX textures!`);
