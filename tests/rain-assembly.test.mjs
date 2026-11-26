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
const a=await import(await load(new URL('../src/data/rain-assembly.ts',import.meta.url)));
test('assembly timeline is continuous and ends only after all fitting stages',()=>{let elapsed=0;for(let n=0;n<a.rainAssemblyDurations.length;n++){assert.equal(a.rainAssemblyProgress(elapsed),n);const d=a.rainAssemblyDurations[n];assert.equal(a.rainAssemblyProgress(elapsed+d/2),n+.5);elapsed+=d;}assert.equal(elapsed,a.rainAssemblyTotalMs);assert.equal(a.rainAssemblyProgress(elapsed),15);assert.equal(a.rainAssemblyProgress(elapsed+999),15);});
test('hardware precedes circuit fitting and every piece is seated at completion',()=>{for(const id of a.rainAssemblyGroups){const p=a.rainAssemblyPose(id,15);assert.equal(p.visible,true);assert.equal(p.lift,0);}assert.equal(a.rainAssemblyPose('rain-circuit-jumpers',12.999).visible,false);assert.equal(a.rainAssemblyWireCursor(13),0);assert.equal(a.rainAssemblyWireCursor(13.5),9);assert.equal(a.rainAssemblyWireCursor(14),18);assert.equal(a.rainAssemblyPose('rain-grove-water-sensor',10.999).visible,false);assert.equal(a.rainAssemblyPose('rain-carriage',5.5).lift,17.5);assert.throws(()=>a.rainAssemblyPose('unknown',0));assert.throws(()=>a.rainAssemblyProgress(-1));assert.throws(()=>a.rainAssemblyWireCursor(16));});
