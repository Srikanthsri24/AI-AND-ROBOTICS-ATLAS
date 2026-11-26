import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import ts from 'typescript';
const cache=new Map();async function load(url){if(cache.has(url.href))return cache.get(url.href);const raw=await readFile(url,'utf8');let code=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const m of[...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(m[0],"from '"+await load(new URL(m[1]+'.ts',url))+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;}
const m=await import(await load(new URL('../src/data/rain-linkage.ts',import.meta.url)));
const distance=(a,b)=>Math.hypot(...a.map((v,n)=>v-b[n]));
test('every operating pose retains the fixed horn and pushrod lengths, with monotonic rail travel',()=>{
 let previous=-Infinity;
 for(let angle=35;angle<=130;angle+=.1){const p=m.rainLinkagePose(angle);assert.ok(Math.abs(distance(p.crank,m.rainLinkage.shaft)-20)<1e-9);assert.ok(Math.abs(distance(p.crank,p.slider)-65)<1e-9);assert.equal(p.slider[2],0);assert.ok(p.slider[0]>previous);assert.ok(p.carriageMinX>24&&p.carriageMaxX<99);previous=p.slider[0];}
});
test('covered paper load is under the roof; extended load clears its edge',()=>{
 const covered=m.rainLinkagePose(35),outside=m.rainLinkagePose(130);assert.ok(covered.slider[0]-2>28&&covered.slider[0]+2<66);assert.ok(outside.slider[0]-2>66);assert.ok(outside.slider[0]-covered.slider[0]>29);
});
test('mechanical movement is gradual, partition independent and stops without servo power',()=>{
 const mid=m.rainServoAdvance(35,130,500,true);assert.equal(mid,82.5);assert.equal(m.rainServoAdvance(mid,130,500,true),130);
 let split=35;for(let n=0;n<100;n++)split=m.rainServoAdvance(split,130,10,true);assert.ok(Math.abs(split-130)<1e-8);
 assert.equal(m.rainServoAdvance(82.5,35,1000,false),82.5);assert.equal(m.rainServoAdvance(130,35,1000,true),35);
 assert.throws(()=>m.rainLinkagePose(0));assert.throws(()=>m.rainServoAdvance(35,130,-1,true));
});
