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
const m=await import(await load(new URL('../src/data/rain-wires.ts',import.meta.url)));
const board=await import(await load(new URL('../src/data/rain-workbench-layout.ts',import.meta.url)));
const servo=await import(await load(new URL('../src/data/rain-servo-leads.ts',import.meta.url)));
test('circuit powers the sensor from Uno and servo separately; common returns occupy one five-hole strip',()=>{
 const wires=m.rainConnections;assert.equal(wires.length,9);assert.equal(new Set(wires.map(w=>w.id)).size,9);
 assert.deepEqual(wires.find(w=>w.fromPort==='sensor.VCC').to,board.rainUnoContact('5V'));
 assert.ok(!wires.some(w=>w.fromPort==='sensor.NC'||w.toPort==='sensor.NC'));
 const servoPower=wires.filter(w=>w.net==='servo-5V');assert.equal(servoPower.length,2);assert.ok(servoPower.every(w=>!w.fromPort.startsWith('uno.')&&!w.toPort.startsWith('uno.')));
 const returnPins=wires.filter(w=>w.toPort.startsWith('return.')).map(w=>w.to);assert.equal(returnPins.length,3);
 const ports=new Set(wires.flatMap(w=>[w.fromPort,w.toPort]));for(const p of ['return.0','return.1','return.2','return.3','servo.SIG','servo.VCC','servo.GND','uno.D2','uno.D9'])assert.ok(ports.has(p));
});
test('each endpoint occupies a distinct physical hole, socket or terminal',()=>{
 const occupied=new Set();for(const w of m.rainConnections)for(const p of [w.from,w.to]){const key=p.join(',');assert.ok(!occupied.has(key),'Reused actual endpoint '+key);occupied.add(key);}
 assert.deepEqual(m.rainConnections.find(w=>w.toPort==='servo.SIG').to,servo.rainServoSocket(0));
 assert.deepEqual(m.rainConnections.find(w=>w.toPort==='servo.VCC').to,servo.rainServoSocket(1));
 assert.deepEqual(m.rainConnections.find(w=>w.toPort==='servo.GND').to,servo.rainServoSocket(2));
});
test('physical contact graph shares grounds but isolates the two positive supply networks',()=>{
 const parent=new Map(),key=p=>p.join(','),root=p=>{if(!parent.has(p))parent.set(p,p);if(parent.get(p)!==p)parent.set(p,root(parent.get(p)));return parent.get(p);},join=(a,b)=>parent.set(root(a),root(b));
 for(let col=0;col<17;col++)for(const bank of [-1,1])for(let row=1;row<5;row++)join(key(board.rainBreadboardHole(col,bank,0)),key(board.rainBreadboardHole(col,bank,row)));
 const ports=new Map();for(const w of m.rainConnections){join(key(w.from),key(w.to));ports.set(w.fromPort,key(w.from));ports.set(w.toPort,key(w.to));}
 const node=name=>root(ports.get(name));
 assert.equal(node('sensor.VCC'),node('uno.5V'));assert.equal(node('servo.VCC'),node('supply.positive'));assert.notEqual(node('uno.5V'),node('supply.positive'));
 for(const p of ['sensor.GND','servo.GND','supply.negative'])assert.equal(node(p),node('uno.GND'));
 assert.equal(node('sensor.SIG'),node('uno.D2'));assert.equal(node('servo.SIG'),node('uno.D9'));
 for(const signal of ['uno.D2','uno.D9'])for(const power of ['uno.GND','uno.5V','supply.positive'])assert.notEqual(node(signal),node(power));
});
