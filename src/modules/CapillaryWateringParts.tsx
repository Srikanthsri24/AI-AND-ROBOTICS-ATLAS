import {Color,DoubleSide,Vector3} from 'three';
import {Line} from '@react-three/drei';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const dry=new Color('#997859');
const damp=new Color('#594032');

export function CottonWick({points,wet=false,selected=false}:{points:Point[];wet?:boolean;selected?:boolean}){
  const braid=['#e2b378','#ead6ad','#c8ae86'];
  return <>{braid.map((color,wire)=>{
    const strand=points.flatMap((point,segment)=>{
      if(segment===points.length-1)return [point];
      const from=new Vector3(...point),to=new Vector3(...points[segment+1]);
      return Array.from({length:14},(_,step)=>{
        const at=from.clone().lerp(to,step/14);
        const angle=(segment*14+step)*1.04+wire*2.094;
        return [at.x+Math.cos(angle)*.012,at.y,at.z+Math.sin(angle)*.012] as Point;
      });
    });
    return <Line key={color} points={strand} color={wet?(selected?'#66c6ca':'#568f94'):selected?'#ffd796':color} lineWidth={2.5}/>;
  })}</>;
}

export function RaisedSoilCup({moisture=32,water=65,selected=false}:{moisture?:number;water?:number;selected?:boolean}){
  const soil=dry.clone().lerp(damp,moisture/100);
  const waterHeight=.45*water/100;
  return <>
    <Box at={[0,.063,0]} size={[1.87,.12,1.31]} color={selected?'#c39c79':'#647b82'}/>
    {[-.91,.91].map(x=><Box key={x} at={[x,.35,0]} size={[.045,.49,1.29]} color="#91aeba"/>)}
    <Box at={[0,.35,-.63]} size={[1.85,.49,.043]} color="#9ab5bf"/>
    <mesh position={[0,.35,.63]} renderOrder={4}><boxGeometry args={[1.85,.49,.043]}/><meshPhysicalMaterial color="#b5d7e1" transparent opacity={.24} depthWrite={false} roughness={.22}/></mesh>
    {waterHeight>0&&<mesh position={[0,.13+waterHeight/2,0]}><boxGeometry args={[1.78,waterHeight,1.18]}/><meshPhysicalMaterial color="#68afc9" transparent opacity={.70} depthWrite={false} clearcoat={.76} roughness={.22}/></mesh>}
    {[-.65,.65].flatMap(x=>[-.42,.42].map(z=><Box key={x+','+z} at={[x,.40,z]} size={[.071,.58,.071]} color="#b5bcc0" metal={.45}/>))}
    {[-.30,.30].map(z=><Box key={z} at={[0,.71,z]} size={[1.31,.088,.095]} color="#778a8f" metal={.42}/>)}
    <mesh position={[0,.966,0]}><cylinderGeometry args={[.49,.38,.48,44]}/><meshStandardMaterial color={soil} roughness={.97}/></mesh>
    <mesh position={[0,1.01,0]} renderOrder={3}><cylinderGeometry args={[.525,.40,.57,48,1,true]}/><meshPhysicalMaterial color="#d0e4e4" transparent opacity={.34} roughness={.32} depthWrite={false} side={DoubleSide}/></mesh>
    <mesh position={[0,1.30,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.526,.022,12,48]}/><meshStandardMaterial color="#c4d7d9"/></mesh>
    {Array.from({length:49},(_,i)=>{
      const radius=.474*Math.sqrt(i/49),angle=i*2.39996;
      return <mesh key={i} position={[radius*Math.cos(angle),1.216,radius*Math.sin(angle)]}><icosahedronGeometry args={[.008+i%7*.004,0]}/><meshStandardMaterial color={i%8===0?'#ada08a':soil} roughness={1}/></mesh>;
    })}
  </>;
}
