import{useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Shape,Path}from'three';
function ring(outer:number,inner:number,hex=false){const s=new Shape();if(hex){for(let n=0;n<6;n++){const a=n*Math.PI/3;n?s.lineTo(outer*Math.cos(a),outer*Math.sin(a)):s.moveTo(outer,0);}s.closePath();}else s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}
const extrusion:Record<number,{depth:number;bevelEnabled:boolean;curveSegments:number}>=Object.fromEntries([.5,.6,.7,2,3,8.5].map(depth=>[depth,{depth,bevelEnabled:false,curveSegments:32}]));
/** Nominal threaded-fastener envelopes; fine thread flanks are omitted. Native mm. */
export default function PickRoverCasterRetention({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const s=useMemo(()=>({axleWasher:ring(2.2,1.25),axleNut:ring(2.35,1.25,true),stemWasher:ring(5,3.1),stemNut:ring(5.5,3.05,true),bearing:ring(4.5,3.1)}),[]);
 const mat=(id:string,color='#aeb7bf')=>({color:selected===id?'#c4a2ff':color,metalness:.7,roughness:.36});
 const tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const sleeve=(id:string,shape:Shape,depth:number,position:[number,number,number],axis:'x'|'y')=><mesh position={position} rotation={axis==='x'?[0,Math.PI/2,0]:[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shape,extrusion[depth]]}/><meshStandardMaterial {...mat(id)}/></mesh>;
 return <group name="pick-rover-caster-retention">
 {tag('pick-rover-caster-axle',<><mesh position={[1.5,10,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.2,1.2,19.6,24]}/><meshStandardMaterial {...mat('pick-rover-caster-axle')}/></mesh><mesh position={[-8.9,10,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[2.35,2.35,1.2,6]}/><meshStandardMaterial {...mat('pick-rover-caster-axle')}/></mesh></>)}
 {tag('pick-rover-caster-axle-washer',sleeve('pick-rover-caster-axle-washer',s.axleWasher,.5,[8.3,10,0],'x'))}
 {tag('pick-rover-caster-axle-nut',sleeve('pick-rover-caster-axle-nut',s.axleNut,2,[8.8,10,0],'x'))}
 {tag('pick-rover-caster-stem',<><mesh position={[0,32.9,0]}><cylinderGeometry args={[3,3,20,32]}/><meshStandardMaterial {...mat('pick-rover-caster-stem')}/></mesh><mesh position={[0,22.3,0]}><cylinderGeometry args={[4.5,4.5,1.2,6]}/><meshStandardMaterial {...mat('pick-rover-caster-stem')}/></mesh></>)}
 {tag('pick-rover-caster-lower-washer',sleeve('pick-rover-caster-lower-washer',s.stemWasher,.6,[0,22.9,0],'y'))}
 {tag('pick-rover-caster-bearing',sleeve('pick-rover-caster-bearing',s.bearing,8.5,[0,26.5,0],'y'))}
 {tag('pick-rover-caster-top-washer',sleeve('pick-rover-caster-top-washer',s.stemWasher,.7,[0,38,0],'y'))}
 {tag('pick-rover-caster-stem-nut',sleeve('pick-rover-caster-stem-nut',s.stemNut,3,[0,38.7,0],'y'))}
 </group>;
}
