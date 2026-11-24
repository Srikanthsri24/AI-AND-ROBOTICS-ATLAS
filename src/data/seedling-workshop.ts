export type SeedlingLocation=0|1|2;
export type SeedlingChannel=0|1;
type Pair<T>=[T,T];type Point=[number,number,number];
export type SeedlingCell={raw:number|null;dry:number|null;damp:number|null;index:number|null;flag:boolean;status:'missing'|'close'|'ready'};
export type SeedlingReading={sampledAt:number;channels:Pair<SeedlingCell>};
const blank=():SeedlingCell=>({raw:null,dry:null,damp:null,index:null,flag:false,status:'missing'});
export const seedlingInitial:SeedlingReading={sampledAt:0,channels:[blank(),blank()]};
// Two separated blades in each broad calibration cup; fixed slots in divided tray cells.
export const seedlingLocations:Pair<Point>[]=[[[ -1.1,1.1,-1.75],[-.65,1.1,-1.75]],[[.55,1.1,-1.75],[1,1.1,-1.75]],[[.35,1.5,.75],[1.75,1.5,.75]]];
export function seedlingSamples(index:number,channel:SeedlingChannel,span=1){const dry=channel===0?750:695,width=(channel===0?400:370)*span,ideal=Math.max(0,Math.min(1023,dry-width*index/100)),base=Math.floor(ideal),high=Math.round((ideal-base)*16);return Array.from({length:16},(_,i)=>base+(i<high?1:0));}
export function seedlingUpdate(previous:SeedlingReading,samples:Pair<number[]>,commands:string[],now:number):SeedlingReading{
 if(now-previous.sampledAt<400)return previous;
 const raws=samples.map(a=>{if(a.length!==16||a.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Each input needs sixteen valid ADC readings after its discarded channel-switch sample.');return Math.floor((a.reduce((s,n)=>s+n,0)+8)/16);}) as Pair<number>;
 const channels=previous.channels.map((old,i)=>{const raw=raws[i];let {dry,damp,flag}=old;for(const command of commands){if(command==='d')dry=raw;else if(command==='w')damp=raw;else if(command==='r'){dry=null;damp=null;flag=false;}}
 const status=dry===null||damp===null?'missing':Math.abs(damp-dry)<12?'close':'ready',index=status==='ready'?Math.max(0,Math.min(100,Math.trunc(100*(raw-dry!)/(damp!-dry!)))):null;
 if(index===null)flag=false;else if(index<=35)flag=true;else if(index>=45)flag=false;
 return {raw,dry,damp,index,flag,status};}) as Pair<SeedlingCell>;
 return {sampledAt:now,channels};
}
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function seedlingProbePose(from:SeedlingLocation,to:SeedlingLocation,channel:SeedlingChannel,progress:number):Point{const a=seedlingLocations[from][channel],b=seedlingLocations[to][channel],t=Math.max(0,Math.min(1,progress));if(t===1)return [...b];if(t<.25)return [a[0],a[1]+(3.5-a[1])*ease(t/.25),a[2]];if(t<.75){const p=ease((t-.25)/.5);return [a[0]+(b[0]-a[0])*p,3.5,a[2]+(b[2]-a[2])*p];}return [b[0],3.5+(b[1]-3.5)*ease((t-.75)/.25),b[2]];}
export function seedlingContact(location:SeedlingLocation,channel:SeedlingChannel,pose:Point){const a=seedlingLocations[location][channel];return Math.max(0,1-Math.hypot(pose[0]-a[0],pose[2]-a[2])/.15)*Math.max(0,Math.min(1,1-(pose[1]-a[1])/.55));}
export function seedlingCanCapture(expected:SeedlingLocation,location:SeedlingLocation,progress:number,raw:Pair<number>,target:Pair<number>,sampledRaw:Pair<number|null>,enabled:boolean){return enabled&&expected===location&&progress===1&&raw.every((n,i)=>Math.abs(n-target[i])<.7&&sampledRaw[i]!==null&&Math.abs(sampledRaw[i]!-target[i])<=1);}
export function seedlingAdvance(previous:Pair<number>,targets:Pair<number>,flows:Pair<boolean>,seconds:number):Pair<number>{return previous.map((n,i)=>targets[i]>n+2&&!flows[i]?n:targets[i]+(n-targets[i])*Math.exp(-Math.max(0,seconds)/2.8)) as Pair<number>;}
