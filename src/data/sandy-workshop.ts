export type SandyLocation=0|1|2;
export type SandyPoint=[number,number,number];
export type SandyReading={sampledAt:number;raw:number|null;dry:number|null;wet:number|null;middle:number|null;index:number|null;middleIndex:number|null;difference:number|null;status:'missing'|'close'|'ready'};
export const sandyInitial:SandyReading={sampledAt:0,raw:null,dry:null,wet:null,middle:null,index:null,middleIndex:null,difference:null,status:'missing'};
export const sandyX=[-.4,1.1,2.6];
export const sandyLocations:SandyPoint[]=sandyX.map(x=>[x,1.10,.2]);
export function sandySamples(raw:number){const n=Math.max(0,Math.min(1023,raw)),base=Math.floor(n),high=Math.round((n-base)*16);return Array.from({length:16},(_,i)=>base+(i<high?1:0));}
export function sandyUpdate(previous:SandyReading,samples:number[],commands:string[],now:number):SandyReading{
 if(now-previous.sampledAt<400)return previous;
 if(samples.length!==16||samples.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Sixteen valid ADC readings are required.');
 const raw=Math.floor((samples.reduce((s,n)=>s+n,0)+8)/16);let {dry,wet,middle}=previous;
 for(const c of commands){if(c==='d')dry=raw;else if(c==='w')wet=raw;else if(c==='m')middle=raw;else if(c==='r')dry=wet=middle=null;}
 const status=dry===null||wet===null?'missing':Math.abs(wet-dry)<12?'close':'ready',scale=status==='ready'?100/(wet!-dry!):null;
 const index=scale===null?null:(raw-dry!)*scale,middleIndex=scale===null||middle===null?null:(middle-dry!)*scale;
 return {sampledAt:now,raw,dry,wet,middle,index,middleIndex,difference:middleIndex===null?null:middleIndex-50,status};
}
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export function sandyProbePose(from:SandyLocation,to:SandyLocation,progress:number):SandyPoint{const a=sandyLocations[from],b=sandyLocations[to],t=Math.max(0,Math.min(1,progress));if(t===1)return [...b];if(t<.25)return [a[0],a[1]+(3.2-a[1])*ease(t/.25),a[2]];if(t<.75)return [a[0]+(b[0]-a[0])*ease((t-.25)/.5),3.2,a[2]];return [b[0],3.2+(b[1]-3.2)*ease((t-.75)/.25),b[2]];}
export function sandyContact(location:SandyLocation,pose:SandyPoint){const a=sandyLocations[location];return Math.max(0,1-Math.hypot(pose[0]-a[0],pose[2]-a[2])/.15)*Math.max(0,Math.min(1,1-(pose[1]-a[1])/.55));}
export function sandyRaw(dose:number,packing=0){const ml=Math.max(0,Math.min(30,dose));return 780-11*ml-70*Math.sin(Math.PI*ml/30)+packing;}
export function sandyCanCapture(expected:SandyLocation,location:SandyLocation,progress:number,raw:number,target:number,sampled:number|null,enabled:boolean,mixed:boolean){return enabled&&mixed&&expected===location&&progress===1&&Math.abs(raw-target)<.7&&sampled!==null&&Math.abs(sampled-target)<=1;}
// Mouth is the pivot. Lift clear before crossing, tilt while high above the selected cup,
// then lower the tilted tool. Reversing the timeline safely parks the tool.
export function sandyCylinderPose(location:1|2,progress:number):{position:SandyPoint;tilt:number;flow:boolean}{const t=Math.max(0,Math.min(1,progress)),park:SandyPoint=[3.7,1.85,-1.65],target:SandyPoint=[sandyX[location],2.15,.2];if(t<.2)return {position:[park[0],park[1]+(4-park[1])*ease(t/.2),park[2]],tilt:0,flow:false};if(t<.5){const n=ease((t-.2)/.3);return {position:[park[0]+(target[0]-park[0])*n,4,park[2]+(target[2]-park[2])*n],tilt:0,flow:false};}if(t<.7)return {position:[target[0],4,target[2]],tilt:1.18*ease((t-.5)/.2),flow:false};return {position:[target[0],4+(target[1]-4)*ease((t-.7)/.3),target[2]],tilt:1.18,flow:t===1};}
