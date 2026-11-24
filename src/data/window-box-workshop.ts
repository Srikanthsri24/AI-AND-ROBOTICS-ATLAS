export type WindowBoxPair<T>=[T,T];
export type WindowBoxPoint=[number,number,number];
export type WindowBoxLocation=0|1|2;
export type WindowBoxRow={elapsedSeconds:number;raw:WindowBoxPair<number>;indices:WindowBoxPair<number>;losses:WindowBoxPair<number>;difference:number};
export type WindowBoxReading={raw:WindowBoxPair<number>|null;dry:WindowBoxPair<number|null>;damp:WindowBoxPair<number|null>;baseline:WindowBoxPair<number>|null;startedAt:number;logging:boolean;rows:WindowBoxRow[];lastCommand:string;message:string};
export const windowBoxInitial:WindowBoxReading={raw:null,dry:[null,null],damp:[null,null],baseline:null,startedAt:0,logging:false,rows:[],lastCommand:'',message:''};
export function windowBoxReadProbe(reads:number[]){if(reads.length!==17||reads.some(v=>!Number.isInteger(v)||v<0||v>1023))throw new Error('One discarded ADC read and sixteen valid samples are required.');return Math.floor((reads.slice(1).reduce((a,b)=>a+b,0)+8)/16);}
export function windowBoxSamples(raw:number,discarded=0){const v=Math.max(0,Math.min(1023,raw)),base=Math.floor(v),high=Math.round((v-base)*16);return [discarded,...Array.from({length:16},(_,i)=>base+(i<high?1:0))];}
export function windowBoxValid(reading:WindowBoxReading){return [0,1].every(i=>reading.dry[i]!==null&&reading.damp[i]!==null&&Math.abs(reading.damp[i]!-reading.dry[i]!)>=12);}
export function windowBoxIndices(reading:WindowBoxReading,raw:WindowBoxPair<number>):WindowBoxPair<number>|null{return windowBoxValid(reading)?raw.map((v,i)=>(v-reading.dry[i]!)*100/(reading.damp[i]!-reading.dry[i]!)) as WindowBoxPair<number>:null;}
// The Arduino samples on EVERY non-newline serial command, not on a timer.
// New b starts a fresh downloadable trial; earlier displayed serial trials are not
// mixed into that CSV. d/w/r stop logging while retaining the last trial for review.
export function windowBoxCommand(previous:WindowBoxReading,reads:WindowBoxPair<number[]>,command:string,now:number):WindowBoxReading{
 if(command==='\r'||command==='\n')return previous;
 const raw:WindowBoxPair<number>=[windowBoxReadProbe(reads[0]),windowBoxReadProbe(reads[1])],state:WindowBoxReading={...previous,raw,dry:[...previous.dry],damp:[...previous.damp],lastCommand:command,message:''};
 if(command==='d'||command==='w'){if(command==='d')state.dry=raw;else state.damp=raw;state.logging=false;state.message=`${command==='d'?'Dry':'Damp'} raw: ${raw.join(',')}`;}
 else if(command==='p')state.message=`Window and shade raw: ${raw.join(',')}`;
 else if(command==='b'){const indices=windowBoxIndices(state,raw);if(!indices)state.message='Capture distinct dry and damp references on both channels.';else{state.baseline=[...indices];state.startedAt=now>>>0;state.logging=true;state.rows=[{elapsedSeconds:0,raw:[...raw],indices:[...indices],losses:[0,0],difference:0}];state.message='Baseline recorded. New paired trial started.';}}
 else if(command==='l'){if(!state.logging)state.message='Record a baseline with b first.';else{const indices=windowBoxIndices(state,raw)!;const elapsedSeconds=Math.floor(((now-state.startedAt)>>>0)/1000),losses=indices.map((v,i)=>state.baseline![i]-v) as WindowBoxPair<number>;state.rows=[...previous.rows,{elapsedSeconds,raw:[...raw],indices,losses,difference:losses[0]-losses[1]}];state.message=`Paired row at ${elapsedSeconds} seconds.`;}}
 else if(command==='r'){state.dry=[null,null];state.damp=[null,null];state.logging=false;state.message='Trial cleared.';}
 return state;
}
export function windowBoxCsv(rows:WindowBoxRow[]){return ['elapsed_s,window_raw,shade_raw,window_index,shade_index,window_loss,shade_loss,window_minus_shade_loss',...rows.map(r=>[r.elapsedSeconds,...r.raw,...r.indices.map(v=>v.toFixed(1)),...r.losses.map(v=>v.toFixed(1)),r.difference.toFixed(1)].join(','))].join('\n')+'\n';}

