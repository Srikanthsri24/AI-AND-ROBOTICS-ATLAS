import {useLayoutEffect,useRef} from 'react';
import type {Group} from 'three';
import Usb from './TrafficParkingUsbParts';
import type {RefObject} from 'react';
import type {TrafficParkingUsbMotion} from '../data/traffic-parking-usb';
import Motion from './TrafficParkingAssemblyMotion';
import {trafficParkingAssemblyTotal,trafficParkingAssemblyReady,trafficParkingHornReady} from '../data/traffic-parking-assembly';
import Bench from './TrafficParkingBenchParts';
import Wires from './TrafficParkingWireParts';
import Signals from './TrafficParkingSignalParts';
import Barrier from './TrafficParkingBarrierParts';
import Circuit from './TrafficParkingCircuitParts';
import Supply from './TrafficParkingSupplyParts';
import Lead from './TrafficParkingServoLeadParts';
import Uno from './BluetoothCarUno';
import {trafficParkingCircuitLayout as layout,trafficParkingUnoProgrammingRotations} from '../data/traffic-parking-circuit-layout';
import {trafficParkingBarrierPlacement} from '../data/traffic-parking-barrier';
import {trafficParkingFittingTotal,trafficParkingFittingSupplyClamps} from '../data/traffic-parking-fitting';
import type {TrafficLampColor} from '../data/traffic-parking-signals';
export default function TrafficParkingWorkbenchParts({selected,choose,main=null,cross=null,full=false,angle=20,entry=false,exit=false,powered=false,servoPower=false,cutaway=false,fittingCursor=trafficParkingFittingTotal,assemblyProgress=trafficParkingAssemblyTotal,hornProgress=2,usbMotion,rows=[]}:{selected:string;choose:(id:string)=>void;main?:TrafficLampColor|null;cross?:TrafficLampColor|null;full?:boolean;angle?:number;entry?:boolean;exit?:boolean;powered?:boolean;servoPower?:boolean;cutaway?:boolean;fittingCursor?:number;assemblyProgress?:number;hornProgress?:number;usbMotion?:RefObject<TrafficParkingUsbMotion>;rows?:readonly string[]}){
 trafficParkingHornReady(hornProgress);const wired=trafficParkingAssemblyReady(assemblyProgress)&&fittingCursor>=trafficParkingFittingTotal,root=useRef<Group>(null);useLayoutEffect(()=>{root.current?.traverse(o=>{if(o.userData.partId&&!o.name)o.name=o.userData.partId;});},[]);
 return <><Motion root={root} progress={assemblyProgress} horn={hornProgress} angle={angle}/><group ref={root} name="traffic-parking-workbench"><Usb selected={selected} choose={choose} powered={wired&&powered} rows={rows} motion={usbMotion}/><Wires selected={selected} choose={choose} cursor={fittingCursor}/><Bench selected={selected} choose={choose}/><Signals selected={selected} choose={choose} main={wired&&powered?main:null} cross={wired&&powered?cross:null} full={wired&&powered&&full}/><Circuit selected={selected} choose={choose} entry={entry} exit={exit}/><Supply selected={selected} choose={choose} powered={wired&&servoPower&&!(hornProgress>0&&hornProgress<2)} clampRelease={trafficParkingFittingSupplyClamps(fittingCursor)}/><group name="tp-servo-assembly" position={[...trafficParkingBarrierPlacement]}><Barrier selected={selected} choose={choose} angle={angle} cutaway={cutaway}/><Lead selected={selected} choose={choose}/></group><group name="tp-uno-assembly" position={[...layout.uno]} scale={50}><Uno selected={selected} select={choose} powered={wired&&powered} partPrefix="tp-" programmingRotations={trafficParkingUnoProgrammingRotations}/></group></group></>;
}
