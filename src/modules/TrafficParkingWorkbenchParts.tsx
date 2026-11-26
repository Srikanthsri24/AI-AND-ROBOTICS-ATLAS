import {useLayoutEffect,useRef} from 'react';
import type {Group} from 'three';
import Bench from './TrafficParkingBenchParts';
import Signals from './TrafficParkingSignalParts';
import Barrier from './TrafficParkingBarrierParts';
import Circuit from './TrafficParkingCircuitParts';
import Supply from './TrafficParkingSupplyParts';
import Lead from './TrafficParkingServoLeadParts';
import Uno from './BluetoothCarUno';
import {trafficParkingCircuitLayout as layout,trafficParkingUnoProgrammingRotations} from '../data/traffic-parking-circuit-layout';
import {trafficParkingBarrierPlacement} from '../data/traffic-parking-barrier';
import type {TrafficLampColor} from '../data/traffic-parking-signals';
export default function TrafficParkingWorkbenchParts({selected,choose,main=null,cross=null,full=false,angle=20,entry=false,exit=false,powered=false,servoPower=false,cutaway=false}:{selected:string;choose:(id:string)=>void;main?:TrafficLampColor|null;cross?:TrafficLampColor|null;full?:boolean;angle?:number;entry?:boolean;exit?:boolean;powered?:boolean;servoPower?:boolean;cutaway?:boolean}){
 const root=useRef<Group>(null);useLayoutEffect(()=>{root.current?.traverse(o=>{if(o.userData.partId&&!o.name)o.name=o.userData.partId;});},[]);
 return <group ref={root} name="traffic-parking-workbench"><Bench selected={selected} choose={choose}/><Signals selected={selected} choose={choose} main={main} cross={cross} full={full}/><Circuit selected={selected} choose={choose} entry={entry} exit={exit}/><Supply selected={selected} choose={choose} powered={servoPower}/><group name="tp-servo-assembly" position={[...trafficParkingBarrierPlacement]}><Barrier selected={selected} choose={choose} angle={angle} cutaway={cutaway}/><Lead selected={selected} choose={choose}/></group><group name="tp-uno-assembly" position={[...layout.uno]} scale={50}><Uno selected={selected} select={choose} powered={powered} partPrefix="tp-" programmingRotations={trafficParkingUnoProgrammingRotations}/></group></group>;
}
