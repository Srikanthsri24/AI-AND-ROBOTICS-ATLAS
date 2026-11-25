import type {LidarMmPoint} from './lidar-workshop-layout';
/** Overall radio envelope follows Bitcraze's 63 × 18 × 8 mm specification. Internal visual placement is authored from the kit photograph, not a supplier CAD model. */
export const lidarRadioGeometry={envelope:[63,8,18] as LidarMmPoint,pcb:{minX:-19,maxX:22,thickness:1,y:1.2},usb:{minX:-31.5,maxX:-15,width:12,height:4.5,y:4},rf:{maxX:31.5,y:4},dock:{x:250,y:0,z:40,travel:16,portFace:230,portBack:216,portMinY:1.4,portMaxY:6.6,portHalfWidth:6.7}};
export function lidarRadioAt(inserted:number):LidarMmPoint{if(!Number.isFinite(inserted)||inserted<0||inserted>1)throw Error('Radio seating must be between 0 and 1.');const d=lidarRadioGeometry.dock;return [d.x+d.travel*(1-inserted),d.y,d.z];}
