import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
 if(cache.has(url.href))return cache.get(url.href);
 let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const m of [...code.matchAll(/import (\w+) from ['"]([^'"]+\.json)['"];?/g)])code=code.replace(m[0],`const ${m[1]} = ${await readFile(new URL(m[2],url),'utf8')};`);
 for(const m of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(m[0],`from '${await load(new URL(m[1]+'.ts',url))}'`);
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
