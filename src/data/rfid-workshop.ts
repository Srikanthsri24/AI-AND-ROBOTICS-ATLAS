import {latchMs} from './rfid-door';
export type RfidWorkshopState={available:boolean;reportCount:number;writeCount:number;learned:readonly number[];misses:number;enroll:boolean;unlocked:boolean;denied:boolean;unlockedAt:number;commandAngle:35|105;red:boolean;green:boolean;writes:readonly number[];rows:readonly string[]};
export type RfidLoop={startMs:number;readMs:number;uid:readonly number[]|null;serial?:string};
function millis(n:number){if(!Number.isInteger(n)||n<0||n>0xffffffff)throw new RangeError('RFID timestamp must be uint32');return n;}
export function rfidWorkshopInitial(available=true):RfidWorkshopState{return {available,reportCount:1,writeCount:1,learned:[],misses:2,enroll:false,unlocked:false,denied:false,unlockedAt:0,commandAngle:35,red:false,green:false,writes:[35],rows:[available?'Reader ready. Send e to enroll.':'Reader unavailable']};}
/** Start-of-loop GPIO / timer work, before the blocking reader call. */
export function rfidWorkshopBegin(previous:RfidWorkshopState,now:number,serial=''):RfidWorkshopState{
 millis(now);if(!previous.available)return previous;
 const state={...previous},rows=[...previous.rows],writes=[...previous.writes];
 const say=(text:string)=>{rows.push(text);state.reportCount++;};
 if(state.unlocked&&((now-state.unlockedAt)>>>0)>=latchMs){state.unlocked=false;state.commandAngle=35;state.writeCount++;writes.push(35);say('Relocked');}
 state.green=state.unlocked;state.red=state.denied&&!state.unlocked;
 for(const char of serial)if(char==='e'&&!state.unlocked){state.enroll=true;state.denied=false;say('Present one classroom tag');}
 return {...state,rows:rows.slice(-120),writes:writes.slice(-120)};
}
/** Reader-return work; the unlock timestamp is captured after the read completes. */
export function rfidWorkshopRead(previous:RfidWorkshopState,now:number,uid:readonly number[]|null):RfidWorkshopState{
 millis(now);if(uid!==null&&(!Array.isArray(uid)||uid.length>255||uid.some(n=>!Number.isInteger(n)||n<0||n>255)))throw new RangeError('UID must contain byte values');
 if(!previous.available)return previous;const state={...previous},rows=[...previous.rows],writes=[...previous.writes];
 const say=(text:string)=>{rows.push(text);state.reportCount++;};
 if(uid===null)state.misses=Math.min(2,state.misses+1);
 else{
  const fresh=state.misses>=2;state.misses=0;
  if(fresh&&!state.unlocked&&uid.length>0&&uid.length<=10){
   if(state.enroll){state.learned=[...uid];state.enroll=false;say('Enrolled');}
   else if(uid.length===state.learned.length&&uid.every((n,i)=>n===state.learned[i])){state.unlocked=true;state.denied=false;state.unlockedAt=now;state.commandAngle=105;state.writeCount++;writes.push(105);say('Released');}
   else{state.denied=true;say('Rejected');}
  }
 }
 return {...state,rows:rows.slice(-120),writes:writes.slice(-120)};
}
/** One original loop with separate entry / reader-return timestamps. */
export function rfidWorkshopLoop(previous:RfidWorkshopState,input:RfidLoop):RfidWorkshopState{
 return rfidWorkshopRead(rfidWorkshopBegin(previous,input.startMs,input.serial),input.readMs,input.uid);
}
