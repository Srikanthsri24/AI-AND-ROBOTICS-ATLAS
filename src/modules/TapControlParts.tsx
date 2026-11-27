import {useMemo,type ReactNode} from 'react';
import {Shape,Path} from 'three';
import type{ThreeEvent}from'@react-three/fiber';
import Uno from './SoapDispenserUno';
import Mini from './BluetoothMiniBreadboard';
import Driver from './TapMotorDriver';
import {tapDriverPlacement} from '../data/tap-driver';
import {tapElectronics,tapControlMounts,tapProgrammingRotations} from '../data/tap-electronics';
type Props={selected:string;choose:(id:string)=>void;logicPowered?:boolean;pumpPowered?:boolean;driverSignal?:boolean};
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}
export default function TapControlParts({selected,choose,logicPowered=false,pumpPowered=false,driverSignal=false}:Props){
 const post=useMemo(()=>ring(2.5,1.05),[]),washer=useMemo(()=>ring(2.1,.95),[]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.4,emissive:selected===id?'#6e3ab5':'#000000',emissiveIntensity:.25});
 const tag=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="tap-control-electronics">
  <group position={[...tapElectronics.uno]} scale={50}><Uno selected={selected} select={choose} powered={logicPowered} partPrefix="tap-" programmingRotations={tapProgrammingRotations}/></group>
  <group position={[...tapDriverPlacement]}><Driver {...{selected,choose}} powered={pumpPowered} signal={driverSignal}/></group>
  {tag('tap-breadboard',<group position={[...tapElectronics.breadboard]} rotation={[0,Math.PI/2,0]} scale={50}><Mini selected={selected==='tap-breadboard'} flatBase supplyLabel="" returnLabel=""/></group>)}
  {tag('tap-control-supports',<>{tapControlMounts.map(m=><group key={m.id}><mesh position={[m.x,223.4,m.z]}><cylinderGeometry args={[2.5,2.5,.8,32]}/><meshStandardMaterial {...mat('tap-control-supports','#e8dfc9')}/></mesh><mesh position={[m.x,223.8,m.z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[post,{depth:6.4,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-control-supports','#e8dfc9')}/></mesh></group>)}</>)}
  {tapControlMounts.map(m=>tag(m.id,<><mesh position={[m.x,228.3,m.z]}><cylinderGeometry args={[.9,.9,8,24]}/><meshStandardMaterial {...mat(m.id,'#bac4ce',.8)}/></mesh><mesh position={[m.x,231.8,m.z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[washer,{depth:.5,bevelEnabled:false}]}/><meshStandardMaterial {...mat(m.id,'#bac4ce',.8)}/></mesh><mesh position={[m.x,232.9,m.z]}><cylinderGeometry args={[1.8,1.8,1.2,6]}/><meshStandardMaterial {...mat(m.id,'#bac4ce',.8)}/></mesh></>))}
 </group>;
}
