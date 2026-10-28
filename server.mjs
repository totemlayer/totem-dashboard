import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const publicFiles = ['index.html', 'styles.css', 'mark.svg', 'src/app.mjs', 'src/demo-data.mjs', 'src/model.mjs'];
const root = new URL('./', import.meta.url);
const types = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', svg: 'image/svg+xml', mjs: 'text/javascript; charset=utf-8' };
export const contentSecurityPolicy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export function createDemoServer() {
  return createServer(async (request, response) => {
    const headers = { 'Content-Security-Policy': contentSecurityPolicy, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' };
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { ...headers, Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    const path = (request.url || '/').split('?')[0];
    const file = path === '/' ? 'index.html' : path.slice(1);
    if (!path.startsWith('/') || !publicFiles.includes(file)) {
      response.writeHead(404, headers);
      response.end();
      return;
    }
    try {
      const body = await readFile(new URL(file, root));
      response.writeHead(200, { ...headers, 'Content-Type': types[file.split('.').pop()], 'Content-Length': body.length });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(500, headers);
      response.end();
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  const server = createDemoServer();
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Choose a different PORT.` : 'Could not start the demo server.');
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Totem Dashboard demo: http://127.0.0.1:${port}`));
}
