/** Execution model for the downloadable directory-36 sketch. Motor power and
 * mechanical response are separate: these values are controller requests. */
export type PickBalanceInput={usb:boolean;balanceSelector:boolean;deviceAvailable:boolean;tiltDeg:number;gyroDegPerSec:number};
export type PickBalanceProbe=(atMs:number)=>{tiltDeg:number;gyroDegPerSec:number};
export type PickBalanceSession={clockMs:number;nextLoopMs:number;remainderMs:number;mode:'off'|'pick'|'balance';initialized:boolean;standby:boolean;queue:string;pick:number;stepAt:number;wheel:number;servo:readonly[number|null,number|null];frequencyHz:number;armed:boolean;armRequested:boolean;pitch:number;gyroBias:number;level:number;lastSampleUs:number;reportAt:number;calibration:null|{startMs:number;nextMs:number;count:number;total:number;lastTilt:number};rows:readonly string[]};
export const pickBalanceInput:PickBalanceInput={usb:false,balanceSelector:false,deviceAvailable:true,tiltDeg:0,gyroDegPerSec:0};
export function pickBalanceSessionInitial():PickBalanceSession{return{clockMs:0,nextLoopMs:0,remainderMs:0,mode:'off',initialized:false,standby:false,queue:'',pick:-1,stepAt:0,wheel:0,servo:[null,null],frequencyHz:0,armed:false,armRequested:false,pitch:0,gyroBias:0,level:0,lastSampleUs:0,reportAt:0,calibration:null,rows:[]};}
const f=Math.fround,wait=[350,450,850,450,300];
const elapsed=(a:number,b:number)=>(a-b)>>>0;
function row(s:PickBalanceSession,text:string){return{...s,rows:[...s.rows,text].slice(-80)};}
export function pickBalanceEnqueue(s:PickBalanceSession,text:string):PickBalanceSession{if(!/^[\x00-\x7f]*$/.test(text))throw new RangeError('ASCII serial commands required');return s.mode==='off'?s:{...s,queue:(s.queue+text).slice(0,63)};}
function motion(s:PickBalanceSession):PickBalanceSession{switch(s.pick){case 0:return{...s,servo:[1440,1550]};case 1:return{...s,servo:[1560,s.servo[1]]};case 2:return{...s,wheel:100};case 3:return{...s,wheel:0,servo:[1440,s.servo[1]]};case 4:return{...s,servo:[s.servo[0],1450]};default:return s;}}
function boot(s:PickBalanceSession,i:PickBalanceInput):PickBalanceSession{s={...s,mode:i.balanceSelector?'balance':'pick',initialized:i.deviceAvailable};if(!i.deviceAvailable)return row(s,'I2C device unavailable');if(!i.balanceSelector)s={...s,servo:[1440,1450],frequencyHz:50};return row({...s,standby:true},i.balanceSelector?'b = arm upright, x = stop':'p = transfer, x = stop');}
function reading(at:number,i:PickBalanceInput,probe?:PickBalanceProbe){const r=probe?.(at)??i;if(!Number.isFinite(r.tiltDeg)||!Number.isFinite(r.gyroDegPerSec))throw new RangeError('Finite IMU sample required');return{tiltDeg:f(r.tiltDeg),gyroDegPerSec:f(r.gyroDegPerSec)};}
function loop(s:PickBalanceSession,i:PickBalanceInput,probe?:PickBalanceProbe):PickBalanceSession{
 const now=Math.floor(s.clockMs)>>>0,key=s.queue[0]??'';s={...s,queue:s.queue.slice(1)};
 if(key==='x')s={...s,armed:false,armRequested:false,pick:-1,wheel:0};
 if(key==='b'&&s.mode==='balance'&&!s.armed)s={...s,armRequested:true};
 if(s.mode==='pick'){
  if(key==='p'&&s.pick<0)s=motion({...s,pick:0,stepAt:now});
  if(s.pick>=0&&elapsed(now,s.stepAt)>=wait[s.pick])s=s.pick===4?{...s,pick:-1,wheel:0}:motion({...s,pick:s.pick+1,stepAt:now});
  return s;
 }
 const stamp=Math.round(s.clockMs*1000)>>>0,dt=elapsed(stamp,s.lastSampleUs);if(dt<10000)return s;
 s={...s,lastSampleUs:stamp};const r=reading(s.clockMs,i,probe);
 if(s.armRequested){s={...s,armRequested:false};if(Math.abs(r.tiltDeg)>=6)return s;const c=reading(s.clockMs,i,probe);return{...s,calibration:{startMs:s.clockMs,nextMs:s.clockMs+10,count:1,total:c.gyroDegPerSec,lastTilt:c.tiltDeg}};}
 const rate=f(r.gyroDegPerSec-s.gyroBias),tilt=f(r.tiltDeg-s.level);
 if(dt>40000)s={...s,armed:false,pitch:tilt};else s={...s,pitch:f(f(.98*f(s.pitch+f(f(rate*dt)*.000001)))+f(.02*tilt))};
 if(Math.abs(s.pitch)>24||Math.abs(tilt)>24)s={...s,armed:false};
 const command=Math.trunc(f(f(8*s.pitch)+f(.9*rate)));s={...s,wheel:s.armed?Math.max(-155,Math.min(155,command)):0};
 if(elapsed(now,s.reportAt)>=100)s=row({...s,reportAt:now},s.pitch.toFixed(1)+(s.armed?' active':' stopped'));
 return s;
}
/** 1 ms idle loop; calibration reproduces the sketch's thirty 10 ms blocking
 * gyro reads. Queued x is processed only after calibration returns, as on Uno.
 * Sensor acquisition/bus latency is not included. Probe time is absolute. */
export function pickBalanceSessionAdvance(previous:PickBalanceSession,input:PickBalanceInput,ms:number,probe?:PickBalanceProbe):PickBalanceSession{
 if(!Number.isFinite(ms)||ms<0||!Number.isSafeInteger(Math.floor(previous.clockMs+ms)))throw new RangeError('Invalid execution interval');reading(previous.clockMs,input);
 if(!input.usb)return pickBalanceSessionInitial();
 const total=previous.remainderMs+ms,whole=Math.floor(total+1e-9),remainderMs=Math.max(0,Math.round((total-whole)*1e9)/1e9);let s=previous.mode==='off'?boot(previous,input):previous;const end=s.clockMs+whole;
 if(!s.initialized)return{...s,clockMs:end,remainderMs};
 while(true){
  if(s.calibration){const c=s.calibration;if(c.nextMs<=s.clockMs){if(c.count===30){s={...s,calibration:null,level:c.lastTilt,gyroBias:f(c.total/30),pitch:0,lastSampleUs:Math.round(s.clockMs*1000)>>>0,armed:Math.abs(c.lastTilt)<6,nextLoopMs:s.clockMs+1};}else{const r=reading(s.clockMs,input,probe);s={...s,calibration:{...c,nextMs:c.nextMs+10,count:c.count+1,total:f(c.total+r.gyroDegPerSec),lastTilt:r.tiltDeg}};}}}
  else if(s.nextLoopMs<=s.clockMs){s=loop(s,input,probe);s={...s,nextLoopMs:s.clockMs+1};}
  if(s.clockMs>=end)break;
  s={...s,clockMs:Math.min(end,s.calibration?.nextMs??s.nextLoopMs)};
 }
 return{...s,remainderMs};
}
