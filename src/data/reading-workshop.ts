export const readingShadePivot:[number,number,number]=[1.0,.95,-.82];
export const readingShadeDepth=1.65,readingShadeThickness=.035,readingSensorZ=.12;
export const readingTaskSource:[number,number,number]=[1.56,1.81,.10];
export const readingSensorPoint:[number,number,number]=[1.96+Math.sin(.14)*.014,.298+Math.cos(.14)*.014,readingSensorZ];
export function readingShadeCovers(angle:number){return readingShadePivot[2]+readingShadeDepth*Math.cos(angle*Math.PI/180)+readingShadeThickness/2*Math.abs(Math.sin(angle*Math.PI/180))>=readingSensorZ;}
export function readingTaskBlocked(angle:number){
 const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const local=(point:number[])=>{const x=point[0]-readingShadePivot[0],y=point[1]-readingShadePivot[1],z=point[2]-readingShadePivot[2];return [x,y*c-z*s,y*s+z*c];};
 const origin=local(readingSensorPoint),end=local(readingTaskSource),bounds=[[-1.25,1.25],[-readingShadeThickness/2,readingShadeThickness/2],[0,readingShadeDepth]];
 let first=0,last=1;
 for(let axis=0;axis<3;axis++){const delta=end[axis]-origin[axis],[low,high]=bounds[axis];if(Math.abs(delta)<1e-10){if(origin[axis]<low||origin[axis]>high)return false;continue;}const t1=(low-origin[axis])/delta,t2=(high-origin[axis])/delta;first=Math.max(first,Math.min(t1,t2));last=Math.min(last,Math.max(t1,t2));if(first>last)return false;}
 return true;
}
export function readingEffectiveLight(ambient:number,angle:number,taskLamp:boolean){const base=Math.max(0,Math.min(100,ambient));return Math.max(0,Math.min(100,(readingShadeCovers(angle)?Math.round(base*.25):base)+(taskLamp&&!readingTaskBlocked(angle)?35:0)));}
export function readingRaw(level:number){return Math.ceil(180+Math.max(0,Math.min(100,level))*6.4);}
export function readingPercent(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.floor((raw-dark)*100/(bright-dark))));}
export function readingCutoff(adc:number){return 25+Math.floor(Math.max(0,Math.min(1023,adc))*60/1023);}
export function readingDialAngle(adc:number){return (Math.max(0,Math.min(1023,adc))/1023-.5)*Math.PI*1.5;}
export function readingNextAlert(previous:boolean,page:number|null,cutoff:number){if(page===null)return false;if(page<cutoff)return true;if(page>=cutoff+5)return false;return previous;}
