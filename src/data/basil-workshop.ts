export type BasilLocation=0|1|2;
type Point=[number,number,number];
export type BasilReading={sampledAt:number;raw:number|null;dry:number|null;damp:number|null;index:number|null;flag:boolean;status:'missing'|'close'|'ready'};
export const basilInitial:BasilReading={sampledAt:0,raw:null,dry:null,damp:null,index:null,flag:false,status:'missing'};
export const basilLocations:Point[]=[[-1,1,-1.6],[.5,1,-1.6],[1.75,1.33,.65]];
export function basilSamples(index:number){const ideal=Math.max(0,Math.min(1023,730-4*index)),base=Math.floor(ideal),high=Math.round((ideal-base)*16);return Array.from({length:16},(_,i)=>base+(i<high?1:0));}
export function basilUpdate(previous:BasilReading,samples:number[],commands:string[],now:number):BasilReading{
 if(now-previous.sampledAt<400)return previous;
 if(samples.length!==16||samples.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Sixteen ADC readings are required.');
 const raw=Math.floor((samples.reduce((s,n)=>s+n,0)+8)/16);let {dry,damp,flag}=previous;
 for(const command of commands){if(command==='d')dry=raw;else if(command==='w')damp=raw;else if(command==='r'){dry=null;damp=null;flag=false;}}
 const status=dry===null||damp===null?'missing':Math.abs(damp-dry)<12?'close':'ready';
 const index=status==='ready'?Math.max(0,Math.min(100,Math.trunc(100*(raw-dry!)/(damp!-dry!)))):null;
 if(index===null)flag=false;else if(index<=30)flag=true;else if(index>=40)flag=false;
 return {sampledAt:now,raw,dry,damp,index,flag,status};
}
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function basilProbePose(from:BasilLocation,to:BasilLocation,progress:number):Point{const a=basilLocations[from],b=basilLocations[to],t=Math.max(0,Math.min(1,progress));if(t===1)return [...b];if(t<.25)return [a[0],a[1]+(3.8-a[1])*ease(t/.25),a[2]];if(t<.75){const p=ease((t-.25)/.5);return [a[0]+(b[0]-a[0])*p,3.8,a[2]+(b[2]-a[2])*p];}return [b[0],3.8+(b[1]-3.8)*ease((t-.75)/.25),b[2]];}
export function basilContact(location:BasilLocation,pose:Point){const a=basilLocations[location];return Math.max(0,1-Math.hypot(pose[0]-a[0],pose[2]-a[2])/.15)*Math.max(0,Math.min(1,1-(pose[1]-a[1])/.55));}
export function basilSoilAdvance(previous:number,target:number,seconds:number){return target+(previous-target)*Math.exp(-Math.max(0,seconds)/2.8);}
export function basilCanCapture(expected:BasilLocation,location:BasilLocation,progress:number,raw:number,target:number,sampledRaw:number|null,enabled:boolean){return enabled&&expected===location&&progress===1&&Math.abs(raw-target)<.7&&sampledRaw!==null&&Math.abs(sampledRaw-target)<=1;}
export function basilWaterResponse(previous:number,target:number,flow:boolean,seconds:number){return target>previous+2&&!flow?previous:basilSoilAdvance(previous,target,seconds);}
