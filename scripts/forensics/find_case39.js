const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');

const idx = code.indexOf('case 39');
console.log(code.substring(idx, idx + 1500));
