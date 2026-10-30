const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4180;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.ktx': 'image/ktx',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse path
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, safePath);

  // If file doesn't exist, try relative to root or index fallback
  if (!fs.existsSync(filePath)) {
    const rootPath = path.join(__dirname, safePath);
    if (fs.existsSync(rootPath)) {
      filePath = rootPath;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${urlPath}`);
      return;
    }
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    filePath = path.join(filePath, 'index.html');
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🌽 =========================================`);
  console.log(`🌽 Pioneer - Corn. Revolutionized.`);
  console.log(`🌽 Local Server: http://127.0.0.1:${PORT}`);
  console.log(`🌽 Serving assets from: ${PUBLIC_DIR}`);
  console.log(`🌽 =========================================\n`);
});
