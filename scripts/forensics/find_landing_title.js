const fs = require('fs');
const code = fs.readFileSync('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\main.76ceb4644b28bd9c30b5.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('landing-title', idx)) !== -1) {
  matches.push(code.substring(Math.max(0, idx - 100), Math.min(code.length, idx + 200)));
  idx += 13;
}

console.log('landing-title occurrences:', matches.length);
matches.forEach((m, i) => console.log(`--- Match ${i} ---\n`, m));
