import type {} from '@react-three/fiber';
import {useMemo,useEffect,type ReactNode} from 'react';
import {Shape,Path,Quaternion,Vector3,DoubleSide,type Texture} from 'three';
import {cubeSatDish,cubeSatDishDepth,cubeSatDishWorld} from '../data/cubesat-ground';
import {cubeSatReflectorGeometry,cubeSatGroundCableCurve} from './cubesat-ground-geometry';
type P=[number,number,number];
export default function CubeSatGroundStationParts({selected='',select=()=>{},receiving=false,image=null,inspectSockets=false}:{selected?:string;select?:(id:string)=>void;receiving?:boolean;image?:Texture|null;inspectSockets?:boolean}){
 const g=useMemo(()=>{const ring=(outer:number,inner:number)=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;},bezel=new Shape();bezel.moveTo(-38,-27);bezel.lineTo(38,-27);bezel.lineTo(38,27);bezel.lineTo(-38,27);bezel.closePath();const h=new Path();h.moveTo(-31,-12);h.lineTo(-31,20);h.lineTo(31,20);h.lineTo(31,-12);h.closePath();bezel.holes.push(h);const sideWall=new Shape();sideWall.moveTo(-7,-27);sideWall.lineTo(7,-27);sideWall.lineTo(7,27);sideWall.lineTo(-7,27);sideWall.closePath();const portHole=new Path();portHole.absarc(1,-10,1.8,0,Math.PI*2,true);sideWall.holes.push(portHole);return{sideWall,saddle:cubeSatReflectorGeometry(8,64,6,1.2).translate(0,0,-.8),dish:cubeSatReflectorGeometry(),mast:ring(4,2.8),collar:ring(3,2),socket:ring(1.6,.8),dielectric:ring(.8,.3),plug:ring(2,1.7),plugCap:ring(2,.75),contact:ring(.3,.25),jacket:ring(.75,.45),bezel};},[]),curve=useMemo(cubeSatGroundCableCurve,[]);
 useEffect(()=>()=>{g.dish.dispose();g.saddle.dispose();},[g]);
 const c=(id:string,color:string)=>selected===id?'#b48bec':color,own=(key:string,node:ReactNode)=>{const id='cubesat-station-'+key;return <group key={id} visible={!(inspectSockets&&['feed-plug','input-plug','cable'].includes(key))} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;},mat=(key:string,color:string,metal=0)=><meshStandardMaterial color={c('cubesat-station-'+key,color)} metalness={metal} roughness={metal?.3:.6}/>;
 const box=(key:string,p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow receiveShadow><boxGeometry args={size}/>{mat(key,color,metal)}</mesh>;
 const disk=(key:string,p:P,r:number,h:number,color:string,metal=0)=><mesh position={p} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[r,r,h,48]}/>{mat(key,color,metal)}</mesh>;
 const profile=(key:string,s:Shape,p:P,depth:number,color:string,metal=0,rotation:P=[0,0,0])=><mesh position={p} rotation={rotation} castShadow><extrudeGeometry args={[s,{depth,bevelEnabled:false,curveSegments:64}]}/>{mat(key,color,metal)}</mesh>;
 const rod=(key:string,a:P,b:P,r:number,color:string,metal=0)=>{const av=new Vector3(...a),bv=new Vector3(...b);return <mesh position={av.clone().add(bv).multiplyScalar(.5)} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0,1,0),bv.clone().sub(av).normalize())} castShadow><cylinderGeometry args={[r,r,av.distanceTo(bv),32]}/>{mat(key,color,metal)}</mesh>;};
 const socket=(key:string)=> <>{profile(key,g.socket,[0,0,0],3,'#b7ab87',.8)}{profile(key,g.dielectric,[0,0,0],2.8,'#e2ded2')}{disk(key,[0,0,1.5],.25,3,'#c8ac72',.8)}</>;
 const plug=(key:string)=><>{profile(key,g.plug,[0,0,0],3,'#b7ab87',.8)}{profile(key,g.plugCap,[0,0,3],1,'#b7ab87',.8)}{profile(key,g.dielectric,[0,0,3],1,'#e2ded2')}{profile(key,g.contact,[0,0,0],4,'#c8ac72',.8)}{disk(key,[0,0,3.5],.25,1,'#c8ac72',.8)}</>;
 const struts=[0,2*Math.PI/3,4*Math.PI/3].map(a=>({a:[31.4*Math.cos(a),31.4*Math.sin(a),cubeSatDishDepth(31.4)] as P,b:[2.7*Math.cos(a),2.7*Math.sin(a),21.3] as P}));
 return <group name="cubesat-ground-station">
 {own('base',box('base',[180,4,-55],[54,4,48],'#5d6285',.5))}
 {own('feet',<>{[-20,20].flatMap(x=>[-17,17].map(z=><group key={x+'/'+z}>{box('feet',[180+x,1,-55+z],[8,2,8],'#33394b')}</group>))}</>)}
 {own('mast',profile('mast',g.mast,[180,6,-55],40,'#c4c5c5',.7,[-Math.PI/2,0,0]))}
 {own('saddle',<>{rod('saddle',[180,44,-55],cubeSatDishWorld([0,0,-5]),3,'#b2b7c4',.7)}{rod('saddle',cubeSatDishWorld([0,0,-5]),cubeSatDishWorld([0,0,-1.8]),2.4,'#b2b7c4',.7)}<group position={cubeSatDish.vertex} rotation={[Math.atan2(-.6,-.8),0,0]}><mesh geometry={g.saddle} castShadow>{mat('saddle','#b2b7c4',.7)}</mesh></group></>)}
 <group name="cubesat-dish-local" position={cubeSatDish.vertex} rotation={[Math.atan2(-.6,-.8),0,0]}>
 {own('dish',<mesh geometry={g.dish} castShadow receiveShadow><meshStandardMaterial color={c('cubesat-station-dish','#d8dce3')} metalness={.66} roughness={.32} side={DoubleSide}/></mesh>)}
 {own('rim',<mesh position={[0,0,cubeSatDishDepth(32)-.4]} castShadow><torusGeometry args={[32,.8,12,128]}/>{mat('rim','#aab4c6',.75)}</mesh>)}
 {own('struts',<>{struts.map((s,i)=><group key={i}>{rod('struts',s.a,s.b,.65,'#adb8c9',.7)}</group>)}</>)}
 {own('horn',<><mesh position={[0,0,16.5]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[4,2,3,64,1,true]}/><meshStandardMaterial color={c('cubesat-station-horn','#b4a480')} metalness={.8} roughness={.3} side={DoubleSide}/></mesh>{profile('horn',g.collar,[0,0,18],3,'#b4a480',.8)}<mesh position={[0,0,15]}><torusGeometry args={[4,.25,12,64]}/>{mat('horn','#b4a480',.8)}</mesh></>)}
 {own('feed-case',<>{profile('feed-case',g.collar,[0,0,21],1,'#56607e',.5)}{disk('feed-case',[0,0,23],2.4,2,'#56607e',.5)}</>)}
 {own('feed-socket',<group position={[0,0,24]}>{socket('feed-socket')}</group>)}
 {own('feed-plug',<group position={[0,0,24]}>{plug('feed-plug')}</group>)}
 </group>
 {own('cable',<mesh name="cubesat-ground-coax"><tubeGeometry args={[curve,400,.75,12,false]}/>{mat('cable','#33394b')}</mesh>)}
 {own('receiver',<>{box('receiver',[180,32,71],[76,54,2],'#333c59',.45)}{[-1,1].map(side=><group key={side}>{side<0?box('receiver',[143,32,79],[2,54,14],'#414a69',.5):profile('receiver',g.sideWall,[216,32,79],2,'#414a69',.5,[0,Math.PI/2,0])}{box('receiver',[180,32+side*26,79],[72,2,14],'#414a69',.5)}</group>)}{profile('receiver',g.bezel,[180,32,86],2,'#555575',.5)}</>)}
 {own('receiver-feet',<>{[-28,28].flatMap(x=>[-5,5].map(z=><group key={x+'/'+z}>{box('receiver-feet',[180+x,2.5,78+z],[9,5,5],'#33394b')}</group>))}</>)}
 {own('input',<group position={[218,22,78]} rotation={[0,Math.PI/2,0]}>{socket('input')}{profile('input',g.socket,[0,0,-2],2,'#b7ab87',.8)}{profile('input',g.dielectric,[0,0,-2],2,'#e2ded2')}{disk('input',[0,0,-1],.25,2,'#c8ac72',.8)}</group>)}
 {own('input-plug',<group position={[218,22,78]} rotation={[0,Math.PI/2,0]}>{plug('input-plug')}{profile('input-plug',g.jacket,[0,0,4],2,'#33394b')}</group>)}
 {own('display',<mesh position={[180,36,85.9]}><planeGeometry args={[62,32]}/><meshBasicMaterial color={selected==='cubesat-station-display'?'#c6a4ef':image?'#ffffff':'#17273f'} map={image} toneMapped={false}/></mesh>)}
 {own('controls',<>{[-12,0,12].map(x=><group key={x}>{box('controls',[180+x,12,88.8],[7,3,1.6],'#8a7bc3')}</group>)}</>)}
 {own('indicator',<mesh position={[207,12,88.4]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.5,1.5,.8,32]}/><meshStandardMaterial color={c('cubesat-station-indicator',receiving?'#89dac6':'#596b77')} emissive="#58c1a4" emissiveIntensity={receiving?1.5:0}/></mesh>)}
 </group>;
}
