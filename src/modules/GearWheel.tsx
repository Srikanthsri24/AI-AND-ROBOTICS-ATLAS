import {memo,useMemo} from 'react';
import {Path,Shape} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';

function gearOutline(teeth:number,pitch:number) {
  const outline=new Shape();
  const step=2*Math.PI/teeth;
  const profile:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[
    [-.50,pitch-.085],[-.28,pitch-.085],[-.17,pitch+.061],[.17,pitch+.061],[.28,pitch-.085],[.50,pitch-.085],
  ];
  for(let tooth=0;tooth<teeth;tooth++){
    profile.forEach(([offset,radius],i)=>{
      const angle=(tooth+offset)*step;
      const point:[number,number]=[Math.cos(angle)*radius,Math.sin(angle)*radius];
      if(tooth===0&&i===0)outline.moveTo(...point);
      else if(i!==0)outline.lineTo(...point);
    });
  }
  outline.closePath();
  if(teeth===36){
    for(let hole=0;hole<8;hole++){
      const angle=hole*Math.PI/4;
      const path=new Path();
      path.absarc(Math.cos(angle)*.76,Math.sin(angle)*.76,.13,0,Math.PI*2,true);
      outline.holes.push(path);
    }
  }
  return outline;
}

export const GearWheel=memo(function GearWheel({teeth,pitch,metal,highlight,highlightColor='#d7a366'}:{teeth:number;pitch:number;metal:boolean;highlight:boolean;highlightColor?:string}) {
  const shape=useMemo(()=>gearOutline(teeth,pitch),[teeth,pitch]);
  return <>
    <mesh castShadow>
      <extrudeGeometry args={[shape,{depth:metal?.16:.11,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,steps:1}]}/>
      <meshStandardMaterial color={highlight?highlightColor:metal?'#b49460':'#e0ddc8'} metalness={metal?.67:.12} roughness={metal?.34:.48}/>
    </mesh>
    <mesh position={[0,0,.19]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[metal?.16:.23,metal?.16:.23,.18,32]}/>
      <meshStandardMaterial color={metal?"#ba9c6f":"#9da6aa"} metalness={.66} roughness={.39}/>
    </mesh>
    {!metal&&Array.from({length:6},(_,i)=>{
      const a=i*Math.PI/3;
      return <mesh key={i} position={[Math.cos(a)*.19,Math.sin(a)*.19,.285]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.029,.029,.025,6]}/><meshStandardMaterial color="#5c6570" metalness={.7}/>
      </mesh>;
    })}
    <group rotation={[0,0,metal?0:-Math.PI/36]}>
      <Box at={[0,pitch-.18,.172]} size={[.042,.155,.023]} color={metal?'#f3ae4a':'#315e80'}/>
    </group>
  </>;
});
