import {Shape,Path} from 'three';
/** Matching physical feed-throughs in every paper layer and each folded carrier. */
export const emergencyWireBoreRadius=.75;
export type LampCarrier={x:number;top:number};
function rectangle(width:number,height:number){const s=new Shape();s.moveTo(-width/2,-height/2);s.lineTo(width/2,-height/2);s.lineTo(width/2,height/2);s.lineTo(-width/2,height/2);s.closePath();return s;}
function hole(shape:Shape,x:number,y:number){const p=new Path();p.absarc(x,y,emergencyWireBoreRadius,0,Math.PI*2,true);shape.holes.push(p);}
export function emergencyWallProfile(lamps:readonly LampCarrier[]){const s=rectangle(463,100);for(const m of lamps)for(const side of[-1,1])hole(s,m.x+side*1.27-21.5,m.top-15-56);return s;}
export function emergencyCarrierBackProfile(top:number){const height=top-6,s=rectangle(18,height);for(const side of[-1,1])hole(s,side*1.27,top-15-(6+height/2));return s;}
