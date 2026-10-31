import WebSocket from 'ws';
const TAB=process.argv[2], URL_=process.argv[3];
const ws=new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`,{perMessageDeflate:false});
let id=0;const pending=new Map();
function send(m,p={}){return new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(new Error('timeout '+m));}},60000);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.on('message',d=>{const m=JSON.parse(d.toString());if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}});
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error('EVAL:'+JSON.stringify(r.exceptionDetails).slice(0,250));return r.result.value;}
ws.on('open',async()=>{try{
 await send('Page.enable');await send('Runtime.enable');
 const errs=[];
 ws.on('message',d=>{const m=JSON.parse(d.toString());
   if(m.method==='Runtime.exceptionThrown')errs.push('EXC:'+String(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text).slice(0,180));
   if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push('CONS:'+(m.params.args||[]).map(a=>a.value||a.description||'').join(' ').slice(0,180));});
 await send('Page.navigate',{url:'about:blank'});await sleep(900);
 await send('Page.navigate',{url:URL_});await sleep(9000);
 const info=await ev(`(() => {
   var radios=document.querySelectorAll('input[type=radio]').length;
   var sels=document.querySelectorAll('select').length;
   var btns=Array.from(document.querySelectorAll('button')).map(function(b){return (b.innerText||'').trim().slice(0,28);}).filter(Boolean);
   return {radios:radios, selects:sels, nBtns:btns.length, btns:btns.slice(0,30)};
 })()`);
 console.log('STRUTTURA:',JSON.stringify(info));
 // clicca la PRIMA opzione di ogni gruppo: bottoni che non sono azioni note
 const clicked=await ev(`(() => {
   var skip=/Get Risk Classification|View Results|Reset|Menu|Close|Accept|Sign|Log|Pricing|Docs|Home|Dashboard|Start|Contact|Book|Buy|Try|Learn/i;
   var opts=Array.from(document.querySelectorAll('button')).filter(function(b){var t=(b.innerText||'').trim();return t && !skip.test(t) && b.offsetParent!==null;});
   // raggruppa per contenitore padre: clicca il primo bottone di ogni gruppo
   var seen=new Set(), n=0;
   opts.forEach(function(b){var k=b.parentElement; if(!seen.has(k)){seen.add(k); b.click(); n++;}});
   return {gruppi:seen.size, click:n};
 })()`);
 await sleep(2000);
 const st=await ev(`(() => {
   var b=Array.from(document.querySelectorAll('button')).find(function(e){return /Get Risk Classification|View Results/i.test(e.innerText||'');});
   if(!b) return null; b.scrollIntoView({block:'center'}); var r=b.getBoundingClientRect();
   return {disabled:b.disabled, x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width)};
 })()`);
 console.log('CLICK_OPZIONI:',JSON.stringify(clicked));
 console.log('SUBMIT_STATO:',JSON.stringify(st));
 if(st && !st.disabled && st.w>0){
   await ev('window.__b=document.body.innerText.length');
   await send('Input.dispatchMouseEvent',{type:'mousePressed',x:st.x,y:st.y,button:'left',clickCount:1});await sleep(70);
   await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:st.x,y:st.y,button:'left',clickCount:1});
   await sleep(4000);
   const a=await ev('({d:document.body.innerText.length-window.__b, tail:document.body.innerText.slice(-600)})');
   console.log('DELTA:',a.d);
   console.log('RISULTATO:',a.tail.replace(/\n+/g,' | ').slice(0,550));
 }
 console.log('ERRORI_JS:',errs.length?errs.slice(0,5).join(' || '):'NESSUNO');
 ws.close();process.exit(0);
}catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
