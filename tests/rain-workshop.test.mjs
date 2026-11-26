import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import ts from 'typescript';
const cache=new Map();async function load(url){if(cache.has(url.href))return cache.get(url.href);const raw=await readFile(url,'utf8');let code=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const m of[...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(m[0],"from '"+await load(new URL(m[1]+'.ts',url))+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;}
const m=await import(await load(new URL('../src/data/rain-workshop.ts',import.meta.url)));
test('starts covered, extends at exactly four seconds dry, and only writes changed commands',()=>{
 let s=m.rainInitial();s=m.rainStep(s,3999,false);assert.equal(s.covered,true);assert.deepEqual(s.writes,[35]);
 s=m.rainStep(s,4000,false);assert.equal(s.covered,false);assert.equal(s.commandAngle,130);assert.deepEqual(s.writes,[35,130]);
 s=m.rainStep(s,9000,false);assert.deepEqual(s.writes,[35,130]);
});
test('wet retracts immediately and every wet sample restarts the dry wait',()=>{
 let s=m.rainStep(m.rainInitial(),5000,false);s=m.rainStep(s,5001,true);assert.equal(s.commandAngle,35);
 s=m.rainStep(s,8999,false);assert.equal(s.covered,true);s=m.rainStep(s,9000,true);
 s=m.rainStep(s,12999,false);assert.equal(s.covered,true);s=m.rainStep(s,13000,false);assert.equal(s.covered,false);
});
test('serial reports no faster than 250 ms and skipped loops do not invent historical rows',()=>{
 let s=m.rainStep(m.rainInitial(),249,false);assert.equal(s.rows.length,0);s=m.rainStep(s,250,false);assert.equal(s.rows[0].text,'DRY | Sheltered');
 s=m.rainStep(s,2000,true);assert.equal(s.rows.length,2);assert.equal(s.rows[1].text,'WET | Sheltered');assert.ok(Object.isFrozen(s.rows[1]));
});
test('AVR millis rollover preserves the dry deadline and report schedule',()=>{
 let s=m.rainInitial(0xffffff00);s=m.rainStep(s,0xffffff10,true);
 s=m.rainStep(s,(0xffffff10+3999)>>>0,false);assert.equal(s.covered,true);
 s=m.rainStep(s,(0xffffff10+4000)>>>0,false);assert.equal(s.covered,false);
 assert.throws(()=>m.rainInitial(-1));assert.throws(()=>m.rainStep(s,0x100000000,false));
});
import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';
test('compiled original sketch matches commands, wet resets, serial and uint32 rollover',async()=>{
 const program=await import(await load(new URL('../src/data/rain-clothesline.ts',import.meta.url))),dir=await mkdtemp(join(tmpdir(),'atlas-rain-'));
 try{const events=[{now:0,wet:false},{now:249,wet:false},{now:250,wet:false},{now:3999,wet:false},{now:4000,wet:false},{now:5000,wet:true},{now:8999,wet:false},{now:9000,wet:false}];let now=9000,seed=22;
 for(let n=0;n<300;n++){seed=(seed*1664525+1013904223)>>>0;now=(now+seed%1700)>>>0;events.push({now,wet:seed%9===0});}
 events.push({now:0xfffff000,wet:true});now=0xfffff000;
 for(let n=0;n<100;n++){now=(now+137)>>>0;events.push({now,wet:n===8});}
 await writeFile(join(dir,'Servo.h'),'// Servo API supplied by the native harness.\n');
 await writeFile(join(dir,'mock.hpp'),`#include <cstdint>\n#include <cstdlib>\n#include <iostream>\n#include <string>\nusing byte=unsigned char;const int INPUT=0,LOW=0,HIGH=1;uint32_t tick=0;bool wetInput=false;std::string out;void pinMode(int p,int mode){if(p!=2||mode!=INPUT)abort();}uint32_t millis(){return tick;}int digitalRead(int p){if(p!=2)abort();return wetInput?LOW:HIGH;}struct Servo{int angle=-1,writes=0;void write(int value){if(value!=35&&value!=130)abort();angle=value;++writes;}void attach(int pin){if(pin!=9||angle!=35)abort();}};struct SerialMock{void begin(int baud){if(baud!=115200)abort();}void print(const char*s){out+=s;}void println(const char*s){out+=s;}}Serial;\n// AVR unsigned long is 32-bit; adapt only the native ABI after standard headers.\n#define long int\n`);
 await writeFile(join(dir,'actual.cpp'),program.rainClotheslineProgram.source+`\nstatic_assert(sizeof(unsigned long)==4);int main(){setup();uint32_t events[][2]={${events.map(e=>'{'+e.now+'u,'+Number(e.wet)+'}').join(',')}};for(auto&e:events){tick=e[0];wetInput=e[1];out.clear();loop();std::cout<<covered<<","<<lastWet<<","<<lastReport<<","<<lineServo.angle<<","<<lineServo.writes<<"|"<<out<<"\\n";}}`);
 execFileSync('/usr/bin/c++',['-std=c++17','-I',dir,'-include',join(dir,'mock.hpp'),join(dir,'actual.cpp'),'-o',join(dir,'actual')]);
 const rows=execFileSync(join(dir,'actual'),{encoding:'utf8'}).trim().split('\n');let s=m.rainInitial(),writes=1;
 for(const [n,e]of events.entries()){const old=s;s=m.rainStep(s,e.now,e.wet);if(old.covered!==s.covered)writes++;const report=s.rows!==old.rows?s.rows.at(-1).text:'';assert.equal(rows[n],`${+s.covered},${s.lastWet},${s.lastReport},${s.commandAngle},${writes}|${report}`,'iteration '+n);}
 assert.equal(rows.length,events.length);
 }finally{await rm(dir,{recursive:true,force:true});}
});
