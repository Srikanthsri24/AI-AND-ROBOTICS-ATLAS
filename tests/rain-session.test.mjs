import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import ts from 'typescript';
const cache=new Map();async function load(url){if(cache.has(url.href))return cache.get(url.href);const raw=await readFile(url,'utf8');let code=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const m of[...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(m[0],"from '"+await load(new URL(m[1]+'.ts',url))+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;}
const m=await import(await load(new URL('../src/data/rain-session.ts',import.meta.url)));
const ready={...m.rainSessionDefaults,assembled:true,usb:true,servoPower:true};
const wet=[{x:25,z:4.15,radius:.6}];
test('water bridges command sheltering; four dry seconds precede gradual extension',()=>{
 let s=m.rainSessionAdvance(m.rainSessionInitial(),ready,1);assert.equal(s.clockMs,0);assert.equal(s.raw,'HIGH');
 s=m.rainSessionAdvance(s,ready,4000);assert.equal(s.controller.commandAngle,130);assert.equal(s.angle,35);
 s=m.rainSessionAdvance(s,ready,1000);assert.equal(s.angle,130);
 s=m.rainSessionAdvance(s,{...ready,drops:wet},1);assert.equal(s.raw,'LOW');assert.equal(s.controller.commandAngle,35);assert.equal(s.angle,130);
 s=m.rainSessionAdvance(s,{...ready,drops:wet},1000);assert.equal(s.angle,35);
 s=m.rainSessionAdvance(s,ready,3999);assert.equal(s.controller.covered,true);s=m.rainSessionAdvance(s,ready,1);assert.equal(s.controller.covered,false);
});
test('plain-board drops do not signal rain; unpowered servo preserves actual position despite commands',()=>{
 const settings={...ready,servoPower:false,drops:[{x:10,z:10,radius:1}]};let s=m.rainSessionAdvance(m.rainSessionInitial(),settings,6000);assert.equal(s.raw,'HIGH');assert.equal(s.controller.commandAngle,130);assert.equal(s.angle,35);
 s=m.rainSessionAdvance(s,{...settings,servoPower:true},500);assert.ok(Math.abs(s.angle-82.5)<1e-8);
 s=m.rainSessionAdvance(s,{...settings,servoPower:true,servoGround:false},1000);assert.ok(Math.abs(s.angle-82.5)<1e-8);
});
test('frame partition, USB reset and unknown sensor wiring are explicit',()=>{
 const a=m.rainSessionAdvance(m.rainSessionInitial(),ready,5500);let b=m.rainSessionInitial();for(const dt of [16.5,33.25,450.25,500,1500,3000])b=m.rainSessionAdvance(b,ready,dt);assert.deepEqual(a,b);
 b=m.rainSessionAdvance(b,{...ready,sensorSignal:false},20);assert.equal(b.controllerKnown,false);assert.equal(b.raw,null);const angle=b.angle;
 b=m.rainSessionAdvance(b,ready,1000);assert.equal(b.controllerKnown,false);assert.equal(b.angle,angle);
 b=m.rainSessionReset(b,ready);assert.equal(b.controllerKnown,true);assert.equal(b.clockMs,0);assert.equal(b.controller.commandAngle,35);
 b=m.rainSessionAdvance(b,{...ready,usb:false},1);assert.equal(b.controller,null);assert.equal(b.angle,angle);assert.throws(()=>m.rainSessionAdvance(b,ready,-1));
});
