import WebSocket from 'ws';
const TAB = process.argv[2], URL_ = process.argv[3];
const ws = new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`, { perMessageDeflate: false });
let id=0; const pending=new Map();
function send(m,p={}){return new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(new Error('timeout '+m));}},60000);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.on('message',d=>{const m=JSON.parse(d.toString());if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}});
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error('EVAL:'+JSON.stringify(r.exceptionDetails).slice(0,200));return r.result.value;}
async function click(x,y){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});await sleep(100);await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await sleep(70);await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});}
ws.on('open',async()=>{
 try{
  await send('Page.enable');await send('Runtime.enable');await send('Log.enable').catch(()=>{});
  const errs=[]; 
  ws.on('message',d=>{const m=JSON.parse(d.toString());
    if(m.method==='Runtime.exceptionThrown') errs.push('EXC: '+JSON.stringify(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text).slice(0,200));
    if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error') errs.push('CONSOLE_ERR: '+(m.params.args||[]).map(a=>a.value||a.description||'').join(' ').slice(0,200));});
  await send('Page.navigate',{url:'about:blank'});await sleep(1000);
  await send('Page.navigate',{url:URL_});await sleep(9000);
  // seleziona la prima opzione di ogni domanda (radio/button) poi cerca il submit
  const picked = await ev(`(() => {
    var n=0;
    document.querySelectorAll('input[type=radio]').forEach(function(r,i){ if(!r.checked){ var name=r.name; if(!document.querySelector('input[name="'+name+'"]:checked')){ r.click(); n++; } } });
    if(n===0){ var btns=Array.from(document.querySelectorAll('button')).filter(function(b){var t=(b.innerText||'').trim(); return t && t.length<30 && !/submit|invia|calcola|next|avanti/i.test(t);}); btns.slice(0,12).forEach(function(b){b.click();n++;}); }
    return n;
  })()`);
  await sleep(1500);
  const sub = await ev(`(() => {
    var b=Array.from(document.querySelectorAll('button,input[type=submit]')).find(function(e){return /Get Risk Classification|View Results|submit|invia|calcola/i.test(e.innerText||e.value||'');});
    if(!b) return null; var r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,t:(b.innerText||b.value||'').slice(0,40),disabled:b.disabled};
  })()`);
  console.log('OPZIONI_SELEZIONATE:',picked);
  console.log('BOTTONE_SUBMIT:',JSON.stringify(sub));
  if(sub && !sub.disabled){ await ev('window.__before=document.body.innerText.length'); await click(sub.x,sub.y); await sleep(4000);
    const after = await ev('({len:document.body.innerText.length, before:window.__before, tail:document.body.innerText.slice(-700)})');
    console.log('DELTA_TESTO:', after.len - after.before);
    console.log('CODA_PAGINA:', after.tail.replace(/\n+/g,' | ').slice(0,600));
  } else { console.log('SUBMIT NON CLICCABILE'); }
  console.log('ERRORI_JS:', errs.length? errs.slice(0,6).join(' || ') : 'NESSUNO');
  ws.close();process.exit(0);
 }catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}
});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
