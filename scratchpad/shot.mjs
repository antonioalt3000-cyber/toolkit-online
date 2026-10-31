import WebSocket from 'ws'; import fs from 'fs';
const TAB=process.argv[2], URL_=process.argv[3], OUT=process.argv[4], WAIT=parseInt(process.argv[5]||'15000',10);
const ws=new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`,{perMessageDeflate:false});
let id=0;const pending=new Map();
function send(m,p={}){return new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(new Error('timeout '+m));}},60000);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.on('message',d=>{const m=JSON.parse(d.toString());if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}});
ws.on('open',async()=>{try{
  await send('Page.enable');
  await send('Page.navigate',{url:URL_});
  await sleep(WAIT);
  const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(OUT, Buffer.from(r.data,'base64'));
  console.log('OK ->',OUT);
  ws.close();process.exit(0);
}catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
