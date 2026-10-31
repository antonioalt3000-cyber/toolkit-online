/**
 * A fresh, deliberately hostile invoice — not a fixture.
 *
 * Chosen to press the two places ParseFlow has actually broken before:
 *  - totals: a SUBTOTAL that could be mistaken for the total (Aug 15 defect),
 *    with filler words between the label and the number;
 *  - currency: an explicit non-USD ISO code, which is what `currencyDetected`
 *    exists to distinguish from the silent USD fallback.
 * The arithmetic is stated so the invariant sub + tax == total is checkable.
 */
const fs = require("fs");

const LINES = [
  "ACME NORDIC AB",
  "Invoice No   : INV-2026-0913",
  "Invoice Date : 2026-08-27",
  "Bill To      : Contoso Ltd, Dublin, Ireland",
  "",
  "Description                        Qty      Unit        Amount",
  "Consulting retainer, August         1     14000.00     14000.00",
  "On-site workshop (2 days)           2      1750.00      3500.00",
  "Travel recharge                     1       500.00       500.00",
  "",
  "Subtotal (excl. tax) .............. 18000.00 SEK",
  "VAT at the standard rate 25% ......  4500.00 SEK",
  "Total Due, payable on receipt: .... 22500.00 SEK",
  "",
  "Amounts quoted in SEK. Payment within 30 days.",
];

function escape(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

let y = 780;
let content = "BT\n/F1 10 Tf\n";
for (const line of LINES) {
  content += `1 0 0 1 40 ${y} Tm (${escape(line)}) Tj\n`;
  y -= 16;
}
content += "ET\n";

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((o, i) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
});
const xrefAt = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;

const out = __dirname + "/fattura-27ago.pdf";
fs.writeFileSync(out, pdf, "latin1");
console.log(out, fs.statSync(out).size, "bytes");
console.log("atteso: INV-2026-0913 · sub 18000 · IVA 4500 (25%) · totale 22500 · valuta SEK");
