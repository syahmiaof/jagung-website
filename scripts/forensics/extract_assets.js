const fs = require('fs');

const content = fs.readFileSync('main.js', 'utf8');
const regex = /["']([^"']*\.(?:gltf|bin|ktx|png|jpg|jpeg|svg|mp3|wav|ogg|json|woff|woff2|dds|pvr))["']/gi;
const matches = new Set();
let m;
while ((m = regex.exec(content)) !== null) {
  matches.add(m[1]);
}

console.log('Matches found:', matches.size);
for (const item of Array.from(matches).sort()) {
  console.log(item);
}
