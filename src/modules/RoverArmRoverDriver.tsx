import{memo,useLayoutEffect,useRef}from'react';import type{Group}from'three';
import Board from'./BluetoothWorkshopBoards';import{bluetoothBoardScale}from'../data/bluetooth-board-geometry';
/** Same real carrier hardware; this guide has its own pins, labels and topology.
 * Native dimensions are millimetres, ready for the rover's own placement. */
function RoverArmRoverDriver({selected,choose,individualHeaders=true,individualComponents=true}:{selected:string;choose:(id:string)=>void;individualHeaders?:boolean;individualComponents?:boolean}){const root=useRef<Group>(null);useLayoutEffect(()=>{root.current?.traverse(o=>{if(o.userData.partId)o.name=o.userData.partId;});},[individualHeaders,individualComponents]);return <group ref={root} name="ra-rover-driver-model" scale={1/bluetoothBoardScale}><Board kind="tb6612" idPrefix="ra-rover-driver" selected={selected} select={choose} individualHeaders={individualHeaders} individualComponents={individualComponents} cpuGlyphs/></group>;}
export default memo(RoverArmRoverDriver);
