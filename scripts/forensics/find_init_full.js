const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');

console.log(code.substring(868099, 870000));
