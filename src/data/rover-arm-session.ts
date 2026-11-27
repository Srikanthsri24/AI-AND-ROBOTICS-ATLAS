/** Logical Arduino execution for directory-35. These are software requests;
 * motor supplies, I²C delivery and mechanical motion belong to the workbench. */
export type RoverArmMode='off'|'rover'|'arm';
export type RoverArmInput={usb:boolean;selectorGrounded:boolean;servoDriverAvailable:boolean;distanceCm:number;echoPresent:boolean};
export type RoverArmWrite={id:number;atUs:number;kind:'servo';channel:number;pulseUs:number}|{id:number;atUs:number;kind:'wheels';left:number;right:number};
export type RoverArmSession={
 clockUs:number;nextLoopUs:number;remainderUs:number;mode:RoverArmMode;halted:boolean;
 turning:boolean;changedMs:number;sampledMs:number;wheels:readonly[number,number];standby:boolean;
 frequencyHz:number;servoRequests:readonly(number|null)[];homed:boolean;active:number;
 pending:null|{finishUs:number;echoUs:number};queue:string;rows:readonly string[];
 reads:number;nextWriteId:number;writes:readonly RoverArmWrite[];
};
export type RoverArmProbe=(pulseStartUs:number)=>{distanceCm:number;echoPresent:boolean};
export const roverArmInput:RoverArmInput={usb:false,selectorGrounded:true,servoDriverAvailable:true,distanceCm:60,echoPresent:true};
export const roverArmSessionInitial=():RoverArmSession=>({clockUs:0,nextLoopUs:0,remainderUs:0,mode:'off',halted:false,turning:false,changedMs:0,sampledMs:0,wheels:[0,0],standby:false,frequencyHz:0,servoRequests:[null,null,null,null,null,null],homed:false,active:-1,pending:null,queue:'',rows:[],reads:0,nextWriteId:1,writes:[]});
const millis=(us:number)=>Math.floor(us/1000)>>>0;
const elapsed=(now:number,then:number)=>(now-then)>>>0;
const row=(s:RoverArmSession,text:string):RoverArmSession=>({...s,rows:[...s.rows,text].slice(-80)});
function wheels(s:RoverArmSession,left:number,right:number):RoverArmSession{return{...s,wheels:[left,right],writes:[...s.writes,{id:s.nextWriteId,atUs:s.clockUs,kind:'wheels',left,right}as const].slice(-512),nextWriteId:s.nextWriteId+1};}
function servo(s:RoverArmSession,channel:number,pulseUs:number):RoverArmSession{const requests=[...s.servoRequests];requests[channel]=pulseUs;return{...s,servoRequests:requests,writes:[...s.writes,{id:s.nextWriteId,atUs:s.clockUs,kind:'servo',channel,pulseUs}as const].slice(-512),nextWriteId:s.nextWriteId+1};}
/** The Uno's serial receive buffer has 63 usable bytes. New input is dropped
 * when it is full. Rover mode and failed startup do not consume this buffer.
 * ArduinoCore-avr HardwareSerial.h / HardwareSerial_private.h define the
 * default 64-slot ring and leave one slot unused; custom core buffers differ.
 * https://github.com/arduino/ArduinoCore-avr/tree/master/cores/arduino */
