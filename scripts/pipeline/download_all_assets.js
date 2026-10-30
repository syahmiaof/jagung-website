const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = 'C:\\Users\\USER\\Desktop\\ui-gempak\\ui-jagung\\public';

// All asset URLs to download
const assets = [
  // GLTF & BIN Models
  'assets/bg_pot.bin',
  'assets/bg_pot.gltf',
  'assets/pot3.bin',
  'assets/pot3.gltf',
  'models/kernel/KERNAL.bin',
  'models/kernel/KERNAL.gltf',
  'models/landing/cobb_test.bin',
  'models/landing/cobb_test.gltf',
  'models/landing/hair.bin',
  'models/landing/hair.gltf',
  'images/stalk/SingleStalk12_db.bin',
  'images/stalk/SingleStalk12_db.gltf',
  'images/stalk/SingleStalk2.png',
  'images/stalk/stalk_rigged3.bin',
  'images/stalk/stalk_rigged3.gltf',

  // Textures & Images
  'images/arrowhead-down.png',
  'images/field/map-grade.png',
  'images/icons/arrow-link-external.png',
  'images/icons/arrow-link.png',
  'images/icons/icons-0.png',
  'images/icons/icons-1.png',
  'images/icons/icons-2.png',
  'images/overlay-bg.jpg',
  'images/rotate-icon.png',
  'images/spinner.png',
  'map-field-diffuse-0.png',
  'textures/corteva-logo.png',
  'textures/field/map-field-diffuse-combined0@mipmaps.png',
  'textures/registered.png',
  'textures/testing/post-noise.png',
  'fb.jpg',
  'tw.jpg',

  // SVG
  'svg/svg.svg',

  // Fonts & MSDF Data
  'fonts/Gilroy/3714E1_B_0.woff',
  'fonts/Gilroy/3714E1_B_0.woff2',
  'fonts/Gilroy/gilroy-msdf.png',
  'fonts/Gilroy/gilroy.json',
  'fonts/Manifold/gradient-map.png',
  'fonts/Manifold/manifold-cf-extra-bold.woff2',
  'fonts/Manifold/manifold-msdf.png',
  'fonts/Manifold/manifold.json',

  // Favicon
  'favicon/favicon.ico',
  'favicon/site.webmanifest',
  'favicon/apple-touch-icon.png',
  'favicon/favicon-32x32.png',
  'favicon/favicon-16x16.png',
  'favicon/safari-pinned-tab.svg',

  // Bundles
  'loader.76ceb4644b28bd9c30b5.js',
  'vendors~main.76ceb4644b28bd9c30b5.js',
  'main.76ceb4644b28bd9c30b5.js',
  'test0.76ceb4644b28bd9c30b5.js',
  'loader.76ceb4644b28bd9c30b5.js.map',
  'vendors~main.76ceb4644b28bd9c30b5.js.map',
  'main.76ceb4644b28bd9c30b5.js.map',
  'test0.76ceb4644b28bd9c30b5.js.map',

  // Compressed S3TC (desktop) textures
  'compressed/s3tc/field/map-cloud-noise@mipmaps.ktx',
  'compressed/s3tc/field/map-ground-diffuse@mipmaps.ktx',
  'compressed/s3tc/kernel/map_bg.ktx',
  'compressed/s3tc/kernel/map_bump_kernel.ktx',
  'compressed/s3tc/kernel/map_diffuse_kernel.ktx',
  'compressed/s3tc/kernel/map_matcap_mult.ktx',
  'compressed/s3tc/kernel/map_matcap_screen.ktx',
  'compressed/s3tc/landing/graded/BOTTOM_L.ktx',
  'compressed/s3tc/landing/graded/BOTTOM_R.ktx',
  'compressed/s3tc/landing/graded/TOP_L.ktx',
  'compressed/s3tc/landing/graded/TOP_R.ktx',
  'compressed/s3tc/landing/graded/alpha.ktx',
  'compressed/s3tc/landing/hair/HAIR_BOTTOM_L_.ktx',
  'compressed/s3tc/landing/hair/HAIR_BOTTOM_R_.ktx',
  'compressed/s3tc/landing/hair/HAIR_TOP_L_.ktx',
  'compressed/s3tc/landing/hair/HAIR_TOP_R_.ktx',
  'compressed/s3tc/landing/hair/alpha.ktx',
  'compressed/s3tc/pot/bg_pot_diffuse.ktx',
  'compressed/s3tc/pot/diffuse_pot@mipmaps.ktx',
  'compressed/s3tc/testing/SingleStalk_DifF_0007@mipmaps.ktx',
  'compressed/s3tc/testing/SingleStalk_DifF_0007_DEAD@mipmaps.ktx',
  'compressed/s3tc/testing/SingleStalk_DifF_0007_reveal@mipmaps.ktx',
  'compressed/s3tc/testing/bg.ktx',
  'compressed/s3tc/testing/bg_corn.ktx',
  'compressed/s3tc/testing/lens-flare.ktx',
  'compressed/s3tc/testing/main-stalk/stalk-screen@mipmaps.ktx',
  'compressed/s3tc/testing/main-stalk/stalk_diffuse_flat@mipmaps.ktx',
  'compressed/s3tc/testing/main-stalk/stalk_diffuse_shadow@mipmaps.ktx',
  'compressed/s3tc/testing/main-stalk/stalk_energy@mipmaps.ktx',
  'compressed/s3tc/testing/plantShadow.ktx',
  'compressed/s3tc/testing/rainTexture.ktx',
  'compressed/s3tc/testing/revealMap.ktx',
  'compressed/s3tc/testing/soil-displacement.ktx',
  'compressed/s3tc/testing/soil-normal.ktx',
  'compressed/s3tc/testing/soil/soil_default@mipmaps.ktx',
  'compressed/s3tc/testing/soil/soil_nutrients_clay@mipmaps.ktx',
  'compressed/s3tc/testing/soil/soil_nutrients_loam@mipmaps.ktx',
  'compressed/s3tc/testing/soil/soil_nutrients_sand@mipmaps.ktx'
];

async function download(relPath) {
  const fileUrl = 'https://d1hl9u9k5hiqxp.cloudfront.net/' + relPath;
  const outPath = path.join(targetDir, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
    return { relPath, status: 'cached' };
  }

  return new Promise((resolve) => {
    https.get(fileUrl, (res) => {
      if (res.statusCode !== 200) {
        resolve({ relPath, status: `failed ${res.statusCode}` });
        return;
      }
      const stream = fs.createWriteStream(outPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve({ relPath, status: 'ok', size: fs.statSync(outPath).size });
      });
    }).on('error', (err) => {
      resolve({ relPath, status: `error: ${err.message}` });
    });
  });
}

async function run() {
  console.log(`Starting download of ${assets.length} assets into ${targetDir}...`);
  const concurrency = 6;
  const queue = [...assets];
  let completed = 0;

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      const res = await download(item);
      completed++;
      if (completed % 10 === 0 || completed === assets.length || res.status.startsWith('failed')) {
        console.log(`[${completed}/${assets.length}] ${res.relPath} -> ${res.status} ${res.size ? '(' + res.size + 'B)' : ''}`);
      }
    }
  }

  const workers = Array(concurrency).fill(0).map(() => worker());
  await Promise.all(workers);
  console.log('All downloads completed!');
}

run();
