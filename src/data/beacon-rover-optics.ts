import type {CarPoint} from './bluetooth-car-layout';
/** Atlas scene units are 50 mm. This is an illustrative light / CdS response, not a lux calibration. */
export const beaconOpticalHardware={cellRadius:.055,hoodInnerRadius:.10,hoodOuterRadius:.108,hoodLength:.18,sensors:[{id:'left',at:[-1.18,1.34,-2.12] as CarPoint,yaw:.06},{id:'right',at:[1.18,1.34,-2.12] as CarPoint,yaw:-.06}],lamp:[0,1.49,-9] as CarPoint};
export type BeaconOpticalPose={x:number;z:number;yaw:number;lift:number};
export type BeaconOpticalReading={at:CarPoint;distance:number;cosine:number;aperture:number;direct:number;resistance:number;voltage:number;raw:number};
export type BeaconLamp={at:CarPoint;yaw:number;on:boolean;power:number};
const dot=(a:CarPoint,b:CarPoint)=>a.reduce((sum,v,i)=>sum+v*b[i],0),clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/** Visible area of the circular sensing face through the cylindrical hood's mouth. */
export function beaconApertureFraction(shift:number,cellRadius=beaconOpticalHardware.cellRadius,mouthRadius=beaconOpticalHardware.hoodInnerRadius){
 const d=Math.abs(shift),r=cellRadius,R=mouthRadius;if(d>=r+R)return 0;if(d<=Math.abs(R-r))return Math.min(1,R*R/(r*r));
 const a=Math.acos(clamp((d*d+r*r-R*R)/(2*d*r),-1,1)),b=Math.acos(clamp((d*d+R*R-r*r)/(2*d*R),-1,1)),radical=Math.max(0,(-d+r+R)*(d+r-R)*(d-r+R)*(d+r+R));
 return clamp((r*r*a+R*R*b-.5*Math.sqrt(radical))/(Math.PI*r*r),0,1);
}
export function beaconSensorPosition(index:0|1,pose:BeaconOpticalPose):CarPoint{const p=beaconOpticalHardware.sensors[index].at,c=Math.cos(pose.yaw),s=Math.sin(pose.yaw);return [pose.x+c*p[0]+s*p[2],p[1]+pose.lift,pose.z-s*p[0]+c*p[2]];}
export function beaconOptics(pose:BeaconOpticalPose,lamp:BeaconLamp,ambient=.006){return ([0,1] as const).map(index=>{
 const sensor=beaconOpticalHardware.sensors[index],at=beaconSensorPosition(index,pose),delta=lamp.at.map((v,i)=>v-at[i]) as CarPoint,distance=Math.hypot(...delta),ray=delta.map(v=>v/Math.max(.001,distance)) as CarPoint,yaw=pose.yaw+sensor.yaw,normal:CarPoint=[-Math.sin(yaw),0,-Math.cos(yaw)],side:CarPoint=[Math.cos(yaw),0,-Math.sin(yaw)],cosine=dot(normal,ray),beamCosine=-(ray[0]*Math.sin(lamp.yaw)+ray[2]*Math.cos(lamp.yaw));
 const shift=cosine>0?beaconOpticalHardware.hoodLength*Math.hypot(dot(side,ray),ray[1])/cosine:Infinity,aperture=beaconApertureFraction(shift),beam=beamCosine>Math.cos(.80)?beamCosine*beamCosine:0;
 const direct=lamp.on?clamp(lamp.power,0,1)*44/Math.max(.25,distance*distance)*Math.max(0,cosine)*aperture*beam:0,illumination=Math.max(0,ambient)+direct,resistance=200000/(1+40*illumination),voltage=5*10000/(10000+resistance),raw=Math.round(1023*voltage/5);
 return {at,distance,cosine,aperture,direct,resistance,voltage,raw};
}) as [BeaconOpticalReading,BeaconOpticalReading];}
