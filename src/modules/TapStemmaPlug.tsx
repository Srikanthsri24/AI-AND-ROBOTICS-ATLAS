import{useMemo}from'react';
import{Shape,Path}from'three';
import type{ThreeEvent}from'@react-three/fiber';
import{tapStemmaChannels,tapStemmaPose}from'../data/tap-stemma-plug';
export default function TapStemmaPlug({selected,choose,phase=1}:{selected:string;choose:(id:string)=>void;phase?:number}){
 const shell=useMemo(()=>{const s=new Shape();s.moveTo(-3.35,1.3);s.lineTo(3.35,1.3);s.lineTo(3.35,4.9);s.lineTo(-3.35,4.9);s.closePath();for(const c of tapStemmaChannels){const h=new Path(),x=-c.z;h.moveTo(x-.47,2.4-.47);h.lineTo(x-.47,2.4+.47);h.lineTo(x+.47,2.4+.47);h.lineTo(x+.47,2.4-.47);h.closePath();s.holes.push(h);}return s;},[]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.4}),event=(id:string)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);};
 return <group name="tap-stemma-assembly" position={[...tapStemmaPose(phase).offset]}>
 <mesh name="tap-stemma-plug" userData={{partId:'tap-stemma-plug'}} position={[190,231,-66]} rotation={[0,Math.PI/2,0]} onClick={event('tap-stemma-plug')}><extrudeGeometry args={[shell,{depth:11.2,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-stemma-plug','#e9e1cc')}/></mesh>
 <mesh name="tap-stemma-key" userData={{partId:'tap-stemma-key'}} position={[196,236.25,-66]} onClick={event('tap-stemma-key')}><boxGeometry args={[3,.7,1.6]}/><meshStandardMaterial {...mat('tap-stemma-key','#e9e1cc')}/></mesh>
 {tapStemmaChannels.map(c=>{const id='tap-stemma-contact-'+c.name;return <group key={id} name={id} userData={{partId:id}} onClick={event(id)}>{[-1,1].map(side=><mesh name={id+'-leaf-'+side} key={side} position={[198.5,233.4+side*.235,-66+c.z]}><boxGeometry args={[4.6,.07,.5]}/><meshStandardMaterial {...mat(id,'#bca76e',.8)}/></mesh>)}<mesh name={id+'-bridge'} position={[195.7,233.4,-66+c.z]}><boxGeometry args={[1,.54,.5]}/><meshStandardMaterial {...mat(id,'#bca76e',.8)}/></mesh><mesh position={[192.1,233.4,-66+c.z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.22,.22,6.2,16]}/><meshStandardMaterial {...mat(id,'#bca76e',.8)}/></mesh></group>;})}
 {tapStemmaChannels.map(c=>{const id='tap-stemma-tail-'+c.name;return <mesh key={id} name={id} userData={{partId:id}} position={[190.1,233.4,-66+c.z]} rotation={[0,0,Math.PI/2]} onClick={event(id)}><cylinderGeometry args={[.45,.45,2.2,16]}/><meshStandardMaterial {...mat(id,c.color)}/></mesh>;})}
 </group>;
}
