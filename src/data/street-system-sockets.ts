import {streetSystemBranches,streetSystemDivider,type StreetPoint as P} from './street-system-layout';
export const streetSocketSpecs=[
 {id:'street-sensor-positive-socket',name:'Photoresistor positive socket',at:streetSystemDivider.sensorPositive,stage:4,node:'5v'},
 {id:'street-sensor-junction-socket',name:'Photoresistor junction socket',at:streetSystemDivider.sensorJunction,stage:4,node:'a0'},
 ...streetSystemBranches.flatMap((b,n)=>[
  {id:b.id+'-positive-socket',name:`Lamp ${n+1} anode lead socket`,at:b.positiveTail,stage:2,node:b.id+'-anode'},
  {id:b.id+'-return-socket',name:`Lamp ${n+1} cathode lead socket`,at:b.returnTail,stage:2,node:'gnd'},
 ]),
] as const;
export function streetLampTail(index:number,positive:boolean):P[]{
 const b=streetSystemBranches[index];if(!b)throw new RangeError('Unknown lamp');const sign=positive?-1:1,x=(b.anode[0]+b.cathode[0])/2,z=-35,tail=positive?b.positiveTail:b.returnTail;
 return [positive?b.anode:b.cathode,[x+sign*1.27,100,-17],[x+sign*1.27,100,-30],[x+sign*1.27,100,z],[x+sign*1.27,96,z],[x+sign*1.27,88,z],[x+sign*1.27,24,z],[x+sign*1.27,18,z],[x+sign*3,16,z],[x+sign*5,14.8,z],[tail[0],14.7,tail[2]]];
}

export function streetSensorLead(positive:boolean):P[]{
 const x=positive?-151.27:-148.73;
 return [[x,24.25,-90],[x,21,-92.5],[x,17,-92.5],[x,14.7,-92.5],[x,14.7,-89.5],[x,14.7,-86],[x,14.7,-85]];
}
