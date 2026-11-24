export type MulchPair<T>=[T,T];
export type MulchPoint=[number,number,number];
export type MulchLocation=0|1|2;
export type MulchRow={elapsedSeconds:number;raw:MulchPair<number>;indices:MulchPair<number>;losses:MulchPair<number>};
export type MulchReading={raw:MulchPair<number>|null;dry:MulchPair<number|null>;damp:MulchPair<number|null>;baseline:MulchPair<number>|null;startedAt:number;logging:boolean;rows:MulchRow[];lastCommand:string;message:string};
export const mulchInitial:MulchReading={raw:null,dry:[null,null],damp:[null,null],baseline:null,startedAt:0,logging:false,rows:[],lastCommand:'',message:''};
export function mulchReadProbe(reads:number[]){if(reads.length!==17||reads.some(v=>!Number.isInteger(v)||v<0||v>1023))throw new Error('One discarded ADC read and sixteen valid samples are required.');return Math.floor((reads.slice(1).reduce((a,b)=>a+b,0)+8)/16);}
export function mulchSamples(raw:number,discarded=0){const v=Math.max(0,Math.min(1023,raw)),base=Math.floor(v),high=Math.round((v-base)*16);return [discarded,...Array.from({length:16},(_,i)=>base+(i<high?1:0))];}
export function mulchValid(reading:MulchReading){return [0,1].every(i=>reading.dry[i]!==null&&reading.damp[i]!==null&&Math.abs(reading.damp[i]!-reading.dry[i]!)>=12);}
export function mulchIndices(reading:MulchReading,raw:MulchPair<number>):MulchPair<number>|null{return mulchValid(reading)?raw.map((v,i)=>(v-reading.dry[i]!)*100/(reading.damp[i]!-reading.dry[i]!)) as MulchPair<number>:null;}
// The Arduino samples on EVERY non-newline serial command, not on a timer.
// New b starts a fresh downloadable trial; earlier displayed serial trials are not
// mixed into that CSV. d/w/r stop logging while retaining the last trial for review.
export function mulchCommand(previous:MulchReading,reads:MulchPair<number[]>,command:string,now:number):MulchReading{
 if(command==='\r'||command==='\n')return previous;
 const raw:MulchPair<number>=[mulchReadProbe(reads[0]),mulchReadProbe(reads[1])],state:MulchReading={...previous,raw,dry:[...previous.dry],damp:[...previous.damp],lastCommand:command,message:''};
 if(command==='d'||command==='w'){if(command==='d')state.dry=raw;else state.damp=raw;state.logging=false;state.message=`${command==='d'?'Dry':'Damp'} raw: ${raw.join(',')}`;}
 else if(command==='p')state.message=`Bare and covered raw: ${raw.join(',')}`;
 else if(command==='b'){const indices=mulchIndices(state,raw);if(!indices)state.message='Capture distinct dry and damp references on both channels.';else{state.baseline=[...indices];state.startedAt=now>>>0;state.logging=true;state.rows=[{elapsedSeconds:0,raw:[...raw],indices:[...indices],losses:[0,0]}];state.message='Baseline recorded. New paired trial started.';}}
 else if(command==='l'){if(!state.logging)state.message='Record a baseline with b first.';else{const indices=mulchIndices(state,raw)!;const elapsedSeconds=Math.floor(((now-state.startedAt)>>>0)/1000),losses=indices.map((v,i)=>state.baseline![i]-v) as MulchPair<number>;state.rows=[...previous.rows,{elapsedSeconds,raw:[...raw],indices,losses}];state.message=`Paired row at ${elapsedSeconds} seconds.`;}}
 else if(command==='r'){state.dry=[null,null];state.damp=[null,null];state.logging=false;state.message='Trial cleared.';}
 return state;
}
export function mulchCsv(rows:MulchRow[]){return ['elapsed_s,bare_raw,covered_raw,bare_index,covered_index,bare_loss,covered_loss',...rows.map(r=>[r.elapsedSeconds,...r.raw,...r.indices.map(v=>v.toFixed(1)),...r.losses.map(v=>v.toFixed(1))].join(','))].join('\n')+'\n';}
export const mulchLocations:MulchPair<MulchPoint>[]=[
 [[-1.1,1.1,-1.75],[-.65,1.1,-1.75]],
 [[.55,1.1,-1.75],[1,1.1,-1.75]],
 [[.35,1.1,.8],[2.35,1.1,.8]],
];
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export function mulchProbePose(from:MulchLocation,to:MulchLocation,channel:0|1,progress:number,swapped=false):MulchPoint{const locate=(l:MulchLocation):MulchPoint=>l===2&&swapped?[channel===0?2.35:.35,1.1,.8]:mulchLocations[l][channel];const a=locate(from),b=locate(to),height=swapped&&channel===1?5.2:3.5,t=Math.max(0,Math.min(1,progress));if(t===1)return [...b];if(t<.25)return[a[0],a[1]+(height-a[1])*ease(t/.25),a[2]];if(t<.75){const n=ease((t-.25)/.5);return[a[0]+(b[0]-a[0])*n,height,a[2]+(b[2]-a[2])*n];}return[b[0],height+(b[1]-height)*ease((t-.75)/.25),b[2]];}
export function mulchRaw(wet:number,channel:0|1){return (channel===0?780:710)-(channel===0?4:3.5)*wet;}
// Illustrative local model, not an empirical claim about a particular soil.
// Both trays receive equal water and exposure. Chips only change the covered
// surface's modeled loss rate. Position may be switched without changing probes.
export function mulchDrying(previous:MulchPair<number>,hours:number,chips=true,swapped=false,unequalExposure=false):MulchPair<number>{const h=Math.max(0,hours);return previous.map((v,i)=>{const position=swapped?1-i:i,exposure=unequalExposure?(position===0?1.25:.8):1,rate=i===1&&chips?.018:.045;return v*Math.exp(-rate*exposure*h);}) as MulchPair<number>;}
export function mulchReady(expected:MulchLocation,location:MulchLocation,progress:number,raw:MulchPair<number>,target:MulchPair<number>,powered:boolean){return powered&&expected===location&&progress===1&&raw.every((v,i)=>Math.abs(v-target[i])<.7);}
export function mulchSwapPose(channel:0|1,swapped:boolean,progress:number):MulchPoint{const initial=swapped?1-channel:channel,from=initial===0?.5:2.5,to=initial===0?2.5:.5,t=Math.max(0,Math.min(1,progress)),side=channel===0?1.1:-1.1;if(t===1)return[to,0,.8];if(t<.15)return[from,2.4*ease(t/.15),.8];if(t<.30)return[from,2.4,.8+side*ease((t-.15)/.15)];if(t<.70)return[from+(to-from)*ease((t-.30)/.40),2.4,.8+side];if(t<.85)return[to,2.4,.8+side*(1-ease((t-.70)/.15))];return[to,2.4*(1-ease((t-.85)/.15)),.8];}
// Tilt while high, then lower; reverse the same path before travelling back.
export function mulchPourPose(tray:MulchPoint,progress:number):{position:MulchPoint;tilt:number}{const t=Math.max(0,Math.min(1,progress)),park:MulchPoint=[4.25,1.76,-1.7],target:MulchPoint=[tray[0]+.4,2.15,tray[2]+.25];if(t<.2)return {position:[park[0],park[1]+(4.5-park[1])*ease(t/.2),park[2]],tilt:0};if(t<.5){const n=ease((t-.2)/.3);return {position:[park[0]+(target[0]-park[0])*n,4.5,park[2]+(target[2]-park[2])*n],tilt:0};}if(t<.7)return {position:[target[0],4.5,target[2]],tilt:1.18*ease((t-.5)/.2)};return {position:[target[0],4.5+(target[1]-4.5)*ease((t-.7)/.3),target[2]],tilt:1.18};}
