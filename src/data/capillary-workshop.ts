// Command-driven controller mirrors capillary_watering_model.ino.
export type CapillaryRow={condition:'suspended'|'immersed';seconds:number;raw:number;index:number;change:number};
export type CapillaryReading={raw:number|null;dry:number|null;damp:number|null;trial:'c'|'i'|null;baseline:number;startedAt:number;rows:CapillaryRow[];message:string};
export function capillaryInitial():CapillaryReading{return{raw:null,dry:null,damp:null,trial:null,baseline:0,startedAt:0,rows:[],message:''};}
export function capillaryRead(samples:number[]){if(samples.length!==16||samples.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Sixteen ADC readings are required.');return Math.floor((samples.reduce((a,b)=>a+b,0)+8)/16);}
export function capillaryValid(s:CapillaryReading){return s.dry!==null&&s.damp!==null&&Math.abs(s.damp-s.dry)>=12;}
export function capillaryIndex(s:CapillaryReading,raw:number){return capillaryValid(s)?(raw-s.dry!)*100/(s.damp!-s.dry!):null;}
export function capillaryCommand(previous:CapillaryReading,samples:number[],command:string,now:number):CapillaryReading{
 if(command==='\r'||command==='\n')return previous;
 const raw=capillaryRead(samples),s={...previous,raw,message:''};
 if(command==='d'||command==='w'){if(command==='d')s.dry=raw;else s.damp=raw;s.trial=null;s.message=`Reference raw ${raw}`;}
 else if(command==='r'){s.trial=null;s.dry=s.damp=null;s.message='Cleared.';}
 else if(command==='c'||command==='i'){if(!capillaryValid(s)){s.message='Capture distinct dry and damp references first.';return s;}s.trial=command;s.baseline=capillaryIndex(s,raw)!;s.startedAt=now>>>0;s.rows=[{condition:command==='c'?'suspended':'immersed',seconds:0,raw,index:s.baseline,change:0}];s.message='Baseline saved; trial started.';}
 else if(command==='l'){if(!s.trial)s.message='Start a trial with c or i.';else{const index=capillaryIndex(s,raw)!;s.rows=[...s.rows,{condition:s.trial==='c'?'suspended':'immersed',seconds:Math.floor(((now-s.startedAt)>>>0)/1000),raw,index,change:index-s.baseline}];s.message='Observation saved.';}}
 return s;
}
export function capillaryCsv(rows:CapillaryRow[]){return['wick,elapsed_s,raw,index,change_from_start',...rows.map(r=>`${r.condition},${r.seconds},${r.raw},${r.index.toFixed(1)},${r.change.toFixed(1)}`)].join('\n')+'\n';}
export type CapillaryWater={reservoir:number;wick:number;soil:number;evaporated:number;primed:boolean};
export const capillaryWaterInitial:CapillaryWater={reservoir:120,wick:0,soil:10,evaporated:0,primed:false};
// Illustrative passive uptake, not a predicted real-world rate. All quantities are mL.
export function capillaryAdvance(s:CapillaryWater,hours:number,immersed:boolean):CapillaryWater{const n={...s};let left=Math.max(0,hours);while(left>1e-9){const dt=Math.min(left,1/240);left-=dt;const uptake=immersed?Math.min(n.reservoir,Math.max(0,4-n.wick),8*dt):0;n.reservoir-=uptake;n.wick+=uptake;if(n.wick>=3.95)n.primed=true;const delivered=n.primed?Math.min(n.wick,Math.max(0,30-n.soil),8*dt):0;n.wick-=delivered;n.soil+=delivered;const soilLoss=Math.min(n.soil,n.soil/(n.soil+5)*dt),wickLoss=Math.min(n.wick,n.wick/4*.15*dt);n.soil-=soilLoss;n.wick-=wickLoss;n.evaporated+=soilLoss+wickLoss;if(n.wick<.05)n.primed=false;}return n;}
export function capillaryMoisture(s:CapillaryWater){return s.soil*2;}

export type CapillaryPoint=[number,number,number];
export type CapillaryLocation=0|1|2;
export const capillaryLocations:CapillaryPoint[]=[[-1.1,1.1,-1.7],[.4,1.1,-1.7],[1.78,3.07,.2]];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function capillaryProbePose(from:CapillaryLocation,to:CapillaryLocation,p:number):CapillaryPoint{const a=capillaryLocations[from],b=capillaryLocations[to],t=Math.max(0,Math.min(1,p));if(t<.25)return[a[0],a[1]+(5.4-a[1])*ease(t/.25),a[2]];if(t<.75){const k=ease((t-.25)/.5);return[a[0]+(b[0]-a[0])*k,5.4,a[2]+(b[2]-a[2])*k];}return[b[0],5.4+(b[1]-5.4)*ease((t-.75)/.25),b[2]];}
// The hook clears the cotton before it lowers, and returns only once the tip is raised.
export function capillaryWickHandling(from:number,to:number,p:number){const t=Math.max(0,Math.min(1,p));if(to>from){const wick=from+(to-from)*ease((t-.25)/.75);return{wick,hook:ease(t/.25)};}return{wick:from+(to-from)*ease(t/.75),hook:1-ease((t-.75)/.25)};}
export function capillaryWickPoints(immersion:number):CapillaryPoint[]{const p=Math.max(0,Math.min(1,immersion)),tip=1.48-1.06*p,bulge=.62-.54*p,points:CapillaryPoint[]=[[2.32,2.35,.2],[2.18,2.30,.2],[2.03,2.08,.2],[2,1.94,.2]];for(let i=1;i<=60;i++){const t=i/60;points.push([2+bulge*Math.sin(Math.PI*t)**2,1.94+(tip-1.94)*t,.2+(.25-.23*p)*Math.sin(Math.PI*t)]);}return points;}
// Withdraw a complete cup / wick above the frame before moving it out to the right.
export function capillaryCupOffset(progress:number):CapillaryPoint{const t=Math.max(0,Math.min(1,progress));if(t<.5)return[0,3.5*ease(t/.5),0];return[7*ease((t-.5)/.5),3.5,0];}
export function capillarySamples(raw:number){const v=Math.max(0,Math.min(1023,raw)),n=Math.floor(v),hi=Math.round((v-n)*16);return Array.from({length:16},(_,i)=>n+(i<hi?1:0));}
export function capillaryRaw(index:number){return 780-4*index;}
