import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Path,Shape,CatmullRomCurve3,Vector3} from 'three';
import {railwayBeamStations,railwaySensorPose,railwayBeamAlignment} from '../data/railway-beam-layout';
import {railwayDefaults,type RailwayInputs} from '../data/railway-workshop';
function circle(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}
/** Native mm; lenses lie on the actual finite beam endpoints at y=24, z=±48. */
function RailwayBeamParts({selected='',select=()=>{},inputs}:{selected?:string;select?:(id:string)=>void;inputs?:RefObject<RailwayInputs>}){
 const receivers=useRef<Map<string,Group>>(new Map());
 useFrame(()=>{for(const station of railwayBeamStations){const root=receivers.current.get(station);if(root)root.position.x=railwaySensorPose(station,true,railwayBeamAlignment(station,inputs?.current??railwayDefaults)).x;}},-2);
 const shapes=useMemo(()=>{const wall=new Shape();wall.moveTo(-9,1.5);wall.lineTo(9,1.5);wall.lineTo(9,37);wall.lineTo(-9,37);wall.closePath();const bore=new Path();bore.absarc(0,24,3.4,0,Math.PI*2,true);wall.holes.push(bore);const foot=new Shape();foot.moveTo(-9,7);foot.lineTo(9,7);foot.lineTo(9,21);foot.lineTo(-9,21);foot.closePath();for(const x of[-6,6]){const h=new Path();h.absarc(x,17,1.1,0,Math.PI*2,true);foot.holes.push(h);}const nut=new Shape();for(let n=0;n<6;n++){const x=Math.cos(n*Math.PI/3)*4.8,y=Math.sin(n*Math.PI/3)*4.8;n?nut.lineTo(x,y):nut.moveTo(x,y);}nut.closePath();const h=new Path();h.absarc(0,0,3.45,0,Math.PI*2,true);nut.holes.push(h);return{wall,foot,nut,bezel:circle(3.2,1.55),washer:circle(2.2,1.1),head:circle(1.8,.7)};},[]);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c,mat=(id:string,c:string,metal=0)=><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.3:.55}/>;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],s:[number,number,number],c:string)=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/>{mat(id,c)}</mesh>;
 const disk=(id:string,p:[number,number,number],r:number,length:number,c:string,metal=0)=><mesh position={p} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[r,r,length,32]}/>{mat(id,c,metal)}</mesh>;
 return <group name="railway-beam-hardware">{railwayBeamStations.flatMap(station=>[false,true].map(receiver=>{const id=`railway-${station}-${receiver?'receiver':'emitter'}`,pose=railwaySensorPose(station,receiver,railwayBeamAlignment(station,inputs?.current??railwayDefaults)),pins=receiver?['vcc','ground','signal']:['vcc','ground'];return <group key={id} name={id} position={[pose.x,0,pose.z]} rotation={[0,pose.yaw,0]} ref={g=>{if(receiver){if(g)receivers.current.set(station,g);else receivers.current.delete(station);}}}>
 {tag(`${id}-bracket`,<>
  <mesh position={[0,0,-7]} castShadow receiveShadow><extrudeGeometry args={[shapes.wall,{depth:2,bevelEnabled:false}]}/>{mat(`${id}-bracket`,'#a1aab4',.75)}</mesh>
  <mesh rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shapes.foot,{depth:1.5,bevelEnabled:false}]}/>{mat(`${id}-bracket`,'#a1aab4',.75)}</mesh>
 </>)}
 {tag(`${id}-body`,<>{disk(`${id}-body`,[0,24,-6.4],3.2,11.2,'#252e3a')}
  {[2,3.2,4.4,5.6,6.8,8,9.2,10.4].map(z=><mesh key={z} position={[0,24,-z]}><torusGeometry args={[3.23,.1,6,32]}/>{mat(`${id}-body`,'#555f6a',.5)}</mesh>)}
  <mesh position={[0,24,-.8]}><extrudeGeometry args={[shapes.bezel,{depth:.8,bevelEnabled:false}]}/>{mat(`${id}-body`,'#303b49',.35)}</mesh>
 </>)}
 {tag(`${id}-lens`,disk(`${id}-lens`,[0,24,-.15],1.5,.3,receiver?'#142c49':'#5b1931',.35))}
 {tag(`${id}-nuts`,<>{[-9,-5].map(z=><mesh key={z} position={[0,24,z]} castShadow><extrudeGeometry args={[shapes.nut,{depth:2,bevelEnabled:false}]}/>{mat(`${id}-nuts`,'#8e99a6',.75)}</mesh>)}</>)}
 {tag(`${id}-fasteners`,<>{[-6,6].map(x=><group key={x}>
  <mesh position={[x,1.5,-17]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.washer,{depth:.4,bevelEnabled:false}]}/>{mat(`${id}-fasteners`,'#b2bac4',.8)}</mesh>
  <mesh position={[x,.3,-17]}><cylinderGeometry args={[.9,.9,4,16]}/>{mat(`${id}-fasteners`,'#9ca5b0',.8)}</mesh>
  <mesh position={[x,1.9,-17]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.head,{depth:.9,bevelEnabled:false}]}/>{mat(`${id}-fasteners`,'#8995a5',.8)}</mesh>
 </group>)}</>)}
 {tag(`${id}-tail`,<>{disk(`${id}-tail`,[0,24,-13.2],2,2.4,'#121a25')}
  {pins.map((pin,n)=>{const x=(n-(pins.length-1)/2)*2.54,start=(n-(pins.length-1)/2)*.65,curve=new CatmullRomCurve3([new Vector3(start,24,-14.4),new Vector3(start,24,-18),new Vector3(x,17,-21),new Vector3(x,8,-21),new Vector3(x,8,-23.5)]);return <mesh key={pin}><tubeGeometry args={[curve,32,.42,8,false]}/>{mat(`${id}-tail`,pin==='vcc'?'#c6404e':pin==='ground'?'#222a36':'#5188c7')}</mesh>;})}
  {box(`${id}-tail`,[0,8,-25],[pins.length*2.54+1,4,3],'#202937')}
 </>)}
 {pins.map((pin,n)=>tag(`${id}-${pin}`,box(`${id}-${pin}`,[(n-(pins.length-1)/2)*2.54,8,-28],[.65,.65,3],'#b5a267')))}
 </group>;}))}</group>;
}
export default memo(RailwayBeamParts);
