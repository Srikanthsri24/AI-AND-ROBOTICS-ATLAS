import{memo,useMemo,useRef,useLayoutEffect,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Shape,Path,type Group,type Mesh,type TubeGeometry}from'three';
import{raServoWires}from'../data/rover-arm-servo';
import{pickLiftCableRoutes,pickLiftCableSeat as seat}from'../data/pick-rover-lift-cable';
import{pickLiftCableInsertion}from'../data/pick-rover-lift-cable-insertion';
import{rewriteCubeSatTube}from'./cubesat-tube-motion';
const plugOptions={depth:8,bevelEnabled:false};
function PickRoverLiftCable({selected,choose,inspectionOpen=false,assembly=false,cutaway=false}:{inspectionOpen?:boolean;assembly?:boolean;cutaway?:boolean;selected:string;choose:(id:string)=>void}){
 const shape=useMemo(()=>{const s=new Shape();s.moveTo(-1.225,-3.8);s.lineTo(1.225,-3.8);s.lineTo(1.225,3.8);s.lineTo(-1.225,3.8);s.closePath();for(const w of raServoWires){const h=new Path();h.moveTo(-.5,w.pin-.5);h.lineTo(.5,w.pin-.5);h.lineTo(.5,w.pin+.5);h.lineTo(-.5,w.pin+.5);h.closePath();s.holes.push(h);}return s;},[]),mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.45}),tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const root=useRef<Group>(null),tubes=useRef<(Mesh<TubeGeometry>|null)[]>([]),plug=useRef<Mesh>(null),contacts=useRef<(Group|null)[]>([]),cached=useRef<number|null>(null);
 useLayoutEffect(()=>{if(!assembly)return;const object=root.current;if(!object)throw Error('Missing lift cable assembly');object.userData.applyAssemblyPose=(progress:number)=>{if(cached.current===progress)return;const pose=pickLiftCableInsertion(progress);pose.conductors.forEach((r,i)=>{const tube=tubes.current[i],contact=contacts.current[i];if(!tube||!contact)throw Error('Missing lift cable conductor');rewriteCubeSatTube(tube.geometry,r.curve);contact.position.y=seat[1]+pose.lift;});if(plug.current)plug.current.position.y=seat[1]+pose.lift;cached.current=progress;};return()=>{object.userData.applyAssemblyPose?.(1);delete object.userData.applyAssemblyPose;cached.current=null;};},[assembly]);
 return <group ref={root} name="pick-lift-servo-cable">
 {pickLiftCableRoutes.map(({wire:w,curve},i)=>{const id='pick-lift-cable-'+w.id;return tag(id,<mesh ref={m=>{tubes.current[i]=m as Mesh<TubeGeometry>|null;}} name={id+'-insulation'}><tubeGeometry args={[curve,300,.45,10,false]}/><meshStandardMaterial {...mat(id,w.color)}/></mesh>);})}
 {tag('pick-lift-cable-plug',<mesh visible={!cutaway} ref={plug} name="pick-lift-three-way-housing" position={[seat[0]-(inspectionOpen?112:0),seat[1]+(inspectionOpen?30:0),seat[2]]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,plugOptions]}/><meshStandardMaterial {...mat('pick-lift-cable-plug','#242b37')}/></mesh>)}
 {raServoWires.map((w,i)=>{const id='pick-lift-contact-'+w.id;return tag(id,<group ref={g=>{contacts.current[i]=g;}} position={[seat[0],seat[1],seat[2]-w.pin]}>{[-1,1].map(side=><mesh key={side} name={id+'-spring-'+side} position={[side*.385,2.5,0]}><boxGeometry args={[.15,3,.6]}/><meshStandardMaterial {...mat(id,'#bca66e',.8)}/></mesh>)}<mesh name={id+'-bridge'} position={[0,4,0]}><boxGeometry args={[.92,.2,.65]}/><meshStandardMaterial {...mat(id,'#bca66e',.8)}/></mesh><mesh name={id+'-core'} position={[0,6.025,0]}><cylinderGeometry args={[.18,.18,4.05,12]}/><meshStandardMaterial {...mat(id,'#b98b58',.8)}/></mesh></group>);})}
 </group>;
}
export default memo(PickRoverLiftCable);
