# -*- coding: utf-8 -*-
import io, sys
NL = chr(10)
pagina = 'C:/Users/ftass/business-fast4-documint/app/templates/page.tsx'
lib = 'C:/Users/ftass/business-fast4-documint/lib/template-gallery.ts'

g = io.open(pagina, 'rb').read().decode('utf-8'); crlf = '\r\n' in g
s = g.replace('\r\n', NL)

i = s.find('type GalleryEntry = {')
j = s.find(NL + '];', s.find('const GALLERY: GalleryEntry[] = ['))
if i == -1 or j == -1: sys.exit("estremi del blocco non trovati")
blocco = s[i:j + 3]

intestazione = '''import { DOCUMENT_SCHEMAS } from "@/lib/response-schema";

/**
 * The parsing-template gallery rendered by /templates.
 *
 * It lives here, and not inside the page, so a test can exercise the SAME data
 * the customer copies. Half of this page has already been wrong once: the
 * predefined entries used to list hand-typed field names the API never emitted,
 * and whoever copied them wrote code reading `undefined`. Those are now derived
 * from DOCUMENT_SCHEMAS by campiDi(); the custom recipes below are hand-written
 * regexes and keywords, and nothing checked that the product's own validator
 * even accepts them until lib/template-gallery.test.ts did.
 */
'''

blocco_lib = intestazione + (
    blocco
    .replace('type GalleryEntry = {', 'export type GalleryEntry = {', 1)
    .replace('const GALLERY: GalleryEntry[] = [', 'export const GALLERY: GalleryEntry[] = [', 1)
)
io.open(lib, 'wb').write((blocco_lib.replace(NL, '\r\n') if crlf else blocco_lib).encode('utf-8'))

# La pagina ora importa invece di definire.
resto = s[:i] + s[j + 3:]
vecchio_import = 'import { DOCUMENT_SCHEMAS } from "@/lib/response-schema";'
if resto.count(vecchio_import) != 1: sys.exit("import DOCUMENT_SCHEMAS non unico")
resto = resto.replace(vecchio_import, 'import { GALLERY } from "@/lib/template-gallery";', 1)
resto = resto.replace(NL * 3, NL * 2)
io.open(pagina, 'wb').write((resto.replace(NL, '\r\n') if crlf else resto).encode('utf-8'))
print("galleria spostata: lib %d byte, pagina %d -> %d byte" % (len(blocco_lib), len(g), len(resto)))
