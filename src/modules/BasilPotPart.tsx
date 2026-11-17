import {useMemo} from 'react';
import {Line} from '@react-three/drei';
import {DoubleSide,Float32BufferAttribute,BufferGeometry} from 'three';

const tiers=[
  {height:.63,length:.52,angle:.2},
  {height:.83,length:.58,angle:1.45},
  {height:1.04,length:.47,angle:2.9},
  {height:1.20,length:.35,angle:4.2},
  {height:1.33,length:.24,angle:5.65},
];

export function BasilPotPart({moisture=45,selected=false}:{moisture?:number;selected?:boolean}){
  const leaf=useMemo(()=>{
    const positions:number[]=[],indices:number[]=[];
    for(let row=0;row<=12;row++){
      const t=row/12;
      for(let column=0;column<=6;column++){
        const u=column/3-1;
        const width=Math.pow(Math.sin(Math.PI*t),.84)*(.235-.105*t);
        positions.push(t,.18*Math.sin(Math.PI*t)-.17*t*t-.14*u*u*Math.sin(Math.PI*t),u*width);
        if(row<12&&column<6){
          const i=row*7+column;
          indices.push(i,i+1,i+7,i+1,i+8,i+7);
        }
      }
    }
    const geometry=new BufferGeometry();
    geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  },[]);
  return <group>
    <mesh position={[0,.045,0]}><cylinderGeometry args={[.59,.55,.085,48]}/><meshStandardMaterial color="#794838" roughness={.78}/></mesh>
    <mesh position={[0,.31,0]}><cylinderGeometry args={[.49,.34,.49,48]}/><meshStandardMaterial color={selected?'#cf865c':'#ad624a'} roughness={.82}/></mesh>
    <mesh position={[0,.548,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.477,.034,12,48]}/><meshStandardMaterial color="#be7555" roughness={.7}/></mesh>
    <mesh position={[0,.553,0]}><cylinderGeometry args={[.455,.455,.012,48]}/><meshStandardMaterial color={moisture>45?'#3c3027':'#746047'} roughness={1}/></mesh>
    {Array.from({length:53},(_,i)=>{
      const angle=i*2.39996,radius=.425*Math.sqrt(i/53);
      return <mesh key={i} position={[radius*Math.cos(angle),.565,radius*Math.sin(angle)]} rotation={[.3,i,0]}><icosahedronGeometry args={[.008+(i%7)*.0018,0]}/><meshStandardMaterial color={i%9===0?'#d0c8af':i%2?'#564032':'#8b755b'} roughness={.96}/></mesh>;
    })}
    <Line points={[[0,.55,0],[-.025,.86,0],[.034,1.09,-.028],[.022,1.38,-.07]]} lineWidth={2} color="#638842"/>
    {tiers.flatMap(({height,length,angle},index)=>[0,Math.PI].map((side,sideIndex)=>{
      const yaw=angle+side;
      const scale=length*(sideIndex?.91:1);
      return <group key={height+side} position={[.025,height,-.022]} rotation={[0,yaw,.24-index*.023]}>
        <Line points={[[0,0,0],[.09,.04,0],[scale*.26,scale*.10,0]]} lineWidth={1.4} color="#79a543"/>
        <group position={[.075,.025,0]} scale={[scale,scale,scale]}>
          <mesh geometry={leaf}><meshPhysicalMaterial color={index%2?'#427c37':'#4d8b3d'} side={DoubleSide} roughness={.57} clearcoat={.12}/></mesh>
          <Line points={[[0,.005,0],[.25,.125,0],[.50,.143,0],[.75,.033,0],[.98,-.144,0]]} lineWidth={1} color="#79a359"/>
        </group>
      </group>;
    }))}
  </group>;
}
