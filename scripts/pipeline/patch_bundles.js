const fs = require('fs');
const path = require('path');

const publicDir = 'C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public';

// 1. Patch loader.js
const loaderPath = path.join(publicDir, 'loader.76ceb4644b28bd9c30b5.js');
let loaderContent = fs.readFileSync(loaderPath, 'utf8');
const origCloudfront = 'https://d1hl9u9k5hiqxp.cloudfront.net/';
loaderContent = loaderContent.split(origCloudfront).join('./');
fs.writeFileSync(loaderPath, loaderContent, 'utf8');
console.log('loader.js patched to relative paths.');

// 2. Patch main.js
const mainPath = path.join(publicDir, 'main.76ceb4644b28bd9c30b5.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');
mainContent = mainContent.split(origCloudfront).join('./');
fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log('main.js patched to relative paths.');
