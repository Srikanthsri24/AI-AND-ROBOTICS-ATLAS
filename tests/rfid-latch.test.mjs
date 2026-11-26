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
const l=await import(await load(new URL('../src/data/rfid-latch.ts',import.meta.url)));
test('locked tab overlaps the strike; released tab clears it with positive margin',()=>{const locked=l.rfidLatchPose(35),released=l.rfidLatchPose(105);assert.equal(locked.clear,false);assert.ok(locked.minX<71);assert.equal(released.clear,true);assert.ok(released.minX>71.5);assert.equal(l.rfidLatch.tabBack-l.rfidLatch.strikeFront,1);});
test('command and actual angle remain separate during powered travel',()=>{assert.equal(l.rfidLatchAdvance(35,105,100,false),35);assert.equal(l.rfidLatchAdvance(35,105,100,true),44);assert.equal(l.rfidLatchAdvance(35,105,1000,true),105);assert.equal(l.rfidLatchAdvance(105,35,1000,true),35);let angle=35;for(let n=0;n<100;n++)angle=l.rfidLatchAdvance(angle,105,10,true);assert.equal(angle,105);assert.throws(()=>l.rfidLatchPose(106));assert.throws(()=>l.rfidLatchAdvance(35,105,-1,true));});
