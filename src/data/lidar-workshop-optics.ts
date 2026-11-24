import {lidarRangeSensorFaces,type LidarMmPoint} from './lidar-workshop-layout';
export type LidarDroneMm={x:number;y:number;z:number;yaw:number};
export type LidarCardMm={x:number;y:number;z:number;yaw:number;width:number;height:number};
/** Visible overlay of an illustrative centre ray, not a laser beam or a measured sensor FoV / reflectance model. */
export function lidarFrontRay(drone:LidarDroneMm,card:LidarCardMm){
 const f=lidarRangeSensorFaces.front,c=Math.cos(drone.yaw),s=Math.sin(drone.yaw),origin:LidarMmPoint=[drone.x+c*f[0]+s*f[2],drone.y+f[1],drone.z-s*f[0]+c*f[2]],direction:LidarMmPoint=[-s,0,-c],n:LidarMmPoint=[Math.sin(card.yaw),0,Math.cos(card.yaw)],denominator=direction[0]*n[0]+direction[2]*n[2];
 const invalid=()=>({origin,direction,hit:null as LidarMmPoint|null,distance:null as number|null});
 if(![...origin,...direction,card.x,card.y,card.z,card.yaw,card.width,card.height].every(Number.isFinite)||card.width<=0||card.height<=0||Math.abs(denominator)<1e-8)return invalid();
 const t=((card.x-origin[0])*n[0]+(card.z-origin[2])*n[2])/denominator;if(t<=0||t>4000)return invalid();
 const hit:LidarMmPoint=[origin[0]+t*direction[0],origin[1],origin[2]+t*direction[2]],dx=hit[0]-card.x,dz=hit[2]-card.z,u=Math.cos(card.yaw)*dx-Math.sin(card.yaw)*dz;
 if(Math.abs(u)>card.width/2+1e-8||Math.abs(hit[1]-card.y)>card.height/2+1e-8)return invalid();
 return {origin,direction,hit,distance:Math.round(t)};
}
export function lidarCardAtMark(mm:number):LidarCardMm{return {x:0,y:148.5,z:lidarRangeSensorFaces.front[2]-mm,yaw:0,width:210,height:297};}
