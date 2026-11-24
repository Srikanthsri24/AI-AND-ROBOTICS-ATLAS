export type DryTimerPoint=[number,number,number];
export type DryTimerMode='drying'|'boundary';
export type DryTimerRow={seconds:number;raw:number;index:number;streak:number};
export type DryTimerReading={raw:number|null;dry:number|null;damp:number|null;running:boolean;led:boolean;streak:number;startedAt:number;lastSample:number;firstLow:number|null;confirmed:number|null;rows:DryTimerRow[];message:string};
export function dryTimerInitial():DryTimerReading{return{raw:null,dry:null,damp:null,running:false,led:false,streak:0,startedAt:0,lastSample:0,firstLow:null,confirmed:null,rows:[],message:''};}
export function dryTimerRead(samples:number[]){if(samples.length!==16||samples.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Sixteen ADC readings are required.');return Math.floor((samples.reduce((a,b)=>a+b,0)+8)/16);}
export function dryTimerSamples(raw:number){const v=Math.max(0,Math.min(1023,raw)),n=Math.floor(v),hi=Math.round((v-n)*16);return Array.from({length:16},(_,i)=>n+(i<hi?1:0));}
export function dryTimerValid(s:DryTimerReading){return s.dry!==null&&s.damp!==null&&Math.abs(s.damp-s.dry)>=12;}
export function dryTimerIndex(s:DryTimerReading,raw:number){return dryTimerValid(s)?(raw-s.dry!)*100/(s.damp!-s.dry!):null;}
function stop(s:DryTimerReading){s.running=false;s.led=false;s.streak=0;s.firstLow=null;s.confirmed=null;}
function log(s:DryTimerReading,raw:number,elapsedMs:number){const index=dryTimerIndex(s,raw)!,seconds=Math.floor(elapsedMs/1000);s.raw=raw;if(index<=35){if(s.streak===0)s.firstLow=seconds;s.streak++;}else{s.streak=0;s.firstLow=null;}s.rows=[...s.rows,{seconds,raw,index,streak:s.streak}];if(s.streak===3){s.running=false;s.led=true;s.confirmed=seconds;s.message=`Confirmed drying time: ${seconds} s.`;}}
// One actual firmware loop: process one command first, then at most one due sample.
// Preview and the scheduled read can use different sample arrays in the same loop.
export function dryTimerLoop(previous:DryTimerReading,input:{command?:string|null;commandSamples?:number[];periodicSamples?:number[]},now:number):DryTimerReading{
 const s={...previous},command=input.command,time=now>>>0;
 if(command==='d'||command==='w'){const raw=dryTimerRead(input.commandSamples??[]);s.raw=raw;if(command==='d')s.dry=raw;else s.damp=raw;stop(s);s.message=`${command==='d'?'Dry':'Damp'} reference saved.`;}
 else if(command==='p'){const raw=dryTimerRead(input.commandSamples??[]);s.raw=raw;s.message=`Preview raw ${raw}${dryTimerValid(s)?` | index ${dryTimerIndex(s,raw)!.toFixed(1)}`:''}. Preview itself does not count.`;}
 else if(command==='b'){const raw=dryTimerRead(input.commandSamples??[]);s.raw=raw;if(!dryTimerValid(s)||dryTimerIndex(s,raw)!<=35)s.message='Requires valid references and a starting index above 35.';else{stop(s);s.startedAt=s.lastSample=time;s.running=true;s.rows=[];s.message='Trial started above 35.';log(s,raw,0);}}
 else if(command==='r'){s.dry=s.damp=null;stop(s);s.message='References and current trial cleared.';}
 if(s.running&&((time-s.lastSample)>>>0)>=60000){s.lastSample=time;log(s,dryTimerRead(input.periodicSamples??[]),(time-s.startedAt)>>>0);}
 return s;
}
export function dryTimerCsv(rows:DryTimerRow[]){return['elapsed_s,raw,index,consecutive_low',...rows.map(r=>`${r.seconds},${r.raw},${r.index.toFixed(1)},${r.streak}`)].join('\n')+'\n';}
export function dryTimerSoilIndex(mode:DryTimerMode,seconds:number){const minutes=Math.max(0,seconds)/60;return mode==='drying'?74*Math.exp(-.075*minutes):Math.max(0,36.5-.3*minutes);}
const boundary=[36.5,34.75,34.5,35.75,34.75,34.5,34.25];
export function dryTimerSignal(mode:DryTimerMode,seconds:number){if(mode==='drying')return dryTimerSoilIndex(mode,seconds);const m=Math.max(0,seconds)/60;if(m>=6)return Math.max(0,dryTimerSoilIndex(mode,seconds)-.45);const i=Math.floor(m);return boundary[i]+(boundary[i+1]-boundary[i])*(m-i);}
export function dryTimerRaw(index:number){return 780-index*4;}
// Uninterrupted virtual board loops at each scheduled boundary, rather than a
// catch-up loop in the firmware. For a stalled board, call dryTimerLoop once.
export function dryTimerAdvance(s:DryTimerReading,from:number,to:number,mode:DryTimerMode){let current=s,cursor=from;while(current.running&&cursor<=to){const elapsed=(cursor-current.lastSample)>>>0,next=elapsed>=60000?cursor:cursor+60000-elapsed;if(next>to)break;current=dryTimerLoop(current,{periodicSamples:dryTimerSamples(dryTimerRaw(dryTimerSignal(mode,next/1000)))},next);cursor=next;}return current;}
export function dryTimerWater(mode:DryTimerMode,seconds:number){const initial=dryTimerSoilIndex(mode,0)/2,held=dryTimerSoilIndex(mode,seconds)/2;return{initial,held,evaporated:initial-held};}
export const dryTimerLocations:DryTimerPoint[]=[[-1.1,1.1,-1.7],[.4,1.1,-1.7],[1.9,1.26,0]];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function dryTimerPose(from:0|1|2,to:0|1|2,p:number):DryTimerPoint{const a=dryTimerLocations[from],b=dryTimerLocations[to],t=Math.max(0,Math.min(1,p));if(t<.25)return[a[0],a[1]+(5.4-a[1])*ease(t/.25),a[2]];if(t<.75){const k=ease((t-.25)/.5);return[a[0]+(b[0]-a[0])*k,5.4,a[2]+(b[2]-a[2])*k];}return[b[0],5.4+(b[1]-5.4)*ease((t-.75)/.25),b[2]];}
export type DryTimerScene={label:string;kind:'dry'|'damp'|'install'|'begin'|'time'|'preview'|'hold';seconds?:number;streak?:number};
export function dryTimerScenes(mode:DryTimerMode):DryTimerScene[]{const initial:DryTimerScene[]=[{label:'Capture dry reference',kind:'dry'},{label:'Capture damp reference',kind:'damp'},{label:'Install fixed-depth blade',kind:'install'},{label:'Begin above index 35',kind:'begin'}];if(mode==='boundary')return[...initial,{label:'First low sample',kind:'time',seconds:60,streak:1},{label:'Second low sample',kind:'time',seconds:120,streak:2},{label:'Preview without counting',kind:'preview',seconds:150,streak:2},{label:'Higher sample resets the count',kind:'time',seconds:180,streak:0},{label:'New low run · one',kind:'time',seconds:240,streak:1},{label:'New low run · two',kind:'time',seconds:300,streak:2},{label:'Third low lights D8',kind:'time',seconds:360,streak:3},{label:'LED holds · no further sampling',kind:'hold',seconds:480,streak:3}];return[...initial,...Array.from({length:10},(_,i)=>({label:`Scheduled sample · minute ${i+1}`,kind:'time' as const,seconds:(i+1)*60,streak:i===9?1:0})),{label:'Preview does not advance the streak',kind:'preview',seconds:630,streak:1},{label:'Second scheduled low',kind:'time',seconds:660,streak:2},{label:'Third low confirms drying',kind:'time',seconds:720,streak:3},{label:'LED holds · trial sampling stopped',kind:'hold',seconds:900,streak:3}];}
