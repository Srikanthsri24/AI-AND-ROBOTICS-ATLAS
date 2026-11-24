type Point=[number,number,number];
export type ColdPackReading={sampledAt:number;mean:number|null;volts:number|null;temperature:number|null;warning:boolean;warmStartedAt:number|null;elapsedWarm:number};
export const coldPackInitial:ColdPackReading={sampledAt:0,mean:null,volts:null,temperature:null,warning:false,warmStartedAt:null,elapsedWarm:0};
export function coldPackControl(previous:ColdPackReading,temperature:number,now:number){
 let warning=previous.warning,warmStartedAt=previous.warmStartedAt;
 if(temperature<=18)warning=false;
 if(temperature<20||warning)warmStartedAt=null;
 else if(warmStartedAt===null)warmStartedAt=now;
 else if(now-warmStartedAt>=3000){warning=true;warmStartedAt=null;}
 return {warning,warmStartedAt,elapsedWarm:warmStartedAt===null?0:now-warmStartedAt};
}
export function coldPackUpdate(previous:ColdPackReading,samples:number[],correction:number,now:number):ColdPackReading{
 if(now-previous.sampledAt<250)return previous;
 if(samples.length!==16||samples.some(n=>!Number.isInteger(n)||n<0||n>1023))throw new Error('Sixteen valid ADC readings are required.');
 const mean=samples.reduce((s,n)=>s+n,0)/16,volts=mean*5/1023,temperature=(volts-.5)*100+correction;
 return {sampledAt:now,mean,volts,temperature,...coldPackControl(previous,temperature,now)};
}
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
// Pack body is 0.38 high. Lift above the 0.44-high tray rim before travelling.
export function coldPackPose(progress:number):Point{const t=Math.max(0,Math.min(1,progress));if(t===1)return [1,.48,-.55];if(t<.25)return [-1, .48+.92*ease(t/.25),-1.55];if(t<.75){const p=ease((t-.25)/.5);return [-1+2*p,1.4,-1.55+p];}return [1,1.4-.92*ease((t-.75)/.25),-.55];}
export function coldPackCoupling(progress:number){const [x,y,z]=coldPackPose(progress);return Math.max(0,1-Math.hypot(x-1,z+.55)/.7)*Math.max(0,1-(y-.48)/.35);}
export function coldPackAdvance(previous:number,room:number,pack:number,progress:number,seconds:number){const target=room-Math.max(0,room-pack)*.65*coldPackCoupling(progress);return target+(previous-target)*Math.exp(-Math.max(0,seconds)/3);}
