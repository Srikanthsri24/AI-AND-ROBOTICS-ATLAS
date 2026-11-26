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
const m=await import(await load(new URL('../src/data/rfid-indicators.ts',import.meta.url)));
test('each GPIO has its own 220 ohm series path and an isolated cathode strip',()=>{assert.equal(m.rfidIndicators.length,2);const strips=[];for(const c of m.rfidIndicators){assert.equal(c.resistor.ohms,220);assert.equal(c.resistor.to[0],c.anode[0]);assert.notEqual(c.resistor.to[2],c.anode[2]);assert.notEqual(c.anode[0],c.cathode[0]);strips.push(c.resistor.from[0],c.anode[0],c.cathode[0]);assert.ok(Math.abs(c.resistor.from[0]-c.resistor.to[0])>=10);}assert.equal(new Set(strips).size,6);assert.equal(m.rfidIndicators[0].pin,'D6');assert.equal(m.rfidIndicators[1].pin,'D7');});
