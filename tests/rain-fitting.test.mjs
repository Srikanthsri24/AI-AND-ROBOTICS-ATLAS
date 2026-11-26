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
const f=await import(await load(new URL('../src/data/rain-fitting.ts',import.meta.url)));
const w=await import(await load(new URL('../src/data/rain-wires.ts',import.meta.url)));
test('completed fitting restores all nine exact seated routes and endpoints',()=>{
 for(let n=0;n<9;n++){const p=f.rainFittingPose(n,18);assert.ok(p.visible);assert.deepEqual(p.source,[0,0,0]);assert.deepEqual(p.destination,[0,0,0]);assert.deepEqual(p.points,w.rainWireRoute(n));}
});
test('Grove harness moves as one unit; other sources fit before their destinations',()=>{
 for(const cursor of [0,.25,.5,.75,1])for(let n=1;n<3;n++)assert.deepEqual(f.rainFittingPose(n,cursor).source,f.rainFittingPose(0,cursor).source);
 for(let n=3;n<9;n++){assert.equal(f.rainFittingPose(n,n*2-.01).visible,false);const mid=f.rainFittingPose(n,n*2+1);assert.deepEqual(mid.source,[0,0,0]);assert.ok(mid.destination.some(v=>Math.abs(v)===16));const done=f.rainFittingPose(n,n*2+2);assert.deepEqual(done.destination,[0,0,0]);}
});
test('every fitting operation names its real terminal and keeps supplies off',()=>{
 for(let n=0;n<18;n++){const i=f.rainFittingInstruction(n);assert.equal(i.id,w.rainConnections[Math.floor(n/2)].id);assert.match(i.instruction,/off while fitting/);}
 assert.match(f.rainFittingInstruction(18).instruction,/never joins Uno/);
 assert.throws(()=>f.rainFittingPose(0,NaN));assert.throws(()=>f.rainFittingPose(9,0));
});
