import WebSocket from 'ws'; import fs from 'fs';
const TAB=process.argv[2], URL_=process.argv[3], OUT=process.argv[4];
const ws=new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`,{perMessageDeflate:false});
let id=0;const pending=new Map();
function send(m,p={}){return new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(new Error('timeout '+m));}},70000);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.on('message',d=>{const m=JSON.parse(d.toString());if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}});
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error('EVAL:'+JSON.stringify(r.exceptionDetails).slice(0,220));return r.result.value;}
async function rclick(x,y){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});await sleep(90);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await sleep(70);
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});await sleep(500);}
ws.on('open',async()=>{try{
 await send('Page.enable');await send('Runtime.enable');
 const errs=[];
 ws.on('message',d=>{const m=JSON.parse(d.toString());
   if(m.method==='Runtime.exceptionThrown')errs.push('EXC:'+String((m.params.exceptionDetails.exception||{}).description||m.params.exceptionDetails.text).slice(0,220));
   if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errs.push('CONS:'+(m.params.args||[]).map(a=>a.value||a.description||'').join(' ').slice(0,220));});
 await send('Page.navigate',{url:URL_});await sleep(14000);
 const names=await ev(`(() => { var s=[]; document.querySelectorAll('input[type=radio]').forEach(function(r){ if(s.indexOf(r.name)<0) s.push(r.name); }); return s; })()`);
 console.log('DOMANDE:',JSON.stringify(names));
 for (const nm of names){
   const pos=await ev(`(() => { var r=document.querySelector('input[type=radio][name="${nm}"]'); if(!r) return null;
     var t=r.closest('label')||r.parentElement; t.scrollIntoView({block:'center'}); var b=(t||r).getBoundingClientRect();
     return {x:Math.round(b.x+Math.min(60,b.width/2)), y:Math.round(b.y+b.height/2), w:Math.round(b.width)}; })()`);
   await sleep(600);
   const pos2=await ev(`(() => { var r=document.querySelector('input[type=radio][name="${nm}"]'); var t=r.closest('label')||r.parentElement; var b=t.getBoundingClientRect(); return {x:Math.round(b.x+Math.min(60,b.width/2)), y:Math.round(b.y+b.height/2)}; })()`);
   if(pos2) await rclick(pos2.x,pos2.y);
 }
 await sleep(1500);
 const prog=await ev(`(() => { var t=document.body.innerText; var m=t.match(/(\d+)% complete/); return {pct:m?m[1]:'?', checked:document.querySelectorAll('input[type=radio]:checked').length}; })()`);
 console.log('PROGRESSO:',JSON.stringify(prog));
 const st=await ev(`(() => { var b=Array.from(document.querySelectorAll('button')).find(function(e){return /Get Risk Classification|View Results/i.test(e.innerText||'');});
   if(!b) return null; b.scrollIntoView({block:'center'}); var r=b.getBoundingClientRect(); return {disabled:b.disabled,x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),w:Math.round(r.width)}; })()`);
 await sleep(700);
 console.log('SUBMIT:',JSON.stringify(st));
 if(st && !st.disabled && st.w>0){
   const st2=await ev(`(() => { var b=Array.from(document.querySelectorAll('button')).find(function(e){return /Get Risk Classification|View Results/i.test(e.innerText||'');}); var r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}; })()`);
   await rclick(st2.x,st2.y); await sleep(4000);
 }
 const sh=await send('Page.captureScreenshot',{format:'png'});
 fs.writeFileSync(OUT,Buffer.from(sh.data,'base64'));
 console.log('ERRORI_JS:',errs.length?errs.slice(0,5).join(' || '):'NESSUNO');
 console.log('SCREENSHOT ->',OUT);
 ws.close();process.exit(0);
}catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
