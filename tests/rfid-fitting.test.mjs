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
const f=await import(await load(new URL('../src/data/rfid-fitting.ts',import.meta.url)));
const w=await import(await load(new URL('../src/data/rfid-wires.ts',import.meta.url)));
test('twenty sequential connector stages seat exactly one end per chapter',()=>{for(let chapter=0;chapter<=20;chapter++){const connections=f.rfidFittingConnections(chapter);assert.equal(Object.values(connections).flat().filter(Boolean).length,chapter);for(let n=0;n<10;n++){const p=f.rfidFittingPose(n,chapter);assert.equal(p.visible,chapter>n*2);if(chapter>=n*2+2)assert.deepEqual(p.points,w.rfidWireRoute(n));}}});
test('each actual jacket endpoint follows its own connector during insertion',()=>{for(let n=0;n<10;n++)for(let step=0;step<=20;step++){const pose=f.rfidFittingPose(n,n*2+step/10),route=w.rfidWireRoute(n);for(const [vertex,offset] of [[0,pose.source],[route.length-1,pose.destination]])for(let axis=0;axis<3;axis++)assert.equal(pose.points[vertex][axis],route[vertex][axis]+offset[axis]);}assert.throws(()=>f.rfidFittingPose(0,NaN));assert.throws(()=>f.rfidFittingPose(10,0));});

const instructions=await import(await load(new URL('../src/data/rfid-fitting-instructions.ts',import.meta.url)));
test('every connector chapter has its own exact contact and circuit explanation',()=>{assert.deepEqual(instructions.rfidFittingInstructions.map(i=>i.wireId),w.rfidWires.map(w=>w.id));const contacts=[];for(let chapter=0;chapter<20;chapter++){const i=instructions.rfidFittingChapter(chapter);assert.equal(i.wireId,w.rfidWires[Math.floor(chapter/2)].id);assert.equal(i.completeAt,chapter+1);assert.equal(i.end,chapter%2?'destination':'source');assert.ok(i.why.length>80);assert.ok(i.check.length>60);contacts.push(i.contact);}assert.equal(new Set(contacts).size,20);assert.throws(()=>instructions.rfidFittingChapter(-1));assert.throws(()=>instructions.rfidFittingChapter(20));});
