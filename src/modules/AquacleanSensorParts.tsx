import{memo,useMemo,type ReactNode}from'react';
import{Shape,Path}from'three';
import Sonar from'./FloodSonarParts';
import{floodSonar}from'../data/flood-workshop-layout';
import{aquaSensorLayout as d,aquaBasketFloor as floor,aquaFollowerPose}from'../data/aquaclean-layout';
type P=[number,number,number];
function AquacleanSensorParts({selected,select,gapMm=200}:{selected:string;select:(id:string)=>void;gapMm?:number}){
 const card=aquaFollowerPose(gapMm),plate=useMemo(()=>{const s=new Shape();s.moveTo(-26,-12);s.lineTo(26,-12);s.lineTo(26,12);s.lineTo(-26,12);s.closePath();for(const[x,z]of floodSonar.holes){const h=new Path();h.absarc(x,z,.85,0,Math.PI*2,true);s.holes.push(h);}return s;},[]);
 const rings=useMemo(()=>{const ring=(a:number,b:number)=>{const s=new Shape();s.absarc(0,0,a,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,b,0,Math.PI*2,true);s.holes.push(h);return s;};return{mount:ring(1.45,.75),slider:ring(2.5,1.2)};},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(at:P,size:P,color:string)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.6}/></mesh>,cyl=(at:P,r:number,l:number,color:string)=><mesh position={at} castShadow><cylinderGeometry args={[r,r,l,24]}/><meshStandardMaterial color={color} metalness={.7} roughness={.3}/></mesh>;
 const top=d.boardY+12;
 return <>
 {tag('aqua-sensor-stand',<>{box([230,4,-120],[46,8,40],c('aqua-sensor-stand','#7c8b9e'))}{box([230,(top+8)/2,-120],[8,top-8,8],c('aqua-sensor-stand','#9ba8b4'))}{box([(230+d.x)/2,top,-120],[230-d.x+8,8,8],c('aqua-sensor-stand','#9ba8b4'))}{box([d.x,top,-63],[8,8,114],c('aqua-sensor-stand','#9ba8b4'))}</>)}
 <group position={[d.x,d.boardY,0]} rotation={[Math.PI/2,0,0]}><Sonar {...{selected,select}} partPrefix="aqua-"/></group>
 {tag('aqua-sensor-mount',<group position={[d.x,d.boardY,0]}><mesh position={[0,8,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[plate,{depth:4,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('aqua-sensor-mount','#768b9e')} metalness={.7} roughness={.4}/></mesh>{floodSonar.holes.map(([x,z])=><group key={`${x}/${z}`} position={[x,0,z]}><mesh position={[0,1.6,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[rings.mount,{depth:6.4,bevelEnabled:false,curveSegments:20}]}/><meshStandardMaterial color={c('aqua-sensor-mount','#ded8c6')} roughness={.8}/></mesh>{cyl([0,6.3,0],.65,13.4,c('aqua-sensor-mount','#b6c0c5'))}{cyl([0,12.8,0],1.6,.6,c('aqua-sensor-mount','#b6c0c5'))}</group>)}</group>)}
 {tag('aqua-follower-guides',<>{[-1,1].map(s=><group key={s}>{cyl([d.guideX,floor+(d.guideHeight-8)/2,s*d.guideZ],1,d.guideHeight+8,c('aqua-follower-guides','#b3c0c8'))}{box([d.guideX,floor-10,s*47],[6,4,22],c('aqua-follower-guides','#79909d'))}{box([d.guideX,floor-3.5,s*47],[4,9,4],c('aqua-follower-guides','#79909d'))}{cyl([d.guideX,floor+d.guideHeight+1,s*d.guideZ],2,2,c('aqua-follower-guides','#7a8da1'))}</group>)}</>)}
 <group position={[0,card.y,0]}>
 {tag('aqua-follower-card',box([d.x,-.6,0],[d.cardWidth,1.2,d.cardLength],c('aqua-follower-card','#e2d8bc')))}
 {tag('aqua-follower-carrier',<>{[-1,1].map(s=><group key={s}><mesh position={[d.guideX,-4,s*d.guideZ]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[rings.slider,{depth:6,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('aqua-follower-carrier','#b3c3c5')} metalness={.5} roughness={.4}/></mesh>{box([(d.x+d.guideX-2)/2,-2,s*39],[d.guideX-d.x-2,2,34],c('aqua-follower-carrier','#819aa4'))}</group>)}</>)}
 </group>
 </>;
}
export default memo(AquacleanSensorParts);
