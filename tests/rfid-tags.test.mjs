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
const t=await import(await load(new URL('../src/data/rfid-tags.ts',import.meta.url)));
test('both distinct synthetic tags lift before crossing and present above the antenna',()=>{assert.notDeepEqual(t.rfidClassroomTags.A.uid,t.rfidClassroomTags.B.uid);for(const tag of ['A','B']){const rest=t.rfidTagPose(tag,0),lift=t.rfidTagPose(tag,.25),hover=t.rfidTagPose(tag,.8),read=t.rfidTagPose(tag,1);assert.equal(rest.position[1],4);assert.equal(lift.position[1],28);assert.equal(lift.position[0],rest.position[0]);assert.equal(lift.position[2],rest.position[2]);assert.deepEqual(hover.position,[84,28,-26]);assert.deepEqual(read.position,[84,tag==='A'?10:18,-26]);assert.equal(read.presented,true);}});
test('only fully presented single-tag input is readable in the classroom model',()=>{assert.equal(t.rfidPresentedTag(1,0),'A');assert.equal(t.rfidPresentedTag(0,1),'B');assert.equal(t.rfidPresentedTag(.999,0),null);assert.equal(t.rfidPresentedTag(1,1),null);assert.equal(t.rfidPresentedTag(0,0),null);assert.throws(()=>t.rfidTagPose('A',2));});
