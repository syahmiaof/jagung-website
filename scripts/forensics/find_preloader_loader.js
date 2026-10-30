const fs = require('fs');
const code = fs.readFileSync('loader.js', 'utf8');

const matches = [];
let idx = 0;
while ((idx = code.indexOf('js-preloader', idx)) !== -1) {
  matches.push(code.substring(idx - 100, idx + 400));
  idx += 12;
}

console.log('Matches in loader.js:', matches.length);
matches.forEach((m, i) => {
  console.log(`--- Match ${i} ---`);
  console.log(m);
});
