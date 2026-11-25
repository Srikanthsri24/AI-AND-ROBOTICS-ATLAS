import type{}from'@react-three/fiber';
import{memo,useMemo,type ReactNode}from'react';
import{Shape,Path}from'three';
import{aquaPhysical as d,aquaRampStart as a,aquaRampEnd as b,aquaRampLength as length,aquaBasketFloor as floor}from'../data/aquaclean-layout';
type P=[number,number,number];
function AquacleanMechanicalParts({selected,select,rotorDegrees=0}:{selected:string;select:(id:string)=>void;rotorDegrees?:number}){
 const bearing=useMemo(()=>{const shape=new Shape();shape.absarc(0,0,8,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,2.7,0,Math.PI*2,true);shape.holes.push(hole);return shape;},[]);
 const wall=useMemo(()=>{const shape=new Shape();shape.moveTo(-250,8);shape.lineTo(250,8);shape.lineTo(250,105);shape.lineTo(-250,105);shape.closePath();const hole=new Path();hole.absarc(-35,70,3.2,0,Math.PI*2,true);shape.holes.push(hole);return shape;},[]);
 const color=(id:string,base:string)=>selected===id?'#b78be8':base,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(at:P,size:P,c:string,clear=false)=><mesh position={at} castShadow={!clear} receiveShadow><boxGeometry args={size}/>{clear?<meshPhysicalMaterial color={c} transparent opacity={.23} roughness={.15} depthWrite={false} ior={1.49}/>:<meshStandardMaterial color={c} roughness={.55}/>}</mesh>;
 const shaft=(at:P,r:number,l:number,c:string)=><mesh position={at} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[r,r,l,32]}/><meshStandardMaterial color={c} metalness={.75} roughness={.3}/></mesh>;
 return <>
 {tag('aqua-tray',<>{box([0,5,0],[504,6,184],color('aqua-tray','#c0d9df'),true)}{[-1,1].map(s=><group key={s}>{box([s*251,56.5,0],[2,97,184],color('aqua-tray','#c0d9df'),true)}<mesh position={[0,0,s*91-1]}><extrudeGeometry args={[wall,{depth:2,bevelEnabled:false,curveSegments:32}]}/><meshPhysicalMaterial color={color('aqua-tray','#c0d9df')} transparent opacity={.23} roughness={.15} depthWrite={false} ior={1.49}/></mesh>{box([0,105,s*91],[504,3,3],color('aqua-tray','#8cabb5'))}</group>)}</>)}
 {tag('aqua-water',<mesh position={[0,18,0]}><boxGeometry args={[499,20,179]}/><meshPhysicalMaterial color={color('aqua-water','#438d9f')} transparent opacity={.35} roughness={.14} ior={1.333} depthWrite={false}/></mesh>)}
 {tag('aqua-ramp',<group position={[(a.x+b.x)/2,(a.y+b.y)/2,0]} rotation={[0,0,Math.atan(d.ramp.slope)]}>{box([0,-1.5,0],[length,3,d.ramp.width],color('aqua-ramp','#b7c4c6'))}</group>)}
 {tag('aqua-ramp-rails',<group position={[(a.x+b.x)/2,(a.y+b.y)/2,0]} rotation={[0,0,Math.atan(d.ramp.slope)]}>{[-1,1].map(s=><group key={s}>{box([0,5,s*51],[length,10,2],color('aqua-ramp-rails','#6c8490'))}</group>)}</group>)}
 {tag('aqua-basket',<>{Array.from({length:17},(_,i)=><group key={i}>{box([135+i*5,floor-1,0],[.8,1,100],color('aqua-basket','#a1aeb0'))}</group>)}{Array.from({length:21},(_,i)=><group key={i}>{box([175,floor-1,-50+i*5],[80,1,.8],color('aqua-basket','#a1aeb0'))}</group>)}{[-1,1].map(s=><group key={s}>{box([175,floor+55,s*50],[82,2,2],color('aqua-basket','#788f96'))}{Array.from({length:17},(_,i)=><group key={i}>{box([135+i*5,floor+27,s*50],[.8,55,.8],color('aqua-basket','#9caeb3'))}</group>)}</group>)}{Array.from({length:21},(_,i)=><group key={i}>{box([215,floor+27,-50+i*5],[.8,55,.8],color('aqua-basket','#9caeb3'))}</group>)}{box([215,floor+55,0],[2,2,102],color('aqua-basket','#788f96'))}</>)}
 {tag('aqua-basket-legs',<>{[143,207].flatMap(x=>[-43,43].map(z=><group key={`${x}/${z}`}>{box([x,(floor+8)/2,z],[4,floor-8,4],color('aqua-basket-legs','#697f8d'))}{box([x,9,z],[12,2,12],color('aqua-basket-legs','#879aa5'))}</group>))}</>)}
 <group position={[d.paddle.x,d.paddle.y,0]} rotation={[0,0,rotorDegrees*Math.PI/180]}>
 {tag('aqua-paddle-hub',<>{shaft([0,0,0],2.5,220,color('aqua-paddle-hub','#aab5ba'))}{shaft([0,0,0],9,92,color('aqua-paddle-hub','#6e7e92'))}{[-1,1].map(s=><group key={s}>{shaft([0,0,s*43],13,3,color('aqua-paddle-hub','#97a4ad'))}</group>)}</>)}
 {tag('aqua-paddle-strips',<>{[0,1,2,3].map(n=><group key={n} rotation={[0,0,n*Math.PI/2]}>{box([0,-27,0],[2,36,90],color('aqua-paddle-strips',n%2?'#63a9af':'#8bb8bc'))}{[-30,0,30].map(z=><group key={z}><mesh position={[1.7,-11,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1,1,2,16]}/><meshStandardMaterial color={color('aqua-paddle-strips','#b7bdb5')} metalness={.7} roughness={.3}/></mesh></group>)}</group>)}</>)}
 </group>
 {tag('aqua-paddle-support',<>{[-1,1].map(s=><group key={s}>{box([-35,4,s*106],[40,8,28],color('aqua-paddle-support','#9aa5b5'))}{box([-35,34,s*106],[14,60,12],color('aqua-paddle-support','#718394'))}<mesh position={[-35,70,s*106-6]}><extrudeGeometry args={[bearing,{depth:12,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={color('aqua-paddle-support','#6b7f8e')} metalness={.65} roughness={.35}/></mesh></group>)}</>)}
 </>;
}
export default memo(AquacleanMechanicalParts);
