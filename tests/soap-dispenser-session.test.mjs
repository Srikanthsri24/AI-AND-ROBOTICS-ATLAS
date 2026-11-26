import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const cache=new Map();
async function load(url){
  if(cache.has(url.href))return cache.get(url.href);
  if(url.pathname.endsWith('.json'))return 'data:text/javascript;base64,'+Buffer.from('export default '+await readFile(url,'utf8')).toString('base64');
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(new URL(match[1]+(match[1].endsWith('.json')?'':'.ts'),url))+"'");
  const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
const d=await import(await load(new URL('../src/data/soap-dispenser-session.ts',import.meta.url)));
const guide=await import(await load(new URL('../src/data/soap-dispenser.ts',import.meta.url)));
const on={...d.soapDispenserDefaults,assembled:true,usb:true,servoPower:true};
const advance=(s,ms,settings=on)=>d.soapDispenserSessionAdvance(s,settings,ms),ready=()=>advance(d.soapDispenserSessionInitial(),230);
test('acquisition blocks range/state updates until the echo returns, after a timestamped trigger',()=>{let s=advance(d.soapDispenserSessionInitial(),70);assert.equal(s.controller.lastRead,70);assert.equal(s.controller.lastCm,null);assert.equal(s.pending.start,70);assert.equal(s.pending.finishUs,71470);s=advance(s,1);assert.equal(s.controller.readings,0);s=advance(s,.47);assert.equal(s.controller.readings,1);assert.equal(s.controller.lastCm,25);assert.equal(s.pending,null);});
test('a held hand requests and physically reaches one press, then requires clearing before another',()=>{let s=ready();assert.equal(s.controller.phase,'READY');s=advance(s,450,{...on,distanceCm:8});assert.equal(s.controller.strokeCommands,1);assert.equal(s.completedServoPresses,1);assert.equal(s.angle,65);s=advance(s,1800,{...on,distanceCm:8});assert.equal(s.angle,35);assert.equal(s.controller.phase,'WAIT_CLEAR');assert.equal(s.completedServoPresses,1);s=advance(s,230);s=advance(s,450,{...on,distanceCm:8});assert.equal(s.controller.strokeCommands,2);assert.equal(s.completedServoPresses,2);});
test('motor power, reference or signal loss does not turn a software report into physical motion',()=>{for(const fault of ['servoPower','servoGround','servoSignal']){const settings={...on,[fault]:false};let s=advance(d.soapDispenserSessionInitial(),230,settings);s=advance(s,1500,{...settings,distanceCm:8});assert.equal(s.controller.strokeCommands,1);assert.equal(s.completedServoPresses,0);assert.equal(s.angle,35);}});
test('missing sensor supply, either sonar wire or a returning echo prevents arming',()=>{for(const fault of ['sensorPower','sensorGround','trigConnected','echoConnected','echoPresent']){const settings={...on,[fault]:false};let s=advance(d.soapDispenserSessionInitial(),500,settings);assert.equal(s.controller.phase,'WAIT_CLEAR');assert.equal(s.controller.lastCm,-1);assert.equal(s.controller.strokeCommands,0);}assert.equal(d.soapDispenserEcho({...on,distanceCm:200}),0);});
test('USB loss and logic reset preserve actual position and physical press history',()=>{let s=advance(ready(),450,{...on,distanceCm:8});assert.equal(s.angle,65);s=advance(s,100,{...on,usb:false});assert.equal(s.controller,null);assert.equal(s.angle,65);assert.equal(s.completedServoPresses,1);s=advance(s,230);assert.equal(s.controller.strokeCommands,0);assert.equal(s.angle,35);assert.equal(s.completedServoPresses,1);s=d.soapDispenserSessionReset(s);assert.equal(s.completedServoPresses,1);});
test('fractional frames preserve pending acquisitions, partial motor travel and all counters',()=>{const initial=ready(),settings={...on,distanceCm:8};let s=initial;for(let n=0;n<1601;n++)s=advance(s,.25,settings);assert.deepEqual(s,advance(initial,400.25,settings));for(const ms of [NaN,-1,Infinity])assert.throws(()=>advance(initial,ms));assert.throws(()=>advance(initial,1,{...on,distanceCm:NaN}));});
test('compiled sketch follows the same automatic idle/acquisition schedule as the session',async()=>{const dir=await mkdtemp(join(tmpdir(),'atlas-soap-session-'));try{await writeFile(join(dir,'Servo.h'),'#pragma once\n');const prefix=`#include <cassert>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using byte=unsigned char;
const int LOW=0,HIGH=1,OUTPUT=2,INPUT=3;
std::uint64_t clockUs=0;
std::uint32_t echoValue=0;
int command=35;
std::uint32_t millis(){return std::uint32_t(clockUs/1000);}
void pinMode(byte,int){}void digitalWrite(byte,int){}
void delayMicroseconds(int us){clockUs+=us;}
std::uint32_t pulseIn(byte,int,int){clockUs+=echoValue?echoValue:7000;return echoValue;}
struct Servo{void write(int v){command=v;}void attach(int){}};
struct SerialMock{std::string pending;std::vector<std::string> rows;void begin(int){}template<class T>void print(T v){std::ostringstream out;out<<v;pending+=out.str();}template<class T>void println(T v){print(v);rows.push_back(pending);if(rows.size()>120)rows.erase(rows.begin());pending.clear();}}Serial;
#define long int
`;
const suffix=String.raw`
#undef long
int main(){setup();while(clockUs<2600000){const auto start=clockUs;const int cm=start<300000?25:start<1300000?8:start<1600000?25:8;echoValue=(cm*20000+171)/343;loop();std::cout<<start<<'\t'<<clockUs<<'\t'<<cm<<'\t'<<int(state)<<'\t'<<+consecutive<<'\t'<<lastRead<<'\t'<<changed<<'\t'<<command<<'\t';for(std::size_t n=0;n<Serial.rows.size();++n){if(n)std::cout<<'|';std::cout<<Serial.rows[n];}std::cout<<'\n';clockUs+=1000;}}
`;
const cpp=join(dir,'check.cpp'),exe=join(dir,'check');await writeFile(cpp,prefix+guide.soapDispenserProgram.source+suffix);execFileSync('c++',['-std=c++17','-I',dir,cpp,'-o',exe]);const rows=execFileSync(exe,[],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split('\n'),phases=['WAIT_CLEAR','READY','PRESSING','REFILLING'];let s=d.soapDispenserSessionInitial();const seen=new Set();for(const row of rows){const [start,end,cm,...expected]=row.split('\t');if(+end===0)continue;s=advance(s,(+end-s.clockUs)/1000,{...on,distanceCm:+cm});const c=s.controller,actual=[phases.indexOf(c.phase),c.consecutive,c.lastRead,c.changed,c.command,c.rows.join('|')].map(String);assert.deepEqual(actual,expected,'compiled session loop at '+start);seen.add(c.phase);}assert.equal(seen.size,4);assert.ok(s.completedServoPresses>=2);assert.ok(rows.length>2000);}finally{await rm(dir,{recursive:true,force:true});}});
