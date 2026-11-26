import {rfidConnectionState,type RfidConnections} from './rfid-connections';
import {rfidWorkshopInitial,rfidWorkshopBegin,rfidWorkshopRead,type RfidWorkshopState} from './rfid-workshop';
import {rfidLatchAdvance} from './rfid-latch';
import {rfidClassroomTags,rfidPresentedTag,type RfidTagName} from './rfid-tags';
export type RfidSessionSettings={assembled:boolean;usb:boolean;readerReady:boolean;servoPower:boolean;servoGround:boolean;servoSignal:boolean;tag:RfidTagName|null;connections?:RfidConnections;dcSeated?:boolean};
export const rfidSessionDefaults:RfidSessionSettings={assembled:false,usb:false,readerReady:true,servoPower:false,servoGround:true,servoSignal:true,tag:null};
export type RfidSession={controller:RfidWorkshopState|null;clockMs:number;readRemaining:number;remainderMs:number;angle:number;tagA:number;tagB:number;pendingSerial:string};
export function rfidSessionInitial():RfidSession{return {controller:null,clockMs:0,readRemaining:180,remainderMs:0,angle:35,tagA:0,tagB:0,pendingSerial:''};}
export function rfidSessionCommand(state:RfidSession,text:string):RfidSession{return state.controller?{...state,pendingSerial:state.pendingSerial+text}:state;}
export function rfidSessionReset(previous:RfidSession,settings:RfidSessionSettings):RfidSession{
 if(!settings.assembled||!settings.usb)return {...previous,controller:null,clockMs:0,readRemaining:180,pendingSerial:''};
 return {...previous,controller:rfidWorkshopBegin(rfidWorkshopInitial(settings.readerReady),0),clockMs:0,readRemaining:180,pendingSerial:''};
}
/** Authored 180 ms reader cycle and 900 ms tag travel, not measured RF / AVR timing.
 * Begin/read phases preserve GPIO-before-scan ordering. One-ms physical integration
 * keeps fractional-frame partitioning deterministic and avoids command teleports. */
export function rfidSessionAdvance(previous:RfidSession,settings:RfidSessionSettings,elapsedMs:number):RfidSession{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid RFID elapsed time');
 let s=previous,remaining=previous.remainderMs+elapsedMs;
 const circuit=settings.connections?rfidConnectionState(settings.connections,settings.dcSeated!==false):null;
 const move=(value:number,target:number)=>Math.abs(value-target)<=1/900+1e-10?target:value+Math.sign(target-value)/900;
 while(remaining>=1-1e-9){
  const requested=settings.assembled?settings.tag:null;
  let a=s.tagA,b=s.tagB;
  if(requested!=='A')a=move(a,0);if(requested!=='B')b=move(b,0);
  if(requested==='A'&&b===0)a=move(a,1);if(requested==='B'&&a===0)b=move(b,1);
  s={...s,tagA:a,tagB:b};
  if(!settings.assembled||!settings.usb)s=rfidSessionReset(s,settings);
  else{
   if(s.controller===null)s=rfidSessionReset(s,settings);
   const c=s.controller!,angle=rfidLatchAdvance(s.angle,c.commandAngle,1,settings.servoPower&&settings.servoGround&&settings.servoSignal&&(!circuit||(circuit.servoPower&&circuit.servoGround&&circuit.servoSignal))),clockMs=(s.clockMs+1)>>>0,readRemaining=s.readRemaining-1;
   s={...s,angle,clockMs,readRemaining};
   if(readRemaining===0){
    const tag=rfidPresentedTag(a,b),uid=settings.readerReady&&tag?rfidClassroomTags[tag].uid:null;
    const scanned=rfidWorkshopRead(c,clockMs,uid),controller=rfidWorkshopBegin(scanned,clockMs,s.pendingSerial);
    s={...s,controller,readRemaining:180,pendingSerial:''};
   }
  }
  remaining-=1;
 }
 return {...s,remainderMs:Math.max(0,Math.round(remaining*1e9)/1e9)};
}

/** GPIO commands and visibly lit LEDs differ when a series or return lead is absent. */
export function rfidSessionIndicators(state:RfidSession,settings:RfidSessionSettings){
 const circuit=settings.connections?rfidConnectionState(settings.connections,settings.dcSeated!==false):null;
 return {red:!!state.controller?.red&&(!circuit||circuit.red),green:!!state.controller?.green&&(!circuit||circuit.green)};
}
