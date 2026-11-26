import {memo,useMemo,type ReactNode} from 'react';
import {Path,Shape} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {rfidLatchPose} from '../data/rfid-latch';
type P=[number,number,number];
function RfidDoorParts({angle,doorAngle=0,selected,choose}:{angle:number;doorAngle?:number;selected:string;choose:(id:string)=>void}){
 const pose=rfidLatchPose(angle);if(!Number.isFinite(doorAngle)||doorAngle<0||doorAngle>75)throw new RangeError('Door view must be 0–75 degrees');
 const hinge=useMemo(()=>{const s=new Shape();s.absarc(0,0,1.8,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,.9,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.32:.68}/></mesh>;
 return <group name="rfid-door-mechanism">
 {tag('rfid-door-base',box('rfid-door-base',[36,3,0],[110,6,70],'#baa581'))}
 {tag('rfid-door-frame',<>{box('rfid-door-frame',[-5,59,0],[6,106,8],'#bba584')}{box('rfid-door-frame',[78,59,0],[8,106,8],'#bba584')}{box('rfid-door-frame',[36.5,109,0],[89,6,8],'#bba584')}</>)}
 {tag('rfid-hinge-pins',<>{[28,84].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.85,.85,18,24]}/><meshStandardMaterial color={c('rfid-hinge-pins','#b9c2ca')} metalness={.8} roughness={.3}/></mesh>)}</>)}
 {tag('rfid-fixed-hinges',<>{[28,84].map(y=><group key={y}>{box('rfid-fixed-hinges',[-3.5,y,-4.3],[7,16,.6],'#a9b5c0',.7)}{box('rfid-fixed-hinges',[-1,y,-3.05],[2,16,2.5],'#a9b5c0',.7)}{[-6,6].map(dy=><mesh key={dy} position={[0,y+dy,0]} rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[hinge,{depth:4,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('rfid-fixed-hinges','#a9b5c0')} metalness={.7} roughness={.35}/></mesh>)}</group>)}</>)}
 <group name="rfid-moving-door" rotation={[0,-doorAngle*Math.PI/180,0]}>
 {tag('rfid-door-panel',<>{box('rfid-door-panel',[35,56,0],[70,98,3],'#d1bd9b')}{box('rfid-door-panel',[35,71,1.7],[54,48,.4],'#c5b08e')}{box('rfid-door-panel',[35,25,1.7],[54,27,.4],'#c5b08e')}</>)}
 {tag('rfid-moving-hinges',<>{[28,84].map(y=><group key={y}>{box('rfid-moving-hinges',[4,y,-1.8],[8,16,.6],'#a9b5c0',.7)}<mesh position={[0,y+2,0]} rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[hinge,{depth:8,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('rfid-moving-hinges','#a9b5c0')} metalness={.7} roughness={.35}/></mesh></group>)}</>)}
 {tag('rfid-door-knob',<><mesh position={[58,66,3]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2,2,3,24]}/><meshStandardMaterial color={c('rfid-door-knob','#afbbc7')} metalness={.8} roughness={.3}/></mesh><mesh position={[58,66,5]}><sphereGeometry args={[3,24,16]}/><meshStandardMaterial color={c('rfid-door-knob','#b9c5cf')} metalness={.8} roughness={.25}/></mesh></>)}
 {tag('rfid-door-strike',<>{[66.5,70.5].map(x=><group key={x}>{box('rfid-door-strike',[x,56,16.125],[1,6,29.25],'#b49875')}</group>)}{box('rfid-door-strike',[68.5,56,30.25],[5,6,1],'#b49875')}</>)}
 </group>
 {tag('rfid-latch-servo',<>{box('rfid-latch-servo',[88,56,15.5],[24,12,23],'#2e618c')}{box('rfid-latch-servo',[88,56,5.5],[32,15,3],'#274e76')}{box('rfid-latch-servo',[88,56,27.75],[12,12,1.5],'#366c98')}{box('rfid-latch-servo',[88,56,25.8],[24.2,12.2,.5],'#284c70')}</>)}
 {tag('rfid-latch-shaft',<mesh position={[88,56,30]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2.2,2.2,3,24]}/><meshStandardMaterial color={c('rfid-latch-shaft','#e1ddd0')} roughness={.5}/></mesh>)}
 {tag('rfid-latch-tab',<group position={[88,56,32.5]} rotation={[0,0,-pose.radians]}>{box('rfid-latch-tab',[-10,0,0],[20,4,1.5],'#e4ded1')}<mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[3,3,1.5,32]}/><meshStandardMaterial color={c('rfid-latch-tab','#e4ded1')} roughness={.5}/></mesh></group>)}
 {tag('rfid-horn-screw',<mesh position={[88,56,33.6]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.2,1.2,.7,24]}/><meshStandardMaterial color={c('rfid-horn-screw','#aab5c0')} metalness={.8} roughness={.3}/></mesh>)}
 </group>;
}
export default memo(RfidDoorParts);
