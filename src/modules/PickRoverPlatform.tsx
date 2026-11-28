import Mechanism from'./PickRoverMechanism';import Chassis from'./PickRoverChassis';
/** Working geometry arrangement before final clamps, electronics and wires.
 * Wheel angles and mechanism poses are supplied by the physical transfer rig. */
export default function PickRoverPlatform({angle,gap,wheelAngle=0,casterAngle=0,selected,choose}:{angle:number;gap:number;wheelAngle?:number;casterAngle?:number;selected:string;choose:(id:string)=>void}){return <group name="pick-rover-platform"><Chassis {...{wheelAngle,casterAngle,selected,choose}}/><Mechanism {...{angle,gap,selected,choose}}/></group>;}
