import{memo,useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Shape,Path}from'three';
import{pickBatteryCircuitPaths}from'../data/pick-rover-battery-circuit';
const backOptions={depth:.2,bevelEnabled:false};
/** Authored, inspectable contact illustration. Coordinates are holder-local. */
function PickRoverBatteryCircuit({selected,choose,on,cutaway=false,onToggle}:{selected:string;choose:(id:string)=>void;on:boolean;cutaway?:boolean;onToggle?:()=>void}){
 const back=useMemo(()=>{const s=new Shape();s.moveTo(-6,5);s.lineTo(6,5);s.lineTo(6,13);s.lineTo(-6,13);s.closePath();for(const x of[-3,3]){const h=new Path();h.absarc(x,11.5,.5,0,Math.PI*2,true);s.holes.push(h);}return s;},[]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.45}),tag=(id:string,node:ReactNode,toggle=false)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);if(toggle)onToggle?.();}}>{node}</group>,box=(id:string,name:string,p:[number,number,number],size:[number,number,number],color:string,metalness=0)=><mesh name={name} position={p}><boxGeometry args={size}/><meshStandardMaterial {...mat(id,color,metalness)}/></mesh>,switchId='pick-wheel-battery-switch';
 return <group name="pick-wheel-battery-internal-circuit">
 {pickBatteryCircuitPaths.map((curve,i)=>{const id=i?'pick-wheel-battery-switched-return':'pick-wheel-battery-feed';return tag(id,<><mesh name={id+'-insulation'}><tubeGeometry args={[curve,180,.4,12,false]}/><meshStandardMaterial {...mat(id,i?'#b86155':'#d38a54')}/></mesh>{(i?[{p:[3,9.35,32.6],r:[0,0,0],length:.7},{p:[-26.5,9.2,23.25],r:[0,0,0],length:1}]:[{p:[-25.7,11.9,23.25],r:[0,0,0],length:.8},{p:[-3,9.35,32.6],r:[0,0,0],length:.7}]).map((c,n)=><mesh key={n} name={id+'-core-'+n} position={c.p as [number,number,number]} rotation={c.r as [number,number,number]}><cylinderGeometry args={[.2,.2,c.length,12]}/><meshStandardMaterial {...mat(id,'#bca66e',.8)}/></mesh>)}</>);})}
 {tag(switchId,<><mesh position={[0,0,32]}><extrudeGeometry args={[back,backOptions]}/><meshStandardMaterial {...mat(switchId,'#1d2432')}/></mesh>{[-1,1].map(side=><group key={side}>{box(switchId,'pick-switch-side-'+side,[side*5.5,9,33.1],[1,8,1.8],'#1d2432')}{box(switchId,'pick-switch-edge-'+side,[0,9+side*3.5,33.1],[10,1,1.8],'#1d2432')}</group>)}<group name="pick-switch-illustrative-cover" position={[0,0,cutaway?15:0]}>{box(switchId,'pick-switch-front',[0,9,33.9],[10,6,.2],'#1d2432')}{box(switchId,'pick-switch-slider',[on?2:-2,9,34.3],[5,5,.6],on?'#9062c8':'#5c6576')}</group></>,true)}
 {tag('pick-wheel-battery-fixed-contacts',<>{[-3,3].map((x,i)=><group key={x}><mesh name={'pick-switch-pin-'+i} position={[x,9,32.9]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.25,.25,1,20]}/><meshStandardMaterial {...mat('pick-wheel-battery-fixed-contacts','#bca66e',.8)}/></mesh><mesh name={'pick-switch-fixed-'+i} position={[x,9,33.2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.5,.5,.8,24]}/><meshStandardMaterial {...mat('pick-wheel-battery-fixed-contacts','#bca66e',.8)}/></mesh></group>)}</>)}
 {tag('pick-wheel-battery-contact-bridge',box('pick-wheel-battery-contact-bridge','pick-switch-moving-bridge',[0,on?9:10.8,33.65],[7,1,.3],'#bec2c6',.8))}
 </group>;
}
export default memo(PickRoverBatteryCircuit);
