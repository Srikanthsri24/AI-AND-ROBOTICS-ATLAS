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
const d=await import(await load(new URL('../src/data/school-bell-fitting.ts',import.meta.url)));
const w=await import(await load(new URL('../src/data/school-bell-wires.ts',import.meta.url)));
test('thirty fitting chapters name the exact end and correct mating direction',()=>{assert.equal(d.schoolBellFittingTotal,30);assert.equal(d.schoolBellFittingChapters.length,30);assert.deepEqual(d.schoolBellFittingChapters.map(p=>p.step),Array.from({length:30},(_,n)=>n+1));for(let n=0;n<15;n++){const wire=w.schoolBellWires[n],a=d.schoolBellFittingChapters[n*2],b=d.schoolBellFittingChapters[n*2+1];assert.equal(a.port,wire.fromPort);assert.equal(b.port,wire.toPort);assert.match(a.instruction,/lower/);assert.match(b.instruction,wire.toKind==='male-up'?/lower/:wire.toKind==='female-down'?/lift/:/forwards/);assert.match(b.check,/USB disconnected/);}});
test('connectors seat in order and floating ends preserve their jacket exit tangents',()=>{for(let n=0;n<15;n++){const wire=w.schoolBellWires[n],route=w.schoolBellWireRoute(n);for(const fraction of [0,.25,.5,.75,1,1.25,1.5,1.75,2]){const p=d.schoolBellFittingPose(n,n*2+fraction);assert.equal(p.visible,fraction>0);assert.equal(p.sourceSeated,fraction>=1);assert.equal(p.destinationSeated,fraction===2);for(const [offset,start] of [[p.source,true],[p.destination,false]]){const a=start?0:route.length-2,b=a+1;for(let axis=0;axis<3;axis++){assert.ok(Math.abs(p.points[a][axis]-route[a][axis]-offset[axis])<1e-8);assert.ok(Math.abs(p.points[b][axis]-route[b][axis]-offset[axis])<1e-8);}}if(fraction===2)assert.deepEqual(p.points,route);if(wire.toKind==='female-down')assert.ok(p.destination[1]<=0);if(wire.toKind==='female-back')assert.ok(p.destination[2]<=0);}}assert.throws(()=>d.schoolBellFittingPose(15,0));assert.throws(()=>d.schoolBellFittingPose(0,NaN));});
test('electrical connection flags never complete early',()=>{for(let step=0;step<=30;step++){const flags=Object.values(d.schoolBellFittingConnections(step));assert.equal(flags.flat().filter(Boolean).length,step);}assert.equal(Object.values(d.schoolBellFittingConnections(29.999)).flat().filter(Boolean).length,29);});
