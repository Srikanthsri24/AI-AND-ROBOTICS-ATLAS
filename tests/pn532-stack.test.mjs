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
const m=await import(await load(new URL('../src/data/pn532-stack.ts',import.meta.url)));
test('all 32 primary shield pins align by name with actual Uno CAD sockets',()=>{assert.equal(m.pn532StackPins.length,32);assert.equal(new Set(m.pn532StackPins.map(p=>p.unoName)).size,32);for(const p of m.pn532StackPins){assert.ok(Math.abs(p.x+m.pn532Stack.offsetX-p.unoX)<1e-6,p.name);assert.ok(Math.abs(p.y-p.unoY)<1e-6,p.name);}for(const [bank,count] of [['digital-high',10],['digital-low',8],['power',8],['analog',6]])assert.equal(m.pn532StackPins.filter(p=>p.bank===bank).length,count);});
test('stack leaves insertion depth in Uno while upper sockets remain above shield',()=>{const s=m.pn532Stack;assert.ok(s.baseY+s.pinBottom>1.15);assert.ok(s.baseY+s.pinBottom<9.3);assert.ok(s.baseY>9.3);assert.ok(s.socketTop>s.bodyBottom);for(const name of ['D2','D3','D6','D7','D9','A4','A5','5V','GND-D'])assert.ok(m.pn532StackPins.some(p=>p.unoName===name));});
