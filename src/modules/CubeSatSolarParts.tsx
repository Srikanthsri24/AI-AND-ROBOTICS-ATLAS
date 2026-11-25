import type {} from '@react-three/fiber';
import {useMemo,type ReactNode} from 'react';
import {Shape,Path} from 'three';
import {cubeSatSolarMounts,cubeSatSolarAngle} from '../data/cubesat-solar';
type P=[number,number,number];
export default function CubeSatSolarParts({selected='',select=()=>{},deployment=0}:{selected?:string;select?:(id:string)=>void;deployment?:number}){
 const shapes=useMemo(()=>{const poly=(points:number[][])=>{const s=new Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;},bore=(s:Shape,x:number,y:number,r:number)=>{const p=new Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);},ring=(outer:number,inner:number)=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);bore(s,0,0,inner);return s;},nut=new Shape();for(let i=0;i<6;i++){const x=Math.cos(i*Math.PI/3)*2,y=Math.sin(i*Math.PI/3)*2;i?nut.lineTo(x,y):nut.moveTo(x,y);}nut.closePath();bore(nut,0,0,1.2);return cubeSatSolarMounts.map(m=>{const ear=poly([[-7,-3],[7,-3],[7,3],[-7,3]]);bore(ear,-4*m.side,0,1);bore(ear,3*m.side,0,1.2);const outline=[[3,-45],[70,-45],[70,45],[3,45]],frame=poly(outline.map(([x,y])=>[m.side*x,y])),hole=new Path();for(const[i,[x,y]]of[[6,-42],[6,42],[67,42],[67,-42]].entries()){const xx=m.side*x;i?hole.lineTo(xx,y):hole.moveTo(xx,y);}hole.closePath();frame.holes.push(hole);const cell=poly([[-13.5,-12],[13.5,-12],[14.5,-11],[14.5,11],[13.5,12],[-13.5,12],[-14.5,11],[-14.5,-11]]);return{ear,frame,backing:poly(outline.map(([x,y])=>[m.side*x,y])),cell,nut,knuckle:ring(2,1.2)};});},[]);
 const c=(id:string,color:string)=>id===selected?'#b48bec':color,owner=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const profile=(id:string,s:Shape,at:P,depth:number,color:string,metal=0,rotation:P=[0,0,0])=><mesh position={at} rotation={rotation} castShadow receiveShadow><extrudeGeometry args={[s,{depth,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.32:.6}/></mesh>;
 const box=(id:string,at:P,size:P,color:string,metal=0)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.28:.65}/></mesh>;
 const cylinder=(id:string,at:P,r:number,h:number,color:string,segments=24)=><mesh position={at}><cylinderGeometry args={[r,r,h,segments]}/><meshStandardMaterial color={c(id,color)} metalness={.8} roughness={.3}/></mesh>;
 return <group name="cubesat-solar-assemblies">{cubeSatSolarMounts.map((m,i)=>{const g=shapes[i],id=(p:string)=>(m.side<0?'cubesat-solar-left-':'cubesat-solar-right-')+p;return <group key={m.side}>
 {owner(id('ears'),<>{[32,132].map(y=><group key={y}>{profile(id('ears'),g.ear,[m.side*49,y,m.z],2,'#aab7c5',.8,[-Math.PI/2,0,0])}</group>)}</>)}
 {owner(id('screws'),<>{[32,132].map(y=><group key={y}>{cylinder(id('screws'),[m.x,y-.5,m.z],.7,5,'#abb8c8')}{cylinder(id('screws'),[m.x,y+2.6,m.z],1.6,1.2,'#94a2b5',6)}</group>)}</>)}
 {owner(id('axle'),<>{cylinder(id('axle'),[m.axisX,83.85,m.z],1,105.3,'#b2c0cd')}{cylinder(id('axle'),[m.axisX,31.4,m.z],1.8,1.2,'#96a4b5',6)}</>)}
 {owner(id('nut'),profile(id('nut'),g.nut,[m.axisX,134,m.z],1.6,'#a4b3c3',.8,[-Math.PI/2,0,0]))}
 <group name={'cubesat-solar-pivot-'+m.side} position={[m.axisX,80,m.z]} rotation={[0,cubeSatSolarAngle(m.side,deployment),0]}>
 {owner(id('knuckles'),<>{[-37,0,37].map(y=><group key={y}>{profile(id('knuckles'),g.knuckle,[0,y-5,0],10,'#a6b4c4',.8,[-Math.PI/2,0,0])}{box(id('knuckles'),[m.side*2.2,y,1],[1.6,4,1],'#a6b4c4',.8)}</group>)}</>)}
 {owner(id('frame'),profile(id('frame'),g.frame,[0,0,0],1.5,'#aebac7',.8))}
 {owner(id('backing'),profile(id('backing'),g.backing,[0,0,-1],1,'#ac9464',.45))}
 {owner(id('cells'),<>{[21,52].flatMap(x=>[-27,0,27].map(y=><mesh key={x+'/'+y} position={[m.side*x,y,0]} castShadow><extrudeGeometry args={[g.cell,{depth:.3,bevelEnabled:false}]}/><meshPhysicalMaterial color={c(id('cells'),'#213e69')} metalness={.4} roughness={.2} clearcoat={.7}/></mesh>))}</>)}
 {owner(id('tracks'),<>{[21,52].flatMap(x=>[-27,0,27].map(y=><group key={x+'/'+y}>{Array.from({length:12},(_,k)=>box(id('tracks'),[m.side*x+(k-5.5)*2.15,y,.315],[.07,21,.03],'#adbdcf',.85))}{[-5,5].map(dy=>box(id('tracks'),[m.side*x,y+dy,.325],[27,.28,.05],'#b2c1d1',.85))}</group>))}</>)}
 </group></group>;})}</group>;
}
