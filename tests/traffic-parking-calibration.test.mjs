import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const code=ts.transpileModule(await readFile(new URL('../src/data/traffic-parking-calibration.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const d=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('bare shaft holds down before raising once, including millis rollover',()=>{for(const start of [0,100,0xffffff00]){let s=d.trafficParkingCalibrationInitial(start);for(const offset of [0,1,1499,1500,1501,9000]){s=d.trafficParkingCalibrationLoop(s,(start+offset)>>>0);assert.equal(d.trafficParkingCalibrationCommand(s),offset<1500?20:100);}s=d.trafficParkingCalibrationLoop(s,start);assert.equal(d.trafficParkingCalibrationCommand(s),100,'raised command stays latched even after rollover');}for(const t of [-1,NaN,Infinity,.5,0x100000000])assert.throws(()=>d.trafficParkingCalibrationInitial(t));});
test('exact calibration download compiles and matches both commands, off lamps and serial messages',async()=>{const dir=await mkdtemp(join(tmpdir(),'atlas-parking-calibration-'));try{await writeFile(join(dir,'Servo.h'),'#pragma once\n');const prefix=`#include <cassert>
#include <cstdint>
#include <array>
#include <string>
#include <iostream>
using byte=unsigned char;
const int OUTPUT=1,LOW=0;
std::uint32_t clockNow=0;
std::array<int,32> modes{},outputs{};
int command=0,attached=-1,baud=0;
std::uint32_t millis(){return clockNow;}
void pinMode(byte p,int mode){modes.at(p)=mode;}
void digitalWrite(byte p,int value){outputs.at(p)=value;}
struct Servo{void write(int angle){assert(angle==20||angle==100);command=angle;}void attach(int pin){attached=pin;}};
struct SerialMock{void begin(int n){baud=n;}void println(const char* text){std::cout<<text<<'\\n';}}Serial;
#define long int
`;
 const suffix=`
#undef long
int main(){clockNow=0xffffff00;setup();assert(command==20&&attached==9&&baud==115200);for(int p:{2,3,4,5,6,7,10})assert(modes[p]==OUTPUT&&outputs[p]==LOW);for(unsigned int delta:{0u,1u,1499u,1500u,1501u,9000u}){clockNow=std::uint32_t(0xffffff00u+delta);loop();std::cout<<delta<<":"<<command<<'\\n';}clockNow=0xffffff00;loop();assert(command==100);}
`;
 const cpp=join(dir,'check.cpp'),exe=join(dir,'check');await writeFile(cpp,prefix+d.trafficParkingCalibrationProgram.source+suffix);execFileSync('c++',['-std=c++17','-I',dir,cpp,'-o',exe]);const rows=execFileSync(exe,[],{encoding:'utf8'}).trim().split('\n');assert.equal(rows.filter(r=>r.startsWith('Bare shaft:')).length,1);assert.equal(rows.filter(r=>r.startsWith('Holding 100')).length,1);let s=d.trafficParkingCalibrationInitial(0xffffff00);assert.deepEqual(rows.filter(r=>/^\d+:/.test(r)),[0,1,1499,1500,1501,9000].map(delta=>{s=d.trafficParkingCalibrationLoop(s,(0xffffff00+delta)>>>0);return delta+':'+d.trafficParkingCalibrationCommand(s);}));}finally{await rm(dir,{recursive:true,force:true});}});
