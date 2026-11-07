import io

p = r'C:\Users\ftass\business-fast4-documint\lib\extractor.ts'
s = io.open(p, encoding='utf-8', newline='').read()
crlf = '\r\n' in s
if crlf:
    s = s.replace('\r\n', '\n')
orig = s


def rep(old, new, count=1):
    global s
    assert old in s, 'missing: ' + old[:80]
    s = s.replace(old, new, count)


# 1. signed number token for the single-space fallback (pdf-parse collapses columns), and a TABULAR figure token
rep(r"const NUM_TOKEN = String.raw`\d[\d.,]*`;",
    r"""const NUM_TOKEN = String.raw`[-\u2212]?\d[\d.,]*`;
// A figure on a TABULAR row (columns separated by two or more spaces, so a single space inside a
// figure cannot be a column gap): an optional minus, then either a figure whose thousands are
// separated by a space ("1 200,00", the norm in FR/PL/SE/NO/CZ) or the digits/dots/commas the row
// patterns always took. The group repeat is bounded for the same reason as EU_AMOUNT.
const ROW_NUM = String.raw`[-\u2212]?(?:\d{1,3}(?:[ \u00A0\u202F]\d{3}){1,6}(?:[.,]\d{1,2})?|[\d.,]+)`;""")

# 2. the tabular patterns use ROW_NUM; the collapsed single-space original accepts a sign
rep(r"  /^(.+?)\s{2,}(\d+)\s*(?:hrs?|hours?|uds?|pcs?|stk)?\s{1,}([\d.,]+)\s*(?:EUR|€|CHF|USD|\$)?\s{1,}([\d.,]+)\s*(?:EUR|€|CHF|USD|\$)?$/,",
    r"  new RegExp(String.raw`^(.+?)\s{2,}(\d+)\s*(?:hrs?|hours?|uds?|pcs?|stk)?\s{1,}(${ROW_NUM})\s*(?:EUR|€|CHF|USD|\$)?\s{1,}(${ROW_NUM})\s*(?:EUR|€|CHF|USD|\$)?$`),")
rep(r"  /^(.+?)\s{2,}(\d+)\s{2,}[$€£]?([\d,.]+)\s{2,}[$€£]?([\d,.]+)$/,",
    r"  new RegExp(String.raw`^(.+?)\s{2,}(\d+)\s{2,}[$€£]?(${ROW_NUM})\s{2,}[$€£]?(${ROW_NUM})$`),")
rep(r"  /^(.+?)\s+(\d+)\s+[$€£]?([\d,.]+)\s+[$€£]?([\d,.]+)$/,",
    r"  /^(.+?)\s+(\d+)\s+[$€£]?([-\u2212]?[\d,.]+)\s+[$€£]?([-\u2212]?[\d,.]+)$/,")
rep(r"  /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s/]+?)\s{2,}(\d+)\s{2,}([\d.,]+)\s*(?:EUR|€|CHF|USD|\$)?\s{1,}([\d.,]+)\s*(?:EUR|€|CHF|USD|\$)?$/,",
    r"  new RegExp(String.raw`^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s/]+?)\s{2,}(\d+)\s{2,}(${ROW_NUM})\s*(?:EUR|€|CHF|USD|\$)?\s{1,}(${ROW_NUM})\s*(?:EUR|€|CHF|USD|\$)?$`),")

# 3. parseNumber: sign, spaces, and a decimal comma that is unambiguous on its own
rep(r"""  function parseNumber(str: string): number {
    if (isEuFormat && str.includes(',')) {
      // EU: 5.400,00 → remove dots, comma becomes period
      return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    }
    // US: 5,400.00 → remove commas
    return parseFloat(str.replace(/,/g, ''));
  }""",
    r"""  function parseNumber(str: string): number {
    const negative = /^[-\u2212]/.test(str);
    // a space / NBSP inside a figure is a thousands separator ("1 200,00")
    const body = str.replace(/^[-\u2212]/, '').replace(/[ \u00A0\u202F]/g, '');
    // A comma followed by one or two digits at the end is a DECIMAL comma in any locale (a US
    // thousands comma is always followed by three), so it is read as one even when no figure in
    // the document is large enough to carry a dot-grouped thousands part and trip the detector.
    const decimalComma = body.includes(',') && (isEuFormat || /,\d{1,2}$/.test(body));
    const value = decimalComma
      ? // EU: 5.400,00 → remove dots, comma becomes period
        parseFloat(body.replace(/\./g, '').replace(',', '.'))
      : // US: 5,400.00 → remove commas
        parseFloat(body.replace(/,/g, ''));
    return negative ? -value : value;
  }""")

# 4. pushItem: a credit note's rows are negative
rep(r"""  // not purely numeric-punctuation) plus a finite, non-negative amount.""",
    r"""  // not purely numeric-punctuation) plus a finite, non-zero amount (negative on a credit note).""")
rep("const amountOk = Number.isFinite(item.amount) && item.amount > 0;",
    "const amountOk = Number.isFinite(item.amount) && item.amount !== 0;")

if crlf:
    s = s.replace('\n', '\r\n')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched; changed =', s != orig)
