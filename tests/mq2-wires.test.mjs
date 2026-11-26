import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
  if(cache.has(url.href))return cache.get(url.href);
  if(url.pathname.endsWith('.json'))return 'data:text/javascript;base64,'+Buffer.from('export default '+await readFile(url,'utf8')).toString('base64');
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(new URL(match[1]+(match[1].endsWith('.json')?'':'.ts'),url))+"'");
  const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
const m=await import(await load(new URL('../src/data/mq2-wires.ts',import.meta.url)));
const layout=await import(await load(new URL('../src/data/mq2-workbench-layout.ts',import.meta.url)));
const key=p=>p.join(',');
test('mode changes only the single A0 jumper destination and leaves DOUT open',()=>{
 const dial=m.mq2Wires('dial'),sensor=m.mq2Wires('sensor');assert.equal(dial.length,11);assert.equal(new Set(dial.map(w=>w.id)).size,11);
 for(let i=0;i<dial.length;i++){assert.deepEqual(dial[i].from,sensor[i].from);if(i)assert.deepEqual(dial[i],sensor[i]);}
 assert.deepEqual(dial[0].to,layout.mq2Hole(14,1,0));assert.deepEqual(sensor[0].to,layout.mq2Hole(5,-1,4));
 assert.equal(dial.filter(w=>key(w.from)===key(layout.mq2UnoContact('A0'))).length,1);
 assert.ok(!sensor.some(w=>key(w.from)===key(m.mq2ModulePin('DOUT'))));
});
test('no jumpers or component leads share a physical breadboard hole',()=>{
 for(const mode of ['dial','sensor']){
 const occupied=new Set();const add=p=>{const k=key(p);assert.ok(!occupied.has(k),'Occupied physical contact '+k);occupied.add(k);};
 for(const r of layout.mq2Resistors){add(r.from);add(r.to);}
 for(const p of Object.values(layout.mq2LedPins))add(p);for(const p of layout.mq2DialPins)add(p);
 for(const w of m.mq2Wires(mode)){add(w.to);if(w.from[0]>-25&&w.from[0]<25)add(w.from);}
 }
});
test('jacket routes terminate at the assigned connector exits with finite geometry',()=>{
 for(const mode of ['dial','sensor'])m.mq2Wires(mode).forEach((w,i)=>{
 const path=m.mq2WireRoute(w,i);assert.equal(path.length,6);assert.ok(path.flat().every(Number.isFinite));
 assert.deepEqual(path.at(-1),w.toKind==='clamp'?[w.to[0],w.to[1],w.to[2]+10.7]:[w.to[0],w.to[1]+7.5,w.to[2]]);
 assert.deepEqual(path[0],w.fromKind==='female'?[w.from[0]+7,w.from[1],w.from[2]]:w.fromKind==='clamp'?[w.from[0],w.from[1],w.from[2]+10.7]:[w.from[0],w.from[1]+7.5,w.from[2]]);
 });
});

test('22 fitting actions seat each end on its own axis and keep seated routes unchanged',()=>{
 for(const mode of ['dial','sensor'])m.mq2Wires(mode).forEach((w,n)=>{
  const order=m.mq2FittingOrder.indexOf(n),aMax=n===10?12:8,bMax=n===8||n===9?12:8;
  const start=m.mq2WireSeating(n,order*2),middle=m.mq2WireSeating(n,order*2+1),end=m.mq2WireSeating(n,order*2+2);
  assert.deepEqual(start,{visible:true,a:aMax,b:bMax,seated:false});assert.equal(middle.a,0);assert.equal(middle.b,bMax);assert.equal(end.seated,true);
  const seated=m.mq2WireRoute(w,n),moving=m.mq2WireRoute(w,n,start.a,start.b);
  assert.deepEqual(moving[1],seated[1]);assert.deepEqual(moving[4],seated[4]);assert.deepEqual(moving[2],seated[2]);assert.deepEqual(moving[3],seated[3]);
  assert.deepEqual(m.mq2WireRoute(w,n,end.a,end.b),seated);
  for(const [point,kind,max]of [[0,w.fromKind,aMax],[5,w.toKind??'pin',bMax]]){
   const delta=moving[point].map((v,i)=>v-seated[point][i]);assert.deepEqual(delta,kind==='female'?[max,0,0]:kind==='clamp'?[0,0,max]:[0,max,0]);
  }
 });
 assert.throws(()=>m.mq2WireSeating(11,22));assert.throws(()=>m.mq2WireSeating(0,23));
 assert.throws(()=>m.mq2WireRoute(m.mq2Wires('dial')[0],0,-1,0));
});
