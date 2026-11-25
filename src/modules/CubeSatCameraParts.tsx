import type {} from '@react-three/fiber';
import {useMemo,type ReactNode} from 'react';
import {Shape,Path} from 'three';
import {cubeSatCameraClamps as clamps,cubeSatCameraBoardHoles as mounts} from '../data/cubesat-camera';
type P=[number,number,number];
export default function CubeSatCameraParts({selected='',select=()=>{},opticalInspection=false}:{selected?:string;select?:(id:string)=>void;opticalInspection?:boolean}){
 const shapes=useMemo(()=>{const rectangle=(w:number,h:number)=>{const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;},bore=(s:Shape,x:number,y:number,r:number)=>{const h=new Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);},ring=(outer:number,inner:number)=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);bore(s,0,0,inner);return s;},plate=rectangle(100,60),opening=new Path();opening.moveTo(-22,-17);opening.lineTo(-22,17);opening.lineTo(22,17);opening.lineTo(22,-17);opening.closePath();plate.holes.push(opening);for(const m of clamps)bore(plate,m.x,m.y-80,1.1);for(const m of mounts)bore(plate,m.x,m.y-80,.7);const pcb=rectangle(50,40);for(const m of mounts)bore(pcb,m.x,m.y-80,.7);const strap=rectangle(8.5,4);bore(strap,-2.25,0,1.1);const socket=rectangle(13,4);const slot=new Path();slot.moveTo(-5.4,-1.2);slot.lineTo(-5.4,1.2);slot.lineTo(5.4,1.2);slot.lineTo(5.4,-1.2);slot.closePath();socket.holes.push(slot);return{plate,pcb,strap,spacer:ring(1.2,.7),barrel:ring(10,7.8),socket};},[]);
 const color=(id:string,c:string)=>id===selected?'#b48bec':c,owner=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const profile=(id:string,shape:Shape,at:P,depth:number,c:string,metal=0)=><mesh position={at} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.32:.65}/></mesh>;
 const box=(id:string,at:P,size:P,c:string,metal=0)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.3:.6}/></mesh>;
 const screw=(id:string,x:number,y:number,back:number,length:number,r:number,headR:number)=><group key={x+'/'+y}><mesh position={[x,y,back+length/2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[r,r,length,20]}/><meshStandardMaterial color={color(id,'#a9b5c4')} metalness={.85} roughness={.28}/></mesh><mesh position={[x,y,52.45]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[headR,headR,.9,6]}/><meshStandardMaterial color={color(id,'#8997aa')} metalness={.85} roughness={.3}/></mesh></group>;
 return <group name="cubesat-payload-camera-mm">
 {owner('cubesat-camera-plate',profile('cubesat-camera-plate',shapes.plate,[0,80,50],2,'#b9c2cb',.75))}
 {owner('cubesat-camera-clamps',<>{clamps.map(m=><group key={m.x+'/'+m.y} position={[m.side*42.25,m.y,45]} scale={[m.side,1,1]}>{profile('cubesat-camera-clamps',shapes.strap,[0,0,0],2,'#9ca9b8',.8)}</group>)}</>)}
 {owner('cubesat-camera-clamp-screws',<>{clamps.map(m=>screw('cubesat-camera-clamp-screws',m.x,m.y,44,8,.8,1.8))}</>)}
 {owner('cubesat-camera-pcb',profile('cubesat-camera-pcb',shapes.pcb,[0,80,47],1.6,'#245f53'))}
 {owner('cubesat-camera-pcb-spacers',<>{mounts.map(m=><group key={m.x+'/'+m.y}>{profile('cubesat-camera-pcb-spacers',shapes.spacer,[m.x,m.y,48.6],1.4,'#ddd7c8')}</group>)}</>)}
 {owner('cubesat-camera-pcb-screws',<>{mounts.map(m=>screw('cubesat-camera-pcb-screws',m.x,m.y,46.5,5.5,.5,1))}</>)}
 {owner('cubesat-camera-sensor',<>{box('cubesat-camera-sensor',[0,80,49.2],[12,10,1.2],'#333946')}{box('cubesat-camera-sensor',[0,80,49.85],[5,4,.1],'#6b587d',.4)}</>)}
 {owner('cubesat-camera-front-end',<>{[-1,1].flatMap(side=>[-10,10].map(y=><group key={side+'/'+y}>{box('cubesat-camera-front-end',[side*18,80+y,49],[4,3,.8],'#303b48')}{[-1,1].map(edge=>box('cubesat-camera-front-end',[side*18+edge*2.3,80+y,48.85],[.6,2,.5],'#b8b59f',.7))}</group>))}</>)}
 <group visible={!opticalInspection}>{owner('cubesat-camera-barrel',profile('cubesat-camera-barrel',shapes.barrel,[0,80,50],14,'#2f3d50',.7))}{owner('cubesat-camera-lens',<mesh position={[0,80,62.5]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[7.7,7.7,1,64]}/><meshPhysicalMaterial color={color('cubesat-camera-lens','#7797bb')} transmission={selected==='cubesat-camera-lens'?0:.82} thickness={1} roughness={.08} metalness={.05} ior={1.45} clearcoat={1}/></mesh>)}</group>
 {owner('cubesat-camera-connector',<>{profile('cubesat-camera-connector',shapes.socket,[0,92,42.5],4.5,'#39485d')}{Array.from({length:8},(_,i)=>box('cubesat-camera-connector',[(i-3.5)*1.27,92,44.8],[.4,.4,4.4],'#b9b18e',.8))}</>)}
 </group>;
}
