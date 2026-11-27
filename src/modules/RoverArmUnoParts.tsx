import{memo,useLayoutEffect,useRef}from'react';import type{Group}from'three';import Uno from'./BluetoothCarUno';
/** Actual shared Uno hardware, with this project's own labels and individually
 * clickable sockets. Millimetre-scale placement belongs to the bench parent. */
function RoverArmUnoParts({selected,choose,powered=false,individualHeaders=true}:{selected:string;choose:(id:string)=>void;powered?:boolean;individualHeaders?:boolean}){const root=useRef<Group>(null);useLayoutEffect(()=>{root.current?.traverse(o=>{if(o.userData.partId&&!o.name)o.name=o.userData.partId;});},[]);return <group ref={root} name="ra-uno-model" scale={50}><Uno selected={selected} select={choose} powered={powered} partPrefix="ra-" individualHeaders={individualHeaders} cpuGlyphs/></group>;}
export default memo(RoverArmUnoParts);
