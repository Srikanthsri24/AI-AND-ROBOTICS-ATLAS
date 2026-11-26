import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
async function load(url) {
 let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)]) code=code.replace(match[0],`from '${await load(new URL(match[1]+'.ts',url))}'`);
 return 'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
}
const w=await import(await load(new URL('../src/data/street-system-workshop.ts',import.meta.url)));
const powered={...w.streetSystemDefaults,usb:true};
test('three-lamp system keeps both twilight histories and exact sketch boundaries',()=>{
 for(const prior of [false,true]) for(const raw of [329,330,331,469,470,471]) {
  const s=w.streetSystemAdvance({...w.streetSystemInitial(),command:prior},0,{...powered,ambient:(raw-180)/6.4});
  assert.equal(s.command,raw<=330||(raw<470&&prior));
  assert.deepEqual(w.streetSystemLamps(s,powered),[s.command,s.command,s.command]);
  assert.equal(w.streetSystemSerial(s.rows[0]),`A0 = ${raw} | LAMPS ${s.command?'ON':'OFF'}`);
 }
});
test('sampling is partition independent and old rows remain immutable',()=>{
 const settings={...powered,ambient:0};const initial=w.streetSystemInitial();
 const whole=w.streetSystemAdvance(initial,1050,settings);
 let split=initial;for(let n=0;n<21;n++)split=w.streetSystemAdvance(split,50,settings);
 assert.deepEqual(split,whole);assert.equal(whole.rows.length,11);assert.equal(whole.untilSampleMs,50);assert.equal(initial.rows.length,0);assert.ok(Object.isFrozen(whole.rows[0]));
});
test('each broken output or return affects only its lamp while sketch remains on',()=>{
 const s=w.streetSystemAdvance(w.streetSystemInitial(),0,{...powered,ambient:0});
 for(let index=0;index<3;index++)for(const field of ['outputs','returns']){
  const flags=[true,true,true];flags[index]=false;const settings={...powered,[field]:flags};
  assert.equal(s.command,true);assert.deepEqual(w.streetSystemLamps(s,settings),[0,1,2].map(i=>i!==index));
 }
});
test('USB reset clears firmware history; floating input is explicitly unknown',()=>{
 const s=w.streetSystemAdvance(w.streetSystemInitial(),100,{...powered,ambient:0});
 const floating=w.streetSystemAdvance(s,100,{...powered,sensorConnected:false});assert.equal(floating.raw,null);assert.deepEqual(w.streetSystemLamps(floating,{...powered,sensorConnected:false}),[null,null,null]);
 const off=w.streetSystemAdvance(s,50,w.streetSystemDefaults);assert.equal(off.command,false);assert.equal(off.raw,null);assert.deepEqual(off.rows,[]);
 assert.equal(w.streetSystemAdvance(off,0,powered).command,false);
});
test('shade lowers divider reading and invalid controls are rejected',()=>{
 assert.equal(w.streetSystemRaw(100,0),820);assert.equal(w.streetSystemRaw(100,100),180);
 assert.equal(w.streetSystemRaw(0,0),180);assert.throws(()=>w.streetSystemRaw(NaN,0));assert.throws(()=>w.streetSystemRaw(101,0));assert.throws(()=>w.streetSystemAdvance(w.streetSystemInitial(),-1,powered));
});
