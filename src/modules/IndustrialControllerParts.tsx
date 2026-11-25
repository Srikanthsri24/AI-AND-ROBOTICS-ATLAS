import Uno from './BluetoothCarUno';
import Base from './IndustrialControllerBase';
import Shield from './IndustrialShieldParts';
import { industrialUnoAt } from '../data/industrial-controller';
export type IndustrialControllerInspection='none'|'uno'|'shield-underside'|'contacts';
/** Inspection lifts the unpowered shield; the underside view additionally removes the lower board. */
export default function IndustrialControllerParts({selected='',select=()=>{},powered=false,link=false,inspection='none',animateUsb=false}:{selected?:string;select?:(id:string)=>void;powered?:boolean;link?:boolean;inspection?:IndustrialControllerInspection;animateUsb?:boolean}){const active=powered&&inspection==='none';return <group name="industrial-controller-stack"><group visible={inspection!=='shield-underside'}><group position={industrialUnoAt} scale={50}><Uno {...{selected,select}} powered={active} partPrefix="industrial-"/></group><Base {...{selected,select,animateUsb}} powered={active}/></group><group name="industrial-lifted-shield" position={[0,inspection==='uno'||inspection==='shield-underside'?55:0,0]}><Shield {...{selected,select,link}} powered={active}/></group></group>;}
