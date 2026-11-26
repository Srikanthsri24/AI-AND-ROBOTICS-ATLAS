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
const d=await import(await load(new URL('../src/data/school-bell-display.ts',import.meta.url)));
test('CAD display has four distinct seven-segment glyphs and fourteen package pins',()=>{assert.equal(d.schoolBellSegments.length,28);assert.equal(new Set(d.schoolBellSegments.map(s=>s.id)).size,28);assert.equal(d.schoolBellDisplayPins.length,14);for(let digit=0;digit<4;digit++)assert.deepEqual(d.schoolBellSegments.filter(s=>s.digit===digit).map(s=>s.segment).sort(),['a','b','c','d','e','f','g']);});
test('clock numeral masks distinguish all ten digits and blank without power',()=>{const expected=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];for(let n=0;n<10;n++){const states=d.schoolBellSegmentStates(String(n).repeat(4),true);for(let digit=0;digit<4;digit++)assert.equal(states.filter(s=>s.digit===digit&&s.lit).map(s=>s.segment).sort().join(''),expected[n].split('').sort().join(''));}assert.equal(d.schoolBellSegmentStates('08:30',false).filter(s=>s.lit).length,0);assert.equal(d.schoolBellSegmentStates('    ',true).filter(s=>s.lit).length,0);assert.equal(d.schoolBellColonLit('08:30',true),true);assert.equal(d.schoolBellColonLit('08:30',false),false);});

const descriptions=await import(await load(new URL('../src/data/school-bell-display-parts.ts',import.meta.url)));
test('all display owners have distinct educational labels and actual board connections',()=>{const parts=descriptions.schoolBellDisplayParts;assert.equal(parts.length,62);assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);for(const p of parts){assert.ok(p.label.length>3);assert.ok(p.what.length>20);assert.ok(p.connection.length>30);assert.equal(descriptions.schoolBellDisplayPart(p.id),p);}for(const s of d.schoolBellSegments)assert.ok(descriptions.schoolBellDisplayPart(s.id));for(const pin of d.schoolBellDisplayPins){const text=descriptions.schoolBellDisplayPart('school-display-lead-'+pin.name).connection;assert.ok(text.includes(pin.net));assert.ok(text.includes('U2 P$'));}assert.match(descriptions.schoolBellDisplayPart('school-display-pin-sda').connection,/A4/);assert.match(descriptions.schoolBellDisplayPart('school-display-pin-scl').connection,/A5/);assert.match(descriptions.schoolBellDisplayPart('school-display-a0').connection,/open/);});
