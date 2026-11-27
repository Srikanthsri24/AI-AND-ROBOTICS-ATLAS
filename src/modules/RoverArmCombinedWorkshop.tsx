import {useCallback,useRef,useState} from 'react';
import {CarFront,Hand,LockKeyhole} from 'lucide-react';
import Rover from './RoverArmRoverWorkshop';
import Arm from './RoverArmWorkshop';
import {raRoverWorkflowInitial,type RaRoverWorkflow} from '../data/rover-arm-rover-workflow';
import {raArmWorkflowInitial,type RaArmWorkflow} from '../data/rover-arm-workflow';
import '../styles/rover-arm-build-choice.css';
type Build='rover'|'arm';
function roverLock(s:RaRoverWorkflow){
 if(s.connections.controllerOn||s.connections.motorsOn)return 'Switch AA motor power off, then USB logic off before changing builds.';
 if(Math.abs(s.course.world.pose.leftVelocity)>.001||Math.abs(s.course.world.pose.rightVelocity)>.001)return 'Let the wheels coast to a stop before changing builds.';
 if([s.boards,s.mechanics,s.sensor,s.connections].some(f=>f.active))return 'Finish the current fitting before changing builds.';
 return '';
}
function armLock(s:RaArmWorkflow){
 if(s.calibration.controllerOn||s.calibration.actuatorsOn||s.connections.controllerOn||s.connections.actuatorsOn)return 'Switch actuator power off, then USB logic off before changing builds.';
 if([s.assembly,s.boards,s.connections].some(f=>f.active))return 'Finish the current fitting before changing builds.';
 return '';
}
/** Alternative builds share one Uno. Their evidence is retained separately;
 * changing build unmounts the previous scene and its animation loop. */
export default function RoverArmCombinedWorkshop(){
 const[build,setBuild]=useState<Build>('rover'),[lock,setLock]=useState('');
 const rover=useRef(raRoverWorkflowInitial()),arm=useRef(raArmWorkflowInitial());
 const saveRover=useCallback((s:RaRoverWorkflow)=>{rover.current=s;setLock(roverLock(s));},[]);
 const saveArm=useCallback((s:RaArmWorkflow)=>{arm.current=s;setLock(armLock(s));},[]);
 function change(next:Build){
  const reason=build==='rover'?roverLock(rover.current):armLock(arm.current);
  if(next===build||reason)return;
  setLock('');setBuild(next);
 }
 return <div className="ra-combined-workshop">
  <section className="ra-build-choice" aria-label="Choose your workshop build">
   <div className="ra-build-choice-heading"><span>ONE KIT · TWO BUILDS</span><h2>What will you build?</h2><p>Use the Uno for one build at a time. Each build keeps its own assembly progress while you explore the other.</p></div>
   <div className="ra-build-choice-options">
    {(['rover','arm']as const).map(id=><button key={id} type="button" aria-pressed={build===id} disabled={build!==id&&!!lock} onClick={()=>change(id)}>
     <span className="ra-build-choice-icon">{id==='rover'?<CarFront/>:<Hand/>}</span><span><strong>{id==='rover'?'Obstacle-avoiding rover':'Six-axis robotic arm'}</strong><small>{id==='rover'?'Assemble the car, wire its sensor and try the course.':'Calibrate six servos, fit the joints and control the arm.'}</small><b>{id==='rover'?'A2 linked to GND at startup':'A2 open at startup'}</b></span><span className="ra-build-choice-status">{build===id?'Selected':'Choose build'}</span>
    </button>)}
   </div>
   {lock&&<p className="ra-build-choice-lock" role="status"><LockKeyhole size={16}/>{lock}</p>}
  </section>
  {build==='rover'?<Rover key="rover" initialState={rover.current} onStateChange={saveRover}/>:<Arm key="arm" initialState={arm.current} onStateChange={saveArm}/>}
 </div>;
}
