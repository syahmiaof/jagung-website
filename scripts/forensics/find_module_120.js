const fs = require('fs');

for (const f of ['main.js', 'vendors~main.js', 'loader.js']) {
  const code = fs.readFileSync(f, 'utf8');
  const regex = /[,{]\s*120\s*:\s*function\s*\(([^)]*)\)\s*\{([\s\S]*?)\}(?=,\s*\d+\s*:|$)/;
  const m = regex.exec(code);
  if (m) {
    console.log(`Found module 120 in ${f}:`);
    console.log(m[0].substring(0, 4000));
    break;
  }
}
