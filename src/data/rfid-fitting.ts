import {rfidWires,rfidWireRoute} from './rfid-wires';
import type {RfidConnections} from './rfid-connections';
import type {RfidPoint} from './rfid-workbench-layout';
export const rfidFittingTotal=rfidWires.length*2;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** One chapter per connector. Travel is authored, in mm; continuity is only
 * established at the seated endpoint, never at first visual overlap. */
export function rfidFittingPose(index:number,cursor:number){
 const wire=rfidWires[index];if(!wire)throw new RangeError('Unknown RFID jumper');
 if(!Number.isFinite(cursor))throw new RangeError('Invalid fitting cursor');
 const progress=clamp(cursor-index*2),destinationProgress=clamp(cursor-index*2-1);
 const offset=(kind:string,t:number):RfidPoint=>kind==='pin'?[0,18*(1-t),0]:kind==='clamp'?[0,0,18*(1-t)]:[-18*(1-t),0,0];
 const source=offset(wire.fromKind,progress),destination=offset(wire.toKind,destinationProgress),route=rfidWireRoute(index);
 const points=route.map((p,n):RfidPoint=>{const t=n/(route.length-1);return [0,1,2].map(axis=>p[axis]+source[axis]*(1-t)+destination[axis]*t) as unknown as RfidPoint;});
 return {visible:cursor>index*2,source,destination,points,sourceSeated:progress===1,destinationSeated:destinationProgress===1};
}
export function rfidFittingConnections(cursor:number):RfidConnections{return Object.fromEntries(rfidWires.map((w,n)=>{const p=rfidFittingPose(n,cursor);return [w.id,[p.sourceSeated,p.destinationSeated] as const];}));}
