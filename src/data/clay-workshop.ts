export type ClayLocation=0|1|2;export type ClayPoint=[number,number,number];export type ClayMode='snug'|'gap';
export type ClaySet={count:number;low:number;high:number};export type ClayReading={sampledAt:number;raw:number|null;dry:number|null;damp:number|null;active:ClayMode;snug:ClaySet;gap:ClaySet;index:number|null;status:'missing'|'close'|'ready';message:string};
const empty=():ClaySet=>({count:0,low:1023,high:0});
export const clayInitial:ClayReading={sampledAt:0,raw:null,dry:null,damp:null,active:'snug',snug:empty(),gap:empty(),index:null,status:'missing',message:''};
export function claySamples(raw:number){const v=Math.max(0,Math.min(1023,raw)),n=Math.floor(v),high=Math.round((v-n)*16);return Array.from({length:16},(_,i)=>n+(i<high?1:0));}
export function clayUpdate(previous:ClayReading,samples:number[],commands:string[],now:number):ClayReading{
 if(now-previous.sampledAt<400)return previous;
 if(samples.length!==16||samples.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Sixteen valid ADC reads are required.');
 const raw=Math.floor((samples.reduce((a,b)=>a+b,0)+8)/16);let {dry,damp,active}=previous,snug={...previous.snug},gap={...previous.gap},message='';
 const calibrated=()=>dry!==null&&damp!==null&&Math.abs(dry-damp)>=12;
 for(const c of commands){if(c==='d'){dry=raw;snug=empty();gap=empty();}else if(c==='w'){damp=raw;snug=empty();gap=empty();}else if(c==='s'){snug=empty();active='snug';}else if(c==='g'){gap=empty();active='gap';}else if(c==='r'){dry=damp=null;snug=empty();gap=empty();active='snug';}else if(c==='n'){const set=active==='snug'?snug:gap;if(!calibrated())message='Set valid endpoints before capturing a repeat.';else if(set.count===3)message='Set full. Select s or g to start a fresh set.';else{set.low=Math.min(set.low,raw);set.high=Math.max(set.high,raw);set.count++;}}}
 const status=dry===null||damp===null?'missing':Math.abs(dry-damp)<12?'close':'ready',index=status==='ready'?(raw-dry!)*100/(damp!-dry!):null;
 return {sampledAt:now,raw,dry,damp,active,snug,gap,index,status,message};
}
export const clayLocations:ClayPoint[]=[[-.75,1.1,-1.4],[.75,1.1,-1.4],[2.1,1.1,.7]];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function clayPose(from:ClayLocation,to:ClayLocation,t:number):ClayPoint{const a=clayLocations[from],b=clayLocations[to],p=Math.max(0,Math.min(1,t));if(p===1)return [...b];if(p<.25)return[a[0],a[1]+(3.4-a[1])*ease(p/.25),a[2]];if(p<.75){const n=ease((p-.25)/.5);return[a[0]+(b[0]-a[0])*n,3.4,a[2]+(b[2]-a[2])*n];}return[b[0],3.4+(b[1]-3.4)*ease((p-.75)/.25),b[2]];}
export function clayContact(location:ClayLocation,pose:ClayPoint){const a=clayLocations[location];return Math.max(0,1-Math.hypot(pose[0]-a[0],pose[2]-a[2])/.15)*Math.max(0,Math.min(1,1-(pose[1]-a[1])/.55));}
export function clayRaw(location:ClayLocation,gap:number,insertion:number){if(location===0)return 775;if(location===1)return 385;const i=((insertion%3)+3)%3,snug=[531,535,529][i],loose=[613,646,599][i],g=Math.max(0,Math.min(1,gap));return snug+(loose-snug)*g;}
export function clayCaptureReady(expected:ClayLocation,location:ClayLocation,progress:number,gap:number,targetGap:number,raw:number,target:number,sampled:number|null,enabled:boolean,serial=0,requiredSerial=0){return enabled&&serial===requiredSerial&&expected===location&&progress===1&&Math.abs(gap-targetGap)<.002&&Math.abs(raw-target)<.7&&sampled!==null&&Math.abs(sampled-target)<=1;}
export function claySpread(set:ClaySet){return set.count?set.high-set.low:null;}
