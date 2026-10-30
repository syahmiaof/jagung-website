const fs = require('fs');
const code = fs.readFileSync('loader.js', 'utf8');
const idx = code.indexOf('C=function()');
console.log(code.substring(idx - 1500, idx));
