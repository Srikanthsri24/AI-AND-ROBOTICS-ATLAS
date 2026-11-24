import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/data/camera-workshop.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {captureCounter,counterLayouts,analyzeCounter}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const capture=(scene,overrides={})=>captureCounter({targets:counterLayouts[scene],scene,serial:1,light:80,threshold:150,minimumArea:40,glare:false,...overrides});
test('counter processes empty, single, separated and tangent disk footprints as 0, 1, 3, 2 connected regions',()=>{
 for(const [scene,count] of [['empty',0],['one',1],['separated',3],['touching',2]]){const frame=capture(scene);assert.equal(frame.regions.length,count);assert.equal(frame.discarded,2);}
 const pair=capture('touching').regions.find(region=>region.members.length===2);assert.deepEqual(pair.members,[1,2]);
});
test('counter exposes contrast, glare and minimum-area failure cases from the mask',()=>{
 assert.equal(capture('separated',{light:20}).regions.length,0);const recovered=capture('separated',{light:20,threshold:80});assert.equal(recovered.regions.length,3);assert.equal(recovered.light,20);assert.equal(recovered.threshold,80);
 assert.equal(capture('separated',{glare:true}).regions.length,4);assert.equal(capture('separated',{minimumArea:1}).regions.length,5);
 assert.equal(capture('separated',{minimumArea:5000}).regions.length,0);assert.equal(capture('separated',{threshold:255}).regions.length,0);
});
test('counter uses eight-connected pixels and an inclusive minimum-area filter',()=>{
 const gray=Uint8Array.from([255,0,0,255]);assert.equal(analyzeCounter(gray,2,2,150,2).regions.length,1);assert.equal(analyzeCounter(gray,2,2,150,3).discarded,1);
});
