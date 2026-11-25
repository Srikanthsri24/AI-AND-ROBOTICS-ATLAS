import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
const code=ts.transpileModule(await readFile(new URL('../src/data/flood-workshop.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const m=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const input=(overrides={})=>({...m.floodWorkshopDefaults,...overrides});
test('water thresholds follow the published integer gap and recover without hysteresis',()=>{
 for(const [waterMm,state]of [[0,'Normal'],[49,'Normal'],[50,'Watch'],[79,'Watch'],[80,'Warning'],[100,'Warning'],[79,'Watch'],[49,'Normal']]){
  const r=m.floodWorkshopSample(input({waterMm}),0);assert.equal(r.state,state);assert.equal(r.depthMm,waterMm);assert.equal(r.gapMm,230-waterMm);assert.equal(+r.green + +r.amber + +r.red,1);
 }
});
test('calibration uses the measured empty distance and an incorrect baseline visibly offsets the reading',()=>{
 assert.equal(m.floodWorkshopSample(input({mountGapMm:250,emptyCalibrationMm:250}),0).depthMm,0);
 assert.equal(m.floodWorkshopSample(input({mountGapMm:250,emptyCalibrationMm:230,waterMm:80}),0).depthMm,60);
 const fault=m.floodWorkshopSample(input({mountGapMm:260}),0);assert.equal(fault.state,'Sensor unavailable');assert.equal(fault.gapMm,null);
});
test('unavailable echo waits for timeout and blinks amber without sounding',()=>{
 for(const startUs of [0,400000,800000]){const r=m.floodWorkshopSample(input({echoConnected:false}),startUs);assert.equal(r.atUs,startUs+6012);assert.equal(r.depthMm,null);assert.equal(r.toneHz,0);assert.equal(r.green,false);assert.equal(r.red,false);assert.equal(r.amber,startUs!==400000);}
});
test('warning tone is 1800 Hz in alternating 400 ms windows while red stays on',()=>{
 for(const [startUs,hz]of [[0,1800],[400000,0],[800000,1800]]){const r=m.floodWorkshopSample(input({waterMm:90}),startUs);assert.equal(r.red,true);assert.equal(r.toneHz,hz);assert.equal(r.amber,false);}
});
test('sampling waits for actual echo completion and then 100 ms before another measurement',()=>{
 let s={...m.floodWorkshopInitial(),running:true};s=m.floodWorkshopAdvance(s,.001,input());assert.equal(s.samples,0);assert.equal(s.reading,null);s=m.floodWorkshopAdvance(s,.001,input());assert.equal(s.samples,1);assert.equal(s.reading.atUs,1353);assert.equal(s.nextStartUs,101353);
 s=m.floodWorkshopAdvance(s,.099,input());assert.equal(s.samples,1);s=m.floodWorkshopAdvance(s,.002,input());assert.equal(s.samples,2);
});
test('paused clock and disconnected power never keep a lit alarm or stale pending echo',()=>{
 const stopped=m.floodWorkshopInitial();assert.strictEqual(m.floodWorkshopAdvance(stopped,1,input()),stopped);
 let s=m.floodWorkshopAdvance({...stopped,running:true},.2,input({waterMm:90}));assert.equal(s.reading.red,true);s=m.floodWorkshopAdvance(s,.1,input({powered:false}));assert.equal(s.reading,null);assert.equal(s.pending,null);assert.equal(s.samples,0);
});
test('frame subdivision does not change firmware sample times or pin outputs',()=>{
 const a=m.floodWorkshopAdvance({...m.floodWorkshopInitial(),running:true},2,input({waterMm:85}));let b={...m.floodWorkshopInitial(),running:true};for(let n=0;n<200;n++)b=m.floodWorkshopAdvance(b,.01,input({waterMm:85}));assert.deepEqual(b,a);
});
test('unsafe or nonsensical inputs are rejected rather than silently changing the teaching model',()=>{
 for(const override of [{waterMm:101},{waterMm:-1},{mountGapMm:100},{emptyCalibrationMm:230.5},{waterMm:NaN}])assert.throws(()=>m.floodWorkshopSample(input(override),0));
 assert.throws(()=>m.floodWorkshopAdvance({...m.floodWorkshopInitial(),running:true},-1,input()));
});
