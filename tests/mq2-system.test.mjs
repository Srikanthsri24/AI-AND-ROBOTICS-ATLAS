import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
  if(cache.has(url.href))return cache.get(url.href);
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(new URL(match[1]+'.ts',url))+"'");
  const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
const m=await import(await load(new URL('../src/data/mq2-system.ts',import.meta.url)));
const input={usb:true,ground:true,signalConnected:true,reading:200};
test('boot samples immediately and frame partition does not change loop boundaries',()=>{
  const initial=m.mq2SystemInitial();
  const whole=m.mq2Advance(initial,input,799);
  let split=initial;for(const dt of [0,16,33,50,100,200,400])split=m.mq2Advance(split,input,dt);
  assert.deepEqual(split,whole);assert.equal(whole.controller.iterations,8);
  assert.equal(whole.nextSampleMs,800);assert.equal(whole.led,false);
});
test('baseline bytes are consumed on the next sample; recapture clears an active LED',()=>{
  let s=m.mq2Advance(m.mq2SystemInitial(),input,750);
  s=m.mq2QueueCommand(s,'b');s=m.mq2Advance(s,input,49);
  assert.equal(s.controller.baseline,null);
  s=m.mq2Advance(s,input,1);assert.equal(s.controller.baseline,200);
  s=m.mq2Advance(s,{...input,reading:300},800);assert.equal(s.led,true);
  s=m.mq2QueueCommand(s,'b');s=m.mq2Advance(s,{...input,reading:300},100);
  assert.equal(s.controller.baseline,300);assert.equal(s.led,false);
});
test('power loss clears RAM and serial; incomplete wiring cannot fabricate clean air',()=>{
  let s=m.mq2Advance(m.mq2SystemInitial(),input,800);
  s=m.mq2QueueCommand(s,'b');s=m.mq2Advance(s,input,100);
  assert.equal(s.controller.baseline,200);
  s=m.mq2Advance(s,{...input,ground:false},1000);
  assert.equal(s.led,null);assert.equal(s.controllerKnown,false);
  s=m.mq2Advance(s,input,0);assert.equal(s.controllerKnown,false);assert.equal(s.led,null);
  s=m.mq2Advance(s,{...input,usb:false},100);
  assert.deepEqual(s,m.mq2SystemInitial());
  const reboot=m.mq2Advance(s,input,0);assert.equal(reboot.controllerKnown,true);assert.equal(reboot.controller.iterations,1);assert.equal(reboot.controller.baseline,null);
  assert.equal(m.mq2QueueCommand(s,'b').pendingCommands,'');
  assert.throws(()=>m.mq2Advance(s,input,-1));
});
