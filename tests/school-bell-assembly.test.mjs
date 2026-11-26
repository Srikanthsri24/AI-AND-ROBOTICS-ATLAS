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
const d=await import(await load(new URL('../src/data/school-bell-assembly.ts',import.meta.url)));
test('assembly chapters and elapsed time map exactly before the wire sequence',()=>{assert.equal(d.schoolBellAssemblySteps.length,10);for(let p=0;p<=9;p+=.125){assert.ok(Math.abs(d.schoolBellAssemblyProgress(d.schoolBellAssemblyElapsed(p))-p)<1e-8);assert.equal(d.schoolBellAssemblyWireCursor(p),p<=8?0:(p-8)*30);}assert.equal(d.schoolBellAssemblyProgress(d.schoolBellAssemblyTotalMs+100),9);assert.throws(()=>d.schoolBellAssemblyProgress(-1));assert.throws(()=>d.schoolBellAssemblyPose('unknown',9));assert.throws(()=>d.schoolBellAssemblyWireCursor(10));});
test('all placement objects appear only in their chapter and finish at their authored base',()=>{assert.equal(new Set(d.schoolBellAssemblyObjects.map(o=>o.id)).size,d.schoolBellAssemblyObjects.length);for(const o of d.schoolBellAssemblyObjects){const before=d.schoolBellAssemblyPose(o.id,Math.max(0,o.start-.01)),start=d.schoolBellAssemblyPose(o.id,o.start),end=d.schoolBellAssemblyPose(o.id,o.end);assert.equal(before.visible,false);assert.equal(start.visible,true);assert.deepEqual(end.offset,[0,0,0]);if(o.start!==o.end){assert.deepEqual(start.offset,o.offset);const half=d.schoolBellAssemblyPose(o.id,(o.start+o.end)/2);assert.ok(half.offset.every((v,n)=>Math.abs(v-o.offset[n]/2)<1e-8));}}});
