import{binAdvance,binInitial,type BinClock,type BinInputs}from'./smart-bin-workshop';import{binReceive,binReceiverInitial,type BinReceiver}from'./smart-bin-network';
export type BinSession={clock:BinClock;receiver:BinReceiver;nowUs:number;remainderUs:number;playing:boolean};
export const binSessionInitial=():BinSession=>({clock:binInitial(),receiver:binReceiverInitial(),nowUs:0,remainderUs:0,playing:false});
/** Fixed 1 ms scheduler preserves source reports and accepted-record timestamps
 * independently of browser frame subdivision. No real UDP is transmitted.
 */
export function binSessionAdvance(previous:BinSession,seconds:number,inputs:BinInputs):BinSession{if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Advance by 0–60 seconds');if(!previous.playing)return previous;const s={...previous,remainderUs:previous.remainderUs+Math.round(seconds*1e6)};while(s.remainderUs>=1000){s.remainderUs-=1000;s.nowUs+=1000;s.clock=binAdvance({...s.clock,playing:true},.001,inputs);s.receiver=binReceive(s.receiver,s.clock.packet,s.clock.sent,s.nowUs/1000);}return s;}
