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
const d=await import(await load(new URL('../src/data/soap-dispenser-workshop.ts',import.meta.url)));
const guide=await import(await load(new URL('../src/data/soap-dispenser.ts',import.meta.url)));
const echo=cm=>Math.round(cm*20000/343),loop=(s,t,cm,spent=2)=>d.soapDispenserLoop(s,t,{echoUs:cm<0?0:echo(cm),finishedAt:(t+spent)>>>0});
function ready(){let s=d.soapDispenserInitial();for(const t of [70,140,210])s=loop(s,t,25);return s;}
function pressing(){let s=ready();for(const t of [280,350,420])s=loop(s,t,8);return s;}
test('three clear samples arm, three near samples command one stroke, and intermediate samples reset confirmation',()=>{let s=d.soapDispenserInitial();for(const t of [70,140])s=loop(s,t,25);assert.equal(s.phase,'WAIT_CLEAR');s=loop(s,210,17);assert.equal(s.consecutive,0);for(const t of [280,350,420])s=loop(s,t,18);assert.equal(s.phase,'READY');s=loop(s,490,4);s=loop(s,560,12);s=loop(s,630,13);assert.equal(s.consecutive,0);for(const t of [700,770,840])s=loop(s,t,8);assert.equal(s.phase,'PRESSING');assert.equal(s.strokeCommands,1);assert.equal(s.command,65);assert.equal(s.changed,842);});
test('press duration starts after acquisition, refill starts on its actual loop and a held hand cannot repeat',()=>{let s=pressing();assert.equal(s.changed,422);s=loop(s,881,8,0);assert.equal(s.phase,'PRESSING');s=d.soapDispenserLoop(s,882);assert.equal(s.phase,'REFILLING');assert.equal(s.changed,882);assert.equal(s.command,35);s=loop(s,1231,8,0);assert.equal(s.phase,'REFILLING');s=d.soapDispenserLoop(s,1232);assert.equal(s.phase,'WAIT_CLEAR');for(let t=1302;t<4000;t+=70)s=loop(s,t,8);assert.equal(s.phase,'WAIT_CLEAR');assert.equal(s.strokeCommands,1);for(const t of [4100,4170,4240])s=loop(s,t,25);for(const t of [4310,4380,4450])s=loop(s,t,8);assert.equal(s.strokeCommands,2);});
test('missing echo cannot trigger or rearm, while an already armed state is retained',()=>{let s=d.soapDispenserInitial();for(let t=70;t<1000;t+=70)s=loop(s,t,-1,7);assert.equal(s.phase,'WAIT_CLEAR');s=ready();s=loop(s,280,8);s=loop(s,350,-1,7);assert.equal(s.phase,'READY');assert.equal(s.consecutive,0);assert.equal(s.lastCm,-1);});
test('rounded integer echo values, inclusive boundaries and unsigned timers match the sketch',()=>{for(const cm of [4,12,18,25,120])assert.equal(d.soapDispenserEchoCm(echo(cm)),cm);assert.equal(d.soapDispenserEchoCm(0),-1);let s={...pressing(),changed:0xfffffff0,lastRead:0xfffffff0};s=d.soapDispenserLoop(s,443,{echoUs:echo(8),finishedAt:443});assert.equal(s.phase,'PRESSING');s=d.soapDispenserLoop(s,444);assert.equal(s.phase,'REFILLING');assert.equal(s.changed,444);for(const t of [-1,NaN,Infinity,.5,0x100000000])assert.throws(()=>d.soapDispenserReadDue(s,t));assert.throws(()=>d.soapDispenserLoop(d.soapDispenserInitial(),70));assert.throws(()=>d.soapDispenserEchoCm(7001));});
test('compiled exact downloadable sketch matches acquisition timing, reports, echo rounding and state over mixed loops',async()=>{const dir=await mkdtemp(join(tmpdir(),'atlas-soap-'));try{await writeFile(join(dir,'Servo.h'),'#pragma once\n');const prefix=`#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using byte=unsigned char;
const int LOW=0,HIGH=1,OUTPUT=2,INPUT=3;
std::uint64_t clockUs=0;
std::uint32_t echoValue=0,acquisitionUs=0;
int servoCommand=0,servoPin=-1;
std::array<int,20> modes{};
std::vector<int> trigger;
std::uint32_t millis(){return std::uint32_t(clockUs/1000);}
void pinMode(byte p,int m){modes.at(p)=m;}
void digitalWrite(byte p,int v){assert(p==2);trigger.push_back(v);}
void delayMicroseconds(int us){assert(us==2||us==10);clockUs+=us;}
std::uint32_t pulseIn(byte pin,int level,int timeout){assert(pin==3&&level==HIGH&&timeout==7000);assert(trigger==std::vector<int>({LOW,HIGH,LOW}));trigger.clear();clockUs+=acquisitionUs;return echoValue;}
struct Servo{void write(int v){assert(v==35||v==65);servoCommand=v;}void attach(int p){assert(p==9);servoPin=p;}};
struct SerialMock{std::string pending;std::vector<std::string> rows;void begin(int n){assert(n==115200);}template<class T>void print(T v){std::ostringstream out;out<<v;pending+=out.str();}template<class T>void println(T v){print(v);rows.push_back(pending);if(rows.size()>120)rows.erase(rows.begin());pending.clear();}}Serial;
#define long int
`;
const suffix=String.raw`
#undef long
int main(){setup();assert(servoPin==9&&servoCommand==35&&modes[2]==OUTPUT&&modes[3]==INPUT);std::uint64_t start;unsigned int us,spent;while(std::cin>>start>>us>>spent){clockUs=start;echoValue=us;acquisitionUs=spent;loop();std::cout<<int(state)<<'\t'<<+consecutive<<'\t'<<lastRead<<'\t'<<changed<<'\t'<<servoCommand<<'\t';for(std::size_t n=0;n<Serial.rows.size();++n){if(n)std::cout<<'|';std::cout<<Serial.rows[n];}std::cout<<'\n';}}
`;
const cpp=join(dir,'check.cpp'),exe=join(dir,'check');await writeFile(cpp,prefix+guide.soapDispenserProgram.source+suffix);execFileSync('c++',['-std=c++17','-I',dir,cpp,'-o',exe]);const times=[];let t=0,seed=0x365def;for(let n=0;n<800;n++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;t+=[9,69,70,71,140,350,459,460,1000][seed%9];const cm=[-1,3,4,8,12,13,17,18,25,120][(seed>>>7)%10],us=cm<0?0:echo(cm),spent=us?Math.max(us,Math.min(7000,us+(seed%900))):7000;times.push([t*1000+(seed%1000),us,spent]);}times.push([0xfffffff0*1000,echo(25),1600],[(0x100000000+70)*1000,echo(25),1600]);const rows=execFileSync(exe,[],{input:times.map(r=>r.join(' ')).join('\n')+'\n',encoding:'utf8'}).trim().split('\n');let s=d.soapDispenserInitial();assert.equal(rows.length,times.length);const phases=['WAIT_CLEAR','READY','PRESSING','REFILLING'];for(const [n,[start,echoUs,spent]]of times.entries()){const now=Math.floor(start/1000)>>>0;s=d.soapDispenserLoop(s,now,d.soapDispenserReadDue(s,now)?{echoUs,finishedAt:Math.floor((start+12+spent)/1000)>>>0}:undefined);const expected=[phases.indexOf(s.phase),s.consecutive,s.lastRead,s.changed,s.command,s.rows.join('|')].join('\t');assert.equal(rows[n],expected,'compiled soap loop '+n);}}finally{await rm(dir,{recursive:true,force:true});}});
