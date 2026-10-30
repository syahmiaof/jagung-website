const fs = require('fs');
['main.76ceb4644b28bd9c30b5.js', 'loader.76ceb4644b28bd9c30b5.js', 'svg/svg.svg'].forEach(file => {
  const code = fs.readFileSync('C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public\\' + file, 'utf8');
  let idx = 0;
  let count = 0;
  while ((idx = code.indexOf('corteva', idx)) !== -1) {
    count++;
    idx += 7;
  }
  console.log(file, 'corteva hits:', count);
});
