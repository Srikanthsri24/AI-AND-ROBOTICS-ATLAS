import{useMemo,type ReactNode}from'react';import type{ThreeEvent}from'@react-three/fiber';import{Path,Quaternion,Shape,Vector3}from'three';
import{raArmLoomFrames,raArmLoomGuides}from'../data/rover-arm-loom-support';
const options={rubber:{depth:.8,bevelEnabled:false,curveSegments:16},foot:{depth:2.2,bevelEnabled:false,curveSegments:16},eye:{depth:1.5,bevelEnabled:false,curveSegments:32},collar:{depth:4,bevelEnabled:false,curveSegments:32}};
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);return s;}
function foot(width:number){const s=new Shape(),h=width/2,r=2;s.moveTo(-h+r,-h);s.lineTo(h-r,-h);s.quadraticCurveTo(h,-h,h,-h+r);s.lineTo(h,h-r);s.quadraticCurveTo(h,h,h-r,h);s.lineTo(-h+r,h);s.quadraticCurveTo(-h,h,-h,h-r);s.lineTo(-h,-h+r);s.quadraticCurveTo(-h,-h,-h+r,-h);return s;}
/** A prepared organizer: guide arms join loose eyes to retaining collars;
 * collars fit around the separate posts and feet rest on the fixture surface. */
export default function RoverArmLoomSupport({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const shapes=useMemo(()=>({eye:ring(6.5,4.4),wideEye:ring(12,10),collar:ring(3.8,2.25),feet:raArmLoomFrames.map(f=>foot(f.foot))}),[]);
 const guides=useMemo(()=>raArmLoomGuides.map(g=>{const centre=new Vector3(...g.at),axis=new Vector3(...g.axis).normalize(),frame=raArmLoomFrames.find(f=>f.key===g.frame)!,post=new Vector3(frame.at[0],g.at[1],frame.at[2]),direction=post.clone().sub(centre);direction.addScaledVector(axis,-direction.dot(axis)).normalize();const start=centre.clone().addScaledVector(direction,g.id==='ra-arm-loom-in-4'?11:5.5),radial=new Vector3(centre.x-post.x,0,centre.z-post.z).normalize(),end=post.clone().addScaledVector(radial,3.8),rise=g.id==='ra-arm-loom-in-3'?40:25,outer=post.clone().addScaledVector(radial,g.id==='ra-arm-loom-in-3'?8:3.8),points=['ra-arm-loom-in-3','ra-arm-loom-in-4'].includes(g.id)?[start,start.clone().add(new Vector3(0,rise,0)),outer.clone().add(new Vector3(0,rise,0)),...(g.id==='ra-arm-loom-in-3'?[outer]:[]),end]:[start,end],arms=points.slice(1).map((point,i)=>{const delta=point.clone().sub(points[i]);return{at:points[i].clone().add(point).multiplyScalar(.5),length:delta.length(),rotation:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),delta.normalize())};});return{...g,centre,post,eyeRotation:new Quaternion().setFromUnitVectors(new Vector3(0,0,1),axis),arms,bends:points.slice(1,-1)};}),[]);
 const material=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:metalness ? 0.34 : 0.58});
 const tag=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="ra-arm-loom-support" userData={{authoredFixture:true}}>
 {raArmLoomFrames.map((f,i)=>tag(f.id,<group position={[...f.at]}>
  <mesh rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.feet[i],options.rubber]}/><meshStandardMaterial {...material(f.id,'#383848')}/></mesh>
  <mesh position={[0,.8,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.feet[i],options.foot]}/><meshStandardMaterial {...material(f.id,'#625181')}/></mesh>
  <mesh position={[0,(3+f.height-2.2)/2,0]}><cylinderGeometry args={[2.2,2.2,f.height-5.2,24]}/><meshStandardMaterial {...material(f.id,'#8895ab',.75)}/></mesh>
  <mesh position={[0,f.height-2.2,0]}><sphereGeometry args={[2.2,24,16]}/><meshStandardMaterial {...material(f.id,'#8895ab',.75)}/></mesh>
 </group>))}
 {guides.map(g=>tag(g.id,<>
  <group position={g.centre} quaternion={g.eyeRotation}><mesh position={[0,0,-.75]}><extrudeGeometry args={[g.id==='ra-arm-loom-in-4'?shapes.wideEye:shapes.eye,options.eye]}/><meshStandardMaterial {...material(g.id,'#7861b2')}/></mesh></group>
  {g.arms.map((arm,i)=><mesh key={i} position={arm.at} quaternion={arm.rotation}><cylinderGeometry args={[1.3,1.3,arm.length,20]}/><meshStandardMaterial {...material(g.id,'#8796ad',.65)}/></mesh>)}{g.bends.map((bend,i)=><mesh key={'bend-'+i} position={bend}><sphereGeometry args={[1.3,16,12]}/><meshStandardMaterial {...material(g.id,'#8796ad',.65)}/></mesh>)}
  <mesh position={[g.post.x,g.post.y-2,g.post.z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.collar,options.collar]}/><meshStandardMaterial {...material(g.id,'#7861b2')}/></mesh>
 </>))}
 </group>;
}
