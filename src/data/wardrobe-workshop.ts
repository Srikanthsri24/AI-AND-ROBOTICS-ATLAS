export const wardrobeHinge:[number,number,number]=[-.52,1.24,.60];
export const wardrobeMagnet:[number,number,number]=[1.545,.51,-.075];
export const wardrobeReed:[number,number,number]=[1.125,1.75,.43];
export function wardrobeMagnetPosition(angle:number):[number,number,number]{const a=angle*Math.PI/180,[x,y,z]=wardrobeMagnet;return [wardrobeHinge[0]+x*Math.cos(a)-z*Math.sin(a),wardrobeHinge[1]+y,wardrobeHinge[2]+x*Math.sin(a)+z*Math.cos(a)];}
export function wardrobeMagnetGap(angle:number){const p=wardrobeMagnetPosition(angle);return Math.hypot(p[0]-wardrobeReed[0],p[1]-wardrobeReed[1],p[2]-wardrobeReed[2]);}
export function wardrobeDoorInput(angle:number,disconnected=false){return disconnected||wardrobeMagnetGap(angle)>.17;}
export function wardrobeRaw(level:number){return Math.ceil(180+Math.max(0,Math.min(100,level))*6.4);}
export function wardrobePercent(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.floor((raw-dark)*100/(bright-dark))));}
export type WardrobeState={rawOpen:boolean;doorOpen:boolean;changedAt:number;dim:boolean;lit:boolean};
export function wardrobeInitial(rawOpen=false,now=0):WardrobeState{return {rawOpen,doorOpen:rawOpen,changedAt:now,dim:false,lit:false};}
export function advanceWardrobe(state:WardrobeState,rawOpen:boolean,percent:number|null,now:number):WardrobeState{
 const changedAt=rawOpen===state.rawOpen?state.changedAt:now;
 const doorOpen=now-changedAt>=35?rawOpen:state.doorOpen;
 const dim=percent===null?false:percent<=32?true:percent>=42?false:state.dim;
 return {rawOpen,doorOpen,changedAt,dim,lit:percent!==null&&doorOpen&&dim};
}
