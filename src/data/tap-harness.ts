import type{TapPoint}from'./tap-plumbing';
import type{TapSettings}from'./automatic-tap-session';
import {tapUnoContact,tapBreadboardContact}from'./tap-electronics';
import {tapSonarContact}from'./tap-sensors';
import {tapDriverPad}from'./tap-driver';
import {tapPowerHeaderContact,tapPowerPresent}from'./tap-power';
import {tapPlumbing}from'./tap-plumbing';
import{tapLevelPlugContact}from'./tap-level-cable';
export type TapHarnessPort={node:string;label:string;point:TapPoint;kind:'socket'|'female-header'|'factory'|'clamp'|'motor-lug'|'header-clamp';axis:TapPoint;fixed?:boolean};
export type TapHarnessWire={id:string;label:string;color:string;a:TapHarnessPort;b:TapHarnessPort;why:string};
const up:TapPoint=[0,1,0],back:TapPoint=[0,0,-1];
const uno=(pin:string,node:string):TapHarnessPort=>({node,label:'Uno '+pin,point:tapUnoContact(pin),kind:'socket',axis:up});
const bus=(column:number,row:number):TapHarnessPort=>({node:`bb:${column}:-1`,label:`Breadboard column ${column+1}, bank a–e, row ${String.fromCharCode(97+row)}`,point:tapBreadboardContact(column,-1,row),kind:'socket',axis:up});
const sonar=(pin:string,node:string):TapHarnessPort=>({node,label:'HC-SR04 '+({vcc:'VCC',ground:'GND',trigger:'TRIG',echo:'ECHO'}[pin]??pin.toUpperCase()),point:tapSonarContact('tap-soap-sonar-'+pin),kind:'female-header',axis:back});
const level=(name:'vcc'|'ground'|'out'):TapHarnessPort=>({node:'level-plug-'+name,label:'SEN0485 factory connector '+({vcc:'VCC',ground:'GND',out:'OUT'}[name]),point:tapLevelPlugContact(name),kind:'socket',axis:[0,0,1]});
const stemma=(name:'ground'|'vin'|'signal'):TapHarnessPort=>({node:'stemma-'+name,label:'STEMMA factory '+({ground:'black GND',vin:'red VIN',signal:'white SIG'}[name])+' lead',point:[189,233.4,-66+({ground:2,vin:0,signal:-2}[name])],kind:'factory',axis:[-1,0,0],fixed:true});
const supply=(polarity:'positive'|'negative'):TapHarnessPort=>({node:'supply-'+polarity,label:'Pump supply '+(polarity==='positive'?'+5 V':'negative'),point:tapPowerHeaderContact(polarity),kind:'header-clamp',axis:[1,0,0]});
const output=(positive:boolean):TapHarnessPort=>({node:positive?'driver-out+':'driver-out-',label:positive?'Driver OUT+':'Driver OUT−',point:[215.9,234.4,-66+(positive?2:-2)],kind:'clamp',axis:[1,0,0]});
const motor=(positive:boolean):TapHarnessPort=>({node:positive?'motor+':'motor-',label:positive?'Pump positive terminal':'Pump negative terminal',point:[tapPlumbing.pump[0]+(positive?7:-7),tapPlumbing.pump[1],tapPlumbing.pump[2]-59],kind:'motor-lug',axis:back});
const referencePad=tapDriverPad('JP3','1');
export const tapReferenceHeaderPoint:TapPoint=[referencePad.point[0],239.5,referencePad.point[2]];
const wires:TapHarnessWire[]=[];
function wire(id:string,label:string,color:string,a:TapHarnessPort,b:TapHarnessPort,why:string){wires.push({id:'tap-wire-'+id,label,color,a,b,why});}
wire('logic','Uno 5 V → sensor supply strip','#cc5268',uno('5V','uno-5v'),bus(2,0),'Feeds only the two sensors. This strip is never joined to the independent pump-positive rail.');
wire('ground','Uno GND → sensor return strip','#394753',uno('GND-P1','uno-ground'),bus(8,0),'Returns sensor current and provides the common signal reference. Motor current takes the direct driver return lead.');
wire('sonar-vcc','Sensor supply → HC-SR04 VCC','#d95b6d',bus(2,1),sonar('vcc','sonar-vcc'),'The ultrasonic board needs the Uno-powered 5 V rail.');
wire('sonar-ground','Sensor return → HC-SR04 GND','#43515e',bus(8,1),sonar('ground','sonar-ground'),'A valid ground is required before TRIG and ECHO have a useful voltage reference.');
wire('trigger','Uno D2 → HC-SR04 TRIG','#d6a045',uno('D2','uno-d2'),sonar('trigger','sonar-trigger'),'Carries the sketch’s 10 µs acquisition pulse.');
wire('echo','HC-SR04 ECHO → Uno D3','#539cca',sonar('echo','sonar-echo'),uno('D3','uno-d3'),'Carries the timed echo pulse. Unavailable echo data stops a running tap.');
wire('level-vcc','SEN0485 red lead → sensor supply','#d45b6a',level('vcc'),bus(2,2),'Fit a male jumper between the intact factory VCC socket and the Uno 5 V strip.');
wire('level-ground','SEN0485 black lead → sensor return','#344350',level('ground'),bus(8,2),'Fit a male jumper from the intact factory GND socket to the Uno ground strip.');
wire('level-out','SEN0485 green OUT → Uno D4','#329d79',level('out'),uno('D4','uno-d4'),'Fit a male jumper from the intact factory OUT socket to D4. LOW means water reaches the sensor; an open signal prevents pumping.');
wire('driver-signal','STEMMA white SIG → Uno D9','#e2dfcf',stemma('signal'),uno('D9','uno-d9'),'The factory white lead carries the control signal, not the pump current. Fit the keyed three-pin plug as one operation.');
wire('driver-vin','STEMMA red VIN → pump supply +','#c6505a',stemma('vin'),supply('positive'),'The independent regulated supply feeds driver VIN and OUT+. Never bridge this positive rail to Uno 5 V.');
wire('driver-ground','STEMMA black GND → pump supply −','#303b49',stemma('ground'),supply('negative'),'The motor-current return goes directly to the independent supply, avoiding the mini breadboard.');
wire('reference','Driver GND reference → sensor return','#55516b',{node:'driver-reference',label:'GND-only breakout header',point:tapReferenceHeaderPoint,kind:'female-header',axis:up},bus(8,3),'Install the single GND reference header before this jumper. Its board trace joins STEMMA GND; leave VIN, SIG and OUT breakout pads unused.');
wire('motor-positive','Driver OUT+ → pump positive','#bd5159',output(true),motor(true),'Supplies the motor positive lug through the output terminal. Disconnect power before seating the conductor.');
wire('motor-negative','Driver switched OUT− → pump negative','#3c4755',output(false),motor(false),'The MOSFET switches this motor return. The pump can rotate only with both motor leads, VIN, return, signal and reference connected.');
export const tapHarnessWires:readonly TapHarnessWire[]=wires;
export type TapHarness={ends:Readonly<Record<string,readonly[boolean,boolean]>>;stemma:boolean;referenceHeader:boolean};
export function tapHarnessInitial():TapHarness{return{ends:Object.fromEntries(wires.map(w=>[w.id,[!!w.a.fixed,!!w.b.fixed]])),stemma:false,referenceHeader:false};}
export function tapHarnessSetEnd(s:TapHarness,id:string,end:0|1,fitted:boolean):TapHarness{const w=wires.find(w=>w.id===id);if(!w||end!==0&&end!==1)throw new RangeError('Unknown tap harness termination');if((end?w.b:w.a).fixed)throw new Error('A factory-attached lead is not a student termination');const pair=[...(s.ends[id]??[false,false])] as[boolean,boolean];pair[end]=fitted;return{...s,ends:{...s.ends,[id]:pair}};}
export const tapHarnessTasks=wires.flatMap(w=>([0,1]as const).filter(end=>!(end?w.b:w.a).fixed).map(end=>({wireId:w.id,end,label:(end?w.b:w.a).label})));
/** Conductor graph: components such as the motor winding and switched MOSFET
 * are deliberately not treated as permanent shorts between supply nodes. */
