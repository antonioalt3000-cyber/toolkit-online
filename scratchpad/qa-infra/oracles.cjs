// Independent oracles for the 26 Oct QA round. Nothing here imports product
// code: every expected value is recomputed from first principles (WCAG maths,
// HMAC, PNG/PDF binary headers, public DNS, raw HTML) so a product bug cannot
// hide behind a test that shares its logic.
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ---------- WCAG 2.x contrast ----------
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function relLuminance([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a, b) {
  const la = relLuminance(typeof a === 'string' ? hexToRgb(a) : a);
  const lb = relLuminance(typeof b === 'string' ? hexToRgb(b) : b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ---------- binary formats ----------
function pngDims(buf) {
  if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function jpegDims(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3)
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}
function pdfInfo(buf) {
  const s = buf.toString('latin1');
  if (!s.startsWith('%PDF-')) return null;
  const pages = (s.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  const mb = s.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
  const size = mb ? { w: Number(mb[3]) - Number(mb[1]), h: Number(mb[4]) - Number(mb[2]) } : null;
  // A4 = 595.28 x 841.89 pt, Letter = 612 x 792 pt
  const format = size
    ? Math.abs(size.w - 595.28) < 2 && Math.abs(size.h - 841.89) < 2
      ? 'A4'
      : Math.abs(size.w - 612) < 2 && Math.abs(size.h - 792) < 2
        ? 'Letter'
        : `${size.w}x${size.h}`
    : null;
  return { version: s.slice(5, 8), pages, size, format, bytes: buf.length };
}

// ---------- crypto ----------
const hmacHex = (secret, payload) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');
const hmacB64 = (secret, payload) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64');
function stripeSigHeader(secret, payload, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${hmacHex(secret, `${t}.${payload}`)}`;
}

// ---------- network (independent fetches) ----------
function rawGet(url, { headers = {}, method = 'GET', maxBytes = 3_000_000 } = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.request(
      url,
      { method, headers: { 'user-agent': 'Mozilla/5.0 (QA oracle)', ...headers }, timeout: 20000 },
      (res) => {
        const chunks = [];
        let n = 0;
        res.on('data', (c) => {
          n += c.length;
          if (n <= maxBytes) chunks.push(c);
        });
        res.on('end', () =>
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) })
        );
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}
async function doh(name, type) {
  const r = await rawGet(
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`
  );
  const j = JSON.parse(r.body.toString());
  return { status: j.Status, answers: (j.Answer || []).map((a) => a.data) };
}
async function emailDns(domain) {
  const [mx, txt, dmarc] = await Promise.all([
    doh(domain, 'MX'),
    doh(domain, 'TXT'),
    doh(`_dmarc.${domain}`, 'TXT'),
  ]);
  return {
    nxdomain: mx.status === 3,
    mx: mx.answers,
    spf: txt.answers.some((t) => /v=spf1/i.test(t)),
    dmarc: dmarc.answers.some((t) => /v=DMARC1/i.test(t)),
  };
}

// ---------- SEO (raw HTML, no product code) ----------
function seoParse(html) {
  const attr = (tag, a) => {
    const m = tag.match(new RegExp(`${a}\\s*=\\s*["']([^"']*)["']`, 'i'));
    return m ? m[1] : null;
  };
  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  const metaBy = (key, val) => metas.find((m) => (attr(m, key) || '').toLowerCase() === val);
  const desc = metaBy('name', 'description');
  const links = html.match(/<link\b[^>]*>/gi) || [];
  const canonical = links.find((l) => (attr(l, 'rel') || '').toLowerCase() === 'canonical');
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const title = titleM ? titleM[1].replace(/\s+/g, ' ').trim() : null;
  const description = desc ? attr(desc, 'content') : null;
  return {
    title,
    titleLength: title ? title.length : 0,
    description,
    descriptionLength: description ? description.length : 0,
    h1Count: (html.match(/<h1\b/gi) || []).length,
    canonical: canonical ? attr(canonical, 'href') : null,
    viewport: !!metaBy('name', 'viewport'),
    ogTitle: metaBy('property', 'og:title')
      ? attr(metaBy('property', 'og:title'), 'content')
      : null,
    ogImage: metaBy('property', 'og:image')
      ? attr(metaBy('property', 'og:image'), 'content')
      : null,
    images: imgs.length,
    imagesMissingAlt: imgs.filter((i) => !/\balt\s*=/i.test(i)).length,
    lang: (html.match(/<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i) || [])[1] || null,
  };
}

// ---------- invoice PDF with known totals ----------
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
function invoiceTotals(items, vatRatePct) {
  const subtotal = round2(items.reduce((s, it) => s + round2(it.qty * it.unit), 0));
  const tax = round2((subtotal * vatRatePct) / 100);
  return { subtotal, tax, total: round2(subtotal + tax) };
}
/** Writes a minimal but valid single-page PDF (Helvetica text, correct xref). */
function writeTextPdf(lines, outPath) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  let y = 800;
  const content = ['BT', '/F1 11 Tf']
    .concat(
      lines.map((l) => {
        const o = `1 0 0 1 50 ${y} Tm (${esc(l)}) Tj`;
        y -= 18;
        return o;
      })
    )
    .concat(['ET'])
    .join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out, 'latin1'));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  fs.writeFileSync(outPath, Buffer.from(out, 'latin1'));
  return outPath;
}
function makeInvoicePdf(spec, outPath) {
  const t = invoiceTotals(spec.items, spec.vatRate);
  const money = (x) => x.toFixed(2);
  const lines = [
    spec.seller,
    `VAT ID: ${spec.sellerVat}`,
    '',
    'INVOICE',
    `Invoice Number: ${spec.number}`,
    `Invoice Date: ${spec.date}`,
    `Due Date: ${spec.due}`,
    '',
    `Bill To: ${spec.buyer}`,
    '',
    'Description            Qty    Unit Price    Amount',
    ...spec.items.map(
      (it) =>
        `${it.desc.padEnd(22)} ${String(it.qty).padStart(3)}    ${money(it.unit).padStart(10)}    ${money(round2(it.qty * it.unit)).padStart(10)}`
    ),
    '',
    `Subtotal: ${spec.currency} ${money(t.subtotal)}`,
    `VAT (${spec.vatRate}%): ${spec.currency} ${money(t.tax)}`,
    `Total: ${spec.currency} ${money(t.total)}`,
  ];
  writeTextPdf(lines, outPath);
  return { ...t, number: spec.number, date: spec.date, currency: spec.currency };
}

module.exports = {
  hexToRgb,
  relLuminance,
  contrastRatio,
  pngDims,
  jpegDims,
  pdfInfo,
  hmacHex,
  hmacB64,
  stripeSigHeader,
  rawGet,
  doh,
  emailDns,
  seoParse,
  round2,
  invoiceTotals,
  writeTextPdf,
  makeInvoicePdf,
};
