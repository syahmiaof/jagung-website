const fs = require('fs');
const code = fs.readFileSync('loader.js', 'utf8');

const regex = /preloader/gi;
let m;
const hits = [];
while ((m = regex.exec(code)) !== null) {
  hits.push({
    index: m.index,
    snippet: code.substring(Math.max(0, m.index - 100), Math.min(code.length, m.index + 200))
  });
}
console.log('Total preloader hits:', hits.length);
hits.slice(0, 10).forEach((h, i) => {
  console.log(`\nHit ${i}:`);
  console.log(h.snippet);
});
