import io
p = 'f3-local.cjs'
src = io.open(p, encoding='utf-8').read()
src = src.replace("local-journey-A1.json", "local-journey-A2.json")
src = src.replace("qa26-f3-", "qa07-f3-")
src = src.replace(
    "const gen = await K.admin('/api/admin/generate-coupons', { prefix: 'QAT', count: 1 });\n  const code = gen.json && (gen.json.codes?.[0] || gen.json.coupons?.[0]);",
    "const gen = await K.admin('/api/admin/generate-coupons', { prefix: 'QAT', count: 1, internal: true });\n  const code = gen.json && (gen.json.sample?.[0] || gen.json.codes?.[0] || gen.json.coupons?.[0]);",
)
a = src.index("  // 7. dunning on a merchant")
b = src.index("  // 8. Redis outage")
new7 = io.open('section7.js', encoding='utf-8').read()
src = src[:a] + new7 + src[b:]
a = src.index("  // 9. GDPR export")
b = src.index("  console.log('cookie present during outage:'")
new9 = io.open('section9.js', encoding='utf-8').read()
src = src[:a] + new9 + src[b:]
io.open(p, 'w', encoding='utf-8').write(src)
print('patched')
