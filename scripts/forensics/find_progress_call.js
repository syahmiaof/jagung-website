const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');

const idx = code.indexOf('onPreloaderProgress');
console.log('Index of onPreloaderProgress in main.js:', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 200, idx + 800));
}
