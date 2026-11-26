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
const d=await import(await load(new URL('../src/data/rain-dc.ts',import.meta.url)));
const l=await import(await load(new URL('../src/data/rain-workbench-layout.ts',import.meta.url)));
test('DC cord follows the withdrawn plug while the supply-end entry remains fixed',()=>{assert.deepEqual(d.rainDcCord(0),l.rainSupplyCord);for(let value=0;value<=12;value+=.25){const route=d.rainDcCord(value);assert.deepEqual(route[0],[l.rainSupplyCord[0][0],l.rainSupplyCord[0][1],l.rainSupplyCord[0][2]-value]);assert.deepEqual(route.slice(4),l.rainSupplyCord.slice(4));}for(const value of [-1,13,NaN,Infinity])assert.throws(()=>d.rainDcCord(value));});
