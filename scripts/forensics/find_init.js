const fs = require('fs');
const code = fs.readFileSync('main.js', 'utf8');

const idx = code.indexOf(',429:function');
const chunk = code.substring(idx, idx + 15000);
const initIdx = chunk.indexOf('init:');
if (initIdx !== -1) {
  console.log('Found init in mod 429:');
  console.log(chunk.substring(initIdx - 100, initIdx + 1200));
} else {
  const init2 = chunk.indexOf('key:"init"');
  console.log('Found key:init in mod 429:');
  console.log(chunk.substring(init2 - 100, init2 + 1200));
}
