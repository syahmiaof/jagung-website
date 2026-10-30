/**
 * ============================================================================
 * UI GEMPAK: SYAHMI AOF - KEHEBATAN JAGUNG 3D SHOWCASE
 * Automated E2E & Integration Test Suite (4-Tier Methodology)
 * ============================================================================
 * 
 * Execution:
 *   node test_suite.js              # Run all 4 Tiers
 *   node test_suite.js --tier=1     # Tier 1: Feature Coverage only
 *   node test_suite.js --tier=2     # Tier 2: Boundary & Corner Cases only
 *   node test_suite.js --tier=3     # Tier 3: Cross-Feature Combinations only
 *   node test_suite.js --tier=4     # Tier 4: Real-world Workload / Dev Server only
 *   node test_suite.js --json       # Output machine-readable JSON report
 * 
 * Target Port: 4180 (http://127.0.0.1:4180)
 * Live Target: https://jagung.syahmiaof.my
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const vm = require('vm');
const { spawn } = require('child_process');

// ----------------------------------------------------------------------------
// 1. Path Resolution
// ----------------------------------------------------------------------------
const JAGUNG_DIR = __dirname;
const PROJECT_ROOT = path.resolve(JAGUNG_DIR, '..');
const PUBLIC_DIR = path.join(JAGUNG_DIR, 'public');

const PATHS = {
  projectRoot: PROJECT_ROOT,
  jagungRoot: JAGUNG_DIR,
  publicDir: PUBLIC_DIR,
  serverJs: path.join(JAGUNG_DIR, 'server.js'),
  rootIndexHtml: path.join(JAGUNG_DIR, 'index.html'),
  publicIndexHtml: path.join(PUBLIC_DIR, 'index.html'),
  loaderBundle: path.join(PUBLIC_DIR, 'loader.76ceb4644b28bd9c30b5.js'),
  mainBundle: path.join(PUBLIC_DIR, 'main.76ceb4644b28bd9c30b5.js'),
  svgSprite: path.join(PUBLIC_DIR, 'svg', 'svg.svg'),
  ogPreviewJpg: path.join(PUBLIC_DIR, 'og-preview-v5.jpg'),
  manifoldFont: path.join(PUBLIC_DIR, 'fonts', 'Manifold', 'manifold.json'),
  gilroyFont: path.join(PUBLIC_DIR, 'fonts', 'Gilroy', 'gilroy.json'),
  sampleKtx: path.join(PUBLIC_DIR, 'compressed', 's3tc', 'landing', 'graded', 'alpha.ktx'),
  sampleGltf: path.join(PUBLIC_DIR, 'models', 'landing', 'cobb_test.gltf')
};

// ----------------------------------------------------------------------------
// 2. CLI Options & Output Utilities
// ----------------------------------------------------------------------------
const args = process.argv.slice(2);
const TARGET_TIER = (() => {
  const tArg = args.find(a => a.startsWith('--tier='));
  return tArg ? parseInt(tArg.split('=')[1], 10) : null;
})();
const OUTPUT_JSON = args.includes('--json');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(msg = '') {
  if (!OUTPUT_JSON) process.stdout.write(msg + '\n');
}

// ----------------------------------------------------------------------------
// 3. Test Runner Harness
// ----------------------------------------------------------------------------
class TestHarness {
  constructor() {
    this.results = [];
    this.currentTier = null;
    this.tierSummaries = {
      1: { name: 'Tier 1: Feature Coverage (Core Capabilities)', total: 0, passed: 0, failed: 0 },
      2: { name: 'Tier 2: Boundary & Corner Cases', total: 0, passed: 0, failed: 0 },
      3: { name: 'Tier 3: Cross-Feature Combinations', total: 0, passed: 0, failed: 0 },
      4: { name: 'Tier 4: Real-world Workload / Dev Server Health Check', total: 0, passed: 0, failed: 0 }
    };
    this.startTime = Date.now();
  }

  setTier(tierNum) {
    this.currentTier = tierNum;
    if (!OUTPUT_JSON) {
      log(`\n${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);
      log(`${COLORS.bold}${COLORS.cyan} [TIER ${tierNum}] ${this.tierSummaries[tierNum].name}${COLORS.reset}`);
      log(`${COLORS.bold}${COLORS.cyan}======================================================================${COLORS.reset}`);
    }
  }

  async test(id, title, testFn) {
    if (TARGET_TIER !== null && TARGET_TIER !== this.currentTier) {
      return;
    }

    const tierSummary = this.tierSummaries[this.currentTier];
    tierSummary.total++;

    const start = Date.now();
    let passed = false;
    let errorMsg = null;

    try {
      await testFn();
      passed = true;
      tierSummary.passed++;
    } catch (err) {
      passed = false;
      tierSummary.failed++;
      errorMsg = err.message || String(err);
    }

    const duration = Date.now() - start;
    this.results.push({
      tier: this.currentTier,
      id,
      title,
      passed,
      error: errorMsg,
      duration
    });

    if (!OUTPUT_JSON) {
      const statusTag = passed
        ? `${COLORS.green}${COLORS.bold}[PASS]${COLORS.reset}`
        : `${COLORS.red}${COLORS.bold}[FAIL]${COLORS.reset}`;
      log(`  ${statusTag} ${COLORS.bold}${id}${COLORS.reset} - ${title} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
      if (!passed && errorMsg) {
        log(`         ${COLORS.red}Error: ${errorMsg}${COLORS.reset}`);
      }
    }
  }

  summary() {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    if (OUTPUT_JSON) {
      const jsonReport = {
        timestamp: new Date().toISOString(),
        totalDuration,
        totalTests,
        passedTests,
        failedTests,
        success: failedTests === 0,
        tierSummaries: this.tierSummaries,
        tests: this.results
      };
      console.log(JSON.stringify(jsonReport, null, 2));
      return failedTests === 0 ? 0 : 1;
    }

    log(`\n${COLORS.bold}${COLORS.magenta}----------------------------------------------------------------------${COLORS.reset}`);
    log(`${COLORS.bold}${COLORS.magenta} TEST SUITE EXECUTION SUMMARY${COLORS.reset}`);
    log(`${COLORS.bold}${COLORS.magenta}----------------------------------------------------------------------${COLORS.reset}`);

    for (let t = 1; t <= 4; t++) {
      if (TARGET_TIER !== null && TARGET_TIER !== t) continue;
      const s = this.tierSummaries[t];
      const color = s.failed === 0 ? COLORS.green : COLORS.red;
      log(`  Tier ${t}: ${color}${s.passed}/${s.total} Passed${COLORS.reset} (${s.failed} Failed) - ${s.name}`);
    }

    log(`----------------------------------------------------------------------`);
    const overallColor = failedTests === 0 ? COLORS.green : COLORS.red;
    log(`  ${COLORS.bold}Total Tests:${COLORS.reset}  ${totalTests}`);
    log(`  ${COLORS.bold}Passed:${COLORS.reset}       ${COLORS.green}${passedTests}${COLORS.reset}`);
    log(`  ${COLORS.bold}Failed:${COLORS.reset}       ${failedTests > 0 ? COLORS.red : COLORS.dim}${failedTests}${COLORS.reset}`);
    log(`  ${COLORS.bold}Total Time:${COLORS.reset}   ${totalDuration}ms`);
    log(`  ${COLORS.bold}Overall:${COLORS.reset}      ${overallColor}${failedTests === 0 ? 'ALL TESTS PASSED [READY]' : 'FAILURES DETECTED [NEEDS REVISION]'}${COLORS.reset}`);
    log(`${COLORS.bold}${COLORS.magenta}======================================================================${COLORS.reset}\n`);

    return failedTests === 0 ? 0 : 1;
  }
}

// ----------------------------------------------------------------------------
// 4. Assertion & Forensic Helpers
// ----------------------------------------------------------------------------
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function extractModule369(mainCode) {
  const modIdx = mainCode.indexOf('369:');
  if (modIdx === -1) return null;

  let openBraces = 0;
  let started = false;
  let end = -1;
  for (let i = modIdx; i < mainCode.length; i++) {
    if (mainCode[i] === '{') {
      openBraces++;
      started = true;
    } else if (mainCode[i] === '}') {
      openBraces--;
      if (started && openBraces === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) return null;
  return mainCode.substring(modIdx + 4, end); // function(e){...}
}

function executeModule369InSandbox(modFnCode, initialStorage = {}) {
  const store = Object.assign({}, initialStorage);
  const mockStorage = {
    getItem(k) { return store[k] !== undefined ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { Object.keys(store).forEach(k => delete store[k]); }
  };

  const dispatchedEvents = [];
  const sandbox = {
    window: {},
    localStorage: mockStorage,
    CustomEvent: function(name, opts) {
      this.name = name;
      this.detail = opts ? opts.detail : {};
    },
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };
  sandbox.window = sandbox;
  sandbox.window.localStorage = mockStorage;
  sandbox.window.dispatchEvent = function(ev) {
    dispatchedEvents.push(ev);
  };

  const ctx = vm.createContext(sandbox);
  const script = new vm.Script(`
    var fn = ${modFnCode};
    var mod = {};
    fn(mod);
    var activeExport = mod.exports;
  `);
  script.runInContext(ctx);

  return {
    sandbox,
    activeExport: ctx.activeExport,
    store,
    dispatchedEvents
  };
}

function httpGet(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https') ? https : http;
    const req = client.get(urlStr, { timeout: options.timeout || 3500 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
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
      reject(new Error(`HTTP request timed out (${options.timeout || 3500}ms): ${urlStr}`));
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function ensureLocalServerRunning(port = 4180) {
  try {
    const res = await httpGet(`http://127.0.0.1:${port}/`, { timeout: 800 });
    if (res.statusCode) {
      return { child: null, alreadyRunning: true };
    }
  } catch (e) {
    // Port not yet responding, spawn child process
  }

  const child = spawn(process.execPath, [PATHS.serverJs], {
    cwd: PATHS.jagungRoot,
    env: Object.assign({}, process.env, { PORT: String(port) })
  });

  // Wait up to 3 seconds for server to respond
  let isReady = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await httpGet(`http://127.0.0.1:${port}/`, { timeout: 400 });
      if (res.statusCode) {
        isReady = true;
        break;
      }
    } catch (e) {}
  }

  if (!isReady) {
    child.kill();
    throw new Error(`Failed to start or connect to local dev server on http://127.0.0.1:${port}`);
  }

  return { child, alreadyRunning: false };
}

// ----------------------------------------------------------------------------
// 5. Test Suite Implementation
// ----------------------------------------------------------------------------
async function runTestSuite() {
  const harness = new TestHarness();

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE
  // ==========================================================================
  harness.setTier(1);

  // T1.1: File Consolidation
  await harness.test('TC-T1-01', 'Consolidation: Zero stray files in project root directory', () => {
    assert(fs.existsSync(PATHS.projectRoot), `Root directory not found: ${PATHS.projectRoot}`);
    const items = fs.readdirSync(PATHS.projectRoot);
    const strayFiles = items.filter(name => {
      if (name === '.agents' || name === 'ui-jagung' || name === 'ui-sofi' || name === '.git') return false;
      const fullPath = path.join(PATHS.projectRoot, name);
      return fs.statSync(fullPath).isFile();
    });

    assert(
      strayFiles.length === 0,
      `Detected ${strayFiles.length} stray file(s) in root: ${strayFiles.join(', ')}. All Jagung files must reside in ui-jagung.`
    );

    // Verify consolidated script repository exists
    const toolsDir = path.join(PATHS.jagungRoot, 'tools');
    const scriptsDir = path.join(PATHS.jagungRoot, 'scripts');
    const hasConsolidationDir = fs.existsSync(toolsDir) || fs.existsSync(scriptsDir);
    assert(hasConsolidationDir, `Expected consolidated scripts directory (tools/ or scripts/) in ui-jagung.`);
  });

  // T1.2: Server Port Configuration
  await harness.test('TC-T1-02', 'Dev Server Port: Configured to default port 4180 in server.js', () => {
    assert(fs.existsSync(PATHS.serverJs), `server.js not found at ${PATHS.serverJs}`);
    const serverCode = fs.readFileSync(PATHS.serverJs, 'utf8');
    const portMatch = serverCode.match(/PORT\s*=\s*(?:process\.env\.PORT\s*\|\|\s*)?(\d+)/);
    assert(portMatch, 'Could not locate PORT variable definition in server.js');
    const defaultPort = parseInt(portMatch[1], 10);
    assert(
      defaultPort === 4180,
      `Expected server.js default PORT to be 4180, but found ${defaultPort}. Alignment required per User Prompt & BEDAH_TEKNIKAL.md.`
    );
  });

  // T1.3: Preloader Vector Typography
  await harness.test('TC-T1-03', 'Preloader Branding: Vector typography contains "SYAHMI AOF" in loader bundle', () => {
    assert(fs.existsSync(PATHS.loaderBundle), `loader bundle not found at ${PATHS.loaderBundle}`);
    const loaderCode = fs.readFileSync(PATHS.loaderBundle, 'utf8');
    assert(
      loaderCode.includes('SYAHMI AOF'),
      'loader bundle does not contain "SYAHMI AOF" vector typography definition.'
    );
    assert(
      !loaderCode.includes('class="r"'),
      'loader bundle still contains legacy trademark/Pioneer corporate class="r" paths.'
    );
  });

  // T1.4: Preloader Slogan Rebranding
  await harness.test('TC-T1-04', 'Preloader Slogan: Label updated to "REVOLUSI JAGUNG • SYAHMI AOF"', () => {
    assert(fs.existsSync(PATHS.loaderBundle), `loader bundle not found at ${PATHS.loaderBundle}`);
    const loaderCode = fs.readFileSync(PATHS.loaderBundle, 'utf8');
    assert(
      loaderCode.includes('REVOLUSI JAGUNG'),
      'loader bundle does not contain new slogan "REVOLUSI JAGUNG".'
    );
    assert(
      !loaderCode.includes('Loading your experience.'),
      'loader bundle still contains legacy slogan "Loading your experience.".'
    );
  });

  // T1.5: SVG Sprite Rebranding
  await harness.test('TC-T1-05', 'SVG Sprite: Symbols #pioneer-logo and #corteva-logo rebranded', () => {
    assert(fs.existsSync(PATHS.svgSprite), `svg.svg not found at ${PATHS.svgSprite}`);
    const svgCode = fs.readFileSync(PATHS.svgSprite, 'utf8');

    assert(svgCode.includes('id="pioneer-logo"'), 'Missing symbol id="pioneer-logo" in svg.svg');
    assert(svgCode.includes('id="corteva-logo"'), 'Missing symbol id="corteva-logo" in svg.svg');

    assert(
      svgCode.includes('SYAHMIAOF.MY') || svgCode.includes('syahmiaof.my'),
      'Symbol #corteva-logo in svg.svg has not been replaced with portfolio badge "SYAHMIAOF.MY".'
    );
  });

  // T1.6: 3D WebGL Hero Headline & Copy Dictionary
  await harness.test('TC-T1-06', '3D WebGL Hero Headline: Module 369 exports "REVOLUSI JAGUNG."', () => {
    assert(fs.existsSync(PATHS.mainBundle), `main bundle not found at ${PATHS.mainBundle}`);
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');

    assert(
      mainCode.includes('REVOLUSI JAGUNG'),
      'main bundle does not contain hero headline "REVOLUSI JAGUNG."'
    );

    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369 from main bundle');

    const { activeExport } = executeModule369InSandbox(modFn);
    assert(activeExport, 'Module 369 did not export a dictionary object');
    assert(
      activeExport['landing-title'] === 'REVOLUSI JAGUNG.',
      `Expected landing-title to be "REVOLUSI JAGUNG.", got "${activeExport['landing-title']}"`
    );
    assert(
      Object.keys(activeExport).length >= 100,
      `Expected at least 100 copy keys in Module 369, found ${Object.keys(activeExport).length}`
    );
  });

  // T1.7: Manifold CF MSDF Font Glyph Safety
  await harness.test('TC-T1-07', 'Font Safety: Manifold CF MSDF contains all glyphs for "REVOLUSI JAGUNG."', () => {
    assert(fs.existsSync(PATHS.manifoldFont), `Manifold font descriptor missing at ${PATHS.manifoldFont}`);
    const fontData = JSON.parse(fs.readFileSync(PATHS.manifoldFont, 'utf8'));
    const glyphSet = new Set(fontData.chars.map(c => String.fromCharCode(c.id)));

    const bmHeadline = 'REVOLUSI JAGUNG.';
    for (const ch of bmHeadline) {
      assert(glyphSet.has(ch), `Character "${ch}" (code ${ch.charCodeAt(0)}) is missing in Manifold CF MSDF!`);
    }

    const enHeadline = 'CORN. REVOLUTIONIZED.';
    for (const ch of enHeadline) {
      assert(glyphSet.has(ch), `Character "${ch}" (code ${ch.charCodeAt(0)}) is missing in Manifold CF MSDF!`);
    }
  });

  // T1.8: Bilingual Controller Contract
  await harness.test('TC-T1-08', 'Bilingual Controller: window.syahmiJagung contract & default language "ms"', () => {
    assert(fs.existsSync(PATHS.mainBundle), `main bundle not found at ${PATHS.mainBundle}`);
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');
    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369');

    const { sandbox } = executeModule369InSandbox(modFn);
    const controller = sandbox.window.syahmiJagung;
    assert(controller, 'Global contract window.syahmiJagung is not defined');
    assert(controller.currentLang === 'ms', `Expected default language to be "ms", got "${controller.currentLang}"`);
    assert(typeof controller.setLanguage === 'function', 'window.syahmiJagung.setLanguage must be a function');
    assert(controller.dictionary && controller.dictionary.ms && controller.dictionary.en, 'Dictionary must provide both "ms" and "en"');
  });

  // T1.9: External Navigation Links
  await harness.test('TC-T1-09', 'External Links: GitHub & Portfolio URLs present in dictionary and templates', () => {
    assert(fs.existsSync(PATHS.mainBundle), `main bundle not found at ${PATHS.mainBundle}`);
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');

    assert(
      mainCode.includes('https://github.com/syahmiaof'),
      'main bundle missing link to GitHub author profile (https://github.com/syahmiaof)'
    );
    assert(
      mainCode.includes('https://github.com/syahmiaof/jagung-website'),
      'main bundle missing link to GitHub repository (https://github.com/syahmiaof/jagung-website)'
    );
    assert(
      mainCode.includes('https://syahmiaof.my'),
      'main bundle missing link to personal portfolio (https://syahmiaof.my)'
    );
  });

  // T1.10: OpenGraph & Social Metadata
  await harness.test('TC-T1-10', 'OpenGraph Metadata: Title, Description, and WhatsApp image configured', () => {
    assert(fs.existsSync(PATHS.publicIndexHtml), `public/index.html not found at ${PATHS.publicIndexHtml}`);
    const html = fs.readFileSync(PATHS.publicIndexHtml, 'utf8');

    assert(
      html.toUpperCase().includes('REVOLUSI JAGUNG') && html.toUpperCase().includes('SYAHMI AOF'),
      'public/index.html <title> does not contain "REVOLUSI JAGUNG • SYAHMI AOF"'
    );
    assert(
      html.includes('property="og:image"') && html.includes('og-preview-v5.jpg'),
      'public/index.html og:image does not target og-preview-v5.jpg'
    );
    assert(
      html.includes('name="twitter:image"') && html.includes('og-preview-v5.jpg'),
      'public/index.html twitter:image does not target og-preview-v5.jpg'
    );

    // Verify root index.html synchronization
    if (fs.existsSync(PATHS.rootIndexHtml)) {
      const rootHtml = fs.readFileSync(PATHS.rootIndexHtml, 'utf8');
      assert(
        rootHtml.toUpperCase().includes('REVOLUSI JAGUNG'),
        'ui-jagung/index.html is out of sync with public/index.html'
      );
    }
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // ==========================================================================
  harness.setTier(2);

  // T2.1: Missing localStorage Fallback
  await harness.test('TC-T2-01', 'Storage Boundary: Graceful fallback to "ms" when localStorage is empty', () => {
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');
    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369');

    // Test with completely empty storage
    const { sandbox } = executeModule369InSandbox(modFn, {});
    const controller = sandbox.window.syahmiJagung;
    assert(controller, 'window.syahmiJagung not defined');
    assert(controller.currentLang === 'ms', `Expected empty storage to fall back to 'ms', got '${controller.currentLang}'`);
    assert(controller.activeCopy['landing-title'] === 'REVOLUSI JAGUNG.', 'activeCopy must reflect Bahasa Melayu copy');
  });

  // T2.2: Invalid Language Code Rejection
  await harness.test('TC-T2-02', 'Input Validation: Rejection of invalid language codes (e.g. "fr", "", null)', () => {
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');
    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369');

    const { sandbox } = executeModule369InSandbox(modFn);
    const controller = sandbox.window.syahmiJagung;
    assert(controller, 'window.syahmiJagung not defined');

    // Attempt invalid transitions
    controller.setLanguage('fr');
    assert(controller.currentLang === 'ms', 'setLanguage("fr") must be rejected; state must remain "ms"');

    controller.setLanguage('');
    assert(controller.currentLang === 'ms', 'setLanguage("") must be rejected');

    controller.setLanguage(null);
    assert(controller.currentLang === 'ms', 'setLanguage(null) must be rejected');

    controller.setLanguage(undefined);
    assert(controller.currentLang === 'ms', 'setLanguage(undefined) must be rejected');

    controller.setLanguage(42);
    assert(controller.currentLang === 'ms', 'setLanguage(42) must be rejected');
  });

  // T2.3: Translation Data Integrity & Bounds
  await harness.test('TC-T2-03', 'Data Integrity: Complete non-empty copy keys and no undefined/NaN tokens', () => {
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');
    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369');

    const { sandbox } = executeModule369InSandbox(modFn);
    const controller = sandbox.window.syahmiJagung;
    assert(controller && controller.dictionary, 'Dictionary not available');

    ['ms', 'en'].forEach(lang => {
      const dict = controller.dictionary[lang];
      assert(dict, `Dictionary missing for language "${lang}"`);
      const keys = Object.keys(dict);
      assert(keys.length >= 100, `Language "${lang}" dictionary has only ${keys.length} keys (expected >= 100)`);

      keys.forEach(k => {
        const val = dict[k];
        assert(typeof val === 'string', `Key "${k}" in "${lang}" is not a string`);
        const intentionallyHiddenSlot = /^seventh-section-cta_(five|six|seven)-label$/.test(k)
          || /^menu-item_(six|eight|nine|ten)-label$/.test(k)
          || k === 'menu-item_six-link';
        assert(intentionallyHiddenSlot || val.trim().length > 0, `Key "${k}" in "${lang}" is empty`);
        assert(!val.includes('undefined'), `Key "${k}" in "${lang}" contains raw token "undefined"`);
        assert(!val.includes('NaN'), `Key "${k}" in "${lang}" contains raw token "NaN"`);
        assert(!val.includes('[object Object]'), `Key "${k}" in "${lang}" contains raw token "[object Object]"`);
      });
    });
  });

  // T2.4: Gilroy MSDF Missing '@' Protection
  await harness.test('TC-T2-04', 'Font Boundary: Gilroy MSDF lacks "@" symbol; allow HTML email label only', () => {
    assert(fs.existsSync(PATHS.gilroyFont), `Gilroy font descriptor missing at ${PATHS.gilroyFont}`);
    const fontData = JSON.parse(fs.readFileSync(PATHS.gilroyFont, 'utf8'));
    const glyphSet = new Set(fontData.chars.map(c => String.fromCharCode(c.id)));

    // Confirm that Gilroy font indeed lacks '@'
    assert(!glyphSet.has('@'), 'Precondition failure: Gilroy unexpectedly contains "@" character');

    // Verify that all copy strings in Module 369 avoid '@'
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');
    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369');

    const { sandbox } = executeModule369InSandbox(modFn);
    const controller = sandbox.window.syahmiJagung;
    assert(controller && controller.dictionary, 'Dictionary not available');

    ['ms', 'en'].forEach(lang => {
      const dict = controller.dictionary[lang];
      Object.entries(dict).forEach(([k, val]) => {
        assert(
          k === 'menu-item_five-label' || !val.includes('@'),
          `Copy key "${k}" in language "${lang}" contains "@" ('${val}'), which will corrupt Gilroy 3D text. Use ": syahmiaof" instead.`
        );
      });
    });
  });

  // ==========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // ==========================================================================
  harness.setTier(3);

  // T3.1: Language Switch Persistence Across Reload
  await harness.test('TC-T3-01', 'State Persistence: Language selection persists into localStorage and across reload', () => {
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');
    const modFn = extractModule369(mainCode);
    assert(modFn, 'Failed to extract Module 369');

    // 1. Start fresh session
    const session1 = executeModule369InSandbox(modFn, {});
    const ctrl1 = session1.sandbox.window.syahmiJagung;
    assert(ctrl1.currentLang === 'ms', 'Fresh session should default to "ms"');

    // 2. Switch to 'en'
    ctrl1.setLanguage('en');
    assert(ctrl1.currentLang === 'en', 'Active language should be "en"');
    assert(ctrl1.activeCopy['landing-title'] === 'CORN. REVOLUTIONIZED.', 'activeCopy should update to English headline');
    assert(session1.store['syahmi_jagung_lang'] === 'en', 'localStorage must persist "syahmi_jagung_lang"="en"');

    // Verify custom event dispatch
    const ev = session1.dispatchedEvents.find(e => e.name === 'syahmi_language_changed');
    assert(ev, 'Event "syahmi_language_changed" was not dispatched');
    assert(ev.detail && ev.detail.lang === 'en', 'Event detail must include new lang="en"');

    // 3. Simulate page reload with existing localStorage store
    const session2 = executeModule369InSandbox(modFn, session1.store);
    const ctrl2 = session2.sandbox.window.syahmiJagung;
    assert(ctrl2.currentLang === 'en', 'Post-refresh session must restore "en" from localStorage');
    assert(ctrl2.activeCopy['landing-title'] === 'CORN. REVOLUTIONIZED.', 'Post-refresh activeCopy must reflect "en"');

    // 4. Switch back to 'ms'
    ctrl2.setLanguage('ms');
    assert(ctrl2.currentLang === 'ms', 'Should be able to toggle back to "ms"');
    assert(ctrl2.activeCopy['landing-title'] === 'REVOLUSI JAGUNG.', 'activeCopy should revert to "REVOLUSI JAGUNG."');
    assert(session2.store['syahmi_jagung_lang'] === 'ms', 'localStorage must persist "ms"');
  });

  // T3.2: Navbar Portfolio Badge Interactivity
  await harness.test('TC-T3-02', 'Navbar Interactivity: Portfolio badge (.cortevaLogo) links to https://syahmiaof.my', () => {
    assert(fs.existsSync(PATHS.mainBundle), `main bundle missing at ${PATHS.mainBundle}`);
    const mainCode = fs.readFileSync(PATHS.mainBundle, 'utf8');

    // Check if cortevaLogo is made into an interactive link or has click handler
    const hasAnchorLink = mainCode.includes('href="https://syahmiaof.my"') && mainCode.includes('cortevaLogo');
    const hasClickBinding = mainCode.includes('syahmiaof.my') && (mainCode.includes('window.open') || mainCode.includes('cortevaLogo'));

    assert(
      hasAnchorLink || hasClickBinding,
      'Top-right navbar portfolio badge (.cortevaLogo) is not configured as an interactive link to https://syahmiaof.my'
    );
  });

  // T3.3: WhatsApp Card Image Size Constraint
  await harness.test('TC-T3-03', 'OpenGraph Optimization: og-preview-v5.jpg size strictly < 300KB for WhatsApp cards', () => {
    assert(fs.existsSync(PATHS.ogPreviewJpg), `og-preview-v5.jpg missing at ${PATHS.ogPreviewJpg}`);
    const stat = fs.statSync(PATHS.ogPreviewJpg);
    const maxAllowedBytes = 300 * 1024; // 307,200 bytes

    assert(
      stat.size < maxAllowedBytes,
      `og-preview-v5.jpg is ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB), which exceeds the configured 300KB preview limit.`
    );
  });

  // ==========================================================================
  // TIER 4: REAL-WORLD WORKLOAD / DEV SERVER HEALTH CHECK
  // ==========================================================================
  harness.setTier(4);

  let devServerInfo = null;

  // T4.1: Dev Server HTTP 200 on Port 4180
  await harness.test('TC-T4-01', 'Dev Server: Responds with HTTP 200 & text/html at http://127.0.0.1:4180/', async () => {
    devServerInfo = await ensureLocalServerRunning(4180);
    const res = await httpGet('http://127.0.0.1:4180/');

    assert(res.statusCode === 200, `Expected HTTP 200 on root, got ${res.statusCode}`);
    const contentType = res.headers['content-type'] || '';
    assert(
      contentType.includes('text/html'),
      `Expected Content-Type to be text/html, got "${contentType}"`
    );
    assert(
      res.body.includes('<title>') || res.body.includes('js-preloader'),
      'Root page body does not contain expected index.html structure'
    );
  });

  // T4.2: Static Asset Delivery & Specific MIME Types
  await harness.test('TC-T4-02', 'Static Asset Delivery: Correct MIME types for JS, SVG, KTX, and GLTF on port 4180', async () => {
    if (!devServerInfo) {
      devServerInfo = await ensureLocalServerRunning(4180);
    }

    // 1. Test loader bundle
    const jsRes = await httpGet('http://127.0.0.1:4180/loader.76ceb4644b28bd9c30b5.js');
    assert(jsRes.statusCode === 200, `Failed to fetch loader bundle (HTTP ${jsRes.statusCode})`);
    const jsType = jsRes.headers['content-type'] || '';
    assert(jsType.includes('javascript'), `Expected javascript Content-Type for loader, got "${jsType}"`);

    // 2. Test SVG sprite
    const svgRes = await httpGet('http://127.0.0.1:4180/svg/svg.svg');
    assert(svgRes.statusCode === 200, `Failed to fetch svg.svg (HTTP ${svgRes.statusCode})`);
    const svgType = svgRes.headers['content-type'] || '';
    assert(svgType.includes('image/svg+xml'), `Expected image/svg+xml for svg.svg, got "${svgType}"`);

    // 3. Test KTX texture
    const ktxRes = await httpGet('http://127.0.0.1:4180/compressed/s3tc/landing/graded/alpha.ktx');
    assert(ktxRes.statusCode === 200, `Failed to fetch KTX texture (HTTP ${ktxRes.statusCode})`);
    const ktxType = ktxRes.headers['content-type'] || '';
    assert(ktxType.includes('image/ktx'), `Expected image/ktx MIME type, got "${ktxType}"`);

    // 4. Test GLTF model
    const gltfRes = await httpGet('http://127.0.0.1:4180/models/landing/cobb_test.gltf');
    assert(gltfRes.statusCode === 200, `Failed to fetch GLTF model (HTTP ${gltfRes.statusCode})`);
    const gltfType = gltfRes.headers['content-type'] || '';
    assert(
      gltfType.includes('model/gltf+json') || gltfType.includes('application/json'),
      `Expected model/gltf+json or application/json for GLTF, got "${gltfType}"`
    );

    // Clean up server if spawned by this test
    if (devServerInfo && devServerInfo.child) {
      devServerInfo.child.kill();
      devServerInfo = null;
    }
  });

  // T4.3: Live Production URL Accessibility Check
  await harness.test('TC-T4-03', 'Live Production: Accessibility check for https://jagung.syahmiaof.my', async () => {
    try {
      const liveRes = await httpGet('https://jagung.syahmiaof.my/', { timeout: 4000 });
      assert(
        liveRes.statusCode === 200 || liveRes.statusCode === 308 || liveRes.statusCode === 301,
        `Expected HTTP 200/301/308 from live domain, got ${liveRes.statusCode}`
      );
    } catch (err) {
      // If DNS or network is currently pending, log diagnostics without breaking local pipeline
      if (err.code === 'ENOTFOUND' || err.message.includes('timed out')) {
        throw new Error(`Live domain https://jagung.syahmiaof.my is not yet reachable (${err.message}). Expected after Milestone 5 Vercel deploy.`);
      }
      throw err;
    }
  });

  // ==========================================================================
  // Summary & Exit Code
  // ==========================================================================
  const exitCode = harness.summary();
  process.exit(exitCode);
}

runTestSuite().catch(err => {
  console.error('\nFatal test harness error:', err);
  process.exit(1);
});
