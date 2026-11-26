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
const m=await import(await load(new URL('../src/data/mq2-circuit.ts',import.meta.url)));
const base={usb:true,commonGround:true,mode:'sensor',dialPosition:.5,sensorSupply:true,moduleOutputV:5,upperOhms:10000,lowerOhms:10000,dialConnected:false,dividerConnected:true};
test('equal divider halves the module signal; ideal ADC uses 1024 bins',()=>{
  const r=m.mq2Circuit(base);assert.equal(r.voltage,2.5);assert.equal(r.adc,512);
  assert.equal(m.mq2Circuit({...base,moduleOutputV:2}).adc,204);
  assert.equal(m.mq2Circuit({...base,mode:'dial',dialConnected:true,dividerConnected:false,dialPosition:1}).adc,1023);
});
test('physical missing / conflicting connections and unsafe voltage stay unknown',()=>{
  for(const patch of [{usb:false},{commonGround:false},{sensorSupply:false},{dividerConnected:false},{dialConnected:true},{upperOhms:0},{lowerOhms:Infinity},{moduleOutputV:NaN},{moduleOutputV:11}]){
    const r=m.mq2Circuit({...base,...patch});assert.equal(r.valid,false);assert.equal(r.adc,null);assert.equal(r.voltage,null);assert.ok(r.reason.length>10);
  }
});
test('dial mode ignores unpowered sensor and its voltage, but requires exclusive wiper wiring',()=>{
  const dial={...base,mode:'dial',dialConnected:true,dividerConnected:false,sensorSupply:false,moduleOutputV:NaN,dialPosition:.25};
  assert.equal(m.mq2Circuit(dial).adc,256);
  assert.equal(m.mq2Circuit({...dial,dialPosition:-.1}).valid,false);
  assert.equal(m.mq2Circuit({...dial,dialConnected:false}).valid,false);
});
