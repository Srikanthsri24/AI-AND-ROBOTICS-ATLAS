import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import ts from 'typescript';
const cache=new Map();async function load(url){if(cache.has(url.href))return cache.get(url.href);const raw=await readFile(url,'utf8');let code=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const m of[...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(m[0],"from '"+await load(new URL(m[1]+'.ts',url))+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;}
const m=await import(await load(new URL('../src/data/rain-water-sensor.ts',import.meta.url)));
test('dry board and single-electrode contact do not bridge the alternating networks',()=>{
 assert.equal(m.rainGeometricBridge([]),false);assert.equal(m.rainGeometricBridge([{x:10,z:10,radius:1}]),false);assert.equal(m.rainGeometricBridge([{x:25,z:3.5,radius:.2}]),false);
 assert.equal(m.rainGeometricBridge([{x:25,z:4.15,radius:.36}]),true);assert.equal(m.rainGeometricBridge([{x:25,z:4.15,radius:.34}]),false);
});
test('overlapping drops can form a bridge while separated drops on separate electrodes cannot',()=>{
 assert.equal(m.rainGeometricBridge([{x:25,z:3.5,radius:.4},{x:25,z:4.8,radius:.4}]),false);
 assert.equal(m.rainGeometricBridge([{x:25,z:3.5,radius:.4},{x:25,z:4.15,radius:.4},{x:25,z:4.8,radius:.4}]),true);
 assert.throws(()=>m.rainGeometricBridge([{x:NaN,z:4,radius:1}]));assert.throws(()=>m.rainGeometricBridge([{x:25,z:4,radius:0}]));
});
