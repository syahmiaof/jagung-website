const fs = require('fs');
const code = fs.readFileSync('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\main.76ceb4644b28bd9c30b5.js', 'utf8');

const idx = code.indexOf(',369:function(e){e.exports=');
if (idx !== -1) {
  const end = code.indexOf('},', idx);
  console.log('Module 369 length:', end - idx);
  console.log(code.substring(idx, end + 2));
} else {
  const idx2 = code.indexOf('369:function(e){e.exports=');
  const end2 = code.indexOf('},', idx2);
  console.log(code.substring(idx2, end2 + 2));
}
