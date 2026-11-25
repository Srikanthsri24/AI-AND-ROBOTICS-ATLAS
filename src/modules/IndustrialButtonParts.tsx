import{memo,useMemo,type ReactNode}from'react';
import{Shape,Path}from'three';
import Board from'./BluetoothMiniBreadboard';
import{industrialButtonAt as at}from'../data/industrial-controls';
type P=[number,number,number];
function IndustrialButtonParts({selected,select,pressed=false}:{selected:string;select:(id:string)=>void;pressed?:boolean}){
 const cover=useMemo(()=>{const s=new Shape();s.moveTo(-3,-3);s.lineTo(3,-3);s.lineTo(3,3);s.lineTo(-3,3);s.closePath();const h=new Path();h.absarc(0,0,1.2,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>,box=(p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={metal?.3:.6}/></mesh>;
 return <group position={[...at]}>
 {tag('industrial-control-board',<group scale={50}><Board selected={selected==='industrial-control-board'} supplyLabel="Five-hole ties" returnLabel="No power rails"/></group>)}
 {tag('industrial-button-body',box([0,12.2,0],[6,3.2,6],c('industrial-button-body','#29323f')))}
 {tag('industrial-button-cover',<><mesh position={[0,14,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[cover,{depth:.25,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('industrial-button-cover','#aab6bf')} metalness={.75} roughness={.35}/></mesh>{[-1,1].map(s=><group key={s}>{box([s*3.05,12.8,0],[.3,2.9,3],c('industrial-button-cover','#aab6bf'),.7)}</group>)}</>)}
 {tag('industrial-button-cap',<group name="industrial-button-moving-cap" position={[0,pressed?-.65:0,0]}><mesh position={[0,15.45,0]}><cylinderGeometry args={[1.45,1.45,1,32]}/><meshStandardMaterial color={c('industrial-button-cap','#9067b2')} roughness={.5}/></mesh><mesh position={[0,14.3,0]}><cylinderGeometry args={[1,1,2,24]}/><meshStandardMaterial color={c('industrial-button-cap','#333d4a')} roughness={.5}/></mesh></group>)}
 {([-1,1] as const).map(bank=>{const id=bank<0?'industrial-button-signal':'industrial-button-ground';return tag(id,<>{[-2.54,2.54].map(x=><group key={x}>{box([x,8.3,bank*3.81],[.5,5.4,.5],c(id,'#b7baae'),.7)}{box([x,11,bank*3.15],[.5,.4,1.32],c(id,'#b7baae'),.7)}</group>)}{box([0,11.2,bank*2.5],[5.6,.4,.6],c(id,'#b7baae'),.7)}</>);})}
 </group>;
}
export default memo(IndustrialButtonParts);
