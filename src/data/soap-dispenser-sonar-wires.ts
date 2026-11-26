import {soapUnoContact,soapBreadboardContact} from './soap-dispenser-electronics';
import {soapSonarPins,soapSonarContact} from './soap-dispenser-sonar';
export type SoapWirePoint=readonly[number,number,number];
export type SoapSonarWirePort={kind:'male-up'|'female-sonar';point:SoapWirePoint;axis:SoapWirePoint;label:string};
const step=(p:SoapWirePoint,d:SoapWirePoint,n:number):SoapWirePoint=>[p[0]+d[0]*n,p[1]+d[1]*n,p[2]+d[2]*n];
export const soapSonarWires=soapSonarPins.map((pin,n)=>{
 const mouth=n===3?soapBreadboardContact(8,-1,1):soapUnoContact(pin.pin==='5 V'?'5V':pin.pin),source=n===3?'Mini board · column 9 b':'Uno '+pin.pin;
 return {id:'soap-wire-sonar-'+pin.name.toLowerCase(),label:pin.name+' jumper · '+source+' → HC-SR04',color:pin.color,
 a:{kind:'male-up',point:[mouth[0],mouth[1]-5,mouth[2]],axis:[0,1,0],label:source} as SoapSonarWirePort,
 b:{kind:'female-sonar',point:soapSonarContact(pin.id),axis:[0,0,-1],label:'HC-SR04 '+pin.name} as SoapSonarWirePort,
 what:n===0?'Carries Uno 5 V to the sonar electronics; this is separate from servo-positive power.':n===1?'Carries the 10 µs acquisition request from Uno D2.':n===2?'Carries the sonar’s timed echo pulse to Uno D3.':'Returns sonar current to column 9 a–e of the mini board. This strip still needs its own Uno-ground connection.',
 connection:'The square male pin seats inside '+source+'. The open female connector slides onto the actual '+pin.name+' header pin. Its spring faces contact the flat sides; insulation stays outside the header housing.'};
});
export const soapSonarFittingTotal=soapSonarWires.length*2;
export function soapSonarWireRoute(index:number):readonly SoapWirePoint[]{const w=soapSonarWires[index];if(!w)throw new RangeError('Unknown soap sonar jumper');const a=step(w.a.point,w.a.axis,12.5),b=step(w.b.point,w.b.axis,4.5),h=50+index*6,x=-55-index*4,z=-45-index*4;return [a,step(a,w.a.axis,5),[a[0],h,a[2]],[x,h,a[2]],[x,h,z],[x,100,z],[x,200,z],[x,b[1],z],[b[0],b[1],z],[b[0],b[1],75],b];}
const clamp=(x:number)=>Math.max(0,Math.min(1,x)),ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
/** Independent source/destination insertion; rigid terminal tails and a bending middle. */
export function soapSonarWirePose(index:number,cursor:number){if(!Number.isFinite(cursor))throw new RangeError('Invalid sonar fitting cursor');const w=soapSonarWires[index];if(!w)throw new RangeError('Unknown soap sonar jumper');const a=clamp(cursor-index*2),b=clamp(cursor-index*2-1),source=step([0,0,0],w.a.axis,10*(1-ease(a))),destination=step([0,0,0],w.b.axis,10*(1-ease(b))),route=soapSonarWireRoute(index),points=route.map((p,n):SoapWirePoint=>{const a=1-ease((n-2)/2),b=ease((n-(route.length-5))/2);return [p[0]+source[0]*a+destination[0]*b,p[1]+source[1]*a+destination[1]*b,p[2]+source[2]*a+destination[2]*b];});return {visible:cursor>index*2,source,destination,points,sourceSeated:a===1,destinationSeated:b===1};}
export const soapSonarWireParts=soapSonarWires.map(({id,label,what,connection})=>({id,label,what,connection}));
