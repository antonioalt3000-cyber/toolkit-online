# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
base = io.open('C:/Users/ftass/business-fast4-documint/app/api/user/export/route.test.ts', encoding='utf-8').read()

VARIANTI = [
 dict(dest='C:/Users/ftass/business-7-capture-api/src/app/api/user/export/route.test.ts',
      dominio='captureapi.dev', servizio='captureapi', contatto='hello@',
      mock=('vi.mock("@/lib/api-store", () => ({'+NL+
            '  getApiKey: async (key: string) => (key === "cap_live_valid" ? h.state.keyRecord : null),'+NL+
            '}));'),
      keyrec='keyRecord: null as { email?: string } | null,',
      setup='h.state.keyRecord = { email: "owner@example.com" };',
      vuoto='h.state.keyRecord = {};',
      chiave='cap_live_valid', chiave_altra='cap_live_altro'),
 dict(dest='C:/Users/ftass/business-fast2-accessiscan/src/app/api/user/export/route.test.ts',
      dominio='fixmyweb.dev', servizio='fixmyweb', contatto='contact@',
      mock=('vi.mock("@/lib/auth", () => ({'+NL+
            '  getSession: async () => h.state.session,'+NL+
            '}));'),
      keyrec='session: null as { email?: string } | null,',
      setup='h.state.session = { email: "owner@example.com" };',
      vuoto='h.state.session = {};',
      chiave=None, chiave_altra=None),
]

for v in VARIANTI:
    s = base
    s = s.replace('parseflow.dev', v['dominio']).replace('"parseflow"', '"%s"' % v['servizio'])
    s = s.replace('hello@', v['contatto'])
    # blocco dei mock di autenticazione
    vecchio_mock = ('vi.mock("@/lib/api-keys", () => ({'+NL+
                    '  validateApiKey: async (key: string) => (key === "dm_live_valid" ? h.state.keyRecord : null),'+NL+
                    '}));'+NL+NL+
                    'vi.mock("@/lib/user-store", () => ({'+NL+
                    '  getUserRecord: async () => h.state.userRecord,'+NL+
                    '}));')
    if vecchio_mock not in s: sys.exit("blocco mock non trovato per " + v['dominio'])
    s = s.replace(vecchio_mock, v['mock'], 1)
    s = s.replace('    keyRecord: null as { userId: string } | null,'+NL+'    userRecord: null as { email?: string } | null,',
                  '    ' + v['keyrec'], 1)
    s = s.replace('  h.state.keyRecord = { userId: "user-1" };'+NL+'  h.state.userRecord = { email: "owner@example.com" };',
                  '  ' + v['setup'], 1)
    s = s.replace('    h.state.userRecord = {};', '    ' + v['vuoto'], 1)
    if v['chiave']:
        s = s.replace('dm_live_valid', v['chiave']).replace('dm_live_altro', v['chiave_altra'])
    else:
        # F2 usa una sessione: nessun header di chiave
        s = s.replace('const conChiave = { "x-api-key": "dm_live_valid" };',
                      '// La sessione arriva dal cookie: il doppio di getSession decide chi sia il chiamante.'+NL+
                      'const conChiave = {};', 1)
        s = s.replace('''  it("senza credenziali risponde 401 e non notifica nessuno", async () => {
    const res = await POST(richiesta({ email: "owner@example.com" }));''',
                      '''  it("senza credenziali risponde 401 e non notifica nessuno", async () => {
    h.state.session = null;
    const res = await POST(richiesta({ email: "owner@example.com" }));''', 1)
        s = s.replace('''  it("con una chiave revocata o inesistente risponde 401", async () => {
    const res = await POST(richiesta({ email: "owner@example.com" }, { "x-api-key": "dm_live_altro" }));''',
                      '''  it("con una sessione scaduta risponde 401", async () => {
    h.state.session = null;
    const res = await POST(richiesta({ email: "owner@example.com" }, conChiave));''', 1)
    io.open(v['dest'], 'wb').write(s.encode('utf-8'))
    print("scritto %s (%d byte)" % (v['dest'].split('/')[3], len(s)))
