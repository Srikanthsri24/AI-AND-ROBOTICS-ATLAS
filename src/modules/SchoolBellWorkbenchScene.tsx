import {useRef,type RefObject} from 'react';
import Usb from './SchoolBellUsbParts';
import type {SchoolBellUsbMotion} from '../data/school-bell-usb';
import {OrbitControls} from '@react-three/drei';
import Wires from './SchoolBellWireParts';
import Uno from './BluetoothCarUno';
import Rtc from './SchoolBellRtcParts';
import Display from './SchoolBellDisplayParts';
import Piezo from './SchoolBellPiezoParts';
import Resistor from './SchoolBellResistorParts';
import Waves from './SchoolBellSoundWaves';
import Bench from './SchoolBellBenchParts';
import Studio from './SchoolBellStudioLight';
import Camera from './SchoolBellCamera';
import Label from './CraneSurfaceLabel';
import {schoolBellWorkbench as d} from '../data/school-bell-workbench-layout';
import {schoolBellHardwarePart} from '../data/school-bell-hardware-parts';
import {floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
export default function SchoolBellWorkbenchScene({selected,choose,time='',powered=false,pitch=0,batteryInsertion=0,openPiezo=false,fittingCursor=30,version=0,report,usb,rows=[]}:{selected:string;choose:(id:string)=>void;time?:string;powered?:boolean;pitch?:number;batteryInsertion?:number;openPiezo?:boolean;fittingCursor?:number;version?:number;report?:(message:string)=>void;usb?:RefObject<SchoolBellUsbMotion>;rows?:readonly string[]}){const anchor=useRef<FloodAnchor|null>(null),name=schoolBellHardwarePart(selected)?.label??'Select a part';return <><color attach="background" args={['#edf0f8']}/><Studio/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group name="school-bell-workshop-hardware" scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Usb selected={selected} choose={choose} powered={powered} rows={rows} motion={usb}/><Wires selected={selected} choose={choose} cursor={fittingCursor}/><Bench selected={selected} choose={choose}/><group name="school-bell-uno-assembly" position={[...d.uno]} scale={50}><Uno selected={selected} select={choose} powered={powered} partPrefix="school-"/></group><group name="school-bell-rtc-assembly" position={[...d.rtc]}><Rtc selected={selected} choose={choose} batteryInsertion={batteryInsertion}/></group><group name="school-bell-display-assembly" position={[...d.display]} rotation={[0,Math.PI,0]}><group rotation={[Math.PI/2,0,0]}><Display selected={selected} choose={choose} time={time} powered={powered}/></group></group><group position={[...d.sounder]}><Piezo selected={selected} select={choose} open={openPiezo}/><Waves pitch={pitch}/></group><group position={[d.breadboard[0],0,d.breadboard[2]]}><Resistor selected={selected} choose={choose}/></group></group><Label anchor={anchor} selected={selected} name={name}/><OrbitControls makeDefault target={[0,.25,0]} minDistance={.04} maxDistance={12}/><Camera selected={selected} version={version} anchor={anchor} report={report}/></>;}
