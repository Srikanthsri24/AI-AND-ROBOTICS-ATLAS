import {CatmullRomCurve3,Vector3} from 'three';
import type {LidarMmPoint} from './lidar-workshop-layout';
/** Published 7 mm motor: 32 mm factory wires. The independently authored route exits the PCB edge before descending around the holder. */
export const lidarMotorWireSpec={length:32,radius:.225,reference:'https://www.bitcraze.io/documentation/hardware/motor_7mm/motor_7mm-datasheet.pdf'};
export function lidarMotorWirePoints(x:number,z:number,side:-1|1):LidarMmPoint[]{
 const angle=Math.atan2(x,z),radius=Math.hypot(x,z),points=(bulge:number):LidarMmPoint[]=>[[side*.6,1.2,-radius*.52+1.1],[side*2.8,1.8,-21.2],[side*3.7,1.4,-19.8],[side*(4+bulge),-6.5,-11],[side*(4+bulge),-11.8,-4.5],[side,-11.25,0]],curve=(b:number)=>new CatmullRomCurve3(points(b).map(p=>new Vector3(...p)),false,'centripetal');let lo=0,hi=6;
 if(curve(lo).getLength()>32||curve(hi).getLength()<32)throw Error('The factory motor wire cannot reach this station.');for(let i=0;i<35;i++){const b=(lo+hi)/2;if(curve(b).getLength()<32)lo=b;else hi=b;}
 return points((lo+hi)/2).map(([px,y,pz])=>[x+Math.cos(angle)*px+Math.sin(angle)*pz,y,z-Math.sin(angle)*px+Math.cos(angle)*pz]);
}
