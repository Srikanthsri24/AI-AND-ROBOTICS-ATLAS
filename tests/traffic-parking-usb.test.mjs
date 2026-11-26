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
const d=await import(await load(new URL('../src/data/traffic-parking-usb.ts',import.meta.url)));
test('USB seats the host before the Uno, and withdraws the Uno before the host',()=>{let m={unoWithdrawal:12,hostWithdrawal:12};m=d.trafficParkingUsbRequestedAdvance(m,250,true);assert.deepEqual(m,{unoWithdrawal:12,hostWithdrawal:6});assert.equal(d.trafficParkingUsbMated(true,m),false);m=d.trafficParkingUsbRequestedAdvance(m,500,true);assert.deepEqual(m,{unoWithdrawal:6,hostWithdrawal:0});m=d.trafficParkingUsbRequestedAdvance(m,250,true);assert.equal(d.trafficParkingUsbMated(true,m),true);assert.equal(d.trafficParkingUsbMated(false,m),false);m=d.trafficParkingUsbRequestedAdvance(m,250,false);assert.deepEqual(m,{unoWithdrawal:6,hostWithdrawal:0});m=d.trafficParkingUsbRequestedAdvance(m,500,false);assert.deepEqual(m,{unoWithdrawal:12,hostWithdrawal:6});m=d.trafficParkingUsbRequestedAdvance(m,250,false);assert.deepEqual(m,{unoWithdrawal:12,hostWithdrawal:12});});
test('USB motion consumes time consistently across frames and handles direction reversal',()=>{const initial={unoWithdrawal:12,hostWithdrawal:12};let m=initial;for(let n=0;n<10;n++)m=d.trafficParkingUsbRequestedAdvance(m,100,true);assert.deepEqual(m,d.trafficParkingUsbRequestedAdvance(initial,1000,true));m=d.trafficParkingUsbRequestedAdvance(m,250,false);assert.deepEqual(d.trafficParkingUsbRequestedAdvance(m,250,true),{unoWithdrawal:0,hostWithdrawal:0});assert.throws(()=>d.trafficParkingUsbRequestedAdvance(initial,NaN,true));assert.throws(()=>d.trafficParkingUsbRequestedAdvance(initial,-1,true));assert.throws(()=>d.trafficParkingUsbRequestedAdvance({unoWithdrawal:13,hostWithdrawal:0},0,true));});
