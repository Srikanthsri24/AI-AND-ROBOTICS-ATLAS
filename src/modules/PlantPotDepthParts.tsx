import {Color,DoubleSide} from 'three';

type Point=[number,number,number];
const terracotta='#b67355';
const dry=new Color('#836447');
const damp=new Color('#463329');

export function DepthComparisonPot({cutaway=false,upper=25,lower=25,selected=false}:{cutaway?:boolean;upper?:number;lower?:number;selected?:boolean}){
  const start=cutaway?Math.PI/2:0;
  const sweep=cutaway?Math.PI:Math.PI*2;
  const layers:{at:Point;top:number;bottom:number;height:number;moisture:number}[]=[
    {at:[0,.38,0],top:.49,bottom:.40,height:.47,moisture:lower},
    {at:[0,.85,0],top:.59,bottom:.49,height:.47,moisture:upper},
  ];
  return <>
    <mesh position={[0,.06,0]}><cylinderGeometry args={[.70,.65,.10,48]}/><meshStandardMaterial color="#855747" roughness={.75}/></mesh>
    <mesh position={[0,.63,0]}><cylinderGeometry args={[.64,.42,1.08,48,1,true,start,sweep]}/><meshStandardMaterial color={selected?'#dc9665':terracotta} side={DoubleSide} roughness={.81}/></mesh>
    <mesh position={[0,1.16,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.636,.036,12,48,sweep]}/><meshStandardMaterial color={terracotta} roughness={.70}/></mesh>
    {layers.map(({at,top,bottom,height,moisture},i)=>{
      const color=dry.clone().lerp(damp,moisture/100);
      return <group key={i}>
        <mesh position={at}><cylinderGeometry args={[top,bottom,height,48,1,false,start,sweep]}/><meshStandardMaterial color={color} roughness={.98} side={DoubleSide}/></mesh>
        {cutaway&&<mesh position={[0,at[1],.002]}><planeGeometry args={[bottom*2,height]}/><meshStandardMaterial color={color} roughness={.98} side={DoubleSide}/></mesh>}
        {(cutaway||i===1)&&Array.from({length:45},(_,grain)=>{
          const angle=start+sweep*((grain*.61803398875)%1);
          const radius=top*.97*Math.sqrt(grain/45);
          return <mesh key={grain} position={[Math.sin(angle)*radius,at[1]+height/2+.008,Math.cos(angle)*radius]} rotation={[grain,.72,.3]}>
            <icosahedronGeometry args={[.011+grain%6*.004,0]}/><meshStandardMaterial color={grain%8===0?'#bdac91':color} roughness={1}/>
          </mesh>;
        })}
      </group>;
    })}
  </>;
}
