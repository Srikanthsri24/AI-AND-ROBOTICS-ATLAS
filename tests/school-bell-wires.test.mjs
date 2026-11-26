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
const d=await import(await load(new URL('../src/data/school-bell-wires.ts',import.meta.url)));
const l=await import(await load(new URL('../src/data/school-bell-workbench-layout.ts',import.meta.url)));
const resistor=await import(await load(new URL('../src/data/school-bell-sounder.ts',import.meta.url)));
test('fifteen distinct jumpers use thirty separate contact locations and describe their actual endpoints',()=>{assert.equal(d.schoolBellWires.length,15);assert.equal(new Set(d.schoolBellWires.map(w=>w.id)).size,15);const ends=d.schoolBellWires.flatMap(w=>[w.from,w.to]);assert.equal(new Set(ends.map(p=>p.join(','))).size,30);for(const [n,w] of d.schoolBellWires.entries()){const route=d.schoolBellWireRoute(n);assert.deepEqual(route[0],d.schoolBellWireExit(w.from,w.fromKind));assert.deepEqual(route.at(-1),d.schoolBellWireExit(w.to,w.toKind));assert.ok(w.what.length>20);assert.ok(w.connection.length>30);assert.ok(route.flat().every(Number.isFinite));}assert.throws(()=>d.schoolBellWireRoute(15));assert.throws(()=>l.schoolBellRtcContact('LED'));assert.throws(()=>l.schoolBellDisplayContact('VIN'));});
test('breadboard strips share only the intended supply, return and I²C nets, with resistor in series',()=>{const parent=new Map(),find=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);},join=(a,b)=>parent.set(find(a),find(b));for(const w of d.schoolBellWires){join(w.fromPort,w.toPort);for(const [p,id] of [[w.from,w.fromPort],[w.to,w.toPort]]){if(Math.abs(p[1]-12)>1e-6)continue;for(let col=0;col<17;col++)for(const bank of [-1,1])for(let row=0;row<5;row++){const q=l.schoolBellBreadboardHole(col,bank,row);if(p.every((v,n)=>Math.abs(v-q[n])<1e-6))join(id,'strip:'+col+':'+bank);}}}
const equal=(a,b)=>assert.equal(find(a),find(b));for(const [source,target] of [['uno.5V','rtc.VIN'],['uno.5V','display.VDD'],['uno.GND-P1','rtc.GND'],['uno.GND-P1','display.GND'],['uno.GND-P1','piezo.return'],['uno.A4','rtc.SDA'],['uno.A4','display.SDA'],['uno.A5','rtc.SCL'],['uno.A5','display.SCL'],['uno.D9','resistor.input.1'],['resistor.output.1','piezo.signal']])equal(source,target);const independent=['uno.5V','uno.GND-P1','uno.A4','uno.A5','uno.D9','resistor.output.1'];assert.equal(new Set(independent.map(find)).size,6);for(const [end,col] of [['from',0],['to',5]]){const p=resistor.schoolBellResistor[end],q=l.schoolBellBreadboardHole(col,1,0);assert.ok([p[0]+35,p[1],p[2]+35].every((v,n)=>Math.abs(v-q[n])<1e-8));}assert.ok(!d.schoolBellWires.some(w=>/rtc\.(BAT|32K|SQW|RST)$/.test(w.toPort)));});
