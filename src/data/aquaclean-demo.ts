import{aquaAdvance,aquaInitial,type AquaClock,type AquaInputs}from'./aquaclean-workshop';
import{aquaCollectionInitial,aquaCollectionStep,type AquaCollection}from'./aquaclean-collection';
import{aquaReceive,aquaReceiverInitial,type AquaReceiver}from'./aquaclean-network';
export type AquaDemo={clock:AquaClock;collection:AquaCollection;receiver:AquaReceiver;nowUs:number;remainderUs:number;playing:boolean};
export function aquaDemoInitial(collected=0):AquaDemo{return{clock:aquaInitial(),collection:aquaCollectionInitial(collected),receiver:aquaReceiverInitial(),nowUs:0,remainderUs:0,playing:false};}
/** Fixed 1 ms illustration scheduler preserves frame-subdivision behaviour.
 * In this automatic collection mode, the follower gap comes from the authored
 * batch fill proxy. Manual dry-target diagnostics use the sketch controller.
 */
export function aquaDemoAdvance(previous:AquaDemo,seconds:number,i:Omit<AquaInputs,'gapMm'>):AquaDemo{if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Advance by 0–60 seconds.');if(!previous.playing)return previous;const s={...previous,remainderUs:previous.remainderUs+Math.round(seconds*1e6)};while(s.remainderUs>=1000){s.remainderUs-=1000;s.nowUs+=1000;const old=s.clock,next=aquaAdvance({...old,playing:true},.001,{...i,gapMm:200-s.collection.fillMm}),drive=Math.max(0,next.driveUs-old.driveUs);s.collection=aquaCollectionStep(s.collection,drive);s.clock=next;s.receiver=aquaReceive(s.receiver,next.packet,next.sent,s.nowUs/1000);}return s;}
