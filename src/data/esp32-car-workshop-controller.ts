/** Discrete frontend model of esp32_dual_link_rover.ino's main loop and motor task.
 * Call mainLoop and motorTask separately: a stalled network loop must not stall the watchdog.
 * Events inspect the model; they are not telemetry emitted by the published sketch.
 */
export type EspCarMode='wifi'|'classic';
export type EspCarDirection=-1|0|1;
export type EspCarState={mode:EspCarMode|null;radioReady:boolean;workerReady:boolean;queue:string|null;rx:number[];left:EspCarDirection;right:EspCarDirection;waitAt:number;lastApplied:string|null;stopReason:'startup'|'stop command'|'receive timeout'|null;httpStatus:204|400|null;events:{at:number;text:string}[]};
export type EspCarBootOptions={passwordChanged?:boolean;apStarted?:boolean;classicStarted?:boolean;queueCreated?:boolean;taskCreated?:boolean};
const directions:Record<string,readonly[EspCarDirection,EspCarDirection]>={F:[1,1],B:[-1,-1],L:[-1,1],R:[1,-1],S:[0,0]};
export const espCarPulseMs=850,espCarPwm=110;
const event=(s:EspCarState,now:number,text:string):EspCarState=>({...s,events:[...s.events,{at:now>>>0,text}].slice(-40)});
export function espCarBoot(jumperGrounded:boolean,now=0,options:EspCarBootOptions={}):EspCarState{
 const workerReady=options.queueCreated!==false&&options.taskCreated!==false,mode=workerReady?(jumperGrounded?'classic':'wifi'):null,radioReady=workerReady&&(mode==='classic'?options.classicStarted!==false:options.passwordChanged!==false&&options.apStarted!==false);
 return {mode,radioReady,workerReady,queue:null,rx:[],left:0,right:0,waitAt:now>>>0,lastApplied:null,stopReason:'startup',httpStatus:null,events:[{at:now>>>0,text:!workerReady?'Startup returned before starting either radio.':!radioReady?'Selected radio did not start. Motor task remains independent.':`${mode==='wifi'?'Wi-Fi AP':'Bluetooth Classic'} selected at boot; outputs disabled.`}]};
}
function submit(s:EspCarState,key:string,now:number){const valid=key.length===1&&Object.hasOwn(directions,key),queued=valid?key:'S';return {valid,state:event({...s,queue:queued},now,`Overwrite one-slot queue → ${queued}${valid?'':' (unsupported input)'}.`)};}
/** HTTP acceptance means queued, not physically applied. An unavailable radio produces no response. */
export function espCarHttp(s:EspCarState,input:string,now:number):EspCarState{
 if(s.mode!=='wifi'||!s.radioReady)return event({...s,httpStatus:null},now,'No running Wi-Fi endpoint; request was not delivered.');
 const bytes=new TextEncoder().encode(input),r=submit(s,bytes.length===1?String.fromCharCode(bytes[0]):'\0',now);return event({...r.state,httpStatus:r.valid?204:400},now,`HTTP ${r.valid?204:400} · motor task has not necessarily consumed the queue.`);
}
export function espCarBluetoothReceive(s:EspCarState,input:string|readonly number[],now:number):EspCarState{
 if(s.mode!=='classic'||!s.radioReady)return event(s,now,'Classic SPP is not the active radio; no bytes were delivered.');
 const bytes=typeof input==='string'?Array.from(new TextEncoder().encode(input)):input.map(b=>b&255);return {...s,rx:[...s.rx,...bytes]};
}
/** One received Bluetooth byte per loop. CR/LF do not overwrite the queue or extend the wait. */
export function espCarMainLoop(s:EspCarState,now:number):EspCarState{
 if(s.mode!=='classic'||!s.radioReady||!s.rx.length)return s;
 const [byte,...rx]=s.rx,next={...s,rx};return byte===13||byte===10?event(next,now,'Line ending ignored; motor-task deadline unchanged.'):submit(next,String.fromCharCode(byte),now).state;
}
/** One xQueueReceive completion. A queued command wins at the receive deadline. */
export function espCarMotorTask(s:EspCarState,now:number):EspCarState{
 if(!s.workerReady)return s;now=now>>>0;const timeout=s.queue===null&&((now-s.waitAt)>>>0)>=espCarPulseMs;if(s.queue===null&&!timeout)return s;
 const key=s.queue??'S',[left,right]=directions[key]??directions.S;return event({...s,queue:null,left,right,waitAt:now,lastApplied:key,stopReason:timeout?'receive timeout':key==='S'?'stop command':null},now,timeout?'Motor task timed out → STBY LOW; wheels can coast.':`Motor task applied ${key} → PWM ${left||right?espCarPwm:0}.`);
}
export function espCarPins(s:EspCarState){return {GPIO25:s.left?espCarPwm:0,GPIO26:s.right?espCarPwm:0,GPIO32:s.left>0,GPIO33:s.left<0,GPIO18:s.right>0,GPIO19:s.right<0,GPIO23:s.left!==0||s.right!==0};}
