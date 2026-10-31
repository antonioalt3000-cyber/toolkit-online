# -*- coding: utf-8 -*-
import io, json, sys
NL = chr(10); QT = chr(34); BS = chr(92)
n = json.loads(io.open('wcag-norma.json', encoding='utf-8').read())
v21, v22 = n["2.1"], n["2.2"]
PRINC = {"1": "Perceivable", "2": "Operable", "3": "Understandable", "4": "Robust"}
key = lambda x: [int(p) for p in x.split('.')]
tutti = sorted(set(v21) | set(v22), key=key)
nuovi = sorted(set(v22) - set(v21), key=key)
righe = []
for c in tutti:
    src = v21.get(c) or v22[c]
    nome = src["nome"]
    if QT in nome or BS in nome:
        sys.exit("nome ostile: " + nome)
    extra = ""
    if c in nuovi:
        extra += ', addedIn: "2.2"'
    if v22.get(c, {}).get("obsoleto"):
        extra += ', obsoleteIn: "2.2"'
    righe.append('  "%s": { name: "%s", level: "%s", principle: "%s"%s },'
                 % (c, nome, src["livello"], PRINC[c[0]], extra))

testa = io.open('blocco-testa.ts', encoding='utf-8').read().rstrip(NL)
coda = io.open('blocco-coda.ts', encoding='utf-8').read().rstrip(NL)
blocco = testa + NL + NL.join(righe) + NL + coda

p = 'C:/Users/ftass/business-fast2-accessiscan/src/lib/constants.ts'
grezzo = io.open(p, 'rb').read().decode('utf-8')
crlf = grezzo.count('\r\n') > 0
s = grezzo.replace('\r\n', NL)

i = s.find('export const WCAG_CRITERIA')
if i == -1: sys.exit("marcatore di inizio assente")
# fine del letterale per bilanciamento di graffe: il blocco termina con "} as const;"
apertura = s.find('{', i)
d = 0; q = apertura
while q < len(s):
    if s[q] == '{': d += 1
    elif s[q] == '}':
        d -= 1
        if d == 0: break
    q += 1
if d != 0: sys.exit("letterale non bilanciato")
resto = s[q + 1:]
if not resto.startswith(' as const;'): sys.exit("atteso ' as const;', trovato: " + repr(resto[:20]))
fine = q + 1 + len(' as const;')

s2 = s[:i] + blocco + s[fine:]
if s2 == s: sys.exit("nessuna differenza prodotta")
uscita = s2.replace(NL, '\r\n') if crlf else s2
io.open(p, 'wb').write(uscita.encode('utf-8'))
print("scritto: %d criteri (%d nuovi in 2.2) | CRLF preservati: %s | file %d -> %d byte"
      % (len(righe), len(nuovi), crlf, len(grezzo), len(uscita)))
