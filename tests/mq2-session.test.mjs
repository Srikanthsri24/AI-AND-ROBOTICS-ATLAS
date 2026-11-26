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
const m=await import(await load(new URL('../src/data/mq2-session.ts',import.meta.url)));
const ready={...m.mq2SessionDefaults,assembled:true,requestUsb:true};
test('physical USB mating boots at 500 ms, not at the start of the connecting frame',()=>{
 let s=m.mq2SessionAdvance(m.mq2SessionInitial(),ready,499);assert.equal(s.controller.powered,false);
 s=m.mq2SessionAdvance(s,ready,1);assert.equal(s.controller.powered,true);assert.equal(s.controller.controller.iterations,1);assert.equal(s.controller.elapsedMs,0);
 s=m.mq2SessionAdvance(s,ready,99);assert.equal(s.controller.controller.iterations,1);
 s=m.mq2SessionAdvance(s,ready,1);assert.equal(s.controller.controller.iterations,2);
});
test('calibration, 90/65 hysteresis and physical LED output follow the connected circuit',()=>{
 let s=m.mq2SessionAdvance(m.mq2SessionInitial(),ready,1300);s=m.mq2SessionCapture(s);s=m.mq2SessionAdvance(s,ready,100);
 assert.equal(s.controller.controller.baseline,204);assert.equal(s.controller.led,false);
 s=m.mq2SessionAdvance(s,{...ready,dial:300/1024},800);assert.equal(s.controller.led,true);
 s=m.mq2SessionAdvance(s,{...ready,dial:270/1024},800);assert.equal(s.controller.led,true);
 s=m.mq2SessionAdvance(s,{...ready,dial:269/1024},800);assert.equal(s.controller.led,false);
});
test('frame partition, fractional carry, incomplete assembly and rewiring interlocks',()=>{
 const initial=m.mq2SessionInitial();let split=initial;
 for(const dt of [16.5,33.25,150.25,300,100,900])split=m.mq2SessionAdvance(split,ready,dt);
 assert.deepEqual(split,m.mq2SessionAdvance(initial,ready,1500));
 assert.equal(m.mq2CanRewire(initial,{...ready,requestUsb:false}),true);assert.equal(m.mq2CanRewire(initial,ready),false);
 assert.equal(m.mq2CanRewire(initial,{...ready,requestUsb:false,supply:true}),false);
 const incomplete=m.mq2SessionAdvance(initial,{...ready,assembled:false},2000);assert.equal(incomplete.controller.powered,false);assert.equal(incomplete.controller.controller.iterations,0);
 const off=m.mq2SessionAdvance(split,{...ready,requestUsb:false},500);assert.equal(off.controller.powered,false);assert.equal(off.controller.controller.baseline,null);assert.equal(m.mq2CanRewire(off,{...ready,requestUsb:false}),true);
});
test('sensor mode reads the divider; an unpowered module cannot produce invented readings',()=>{
 const sensor={...ready,mode:'sensor',supply:true,moduleOutputV:3};let s=m.mq2SessionAdvance(m.mq2SessionInitial(),sensor,1000);
 assert.equal(s.controller.controller.rows.at(-1).reading,307);assert.equal(m.mq2SessionReading(s,sensor).voltage,1.5);
 s=m.mq2SessionAdvance(s,{...sensor,supply:false},100);assert.equal(s.controller.led,null);assert.equal(s.controller.controllerKnown,false);
 assert.throws(()=>m.mq2SessionAdvance(s,sensor,-1));
});
test('physical sketch reset keeps USB seated and restores a known window after module power-up',()=>{
 const sensor={...ready,mode:'sensor',supply:false,moduleOutputV:2};
 let s=m.mq2SessionAdvance(m.mq2SessionInitial(),sensor,600);assert.equal(s.controller.controllerKnown,false);
 const on={...sensor,supply:true};s=m.mq2SessionAdvance(s,on,100);assert.equal(s.controller.led,null);
 const before=s.usb;s=m.mq2SessionRestart(s,on);assert.deepEqual(s.usb,before);assert.equal(s.controller.controllerKnown,true);assert.equal(s.controller.controller.baseline,null);assert.equal(s.controller.controller.iterations,1);
 s=m.mq2SessionAdvance(s,on,700);s=m.mq2SessionCapture(s);s=m.mq2SessionAdvance(s,on,100);assert.equal(s.controller.controller.baseline,204);assert.equal(s.controller.led,false);
 const off=m.mq2SessionRestart(m.mq2SessionInitial(),on);assert.equal(off.controller.powered,false);
});
