import Uno from './BluetoothCarUno';
import Base from './EmergencyControllerBase';
import {emergencyUnoAt} from '../data/emergency-controller';
export default function EmergencyControllerParts({selected='',select=()=>{},powered=false,animateUsb=false}:{selected?:string;select?:(id:string)=>void;powered?:boolean;animateUsb?:boolean}){return <group name="emergency-controller-mm"><group position={emergencyUnoAt} scale={50}><Uno {...{selected,select,powered}} partPrefix="emergency-"/></group><Base {...{selected,select,powered,animateUsb}}/></group>;}
