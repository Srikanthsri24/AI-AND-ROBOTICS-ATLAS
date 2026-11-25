import {memo,useMemo,type ReactNode}from'react';
import {Text}from'@react-three/drei';
import {BufferGeometry,Float32BufferAttribute,Quaternion,Vector3}from'three';
import {floodDrillPose,floodNeighbourhood as d}from'../data/flood-neighbourhood';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function FloodNeighbourhood({selected,select,progress=0}:{selected:string;select:(id:string)=>void;progress?:number}){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(at:[number,number,number],size:[number,number,number],color:string)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.8}/></mesh>;
 const house=(id:string,x:number,y:number,z:number,shelter=false)=><group position={[x,y,z]}>{box([0,12,0],[shelter?44:36,24,shelter?36:28],c(id,shelter?'#e2e8e0':'#dcc4a1'))}<mesh position={[0,29,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[shelter?33:27,15,4]}/><meshStandardMaterial color={c(id,shelter?'#426d79':'#b2775f')} roughness={.8}/></mesh>{box([0,8,shelter?18.3:14.3],[7,16,.6],c(id,'#6c5a59'))}{[-1,1].map(side=><group key={side}>{box([side*(shelter?14:11),14,shelter?18.4:14.4],[7,7,.7],c(id,'#79a7b5'))}{box([side*(shelter?14:11),14,shelter?18.9:14.9],[.7,7,.2],c(id,'#e9e4d5'))}</group>)}{shelter&&<Text position={[0,22,18.9]} font={font} fontSize={3} color="#314b66">SHELTER</Text>}</group>;
 const ramp=useMemo(()=>{const p=[[-15,0,65],[15,0,65],[15,1,65],[-15,1,65],[-15,0,-15],[15,0,-15],[15,33,-15],[-15,33,-15]],g=new BufferGeometry(),indices=[0,2,1,0,3,2,4,5,6,4,6,7,3,7,6,3,6,2,0,1,5,0,5,4,0,4,7,0,7,3,1,2,6,1,6,5];g.setAttribute('position',new Float32BufferAttribute(indices.reverse().flatMap(i=>p[i]),3));g.computeVertexNormals();return g;},[]);
 const person=floodDrillPose(progress);
 return <group position={d.at}>
 {tag('flood-map',<>{box([0,-.5,0],[d.width,1,d.length],c('flood-map','#eee9df'))}<Text position={[-118,.2,-100]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={5} anchorX="left" color="#3f4569">TABLETOP PRACTICE ROUTE</Text></>)}
 {tag('flood-home',house('flood-home',-75,0,65))}
 {tag('flood-high-ground',<>{box(d.platform.at,d.platform.size,c('flood-high-ground','#8b9c7a'))}<mesh position={[25,0,0]} geometry={ramp} receiveShadow castShadow><meshStandardMaterial color={c('flood-high-ground','#b4ad99')} roughness={.85}/></mesh>{[-1,1].map(s=><group key={s}>{box([25+s*15,20,-15],[1.5,26,1.5],c('flood-high-ground','#718076'))}{box([25+s*15,5,65],[1.5,10,1.5],c('flood-high-ground','#718076'))}</group>)}</>)}
 {tag('flood-shelter',house('flood-shelter',65,33,-55,true))}
 {tag('flood-route',<>{d.route.slice(1).map((point,i)=>{const a=new Vector3(...d.route[i]),b=new Vector3(...point),direction=b.clone().sub(a),mid=a.clone().add(b).multiplyScalar(.5);return <mesh key={i} position={mid.add(new Vector3(0,.15,0))} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.clone().normalize())}><cylinderGeometry args={[.8,.8,direction.length(),8]}/><meshStandardMaterial color={c('flood-route','#7956bc')} roughness={.6}/></mesh>;})}</>)}
 {tag('flood-person',<group name="flood-drill-person" position={person}>{[-1,1].map(s=><group key={s}><mesh position={[s*2.2,4,0]}><cylinderGeometry args={[1.2,1.2,8,12]}/><meshStandardMaterial color={c('flood-person','#334962')} roughness={.7}/></mesh>{box([s*2.2,.8,1],[3,1.6,5],c('flood-person','#283547'))}</group>)}<mesh position={[0,12,0]} castShadow><cylinderGeometry args={[4,3.5,8,16]}/><meshStandardMaterial color={c('flood-person','#d9a453')} roughness={.7}/></mesh><mesh position={[0,20,0]} castShadow><sphereGeometry args={[3.4,20,14]}/><meshStandardMaterial color={c('flood-person','#d4ac8a')} roughness={.75}/></mesh>{[-1,1].map(s=><mesh key={s} position={[s*4.5,11,0]} rotation={[0,0,s*.15]}><cylinderGeometry args={[1.1,1.1,9,12]}/><meshStandardMaterial color={c('flood-person','#d9a453')} roughness={.7}/></mesh>)}</group>)}
 </group>;
}
export default memo(FloodNeighbourhood);
