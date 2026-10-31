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
   if(m.method==='Runtime.exceptionThrown')errs.push('EXC:'+String((m.params.exceptionDetails.exception||{}).description||m.params.exceptionDetails.text).slice(0,200));
   if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push('CONS:'+(m.params.args||[]).map(a=>a.value||a.description||'').join(' ').slice(0,200));});
 await send('Page.navigate',{url:'about:blank'});await sleep(900);
 await send('Page.navigate',{url:URL_});await sleep(9000);
 const groups=await ev(`(() => { var s=new Set(); document.querySelectorAll('input[type=radio]').forEach(function(r){s.add(r.name||'(senza-name)');}); return {gruppi:s.size, nomi:Array.from(s).slice(0,15), radios:document.querySelectorAll('input[type=radio]').length}; })()`);
 console.log('GRUPPI_RADIO:',JSON.stringify(groups));
 // clicca il label/parent cliccabile del primo radio di ogni gruppo (React ascolta onChange sul label)
 const filled=await ev(`(() => {
   var byName={}; document.querySelectorAll('input[type=radio]').forEach(function(r){ (byName[r.name]=byName[r.name]||[]).push(r); });
   var n=0;
   Object.keys(byName).forEach(function(k){ var r=byName[k][0];
     var lab=r.closest('label')|| (r.id?document.querySelector('label[for="'+r.id+'"]'):null) || r.parentElement;
     if(lab && lab.click) lab.click(); else r.click();
     n++; });
   return {gruppi_compilati:n, checked:document.querySelectorAll('input[type=radio]:checked').length};
 })()`);
 await sleep(2500);
 const st=await ev(`(() => { var b=Array.from(document.querySelectorAll('button')).find(function(e){return /Get Risk Classification|View Results/i.test(e.innerText||'');});
   if(!b) return null; b.scrollIntoView({block:'center'}); var r=b.getBoundingClientRect();
   return {disabled:b.disabled,x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),w:Math.round(r.width),checked:document.querySelectorAll('input[type=radio]:checked').length}; })()`);
 console.log('DOPO_COMPILAZIONE:',JSON.stringify(filled),'| SUBMIT:',JSON.stringify(st));
 if(st && !st.disabled && st.w>0){
   await ev('window.__b=document.body.innerText.length');
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:st.x,y:st.y,button:'none'});await sleep(100);
   await send('Input.dispatchMouseEvent',{type:'mousePressed',x:st.x,y:st.y,button:'left',clickCount:1});await sleep(80);
   await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:st.x,y:st.y,button:'left',clickCount:1});
   await sleep(4500);
   const a=await ev('({d:document.body.innerText.length-window.__b, tail:document.body.innerText.slice(-700)})');
   console.log('DELTA_TESTO:',a.d);
   console.log('ESITO:',a.tail.replace(/\n+/g,' | ').slice(0,600));
 } else console.log('SUBMIT ANCORA DISABILITATO O NON RENDERIZZATO');
 console.log('ERRORI_JS:',errs.length?errs.slice(0,5).join(' || '):'NESSUNO');
 ws.close();process.exit(0);
}catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
