import {CatmullRomCurve3,Vector3} from 'three';
import {lidarHardwareReference as ref,type LidarMmPoint} from './lidar-workshop-layout';
export const lidarBatteryGeometry={mate:[5,2.5,22] as LidarMmPoint,unplug:4,housingWidth:6.6,housingHeight:3.4,maleDepth:4,femaleDepth:4.6,pinPitch:2,pinWidth:.4,maleReach:2};
export function lidarBatteryPlugAt(connected:number):LidarMmPoint{const d=lidarBatteryGeometry;if(!Number.isFinite(connected)||connected<0||connected>1)throw Error('Battery mating progress must be between zero and one.');return [d.mate[0],d.mate[1],d.mate[2]+d.unplug*(1-connected)];}
/** Fixed-length stock battery leads flex as the keyed housing moves, rather than stretching. */
export function lidarBatteryWire(connected:number,pin:1|2){
 const d=lidarBatteryGeometry,a=lidarBatteryPlugAt(connected),x=pin===1?-1:1,start:LidarMmPoint=[x,ref.authored.batteryBottom+ref.authored.battery[1]/2,ref.authored.battery[2]/2+.05],end:LidarMmPoint=[a[0]+x,a[1],a[2]+d.femaleDepth],target=ref.published.batteryCableLength;
 const points=(bulge:number):LidarMmPoint[]=>[start,[start[0],start[1],start[2]+1],[(start[0]+end[0])/2+bulge,(start[1]+end[1])/2+(pin===1?.5:-.5),(start[2]+end[2])/2+1],[end[0],end[1],end[2]+1],end];
 const curve=(b:number)=>new CatmullRomCurve3(points(b).map(p=>new Vector3(...p)),false,'centripetal');let lo=0,hi=24;if(curve(lo).getLength()>target+.01)throw Error('The unplugged connector exceeds the stock cable reach.');for(let i=0;i<34;i++){const mid=(lo+hi)/2;if(curve(mid).getLength()<target)lo=mid;else hi=mid;}return points((lo+hi)/2);
}
export const lidarBoardBatteryWires=([-1,1] as const).map(side=>({pin:side===-1?1:2,points:[[4.8+side,.55,15.5],[4.8+side,1.3,15.7],[5+side,3.8,16],[5+side,3.8,16.8],[5+side,2.5,17.2],[5+side,2.5,18]] as LidarMmPoint[]}));
export function lidarMediumPinBounds(){const d=ref.authored;return {bottom:d.mediumSpacerBottom-d.mediumLongEnd,spacerBottom:d.mediumSpacerBottom,spacerTop:d.mediumSpacerBottom+d.mediumSpacer,top:d.mediumSpacerBottom+d.mediumSpacer+d.mediumShortEnd};}
