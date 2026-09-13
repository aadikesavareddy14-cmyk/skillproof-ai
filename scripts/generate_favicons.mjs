import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crcVal = crc32(typeAndData);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function makePng(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (width * 4 + 1);
    scanlines[scanlineOffset] = 0; // Filter None
    rgbaBuffer.copy(scanlines, scanlineOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(scanlines, { level: 9 });
  const idat = createChunk('IDAT', deflated);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Draw isometric cube onto RGBA buffer
function pointInPoly(px, py, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function renderCube(size, isAppIcon = false) {
  const buf = Buffer.alloc(size * size * 4);
  const s = size / 100; // coordinate scale

  // Scaled coordinates
  const top = [
    [50 * s, 16 * s],
    [82 * s, 34.5 * s],
    [50 * s, 53 * s],
    [18 * s, 34.5 * s]
  ];
  const left = [
    [18 * s, 34.5 * s],
    [50 * s, 53 * s],
    [50 * s, 84 * s],
    [18 * s, 65.5 * s]
  ];
  const right = [
    [50 * s, 53 * s],
    [82 * s, 34.5 * s],
    [82 * s, 65.5 * s],
    [50 * s, 84 * s]
  ];
  const innerTop = [
    [50 * s, 29 * s],
    [67 * s, 38.8 * s],
    [50 * s, 48.6 * s],
    [33 * s, 38.8 * s]
  ];
  const innerLeft = [
    [33 * s, 38.8 * s],
    [50 * s, 48.6 * s],
    [50 * s, 65.5 * s],
    [33 * s, 55.7 * s]
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // If app icon, dark background
      if (isAppIcon) {
        buf[idx] = 10;     // R
        buf[idx + 1] = 10; // G
        buf[idx + 2] = 11; // B
        buf[idx + 3] = 255;// A
      } else {
        // Transparent background
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }

      // Ambient glow
      const dx = x - 50 * s;
      const dy = y - 50 * s;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glowR = 40 * s;
      if (dist < glowR) {
        const glowFactor = (1 - dist / glowR);
        const glowA = Math.floor(glowFactor * (isAppIcon ? 80 : 50));
        if (glowA > 0) {
          buf[idx] = Math.min(255, buf[idx] + 56);
          buf[idx + 1] = Math.min(255, buf[idx + 1] + 189);
          buf[idx + 2] = 248;
          buf[idx + 3] = Math.max(buf[idx + 3], glowA);
        }
      }

      // Check polygons with anti-aliasing approximation (sub-pixel check 3x3)
      let topCount = 0, leftCount = 0, rightCount = 0, innerTopCount = 0, innerLeftCount = 0;
      for (let sy = 0; sy < 3; sy++) {
        for (let sx = 0; sx < 3; sx++) {
          const px = x + (sx + 0.5) / 3;
          const py = y + (sy + 0.5) / 3;
          if (pointInPoly(px, py, innerTop)) innerTopCount++;
          else if (pointInPoly(px, py, innerLeft)) innerLeftCount++;
          
          if (pointInPoly(px, py, top)) topCount++;
          else if (pointInPoly(px, py, left)) leftCount++;
          else if (pointInPoly(px, py, right)) rightCount++;
        }
      }

      if (topCount > 0) {
        const coverage = topCount / 9;
        // Top Face: Cyan to Light Sky Blue (#38bdf8 to #60a5fa)
        const t = (x / size);
        let r = Math.round(56 * (1 - t) + 96 * t);
        let g = Math.round(189 * (1 - t) + 165 * t);
        let b = Math.round(248 * (1 - t) + 250 * t);
        if (innerTopCount > 0) {
          const itCoverage = innerTopCount / 9;
          r = Math.min(255, Math.round(r + 40 * itCoverage));
          g = Math.min(255, Math.round(g + 40 * itCoverage));
          b = 255;
        }
        buf[idx] = Math.round(buf[idx] * (1 - coverage) + r * coverage);
        buf[idx + 1] = Math.round(buf[idx + 1] * (1 - coverage) + g * coverage);
        buf[idx + 2] = Math.round(buf[idx + 2] * (1 - coverage) + b * coverage);
        buf[idx + 3] = Math.max(buf[idx + 3], Math.round(255 * coverage));
      } else if (leftCount > 0) {
        const coverage = leftCount / 9;
        // Left Face: Vibrant Blue (#3b82f6 to #1d4ed8)
        const t = (y / size);
        let r = Math.round(59 * (1 - t) + 29 * t);
        let g = Math.round(130 * (1 - t) + 78 * t);
        let b = Math.round(246 * (1 - t) + 216 * t);
        if (innerLeftCount > 0) {
          const ilCoverage = innerLeftCount / 9;
          r = Math.min(255, Math.round(r + 30 * ilCoverage));
          g = Math.min(255, Math.round(g + 30 * ilCoverage));
          b = Math.min(255, Math.round(b + 30 * ilCoverage));
        }
        buf[idx] = Math.round(buf[idx] * (1 - coverage) + r * coverage);
        buf[idx + 1] = Math.round(buf[idx + 1] * (1 - coverage) + g * coverage);
        buf[idx + 2] = Math.round(buf[idx + 2] * (1 - coverage) + b * coverage);
        buf[idx + 3] = Math.max(buf[idx + 3], Math.round(255 * coverage));
      } else if (rightCount > 0) {
        const coverage = rightCount / 9;
        // Right Face: Deep Royal Blue / Shadow (#1e40af to #0f172a)
        const t = (y / size);
        const r = Math.round(30 * (1 - t) + 15 * t);
        const g = Math.round(64 * (1 - t) + 23 * t);
        const b = Math.round(175 * (1 - t) + 42 * t);
        buf[idx] = Math.round(buf[idx] * (1 - coverage) + r * coverage);
        buf[idx + 1] = Math.round(buf[idx + 1] * (1 - coverage) + g * coverage);
        buf[idx + 2] = Math.round(buf[idx + 2] * (1 - coverage) + b * coverage);
        buf[idx + 3] = Math.max(buf[idx + 3], Math.round(255 * coverage));
      }
    }
  }

  return makePng(size, size, buf);
}

const pubDir = path.resolve(process.cwd(), 'public');
fs.writeFileSync(path.join(pubDir, 'favicon-32x32.png'), renderCube(32, false));
fs.writeFileSync(path.join(pubDir, 'favicon-16x16.png'), renderCube(16, false));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), renderCube(180, true));

console.log('Favicons generated successfully in public/');
