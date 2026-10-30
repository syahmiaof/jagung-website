const fs = require('fs');

const files = ['loader.js', 'vendors~main.js', 'main.js', 'test0.js'];
const allFound = new Set();
const regex = /["']([a-zA-Z0-9_\-\.\/]+?\.(?:bin|gltf|ktx|png|jpg|jpeg|svg|mp3|wav|ogg|json|woff|woff2|dds|pvr))["']/gi;

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    let p = m[1];
    if (!p.startsWith('http') && !p.startsWith('//')) {
      if (p.startsWith('/')) p = p.substring(1);
      allFound.add(p);
    } else if (p.includes('d1hl9u9k5hiqxp.cloudfront.net/')) {
      allFound.add(p.split('d1hl9u9k5hiqxp.cloudfront.net/')[1]);
    }
  }
}

console.log('Total potential assets found in bundle code:', allFound.size);
for (const p of Array.from(allFound).sort()) {
  console.log(p);
}
