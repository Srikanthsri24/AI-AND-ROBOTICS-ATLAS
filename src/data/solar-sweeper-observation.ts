import type {SolarSweeperRuntime} from './solar-sweeper-simulation';
import {solarSweepOutside,solarSweepPaperInitial} from './solar-sweeper-paper';
export type SolarSweepTrial={raised:boolean;start:number;requestedAt:number;started:boolean;spinSince?:number;seenSweep?:boolean};
export type SolarSweepPass={raised:boolean;outside:number;travel:number};
/** Observe the new run, never infer a completed pass from the previous READY state. */
export function solarSweepObserveTrial(trial:SolarSweepTrial|null,runtime:SolarSweeperRuntime):{trial:SolarSweepTrial|null;result?:SolarSweepPass;aborted?:string}{
 if(!trial)return {trial:null};
 const c=runtime.core;
 if(!trial.started){
  if(c.state!=='READY')return {trial:{...trial,started:true,spinSince:c.state==='SPINNING_UP'?c.since:undefined,seenSweep:c.state==='SWEEPING'}};
  if(c.reason==='blocked'&&!c.stableButton&&runtime.clock-trial.requestedAt>=30)return {trial:null,aborted:'Start was blocked by low solar voltage. No comparison row was recorded.'};
  return {trial};
 }
 if(c.state==='SPINNING_UP'&&(trial.seenSweep||trial.spinSince!==undefined&&c.since!==trial.spinSince))return {trial:null,aborted:'A new run began before the previous trial settled. No combined comparison row was recorded.'};
 if(c.state==='SWEEPING'&&!trial.seenSweep)return {trial:{...trial,seenSweep:true}};
 if(c.state==='READY'&&(c.reason==='manual'||c.reason==='shade'))return {trial:null,aborted:c.reason==='manual'?'The pass was stopped manually. No completed-pass row was recorded.':'Shade interrupted the pass. No completed-pass row was recorded; restore light and start a fresh trial.'};
 if(c.reason==='complete'&&Math.abs(runtime.brush.omega)<.001&&runtime.pose.leftVelocity===0&&runtime.pose.rightVelocity===0)return {trial:null,result:{raised:trial.raised,outside:runtime.paper.filter(solarSweepOutside).length,travel:Math.abs(runtime.pose.z-trial.start)*50}};
 return {trial};
}

const initialPaper=solarSweepPaperInitial();
/** Every measured pass starts with the same pose, stopped rotor phase and six paper positions. */
export function solarSweepFreshCourse(s:SolarSweeperRuntime){return s.core.state==='READY'&&[s.pose.x,s.pose.z,s.pose.yaw,s.pose.leftAngle,s.pose.rightAngle,s.pose.leftVelocity,s.pose.rightVelocity,s.brush.angle,s.brush.omega].every(n=>n===0)&&s.paper.length===initialPaper.length&&s.paper.every(p=>{const start=initialPaper[p.id];return start&&p.x===start.x&&p.z===start.z&&p.yaw===start.yaw&&p.vx===0&&p.vz===0&&p.spin===0;});}
