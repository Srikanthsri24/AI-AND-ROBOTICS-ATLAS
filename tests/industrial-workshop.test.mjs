import test from'node:test';import assert from'node:assert/strict';import ts from'typescript';import{readFile,mkdtemp,writeFile,rm}from'node:fs/promises';import{spawnSync}from'node:child_process';import{tmpdir}from'node:os';import{join}from'node:path';
const cache=new Map();async function load(name){if(cache.has(name))return cache.get(name);let code=ts.transpileModule(await readFile(new URL('../src/data/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;for(const match of[...code.matchAll(/from ['"]\.\/([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(match[1])+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(name,uri);return uri;}
const m=await import(await load('industrial-workshop')),source=await import(await load('industrial-monitor'));
const defaults={...m.industrialDefaults,powered:true},initial=()=>({...m.industrialInitial(),playing:true}),advance=(s,ms,input={})=>m.industrialAdvance(s,ms,{...defaults,...input});
function press(s,input={}){s=advance(s,31,{...input,buttonPressed:true});return advance(s,31,{...input,buttonPressed:false});}
test('ADC rounding reaches each real sketch threshold at the exact first count',()=>{assert.equal(m.industrialIndex(762),74);assert.equal(m.industrialIndex(763),75);assert.equal(m.industrialIndex(659),64);assert.equal(m.industrialIndex(660),65);assert.equal(m.industrialIndex(0),0);assert.equal(m.industrialIndex(1023),100);for(const adc of[-1,1024,.5,NaN])assert.throws(()=>m.industrialIndex(adc));});
test('a start edge is qualified for 30 ms; holding the button does not keep toggling',()=>{let s=advance(initial(),0);s=advance(s,30,{buttonPressed:true});assert.equal(s.running,false);s=advance(s,1,{buttonPressed:true});assert.equal(s.running,true);s=advance(s,1000,{buttonPressed:true});assert.equal(s.running,true);assert.equal(s.stablePressed,true);});
test('unsafe conditions latch a trip and clearing the knob cannot restart the model',()=>{let s=press(advance(initial(),0));assert.equal(s.running,true);s=advance(s,1,{temperatureAdc:763});assert.equal(s.tripped,true);assert.equal(s.running,false);s=advance(s,100);assert.equal(s.tripped,true);s=press(s);assert.equal(s.tripped,false);assert.equal(s.running,false);s=press(s);assert.equal(s.running,true);s=press(s);assert.equal(s.running,false);});
test('vibration and an open NC stop loop trip independently, including a broken-loop scenario',()=>{for(const input of[{vibrationAdc:660},{stopOpen:true}]){let s=press(advance(initial(),0));s=advance(s,1,input);assert.deepEqual(m.industrialOutputs(s,true),{green:false,red:true});s=press(s,input);assert.equal(s.tripped,true);assert.equal(s.running,false);}});
test('a held start button cannot acknowledge after an unsafe condition clears',()=>{let s=advance(initial(),40,{temperatureAdc:800,buttonPressed:true});assert.equal(s.stablePressed,true);s=advance(s,100,{buttonPressed:true});assert.equal(s.tripped,true);s=advance(s,31,{buttonPressed:false});s=press(s);assert.equal(s.tripped,false);assert.equal(s.running,false);});
test('bounces restart qualification and a release must qualify before the next press',()=>{let s=advance(initial(),0);s=advance(s,15,{buttonPressed:true});s=advance(s,5);s=advance(s,20,{buttonPressed:true});assert.equal(s.running,false);s=advance(s,11,{buttonPressed:true});assert.equal(s.running,true);s=advance(s,10);s=advance(s,100,{buttonPressed:true});assert.equal(s.running,true);});
test('read-only telemetry reports actual local values every 500 ms and outage never disables the latch',()=>{let s=advance(initial(),499);assert.equal(s.reports,0);s=advance(s,1);assert.equal(s.serial,'500,20,18,0,READY');s=advance(s,500,{link:false,stopOpen:true});assert.equal(s.serial,'1000,20,18,1,TRIPPED');assert.equal(s.sent,1);assert.equal(s.packet,'500,20,18,0,READY');assert.equal(s.tripped,true);s=advance(s,500);assert.equal(s.packet,'1500,20,18,0,TRIPPED');});
test('network setup remains boot-latched; power reset clears the latch and permits a new setup',()=>{let s=advance(initial(),1000,{networkReady:false});s=advance(s,1000,{networkReady:true});assert.equal(s.sent,0);assert.equal(s.reports,4);s=advance(s,0,{powered:false});assert.equal(s.booted,false);s=advance(s,500);assert.equal(s.sent,1);assert.deepEqual(m.industrialOutputs(s,false),{green:false,red:false});});
test('pause, fixed-step subdivision and unsigned millis rollover preserve the source semantics',()=>{const s=advance(initial(),200);assert.deepEqual(advance(advance(s,87,{buttonPressed:true}),123,{buttonPressed:true}),advance(s,210,{buttonPressed:true}));const p={...s,playing:false};assert.equal(advance(p,1000),p);const wrap=2**32,state={...s,rawPressed:true,stablePressed:false,changed:wrap-15,lastSend:wrap-485};const tick=m.industrialLoop(state,15,{...defaults,buttonPressed:true});assert.equal(tick.running,true);assert.equal(tick.serial,'15,20,18,0,RUNNING');});
test('remote stale data retains the last local state until an accepted new record arrives',()=>{let r=m.industrialReceive(m.industrialReceiverInitial(),'500,20,18,0,RUNNING',1,500);assert.equal(m.industrialFresh(r,2499),true);assert.equal(m.industrialFresh(r,2500),false);const old=r;r=m.industrialReceive(r,'1000,75,18,0,TRIPPED',1,1000);assert.equal(r,old);assert.equal(r.record.status,'RUNNING');r=m.industrialReceive(r,'1500,75,18,0,TRIPPED',2,3000);assert.equal(r.record.status,'TRIPPED');assert.equal(m.industrialFresh(r,3000),true);});
test('malformed packets and duplicate sequences do not invent fresh data',()=>{const r=m.industrialReceive(m.industrialReceiverInitial(),'500,20,18,0,READY',4,500);for(const text of['x,20,18,0,READY','500,101,18,0,READY','500,20,18,2,READY','500,20,18,0,ALARM','500,20,18,0,READY,extra','500,20,18,0,RÉADY','9007199254740992,20,18,0,READY']){assert.equal(m.industrialParsePacket(text),null);assert.equal(m.industrialReceive(r,text,5,10000),r);}const restart=m.industrialReceive(r,'0,20,18,0,READY',1,600);assert.equal(restart.record.uptimeMs,0);assert.equal(restart.receivedAt,600);});
test('the supplied Arduino sketch agrees loop-for-loop with the browser controller, including rollover and boot-time network failure',async t=>{
 const compiler=['clang++','g++'].find(c=>spawnSync(c,['--version'],{encoding:'utf8'}).status===0);if(!compiler){t.skip('A local C++ compiler is required for the source-execution parity check.');return;}
 const dir=await mkdtemp(join(tmpdir(),'atlas-industrial-'));
 try{
 // Match AVR's 32-bit unsigned long and its printf format on the host; rule/control flow is unchanged.
 const sketch=source.industrialProgram.source.replace(/^#include.*$/gm,'').replace(/unsigned long/g,'uint32_t').replace(/%lu/g,'%u');
 const harness=String.raw`#include <cstdint>
#include <cstdio>
#include <cstring>
#include <iostream>
#include <string>
using byte=uint8_t;
const int HIGH=1,LOW=0,INPUT_PULLUP=2,OUTPUT=1,A0=0,A1=1,LinkOFF=0;
uint32_t hostNow=0;int adcTemp=205,adcVib=184;bool hostStop=false,hostPress=false,hostLink=true,hostNetwork=true;
int green=0,red=0,reports=0,sent=0;std::string serialText,packetText;
uint32_t millis(){return hostNow;}
int analogRead(int pin){return pin==A0?adcTemp:adcVib;}
int digitalRead(int pin){return pin==2?(hostStop?HIGH:LOW):(hostPress?LOW:HIGH);}
void pinMode(int,int){}
void digitalWrite(int pin,int value){if(pin==5)green=value;if(pin==6)red=value;}
struct SerialType{void begin(int){}void println(const char* text){serialText=text;reports++;}}Serial;
struct IPAddress{IPAddress(int,int,int,int){}};
struct EthernetType{bool begin(byte*,int,int){return hostNetwork;}int linkStatus(){return hostLink?1:LinkOFF;}}Ethernet;
struct EthernetUDP{bool begin(int){return true;}bool beginPacket(IPAddress,int){return true;}void write(const uint8_t* p,size_t n){packetText.assign((const char*)p,n);}void endPacket(){sent++;}};
`+sketch+String.raw`
int main(int argc,char** argv){hostNetwork=argc<2||std::string(argv[1])!="0";setup();uint64_t stamp;int stop,press,link;
while(std::cin>>stamp>>adcTemp>>adcVib>>stop>>press>>link){hostNow=(uint32_t)stamp;hostStop=stop;hostPress=press;hostLink=link;loop();
std::cout<<hostNow<<"|"<<running<<"|"<<tripped<<"|"<<(!rawButton)<<"|"<<(!stableButton)<<"|"<<changed<<"|"<<lastSend<<"|"<<green<<"|"<<red<<"|"<<reports<<"|"<<sent<<"|"<<serialText<<"|"<<packetText<<'\n';}}
`;
 const cpp=join(dir,'parity.cpp'),bin=join(dir,'parity');await writeFile(cpp,harness);const built=spawnSync(compiler,['-std=c++17','-O0',cpp,'-o',bin],{encoding:'utf8'});assert.equal(built.status,0,built.stderr);
 const events=new Map([[10,{buttonPressed:true}],[20,{buttonPressed:false}],[25,{buttonPressed:true}],[70,{buttonPressed:false}],[110,{temperatureAdc:763}],[160,{temperatureAdc:762}],[180,{buttonPressed:true}],[230,{buttonPressed:false}],[280,{buttonPressed:true}],[330,{buttonPressed:false}],[350,{vibrationAdc:660}],[430,{vibrationAdc:659}],[500,{stopOpen:true,link:false}],[570,{stopOpen:false}],[600,{buttonPressed:true}],[650,{buttonPressed:false}],[700,{buttonPressed:true}],[750,{buttonPressed:false}],[1000,{link:true}]]);
 for(const network of[true,false]){let input={...defaults,networkReady:network},s={...initial(),booted:true,network},stdin='',expected=[];
 const times=[...Array.from({length:1501},(_,i)=>i),...Array.from({length:101},(_,i)=>2**32-50+i)];
 for(const stamp of times){if(events.has(stamp))input={...input,...events.get(stamp)};if(stamp===2**32-20)input={...input,buttonPressed:true};s=m.industrialLoop(s,stamp>>>0,input);stdin+=`${stamp} ${input.temperatureAdc} ${input.vibrationAdc} ${+input.stopOpen} ${+input.buttonPressed} ${+input.link}\n`;expected.push([stamp>>>0,+s.running,+s.tripped,+s.rawPressed,+s.stablePressed,s.changed,s.lastSend,+s.running,+s.tripped,s.reports,s.sent,s.serial,s.packet??''].join('|'));}
 const run=spawnSync(bin,[network?'1':'0'],{input:stdin,encoding:'utf8'});assert.equal(run.status,0,run.stderr);const actual=run.stdout.trimEnd().split('\n');assert.equal(actual.length,expected.length);for(let i=0;i<expected.length;i++)assert.equal(actual[i],expected[i],`C++ parity at sample ${i}, network setup ${network}`);}
 }finally{await rm(dir,{recursive:true,force:true});}
});
