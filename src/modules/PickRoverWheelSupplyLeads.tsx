import{memo,useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Shape,Path}from'three';
import{pickWheelSupplyLinks,pickWheelSupplyRoute}from'../data/pick-rover-wheel-supply-leads';
const socketOptions={depth:8,bevelEnabled:false};
function PickRoverWheelSupplyLeads({selected,choose,connected=pickWheelSupplyLinks.map(l=>l.id)}:{selected:string;choose:(id:string)=>void;connected?:readonly string[]}){
 const shape=useMemo(()=>{const s=new Shape();s.moveTo(-1.225,-1.225);s.lineTo(1.225,-1.225);s.lineTo(1.225,1.225);s.lineTo(-1.225,1.225);s.closePath();const h=new Path();h.moveTo(-.5,-.5);h.lineTo(.5,-.5);h.lineTo(.5,.5);h.lineTo(-.5,.5);h.closePath();s.holes.push(h);return s;},[]),routes=useMemo(()=>pickWheelSupplyLinks.map((_,i)=>pickWheelSupplyRoute(i)),[]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.45}),tag=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="pick-rover-wheel-supply-leads">{routes.filter(r=>connected.includes(r.link.id)).map(r=>{const id=(end:string)=>'pick-wheel-supply-'+r.link.id+'-'+end;return <group key={r.link.id}>
 {tag(id('wire'),<mesh name={id('wire')+'-insulation'}><tubeGeometry args={[r.curve,200,.65,12,false]}/><meshStandardMaterial {...mat(id('wire'),r.link.color)}/></mesh>)}
 {tag(id('solder'),<group position={r.terminal.toArray()}><mesh name={id('solder')+'-joint'}><sphereGeometry args={[.8,16,12]}/><meshStandardMaterial {...mat(id('solder'),'#b8b8b0',.8)}/></mesh><mesh name={id('solder')+'-core'} rotation={[0,0,Math.PI/2]} position={[-.9,0,0]}><cylinderGeometry args={[.25,.25,1.8,12]}/><meshStandardMaterial {...mat(id('solder'),'#b98c56',.8)}/></mesh></group>)}
 {tag(id('driver'),<group position={[r.pin[0],r.pin[1]-2.75,r.pin[2]]}><mesh name={id('driver')+'-housing'} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,socketOptions]}/><meshStandardMaterial {...mat(id('driver'),'#262d36')}/></mesh>{[-1,1].map(side=><mesh key={side} name={id('driver')+'-contact-'+side} position={[side*.3,2.5,0]}><boxGeometry args={[.15,3,.6]}/><meshStandardMaterial {...mat(id('driver'),'#bca66e',.8)}/></mesh>)}<mesh name={id('driver')+'-bridge'} position={[0,4,0]}><boxGeometry args={[.75,.2,.65]}/><meshStandardMaterial {...mat(id('driver'),'#bca66e',.8)}/></mesh><mesh name={id('driver')+'-core'} position={[0,6.025,0]}><cylinderGeometry args={[.25,.25,4.05,12]}/><meshStandardMaterial {...mat(id('driver'),'#b98c56',.8)}/></mesh></group>)}
 </group>;})}</group>;
}
export default memo(PickRoverWheelSupplyLeads);
