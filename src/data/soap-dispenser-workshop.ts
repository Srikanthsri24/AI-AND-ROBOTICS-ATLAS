import {soapAngles,soapTiming} from './soap-dispenser';
export type SoapDispenserPhase='WAIT_CLEAR'|'READY'|'PRESSING'|'REFILLING';
export type SoapDispenserController={phase:SoapDispenserPhase;consecutive:number;lastRead:number;changed:number;command:number;rows:readonly string[];strokeCommands:number;readings:number;lastCm:number|null};
/** The return timestamp includes acquisition and reporting time before the
 * sketch records changed=millis(). It is distinct from loop-entry now. */
export type SoapDispenserReading={echoUs:number;finishedAt:number};
function uint(value:number){if(!Number.isInteger(value)||value<0||value>0xffffffff)throw new RangeError('Invalid unsigned soap-dispenser clock');return value>>>0;}
export function soapDispenserEchoCm(echoUs:number){if(!Number.isInteger(echoUs)||echoUs<0||echoUs>7000)throw new RangeError('Echo duration must be 0–7000 microseconds');return echoUs?Math.floor((echoUs*343+10000)/20000):-1;}
export function soapDispenserInitial():SoapDispenserController{return {phase:'WAIT_CLEAR',consecutive:0,lastRead:0,changed:0,command:soapAngles.rest,rows:[],strokeCommands:0,readings:0,lastCm:null};}
export function soapDispenserReadDue(s:SoapDispenserController,now:number){return ((uint(now)-s.lastRead)>>>0)>=soapTiming.sampleMs;}
const report=(s:SoapDispenserController,text:string)=>({...s,rows:[...s.rows,text].slice(-120)});
/** Phase changes happen before the potentially blocking sonar acquisition. */
export function soapDispenserAdvancePhase(previous:SoapDispenserController,now:number):SoapDispenserController{
 now=uint(now);let s=previous;
 if(s.phase==='PRESSING'&&((now-s.changed)>>>0)>=soapTiming.pressMs)s={...s,phase:'REFILLING',command:soapAngles.rest,changed:now};
 if(s.phase==='REFILLING'&&((now-s.changed)>>>0)>=soapTiming.refillMs)s={...s,phase:'WAIT_CLEAR'};
 return s;
}
/** Complete an acquisition already started at now. The phase is frozen while
 * distanceCm() blocks, while the servo's PWM hardware can continue moving. */
export function soapDispenserCompleteReading(previous:SoapDispenserController,now:number,reading:SoapDispenserReading):SoapDispenserController{
 now=uint(now);const cm=soapDispenserEchoCm(reading.echoUs),finished=uint(reading.finishedAt);
 if(((finished-now)>>>0)>0x7fffffff)throw new RangeError('Reading cannot finish before its loop started');
 let s=report({...previous,lastRead:now,lastCm:cm,readings:previous.readings+1},'cm: '+cm);
 if(s.phase!=='WAIT_CLEAR'&&s.phase!=='READY')return s;
 const qualifies=s.phase==='WAIT_CLEAR'?cm>=soapTiming.clearMin:cm>=soapTiming.nearMin&&cm<=soapTiming.nearMax;
 if(!qualifies)return {...s,consecutive:0};
 s={...s,consecutive:s.consecutive+1};if(s.consecutive<soapTiming.confirm)return s;
 s={...s,consecutive:0};
 if(s.phase==='WAIT_CLEAR')return report({...s,phase:'READY'},'Ready');
 return report({...s,phase:'PRESSING',command:soapAngles.press,changed:finished,strokeCommands:s.strokeCommands+1},'One pump stroke');
}
/** One exact sketch loop. strokeCommands counts requests/reports, not measured
 * liquid output. A due acquisition must supply its actual completion clock. */
export function soapDispenserLoop(previous:SoapDispenserController,now:number,reading?:SoapDispenserReading):SoapDispenserController{
 const s=soapDispenserAdvancePhase(previous,now);if(!soapDispenserReadDue(s,now))return s;
 if(!reading)throw new RangeError('A due sonar acquisition requires its echo and completion timestamp');
 return soapDispenserCompleteReading(s,now,reading);
}
