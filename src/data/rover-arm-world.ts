import {roverArmSessionInitial,roverArmSessionAdvance,roverArmEnqueue,type RoverArmSession} from './rover-arm-session';
import {raArmDriverInitial,raArmDriverPower,raArmBusReady,raArmDriverConfigure50,raArmDriverWrite,raArmDriverOutputs,type RaArmDriver,type RaServoLead} from './rover-arm-driver';

/** Exact guide topology: Uno 5V powers PCA logic; external V+ powers servos.
 * servoSupply means the external supply has both V+ and return connected.
 * Wiring is held constant within one advance; apply edits at frame boundaries. */
export type RaArmWiring={usb:boolean;selectorGrounded:boolean;logicVcc:boolean;logicGround:boolean;sda:boolean;scl:boolean;address40:boolean;servoSupply:boolean;outputEnabled:boolean;leads:readonly RaServoLead[];distanceCm:number;echoPresent:boolean};
export type RaArmWorld={session:RoverArmSession;driver:RaArmDriver};
export const raArmWiringInitial=():RaArmWiring=>({usb:false,selectorGrounded:false,logicVcc:false,logicGround:false,sda:false,scl:false,address40:true,servoSupply:false,outputEnabled:true,leads:Array.from({length:6},()=>({signal:false,power:false,ground:false})),distanceCm:60,echoPresent:true});
export const raArmWorldInitial=():RaArmWorld=>({session:roverArmSessionInitial(),driver:raArmDriverInitial()});
export function raArmWorldEnqueue(s:RaArmWorld,text:string):RaArmWorld{return{...s,session:roverArmEnqueue(s.session,text)};}
export function raArmWorldOutputs(s:RaArmWorld,w:RaArmWiring){return raArmDriverOutputs(s.driver,{servoSupply:w.servoSupply,outputEnabled:w.outputEnabled,leads:w.leads});}

/** Consume new writes before the sketch's bounded trace can evict them. A 1 ms
 * execution slice contains at most one serial command and its six h writes.
 * This composes logical execution and atomic driver delivery, not motor motion
 * or low-level I²C transaction timing. Failed commands are consumed, not queued. */
export function raArmWorldAdvance(previous:RaArmWorld,w:RaArmWiring,ms:number):RaArmWorld{
 if(!Number.isFinite(ms)||ms<0||previous.session.clockUs+ms*1000>Number.MAX_SAFE_INTEGER)throw new RangeError('Invalid workshop interval');
 if(w.leads.length!==6)throw new RangeError('Six servo lead states required');
 let driver=raArmDriverPower(previous.driver,w.usb&&w.logicVcc&&w.logicGround),session=previous.session;
 const bus={unoPowered:w.usb,ground:w.logicGround,sda:w.sda,scl:w.scl,address40:w.address40};
 const input={usb:w.usb,selectorGrounded:w.selectorGrounded,servoDriverAvailable:raArmBusReady(driver,bus),distanceCm:w.distanceCm,echoPresent:w.echoPresent};
 let remaining=ms;
 do{
  const step=Math.min(1,remaining),old=session;
  session=roverArmSessionAdvance(old,input,step);
  if(old.mode==='off'&&session.mode==='arm'&&!session.halted)driver=raArmDriverConfigure50(driver,bus);
  for(const write of session.writes)if(write.id>=old.nextWriteId&&write.kind==='servo')driver=raArmDriverWrite(driver,bus,write);
  remaining=Math.max(0,remaining-step);
 }while(remaining>0);
 return{session,driver};
}
