// Reads intrinsic dimensions of AVIF / WebP / PNG / JPEG without dependencies.
const fs = require('fs');
const path = require('path');

function avif(b) {
  const i = b.indexOf(Buffer.from('ispe'));
  if (i < 0) return null;
  return { w: b.readUInt32BE(i + 4), h: b.readUInt32BE(i + 8) };
}
function webp(b) {
  if (b.slice(0, 4).toString() !== 'RIFF') return null;
  const f = b.slice(12, 16).toString();
  if (f === 'VP8X') return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (f === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (f === 'VP8L') {
    const n = b.readUInt32LE(21);
    return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
  }
  return null;
}
function png(b) {
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function jpeg(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let o = 2;
  while (o < b.length) {
    if (b[o] !== 0xff) { o++; continue; }
    const m = b[o + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
      return { h: b.readUInt16BE(o + 5), w: b.readUInt16BE(o + 7) };
    o += 2 + b.readUInt16BE(o + 2);
  }
  return null;
}

function dims(file) {
  const b = fs.readFileSync(file);
  const e = path.extname(file).toLowerCase();
  try {
    if (e === '.avif') return avif(b);
    if (e === '.webp') return webp(b);
    if (e === '.png') return png(b);
    if (e === '.jpeg' || e === '.jpg') return jpeg(b);
  } catch { return null; }
  return null;
}

const root = process.argv[2];
const out = {};
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else {
      const r = dims(p);
      const rel = path.relative(root, p).replace(/\\/g, '/');
      out[rel] = r;
      console.log(
        (r ? `${String(r.w).padStart(5)}x${String(r.h).toString().padEnd(5)}` : '   ??      ') +
          ' ' + String(fs.statSync(p).size).padStart(7) + 'b  ' + rel
      );
    }
  }
})(root);
fs.writeFileSync(path.join(__dirname, 'image-dims.json'), JSON.stringify(out, null, 2));
