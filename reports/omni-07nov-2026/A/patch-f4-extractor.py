import io

p = r'C:\Users\ftass\business-fast4-documint\lib\extractor.ts'
s = io.open(p, encoding='utf-8', newline='').read()
crlf = '\r\n' in s
if crlf:
    s = s.replace('\r\n', '\n')
orig = s


def rep(old, new, count=1):
    global s
    assert old in s, 'missing: ' + old[:70]
    s = s.replace(old, new, count)


# 1. EU detection also recognises a space / NBSP / narrow NBSP between thousands
rep(r"const EU_NUMBER_FORMAT_RE = /\d{1,3}\.\d{3},\d{2}/;",
    r"const EU_NUMBER_FORMAT_RE = /\d{1,3}[. \u00A0\u202F]\d{3},\d{2}/;")

# 2. helpers before extractAmounts
helpers = r"""/**
 * A European amount: groups of three digits separated by a dot OR a space (the
 * norm in FR/PL/SE/NO/CZ is "2 434,56"), then a decimal comma. Bounded to seven
 * groups on purpose: an open-ended group repeat is only linear while the engine
 * cannot be made to retry it from every start position of a long run of digits,
 * and the line-scoped fallback below is not anchored on the left.
 */
const EU_AMOUNT = '\\d{1,3}(?:[. \\u00A0\\u202F]\\d{3}){0,6},\\d{1,2}';

/** "2 434,56" / "2.434,56" -> 2434.56 */
function euAmountToNumber(raw: string): number {
  return parseFloat(raw.replace(/[^\d,]/g, '').replace(',', '.'));
}

/**
 * -1 when the number that starts at `numberStart` is written with a minus attached
 * to it ("EUR -120.00", ": -145,20"), 1 otherwise. A dash used as a SEPARATOR
 * ("Total - 600.00") has a space after it and is not a sign.
 */
function signBefore(text: string, numberStart: number): 1 | -1 {
  return /(?:^|[\s:€$£])[-\u2212]$/.test(text.slice(Math.max(0, numberStart - 2), numberStart)) ? -1 : 1;
}

function extractAmounts("""
rep("function extractAmounts(", helpers)

# 3. euPatterns number shape
a = s.index("      const euPatterns: { regex: RegExp; euFormat?: boolean }[] = [")
b = s.index("      const usPatterns:")
new_eu = r"""      const euPatterns: { regex: RegExp; euFormat?: boolean }[] = [
        { regex: new RegExp(`${lb}${FILLER}\\s*:?\\s*[$€£¥]?\\s*(${EU_AMOUNT})\\s*(?:EUR|€|CHF)?`, 'i'), euFormat: true },
        { regex: new RegExp(`${lb}\\s*\\d+%\\s*:?\\s*(${EU_AMOUNT})\\s*(?:EUR|€)?`, 'i'), euFormat: true },
        { regex: new RegExp(`${lb}${FILLER}\\s*:?\\s*(${EU_AMOUNT})\\s*(?:EUR|€|CHF)`, 'i'), euFormat: true },
        { regex: new RegExp(`${lb}${FILLER}\\s*:?\\s*(\\d+,\\d{2})\\s*(?:EUR|€|CHF)`, 'i'), euFormat: true },
      ];

"""
s = s[:a] + new_eu + s[b:]

# 4. main match loop: converter + sign
rep(r"""        const match = text.match(regex);
        if (match?.[1]) {
          if (euFormat) {
            return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          }
          return parseFloat(match[1].replace(/,/g, ''));
        }""",
    r"""        const match = text.match(regex);
        if (match?.[1]) {
          const at = (match.index ?? 0) + match[0].lastIndexOf(match[1]);
          const sign = signBefore(text, at);
          if (euFormat) {
            return sign * euAmountToNumber(match[1]);
          }
          return sign * parseFloat(match[1].replace(/,/g, ''));
        }""")

# 5. line-scoped fallback: shape + sign
rep(r"const trailingEu = /(\d{1,3}(?:\.\d{3})*,\d{1,2})(?:[^\S\r\n]{0,8}(?:[$€£¥]|[A-Z]{3}))?[^\S\r\n]{0,8}[.)\]]?[^\S\r\n]{0,8}$/;",
    r"const trailingEu = new RegExp(`(${EU_AMOUNT})(?:[^\\S\\r\\n]{0,8}(?:[$€£¥]|[A-Z]{3}))?[^\\S\\r\\n]{0,8}[.)\\]]?[^\\S\\r\\n]{0,8}$`);")
