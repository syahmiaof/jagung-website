const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');

const idx = code.indexOf(',429:function');
if (idx !== -1) {
  console.log(code.substring(idx, idx + 2500));
} else {
  const idx2 = code.indexOf('429:function');
  console.log(code.substring(idx2, idx2 + 2500));
}
