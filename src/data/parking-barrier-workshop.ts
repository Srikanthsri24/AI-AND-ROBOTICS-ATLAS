/** Mirrors model_parking_barrier.ino. Inputs are true when the corresponding beam is broken. */
export type ParkingBarrierState={ready:boolean;raised:boolean;timingClear:boolean;clearSince:number;lines:string[]};
export function parkingBarrierInitial():ParkingBarrierState{return {ready:false,raised:false,timingClear:false,clearSince:0,lines:[]};}
export function parkingBarrierTick(previous:ParkingBarrierState,approach:boolean,underArm:boolean,now:number):ParkingBarrierState{
 const s={...previous,lines:[...previous.lines]};now=now>>>0;
 const move=(open:boolean)=>{s.raised=open;s.lines.push(open?'Arm raised.':'Arm lowered.');};
 if(!s.ready){if(now<60)return s;s.ready=true;move(approach||underArm);return s;}
 if(approach||underArm){s.timingClear=false;if(!s.raised)move(true);}
 else if(s.raised&&!s.timingClear){s.timingClear=true;s.clearSince=now;s.lines.push('Both beams clear. Timing.');}
 else if(s.raised&&((now-s.clearSince)>>>0)>=1500){s.timingClear=false;move(false);}
 return s;
}
export function parkingBarrierCommand(s:ParkingBarrierState){return s.raised?95:15;}

/** Opaque car width along travel, and actual card/receiver faces along the optical axis. */
export function parkingBeamBroken(carX:number,beamX:number,cardZ=2.25){return Math.abs(carX-beamX)<=.525||(cardZ<=1.7545&&cardZ>=-.5545);}
