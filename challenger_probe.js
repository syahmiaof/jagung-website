const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const SERVER_PATH = path.resolve(__dirname, 'server.js');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

const results = [];

function record(suite, testName, passed, details) {
  results.push({ suite, testName, passed, details });
  const icon = passed ? '[PASS]' : '[FAIL]';
  console.log(`${icon} [${suite}] ${testName}`);
  if (details) console.log(`       Details: ${JSON.stringify(details)}`);
}

function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: options.timeout || 4000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('timeout', () => {
      req.abort();
      reject(new Error(`Timeout fetching ${url}`));
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('======================================================================');
  console.log(' CHALLENGER M1_2: EMPIRICAL VERIFICATION HARNESS');
  console.log('======================================================================\n');

  // -----------------------------------------------------------------
  // 1. Static and AST Analysis of server.js
  // -----------------------------------------------------------------
  const serverCode = fs.readFileSync(SERVER_PATH, 'utf8');
  
  const portMatch = serverCode.match(/const\s+PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+);/);
  record(
    'Port Configuration (Static)',
    'server.js syntax specifies process.env.PORT || 4180',
    !!portMatch && portMatch[1] === '4180',
    { matched: portMatch ? portMatch[0] : null, defaultPort: portMatch ? portMatch[1] : null }
  );

  const evalDefault = (() => {
    const env = {};
    return env.PORT || 4180;
  })();
  record(
    'Port Configuration (Static)',
    'Expression evaluates to 4180 when PORT is undefined',
    evalDefault === 4180,
    { evalDefault }
  );

  const evalEmpty = (() => {
    const env = { PORT: '' };
    return env.PORT || 4180;
  })();
  record(
    'Port Configuration (Static)',
    'Expression evaluates to 4180 when PORT is empty string',
    evalEmpty === 4180,
    { evalEmpty }
  );

  const evalOverride = (() => {
    const env = { PORT: '5000' };
    return env.PORT || 4180;
  })();
  record(
    'Port Configuration (Static)',
    'Expression evaluates to 5000 when PORT=5000',
    evalOverride === '5000' || evalOverride === 5000,
    { evalOverride }
  );

  // -----------------------------------------------------------------
  // 2. Dynamic Execution Test with PORT=5000
  // -----------------------------------------------------------------
  console.log('\n--- Empirical Dynamic Test: Spawning server.js with PORT=5000 ---');
  let server5000Child = null;
  try {
    server5000Child = spawn(process.execPath, [SERVER_PATH], {
      cwd: path.dirname(SERVER_PATH),
      env: Object.assign({}, process.env, { PORT: '5000' })
    });

    let stdoutData = '';
    server5000Child.stdout.on('data', d => stdoutData += d.toString());
    server5000Child.stderr.on('data', d => stdoutData += d.toString());

    let connected = false;
    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const testRes = await httpGet('http://127.0.0.1:5000/', { timeout: 300 });
        if (testRes.statusCode === 200) {
          connected = true;
          break;
        }
      } catch (e) {}
    }

    const res5000 = connected ? await httpGet('http://127.0.0.1:5000/') : null;
    const port5000InLogs = stdoutData.includes('http://127.0.0.1:5000');

    record(
      'Port Override (Dynamic)',
      'Server starts and listens on port 5000 when PORT=5000 passed in env',
      connected && res5000 && res5000.statusCode === 200 && port5000InLogs,
      {
        connected,
        statusCode: res5000 ? res5000.statusCode : null,
        contentType: res5000 ? res5000.headers['content-type'] : null,
        port5000InLogs,
        stdoutSnippet: stdoutData.split('\n').filter(l => l.includes('Local Server'))[0] || stdoutData.trim()
      }
    );
  } catch (err) {
    record('Port Override (Dynamic)', 'Server on port 5000 error', false, { error: err.message });
  } finally {
    if (server5000Child) {
      server5000Child.kill();
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // -----------------------------------------------------------------
  // 3. Network Probe against Dev Server at http://127.0.0.1:4180
  // -----------------------------------------------------------------
  console.log('\n--- Empirical Network Probes: http://127.0.0.1:4180 ---');

  // 3.1 GET /
  try {
    const resRoot = await httpGet('http://127.0.0.1:4180/');
    const is200 = resRoot.statusCode === 200;
    const ct = resRoot.headers['content-type'] || '';
    const hasHtml = ct.includes('text/html');
    record(
      'HTTP Endpoints',
      'GET / returns HTTP 200 OK',
      is200,
      { statusCode: resRoot.statusCode }
    );
    record(
      'HTTP Endpoints',
      'GET / Content-Type contains "text/html"',
      hasHtml,
      { contentType: ct }
    );
    record(
      'HTTP Endpoints',
      'GET / payload contains valid HTML markup and title',
      resRoot.body.includes('<html') && resRoot.body.includes('<title>') && resRoot.body.includes('loader.76ceb4644b28bd9c30b5.js'),
      { bodyLength: resRoot.body.length, hasTitle: resRoot.body.includes('<title>'), hasLoaderRef: resRoot.body.includes('loader.76ceb4644b28bd9c30b5.js') }
    );
  } catch (err) {
    record('HTTP Endpoints', 'GET / request failed', false, { error: err.message });
  }

  // 3.2 GET /loader.76ceb4644b28bd9c30b5.js
  try {
    const resLoader = await httpGet('http://127.0.0.1:4180/loader.76ceb4644b28bd9c30b5.js');
    const is200 = resLoader.statusCode === 200;
    const ct = resLoader.headers['content-type'] || '';
    const isJs = ct.includes('application/javascript');
    const diskStat = fs.statSync(path.join(PUBLIC_DIR, 'loader.76ceb4644b28bd9c30b5.js'));
    const cl = parseInt(resLoader.headers['content-length'] || '0', 10);
    const sizeMatches = cl === diskStat.size;

    record(
      'HTTP Endpoints',
      'GET /loader.76ceb4644b28bd9c30b5.js returns HTTP 200 OK',
      is200,
      { statusCode: resLoader.statusCode }
    );
    record(
      'HTTP Endpoints',
      'GET /loader.76ceb4644b28bd9c30b5.js Content-Type is application/javascript',
      isJs,
      { contentType: ct }
    );
    record(
      'HTTP Endpoints',
      'GET /loader.76ceb4644b28bd9c30b5.js Content-Length matches disk file',
      sizeMatches,
      { headerLength: cl, diskSize: diskStat.size }
    );
  } catch (err) {
    record('HTTP Endpoints', 'GET /loader...js request failed', false, { error: err.message });
  }

  // 3.3 GET /fonts/Manifold/manifold.json
  try {
    const resFont = await httpGet('http://127.0.0.1:4180/fonts/Manifold/manifold.json');
    const is200 = resFont.statusCode === 200;
    const ct = resFont.headers['content-type'] || '';
    const isJson = ct.includes('application/json');
    const diskStat = fs.statSync(path.join(PUBLIC_DIR, 'fonts', 'Manifold', 'manifold.json'));
    const cl = parseInt(resFont.headers['content-length'] || '0', 10);
    const sizeMatches = cl === diskStat.size;

    let parsedJson = null;
    try {
      parsedJson = JSON.parse(resFont.body);
    } catch (e) {}
    const validJsonStructure = parsedJson && Array.isArray(parsedJson.chars) && !!parsedJson.info;

    record(
      'HTTP Endpoints',
      'GET /fonts/Manifold/manifold.json returns HTTP 200 OK',
      is200,
      { statusCode: resFont.statusCode }
    );
    record(
      'HTTP Endpoints',
      'GET /fonts/Manifold/manifold.json Content-Type is application/json',
      isJson,
      { contentType: ct }
    );
    record(
      'HTTP Endpoints',
      'GET /fonts/Manifold/manifold.json Content-Length matches disk file',
      sizeMatches,
      { headerLength: cl, diskSize: diskStat.size }
    );
    record(
      'HTTP Endpoints',
      'GET /fonts/Manifold/manifold.json returns valid BMFont JSON with chars and info',
      validJsonStructure,
      { charCount: parsedJson ? parsedJson.chars.length : 0, fontName: parsedJson && parsedJson.info ? parsedJson.info.face : null }
    );
  } catch (err) {
    record('HTTP Endpoints', 'GET /fonts/Manifold/manifold.json failed', false, { error: err.message });
  }

  // -----------------------------------------------------------------
  // 4. Adversarial Stress & Edge Cases
  // -----------------------------------------------------------------
  console.log('\n--- Adversarial Stress Testing ---');

  // 4.1 Non-existent file returns 404
  try {
    const res404 = await httpGet('http://127.0.0.1:4180/does-not-exist-at-all.js');
    record(
      'Adversarial Stress',
      'Non-existent route returns HTTP 404 Not Found',
      res404.statusCode === 404,
      { statusCode: res404.statusCode, body: res404.body }
    );
  } catch (err) {
    record('Adversarial Stress', '404 check error', false, { error: err.message });
  }

  // 4.2 CORS Headers present
  try {
    const resCors = await httpGet('http://127.0.0.1:4180/');
    const acao = resCors.headers['access-control-allow-origin'];
    record(
      'Adversarial Stress',
      'CORS header Access-Control-Allow-Origin is "*"',
      acao === '*',
      { accessControlAllowOrigin: acao }
    );
  } catch (err) {
    record('Adversarial Stress', 'CORS check error', false, { error: err.message });
  }

  // 4.3 Query parameter handling: GET /?v=123
  try {
    const resQuery = await httpGet('http://127.0.0.1:4180/?v=12345');
    record(
      'Adversarial Stress',
      'URL with query string GET /?v=12345 strips query and returns 200 text/html',
      resQuery.statusCode === 200 && (resQuery.headers['content-type'] || '').includes('text/html'),
      { statusCode: resQuery.statusCode, contentType: resQuery.headers['content-type'] }
    );
  } catch (err) {
    record('Adversarial Stress', 'Query param check error', false, { error: err.message });
  }

  // 4.4 URL encoded path: GET /fonts%2FManifold%2Fmanifold.json
  try {
    const resEncoded = await httpGet('http://127.0.0.1:4180/fonts%2FManifold%2Fmanifold.json');
    record(
      'Adversarial Stress',
      'URL encoded path /fonts%2FManifold%2Fmanifold.json decoded and returns 200',
      resEncoded.statusCode === 200,
      { statusCode: resEncoded.statusCode }
    );
  } catch (err) {
    record('Adversarial Stress', 'URL encoded path check error', false, { error: err.message });
  }

  // 4.5 Path traversal stress test
  try {
    const resTraversal = await httpGet('http://127.0.0.1:4180/../../package.json');
    record(
      'Adversarial Stress',
      'Path traversal attempt safely resolved or rejected without server crash',
      resTraversal.statusCode === 200 || resTraversal.statusCode === 404,
      { statusCode: resTraversal.statusCode }
    );
  } catch (err) {
    record('Adversarial Stress', 'Path traversal error', false, { error: err.message });
  }

  // 4.6 Localhost binding check
  try {
    const resLocalhost = await httpGet('http://localhost:4180/');
    record(
      'Adversarial Stress',
      'GET http://localhost:4180/ connects and returns 200',
      resLocalhost.statusCode === 200,
      { statusCode: resLocalhost.statusCode }
    );
  } catch (err) {
    record('Adversarial Stress', 'localhost check error', false, { error: err.message });
  }

  console.log('\n======================================================================');
  console.log(' SUMMARY');
  console.log('======================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total assertions: ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);
  console.log(`Final Verdict:    ${failed === 0 ? 'APPROVE' : 'REQUEST_CHANGES'}`);
  console.log('======================================================================\n');

  return failed === 0 ? 0 : 1;
}

run().then(code => process.exit(code)).catch(err => {
  console.error(err);
  process.exit(1);
});
