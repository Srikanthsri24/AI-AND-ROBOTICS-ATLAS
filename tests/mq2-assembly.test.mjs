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
const m=await import(await load(new URL('../src/data/mq2-assembly.ts',import.meta.url)));
test('assembly timeline reaches exact chapter boundaries and finishes at ready',()=>{
 let elapsed=0;assert.equal(m.mq2AssemblyProgress(0),0);
 for(const [n,duration]of m.mq2AssemblyDurations.entries()){assert.equal(m.mq2AssemblyProgress(elapsed),n);elapsed+=duration;assert.equal(m.mq2AssemblyProgress(elapsed),n+1);}
 assert.equal(elapsed,m.mq2AssemblyTotalMs);assert.equal(m.mq2AssemblyProgress(elapsed+9999),13);assert.throws(()=>m.mq2AssemblyProgress(-1));
});
test('every moving assembly group lowers into its seated position without moving after completion',()=>{
 for(const id of m.mq2AssemblyGroups){const ready=m.mq2AssemblyPose(id,13);assert.equal(ready.visible,true);assert.equal(ready.lift,0);for(let p=0;p<=13;p+=.25){const pose=m.mq2AssemblyPose(id,p);assert.ok(pose.lift>=0&&Number.isFinite(pose.lift));}}
 assert.throws(()=>m.mq2AssemblyPose('unknown',0));assert.throws(()=>m.mq2AssemblyPose(m.mq2AssemblyGroups[0],14));
});
test('wiring completes before host-first USB fitting; each of 22 actions has its own narration',()=>{
 assert.equal(m.mq2AssemblyWireCursor(10),0);assert.equal(m.mq2AssemblyWireCursor(11.5),11);assert.equal(m.mq2AssemblyWireCursor(12),22);
 assert.deepEqual(m.mq2AssemblyUsb(12),{hostWithdrawal:12,unoWithdrawal:12});assert.deepEqual(m.mq2AssemblyUsb(12.5),{hostWithdrawal:0,unoWithdrawal:12});assert.deepEqual(m.mq2AssemblyUsb(13),{hostWithdrawal:0,unoWithdrawal:0});
 for(const mode of ['dial','sensor'])for(let action=0;action<22;action++){const text=m.mq2FittingNarration(mode,action);assert.ok(text.id.startsWith('mq2-wire-'));assert.ok(text.instruction.length>80);assert.ok(text.title.length>5);}
 assert.equal(m.mq2FittingNarration('dial',22).id,'');assert.throws(()=>m.mq2FittingNarration('dial',23));
});
