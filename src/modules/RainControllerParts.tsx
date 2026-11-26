import {memo,type ReactNode} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import Uno from './BluetoothCarUno';
import Breadboard from './BluetoothMiniBreadboard';
import uno from '../data/uno-r3-board-layout.json';
import {rainWorkbenchLayout as layout} from '../data/rain-workbench-layout';
function RainControllerParts({selected,choose,usb=false}:{selected:string;choose:(id:string)=>void;usb?:boolean}){
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,c=(id:string,color:string)=>selected===id?'#b78be8':color;
 return <group name="rain-controller-hardware">
 {tag('rain-work-mat',<mesh position={[...layout.mat.centre]} receiveShadow><boxGeometry args={[...layout.mat.size]}/><meshStandardMaterial color={c('rain-work-mat','#45415e')} roughness={.9}/></mesh>)}
 <group name="rain-uno-assembly" position={[...layout.uno]} scale={50}><Uno selected={selected} select={choose} powered={usb} partPrefix="rain-"/></group>
 {tag('rain-uno-supports',<>{uno.holes.map((h,n)=><mesh key={n} position={[layout.uno[0]+Number(h.x)-34.29,8.6,layout.uno[2]+26.67-Number(h.y)]} castShadow><cylinderGeometry args={[2.4,2.4,17.2,24]}/><meshStandardMaterial color={c('rain-uno-supports','#d8d3c8')} roughness={.75}/></mesh>)}</>)}
 {tag('rain-breadboard',<group position={[...layout.breadboard]} scale={50}><Breadboard selected={selected==='rain-breadboard'} supplyLabel="" returnLabel=""/></group>)}
 {tag('rain-breadboard-support',<mesh position={[layout.breadboard[0],4,layout.breadboard[2]]} castShadow><boxGeometry args={[45,8,33]}/><meshStandardMaterial color={c('rain-breadboard-support','#d9d6ce')} roughness={.8}/></mesh>)}
 </group>;
}
export default memo(RainControllerParts);
