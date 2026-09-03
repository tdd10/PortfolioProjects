import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, css, script, manifest, security] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../script.js', import.meta.url), 'utf8'),
  readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'),
  readFile(new URL('../docs/SECURITY.md', import.meta.url), 'utf8')
]);

assert.match(html, /<main id="main"/);
assert.match(html, /aria-label="Primary navigation"/);
assert.match(html, /<dialog id="action-dialog"/);
for (const module of ['calendar','tasks','grocery','meals','goals','journal','documents','finance','portfolio']) {
  assert.match(html, new RegExp(`data-view="${module}"`), `${module} must be reachable`);
  assert.match(script, new RegExp(`${module}:\\{`), `${module} must have a module definition`);
}
assert.match(css, /@media\(max-width:760px\)/);
assert.equal(JSON.parse(manifest).display, 'standalone');
assert.match(security, /Break-glass requires/);
assert.match(script, /escapeHtml/);
console.log('Smoke checks passed: module reachability, PWA, accessibility, responsive CSS, and security documentation.');
