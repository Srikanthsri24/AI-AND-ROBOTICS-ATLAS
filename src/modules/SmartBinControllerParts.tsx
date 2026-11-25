import{memo}from'react';import Uno from'./BluetoothCarUno';import Base from'./SmartBinControllerBase';import Shield from'./SmartBinShieldParts';import{binControllerAt as at}from'../data/smart-bin-electronics';
function SmartBinControllerParts({selected,select,powered=false,link=false}:{selected:string;select:(id:string)=>void;powered?:boolean;link?:boolean}){return <><group position={[...at]} scale={50}><Uno {...{selected,select,powered}}/></group><Base {...{selected,select,powered}}/><Shield {...{selected,select,powered,link}}/></>}
export default memo(SmartBinControllerParts);
