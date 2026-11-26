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
const s=await import(await load(new URL('../src/data/school-bell-session.ts',import.meta.url)));
const b=await import(await load(new URL('../src/data/school-bell-workshop.ts',import.meta.url)));
function rig(){const settings={...s.schoolBellDefaults,assembled:true,usb:true,battery:true};let state=s.schoolBellSessionAdvance(s.schoolBellSessionInitial(),settings,1);return {settings,get state(){return state;},advance(ms){state=s.schoolBellSessionAdvance(state,settings,ms);},command(c){state=s.schoolBellSessionCommand(state,c);},reset(){state=s.schoolBellSessionReset(state);}};}
test('battery maintains calendar while Arduino and display are off, without sounding on reconnect',()=>{const r=rig();r.command('t');r.advance(25);const before=r.state.rtcMs;r.settings.usb=false;r.advance(10000);assert.equal(r.state.rtcMs,before+10000);assert.equal(r.state.controller,null);assert.deepEqual(s.schoolBellOutputs(r.state,r.settings),{display:'    ',pitch:0});r.settings.usb=true;r.advance(1);assert.equal(r.state.controller.display,'08:30');assert.equal(r.state.controller.bells,0);});
test('losing both supplies freezes RTC and the next successful boot restores compile time',()=>{const r=rig();r.command('t');r.advance(25);r.settings.usb=false;r.settings.battery=false;const before=r.state.rtcMs;r.advance(10000);assert.equal(r.state.rtcMs,before);assert.equal(r.state.lostPower,true);r.settings.usb=true;r.advance(1);assert.equal(r.state.rtcMs,b.schoolBellCompileEpoch*1000);assert.equal(r.state.lostPower,false);});
test('reset retains valid RTC time while startup RTC bus failure remains until another reset',()=>{const r=rig();r.command('t');r.advance(25);const before=r.state.rtcMs;r.reset();r.advance(1);assert.equal(r.state.rtcMs,before+1);r.settings.rtcBus=false;r.reset();r.advance(1);assert.equal(r.state.controller.ready,false);r.settings.rtcBus=true;r.advance(1000);assert.equal(r.state.controller.ready,false);r.reset();r.advance(1);assert.equal(r.state.controller.ready,true);});
test('fractional frame partitioning is deterministic and output wiring does not alter schedule logic',()=>{const settings={...s.schoolBellDefaults,assembled:true,usb:true,battery:true},initial=s.schoolBellSessionInitial(),one=s.schoolBellSessionAdvance(initial,settings,1000.5);let split=initial;for(let n=0;n<100;n++)split=s.schoolBellSessionAdvance(split,settings,10.005);assert.deepEqual(split,one);const r=rig();r.command('t');r.advance(6000);assert.equal(r.state.controller.bells,1);const controller=r.state.controller;r.settings.displayConnected=false;r.settings.piezoConnected=false;assert.deepEqual(s.schoolBellOutputs(r.state,r.settings),{display:'    ',pitch:0});assert.equal(r.state.controller,controller);assert.throws(()=>r.advance(-1));});

test('unassembled hardware cannot expose powered outputs before the next integration tick',()=>{const r=rig();assert.equal(s.schoolBellOutputs(r.state,r.settings).display,'08:00');r.settings.assembled=false;assert.deepEqual(s.schoolBellOutputs(r.state,r.settings),{display:'    ',pitch:0});});
