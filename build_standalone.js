const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'c:/dev/FTXAR';
const VERSION = '2610082335';

console.log('Building standalone WebAR HTML package for Standalone & GitHub Pages...');

const modules = [
  'style.html',
  'mission_manager.html',
  'mgrs.html',
  'astro.html',
  'weather.html',
  'terrain_occlusion.html',
  'ballistics.html',
  'effects.html',
  'audio.html',
  'calibration.html',
  'reticle.html'
];

let indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

// バージョン置換 (<?= version ?> および <?!= version ?> の両方に完全対応)
indexHtml = indexHtml.replace(/<\?[!=]?\s*version\s*\?>/g, VERSION);

// GAS include 置換
modules.forEach(m => {
  const baseName = m.replace('.html', '');
  const mContent = fs.readFileSync(path.join(ROOT_DIR, m), 'utf8');
  const tagRegex = new RegExp('<\\?!=\\s*include\\(\'' + baseName + '\'\\);?\\s*\\?>', 'g');
  indexHtml = indexHtml.replace(tagRegex, mContent);
});

// GAS API URL のデフォルト設定
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz25fTqj6svcb-Hp0lYCwu2SO-_3SWLL4TEuGbBahM-8085u1Ar0n3unmJ32thZHmzR_g/exec';
indexHtml = indexHtml.replace(/var GAS_API_URL = '.*?';/, 'var GAS_API_URL = \'' + GAS_API_URL + '\';');

// 1. standalone_ftxar.html の出力
const outPath = path.join(ROOT_DIR, 'standalone_ftxar.html');
fs.writeFileSync(outPath, indexHtml, 'utf8');
console.log('SUCCESS: Generated standalone_ftxar.html (' + (indexHtml.length / 1024).toFixed(1) + ' KB)');

// 2. GitHub Pages 用 docs/index.html の出力
const docsDir = path.join(ROOT_DIR, 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
const docsIndexPath = path.join(docsDir, 'index.html');
fs.writeFileSync(docsIndexPath, indexHtml, 'utf8');
console.log('SUCCESS: Generated docs/index.html for GitHub Pages (' + (indexHtml.length / 1024).toFixed(1) + ' KB)');

