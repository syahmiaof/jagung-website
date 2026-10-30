const fs = require('fs');
const code = fs.readFileSync('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\loader.76ceb4644b28bd9c30b5.js', 'utf8');

const idx = code.indexOf('setDashArray');
console.log(code.substring(idx - 100, idx + 1000));
