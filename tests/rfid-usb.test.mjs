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
const u=await import(await load(new URL('../src/data/rfid-usb.ts',import.meta.url)));
test('cable endpoint routes follow both plug strain reliefs throughout insertion',()=>{for(let n=0;n<=24;n++){const p=u.rfidUsbPose(n/2,12-n/2);assert.deepEqual(p.points[0],[p.uno[0]-24,p.uno[1],p.uno[2]]);assert.deepEqual(p.points.at(-1),[p.host[0]+24,p.host[1],p.host[2]]);}assert.throws(()=>u.rfidUsbPose(-1));assert.throws(()=>u.rfidUsbPose(0,13));});

test('USB power stays off until both plugs finish seating',()=>{let pose={unoWithdrawal:12,hostWithdrawal:12};assert.equal(u.rfidUsbMated(true,pose),false);pose=u.rfidUsbAdvance(pose,250,0,0);assert.deepEqual(pose,{unoWithdrawal:6,hostWithdrawal:6});assert.equal(u.rfidUsbMated(true,pose),false);pose=u.rfidUsbAdvance(pose,250,0,0);assert.deepEqual(pose,{unoWithdrawal:0,hostWithdrawal:0});assert.equal(u.rfidUsbMated(true,pose),true);assert.equal(u.rfidUsbMated(false,pose),false);assert.throws(()=>u.rfidUsbAdvance(pose,-1,0,0));});
