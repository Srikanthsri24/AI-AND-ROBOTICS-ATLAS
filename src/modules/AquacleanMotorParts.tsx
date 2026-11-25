import type{}from'@react-three/fiber';
import{memo,useMemo,type ReactNode}from'react';
import{aquaCouplingGeometry}from'./aquaclean-coupling-geometry';
import{Shape,Path}from'three';
import{aquaMotorLayout as d}from'../data/aquaclean-layout';
type P=[number,number,number];
function AquacleanMotorParts({selected,select,rotorDegrees=0}:{selected:string;select:(id:string)=>void;rotorDegrees?:number}){
 const shapes=useMemo(()=>{const ring=(outer:number,inner:number)=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;};const rect=(x:number,y:number,w:number,h:number,holes:[number,number,number][])=>{const s=new Shape();s.moveTo(x,y);s.lineTo(x+w,y);s.lineTo(x+w,y+h);s.lineTo(x,y+h);s.closePath();for(const[a,b,r]of holes){const hole=new Path();hole.absarc(a,b,r,0,Math.PI*2,true);s.holes.push(hole);}return s;};return{large:ring(5,2.7),small:ring(5,1.6),housing:rect(-80,59,50,22,[[-35,70,1.8]]),ear:ring(4,1.2),shelf:rect(-83,130,60,42,d.mountX.map(x=>[x,d.mountZ,1.2]))};},[]);
 const coupling=useMemo(()=>[aquaCouplingGeometry(2.7,118,130,123),aquaCouplingGeometry(1.6,130,134,132)],[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(at:P,size:P,color:string)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.55}/></mesh>;
 const cyl=(at:P,r:number,len:number,color:string,axis:'x'|'y'|'z'='z')=><mesh position={at} rotation={axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0]} castShadow><cylinderGeometry args={[r,r,len,32]}/><meshStandardMaterial color={color} metalness={.75} roughness={.3}/></mesh>;
 const shape=(s:Shape,depth:number,color:string)=><><extrudeGeometry args={[s,{depth,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={color} metalness={.5} roughness={.4}/></>;
 return <>
 <group position={[0,d.axis[1]-70,0]}>
 {tag('aqua-drive-case',<><mesh position={[0,0,d.caseFrontZ]}>{shape(shapes.housing,22,c('aqua-drive-case','#dfba47'))}</mesh>{d.mountX.map(x=><group key={x}><mesh position={[x,56,d.mountZ]} rotation={[-Math.PI/2,0,0]}>{shape(shapes.ear,3,c('aqua-drive-case','#cfaa37'))}</mesh>{box([x,57.5,156],[7,3,4],c('aqua-drive-case','#dfba47'))}</group>)}{[136,154].map(z=><group key={z}>{box([-57,81.7,z],[40,1.4,1.5],c('aqua-drive-case','#edcf6d'))}</group>)}{[-76,-40].map(x=><group key={x}>{cyl([x,75,157],1.5,2,c('aqua-drive-case','#b9b5a6'))}</group>)}</>)}
 {tag('aqua-drive-can',<>{cyl([-90,70,145],7.5,20,c('aqua-drive-can','#b1b7b9'),'x')}{cyl([-101,70,145],7.7,2,c('aqua-drive-can','#494c56'),'x')}{[-1,1].map(s=><group key={s}>{box([-103,70+s*4,145],[2,1.5,3],c('aqua-drive-can','#b6a574'))}</group>)}{[-2,2].map(y=><group key={y}>{box([-101.2,70+y,150],[.6,1.4,3],c('aqua-drive-can','#252e37'))}</group>)}</>)}
 {tag('aqua-drive-shaft',<group name="aqua-output-rotor" position={[-35,70,0]} rotation={[0,0,rotorDegrees*Math.PI/180]}>{cyl([0,0,134],1.5,8,c('aqua-drive-shaft','#b9bec2'))}</group>)}
 <group name="aqua-coupler-rotor" position={[-35,70,0]} rotation={[0,0,rotorDegrees*Math.PI/180]}>
 {tag('aqua-drive-coupler',<>{coupling.map((geometry,n)=><mesh key={n} geometry={geometry}><meshStandardMaterial color={c('aqua-drive-coupler','#879cae')} metalness={.65} roughness={.32}/></mesh>)}</>)}
 {tag('aqua-drive-screws',<>{[123,132].map(z=><group key={z}>{cyl([0,((z===123?2.45:1.45)+6)/2,z],.7,6-(z===123?2.45:1.45),c('aqua-drive-screws','#727d8a'),'y')}{box([0,6.05,z],[.5,.1,1],c('aqua-drive-screws','#343e4b'))}</group>)}</>)}
 </group>
 </group>
 {tag('aqua-drive-bracket',<>{box([-53,3,145],[70,6,42],c('aqua-drive-bracket','#91a0ad'))}{[-77,-29].map(x=><group key={x}>{box([x,(d.bracketTopY-5+6)/2,145],[5,d.bracketTopY-11,24],c('aqua-drive-bracket','#6c8193'))}</group>)}<mesh position={[0,d.bracketTopY,0]} rotation={[Math.PI/2,0,0]}>{shape(shapes.shelf,5,c('aqua-drive-bracket','#8799aa'))}</mesh></>)}
 <group position={[0,d.axis[1]-70,0]}>{tag('aqua-drive-bolts',<>{d.mountX.map(x=><group key={x}>{cyl([x,54,d.mountZ],.9,12,c('aqua-drive-bolts','#bbc3c5'),'y')}{cyl([x,60.5,d.mountZ],2,1.5,c('aqua-drive-bolts','#a2adb4'),'y')}{box([x,61.3,d.mountZ],[2,.2,.5],c('aqua-drive-bolts','#465462'))}</group>)}</>)}
 </group>
 </>;
}
export default memo(AquacleanMotorParts);
