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
const u=await import(await load(new URL('../src/data/rain-usb.ts',import.meta.url)));
const a=await import(await load(new URL('../src/data/rain-assembly.ts',import.meta.url)));
test('USB fitting seats the computer before the controller with an unpowered intermediate pose',()=>{assert.deepEqual(a.rainAssemblyUsb(14),{hostWithdrawal:12,unoWithdrawal:12});assert.deepEqual(a.rainAssemblyUsb(14.5),{hostWithdrawal:0,unoWithdrawal:12});assert.deepEqual(a.rainAssemblyUsb(15),{hostWithdrawal:0,unoWithdrawal:0});assert.equal(u.rainUsbMated(true,a.rainAssemblyUsb(14.5)),false);assert.equal(u.rainUsbMated(true,a.rainAssemblyUsb(15)),true);assert.equal(u.rainUsbMated(false,a.rainAssemblyUsb(15)),false);});
test('cable endpoint routes follow both plug strain reliefs throughout insertion',()=>{for(let n=0;n<=24;n++){const p=u.rainUsbPose(n/2,12-n/2);assert.deepEqual(p.points[0],[p.uno[0]-24,p.uno[1],p.uno[2]]);assert.deepEqual(p.points.at(-1),[p.host[0]+24,p.host[1],p.host[2]]);}assert.throws(()=>u.rainUsbPose(-1));assert.throws(()=>u.rainUsbPose(0,13));});
