import {useRef} from 'react';
import {OrbitControls} from '@react-three/drei';
import Workbench from './TrafficParkingWorkbenchParts';
import Studio from './SchoolBellStudioLight';
import Label from './CraneSurfaceLabel';
import Camera,{type TrafficParkingView} from './TrafficParkingCamera';
import {trafficParkingWorkflowOutputs,type TrafficParkingWorkflow} from '../data/traffic-parking-workflow';
import {trafficParkingDemonstrationPoses} from '../data/traffic-parking-demonstration';
import {trafficParkingHardwareParts} from '../data/traffic-parking-workbench';
import {floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
export default function TrafficParkingWorkbenchScene({state,selected,choose,version,report,preset,cutaway}:{cutaway:boolean;preset:TrafficParkingView;state:TrafficParkingWorkflow;selected:string;choose:(id:string)=>void;version:number;report:(text:string)=>void}){
 const anchor=useRef<FloodAnchor|null>(null),usb=useRef(state.usb);usb.current=state.usb;
 return <><color attach="background" args={['#edf0f8']}/><Studio/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Workbench cutaway={cutaway} selected={selected} choose={choose} {...trafficParkingWorkflowOutputs(state)} assemblyProgress={state.assembly} fittingCursor={state.fitting} hornProgress={state.horn} usbMotion={usb} carPoses={trafficParkingDemonstrationPoses(state.demo)}/></group><Label anchor={anchor} selected={selected} name={trafficParkingHardwareParts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[-.5,.2,0]} minDistance={.035} maxDistance={14}/><Camera preset={preset} selected={selected} version={version} anchor={anchor} report={report}/></>;
}
