#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const envPath = path.join(__dirname, '..', '.env.local');

function getEnvContent() {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    return '# .env.local (this file will be created when you save)\n# Add your keys here in KEY=VALUE format\n';
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const content = getEnvContent();
    const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Edit .env.local</title></head>
<body>
  <h1>Edit .env.local</h1>
  <form method="post" action="/save">
    <p>Do not commit secrets to Git. This writes ` + envPath + ` in the project root.</p>
    <textarea name="content" rows="20" cols="80">${escapeHtml(content)}</textarea>
    <br/><button type="submit">Save to .env.local</button>
  </form>
  <p><small>Started by running: node scripts/env-server.cjs</small></p>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      try {
        const params = new URLSearchParams(body);
        const content = params.get('content') || '';
        fs.writeFileSync(envPath, content, { encoding: 'utf8', mode: 0o600 });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<p>Saved .env.local</p><a href="/">Back</a>');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error writing file: ' + err.message);
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Env editor running at http://localhost:${PORT}/`));
