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


# 1. a row whose columns collapsed onto single spaces: the decimal comma anchors each figure; arithmetic proves the split
rep(r"const ROW_NUM = String.raw`[-\u2212]?(?:\d{1,3}(?:[ \u00A0\u202F]\d{3}){1,6}(?:[.,]\d{1,2})?|[\d.,]+)`;",
    r"""const ROW_NUM = String.raw`[-\u2212]?(?:\d{1,3}(?:[ \u00A0\u202F]\d{3}){1,6}(?:[.,]\d{1,2})?|[\d.,]+)`;
// The text layer the extractor really receives has the column gaps collapsed onto single spaces
// ("Deplacement 1 1 234,56 1 234,56"), and there a space between thousands cannot be told from a
// column gap by SHAPE. So a row of this kind is read only when it ends in two figures that each carry
// a decimal comma (the anchor) AND quantity x unit price = amount to the cent (the proof): a wrong
// split fails the identity and the row is left out instead of returned with invented figures.
const SPACED_EU_FIGURE = String.raw`[-\u2212]?\d{1,3}(?:[ \u00A0\u202F]\d{3}){0,6},\d{2}`;
const SPACED_EU_ROW = new RegExp(
  String.raw`^(.+?)\s+(\d+)\s+(${SPACED_EU_FIGURE})\s*(?:EUR|€|CHF)?\s+(${SPACED_EU_FIGURE})\s*(?:EUR|€|CHF)?$`
);""")

# 2. the loop: remember whether a pattern matched, and only then fall back to the spaced EU row
rep(r"""    for (const pattern of LINE_ITEM_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (match.length === 3) {""",
    r"""    let matched = false;
    for (const pattern of LINE_ITEM_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        matched = true;
        if (match.length === 3) {""")

rep(r"""            amount: parseNumber(match[4]),
          });
        }
        break;
      }
    }
  }

  return items;""",
    r"""            amount: parseNumber(match[4]),
          });
        }
        break;
      }
    }
    if (!matched) {
      const spaced = line.match(SPACED_EU_ROW);
      if (spaced) {
        const quantity = parseInt(spaced[2]);
        const unitPrice = parseNumber(spaced[3]);
        const amount = parseNumber(spaced[4]);
        if (Math.abs(Math.round(quantity * unitPrice * 100) - Math.round(amount * 100)) <= 1) {
          pushItem({ description: spaced[1].trim(), quantity, unitPrice, amount });
        }
      }
    }
  }

  return items;""")

if crlf:
    s = s.replace('\n', '\r\n')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched; changed =', s != orig)
