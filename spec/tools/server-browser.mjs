/* Peladen sekecil mungkin untuk uji browser. Ia menyajikan akar repositori agar app/
 * dan /spec/indeks/ berada pada origin yang sama persis seperti artefak rilis. */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const JENIS = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

createServer((req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const jalan = decodeURIComponent(url.pathname === '/' ? '/app/index.html' : url.pathname);
    let berkas = resolve(AKAR, `.${jalan}`);
    if (berkas !== AKAR && !berkas.startsWith(`${AKAR}${sep}`)) throw new Error('di luar akar');
    if (statSync(berkas).isDirectory()) berkas = resolve(berkas, 'index.html');
    res.writeHead(200, {
      'Content-Type': JENIS[extname(berkas)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(berkas).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Tidak ditemukan');
  }
}).listen(4173, '127.0.0.1');
