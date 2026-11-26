import {crossingPhase,type CrossingPhase} from './railway-gate';

/** Millimetres; the future mesh uses this same continuous opaque beam-height band. */
export const railwayLayout={entryX:-190,exitX:190,beamZ:48,beamY:24,trainLength:240,trainHalfWidth:23,trainBandBottom:16,trainBandTop:40,startNose:-300,endNose:600,roadHalfWidth:45,openAngle:95,closedAngle:5} as const;
export type RailwayInputs={usb:boolean;servoPower:boolean;commonGround:boolean;entryAligned:boolean;exitAligned:boolean;moving:boolean;speedMmPerSecond:number;entrySignalConnected?:boolean;exitSignalConnected?:boolean;servoSignalConnected?:boolean;warningConnected?:boolean};
export const railwayDefaults:RailwayInputs={usb:false,servoPower:false,commonGround:true,entryAligned:true,exitAligned:true,moving:false,speedMmPerSecond:80};
export type RailwaySample={id:number;atMs:number;entryBlocked:boolean;exitBlocked:boolean;phase:CrossingPhase;command:number;actualAngle:number;trainNose:number};
export type RailwayClock={nowMs:number;remainderMs:number;powered:boolean;phase:CrossingPhase;command:number;actualAngle:number;trainNose:number;lastReportMs:number;nextId:number;rows:readonly RailwaySample[]};
export function railwayInitial():RailwayClock{return{nowMs:0,remainderMs:0,powered:false,phase:'clear',command:95,actualAngle:95,trainNose:railwayLayout.startNose,lastReportMs:0,nextId:1,rows:[]};}
export function railwayBeamBlocked(nose:number,x:number){return x>=nose-railwayLayout.trainLength&&x<=nose;}
export function railwayInputsAt(nose:number,i:RailwayInputs){return{entryBlocked:i.entrySignalConnected===false||!i.entryAligned||railwayBeamBlocked(nose,railwayLayout.entryX),exitBlocked:i.exitSignalConnected===false||!i.exitAligned||railwayBeamBlocked(nose,railwayLayout.exitX)};}
/** Same one-transition-per-loop switch and output assignments as railway_gate.ino. */
export function railwayController(phase:CrossingPhase,entryBlocked:boolean,exitBlocked:boolean){const next=crossingPhase(phase,entryBlocked,exitBlocked);return{phase:next,warning:next!=='clear',command:next==='clear'?95:5};}
export function railwayOutputs(s:RailwayClock,i:RailwayInputs){return{...railwayInputsAt(s.trainNose,i),warning:s.powered&&s.phase!=='clear'&&i.warningConnected!==false,servoDriven:s.powered&&i.servoPower&&i.commonGround&&i.servoSignalConnected!==false,command:s.command,actualAngle:s.actualAngle,roadBlocked:s.trainNose>=-railwayLayout.roadHalfWidth&&s.trainNose-railwayLayout.trainLength<=railwayLayout.roadHalfWidth};}
/** A 1 ms simulation poll and 180°/s visual servo are authored playback approximations,
 * not a loop delay or guaranteed actuator speed in the original sketch. */
export function railwayAdvance(state:RailwayClock,elapsedMs:number,i:RailwayInputs):RailwayClock{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0||elapsedMs>60000)throw Error('Railway elapsed time must be 0–60000 ms');
 if(!Number.isFinite(i.speedMmPerSecond)||i.speedMmPerSecond<0||i.speedMmPerSecond>160)throw Error('Train speed must be 0–160 mm/s');
 let s:RailwayClock={...state,rows:[...state.rows]};
 if(!i.usb){s={...railwayInitial(),actualAngle:s.actualAngle,trainNose:s.trainNose};if(i.moving)s.trainNose=Math.min(railwayLayout.endNose,s.trainNose+elapsedMs*i.speedMmPerSecond/1000);return s;}
 if(!s.powered)s={...railwayInitial(),powered:true,actualAngle:s.actualAngle,trainNose:s.trainNose};
 const total=s.remainderMs+elapsedMs,ticks=Math.floor(total);s.remainderMs=total-ticks;
 for(let n=0;n<ticks;n++){
  s.nowMs++;
  if(i.moving)s.trainNose=Math.min(railwayLayout.endNose,s.trainNose+i.speedMmPerSecond/1000);
  if(i.servoPower&&i.commonGround&&i.servoSignalConnected!==false){const d=s.command-s.actualAngle;s.actualAngle+=Math.sign(d)*Math.min(Math.abs(d),.18);}
  const beams=railwayInputsAt(s.trainNose,i),output=railwayController(s.phase,beams.entryBlocked,beams.exitBlocked);s.phase=output.phase;s.command=output.command;
  if(s.nowMs-s.lastReportMs>=200){s.lastReportMs=s.nowMs;const row=Object.freeze({id:s.nextId++,atMs:s.nowMs,...beams,phase:s.phase,command:s.command,actualAngle:s.actualAngle,trainNose:s.trainNose});s.rows=[...s.rows,row].slice(-120);}
 }
 return s;
}
export function railwaySerial(row:RailwaySample){return`${row.entryBlocked?'A BLOCKED  ':'A CLEAR  '}${row.exitBlocked?'B BLOCKED  ':'B CLEAR  '}${row.phase==='clear'?'GATE OPEN':'GATE CLOSED'}`;}
export function railwayExplanation(s:RailwayClock,i:RailwayInputs){if(!s.powered)return'USB is off. The controller and warning lamp are off; the unpowered arm holds its simulated position.';const outputs=railwayOutputs(s,i);const phase=s.phase==='clear'?'Both beams started clear. The sketch commands the barrier open.':s.phase==='occupied'?'A has triggered. The controller remembers the train even after A clears, and waits for B to become blocked.':'B has triggered. The controller holds the warning until both beams are clear.';return phase+(!outputs.servoDriven?' The servo has no drive: compare the command with the stationary physical arm.':' The separate supply drives the arm towards the commanded angle.');}
