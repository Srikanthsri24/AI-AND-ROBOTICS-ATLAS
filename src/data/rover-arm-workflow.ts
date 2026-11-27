import {raArmCalibrationBenchInitial,raArmCalibrationSelect,raArmCalibrationPower,raArmCalibrationCommand,raArmCalibrationAdvance,raArmCalibrationObserve,raArmCalibrationRecord,type RaArmCalibrationBench,type RaArmCalibrationCheck} from './rover-arm-calibration';
import {raArmAssemblyInitial,raArmAssemblyStart,raArmAssemblyAdvance,raArmMechanicalFits,type RaArmAssembly} from './rover-arm-assembly';
import {raArmBoardAssemblyInitial,raArmBoardFitStart,raArmBoardFitAdvance,raArmSecuredBoards,type RaArmBoardAssembly} from './rover-arm-board-assembly';
import {raArmConnectionsInitial,raArmConnectionStart,raArmConnectionAdvance,raArmConnectionPower,raArmConnectionView,raArmConnectionSteps,type RaArmConnections} from './rover-arm-connections';
import {raArmRigInitial,raArmRigAdvance,raArmRigEnqueue,type RaArmRig} from './rover-arm-rig';
import {raArmNeutral} from './rover-arm-mechanics';
export const raArmWorkflowPhases=['calibration','mechanics','boards','wiring','operation']as const;
export type RaArmWorkflowPhase=typeof raArmWorkflowPhases[number];
export type RaArmWorkflow={phase:RaArmWorkflowPhase;calibration:RaArmCalibrationBench;assembly:RaArmAssembly;boards:RaArmBoardAssembly;connections:RaArmConnections;rig:RaArmRig};
export const raArmWorkflowInitial=():RaArmWorkflow=>({phase:'calibration',calibration:raArmCalibrationBenchInitial(),assembly:raArmAssemblyInitial(),boards:raArmBoardAssemblyInitial(),connections:raArmConnectionsInitial(),rig:raArmRigInitial(raArmNeutral)});
export type RaArmWorkflowAction=
 |{type:'select-servo';channel:number}|{type:'calibration-command';command:'home'|'jog'}|{type:'observe';check:RaArmCalibrationCheck}|{type:'record'}
 |{type:'power';source:'controller'|'actuators';on:boolean}|{type:'begin-fit';id:string}|{type:'advance';ms:number}|{type:'next'}|{type:'command';command:'home'|number};
export function raArmWorkflowValues(s:RaArmWorkflow){return Array.from({length:6},(_,channel)=>{const c=s.assembly.calibrated.find(v=>v.channel===channel);if(!c)throw Error('Check every unloaded servo before operating the arm');return c.value;});}
export function raArmWorkflowReady(s:RaArmWorkflow){switch(s.phase){
 case'calibration':return s.assembly.calibrated.length===6&&!s.calibration.controllerOn&&!s.calibration.actuatorsOn;
 case'mechanics':return !s.assembly.active&&raArmMechanicalFits.every(f=>s.assembly.completed.includes(f.id));
 case'boards':return !s.boards.active&&raArmSecuredBoards(s.boards).length===2;
 case'wiring':return !s.connections.active&&raArmConnectionSteps.every(f=>s.connections.completed.includes(f.id));
 case'operation':return false;
}}
/** Sole state transition boundary for the stationary-arm flow. No fixture
 * pre-populates calibration, completed hardware or connection evidence. */
export function raArmWorkflowAct(s:RaArmWorkflow,a:RaArmWorkflowAction):RaArmWorkflow{
 if(a.type==='advance'){
  if(!Number.isFinite(a.ms)||a.ms<0)throw RangeError('Invalid workshop interval');
  switch(s.phase){case'calibration':return{...s,calibration:raArmCalibrationAdvance(s.calibration,a.ms)};case'mechanics':return{...s,assembly:raArmAssemblyAdvance(s.assembly,a.ms)};case'boards':return{...s,boards:raArmBoardFitAdvance(s.boards,a.ms)};case'wiring':return{...s,connections:raArmConnectionAdvance(s.connections,a.ms)};case'operation':return{...s,rig:raArmRigAdvance(s.rig,raArmConnectionView(s.connections).wiring,raArmWorkflowValues(s),a.ms)};}
 }
 if(a.type==='next'){
  if(!raArmWorkflowReady(s))throw Error('Complete the checks and disconnect calibration power before continuing');
  const phase=raArmWorkflowPhases[raArmWorkflowPhases.indexOf(s.phase)+1];return{...s,phase};
 }
 if(a.type==='power'){
  if(s.phase==='calibration')return{...s,calibration:raArmCalibrationPower(s.calibration,a.source,a.on)};
  if(s.phase!=='operation')throw Error('Keep both sources disconnected during assembly and wiring');
  const connections=raArmConnectionPower(s.connections,a.source,a.on);
  return{...s,connections,rig:raArmRigAdvance(s.rig,raArmConnectionView(connections).wiring,raArmWorkflowValues(s),0)};
 }
 if(a.type==='begin-fit'){
  const off={usb:false,servoSupply:false};switch(s.phase){
   case'mechanics':return{...s,assembly:raArmAssemblyStart(s.assembly,a.id,off)};
   case'boards':return{...s,boards:raArmBoardFitStart(s.boards,a.id,s.assembly,off)};
   case'wiring':return{...s,connections:raArmConnectionStart(s.connections,a.id,s.assembly,raArmSecuredBoards(s.boards))};
   default:throw Error('Choose a fitting in an assembly stage');
  }
 }
 if(a.type==='command'){
  if(s.phase!=='operation')throw Error('Finish the build before operating the assembled arm');
  if(!s.connections.controllerOn||!s.connections.actuatorsOn)throw Error('Start controller logic and actuator output first');
  if(a.command!=='home'&&(!Number.isInteger(a.command)||a.command<0||a.command>5))throw RangeError('Invalid arm channel');
  if(a.command!=='home'&&!s.rig.world.session.homed)throw Error('Send neutral before jogging a joint');
  if(a.command!=='home'&&s.rig.world.session.active!==-1)throw Error('Wait for the current timed jog');
  return{...s,rig:raArmRigAdvance(raArmRigEnqueue(s.rig,a.command==='home'?'h':String(a.command+1)),raArmConnectionView(s.connections).wiring,raArmWorkflowValues(s),1)};
 }
 if(s.phase!=='calibration')throw Error('Unloaded checks belong to the calibration stage');
 switch(a.type){
 case'select-servo':return{...s,calibration:raArmCalibrationSelect(s.calibration,a.channel)};
 case'calibration-command':return{...s,calibration:raArmCalibrationCommand(s.calibration,a.command)};
 case'observe':return{...s,calibration:raArmCalibrationObserve(s.calibration,a.check)};
 case'record':return{...s,assembly:raArmCalibrationRecord(s.calibration,s.assembly)};
 }
}
