const { newCleanTab, disposeContext, connect } = require("./cdp");
(async () => {
  const h = await newCleanTab("about:blank");
  const tab = await connect(h.id);
  const steps = {
    goto:      () => tab.goto("https://complipilot.dev/redeem"),
    waitCode:  () => tab.waitFor("document.querySelector('#redeem-code')", 30000),
    waitHydr:  () => tab.waitFor("(function(){var e=document.querySelector('#redeem-code');return e&&Object.keys(e).some(function(k){return k.indexOf('__reactFiber')===0;});})()", 40000, 400),
    text:      () => tab.text(),
    typeEmail: () => tab.typeInto("#redeem-email", "a@b.com"),
    typeCode:  () => tab.typeInto("#redeem-code", "ZZZZ-0000-0000-0000"),
    confirm:   () => tab.eval(`(() => { const c = document.querySelector('#redeem-confirm'); if (c && !c.checked) c.click(); return true; })()`),
    submit:    () => tab.eval(`(() => { const b = document.querySelector('form button[type=submit]'); if (b) b.click(); return !!b; })()`),
    native:    () => tab.nativeValidationMessages(),
    white:     () => tab.eval("document.body.innerText.trim().length < 60"),
    shown:     () => tab.eval(`(() => { const t = document.body.innerText; const keys = ['Invalid','not found','already','expired','error','required','Please']; for (const k of keys) { const i = t.indexOf(k); if (i !== -1) return t.slice(i, i+110); } return null; })()`),
  };
  for (const [name, fn] of Object.entries(steps)) {
    try { const v = await fn(); console.log(`OK   ${name.padEnd(10)} -> ${String(JSON.stringify(v)).slice(0,90)}`); }
    catch (e) { console.log(`🔴 ${name.padEnd(10)} -> ${e.message}`); }
  }
  tab.close(); await disposeContext(h);
})();
