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
const w=await import(await load(new URL('../src/data/rfid-wires.ts',import.meta.url)));
const l=await import(await load(new URL('../src/data/rfid-workbench-layout.ts',import.meta.url)));
const leds=await import(await load(new URL('../src/data/rfid-indicators.ts',import.meta.url)));
test('all ten jumpers use distinct physical contacts, including the fully occupied common strip',()=>{assert.equal(w.rfidWires.length,10);const endpoints=w.rfidWires.flatMap(w=>[w.from,w.to]).map(p=>p.join(','));assert.equal(new Set(endpoints).size,endpoints.length);const common=w.rfidWires.flatMap(w=>[w.fromPort,w.toPort]).filter(p=>p.startsWith('common.'));assert.deepEqual(common.sort(),['common.0','common.1','common.2','common.3','common.4']);for(const p of w.rfidWires.filter(w=>w.net==='servo-5V'))assert.ok(!p.fromPort.startsWith('shield.')&&!p.toPort.startsWith('shield.'));});
test('physical five-hole contact graph shares grounds but isolates positive supply and signal paths',()=>{const parent=new Map(),key=p=>p.map(n=>n.toFixed(5)).join(','),find=a=>{if(!parent.has(a))parent.set(a,a);if(parent.get(a)!==a)parent.set(a,find(parent.get(a)));return parent.get(a);},join=(a,b)=>parent.set(find(key(a)),find(key(b)));for(let c=0;c<17;c++)for(const bank of [-1,1])for(let r=1;r<5;r++)join(l.rfidBreadboardHole(c,bank,0),l.rfidBreadboardHole(c,bank,r));for(const wire of w.rfidWires)join(wire.from,wire.to);const at=port=>{const wire=w.rfidWires.find(w=>w.fromPort===port||w.toPort===port);return wire.fromPort===port?wire.from:wire.to;},connected=(a,b)=>find(key(at(a)))===find(key(at(b)));for(const port of ['red-cathode.4','green-cathode.4','servo.GND','supply.negative'])assert.ok(connected('shield.GND',port));assert.ok(connected('supply.positive','servo.VCC'));assert.ok(!connected('servo.VCC','shield.GND'));assert.ok(!connected('shield.D6','shield.D7'));assert.ok(!connected('shield.D9','servo.VCC'));for(const c of leds.rfidIndicators){const wire=w.rfidWires.find(w=>w.fromPort==='shield.'+c.pin);assert.equal(find(key(wire.to)),find(key(c.resistor.from)));assert.equal(find(key(c.resistor.to)),find(key(c.anode)));assert.notEqual(find(key(c.resistor.from)),find(key(c.anode)));}});
