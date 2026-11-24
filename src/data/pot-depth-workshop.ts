export type DepthPoint=[number,number,number];
export type DepthPair=[number,number];
export type DepthChannel={dry:number|null;damp:number|null;baseline:number;first:number|null};
export type DepthRow={seconds:number;index:DepthPair;rise:DepthPair;first:[number|null,number|null]};
export type DepthReading={raw:[number|null,number|null];channels:[DepthChannel,DepthChannel];running:boolean;startedAt:number;rows:DepthRow[];message:string};
export function depthInitial():DepthReading{return{raw:[null,null],channels:[{dry:null,damp:null,baseline:0,first:null},{dry:null,damp:null,baseline:0,first:null}],running:false,startedAt:0,rows:[],message:''};}
export function depthRead(samples:number[]){if(samples.length!==17||samples.some(v=>!Number.isInteger(v)||v<0||v>1023))throw new Error('One discarded conversion and sixteen ADC samples required.');return Math.floor((samples.slice(1).reduce((a,b)=>a+b,0)+8)/16);}
export function depthSamples(raw:number){const v=Math.max(0,Math.min(1023,raw)),n=Math.floor(v),hi=Math.round((v-n)*16);return[1023,...Array.from({length:16},(_,i)=>n+(i<hi?1:0))];}
export function depthValid(s:DepthReading){return s.channels.every(c=>c.dry!==null&&c.damp!==null&&Math.abs(c.damp-c.dry)>=12);}
export function depthIndex(c:DepthChannel,raw:number){return c.dry!==null&&c.damp!==null&&Math.abs(c.damp-c.dry)>=12?(raw-c.dry)*100/(c.damp-c.dry):null;}
export function depthCommand(previous:DepthReading,samples:[number[],number[]],command:string,now:number):DepthReading{
 if(command==='\r'||command==='\n')return previous;
 const raw=samples.map(depthRead) as DepthPair,s:DepthReading={...previous,raw,channels:previous.channels.map(c=>({...c})) as DepthReading['channels'],message:''};
 if(command==='d'||command==='w'){s.channels.forEach((c,i)=>{if(command==='d')c.dry=raw[i];else c.damp=raw[i];});s.running=false;s.message='References saved for upper and lower probes.';}
 else if(command==='p')s.message=`Upper and lower raw: ${raw.join(',')}. Preview does not record a response.`;
 else if(command==='r'){s.channels.forEach(c=>{c.dry=c.damp=null;});s.running=false;s.message='References and trial cleared.';}
 else if(command==='b'||command==='l'){
  if(command==='b'&&!depthValid(s)){s.message='Capture distinct dry and damp references first.';return s;}
  if(command==='l'&&!s.running){s.message='Set a baseline with b.';return s;}
  if(command==='b'){s.channels.forEach((c,i)=>{c.baseline=depthIndex(c,raw[i])!;c.first=null;});s.startedAt=now>>>0;s.running=true;s.rows=[];}
  const seconds=Math.floor(((now-s.startedAt)>>>0)/1000),index=s.channels.map((c,i)=>depthIndex(c,raw[i])!) as DepthPair,rise=index.map((v,i)=>v-s.channels[i].baseline) as DepthPair;
  s.channels.forEach((c,i)=>{if(c.first===null&&rise[i]>=8)c.first=seconds;});
  s.rows=[...s.rows,{seconds,index,rise,first:s.channels.map(c=>c.first) as [number|null,number|null]}];s.message=command==='b'?'Baseline saved before watering.':'Paired observation saved.';
 }
 return s;
}
export function depthCsv(rows:DepthRow[]){return['elapsed_s,upper_index,upper_rise,upper_first_s,lower_index,lower_rise,lower_first_s',...rows.map(r=>`${r.seconds},${r.index[0].toFixed(1)},${r.rise[0].toFixed(1)},${r.first[0]??''},${r.index[1].toFixed(1)},${r.rise[1].toFixed(1)},${r.first[1]??''}`)].join('\n')+'\n';}
export type DepthWater={added:number;surface:number;upper:number;lower:number;runoff:number};
export const depthWaterInitial:DepthWater={added:0,surface:0,upper:0,lower:0,runoff:0};
export function depthAdd(s:DepthWater,dose:number):DepthWater{const n=Math.max(0,dose);return{...s,added:s.added+n,surface:s.surface+n};}
// Illustrative two-layer infiltration model, mL and model seconds. No guaranteed real-world delay.
export function depthAdvance(s:DepthWater,seconds:number):DepthWater{const n={...s};let left=Math.max(0,seconds);while(left>1e-8){const dt=Math.min(left,.05);left-=dt;const into=Math.min(n.surface,.7*dt),down=n.upper*(1-Math.exp(-.012*dt)),out=n.lower*(1-Math.exp(-.004*dt));n.surface-=into;n.upper+=into-down;n.lower+=down-out;n.runoff+=out;}return n;}
export function depthMoisture(s:DepthWater):DepthPair{return[20+Math.min(75,s.upper*2),20+Math.min(75,s.lower*2)];}
export function depthRaw(index:number,channel:number){return(channel?805:780)-(channel?4.3:4)*index;}
export type DepthPose={position:DepthPoint;rotation:number};
export const depthInstalled:DepthPose[]=[{position:[.78631,2.01,.2],rotation:Math.PI/2},{position:[.91923,1.05,.2],rotation:Math.PI/2}];
export function depthReference(location:0|1,channel:number):DepthPose{return{position:[(location?-.1:-1.9)+(channel? .26:-.26),1.1,-1.8],rotation:0};}
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function depthPose(location:0|1|2,channel:number):DepthPose{return location===2?depthInstalled[channel]:depthReference(location,channel);}
// Extract horizontally through the prepared side slot; only rotate once fully outside the pot.
export function depthTransfer(from:0|1|2,to:0|1|2,channel:number,p:number):DepthPose{
 const a=depthPose(from,channel),b=depthPose(to,channel),left=channel?-.2:-1.9,high=5.4,z=-3.2-(channel*.45),t=Math.max(0,Math.min(1,p));
 const nodes:DepthPose[]=[a,...(from===2?[{position:[left,a.position[1],.2] as DepthPoint,rotation:Math.PI/2},{position:[left,high,.2] as DepthPoint,rotation:Math.PI/2}]:[{position:[a.position[0],high,a.position[2]] as DepthPoint,rotation:0}]),{position:[left,high,z],rotation:0},...(to===2?[{position:[left,high,.2] as DepthPoint,rotation:Math.PI/2},{position:[left,b.position[1],.2] as DepthPoint,rotation:Math.PI/2}]:[{position:[b.position[0],high,b.position[2]] as DepthPoint,rotation:0}]),b];
 const q=t*(nodes.length-1),i=Math.min(nodes.length-2,Math.floor(q)),k=ease(q-i),u=nodes[i],v=nodes[i+1];return{position:u.position.map((x,j)=>x+(v.position[j]-x)*k) as DepthPoint,rotation:u.rotation+(v.rotation-u.rotation)*k};
}
export function depthPourPose(p:number){const t=Math.max(0,Math.min(1,p)),park:DepthPoint=[4.4,1.08,-1.7];if(t<.25)return{position:[4.4,1.08+4.42*ease(t/.25),-1.7] as DepthPoint,rotation:0};if(t<.55){const n=ease((t-.25)/.3);return{position:[4.4-2.1*n,5.5,-1.7+2*n] as DepthPoint,rotation:0};}if(t<.75)return{position:[2.3,5.5,.3] as DepthPoint,rotation:1.1*ease((t-.55)/.2)};return{position:[2.3,5.5-1.7*ease((t-.75)/.25),.3] as DepthPoint,rotation:1.1};}

// A RAF timestamp may precede the effect's start by part of a frame. Never overfill the dose.
export function depthDoseRemaining(elapsedMs:number){return 60*(1-Math.max(0,Math.min(1,elapsedMs/4000)));}
