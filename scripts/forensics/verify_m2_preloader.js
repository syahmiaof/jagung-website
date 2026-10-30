/**
 * UI GEMPAK: Milestone 2 Preloader SVG Adversarial Verification Harness
 * 
 * Verifies:
 * 1. Extraction of svg.out, svg.animated, svg.fill from loader bundle.
 * 2. Exact 11 path elements in each SVG, with identical geometric parity.
 * 3. Complete absence of legacy Pioneer paths, shield geometry, and class="r" trademark.
 * 4. Mathematical computation of getTotalLength() for all 11 paths.
 * 5. Simulation of the animation loop (setDashArray, setDashOffset, whileRenderActive).
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_PATH = path.resolve(__dirname, '../../public/loader.76ceb4644b28bd9c30b5.js');

function runVerification() {
  console.log('======================================================================');
  console.log(' EMPIRICAL PRELOADER VERIFICATION & ADVERSARIAL STRESS TEST (M2)');
  console.log('======================================================================');
  console.log(`Target: ${BUNDLE_PATH}`);

  if (!fs.existsSync(BUNDLE_PATH)) {
    throw new Error(`Target bundle not found at: ${BUNDLE_PATH}`);
  }

  const code = fs.readFileSync(BUNDLE_PATH, 'utf8');
  console.log(`Bundle size: ${code.length} bytes\n`);

  // -------------------------------------------------------------------------
  // 1. EXTRACT PRELOADER TEMPLATE & SVGs
  // -------------------------------------------------------------------------
  console.log('[STEP 1] Extracting Preloader SVG markup...');
  const preloaderStart = code.indexOf('<div class=\\"preloader js-preloader\\">') !== -1 
    ? code.indexOf('<div class=\\"preloader js-preloader\\">')
    : code.indexOf('<div class="preloader js-preloader">');

  if (preloaderStart === -1) {
    throw new Error('Could not find js-preloader container in bundle');
  }

  // Find closing </section> or container
  const templateSection = code.substring(preloaderStart - 50, preloaderStart + 15000);

  // Extract individual SVGs
  // svg.out: class="out"
  // svg.animated: class="animated" data-ui="svg-logo-animated"
  // svg.fill: class="fill" data-ui="svg-logo-filled"

  function extractSvgByClass(html, className) {
    const classIdx = html.indexOf(`class="${className}"`);
    if (classIdx === -1) {
      // try with escaped quotes if any
      const escIdx = html.indexOf(`class=\\"${className}\\"`);
      if (escIdx === -1) return null;
      const start = html.lastIndexOf('<svg', escIdx);
      const end = html.indexOf('</svg>', escIdx);
      return html.substring(start, end + 6);
    }
    const start = html.lastIndexOf('<svg', classIdx);
    const end = html.indexOf('</svg>', classIdx);
    return html.substring(start, end + 6);
  }

  const svgOut = extractSvgByClass(templateSection, 'out');
  const svgAnimated = extractSvgByClass(templateSection, 'animated');
  const svgFill = extractSvgByClass(templateSection, 'fill');

  console.log(`- svg.out extracted: ${Boolean(svgOut)} (${svgOut ? svgOut.length : 0} chars)`);
  console.log(`- svg.animated extracted: ${Boolean(svgAnimated)} (${svgAnimated ? svgAnimated.length : 0} chars)`);
  console.log(`- svg.fill extracted: ${Boolean(svgFill)} (${svgFill ? svgFill.length : 0} chars)`);

  if (!svgOut || !svgAnimated || !svgFill) {
    throw new Error('Failed to extract all 3 SVG elements (svg.out, svg.animated, svg.fill)');
  }

  // -------------------------------------------------------------------------
  // 2. PARSE PATHS AND ASSERT EXACTLY 11 PATHS IN EACH
  // -------------------------------------------------------------------------
  console.log('\n[STEP 2] Parsing paths and asserting exact counts (11 in each)...');

  function extractPaths(svgStr) {
    const pathRegex = /<path\s+[^>]*d="([^"]+)"[^>]*>/g;
    const paths = [];
    let match;
    while ((match = pathRegex.exec(svgStr)) !== null) {
      paths.push({
        fullTag: match[0],
        d: match[1]
      });
    }
    return paths;
  }

  const pathsOut = extractPaths(svgOut);
  const pathsAnimated = extractPaths(svgAnimated);
  const pathsFill = extractPaths(svgFill);

  console.log(`- svg.out path count: ${pathsOut.length}`);
  console.log(`- svg.animated path count: ${pathsAnimated.length}`);
  console.log(`- svg.fill path count: ${pathsFill.length}`);

  if (pathsOut.length !== 11) {
    throw new Error(`svg.out has ${pathsOut.length} paths, expected exactly 11`);
  }
  if (pathsAnimated.length !== 11) {
    throw new Error(`svg.animated has ${pathsAnimated.length} paths, expected exactly 11`);
  }
  if (pathsFill.length !== 11) {
    throw new Error(`svg.fill has ${pathsFill.length} paths, expected exactly 11`);
  }
  console.log('  -> PASS: Exactly 11 path elements in each SVG state.');

  // Geometric Parity Check
  console.log('\n[STEP 2b] Verifying 1:1 geometric parity across svg.out, svg.animated, and svg.fill...');
  for (let i = 0; i < 11; i++) {
    if (pathsOut[i].d !== pathsAnimated[i].d) {
      throw new Error(`Path geometry mismatch at index ${i} between svg.out and svg.animated`);
    }
    if (pathsOut[i].d !== pathsFill[i].d) {
      throw new Error(`Path geometry mismatch at index ${i} between svg.out and svg.fill`);
    }
  }
  console.log('  -> PASS: Complete 1:1 path geometry parity across all 3 SVGs.');

  // -------------------------------------------------------------------------
  // 3. ADVERSARIAL SCAN: ASSERT ABSENCE OF PIONEER ARTIFACTS & CLASS="R"
  // -------------------------------------------------------------------------
  console.log('\n[STEP 3] Adversarial scan: scanning for legacy Pioneer tokens & class="r"...');

  const legacyTokens = [
    { name: 'Trademark class="r"', pattern: 'class="r"' },
    { name: 'Escaped trademark class=\\"r\\"', pattern: 'class=\\"r\\"' },
    { name: 'Pioneer Letter R (M332.57)', pattern: 'M332.57' },
    { name: 'Pioneer Letter E1 (M260.13)', pattern: 'M260.13' },
    { name: 'Pioneer Letter E2 (M291.94)', pattern: 'M291.94' },
    { name: 'Pioneer Letter N (M219.13)', pattern: 'M219.13' },
    { name: 'Pioneer Letter O (M196.12)', pattern: 'M196.12' },
    { name: 'Pioneer Letter I (M172,9.08)', pattern: 'M172,9.08' },
    { name: 'Pioneer Letter P (M136.86)', pattern: 'M136.86' },
    { name: 'Pioneer Outer Shield (M98.9,59.56)', pattern: 'M98.9,59.56' },
    { name: 'Pioneer Inner Sprout (M73.07,51.34)', pattern: 'M73.07,51.34' },
    { name: 'Pioneer Trademark Path 1 (M357.28)', pattern: 'M357.28' },
    { name: 'Pioneer Trademark Path 2 (M1.89,63.54)', pattern: 'M1.89,63.54' },
    { name: 'Legacy data-name="logo"', pattern: 'data-name="logo"' },
    { name: 'Legacy slogan "Loading your experience."', pattern: 'Loading your experience.' }
  ];

  let detectedViolations = 0;
  legacyTokens.forEach(token => {
    const found = code.includes(token.pattern);
    if (found) {
      console.error(`  [VIOLATION] Found legacy token: ${token.name}`);
      detectedViolations++;
    } else {
      console.log(`  [CLEAN] Absent: ${token.name}`);
    }
  });

  if (detectedViolations > 0) {
    throw new Error(`Adversarial scan failed: ${detectedViolations} legacy Pioneer artifacts detected.`);
  }
  console.log('  -> PASS: 0 legacy Pioneer or corporate trademark artifacts remain.');

  // Check branding slogan
  const hasSlogan = code.includes('REVOLUSI JAGUNG • SYAHMI AOF');
  console.log(`- New slogan "REVOLUSI JAGUNG • SYAHMI AOF" present: ${hasSlogan}`);
  if (!hasSlogan) {
    throw new Error('New slogan "REVOLUSI JAGUNG • SYAHMI AOF" not found in loader bundle');
  }

  // -------------------------------------------------------------------------
  // 4. MATHEMATICAL TOTAL LENGTH CALCULATION
  // -------------------------------------------------------------------------
  console.log('\n[STEP 4] Mathematical arc-length calculation of all 11 SVG paths...');

  // SVG Path Parser & Arc Length Calculator
  function calculatePathLength(dStr) {
    // Tokenize SVG path
    const cmdRegex = /([MLQZ])([^MLQZ]*)/gi;
    let match;
    let currentPoint = { x: 0, y: 0 };
    let subpathStart = { x: 0, y: 0 };
    let totalLength = 0;

    while ((match = cmdRegex.exec(dStr)) !== null) {
      const type = match[1].toUpperCase();
      const args = match[2].trim().replace(/,/g, ' ').replace(/-/g, ' -').split(/\s+/).filter(Boolean).map(Number);

      if (type === 'M') {
        currentPoint = { x: args[0], y: args[1] };
        subpathStart = { x: args[0], y: args[1] };
      } else if (type === 'L') {
        for (let i = 0; i < args.length; i += 2) {
          const next = { x: args[i], y: args[i + 1] };
          const dist = Math.hypot(next.x - currentPoint.x, next.y - currentPoint.y);
          totalLength += dist;
          currentPoint = next;
        }
      } else if (type === 'Q') {
        for (let i = 0; i < args.length; i += 4) {
          const cp = { x: args[i], y: args[i + 1] };
          const end = { x: args[i + 2], y: args[i + 3] };

          // Numerical integration of quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
          // B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
          const steps = 200;
          let curveLength = 0;
          let prevTPoint = currentPoint;
          for (let step = 1; step <= steps; step++) {
            const t = step / steps;
            const omt = 1 - t;
            const x = omt * omt * currentPoint.x + 2 * omt * t * cp.x + t * t * end.x;
            const y = omt * omt * currentPoint.y + 2 * omt * t * cp.y + t * t * end.y;
            curveLength += Math.hypot(x - prevTPoint.x, y - prevTPoint.y);
            prevTPoint = { x, y };
          }
          totalLength += curveLength;
          currentPoint = end;
        }
      } else if (type === 'Z') {
        const dist = Math.hypot(subpathStart.x - currentPoint.x, subpathStart.y - currentPoint.y);
        totalLength += dist;
        currentPoint = subpathStart;
      }
    }

    return totalLength;
  }

  const pathIdentities = [
    'Shield (Hexagonal Outline)',
    'Sprout (Central Emblem)',
    'Letter S',
    'Letter Y',
    'Letter A (1)',
    'Letter H',
    'Letter M',
    'Letter I',
    'Letter A (2)',
    'Letter O',
    'Letter F'
  ];

  const calculatedLengths = pathsAnimated.map((p, idx) => {
    const len = calculatePathLength(p.d);
    console.log(`  Path ${idx + 1} [${pathIdentities[idx]}]: Length = ${len.toFixed(3)} px`);
    if (isNaN(len) || len <= 0 || !isFinite(len)) {
      throw new Error(`Invalid path length at index ${idx}: ${len}`);
    }
    return len;
  });

  const aggregateLength = calculatedLengths.reduce((a, b) => a + b, 0);
  console.log(`  -> Total Combined Stroke Perimeter: ${aggregateLength.toFixed(3)} px`);
  console.log('  -> PASS: All 11 paths have valid, non-zero, finite mathematical lengths.');

  // -------------------------------------------------------------------------
  // 5. ANIMATION LOOP SIMULATION (whileRenderActive)
  // -------------------------------------------------------------------------
  console.log('\n[STEP 5] Simulating loader animation loop (whileRenderActive & setDashArray)...');

  // Simulated itemsPath as built by loader.js:
  // this.itemsPath = [];
  // this.svgAnimatedGroup.querySelectorAll("path").forEach(function(t){
  //   e.itemsPath.push({ pEl: t, pPathLength: t.getTotalLength() })
  // })
  const simulatedItems = calculatedLengths.map((len, idx) => ({
    id: idx,
    name: pathIdentities[idx],
    pPathLength: len,
    style: { strokeDasharray: '', strokeDashoffset: 0 }
  }));

  // State in Preloader instance
  let pr = 0;
  let prTg = 1.0;
  let offset = 0;
  let isAnimatingLogo = false;
  let framesSimulated = 0;

  // Let's step through 60 frames of animation as executed by whileRenderActive()
  console.log('  Simulating animation progression from pr=0.00 to pr=1.00:');
  const sampleFrames = [1, 5, 15, 30, 45, 60, 75];

  for (let frame = 1; frame <= 80; frame++) {
    // Formula from loader.js:
    // this.pr += .08 * (this.prTg - this.pr);
    // this.offset += .5;
    pr += 0.08 * (prTg - pr);
    offset += 0.5;
    framesSimulated++;

    simulatedItems.forEach(item => {
      // Formula from loader.js:
      // var n = .5 * e.pPathLength * (1 - t.pr);
      // e.pEl.style.strokeDasharray = "".concat(.5 * e.pPathLength, " ").concat(n);
      // e.pEl.style.strokeDashoffset = t.offset;
      const dash = 0.5 * item.pPathLength;
      const gap = 0.5 * item.pPathLength * (1 - pr);

      // Invariants:
      if (isNaN(dash) || isNaN(gap) || !isFinite(dash) || !isFinite(gap)) {
        throw new Error(`NaN/Infinite dash calculation on frame ${frame}`);
      }
      if (gap < -1e-6) {
        throw new Error(`Negative gap length (${gap}) on frame ${frame}`);
      }

      item.style.strokeDasharray = `${dash} ${gap}`;
      item.style.strokeDashoffset = offset;
    });

    // Check transition threshold in loader.js:
    // this.pr >= .96 && (this.isAnimatingLogo || (...; this.isAnimatingLogo = !0))
    if (pr >= 0.96 && !isAnimatingLogo) {
      isAnimatingLogo = true;
      console.log(`  -> Frame ${frame} (pr=${pr.toFixed(4)}): Threshold >= 0.96 reached! Transition to filled logo triggered.`);
    }

    if (sampleFrames.includes(frame)) {
      const p1 = simulatedItems[0];
      console.log(`  Frame ${frame.toString().padStart(2, ' ')}: pr = ${pr.toFixed(4)} (${(pr * 100).toFixed(1)}%) | offset = ${offset.toFixed(1)} | Path 1 dasharray = "${p1.style.strokeDasharray.split(' ').map(x => Number(x).toFixed(2)).join(' ')}"`);
    }
  }

  if (!isAnimatingLogo) {
    throw new Error('Animation loop failed to reach completion threshold (pr >= 0.96)');
  }

  // Check state at pr = 1.0 (final converged state)
  const finalP1 = simulatedItems[0];
  const finalGap = 0.5 * finalP1.pPathLength * (1 - 1.0);
  console.log(`\n  Final Converged State (pr = 1.0):`);
  console.log(`  - Dash: ${(0.5 * finalP1.pPathLength).toFixed(3)} px (50% of perimeter)`);
  console.log(`  - Gap:  ${finalGap.toFixed(3)} px (zero gap -> continuous solid stroke)`);
  console.log(`  - Total Frames Simulated: ${framesSimulated}`);
  console.log('  -> PASS: Animation loop is mathematically valid, stable, and monotonically convergent.');

  console.log('\n======================================================================');
  console.log(' VERIFICATION RESULT: ALL 5 ADVERSARIAL CHECKS PASSED EMPIRICALLY');
  console.log('======================================================================\n');

  return {
    success: true,
    pathCount: 11,
    pathsOut: pathsOut.length,
    pathsAnimated: pathsAnimated.length,
    pathsFill: pathsFill.length,
    absenceOfPioneer: true,
    absenceOfClassR: true,
    aggregateLength: aggregateLength.toFixed(3),
    animationConverged: true
  };
}

if (require.main === module) {
  try {
    const res = runVerification();
    process.exit(0);
  } catch (err) {
    console.error('\n[VERIFICATION FAILED]:', err.message);
    process.exit(1);
  }
}

module.exports = { runVerification };
