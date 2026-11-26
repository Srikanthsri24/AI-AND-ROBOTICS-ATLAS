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
const d=await import(await load(new URL('../src/data/traffic-parking-workshop.ts',import.meta.url)));
const off={entry:false,exit:false};
const loop=(s,t,entry=false,exit=false)=>d.trafficParkingLoop(s,t,{entry,exit});
function press(s,start,kind='entry'){s=loop(s,start,kind==='entry',kind==='exit');s=loop(s,start+22,kind==='entry',kind==='exit');s=loop(s,start+23);return loop(s,start+45);}
test('six traffic phases preserve the all-red clearance and never give both directions green',()=>{let s=d.trafficParkingInitial();const steps=[[0,'Green','Red'],[5000,'Amber','Red'],[6600,'Red','Red'],[7500,'Red','Green'],[12500,'Red','Amber'],[14100,'Red','Red'],[15000,'Green','Red']];for(const [t,main,cross] of steps){s=loop(s,t);const out=d.trafficParkingControllerOutputs(s);assert.equal(out.main,main);assert.equal(out.cross,cross);assert.ok(!(out.main==='Green'&&out.cross==='Green'));}s=loop(s,60000);assert.equal(s.phase,1);assert.equal(s.phaseSince,60000);});
test('three debounced requests fill the lot, fourth is denied and an exit frees one space',()=>{let s=d.trafficParkingInitial();for(const start of [0,3000,6000]){s=press(s,start);s=loop(s,start+2522);}assert.equal(s.occupied,3);assert.equal(s.admissions,3);assert.equal(d.trafficParkingControllerOutputs(s).full,true);s=press(s,9000);assert.equal(s.open,false);assert.equal(s.command,20);assert.equal(s.denials,1);assert.equal(s.rows.at(-1),'Entry denied');s=press(s,10000,'exit');assert.equal(s.occupied,2);assert.equal(s.departures,1);assert.equal(d.trafficParkingControllerOutputs(s).full,false);s=press(s,11000);assert.equal(s.occupied,3);assert.equal(s.command,100);});
test('bounce is rejected, held startup press counts once, and requests during an open gate are consumed',()=>{let s=d.trafficParkingInitial();s=loop(s,0,true);s=loop(s,8);s=loop(s,12,true);s=loop(s,30,true);assert.equal(s.occupied,0);s=loop(s,34,true);assert.equal(s.occupied,1);s=loop(s,100,true);assert.equal(s.admissions,1);s=loop(s,110);s=loop(s,132);s=loop(s,150,true,true);s=loop(s,172,true,true);assert.equal(s.admissions,1);assert.equal(s.departures,0);s=loop(s,2534,true,true);assert.equal(s.open,false);assert.equal(s.occupied,1);s=loop(s,2600);s=loop(s,2622);s=loop(s,2700,true);s=loop(s,2722,true);assert.equal(s.occupied,2);});
test('exit is processed before entry in the same loop, including a previously full lot',()=>{let s=d.trafficParkingInitial();for(const start of [0,3000,6000]){s=press(s,start);s=loop(s,start+2522);}s=loop(s,9000,true,true);s=loop(s,9022,true,true);assert.equal(s.occupied,3);assert.equal(s.open,true);assert.equal(s.denials,0);assert.equal(s.departures,1);assert.equal(s.admissions,4);assert.deepEqual(s.rows.slice(-2),['Spaces left: 1','Spaces left: 0']);});
test('gate and phase timers survive unsigned millis rollover independently',()=>{let s=d.trafficParkingInitial(0xfffffff0);s=loop(s,0xfffffff0,true);s=loop(s,6,true);assert.equal(s.open,true);assert.equal(s.gateSince,6);s=loop(s,2505);assert.equal(s.open,true);s=loop(s,2506);assert.equal(s.open,false);s=loop(s,4984);assert.equal(s.phase,1);assert.throws(()=>loop(s,NaN));});
const guide=await import(await load(new URL('../src/data/traffic-parking.ts',import.meta.url)));
test('compiled exact downloadable sketch agrees on buttons, phase pins, gate, occupancy and reports',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'atlas-traffic-parking-'));
 try{
  await writeFile(join(dir,'Servo.h'),'#pragma once\n');
  const prefix=`#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using byte=unsigned char;
const int LOW=0,HIGH=1,INPUT_PULLUP=2,OUTPUT=3,A0=14,A1=15;
std::uint32_t clockNow=0;
bool entryLow=false,exitLow=false;
std::array<int,32> outputs{},modes{};
int servoCommand=20,servoPin=-1;
unsigned int traceAdmissions=0,traceDepartures=0,traceDenials=0;
int lastReportedOccupied=0;
std::uint32_t millis(){return clockNow;}
void pinMode(byte pin,int mode){modes.at(pin)=mode;}
int digitalRead(byte pin){assert(pin==A0||pin==A1);return (pin==A0?entryLow:exitLow)?LOW:HIGH;}
void digitalWrite(byte pin,int value){assert((pin>=2&&pin<=7)||pin==10);outputs.at(pin)=value?1:0;}
struct Servo{void write(int value){assert(value==20||value==100);servoCommand=value;}void attach(int pin){assert(pin==9);servoPin=pin;}};
struct SerialMock{
 std::string pending;
 std::vector<std::string> rows;
 void begin(int baud){assert(baud==115200);}
 template<class T> void print(T value){std::ostringstream out;out<<value;pending+=out.str();}
 template<class T> void println(T value){print(value);if(pending=="Entry denied")++traceDenials;if(pending.rfind("Spaces left: ",0)==0){const int current=3-std::stoi(pending.substr(13));if(current>lastReportedOccupied)traceAdmissions+=current-lastReportedOccupied;if(current<lastReportedOccupied)traceDepartures+=lastReportedOccupied-current;lastReportedOccupied=current;}rows.push_back(pending);if(rows.size()>120)rows.erase(rows.begin());pending.clear();}
} Serial;
// AVR unsigned long is 32-bit. Standard host headers above are already parsed.
#define long int
`;
  const suffix=String.raw`
#undef long
void dump(){
 std::cout<<+occupied<<'\t'<<+phase<<'\t'<<open<<'\t'<<servoCommand<<'\t'<<phaseSince<<'\t'<<gateSince<<'\t'<<entry.candidate<<'\t'<<entry.state<<'\t'<<entry.since<<'\t'<<leaveLot.candidate<<'\t'<<leaveLot.state<<'\t'<<leaveLot.since<<'\t'<<traceAdmissions<<'\t'<<traceDepartures<<'\t'<<traceDenials<<'\t';
 for(int pin:{2,3,4,5,6,7,10})std::cout<<outputs[pin];std::cout<<'\t';for(std::size_t n=0;n<Serial.rows.size();++n){if(n)std::cout<<'|';std::cout<<Serial.rows[n];}std::cout<<'\n';
}
int main(){setup();assert(servoPin==9);assert(modes[A0]==INPUT_PULLUP&&modes[A1]==INPUT_PULLUP);for(int pin:{2,3,4,5,6,7,10})assert(modes[pin]==OUTPUT);dump();int arrive,leave;while(std::cin>>clockNow>>arrive>>leave){entryLow=arrive;exitLow=leave;loop();dump();}}
`;
  const cpp=join(dir,'check.cpp'),exe=join(dir,'check');
  await writeFile(cpp,prefix+guide.trafficParkingProgram.source+suffix);
  execFileSync('c++',['-std=c++17','-I',dir,cpp,'-o',exe],{encoding:'utf8'});
  const timeline=[[0,true,false],[21,true,false],[22,true,false],[23,false,false],[45,false,false],[1000,true,true],[1022,true,true],[1023,false,false],[1045,false,false],[2521,true,false],[2522,true,false],[2543,true,false],[2544,false,false],[2566,false,false],[5000,false,false],[6600,false,false],[7500,false,false],[12500,false,false],[14100,false,false],[15000,false,false]];
  let time=20000,seed=0x71bd234;for(let n=0;n<600;n++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;time+=[1,7,21,22,23,155,900,1600,2500,5000][seed%10];timeline.push([time,!!(seed&16),!!(seed&64)]);}
  timeline.push([time+3000,false,false],[time+3022,false,false],[0xffffffd0,true,false],[0xffffffe6,true,false],[2473,true,false],[2474,true,false],[5000,false,false],[5022,false,false]);
  const actual=execFileSync(exe,[],{input:timeline.map(([t,a,b])=>`${t} ${+a} ${+b}`).join('\n')+'\n',encoding:'utf8'}).trim().split('\n');
  const encode=s=>{const o=d.trafficParkingControllerOutputs(s),bits=[o.main==='Red',o.main==='Amber',o.main==='Green',o.cross==='Red',o.cross==='Amber',o.cross==='Green',o.full].map(Number).join('');return [s.occupied,s.phase,+s.open,s.command,s.phaseSince,s.gateSince,+s.entry.candidate,+s.entry.state,s.entry.since,+s.exit.candidate,+s.exit.state,s.exit.since,s.admissions,s.departures,s.denials,bits,s.rows.join('|')].join('\t');};
  let state=d.trafficParkingInitial();assert.equal(actual[0],encode(state),'setup');assert.equal(actual.length,timeline.length+1);
  for(const [n,[t,entry,exit]] of timeline.entries()){state=loop(state,t,entry,exit);assert.equal(actual[n+1],encode(state),'compiled loop '+n+' at '+t);}
 }finally{await rm(dir,{recursive:true,force:true});}
});
