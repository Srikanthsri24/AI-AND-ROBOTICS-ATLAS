import{memo}from'react';
import Uno from'./BluetoothCarUno';
import Base from'./FloodControllerParts';
import Shield from'./AquacleanShieldParts';
import{aquaControllerPlacement as p}from'../data/aquaclean-electronics';
function AquacleanControllerParts({selected,select,powered=false,link=false}:{selected:string;select:(id:string)=>void;powered?:boolean;link?:boolean}){return <><group position={[...p]} scale={50}><Uno {...{selected,select,powered}}/></group><Base {...{selected,select,powered}}/><Shield {...{selected,select,powered,link}}/></>;}
export default memo(AquacleanControllerParts);
