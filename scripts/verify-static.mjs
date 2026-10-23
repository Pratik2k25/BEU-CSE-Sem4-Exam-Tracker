import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (p) => readFileSync(resolve(p), 'utf8');
const manifest = JSON.parse(read('manifest.webmanifest'));
const html = read('index.html');
const sw = read('sw.js');

const assert = (condition, message) => {
  if (!condition) {
    console.error('FAIL:', message);
    process.exitCode = 1;
  } else {
    console.log('PASS:', message);
  }
};

assert(manifest.name === 'BEU Exam Prep', 'manifest has the application name');
assert(manifest.display === 'standalone', 'manifest requests standalone display');
assert(manifest.start_url === './', 'manifest start URL is relative for GitHub Pages subpaths');
assert(manifest.scope === './', 'manifest scope is relative for GitHub Pages subpaths');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 1, 'manifest defines app icons');
assert(html.includes('./styles.css'), 'HTML loads CSS using a relative URL');
assert(html.includes('./data.js') && html.includes('./app.js'), 'HTML loads app scripts using relative URLs');
assert(html.includes('./manifest.webmanifest'), 'HTML loads manifest using a relative URL');
for (const path of ['assets/logo.svg', 'assets/favicon.svg', 'assets/app-icon.svg', 'index.html', 'styles.css', 'app.js', 'data.js', 'manifest.webmanifest', 'sw.js']) {
  assert(existsSync(resolve(path)), 'required file exists: ' + path);
}
assert(sw.includes("new URL('./index.html', self.registration.scope)") || sw.includes("new URL('./', self.registration.scope)"), 'service worker builds shell URLs from registration scope');
