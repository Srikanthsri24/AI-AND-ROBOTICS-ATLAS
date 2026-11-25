import { industrialAdvance,industrialInitial,industrialReceive,industrialReceiverInitial,type IndustrialClock,type IndustrialInputs,type IndustrialReceiver } from './industrial-workshop';
export type IndustrialSession={clock:IndustrialClock;receiver:IndustrialReceiver;nowMs:number;remainderUs:number;playing:boolean};
export const industrialSessionInitial=():IndustrialSession=>({clock:industrialInitial(),receiver:industrialReceiverInitial(),nowMs:0,remainderUs:0,playing:false});
/** Reset only the USB-powered board. The independently powered receiver keeps its last record. */
export function industrialSessionPowerOff(previous:IndustrialSession):IndustrialSession{return{...previous,clock:industrialInitial(),receiver:{...previous.receiver,sequence:0}};}
/** Authored fixed 1 ms browser scheduler. Only newly emitted packets can arrive;
 * packets lost during receiver downtime are not delivered retroactively.
 * No real USB, Python process or network socket is used.
 */
export function industrialSessionAdvance(previous:IndustrialSession,seconds:number,input:IndustrialInputs,receiverOnline=true):IndustrialSession{
 if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Advance by 0–60 model seconds');
 if(!previous.playing)return previous;
 const remainderUs=previous.remainderUs+Math.round(seconds*1e6),steps=Math.floor(remainderUs/1000);
 if(!Number.isSafeInteger(previous.nowMs+steps))throw Error('Model time exceeds safe integer representation');
 const s={...previous,remainderUs};
 while(s.remainderUs>=1000){s.remainderUs-=1000;s.nowMs++;const sent=s.clock.sent;s.clock=industrialAdvance({...s.clock,playing:true},1,input);if(s.clock.sent<sent)s.receiver={...s.receiver,sequence:0};if(receiverOnline&&s.clock.sent>sent&&s.clock.packet!==null)s.receiver=industrialReceive(s.receiver,s.clock.packet,s.clock.sent,s.nowMs);}
 return s;
}
