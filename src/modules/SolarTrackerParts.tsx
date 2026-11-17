import { useEffect, useMemo } from 'react';
import { DataTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
export function TrackerServo({at=[0,0,0],selected=false,vertical=false}:{at?:Point;selected?:boolean;vertical?:boolean}){
  return <group position={at} rotation={vertical?[0,0,Math.PI/2]:[0,0,0]}>
    <Box at={[0,0,0]} size={[.65,.45,.43]} color={selected?'#ce9c43':'#202a35'}/>
    <Box at={[0,.113,0]} size={[.84,.071,.20]} color="#333d47"/>
    <Box at={[.016,-.04,.222]} size={[.41,.15,.014]} color="#476f9e"/>
    <mesh position={[.19,.24,0]}><cylinderGeometry args={[.112,.11,.16,24]}/><meshStandardMaterial color="#d2d5d7" metalness={.54} roughness={.42}/></mesh>
  </group>;
}
export function TrackerBracket(){
  return <>
    <Box at={[0,-.38,0]} size={[1.36,.12,1.12]} color="#272e36"/>
    <TrackerServo at={[-.19,-.14,0]}/>
    <Box at={[0,.16,0]} size={[.90,.10,.73]} color="#303943"/>
    {[-.42,.42].map(x=><Box key={x} at={[x,.46,0]} size={[.10,.59,.22]} color="#353f47"/>)}
    <TrackerServo at={[.38,.50,0]} vertical/>
  </>;
}
export function LightQuadrants({values=[650,650,650,650],selected=false}:{values?:number[];selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[.79,.055,.68]} color={selected?'#d1a450':'#9a724e'}/>
    <Box at={[0,.14,0]} size={[.031,.29,.63]} color="#362f2b"/>
    <Box at={[0,.14,0]} size={[.74,.29,.031]} color="#362f2b"/>
    {values.map((value,i)=><group key={i} position={[i%2?.215:-.215,.045,i<2?-.19:.19]}>
      <mesh><cylinderGeometry args={[.075,.07,.034,16]}/><meshStandardMaterial color="#a9805d" emissive="#e6a05b" emissiveIntensity={value/1100}/></mesh>
      {[-.036,0,.036].map(x=><Box key={x} at={[x,.019,0]} size={[.009,.006,.091]} color="#422d26"/>)}
    </group>)}
  </>;
}


export function TrackerPanel({light=60,selected=false}:{light?:number;selected?:boolean}){
  const texture=useMemo(()=>{
    const size=32;
    const pixels=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const dot=((x%8-3.5)**2+(y%8-3.5)**2)<5;
      const glint=dot?10:0;
      pixels.set([44+glint,56+glint,75+glint,255],(y*size+x)*4);
    }
    const face=new DataTexture(pixels,size,size);
    face.wrapS=face.wrapT=RepeatWrapping;
    face.repeat.set(9,9);
    face.colorSpace=SRGBColorSpace;
    face.needsUpdate=true;
    return face;
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <>
    <Box at={[0,0,0]} size={[1.58,.072,1.55]} color={selected?'#d6af63':'#aab4bd'} metal={.36}/>
    <mesh position={[0,.038,0]} rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[1.52,1.49]}/>
      <meshPhysicalMaterial map={texture} color="#c7d1df" emissive="#151e30" emissiveIntensity={light/135} roughness={.50} clearcoat={.38}/>
    </mesh>
    {[-.48,-.24,0,.24,.48].map(x=><Box key={x} at={[x,.040,0]} size={[.006,.003,1.48]} color="#303b53"/>)}
  </>;
}