rep(r"""        const euHit = isEuNumberFormat ? line.match(trailingEu) : null;
        if (euHit?.[1]) return parseFloat(euHit[1].replace(/\./g, '').replace(',', '.'));
        const usHit = line.match(trailingUs);
        if (usHit?.[1]) return parseFloat(usHit[1].replace(/,/g, ''));
        if (!isEuNumberFormat) {
          const euFallback = line.match(trailingEu);
          if (euFallback?.[1]) {
            return parseFloat(euFallback[1].replace(/\./g, '').replace(',', '.'));
          }
        }""",
    r"""        const euHit = isEuNumberFormat ? line.match(trailingEu) : null;
        if (euHit?.[1]) return signBefore(line, euHit.index ?? 0) * euAmountToNumber(euHit[1]);
        const usHit = line.match(trailingUs);
        if (usHit?.[1]) return signBefore(line, usHit.index ?? 0) * parseFloat(usHit[1].replace(/,/g, ''));
        if (!isEuNumberFormat) {
          const euFallback = line.match(trailingEu);
          if (euFallback?.[1]) {
            return signBefore(line, euFallback.index ?? 0) * euAmountToNumber(euFallback[1]);
          }
        }""")

# 6. labels (specific first: the first label that finds a number wins)
rep("const total = extractAmount(['total', 'grand total', 'amount due', 'balance due', 'gesamtbetrag', 'totale', 'montant total']);",
    "// The specific labels come FIRST: the first label that finds a number wins, and a plain `total`\n"
    "  // would read the net off a \"Total HT\" line before \"Total TTC\" was ever tried.\n"
    "  const total = extractAmount(['total ttc', 'totaal', 'total a pagar', 'valor total', 'do zapłaty', 'do zaplaty', 'razem brutto', 'importe total', 'total', 'grand total', 'amount due', 'balance due', 'gesamtbetrag', 'totale', 'montant total']);")
rep("const subtotal = extractAmount(['subtotal', 'sub-total', 'net amount', 'nettobetrag', 'base imponible', 'imponibile']);",
    "const subtotal = extractAmount(['total ht', 'subtotaal', 'razem netto', 'valor sem iva', 'total sem iva', 'subtotal', 'sub-total', 'net amount', 'nettobetrag', 'base imponible', 'imponibile']);")
rep("const tax = extractAmount(['tax', 'vat', 'sales tax', 'gst', 'hst', 'iva', 'mwst', 'tva', 'impuesto', 'steuer', 'imposta']);",
    "const tax = extractAmount(['tax', 'vat', 'sales tax', 'gst', 'hst', 'iva', 'mwst', 'tva', 'btw', 'impuesto', 'steuer', 'imposta']);")

# 7. taxRate keeps working for a credit note
rep("taxRate: amounts.subtotal > 0 ? Math.round((amounts.tax / amounts.subtotal) * 10000) / 100 : 0,",
    "taxRate: amounts.subtotal !== 0 ? Math.round((amounts.tax / amounts.subtotal) * 10000) / 100 : 0,")

# 8. invoice number labels (appended: they only run when the earlier patterns found nothing)
rep(r"""    /number\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
  ]);
  if (invoiceNumber) confidence += 0.1;""",
    r"""    /number\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
    // DE "Rechnungsnummer" / "Rechnungs-Nr.", FR "Facture n°", PT "Fatura n.º", NL "Factuurnummer", PL "Faktura nr".
    /rechnungs?[-\s]*(?:nr|nummer)\.?\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
    /facture\s*(?:n[°ºo.]{0,2}|#|num[ée]ro)?\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
    /fatura\s*(?:n[°ºo.]{0,3}|#|n[úu]mero)?\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
    /factuur\s*(?:nummer|nr\.?|#)?\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
    /faktura(?:\s+vat)?\s*(?:nr|numer|#)\.?\s*:?\s*((?=[A-Z0-9-]*\d)[A-Z0-9-]+)/i,
  ]);
  if (invoiceNumber) confidence += 0.1;""")

if crlf:
    s = s.replace('\n', '\r\n')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched; changed =', s != orig)
