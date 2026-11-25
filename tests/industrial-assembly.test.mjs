import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
const cache=new Map();async function load(name){if(cache.has(name))return cache.get(name);let code=ts.transpileModule(await readFile(new URL('../src/data/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;for(const m of[...code.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/([^'"]+\.json)['"];?/g)])code=code.replace(m[0],'const '+m[1]+'='+await readFile(new URL('../src/data/'+m[2],import.meta.url),'utf8')+';');for(const match of[...code.matchAll(/from ['"]\.\/([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(match[1])+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(name,uri);return uri;}
const a=await import(await load('industrial-assembly')),w=await import(await load('industrial-wiring'));
test('all 107 physical owners have explained assembly windows and fully settle by operation',()=>{
 assert.equal(a.industrialWorkshopParts.length,107);assert.equal(new Set(a.industrialWorkshopParts.map(p=>p.id)).size,107);
 for(const p of a.industrialWorkshopParts){assert.ok(p.name&&p.description&&p.connection);const win=a.industrialAssemblyWindow(p.id);assert.ok(win.start>=0&&win.end>=win.start&&win.end<=6.3,p.id);const end=a.industrialAssemblyPose(p.id,7);assert.equal(end.visible,true);assert.equal(end.settled,true);assert.deepEqual(end.offset,[0,0,0]);if(win.start>0)assert.equal(a.industrialAssemblyPose(p.id,win.start-.001).visible,false);}
 for(const n of[-1,8,NaN,Infinity])assert.throws(()=>a.industrialAssemblyPose('industrial-bench',n));assert.throws(()=>a.industrialAssemblyWindow('invented-owner'));
});
test('mechanical prerequisites settle before retainers and axial insertions begin',()=>{
 const before=(x,y)=>assert.ok(a.industrialAssemblyWindow(x).end<=a.industrialAssemblyWindow(y).start,x+' before '+y);
 for(const [x,y]of[['industrial-uno-feet','industrial-uno-pcb'],['industrial-uno-pcb','industrial-uno-screws'],['industrial-uno-screws','industrial-shield-pcb'],['industrial-temperature-body','industrial-panel'],['industrial-panel','industrial-temperature-washer'],['industrial-temperature-washer','industrial-temperature-nut'],['industrial-temperature-nut','industrial-temperature-knob'],['industrial-stop-roller','industrial-stop-axle'],['industrial-conveyor-belt','industrial-conveyor-left-shaft'],['industrial-conveyor-right-roller','industrial-conveyor-right-shaft']])before(x,y);
 assert.deepEqual(a.industrialAssemblyWindow('industrial-conveyor-left-shaft').travel,[0,0,70]);
});
test('each jumper seats its two named ends in order along their actual insertion axes',()=>{
 const originals=w.industrialWires();for(const [i,wire]of originals.entries()){
 const start=3+i/17,end=3+(i+1)/17,mid=start+1/34;
 assert.equal(w.industrialWireSeating(i,start-.000001).visible,false);
 const first=w.industrialSeatedWire(wire,i,start),half=w.industrialSeatedWire(wire,i,mid),done=w.industrialSeatedWire(wire,i,end+1e-8);
 for(const key of['a','b']){for(let k=0;k<3;k++)assert.ok(Math.abs(first[key].at[k]-wire[key].at[k]-12*wire[key].out[k])<1e-8);assert.deepEqual(done[key].at,wire[key].at);}
 assert.ok(Math.hypot(...half.a.at.map((v,k)=>v-wire.a.at[k]))<1e-8);assert.ok(Math.abs(Math.hypot(...half.b.at.map((v,k)=>v-wire.b.at[k]))-12)<1e-8);
 assert.equal(first.why,wire.why);assert.deepEqual(w.industrialSeatedWire(wire,i,7),wire);
 }
 for(const n of[-1,17,.5])assert.throws(()=>w.industrialWireSeating(n,3));assert.throws(()=>w.industrialSeatedWire(originals[1],0,3));
});
test('staged NC fault withdraws only the second NC socket and preserves every other conductor',()=>{
 const seated=w.industrialWires(),unplugged=w.industrialWires(false);
 for(let i=0;i<17;i++)for(const progress of[0,3.2,3.56,4,7]){
 const x=w.industrialSeatedWire(seated[i],i,progress),y=w.industrialSeatedWire(unplugged[i],i,progress);
 if(i!==9)assert.deepEqual(x,y);else{assert.deepEqual(x.a,y.a);assert.equal(x.b.at[1]-y.b.at[1],6);}
 }
});
