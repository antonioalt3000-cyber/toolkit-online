const { openIsolated, sleep } = require('./lib.cjs');
(async () => {
  const url = process.argv[2];
  const j = await openIsolated('about:blank');
  await j.goto(url);
  await sleep(3000);
  console.log('title:', await j.eval('document.title'));
  console.log(
    'inputs:',
    JSON.stringify(
      await j.eval(
        "[...document.querySelectorAll('input,button')].map(e=>e.tagName+'#'+e.id+'.'+e.type)"
      )
    )
  );
  console.log('body.len:', await j.eval('document.body.innerText.length'));
  console.log('body:', (await j.text()).slice(0, 300).replace(/\n/g, ' | '));
  console.log(
    'react attached:',
    await j.eval(
      "(()=>{const f=document.querySelector('form'); return f? Object.keys(f).some(k=>k.startsWith('__reactProps')):null})()"
    )
  );
  console.log(JSON.stringify(j.report(), null, 1).slice(0, 1500));
  await j.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
