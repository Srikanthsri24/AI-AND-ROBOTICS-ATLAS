import {schoolBellCompileEpoch,schoolBellInitial,schoolBellLoop,type SchoolBellState} from './school-bell-workshop';
export type SchoolBellSettings={assembled:boolean;usb:boolean;battery:boolean;rtcPower:boolean;rtcBus:boolean;displayConnected:boolean;piezoConnected:boolean};
export const schoolBellDefaults:SchoolBellSettings={assembled:false,usb:false,battery:false,rtcPower:true,rtcBus:true,displayConnected:true,piezoConnected:true};
export type SchoolBellSession={rtcMs:number;lostPower:boolean;controller:SchoolBellState|null;millis:number;loopRemaining:number;remainderMs:number;serial:string};
export function schoolBellSessionInitial():SchoolBellSession{return {rtcMs:schoolBellCompileEpoch*1000,lostPower:true,controller:null,millis:0,loopRemaining:0,remainderMs:0,serial:''};}
export function schoolBellSessionCommand(state:SchoolBellSession,text:string){return state.controller?{...state,serial:state.serial+text}:state;}
export function schoolBellSessionReset(state:SchoolBellSession):SchoolBellSession{return {...state,controller:null,millis:0,loopRemaining:0,serial:''};}
/** Authored fixed 25 ms sketch cadence. RTC seconds remain distinct from the
 * resettable Arduino millis timer; power loss marks RTC time untrusted until
 * the sketch adjusts it to its represented compile time on a successful boot. */
export function schoolBellSessionAdvance(previous:SchoolBellSession,settings:SchoolBellSettings,elapsedMs:number){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid school bell elapsed time');
 let s=previous,left=previous.remainderMs+elapsedMs;const usb=settings.assembled&&settings.usb,rtcVcc=usb&&settings.rtcPower;
 while(left>=1-1e-9){
  s={...s,rtcMs:s.rtcMs+(rtcVcc||settings.battery?1:0),lostPower:s.lostPower||!rtcVcc&&!settings.battery};
  if(!usb)s=schoolBellSessionReset(s);
  else{
   if(!s.controller){const ready=settings.rtcPower&&settings.rtcBus;if(ready&&s.lostPower)s={...s,rtcMs:schoolBellCompileEpoch*1000,lostPower:false};s={...s,controller:schoolBellInitial(Math.floor(s.rtcMs/1000),ready),millis:0,loopRemaining:0};}
   if(s.loopRemaining===0){const result=schoolBellLoop(s.controller!,Math.floor(s.rtcMs/1000),s.millis,s.serial);s={...s,controller:result.state,rtcMs:result.adjust===null?s.rtcMs:result.adjust*1000,serial:'',loopRemaining:25};}
   s={...s,millis:(s.millis+1)>>>0,loopRemaining:s.loopRemaining-1};
  }
  left-=1;
 }
 return {...s,remainderMs:Math.max(0,Math.round(left*1e9)/1e9)};
}
export function schoolBellOutputs(state:SchoolBellSession,settings:SchoolBellSettings){const powered=settings.assembled&&settings.usb;return {display:powered&&settings.displayConnected&&state.controller?.ready?state.controller.display:'    ',pitch:powered&&settings.piezoConnected?state.controller?.pitch??0:0};}
