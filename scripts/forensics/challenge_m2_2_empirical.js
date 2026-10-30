/**
 * Empirical Challenge Harness: Milestone 2
 * Challenger Agent: challenger_m2_2
 * Focus: Navbar Vector Branding, SVG Well-Formedness, & Portfolio Anchor Interactivity
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SVG_PATH = path.resolve(__dirname, '../../public/svg/svg.svg');
const MAIN_BUNDLE_PATH = path.resolve(__dirname, '../../public/main.76ceb4644b28bd9c30b5.js');
const LOADER_BUNDLE_PATH = path.resolve(__dirname, '../../public/loader.76ceb4644b28bd9c30b5.js');

const results = [];

function record(name, passed, details) {
  results.push({ name, passed, details });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}`);
  if (details) {
    console.log(`       ${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}`);
  }
}

console.log('======================================================================');
console.log(' CHALLENGER M2_2: EMPIRICAL STRESS-TEST & VERIFICATION HARNESS');
console.log('======================================================================\n');

// ----------------------------------------------------------------------------
// TEST 1: Strict XML Well-Formedness of svg.svg (Multi-Parser Consensus)
// ----------------------------------------------------------------------------
try {
  // Test 1.1: Python xml.etree.ElementTree
  const pyEtOut = execSync(
    'python -c "import xml.etree.ElementTree as ET; tree = ET.parse(\'ui-jagung/public/svg/svg.svg\'); print(f\'ROOT:{tree.getroot().tag}, NODES:{len(list(tree.iter()))}\')"',
    { encoding: 'utf8' }
  ).trim();
  record('XML Strict Parsing: Python ElementTree', pyEtOut.startsWith('ROOT:'), { output: pyEtOut });
} catch (err) {
  record('XML Strict Parsing: Python ElementTree', false, { error: err.message });
}

try {
  // Test 1.2: Python xml.sax (strict SAX event parser)
  const pySaxOut = execSync(
    'python -c "import xml.sax; p = xml.sax.make_parser(); p.parse(\'ui-jagung/public/svg/svg.svg\'); print(\'SAX_OK\')"',
    { encoding: 'utf8' }
  ).trim();
  record('XML Strict Parsing: Python SAX Parser', pySaxOut === 'SAX_OK', { output: pySaxOut });
} catch (err) {
  record('XML Strict Parsing: Python SAX Parser', false, { error: err.message });
}

try {
  // Test 1.3: .NET System.Xml.XmlDocument via PowerShell
  const psXmlOut = execSync(
    'powershell -Command "$x = New-Object System.Xml.XmlDocument; $x.Load(\'ui-jagung/public/svg/svg.svg\'); Write-Host \'DOTNET_XML_OK\'; Write-Host $x.DocumentElement.ChildNodes.Count"',
    { encoding: 'utf8' }
  ).trim();
  record('XML Strict Parsing: .NET System.Xml.XmlDocument', psXmlOut.includes('DOTNET_XML_OK'), { output: psXmlOut });
} catch (err) {
  record('XML Strict Parsing: .NET System.Xml.XmlDocument', false, { error: err.message });
}

// ----------------------------------------------------------------------------
// TEST 2: Symbol IDs and Exact viewBox Verification
// ----------------------------------------------------------------------------
try {
  const pySymbolsOut = execSync(
    'python -c "import xml.etree.ElementTree as ET, json; tree = ET.parse(\'ui-jagung/public/svg/svg.svg\'); root = tree.getroot(); symbols = {e.attrib.get(\'id\'): e.attrib for e in root.iter() if e.tag.endswith(\'symbol\')}; print(json.dumps(symbols))"',
    { encoding: 'utf8' }
  ).trim();
  const symbols = JSON.parse(pySymbolsOut);

  // Pioneer logo symbol
  const pioneer = symbols['pioneer-logo'];
  const pioneerExists = !!pioneer;
  const pioneerVb = pioneer ? pioneer.viewBox : null;
  record('SVG Symbol: #pioneer-logo exists', pioneerExists, pioneer);
  record('SVG Symbol: #pioneer-logo viewBox == "0 0 377.81 70.4"', pioneerVb === '0 0 377.81 70.4', {
    actual: pioneerVb,
    expected: '0 0 377.81 70.4'
  });

  // Corteva logo symbol
  const corteva = symbols['corteva-logo'];
  const cortevaExists = !!corteva;
  const cortevaVb = corteva ? corteva.viewBox : null;
  record('SVG Symbol: #corteva-logo exists', cortevaExists, corteva);
  record('SVG Symbol: #corteva-logo viewBox == "0 0 304.78 60.09"', cortevaVb === '0 0 304.78 60.09', {
    actual: cortevaVb,
    expected: '0 0 304.78 60.09'
  });

  // Vector branding content check in pioneer-logo and corteva-logo
  const pyContentOut = execSync(
    'python -c "import xml.etree.ElementTree as ET, json; tree = ET.parse(\'ui-jagung/public/svg/svg.svg\'); root = tree.getroot(); p = [e for e in root.iter() if e.tag.endswith(\'symbol\') and e.attrib.get(\'id\')==\'pioneer-logo\'][0]; c = [e for e in root.iter() if e.tag.endswith(\'symbol\') and e.attrib.get(\'id\')==\'corteva-logo\'][0]; p_paths = len(list(p.iter(\'{http://www.w3.org/2000/svg}path\'))); c_texts = [t.text for t in c.iter(\'{http://www.w3.org/2000/svg}text\')]; print(json.dumps({\'pioneer_paths\': p_paths, \'corteva_texts\': c_texts}))"',
    { encoding: 'utf8' }
  ).trim();
  const contentData = JSON.parse(pyContentOut);
  record('SVG Symbol: #pioneer-logo contains 11 vector paths (Emblem + SYAHMI AOF)', contentData.pioneer_paths === 11, contentData);
  record('SVG Symbol: #corteva-logo contains SYAHMIAOF.MY text badge', contentData.corteva_texts.includes('SYAHMIAOF.MY'), contentData);
} catch (err) {
  record('SVG Symbol extraction and validation', false, { error: err.message });
}

// ----------------------------------------------------------------------------
// TEST 3: Anchor Element & Attributes in main.76ceb4644b28bd9c30b5.js
// ----------------------------------------------------------------------------
try {
  const mainCode = fs.readFileSync(MAIN_BUNDLE_PATH, 'utf8');

  // Search for the template definition containing cortevaLogo
  // Expected snippet:
  // <a href="https://syahmiaof.my" target="_blank" rel="noopener noreferrer" class="cortevaLogo" style="cursor:pointer;" title="Portfolio Syahmi AOF">\n\t<svg class="cortevaLogo__icon"><use xlink:href="#corteva-logo" /></svg>\n</a>
  const anchorRegex = /<a\s+([^>]*class="cortevaLogo"[^>]*)>([\s\S]*?)<\/a>/;
  const match = mainCode.match(anchorRegex);

  const matchedFull = match ? match[0] : null;
  const matchedAttrs = match ? match[1] : '';
  const innerContent = match ? match[2] : '';

  record('Main Bundle: .cortevaLogo is an <a> element with closing </a>', !!match, {
    matchedSnippet: matchedFull ? matchedFull.slice(0, 150) + '...' : null
  });

  const hasHref = matchedAttrs.includes('href="https://syahmiaof.my"');
  record('Main Bundle: .cortevaLogo has href="https://syahmiaof.my"', hasHref, { matchedAttrs });

  const hasTarget = matchedAttrs.includes('target="_blank"');
  record('Main Bundle: .cortevaLogo has target="_blank"', hasTarget, { matchedAttrs });

  const hasRel = matchedAttrs.includes('rel="noopener noreferrer"');
  record('Main Bundle: .cortevaLogo has rel="noopener noreferrer"', hasRel, { matchedAttrs });

  const hasClass = matchedAttrs.includes('class="cortevaLogo"');
  record('Main Bundle: .cortevaLogo has class="cortevaLogo"', hasClass, { matchedAttrs });

  const innerHasSvg = innerContent.includes('<svg class="cortevaLogo__icon"><use xlink:href="#corteva-logo" /></svg>');
  record('Main Bundle: .cortevaLogo encloses <use xlink:href="#corteva-logo" />', innerHasSvg, { innerContent: innerContent.trim() });
} catch (err) {
  record('Main Bundle: .cortevaLogo verification', false, { error: err.message });
}

// ----------------------------------------------------------------------------
// TEST 4: Preloader Bundle Integrity (loader.76ceb4644b28bd9c30b5.js)
// ----------------------------------------------------------------------------
try {
  const loaderCode = fs.readFileSync(LOADER_BUNDLE_PATH, 'utf8');

  const hasSyahmiAof = loaderCode.includes('SYAHMI AOF');
  record('Loader Bundle: Vector paths contain "SYAHMI AOF"', hasSyahmiAof, {
    index: loaderCode.indexOf('SYAHMI AOF')
  });

  const hasNoClassR = !loaderCode.includes('class="r"');
  record('Loader Bundle: Legacy trademark class="r" eliminated', hasNoClassR, {
    hasLegacyTrademark: !hasNoClassR
  });

  const hasSlogan = loaderCode.includes('REVOLUSI JAGUNG • SYAHMI AOF');
  record('Loader Bundle: Rebranded slogan "REVOLUSI JAGUNG • SYAHMI AOF"', hasSlogan, {
    index: loaderCode.indexOf('REVOLUSI JAGUNG • SYAHMI AOF')
  });

  const hasNoLegacySlogan = !loaderCode.includes('Loading your experience.');
  record('Loader Bundle: Legacy slogan "Loading your experience." removed', hasNoLegacySlogan, {
    hasLegacySlogan: !hasNoLegacySlogan
  });
} catch (err) {
  record('Loader Bundle verification', false, { error: err.message });
}

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------------');
console.log(' EMPIRICAL VERIFICATION HARNESS SUMMARY');
console.log('----------------------------------------------------------------------');
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = total - passed;
console.log(`Total Assertions: ${total}`);
console.log(`Passed:           ${passed}`);
console.log(`Failed:           ${failed}`);
console.log(`Status:           ${failed === 0 ? 'ALL CRITERIA VERIFIED' : 'CRITERIA VIOLATIONS DETECTED'}`);
console.log('======================================================================\n');

process.exit(failed === 0 ? 0 : 1);
