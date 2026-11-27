import {tapLimits} from './automatic-tap';
export type TapMode='WAIT_CLEAR'|'READY'|'RUNNING';
export type TapController={mode:TapMode;count:number;started:number;lastRead:number;lastReport:number;driver:boolean;rows:readonly string[];lastCm:number|null;readings:number;runCommands:number};
const uint=(n:number)=>{if(!Number.isInteger(n)||n<0||n>0xffffffff)throw new RangeError('Invalid unsigned tap clock');return n>>>0;};
export const tapControllerInitial=():TapController=>({mode:'WAIT_CLEAR',count:0,started:0,lastRead:0,lastReport:0,driver:false,rows:[],lastCm:null,readings:0,runCommands:0});
export function tapEchoCm(echoUs:number){if(!Number.isInteger(echoUs)||echoUs<0||echoUs>7000)throw new RangeError('Invalid tap echo pulse');return echoUs?Math.floor((echoUs*343+10000)/20000):-1;}
export function tapStop(s:TapController):TapController{return{...s,mode:'WAIT_CLEAR',count:0,driver:false};}
export function tapReadDue(s:TapController,now:number){return ((uint(now)-s.lastRead)>>>0)>=tapLimits.sampleMs;}
/** LEVEL is sampled before distanceCm() blocks. A timeout is checked at loop
 * entry, not by a separate invented interrupt during the acquisition. */
export function tapLoopEntry(s:TapController,now:number,water:boolean){now=uint(now);return !water||s.mode==='RUNNING'&&((now-s.started)>>>0)>=tapLimits.maxMs?tapStop(s):s;}
export function tapCompleteReading(previous:TapController,now:number,reading:{echoUs:number;finishedAt:number;water:boolean}):TapController{
 now=uint(now);const finished=uint(reading.finishedAt);if(((finished-now)>>>0)>0x7fffffff)throw new RangeError('Tap read cannot finish before it starts');
 const cm=tapEchoCm(reading.echoUs);let s:TapController={...previous,lastRead:now,lastCm:cm,readings:previous.readings+1};
 if(reading.water){
  if(s.mode==='RUNNING'){if(cm<tapLimits.startMin||cm>tapLimits.holdMax)s=tapStop(s);}
  else{const qualify=s.mode==='WAIT_CLEAR'?cm>=tapLimits.clearMin:cm>=tapLimits.startMin&&cm<=tapLimits.startMax;s={...s,count:qualify?s.count+1:0};if(s.count>=tapLimits.confirm){s={...s,count:0};s=s.mode==='WAIT_CLEAR'?{...s,mode:'READY'}:{...s,mode:'RUNNING',started:finished,driver:true,runCommands:s.runCommands+1};}}
 }
 if(((now-s.lastReport)>>>0)>=250)s={...s,lastReport:now,rows:[...s.rows,(reading.water?'WATER OK | ':'WATER LOW | ')+cm+' cm | '+(s.mode==='RUNNING'?'FILLING':s.mode==='READY'?'READY':'WAIT CLEAR')].slice(-120)};
 return s;
}
