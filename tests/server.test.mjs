import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createDemoServer, publicFiles } from '../server.mjs';

let server, port;
before(async () => {
  server = createDemoServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  port = server.address().port;
});
after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
function get(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves each explicit browser asset and the dashboard entrypoint', async () => {
  for (const file of publicFiles) {
    const response = await get(`/${file}`);
    assert.equal(response.status, 200, file);
    assert.ok(response.body.length, file);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
  }
  const index = await get('/');
  assert.match(index.body, /Open-source dashboard demo/);
  assert.match(index.body, /proprietary/);
  assert.match(index.headers['content-security-policy'], /connect-src 'none'/);
  assert.match(index.headers['content-security-policy'], /frame-ancestors 'none'/);
  const js = await get('/src/app.mjs');
  assert.match(js.headers['content-type'], /javascript/);
});

test('refuses private files, traversal, unknown paths, and API paths', async () => {
  for (const path of ['/server.mjs', '/package.json', '/.env', '/.git/config', '/README.md', '/tests/model.test.mjs', '/scripts/build.mjs', '/../server.mjs', '/%2e%2e/server.mjs', '/src/../server.mjs', '/api/agents', '//server.mjs']) {
    assert.equal((await get(path)).status, 404, path);
  }
});

test('HEAD returns headers without a body, and mutations are rejected', async () => {
  const head = await get('/', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.ok(Number(head.headers['content-length']) > 0);
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await get('/', method);
    assert.equal(response.status, 405);
    assert.equal(response.headers.allow, 'GET, HEAD');
  }
});

test('browser modules do not import backend code or initiate service connections', async () => {
  for (const file of publicFiles.filter(f => f.endsWith('.mjs'))) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\b(?:fetch|WebSocket|EventSource|XMLHttpRequest)\s*\(/, file);
    assert.doesNotMatch(source, /process\.env|node:|@\/lib|localStorage|sessionStorage|document\.cookie/, file);
    for (const [, imported] of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
      assert.ok(['./demo-data.mjs', './model.mjs'].includes(imported), `${file}: unexpected import ${imported}`);
    }
  }
});
