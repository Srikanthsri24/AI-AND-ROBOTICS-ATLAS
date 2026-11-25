import{memo,useMemo,type ReactNode}from'react';
import{Text}from'@react-three/drei';
import{DoubleSide,Path,Shape}from'three';
import{gateWaterBox}from'../data/flood-gate-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function FloodGateBasinParts({selected,select,upMm=0,downMm=0}:{selected:string;select:(id:string)=>void;upMm?:number;downMm?:number}){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(at:[number,number,number],size:[number,number,number],color:string,clear=false)=><mesh position={at} castShadow={!clear} receiveShadow><boxGeometry args={size}/>{clear?<meshPhysicalMaterial color={color} transparent opacity={.23} roughness={.14} ior={1.49} depthWrite={false}/>:<meshStandardMaterial color={color} roughness={.65}/>}</mesh>;
 const seal=useMemo(()=>{const s=new Shape();s.moveTo(-30,8);s.lineTo(30,8);s.lineTo(30,88);s.lineTo(-30,88);s.closePath();const h=new Path();h.moveTo(-28,10);h.lineTo(-28,84);h.lineTo(28,84);h.lineTo(28,10);h.closePath();s.holes.push(h);return s;},[]);
 return <>
 {tag('gate-tray',<>{box([0,1.5,0],[400,3,260],c('gate-tray','#b4bdcf'))}{[-1,1].map(s=><group key={s}>{box([s*199,6,0],[2,6,260],c('gate-tray','#8e9cb1'))}{box([0,6,s*129],[396,6,2],c('gate-tray','#8e9cb1'))}</group>)}</>)}
 {tag('gate-basin',<>{box([0,5.5,0],[364,5,224],c('gate-basin','#c1dce4'),true)}{[-1,1].map(s=><group key={s}>{box([s*181,63,0],[2,110,224],c('gate-basin','#c1dce4'),true)}{box([0,63,s*111],[360,110,2],c('gate-basin','#c1dce4'),true)}{box([s*181,118,0],[3,3,226],c('gate-basin','#b1cdd7'))}{box([0,118,s*111],[364,3,3],c('gate-basin','#b1cdd7'))}</group>)}</>)}
 {tag('gate-divider',<>{box([0,101,0],[2,34,220],c('gate-divider','#758994'))}{[-1,1].map(s=><group key={s}>{box([0,46,s*69],[2,76,82],c('gate-divider','#8c9ba4'))}</group>)}</>)}
 {tag('gate-seal',<mesh position={[1,0,0]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[seal,{depth:.5,bevelEnabled:false}]}/><meshStandardMaterial color={c('gate-seal','#947d5b')} roughness={.85} side={DoubleSide}/></mesh>)}
 {(['up','down'] as const).map(side=>{const depth=side==='up'?upMm:downMm,water=gateWaterBox(side,depth),id=`gate-${side}-water`;return depth>0?tag(id,<mesh position={water.at}><boxGeometry args={water.size}/><meshPhysicalMaterial color={c(id,side==='up'?'#468da8':'#4b9fab')} transparent opacity={.34} roughness={.13} clearcoat={.85} ior={1.333} depthWrite={false}/></mesh>):null;})}
 {(['up','down'] as const).map(side=>{const id=`gate-${side}-scale`,x=side==='up'?-164:16;return tag(id,<>{(side==='up'?[0,50,80,100]:[0,50,60,80,100]).map(mm=><group key={mm}>{box([x,8+mm,112.2],[18,.7,.4],c(id,mm===(side==='up'?80:60)?'#ae4e65':'#43576e'))}<Text position={[x+13,8+mm,112.6]} font={font} fontSize={3.5} anchorX="left" color={c(id,'#33455f')}>{mm/10} cm</Text></group>)}<Text position={[side==='up'?-90:90,114,112.6]} font={font} fontSize={3} color={c(id,'#33455f')}>{side==='up'?'UPSTREAM':'DOWNSTREAM'}</Text></>);})}
 </>;
}
export default memo(FloodGateBasinParts);
