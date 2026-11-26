import {trafficParkingWires,trafficParkingWireRoute} from './traffic-parking-wires';
import type {ParkingWirePort} from './traffic-parking-wire-ports';
import type {ParkingPoint} from './traffic-parking-circuit-layout';
/** Fit the low return routes before the higher bus bridge. Supply-reference,
 * return and positive egress then fit from inside outward. Power stays off. */
export const trafficParkingFittingOrder=[1,3,4,7,10,13,16,19,22,5,8,11,14,17,20,23,25,27,26,24,28,32,6,15,9,18,12,21,0,2,29,31,30];
export const trafficParkingFittingTotal=trafficParkingFittingOrder.length*2;
export const trafficParkingClampLift=1;
export const trafficParkingClampTurns=3;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export function trafficParkingInsertion(kind:ParkingWirePort['kind'],phase:number){return kind==='bare-supply'?ease((phase-.2)/.65):ease(phase);}
export function trafficParkingClampRelease(phase:number){return phase<=0||phase>=1?0:phase<.2?ease(phase/.2):phase<=.85?1:1-ease((phase-.85)/.15);}
export function trafficParkingWithdrawal(kind:ParkingWirePort['kind']){return kind==='male-servo'?7:kind==='bare-supply'?10:6;}
/** First/last three route controls move as rigid tails. The intervening
 * smooth interpolation deforms the cable without detaching either boot. */
export function trafficParkingFittingPose(index:number,cursor:number){
 const wire=trafficParkingWires[index],ordinal=trafficParkingFittingOrder.indexOf(index);if(!wire||ordinal<0)throw new RangeError('Unknown parking jumper');if(!Number.isFinite(cursor))throw new RangeError('Invalid parking fitting cursor');
 const a=clamp(cursor-ordinal*2),b=clamp(cursor-ordinal*2-1),offset=(p:ParkingWirePort,t:number):ParkingPoint=>{const d=trafficParkingWithdrawal(p.kind)*(1-trafficParkingInsertion(p.kind,t));return d===0?[0,0,0]:[p.axis[0]*d,p.axis[1]*d,p.axis[2]*d];},source=offset(wire.a,a),destination=offset(wire.b,b),route=trafficParkingWireRoute(index);
 const points=route.map((p,n):ParkingPoint=>{const short=route.length<=7,t=short?ease((n-2)/Math.max(1,route.length-6)):0,wa=short?1-t:1-ease((n-(wire.a.kind==='bare-supply'||wire.a.kind==='male-servo'?3:2))/2),wb=short?t:ease((n-(route.length-6))/2);return [p[0]+source[0]*wa+destination[0]*wb,p[1]+source[1]*wa+destination[1]*wb,p[2]+source[2]*wa+destination[2]*wb];});
 return {visible:cursor>ordinal*2,source,destination,points,sourceSeated:a===1,destinationSeated:b===1,sourcePhase:a,destinationPhase:b};
}
export function trafficParkingFittingConnections(cursor:number){return Object.fromEntries(trafficParkingWires.map((w,n)=>{const p=trafficParkingFittingPose(n,cursor);return [w.id,[p.sourceSeated,p.destinationSeated] as const];}));}
export function trafficParkingFittingSupplyClamps(cursor:number){if(!Number.isFinite(cursor))throw new RangeError('Invalid parking fitting cursor');const result:Record<string,number>={};trafficParkingWires.forEach((w,n)=>{const ordinal=trafficParkingFittingOrder.indexOf(n);for(const [end,port] of [w.a,w.b].entries())if(port.kind==='bare-supply'){const [,polarity,index]=(end?w.to:w.from).split('.');result[`tp-supply-${polarity}-${index}`]=trafficParkingClampRelease(clamp(cursor-ordinal*2-end));}});return result;}
export const trafficParkingFittingChapters=trafficParkingFittingOrder.flatMap((index,ordinal)=>{const w=trafficParkingWires[index];return ([w.a,w.b] as const).map((port,end)=>({step:ordinal*2+end+1,wire:w.id,wireIndex:index,end,label:w.label+' · '+(end?'second end':'first end'),port:end?w.to:w.from,portLabel:port.label,instruction:port.kind==='male-up'?'Align the metal pin with '+port.label+' and lower it straight into the socket.':port.kind==='female-led'?'Align the open female socket behind '+port.label+' and slide it onto the LED leg.':port.kind==='male-servo'?'Align the pin with '+port.label+' in the three-way plug, then slide it straight in.':'Loosen the clamp at '+port.label+', insert the stripped conductor and tighten the screw.',explanation:w.connection,check:port.kind==='bare-supply'?'Both power sources stay off. Keep the insulated jacket outside the terminal and clamp only the bare conductor.':'Keep USB and the separate servo supply off. Check the named socket and leave the neighbouring contacts separate.'}));});
