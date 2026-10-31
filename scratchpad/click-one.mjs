import WebSocket from 'ws'; import fs from 'fs';
const TAB=process.argv[2], URL_=process.argv[3], X=+process.argv[4], Y=+process.argv[5], OUT=process.argv[6];
const ws=new WebSocket(`ws://localhost:9223/devtools/page/${TAB}`,{perMessageDeflate:false});
let id=0;const pending=new Map();
function send(m,p={}){return new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(new Error('timeout '+m));}},70000);});}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
ws.on('message',d=>{const m=JSON.parse(d.toString());if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result);}});
ws.on('open',async()=>{try{
 await send('Page.enable');
 if(URL_!=='-'){await send('Page.navigate',{url:URL_});await sleep(14000);}
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:X,y:Y,button:'none'});await sleep(120);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:X,y:Y,button:'left',clickCount:1});await sleep(90);
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:X,y:Y,button:'left',clickCount:1});
 await sleep(2500);
 const sh=await send('Page.captureScreenshot',{format:'png'});
 fs.writeFileSync(OUT,Buffer.from(sh.data,'base64'));
 console.log('click',X,Y,'->',OUT);
 ws.close();process.exit(0);
}catch(e){console.error('ERR:',e.message);ws.close();process.exit(1);}});
ws.on('error',e=>{console.error('WS ERR:',e.message);process.exit(1);});
