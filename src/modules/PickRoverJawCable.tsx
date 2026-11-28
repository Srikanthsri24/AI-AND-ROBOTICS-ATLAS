import{memo,useMemo,useRef,useLayoutEffect,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Shape,Path,type Mesh,type TubeGeometry}from'three';import{rewriteCubeSatTube}from'./cubesat-tube-motion';
import{raServoWires}from'../data/rover-arm-servo';
import{pickJawCableRoutes,pickJawCableSeat as seat}from'../data/pick-rover-jaw-cable';
const plugOptions={depth:8,bevelEnabled:false};
function PickRoverJawCable({selected,choose,angle,inspectionOpen=false}:{angle:number;inspectionOpen?:boolean;selected:string;choose:(id:string)=>void}){
 const state=useMemo(()=>pickJawCableRoutes(angle),[angle]),initial=useRef(state.routes).current,tubes=useRef<Mesh<TubeGeometry>[]>([]);useLayoutEffect(()=>{state.routes.forEach((r,i)=>{if(tubes.current[i])rewriteCubeSatTube(tubes.current[i].geometry,r.curve);});},[state]);
 const shape=useMemo(()=>{const s=new Shape();s.moveTo(-1.225,-3.8);s.lineTo(1.225,-3.8);s.lineTo(1.225,3.8);s.lineTo(-1.225,3.8);s.closePath();for(const w of raServoWires){const h=new Path();h.moveTo(-.5,w.pin-.5);h.lineTo(.5,w.pin-.5);h.lineTo(.5,w.pin+.5);h.lineTo(-.5,w.pin+.5);h.closePath();s.holes.push(h);}return s;},[]),mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.45}),tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="pick-jaw-servo-cable">
 {initial.map(({wire:w,curve},i)=>{const id='pick-jaw-cable-'+w.id;return tag(id,<mesh ref={m=>{if(m)tubes.current[i]=m as Mesh<TubeGeometry>;}} name={id+'-insulation'}><tubeGeometry args={[curve,300,.45,10,false]}/><meshStandardMaterial {...mat(id,w.color)}/></mesh>);})}
 {tag('pick-jaw-cable-plug',<mesh name="pick-jaw-three-way-housing" position={[seat[0]+(inspectionOpen?112:0),seat[1]+(inspectionOpen?30:0),seat[2]]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,plugOptions]}/><meshStandardMaterial {...mat('pick-jaw-cable-plug','#242b37')}/></mesh>)}
 {raServoWires.map(w=>{const id='pick-jaw-contact-'+w.id;return tag(id,<group position={[seat[0],seat[1],seat[2]-w.pin]}>{[-1,1].map(side=><mesh key={side} name={id+'-spring-'+side} position={[side*.385,2.5,0]}><boxGeometry args={[.15,3,.6]}/><meshStandardMaterial {...mat(id,'#bca66e',.8)}/></mesh>)}<mesh name={id+'-bridge'} position={[0,4,0]}><boxGeometry args={[.92,.2,.65]}/><meshStandardMaterial {...mat(id,'#bca66e',.8)}/></mesh><mesh name={id+'-core'} position={[0,6.025,0]}><cylinderGeometry args={[.18,.18,4.05,12]}/><meshStandardMaterial {...mat(id,'#b98b58',.8)}/></mesh></group>);})}
 </group>;
}
export default memo(PickRoverJawCable);
