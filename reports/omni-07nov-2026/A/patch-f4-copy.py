import io

base = r'C:\Users\ftass\business-fast4-documint'


def edit(rel, old, new):
    p = base + '\\' + rel
    s = io.open(p, encoding='utf-8', newline='').read()
    crlf = '\r\n' in s
    t = s.replace('\r\n', '\n')
    assert old in t, 'missing in ' + rel + ': ' + old[:60]
    t = t.replace(old, new, 1)
    io.open(p, 'w', encoding='utf-8', newline='').write(t.replace('\n', '\r\n') if crlf else t)
    print('edited', rel)


# the outcome is true (verified with a real two-page invoice); the mechanism named in the sentence does not exist
edit(r'app\blog\automate-invoice-processing\page.tsx',
     'continuation tables are handled by tracking page boundaries and merging line items across pages.',
     'continuation tables are read as one document, so line items from every page land in one array.')

# a measurement nobody can point to
edit(r'app\changelog\page.tsx',
     '"Better extraction accuracy for invoice numbers, line items, and tax amounts. Reduced extraction errors by 30% on multi-page invoices.",',
     '"Better extraction accuracy for invoice numbers, line items, and tax amounts.",')