// Physical identities remain A/B; channel zero always means the window position.
export function windowBoxPhysical(channel:0|1,swapped:boolean):0|1{return (swapped?1-channel:channel) as 0|1;}
export function windowBoxRaw(index:number,physical:0|1){return (physical===0?780:720)-(physical===0?4:3.5)*index;}
export function windowBoxDrying(wet:WindowBoxPair<number>,hours:number,sunny:boolean):WindowBoxPair<number>{const h=Math.max(0,hours);return [wet[0]*Math.exp(-(sunny?.055:.022)*h),wet[1]*Math.exp(-.022*h)];}
export const windowBoxPositions:WindowBoxPair<WindowBoxPoint>=[[2.7,0,-.85],[.6,0,1.65]];
export const windowBoxReferences:WindowBoxPair<WindowBoxPoint>=[[-1.4,1.1,-1.7],[.25,1.1,-1.7]];
export function windowBoxProbeTarget(location:WindowBoxLocation,physical:0|1,swapped:boolean):WindowBoxPoint{if(location<2){const p=windowBoxReferences[location===0?0:1];return [p[0]+(physical===0?-.25:.25),p[1],p[2]];}const channel=windowBoxPhysical(physical,swapped),b=windowBoxPositions[channel];return [b[0]-.25,1.25,b[2]];}
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function windowBoxTravel(from:WindowBoxPoint,to:WindowBoxPoint,physical:0|1,t:number):WindowBoxPoint{t=Math.max(0,Math.min(1,t));const h=physical===0?5.4:6.3;if(t===1)return [...to];if(t<.25)return[from[0],from[1]+(h-from[1])*ease(t/.25),from[2]];if(t<.75){const n=ease((t-.25)/.5);return[from[0]+(to[0]-from[0])*n,h,from[2]+(to[2]-from[2])*n];}return[to[0],h+(to[1]-h)*ease((t-.75)/.25),to[2]];}
// Parallel sunlight travels (-.25,-1,+1). Backtrace to the window wall.
export function windowBoxSunRay(point:WindowBoxPoint){const dz=point[2]+2.45;return [point[0]+.25*dz,point[1]+dz,-2.45] as WindowBoxPoint;}
export function windowBoxDirectSun(point:WindowBoxPoint){const p=windowBoxSunRay(point);return p[0]>1.3&&p[0]<4.9&&p[1]>.5&&p[1]<4.1;}

export function windowBoxPourPose(box:0|1,progress:number){const t=Math.max(0,Math.min(1,progress)),b=windowBoxPositions[box],park:WindowBoxPoint=[4.5,.65,1.6],target:WindowBoxPoint=[b[0]+.1,2,b[2]+.4],flow=Math.max(0,Math.min(1,(t-.45)/.15));const travel=t<.45?t/.45:t>.6?(1-t)/.4:1;let p:WindowBoxPoint,tilt=0;if(travel<.25)p=[park[0],park[1]+(4.5-park[1])*ease(travel/.25),park[2]];else if(travel<.6){const n=ease((travel-.25)/.35);p=[park[0]+(target[0]-park[0])*n,4.5,park[2]+(target[2]-park[2])*n];}else if(travel<.8){p=[target[0],4.5,target[2]];tilt=.8*ease((travel-.6)/.2);}else{p=[target[0],4.5+(target[1]-4.5)*ease((travel-.8)/.2),target[2]];tilt=.8;}return {position:p,tilt,flow,pouring:t>=.45&&t<=.6};}
