import Lift from'./PickRoverLift';import Fasteners from'./PickRoverForkFasteners';import Grip from'./PickRoverGripperDrive';import{pickLiftJoints}from'../data/pick-rover-lift';
/** The gripper stays level at the exact contact-model reference while the
 * four-bar linkage changes height. Chassis, lift actuation and wiring follow. */
export default function PickRoverMechanism({angle,gap,selected,choose}:{angle:number;gap:number;selected:string;choose:(id:string)=>void}){const j=pickLiftJoints(angle);return <group name="pick-rover-combined-mechanism"><Lift {...{angle,selected,choose}}/><Fasteners {...{angle,selected,choose}}/><group name="pick-rover-level-gripper" position={[...j.palm]}><Grip {...{gap,selected,choose}}/></group></group>;}
