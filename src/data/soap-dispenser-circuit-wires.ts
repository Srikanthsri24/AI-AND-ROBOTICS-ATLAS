import {soapUnoContact,soapBreadboardContact} from './soap-dispenser-electronics';
import {soapSupplyContact} from './soap-dispenser-supply';
import {soapServoContact} from './soap-servo-lead';
import type {SoapWirePoint as P} from './soap-dispenser-sonar-wires';
export type SoapCircuitPort={kind:'male-up'|'male-servo'|'bare-supply';point:P;axis:P;label:string;clamp?:string};
const up=(mouth:P,label:string):SoapCircuitPort=>({kind:'male-up',point:[mouth[0],mouth[1]-5,mouth[2]],axis:[0,1,0],label});
const supply=(polarity:'positive'|'negative',index:number):SoapCircuitPort=>({kind:'bare-supply',point:soapSupplyContact(polarity,index),axis:[0,0,1],label:'Servo supply '+(polarity==='positive'?'+5 V':'negative')+' '+(index+1),clamp:'soap-supply-'+polarity+'-'+index});
const servo=(role:string):SoapCircuitPort=>({kind:'male-servo',point:soapServoContact(role),axis:[0,0,1],label:'Servo '+role});
export const soapCircuitWires=[
 {id:'soap-wire-uno-ground',label:'Common reference · Uno GND → column 9 a',color:'#596272',a:up(soapUnoContact('GND-P1'),'Uno GND-P1'),b:up(soapBreadboardContact(8,-1,0),'Mini board · column 9 a'),what:'Connects the mini-board ground strip to the controller reference.',connection:'Column 9 a–e links this conductor to the sonar return at b and supply-negative bridge at c. No plastic or metal stand provides ground.'},
 {id:'soap-wire-supply-reference',label:'Common reference · supply negative → column 9 c',color:'#56616d',a:supply('negative',1),b:up(soapBreadboardContact(8,-1,2),'Mini board · column 9 c'),what:'Provides the shared zero-volt reference for the Uno D9 servo command.',connection:'The supply’s two negative terminals are linked internally. One feeds the brown servo lead; this second terminal joins the Uno/sonar ground strip. Servo positive stays separate from Uno 5 V.'},
 {id:'soap-wire-servo-negative',label:'Servo power · supply negative → brown lead',color:'#745039',a:supply('negative',0),b:servo('negative'),what:'Carries servo return current to its separate low-voltage supply.',connection:'The stripped end seats under the negative clamp. The square male end enters the labelled brown-contact channel in the existing servo plug.'},
 {id:'soap-wire-servo-positive',label:'Servo power · separate +5 V → red lead',color:'#c45160',a:supply('positive',0),b:servo('positive'),what:'Powers the servo independently of USB logic power.',connection:'The stripped end seats under the positive clamp; the male end enters the red-contact channel. Never substitute the Uno 5 V socket for this separate motor supply.'},
 {id:'soap-wire-servo-signal',label:'Servo command · Uno D9 → orange lead',color:'#d29a49',a:up(soapUnoContact('D9'),'Uno D9'),b:servo('signal'),what:'Carries the servo position command, not motor supply current.',connection:'D9 requests 35° at rest and 65° for one press. Physical motion also needs separate servo power and the common-ground bridge.'},
] as const;
/** Inner supply egress first, outer reference last, to keep withdrawn leads clear. */
export const soapCircuitFittingOrder=[0,3,2,1,4] as const;
export const soapCircuitFittingTotal=soapCircuitWires.length*2;
const step=(p:P,d:P,n:number):P=>[p[0]+d[0]*n,p[1]+d[1]*n,p[2]+d[2]*n];
export function soapCircuitExit(port:SoapCircuitPort):P{return step(port.point,port.axis,port.kind==='bare-supply'?9:port.kind==='male-servo'?13.5:12.5);}
export function soapCircuitWireRoute(index:number):readonly P[]{const w=soapCircuitWires[index];if(!w)throw new RangeError('Unknown dispenser circuit wire');const a=soapCircuitExit(w.a),b=soapCircuitExit(w.b);let middle:P[];
 if(index===0)middle=[[a[0],47,a[2]],[-90,47,a[2]],[-90,47,-120],[b[0],47,-120],[b[0],47,b[2]]];
 else if(index===1)middle=[[a[0],a[1],108],[-210,a[1],108],[-210,37,108],[-210,37,b[2]],[b[0],37,b[2]]];
 else if(index===4)middle=[[a[0],90,a[2]],[a[0],90,-86],[b[0],90,-86],[b[0],208,-86],[b[0],208,-29],[b[0],b[1],-29]];
 else {const positive=index===3,x=positive?-205:-200,z=positive?96:102,h=positive?86:82,aft=positive?-82:-78,y=positive?212:216,front=positive?-31:-33;middle=[[a[0],a[1],z],[x,a[1],z],[x,h,z],[x,h,aft],[b[0],h,aft],[b[0],y,aft],[b[0],y,front],[b[0],b[1],front]];}
 return [a,step(a,w.a.axis,5),...middle,step(b,w.b.axis,5),b];}
const clamp=(x:number)=>Math.max(0,Math.min(1,x)),ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
export function soapCircuitInsertion(kind:SoapCircuitPort['kind'],phase:number){return kind==='bare-supply'?ease((phase-.2)/.65):ease(phase);}
export function soapCircuitClampRelease(phase:number){return phase<=0||phase>=1?0:phase<.2?ease(phase/.2):phase<=.85?1:1-ease((phase-.85)/.15);}
export function soapCircuitWirePose(index:number,cursor:number){if(!Number.isFinite(cursor))throw new RangeError('Invalid circuit fitting cursor');const w=soapCircuitWires[index];if(!w)throw new RangeError('Unknown dispenser circuit wire');const ordinal=soapCircuitFittingOrder.indexOf(index as 0|1|2|3|4),a=clamp(cursor-ordinal*2),b=clamp(cursor-ordinal*2-1),offset=(p:SoapCircuitPort,t:number):P=>step([0,0,0],p.axis,(p.kind==='male-servo'?7:10)*(1-soapCircuitInsertion(p.kind,t))),source=offset(w.a,a),destination=offset(w.b,b),route=soapCircuitWireRoute(index),points=route.map((p,n):P=>{const wa=1-ease((n-2)/2),wb=ease((n-(route.length-5))/2);return [p[0]+source[0]*wa+destination[0]*wb,p[1]+source[1]*wa+destination[1]*wb,p[2]+source[2]*wa+destination[2]*wb];});return {visible:cursor>ordinal*2,source,destination,points,sourcePhase:a,destinationPhase:b,sourceSeated:a===1,destinationSeated:b===1};}
export function soapCircuitClamps(cursor:number){if(!Number.isFinite(cursor))throw new RangeError('Invalid circuit fitting cursor');return Object.fromEntries(soapCircuitWires.flatMap((w,i)=>w.a.clamp?[[w.a.clamp,soapCircuitClampRelease(clamp(cursor-soapCircuitFittingOrder.indexOf(i as 0|1|2|3|4)*2))]]:[]));}
export const soapCircuitWireParts=soapCircuitWires.map(({id,label,what,connection})=>({id,label,what,connection}));
