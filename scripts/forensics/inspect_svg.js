const fs = require('fs');
const svg = fs.readFileSync('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\svg\\svg.svg', 'utf8');

const regex = /<symbol[^>]*id="([^"]*)"[^>]*>/g;
let m;
const symbols = [];
while ((m = regex.exec(svg)) !== null) {
  symbols.push(m[1]);
}

console.log('Symbols found:', symbols);

const pioneerIdx = svg.indexOf('pioneer-logo');
if (pioneerIdx !== -1) {
  console.log('pioneer-logo snippet:');
  console.log(svg.substring(pioneerIdx - 50, pioneerIdx + 500));
}