export function roverArmEnqueue(s:RoverArmSession,text:string):RoverArmSession{if(typeof text!=='string'||!/^[\x00-\x7f]*$/.test(text))throw new RangeError('Send ASCII serial commands');if(s.mode==='off')return s;return{...s,queue:(s.queue+text).slice(0,63)};}
export function roverArmEcho(distanceCm:number,present=true){if(!Number.isFinite(distanceCm)||distanceCm<0||distanceCm>500)throw new RangeError('Invalid rover range');const pulse=Math.round(distanceCm*20000/343);return present&&pulse>0&&pulse<=10000?pulse:0;}
export function roverArmEchoCm(echoUs:number){if(!Number.isInteger(echoUs)||echoUs<0||echoUs>10000)throw new RangeError('Invalid rover echo pulse');return echoUs?Math.floor((echoUs*343+10000)/20000):-1;}
function boot(s:RoverArmSession,input:RoverArmInput):RoverArmSession{
 if(input.selectorGrounded)return wheels({...s,mode:'rover',standby:true},0,0);
 let next:RoverArmSession={...s,mode:'arm'};
 if(!input.servoDriverAvailable)return row({...next,halted:true},'Driver unavailable');
 next={...next,frequencyHz:50};for(let channel=0;channel<6;channel++)next=servo(next,channel,0);
 return row(next,'With horns clear, send h for neutral, then 1–6 to jog.');
}
function finishRange(s:RoverArmSession):RoverArmSession{const cm=roverArmEchoCm(s.pending!.echoUs);s=row({...s,pending:null,reads:s.reads+1},String(cm));if(cm<4)return wheels(s,0,0);if(cm<=25)return wheels({...s,turning:true,changedMs:millis(s.clockUs)},112,-112);return wheels(s,116,116);}
function beginLoop(s:RoverArmSession,input:RoverArmInput,probe?:RoverArmProbe):RoverArmSession{
 const now=millis(s.clockUs);
 if(s.mode==='rover'){
  if(s.turning&&elapsed(now,s.changedMs)<320)return{...s,nextLoopUs:s.clockUs+1000};
  if(s.turning)s=wheels({...s,turning:false},0,0);
  if(elapsed(now,s.sampledMs)<70)return{...s,nextLoopUs:s.clockUs+1000};
  const reading=probe?.(s.clockUs+12)??input,echoUs=roverArmEcho(reading.distanceCm,reading.echoPresent);
  return{...s,sampledMs:now,pending:{echoUs,finishUs:s.clockUs+12+(echoUs||10000)}};
 }
 if(s.active>=0&&elapsed(now,s.changedMs)>=650){s=servo(s,s.active,1500);s={...s,active:-1};}
 if(s.queue.length){const command=s.queue[0];s={...s,queue:s.queue.slice(1)};if(command==='h'){for(let channel=0;channel<6;channel++)s=servo(s,channel,1500);s={...s,homed:true,active:-1};}else if(s.homed&&s.active<0&&command>='1'&&command<='6'){const channel=Number(command)-1;s=servo(s,channel,1560);s={...s,active:channel,changedMs:now};}}
 return{...s,nextLoopUs:s.clockUs+1000};
}
/** A 1 ms idle between sketch loop entries mirrors the other workshop execution
 * models. Acquisition uses the echo duration/timeout plus the 12 µs trigger; sensor
 * turnaround latency and CPU instruction timing are outside this model.
 * No range read occurs during a 320 ms turn; the selector is sampled only at boot. */
export function roverArmSessionAdvance(previous:RoverArmSession,input:RoverArmInput,ms:number,probe?:RoverArmProbe):RoverArmSession{
 if(!Number.isFinite(ms)||ms<0||ms*1000+previous.clockUs>Number.MAX_SAFE_INTEGER)throw new RangeError('Invalid rover/arm interval');roverArmEcho(input.distanceCm,input.echoPresent);
 if(!input.usb)return roverArmSessionInitial();
 const total=previous.remainderUs+ms*1000,whole=Math.floor(total+1e-9),remainderUs=Math.max(0,Math.round((total-whole)*1e9)/1e9);let s=previous.mode==='off'?boot(previous,input):previous;const end=s.clockUs+whole;
 if(s.halted)return{...s,clockUs:end,remainderUs};
 while(true){
  if(s.pending&&s.pending.finishUs<=s.clockUs){s=finishRange(s);s={...s,nextLoopUs:s.clockUs+1000};}
  if(!s.pending&&s.nextLoopUs<=s.clockUs)s=beginLoop(s,input,probe);
  if(s.clockUs>=end)break;
  s={...s,clockUs:Math.min(end,s.pending?.finishUs??s.nextLoopUs)};
 }
 return{...s,remainderUs};
}
