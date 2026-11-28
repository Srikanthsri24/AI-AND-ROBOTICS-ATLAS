import{useMemo,type ReactNode}from'react';import type{ThreeEvent}from'@react-three/fiber';import{Shape,Path}from'three';
import{pickRoverRig}from'../data/pick-rover-motion';import{pickLiftGeometry as G,pickLiftJoints}from'../data/pick-rover-lift';
type Point=readonly[number,number,number];
const options={depth:3,bevelEnabled:false};
function hole(s:Shape,x:number,y:number,r:number){const p=new Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);}
function plate(w:number,length:number){const s=new Shape(),r=w/2;s.moveTo(-r,0);s.absarc(0,0,r,Math.PI,Math.PI*2,false);s.lineTo(r,length);s.absarc(0,length,r,0,Math.PI,false);s.closePath();hole(s,0,0,G.bore);hole(s,0,length,G.bore);if(length>50)for(const t of[.25,.5,.75])hole(s,0,length*t,3);return s;}
function rectangle(w:number,h:number){const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;}
/** Authored four-bar lift subsystem in mm. The gripper, servo coupling,
 * chassis anchors and wiring are composed separately; no fake complete kit. */
export default function PickRoverLift({angle,selected,choose}:{angle:number;selected:string;choose:(id:string)=>void}){
 const joint=pickLiftJoints(angle),shapes=useMemo(()=>{const link=plate(14,pickRoverRig.linkLength),end=plate(14,G.spacing),tower=rectangle(28,86),base=rectangle(88,62),palm=rectangle(52,35);for(const y of[9,35])hole(tower,0,y,G.bore);for(const x of[-34,34])for(const z of[-21,21])hole(base,x,z,2.2);for(const x of[-18,18])for(const z of[-10,10])hole(palm,x,z,1.7);return{link,end,tower,base,palm};},[]);
 const material=(id:string,color='#a6afb8',metalness=.55)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.38}),tag=(id:string,children:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,box=(id:string,p:Point,size:Point,color?:string)=><mesh position={[...p]}><boxGeometry args={[...size]}/><meshStandardMaterial {...material(id,color)}/></mesh>;
 const link=(id:string,y:number)=>tag(id,[-1,1].map(side=><group key={side} position={[side*G.sideX,y,0]} rotation={[angle-Math.PI/2,0,0]}><mesh rotation={[0,Math.PI/2,0]} position={[-1.5,0,0]}><extrudeGeometry args={[shapes.link,options]}/><meshStandardMaterial {...material(id)}/></mesh></group>));
 return <group name="pick-rover-four-bar-lift" userData={{units:'mm',authoredTeachingGeometry:true}}>
 {tag('pick-lift-base',<mesh position={[0,G.baseY,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.base,options]}/><meshStandardMaterial {...material('pick-lift-base','#3c4652')}/></mesh>)}
 {tag('pick-lift-fixed-frame',<>{[-1,1].map(side=><mesh key={side} position={[side*25-1.5,81,0]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[shapes.tower,options]}/><meshStandardMaterial {...material('pick-lift-fixed-frame','#7e8995')}/></mesh>)}</>)}
 {link('pick-lift-lower-links',pickRoverRig.pivotY)}{link('pick-lift-upper-links',pickRoverRig.pivotY+G.spacing)}
 {tag('pick-lift-end-carrier',<>{[-1,1].map(side=><mesh key={side} position={[side*25-1.5,joint.lowerMoving[1],joint.lowerMoving[2]]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[shapes.end,options]}/><meshStandardMaterial {...material('pick-lift-end-carrier','#7e8995')}/></mesh>)}</>)}
 {tag('pick-lift-pivot-pins',<>{[joint.lowerFixed,joint.upperFixed,joint.lowerMoving,joint.upperMoving].map((p,i)=><group key={i} position={[...p]}><mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[G.pinRadius,G.pinRadius,56,24]}/><meshStandardMaterial {...material('pick-lift-pivot-pins','#bec6cc')}/></mesh>{[-1,1].map(side=><mesh key={side} position={[side*28,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[3.8,3.8,2,24]}/><meshStandardMaterial {...material('pick-lift-pivot-pins','#85929f')}/></mesh>)}</group>)}</>)}
 <group position={[...joint.lowerMoving]}>{tag('pick-lift-palm-mount',<>{[-1,1].map(side=>box('pick-lift-palm-mount',[side*25,0,-17.5],[3,8,35]))}<mesh position={[0,4,-17.5]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.palm,options]}/><meshStandardMaterial {...material('pick-lift-palm-mount')}/></mesh></>)}</group>
 </group>;
}
