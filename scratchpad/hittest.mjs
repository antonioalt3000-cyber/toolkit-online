import WebSocket from 'ws';
const TAB=process.argv[2], URL_=process.argv[3];
const ws=new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`,{perMessageDeflate:false});
let id=0;const p=new Map();
function send(m,par={}){return new Promise((res,rej)=>{const i=++id;p.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:par}));setTimeout(()=>{if(p.has(i)){p.delete(i);rej(new Error('timeout '+m));}},60000);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.on('message',d=>{const m=JSON.parse(d.toString());if(m.id&&p.has(m.id)){const q=p.get(m.id);p.delete(m.id);m.error?q.rej(new Error(JSON.stringify(m.error))):q.res(m.result);}});
async function ev(e){const r=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error('EVAL:'+JSON.stringify(r.exceptionDetails).slice(0,250));return r.result.value;}
ws.on('open',async()=>{try{
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:URL_});await sleep(14000);
 const info=await ev(`(() => {
   const r=document.querySelector('input[type=radio][name="purpose"]');
   if(!r) return {err:'no radio purpose'};
   const b=r.getBoundingClientRect();
   const lab=r.closest('label'); const lb=lab?lab.getBoundingClientRect():null;
   const cx=Math.round(b.x+b.width/2), cy=Math.round(b.y+b.height/2);
   const at=document.elementFromPoint(cx,cy);
   const atLabelMid = lb? document.elementFromPoint(Math.round(lb.x+lb.width/2), Math.round(lb.y+lb.height/2)) : null;
   const cs=getComputedStyle(r);
   return {
     radioRect:{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)},
     labelRect: lb?{x:Math.round(lb.x),y:Math.round(lb.y),w:Math.round(lb.width),h:Math.round(lb.height)}:null,
     radioPointerEvents:cs.pointerEvents, radioVisibility:cs.visibility, radioOpacity:cs.opacity, radioDisplay:cs.display,
     elementAtRadioCenter: at? at.tagName+'.'+String(at.className).slice(0,60) : null,
     elementAtLabelCenter: atLabelMid? atLabelMid.tagName+'.'+String(atLabelMid.className).slice(0,60) : null,
     scrollY: Math.round(window.scrollY),
     hasCookieBanner: !!document.querySelector('[class*=consent],[id*=consent],[class*=cookie]')
   };
 })()`);
 console.log(JSON.stringify(info,null,1));
 ws.close();process.exit(0);
}catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
