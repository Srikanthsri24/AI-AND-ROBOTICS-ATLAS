export type DrainagePoint=[number,number,number];export type DrainageLocation=0|1|2;
export type DrainageRow={elapsedSeconds:number;raw:number;index:number};
export type DrainageReading={raw:number|null;dry:number|null;damp:number|null;running:boolean;crossed:boolean;startedAt:number;previousAbove:number;firstDry:number|null;rows:DrainageRow[];message:string;lastCommand:string};
export const drainageInitial:DrainageReading={raw:null,dry:null,damp:null,running:false,crossed:false,startedAt:0,previousAbove:0,firstDry:null,rows:[],message:'',lastCommand:''};
export function drainageSamples(raw:number){const v=Math.max(0,Math.min(1023,raw)),n=Math.floor(v),hi=Math.round((v-n)*16);return Array.from({length:16},(_,i)=>n+(i<hi?1:0));}
export function drainageRead(samples:number[]){if(samples.length!==16||samples.some(v=>!Number.isInteger(v)||v<0||v>1023))throw new Error('Sixteen ADC readings are required.');return Math.floor((samples.reduce((s,n)=>s+n,0)+8)/16);}
export function drainageValid(s:DrainageReading){return s.dry!==null&&s.damp!==null&&Math.abs(s.damp-s.dry)>=12;}
export function drainageIndex(s:DrainageReading,raw:number){return drainageValid(s)?(raw-s.dry!)*100/(s.damp!-s.dry!):null;}
export function drainageCommand(previous:DrainageReading,samples:number[],command:string,now:number):DrainageReading{
 if(command==='\r'||command==='\n')return previous;
 const raw=drainageRead(samples),s={...previous,raw,message:'',lastCommand:command};
 if(command==='d'||command==='w'){if(command==='d')s.dry=raw;else s.damp=raw;s.running=false;s.message=`Reference saved: ${raw}`;}
 else if(command==='p')s.message=`Raw ${raw}${drainageValid(s)?` | Index ${drainageIndex(s,raw)!.toFixed(1)}`:''}`;
 else if(command==='b'){const index=drainageIndex(s,raw);if(index===null)s.message='Capture valid dry and damp references first.';else if(index<=35)s.message='Start after the pour has raised the index above 35.';else{s.startedAt=now>>>0;s.previousAbove=0;s.running=true;s.crossed=false;s.firstDry=null;s.rows=[{elapsedSeconds:0,raw,index}];s.message='Trial started above 35.';}}
 else if(command==='l'){if(!s.running)s.message='Begin the trial with b.';else{const elapsedSeconds=Math.floor(((now-s.startedAt)>>>0)/1000),index=drainageIndex(s,raw)!;s.rows=[...previous.rows,{elapsedSeconds,raw,index}];if(!s.crossed&&index<=35){s.crossed=true;s.firstDry=elapsedSeconds;s.message=`First dry observation at ${elapsedSeconds} s. Previous above threshold at ${s.previousAbove} s.`;}else if(!s.crossed)s.previousAbove=elapsedSeconds;}}
 else if(command==='r'){s.dry=s.damp=null;s.running=false;s.crossed=false;s.firstDry=null;s.message='Trial and references cleared.';}
 return s;
}
export function drainageCsv(rows:DrainageRow[]){return ['elapsed_s,raw,index',...rows.map(r=>`${r.elapsedSeconds},${r.raw},${r.index.toFixed(1)}`)].join('\n')+'\n';}
export type DrainageWater={added:number;held:number;free:number;runoff:number;evaporated:number};
export const drainageWaterInitial:DrainageWater={added:0,held:0,free:0,runoff:0,evaporated:0};
export function drainageAddWater(s:DrainageWater,amount:number):DrainageWater{const dose=Math.max(0,amount),held=Math.min(27,s.held+dose),extra=Math.max(0,s.held+dose-27);return {...s,added:s.added+dose,held,free:s.free+extra};}
// Illustrative mass-conserving column model. Runoff and evaporation are separate.
export function drainageAdvance(s:DrainageWater,hours:number,blocked=false):DrainageWater{const next={...s};let left=Math.max(0,hours);while(left>1e-9){const dt=Math.min(left,1/240);left-=dt;let out=blocked?0:next.free*(1-Math.exp(-dt/.045));if(!blocked&&next.free-out<.002)out=next.free;next.free-=out;next.runoff+=out;const loss=Math.min(next.held+next.free,Math.min(next.held+next.free,27)*(1-Math.exp(-dt*.17))),fromFree=Math.min(next.free,loss);next.free-=fromFree;const fromHeld=Math.min(next.held,Math.max(0,loss-fromFree));next.held-=fromHeld;next.evaporated+=fromFree+fromHeld;}return next;}
export function drainageMoisture(s:DrainageWater){return 82*s.held/27;}
export function drainageRaw(index:number){return 780-4*index;}
export const drainageLocations:DrainagePoint[]=[[-.75,1.1,-1.6],[.75,1.1,-1.6],[1.58,3.35,.3]];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function drainageProbePose(from:DrainageLocation,to:DrainageLocation,p:number):DrainagePoint{const a=drainageLocations[from],b=drainageLocations[to],t=Math.max(0,Math.min(1,p));if(t===1)return [...b];if(t<.25)return[a[0],a[1]+(5.3-a[1])*ease(t/.25),a[2]];if(t<.75){const n=ease((t-.25)/.5);return[a[0]+(b[0]-a[0])*n,5.3,a[2]+(b[2]-a[2])*n];}return[b[0],5.3+(b[1]-5.3)*ease((t-.75)/.25),b[2]];}
export function drainagePourPose(p:number):{position:DrainagePoint;tilt:number}{const t=Math.max(0,Math.min(1,p)),park:DrainagePoint=[4.4,1.08,-1.7],target:DrainagePoint=[2,3.8,.6];if(t<.2)return{position:[park[0],park[1]+(6-park[1])*ease(t/.2),park[2]],tilt:0};if(t<.5){const n=ease((t-.2)/.3);return{position:[park[0]+(target[0]-park[0])*n,6,park[2]+(target[2]-park[2])*n],tilt:0};}if(t<.7)return{position:[2,6,.6],tilt:1.1*ease((t-.5)/.2)};return{position:[2,6+(3.8-6)*ease((t-.7)/.3),.6],tilt:1.1};}
export function drainageCollectorPose(p:number):DrainagePoint{const t=Math.max(0,Math.min(1,p));if(t<.2)return[4.4,1.08+(.92)*ease(t/.2),-1.7];if(t<.45){const n=ease((t-.2)/.25);return[4.4+(1.8-4.4)*n,2,-1.7+3.5*n];}if(t<.6)return[1.8,2-.4*ease((t-.45)/.15),1.8];if(t<.85)return[1.8,1.6,1.8-1.5*ease((t-.6)/.25)];return[1.8,1.6-.42*ease((t-.85)/.15),.3];}
