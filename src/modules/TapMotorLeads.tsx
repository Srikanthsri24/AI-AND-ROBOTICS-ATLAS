import{useMemo}from'react';
import{Shape,Path}from'three';
import type{ThreeEvent}from'@react-three/fiber';
import{tapMotorLeads,tapMotorLeadPose,tapMotorSupportXs}from'../data/tap-motor-leads';
import{tapJumperCurve}from'./TapDryJumpers';
function Lead({id,sourcePhase,destinationPhase,selected,choose}:{id:string;sourcePhase:number;destinationPhase:number;selected:string;choose:(id:string)=>void}){
 const w=tapMotorLeads.find(w=>w.id===id)!,pose=useMemo(()=>tapMotorLeadPose(id,sourcePhase,destinationPhase),[id,sourcePhase,destinationPhase]),curve=useMemo(()=>tapJumperCurve(pose.points),[pose]);
 const shell=useMemo(()=>{const s=new Shape();s.moveTo(-1.9,-.7);s.lineTo(1.9,-.7);s.lineTo(1.9,.7);s.lineTo(-1.9,.7);s.closePath();const h=new Path();h.moveTo(-1.55,-.4);h.lineTo(-1.55,.4);h.lineTo(1.55,.4);h.lineTo(1.55,-.4);h.closePath();s.holes.push(h);return s;},[]);
 const mat=(owner:string,color:string,metalness=0)=>({color:selected===id||selected===owner?'#c4a2ff':color,metalness,roughness:.36,emissive:selected===id||selected===owner?'#6e3ab5':'#000000',emissiveIntensity:.25}),event=(owner:string)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(owner);};
 const a=id+'-end-0',b=id+'-end-1';return <group name={id} userData={{partId:id}} onClick={event(id)}>
 <mesh name={id+'-jacket'}><tubeGeometry args={[curve,180,.65,12,false]}/><meshStandardMaterial {...mat(id,w.color)}/></mesh>
 <group name={a} userData={{partId:a}} position={[...pose.source]} onClick={event(a)}><mesh name={a+'-copper'} position={[4,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.3,.3,8,16]}/><meshStandardMaterial {...mat(a,'#c59260',.8)}/></mesh></group>
 <group name={b} userData={{partId:b}} position={[...pose.destination]} rotation={[-Math.PI/2,0,0]} onClick={event(b)}>
 <mesh name={b+'-housing'} position={[0,-2.4,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shell,{depth:5.4,bevelEnabled:false}]}/><meshStandardMaterial {...mat(b,'#293442')}/></mesh>
 {[-1,1].map(side=><mesh name={b+'-leaf-'+side} key={side} position={[0,-.5,side*.34]}><boxGeometry args={[3,3.8,.08]}/><meshStandardMaterial {...mat(b,'#bca575',.8)}/></mesh>)}
 <mesh name={b+'-bridge'} position={[0,1.5,0]}><boxGeometry args={[3,.2,.76]}/><meshStandardMaterial {...mat(b,'#bca575',.8)}/></mesh>
 <mesh name={b+'-boot'} position={[0,5,0]}><cylinderGeometry args={[.8,.8,4,16]}/><meshStandardMaterial {...mat(b,w.color)}/></mesh>
 <mesh position={[0,4.3,0]}><cylinderGeometry args={[.3,.3,5.4,12]}/><meshStandardMaterial {...mat(b,'#c59260',.8)}/></mesh>
 </group></group>;
}
function Guides({selected,choose}:{selected:string;choose:(id:string)=>void}){const shape=useMemo(()=>{const s=new Shape();s.moveTo(148,276);s.lineTo(171,276);s.lineTo(171,291);s.lineTo(148,291);s.closePath();for(const [x,y]of[[164,284],[168,288]]){const h=new Path();h.absarc(x,y,.9,0,Math.PI*2,true);s.holes.push(h);}return s;},[]);return <group name="tap-motor-cable-supports">{tapMotorSupportXs.map((x,i)=>{const id='tap-motor-guide-'+i;return <mesh key={id} name={id} userData={{partId:id}} position={[x-1.5,0,0]} rotation={[0,Math.PI/2,0]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}><extrudeGeometry args={[shape,{depth:3,bevelEnabled:false}]}/><meshStandardMaterial color={selected===id?'#c4a2ff':'#6f6792'} roughness={.4}/></mesh>;})}</group>;}
export default function TapMotorLeads({selected,choose,fitting={}}:{selected:string;choose:(id:string)=>void;fitting?:Readonly<Record<string,readonly[number,number]>>}){return <group name="tap-motor-leads"><Guides {...{selected,choose}}/>{tapMotorLeads.map(w=><Lead key={w.id} id={w.id} sourcePhase={fitting[w.id]?.[0]??1} destinationPhase={fitting[w.id]?.[1]??1} {...{selected,choose}}/>)}</group>;}