export function tapHarnessConnected(s:TapHarness,a:string,b:string){const edges=new Map<string,string[]>(),join=(x:string,y:string)=>{edges.set(x,[...(edges.get(x)??[]),y]);edges.set(y,[...(edges.get(y)??[]),x]);};
 for(const w of wires){const pair=s.ends[w.id]??[false,false];if((w.a.fixed||pair[0])&&(w.b.fixed||pair[1]))join(w.a.node,w.b.node);}
 for(const name of['vcc','ground','out'])join('level-'+name,'level-plug-'+name);join('driver-vin','driver-out+');if(s.referenceHeader)join('driver-ground','driver-reference');if(s.stemma)for(const name of['ground','vin','signal'])join('stemma-'+name,'driver-'+name);
 const seen=new Set<string>(),queue=[a];while(queue.length){const node=queue.pop()!;if(node===b)return true;if(seen.has(node))continue;seen.add(node);queue.push(...(edges.get(node)??[]));}return false;
}
export function tapHarnessSettings(s:TapHarness,input:{assembled:boolean;usb:boolean;supplyEnabled:boolean;barrelWithdrawal:number;echoPresent:boolean;distanceCm:number;water:boolean}):TapSettings{const has=(a:string,b:string)=>tapHarnessConnected(s,a,b);return{assembled:input.assembled,usb:input.usb,pumpPower:tapPowerPresent(input.supplyEnabled,input.barrelWithdrawal)&&has('driver-vin','supply-positive')&&has('driver-ground','supply-negative'),pumpCircuit:has('driver-out+','motor+')&&has('driver-out-','motor-'),driverReference:has('driver-ground','uno-ground'),driverSignal:has('driver-signal','uno-d9'),sensorPower:has('sonar-vcc','uno-5v'),sensorGround:has('sonar-ground','uno-ground'),trig:has('sonar-trigger','uno-d2'),echo:has('sonar-echo','uno-d3'),echoPresent:input.echoPresent,distanceCm:input.distanceCm,levelPower:has('level-vcc','uno-5v'),levelGround:has('level-ground','uno-ground'),levelSignal:has('level-out','uno-d4'),water:input.water};}
