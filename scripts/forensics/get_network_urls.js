const fs = require('fs');

const log = fs.readFileSync('C:\\Users\\USER\\.gemini\\antigravity\\brain\\55e2c1e7-59b9-439f-88e4-c40145fa25a9\\.system_generated\\steps\\69\\output.txt', 'utf8');
const urls = new Set();
const regex = /GET\s+(https:\/\/d1hl9u9k5hiqxp\.cloudfront\.net\/[^\s\[]+)/g;
let m;
while ((m = regex.exec(log)) !== null) {
  urls.add(m[1]);
}

console.log('Total cloudfront URLs in network log:', urls.size);
for (const u of Array.from(urls).sort()) {
  console.log(u);
}
