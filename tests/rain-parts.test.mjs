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
const p=await import(await load(new URL('../src/data/rain-hardware-parts.ts',import.meta.url)));
test('water explanations follow actual bridge geometry and disappear when blotted',()=>{assert.equal(p.rainWorkshopParts([]).length,p.rainHardwareParts.length);const wet=p.rainWorkshopParts([{x:25,z:10,radius:2.5}]).at(-1);assert.equal(wet.id,'rain-water-drop-0');assert.match(wet.what,/touches both/);assert.match(wet.connection,/LOW/);const plain=p.rainWorkshopParts([{x:12,z:5,radius:1}]).at(-1);assert.match(plain.what,/does not create/);assert.match(plain.connection,/HIGH/);});
test('part identifiers stay unique as multiple visible drops are added',()=>{const parts=p.rainWorkshopParts([{x:25,z:10,radius:2.5},{x:12,z:5,radius:1}]);assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);assert.ok(parts.every(p=>p.name&&p.what&&p.connection));assert.equal(parts.at(-1).id,'rain-water-drop-1');});
