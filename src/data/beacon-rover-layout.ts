import {bluetoothCarLayout,bluetoothCarMountPoints,type CarPoint} from './bluetooth-car-layout';
import {beaconOpticalHardware as optics} from './beacon-rover-optics';
export const beaconCarLayout={...bluetoothCarLayout,sensors:optics.sensors,hood:{inner:optics.hoodInnerRadius,outer:optics.hoodOuterRadius,length:optics.hoodLength},sensorBase:{width:.34,length:.22,bottom:.99,top:1.03},cellRadius:optics.cellRadius};
export function beaconSensorPoint(index:0|1,p:CarPoint):CarPoint{const s=optics.sensors[index],c=Math.cos(s.yaw),n=Math.sin(s.yaw);return [s.at[0]+c*p[0]+n*p[2],s.at[1]+p[1],s.at[2]-n*p[0]+c*p[2]];}
export const beaconSensorDrills=([0,1] as const).flatMap(i=>[-.11,.11].map(x=>beaconSensorPoint(i,[x,.99-optics.sensors[i].at[1],0])));
export const beaconCarMounts=bluetoothCarMountPoints().filter(p=>!p.name.startsWith('bluefruit')).map(p=>({...p,screwStage:p.name.startsWith('uno')?4:5}));
/** Radial leads bend down and rearward; the visible extension joints are separate. */
export function beaconCellLeadPoints(index:0|1,side:-1|1):CarPoint[]{return [[side*.025,-.045,.006],[side*.025,-.075,.009],[side*.025,-.115,.10],[side*.025,-.14,.20]];}
export function beaconCellTerminals(index:0|1){const ends=([-1,1] as const).map(side=>beaconSensorPoint(index,beaconCellLeadPoints(index,side).at(-1)!));return {supply:ends[index===0?0:1],signal:ends[index===0?1:0]};}
