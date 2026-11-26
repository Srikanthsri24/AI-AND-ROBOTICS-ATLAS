import {bellNotes,schoolBellSchedule} from './school-bell';
export const schoolBellCompileEpoch=Date.UTC(2026,10,16,8,0,0)/1000;
export const schoolBellTestEpoch={t:Date.UTC(2026,10,16,8,29,55)/1000,w:Date.UTC(2026,10,21,8,29,55)/1000};
export type SchoolBellState={ready:boolean;lastSlot:number;phase:number;noteStarted:number;pitch:number;display:string;rows:readonly string[];bells:number};
const timeText=(epoch:number)=>{const d=new Date(epoch*1000);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');};
const report=(s:SchoolBellState,text:string):SchoolBellState=>({...s,rows:[...s.rows,text].slice(-120)});
export function schoolBellInitial(epoch:number,ready=true):SchoolBellState{return {ready,lastSlot:ready?Math.floor(epoch/60):0,phase:-1,noteStarted:0,pitch:0,display:ready?timeText(epoch):'    ',rows:[ready?'t = Monday test; w = Saturday test; n = compile time':'RTC unavailable'],bells:0};}
/** One exact sketch loop, before its delay(25). Calendar values use UTC as an
 * authored timezone-free RTC convention; compileEpoch represents the build time. */
export function schoolBellLoop(previous:SchoolBellState,rtcEpoch:number,millis:number,commands='',compileEpoch=schoolBellCompileEpoch){
 if(!Number.isFinite(rtcEpoch)||!Number.isFinite(millis))throw new RangeError('Invalid bell clock');
 let s={...previous},epoch=rtcEpoch,adjust:number|null=null;const now=millis>>>0;
 if(!s.ready)return {state:s,adjust};
 for(const command of commands){const target=command==='t'?schoolBellTestEpoch.t:command==='w'?schoolBellTestEpoch.w:command==='n'?compileEpoch:null;if(target!==null){epoch=target;adjust=target;s={...s,lastSlot:Math.floor(target/60),display:timeText(target),phase:-1,pitch:0,noteStarted:now};}}
 const slot=Math.floor(epoch/60);
 if(slot!==s.lastSlot){s={...s,lastSlot:slot,display:timeText(epoch)};const d=new Date(epoch*1000),minute=d.getUTCHours()*60+d.getUTCMinutes(),day=d.getUTCDay();if(day!==0&&day!==6&&schoolBellSchedule.some(t=>t.hour*60+t.minute===minute)){s=report({...s,phase:0,noteStarted:now,pitch:bellNotes[0].pitch,bells:s.bells+1},'Scheduled bell');}}
 if(s.phase>=0&&((now-s.noteStarted)>>>0)>=bellNotes[s.phase].duration){const phase=s.phase+1;s={...s,phase:phase>=bellNotes.length?-1:phase,pitch:phase>=bellNotes.length?0:bellNotes[phase].pitch,noteStarted:now};}
 return {state:s,adjust};
}
