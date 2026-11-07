import io

base = r'C:\Users\ftass\business-fast2-accessiscan'


def edit(rel, old, new):
    p = base + '\\' + rel
    s = io.open(p, encoding='utf-8', newline='').read()
    crlf = '\r\n' in s
    t = s.replace('\r\n', '\n')
    assert old in t, 'missing in ' + rel + ': ' + old[:60]
    t = t.replace(old, new, 1)
    io.open(p, 'w', encoding='utf-8', newline='').write(t.replace('\n', '\r\n') if crlf else t)
    print('edited', rel)


edit(r'src\components\CookieConsent.tsx',
     'We use cookies to improve your experience, analyze traffic, and serve relevant ads. You can choose which cookies to accept.',
     'We use cookies to improve your experience and analyze site traffic. You can choose which cookies to accept.')

edit(r'src\app\privacy\page.tsx',
     '<li><strong>Advertising cookies</strong> — Google AdSense for serving relevant advertisements. Only set with your consent.</li>',
     '<li><strong>Advertising</strong> — we show no advertisements and run no ad network. The &quot;Advertising&quot; choice in the cookie banner only sets Google&apos;s consent signals for our analytics tag, and it is off unless you switch it on.</li>')
