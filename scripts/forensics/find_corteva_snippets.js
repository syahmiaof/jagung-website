const fs = require('fs');
const code = fs.readFileSync('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\main.76ceb4644b28bd9c30b5.js', 'utf8');

let idx = 0;
const snippets = [];
while ((idx = code.indexOf('corteva', idx)) !== -1) {
  snippets.push(code.substring(Math.max(0, idx - 50), Math.min(code.length, idx + 120)));
  idx += 7;
}

console.log('Sample corteva hits:');
snippets.slice(0, 10).forEach((s, i) => console.log(`${i}: ${s}\n`));
