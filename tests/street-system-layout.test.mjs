import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
 if(cache.has(url.href))return cache.get(url.href);
 let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const m of [...code.matchAll(/import (\w+) from ['"]([^'"]+\.json)['"];?/g)])code=code.replace(m[0],`const ${m[1]} = ${await readFile(new URL(m[2],url),'utf8')};`);
 for(const m of [...code.matchAll(/^import[ \t]+[^;\n]*?from ['"]([^'"]+)['"]/gm)])code=code.replace(m[0],m[0].slice(0,m[0].lastIndexOf('from '))+`from '${await load(new URL(m[1]+'.ts',url))}'`);
 const result='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,result);return result;
}
const w=await import(await load(new URL('../src/data/street-system-layout.ts',import.meta.url)));
test('three branches use distinct 5-hole strips and one series limiter each',()=>{
 const occupied=new Set();
 for(const b of w.streetSystemBranches){
  for(const p of [b.resistorInput,b.resistorOutput,b.returnContact]){const key=p[0];assert.ok(!occupied.has(key));occupied.add(key);}
  assert.equal(b.resistorInput[0],b.driveContact[0]);assert.equal(b.resistorOutput[0],b.lampContact[0]);
  assert.notEqual(b.resistorInput[0],b.resistorOutput[0]);assert.notEqual(b.lampContact[0],b.returnContact[0]);
  assert.ok(Math.abs(b.cathode[0]-b.anode[0]-2.54)<1e-10);
 }
 assert.deepEqual(w.streetSystemBranches.map(b=>b.pin),['D5','D6','D7']);
});
test('all 17 cables have unique IDs, distinct physical contacts and explicit electrical nodes',()=>{
 assert.equal(w.streetSystemCables.length,17);assert.equal(new Set(w.streetSystemCables.map(c=>c.id)).size,17);
 const contacts=new Set();for(const c of w.streetSystemCables){assert.ok(c.node&&c.name);for(const p of [c.a,c.b]){assert.ok(p.every(Number.isFinite));const key=p.join(',');assert.ok(!contacts.has(key),'double-seated contact '+key);contacts.add(key);}}
 for(const b of w.streetSystemBranches){assert.deepEqual(w.streetSystemCables.find(c=>c.id===b.id+'-drive').a,w.streetSystemSocket(b.pin));assert.deepEqual(w.streetSystemCables.find(c=>c.id===b.id+'-anode').b,b.positiveTail);assert.deepEqual(w.streetSystemCables.find(c=>c.id===b.id+'-return').a,b.returnTail);}
});
test('divider ground and junction are independent of the lamp bank',()=>{
 assert.notEqual(w.streetSystemDivider.junction[0],w.streetSystemDivider.ground[0]);
 assert.ok(w.streetSystemDivider.junction[2]>w.streetSystemLayout.breadboard[2]);
 assert.ok(w.streetSystemBranches.every(b=>b.resistorInput[2]<w.streetSystemLayout.breadboard[2]));
 assert.throws(()=>w.streetSystemSocket('NOT-A-PIN'));assert.throws(()=>w.streetSystemHole(17,1,0));
 assert.equal(w.streetSystemAssembly.length,9);
});

const assembly=await import(await load(new URL('../src/data/street-system-assembly.ts',import.meta.url)));
const catalog=await import(await load(new URL('../src/data/street-system-parts.ts',import.meta.url)));
test('every physical part has a bounded monotone assembly lift and seats at its chapter',()=>{
 assert.equal(catalog.streetSystemParts.length,59);
 for(const part of catalog.streetSystemParts){let previous=Infinity;
  for(let n=0;n<=80;n++){const p=n/10,pose=assembly.streetSystemAssemblyPose(part.id,p);assert.ok(pose.lift>=0&&pose.lift<=70);assert.ok(pose.lift<=previous+1e-9);previous=pose.lift;if(p>=part.stage){assert.equal(pose.lift,0);assert.equal(pose.seated,true);assert.equal(pose.visible,true);}}
 }
 assert.throws(()=>assembly.streetSystemAssemblyPose('missing',0));assert.throws(()=>assembly.streetSystemAssemblyPose('street-base',9));
});

const shade=await import(await load(new URL('../src/data/street-system-shade.ts',import.meta.url)));
test('moving shade uses circular overlap and stays above the sensor and connector tops',()=>{
 let previous=-1;
 for(let n=0;n<=100;n++){
  const p=shade.streetShadePose(n),coverage=shade.streetShadeCoverage(n),g=shade.streetShadeGeometry;
  assert.ok(coverage>=previous);previous=coverage;
  assert.ok(Math.abs(p.x+g.width/2-p.rightEdge)<1e-10);
  assert.ok(g.height-g.thickness/2>27);
  assert.ok(g.depth/2>g.radius);
  assert.ok(Math.abs(coverage+shade.streetShadeCoverage(100-n)-100)<1e-10);
 }
 assert.equal(shade.streetShadeCoverage(0),0);assert.equal(shade.streetShadeCoverage(50),50);assert.equal(shade.streetShadeCoverage(100),100);
 assert.ok(shade.streetShadeCoverage(25)<25);assert.ok(shade.streetShadeCoverage(75)>75);
 assert.throws(()=>shade.streetShadePose(-1));assert.throws(()=>shade.streetShadePose(NaN));
});
test('mounts seat before supported boards, hoods and fasteners; resistors fit sequentially',()=>{
 const pose=assembly.streetSystemAssemblyPose;
 assert.equal(pose('street-lamp-1-foot',.25).seated,true);
 assert.equal(pose('street-lamp-1-post',.25).visible,false);
 assert.equal(pose('street-lamp-1-post',.55).seated,true);
 assert.equal(pose('street-lamp-1-hood',.55).visible,false);
 assert.equal(pose('street-lamp-1-hood',.8).seated,true);
 assert.equal(pose('street-lamp-1-bolts',.8).visible,false);
 assert.equal(pose('street-uno-supports',2.25).seated,true);
 assert.equal(pose('street-uno-pcb',2.25).visible,false);
 assert.equal(pose('street-lamp-1-resistor',4.5).seated,true);
 assert.equal(pose('street-lamp-3-resistor',4.5).visible,false);
});
