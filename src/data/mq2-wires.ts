import {mq2Hole,mq2UnoContact,mq2WorkbenchLayout,type Mq2Point as P} from './mq2-workbench-layout';
import {mq2ModuleLayout} from './mq2-module-layout';
export type Mq2Mode='dial'|'sensor';
export type Mq2Wire={id:string;name:string;from:P;to:P;color:string;fromKind:'pin'|'female'|'clamp';toKind?:'pin'|'clamp';connection:string};
export function mq2ModulePin(pin:'DOUT'|'AOUT'|'GND'|'VCC'):P{
 const n=mq2ModuleLayout.header.pins.indexOf(pin),b=mq2WorkbenchLayout.module;
 return [b[0]+45.5,b[1]+2.85,b[2]-mq2ModuleLayout.header.z[n]];
}
/** One physical A0 jumper changes its destination; no second source is wired to A0. */
export function mq2Wires(mode:Mq2Mode):readonly Mq2Wire[]{return [
 {id:'mq2-wire-a0',name:mode==='dial'?'A0 to test-dial wiper':'A0 to divider midpoint',from:mq2UnoContact('A0'),to:mode==='dial'?mq2Hole(14,1,0):mq2Hole(5,-1,4),color:'#b9a157',fromKind:'pin',connection:mode==='dial'?'Uno A0 → dial centre strip. Sensor divider stays disconnected from A0.':'Uno A0 → shared ends of the two 10 kΩ resistors. Dial wiper stays disconnected from A0.'},
 {id:'mq2-wire-ground',name:'Uno ground reference',from:mq2UnoContact('GND-P2'),to:mq2Hole(16,1,0),color:'#3e4955',fromKind:'pin',connection:'Uno GND → five-contact common-return strip, column 16.'},
 {id:'mq2-wire-d6',name:'D6 to 220 Ω resistor',from:mq2UnoContact('D6'),to:mq2Hole(6,1,4),color:'#b26071',fromKind:'pin',connection:'Uno D6 → 220 Ω resistor → red LED anode.'},
 {id:'mq2-wire-dial-power',name:'5 V to dial outer terminal',from:mq2UnoContact('5V'),to:mq2Hole(13,1,0),color:'#b45262',fromKind:'pin',connection:'Uno 5 V → one end of the separate test potentiometer.'},
 {id:'mq2-wire-dial-return',name:'Dial return',from:mq2Hole(15,1,0),to:mq2Hole(16,1,1),color:'#48535e',fromKind:'pin',connection:'Other potentiometer end → common ground. The centre terminal is the wiper.'},
 {id:'mq2-wire-led-return',name:'LED cathode return',from:mq2Hole(11,1,0),to:mq2Hole(16,1,2),color:'#48535e',fromKind:'pin',connection:'LED cathode strip → common ground. Its anode strip connects only through the 220 Ω resistor.'},
 {id:'mq2-wire-divider-return',name:'Lower divider resistor return',from:mq2Hole(9,-1,4),to:mq2Hole(16,1,3),color:'#48535e',fromKind:'pin',connection:'Lower 10 kΩ resistor → common ground. Both divider resistors meet at column 5 of the negative bank.'},
 {id:'mq2-wire-module-signal',name:'MQ-2 AOUT to upper resistor',from:mq2ModulePin('AOUT'),to:mq2Hole(1,-1,4),color:'#699cb0',fromKind:'female',connection:'Module AOUT → upper 10 kΩ resistor. DOUT remains open.'},
 {id:'mq2-wire-module-power',name:'Separate 5 V to module VCC',from:mq2ModulePin('VCC'),to:[127,14.8,-20],color:'#bd5364',fromKind:'female',toKind:'clamp',connection:'Regulated supply positive clamp → module VCC. Uno 5 V does not supply the module heater.'},
 {id:'mq2-wire-module-ground',name:'Module supply return',from:mq2ModulePin('GND'),to:[132.35,14.8,-20],color:'#3e4955',fromKind:'female',toKind:'clamp',connection:'Module GND → regulated supply negative clamp.'},
 {id:'mq2-wire-supply-reference',name:'Separate supply to common ground',from:[133.65,14.8,-20],to:mq2Hole(16,1,4),color:'#3e4955',fromKind:'clamp',connection:'Second conductor in the negative supply clamp → common return strip → Uno GND.'},
 ];}
/** Initial seated routes; fixed lanes preserve component endpoint positions.
 * Clearance / fitting sweeps remain separate from electrical-topology checks. */
export function mq2WireRoute(w:Mq2Wire,index:number,withdrawA=0,withdrawB=0):P[]{
 if(![withdrawA,withdrawB].every(v=>Number.isFinite(v)&&v>=0&&v<=16))throw new RangeError('Connector withdrawal must be 0–16 mm');
 const a:P=w.fromKind==='female'?[w.from[0]+7,w.from[1],w.from[2]]:w.fromKind==='clamp'?[w.from[0],w.from[1],w.from[2]+10.7]:[w.from[0],w.from[1]+7.5,w.from[2]],b:P=w.toKind==='clamp'?[w.to[0],w.to[1],w.to[2]+10.7]:[w.to[0],w.to[1]+7.5,w.to[2]],h=index===2?39:43+index*2,lane=index===0?-35:index===8?40:index===9?12:8+index*2;
 const offset=(p:P,kind:string,d:number):P=>kind==='female'?[p[0]+d,p[1],p[2]]:kind==='clamp'?[p[0],p[1],p[2]+d]:[p[0],p[1]+d,p[2]];
 const route:P[]=[a,w.fromKind==='female'?[a[0]+15,a[1],a[2]]:w.fromKind==='clamp'?[a[0],a[1]+4,a[2]+16]:[a[0],a[1]+15,a[2]],[a[0],h,a[2]-lane],[b[0],h,b[2]-lane],w.toKind==='clamp'?[b[0],b[1]+4,b[2]+16]:[b[0],b[1]+15,b[2]],b];
 route[0]=offset(route[0],w.fromKind,withdrawA);route[5]=offset(route[5],w.toKind??'pin',withdrawB);return route;
}

/** Fit lower / returning leads before the overpassing feeds. */
export const mq2FittingOrder=[1,2,5,3,4,0,6,9,7,8,10] as const;
/** Eleven independent leads, two fitting actions per lead. */
export function mq2WireSeating(index:number,cursor:number){
 if(!Number.isInteger(index)||index<0||index>10||!Number.isFinite(cursor)||cursor<0||cursor>22)throw new RangeError('Invalid MQ-2 wire fitting cursor');
 const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
 const order=mq2FittingOrder.indexOf(index as typeof mq2FittingOrder[number]);
 const a=(index===10?12:8)*(1-ease(cursor-order*2)),b=(index===8||index===9?12:8)*(1-ease(cursor-order*2-1));
 return {visible:cursor>=order*2,a,b,seated:a===0&&b===0};
}
