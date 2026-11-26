import {memo,useMemo,type ReactNode} from 'react';
import {Path,Shape} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {pn532Stack,pn532StackPins} from '../data/pn532-stack';
/** Authored hollow stackable connector envelope at the actual CAD pad centres. */
function Pn532StackHeaders({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const shape=useMemo(()=>{const s=new Shape();s.moveTo(-1.27,-1.27);s.lineTo(1.27,-1.27);s.lineTo(1.27,1.27);s.lineTo(-1.27,1.27);s.closePath();const h=new Path();h.moveTo(-.55,-.55);h.lineTo(-.55,.55);h.lineTo(.55,.55);h.lineTo(.55,-.55);h.closePath();s.holes.push(h);return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="pn532-stack-headers">{['digital-high','digital-low','power','analog'].map(bank=>{const id='pn532-header-'+bank;return <group key={bank}>{tag(id,<>{pn532StackPins.filter(p=>p.bank===bank).map(p=><group key={p.name} name={'pn532-stack-pin-'+p.name} position={[p.x,0,-p.y]}><mesh name={'pn532-stack-housing-'+p.name} position={[0,pn532Stack.bodyBottom,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,{depth:pn532Stack.socketTop-pn532Stack.bodyBottom,bevelEnabled:false}]}/><meshStandardMaterial color={c(id,'#29333e')} roughness={.6}/></mesh><mesh name={'pn532-stack-leg-'+p.name} position={[0,(pn532Stack.pinBottom+pn532Stack.pinTop)/2,0]}><boxGeometry args={[.64,pn532Stack.pinTop-pn532Stack.pinBottom,.64]}/><meshStandardMaterial color={c(id,'#bea86f')} metalness={.8} roughness={.3}/></mesh><mesh name={'pn532-stack-crimp-'+p.name} position={[0,3.1,0]}><boxGeometry args={[.64,3.2,.64]}/><meshStandardMaterial color={c(id,'#b8a77a')} metalness={.8} roughness={.32}/></mesh>{[-1,1].map(side=><mesh name={'pn532-stack-leaf-'+p.name+'-'+side} key={side} position={[side*.39,6.5,0]}><boxGeometry args={[.14,4,.7]}/><meshStandardMaterial color={c(id,'#b8a77a')} metalness={.8} roughness={.32}/></mesh>)}</group>)}</>)}</group>;})}</group>;
}
export default memo(Pn532StackHeaders);
