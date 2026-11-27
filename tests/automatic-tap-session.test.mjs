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
const d=await import(await load(new URL('../src/data/automatic-tap-session.ts',import.meta.url)));
const c=await import(await load(new URL('../src/data/automatic-tap-controller.ts',import.meta.url)));
const guide=await import(await load(new URL('../src/data/automatic-tap.ts',import.meta.url)));
const on={...d.tapDefaults,assembled:true,usb:true,pumpPower:true},advance=(s,ms,extra={})=>d.tapSessionAdvance(s,{...on,...extra},ms),ready=()=>advance(d.tapSessionInitial(),230),running=()=>advance(ready(),230,{distanceCm:8});
test('a wet level input is active-low and three clear/near samples control the exact driver request',()=>{let s=ready();assert.equal(s.controller.mode,'READY');s=advance(s,230,{distanceCm:8});assert.equal(s.controller.mode,'RUNNING');assert.equal(s.controller.driver,true);assert.equal(s.controller.runCommands,1);assert.ok(s.poweredUs>0);for(const flag of['levelPower','levelGround','levelSignal']){const stopped=advance(s,10,{distanceCm:8,[flag]:false});assert.equal(stopped.controller.mode,'WAIT_CLEAR');assert.equal(stopped.controller.driver,false);}s=advance(s,10,{distanceCm:8,water:false});assert.equal(s.controller.driver,false);});
test('missing motor supply, signal, reference or motor circuit cannot rotate a commanded pump',()=>{for(const flag of['pumpPower','pumpCircuit','driverReference','driverSignal']){let s=advance(ready(),230,{distanceCm:8,[flag]:false});assert.equal(s.controller.driver,true);assert.equal(s.poweredUs,0);assert.equal(s.rotor,0);}});
test('four-second limit latches off while held and only confirmed clearance permits a new run',()=>{let s=running();s=advance(s,4500,{distanceCm:8});assert.equal(s.controller.mode,'WAIT_CLEAR');assert.equal(s.controller.runCommands,1);assert.ok(s.poweredUs>=4000000&&s.poweredUs<4009000);const off=s.poweredUs;s=advance(s,1500,{distanceCm:8});assert.equal(s.poweredUs,off);s=advance(s,230);s=advance(s,230,{distanceCm:8});assert.equal(s.controller.runCommands,2);});
test('hold/start boundaries, missing echo and level capture follow the blocking loop instead of an invented interrupt',()=>{for(const cm of[3,4,13,14]){const s=advance(ready(),230,{distanceCm:cm});assert.equal(s.controller.driver,cm>=4&&cm<=13);}for(const cm of[3,4,17,18]){const s=advance(running(),100,{distanceCm:cm});assert.equal(s.controller.driver,cm>=4&&cm<=17);}let s=advance(running(),100,{echoPresent:false,distanceCm:8});assert.equal(s.controller.driver,false);let a=advance(d.tapSessionInitial(),70);assert.equal(a.pending.water,true);a=advance(a,1.6,{water:false});assert.equal(a.controller.count,1);a=advance(a,1,{water:false});assert.equal(a.controller.count,0);});
test('frame grouping and fractional microseconds preserve controller timing and motor transport',()=>{let whole=advance(running(),4300.25,{distanceCm:8}),split=running();for(let i=0;i<17201;i++)split=advance(split,.25,{distanceCm:8});assert.deepEqual(split.controller,whole.controller);assert.equal(split.poweredUs,whole.poweredUs);assert.ok(Math.abs(split.rotor-whole.rotor)<1e-8);let stopped=advance(split,100,{usb:false});assert.equal(stopped.controller,null);assert.equal(stopped.poweredUs,split.poweredUs);assert.throws(()=>advance(stopped,-1));assert.throws(()=>advance(stopped,1,{distanceCm:NaN}));});
test('the exact Arduino sketch matches scheduled acquisitions, level snapshots, starts, stops and Serial output',async()=>{const dir=await mkdtemp(join(tmpdir(),'atlas-tap-'));try{const prefix=`#include <cassert>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using byte=unsigned char;
const int LOW=0,HIGH=1,OUTPUT=2,INPUT=3,INPUT_PULLUP=4;
std::uint64_t clockUs=0;
std::uint32_t echoValue=0;
bool wet=true;int driver=0;std::vector<int> trigger;
std::uint32_t millis(){return std::uint32_t(clockUs/1000);}
void pinMode(byte p,int m){assert((p==9&&m==OUTPUT)||(p==2&&m==OUTPUT)||(p==3&&m==INPUT)||(p==4&&m==INPUT_PULLUP));}
void digitalWrite(byte p,int v){if(p==9)driver=v;else{assert(p==2);trigger.push_back(v);}}
int digitalRead(byte p){assert(p==4);return wet?LOW:HIGH;}
void delayMicroseconds(int us){assert(us==2||us==10);clockUs+=us;}
std::uint32_t pulseIn(byte p,int v,int timeout){assert(p==3&&v==HIGH&&timeout==7000);assert(trigger==std::vector<int>({LOW,HIGH,LOW}));trigger.clear();clockUs+=echoValue?echoValue:7000;return echoValue;}
struct SerialMock{std::string pending;std::vector<std::string> rows;void begin(int n){assert(n==115200);}template<class T>void print(T v){std::ostringstream out;out<<v;pending+=out.str();}template<class T>void println(T v){print(v);rows.push_back(pending);if(rows.size()>120)rows.erase(rows.begin());pending.clear();}}Serial;
#define long int
`;
const suffix=String.raw`
#undef long
int main(){setup();while(clockUs<11000000){const auto start=clockUs;const int cm=start<300000?26:start<4800000?8:start<5200000?26:start<7200000?8:start<7600000?26:start<8300000?8:start<8800000?-1:start<9200000?26:8;wet=!(start>=6600000&&start<6900000);echoValue=cm<0?0:(cm*20000+171)/343;loop();std::cout<<start<<'\t'<<clockUs<<'\t'<<cm<<'\t'<<wet<<'\t'<<int(mode)<<'\t'<<+count<<'\t'<<started<<'\t'<<lastRead<<'\t'<<lastReport<<'\t'<<driver<<'\t';for(std::size_t n=0;n<Serial.rows.size();n++){if(n)std::cout<<'~';std::cout<<Serial.rows[n];}std::cout<<'\n';clockUs+=1000;}}
`;
const cpp=join(dir,'check.cpp'),exe=join(dir,'check');await writeFile(cpp,prefix+guide.automaticTapProgram.source+suffix);execFileSync('c++',['-std=c++17',cpp,'-o',exe]);const rows=execFileSync(exe,[],{encoding:'utf8',maxBuffer:32*1024*1024}).trim().split('\n');let s=d.tapSessionInitial();const seen=new Set();for(const row of rows){const[start,end,cm,water,...expected]=row.split('\t');s=advance(s,(+end-s.clockUs)/1000,{distanceCm:Math.max(0,+cm),echoPresent:+cm>=0,water:water==='1'});const x=s.controller,actual=[['WAIT_CLEAR','READY','RUNNING'].indexOf(x.mode),x.count,x.started,x.lastRead,x.lastReport,+x.driver,x.rows.join('~')].map(String);assert.deepEqual(actual,expected,'Tap sketch loop '+start);seen.add(x.mode);}assert.equal(seen.size,3);assert.ok(rows.length>8000);assert.ok(s.controller.runCommands>=3);}finally{await rm(dir,{recursive:true,force:true});}});
test('unsigned deadline rollover and report throttling retain sketch semantics',()=>{const x={...c.tapControllerInitial(),mode:'RUNNING',driver:true,started:0xfffffff0};assert.equal(c.tapLoopEntry(x,(0xfffffff0+3999)>>>0,true).driver,true);assert.equal(c.tapLoopEntry(x,(0xfffffff0+4000)>>>0,true).driver,false);assert.throws(()=>c.tapEchoCm(7001));assert.throws(()=>c.tapLoopEntry(x,-1,true));});
