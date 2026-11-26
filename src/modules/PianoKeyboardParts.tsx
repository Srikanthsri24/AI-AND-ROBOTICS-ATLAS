import {memo,useMemo,useRef,type ReactNode} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Path,Shape,type Group} from 'three';
import {pianoSwitches,type PianoPoint} from '../data/piano-layout';
import type {PianoFlags} from '../data/piano-workshop';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type Props={selected:string;choose:(id:string)=>void;held:PianoFlags;press?:(index:number,down:boolean)=>void};
function KeyMotion({index,down,children}:{index:number;down:boolean;children:ReactNode}){const ref=useRef<Group>(null);useFrame((_,dt)=>{if(ref.current){const goal=down?-.65:0;ref.current.position.y+=(goal-ref.current.position.y)*(1-Math.exp(-35*dt));if(Math.abs(ref.current.position.y-goal)<.001)ref.current.position.y=goal;}});return <group name={'piano-key-'+index+'-moving-cap'} ref={ref}>{children}</group>;}
function PianoKeyboardParts({selected,choose,held,press}:Props){
 const shapes=useMemo(()=>{const square=(hole:boolean)=>{const s=new Shape();s.moveTo(-3,-3);s.lineTo(3,-3);s.lineTo(3,3);s.lineTo(-3,3);s.closePath();if(hole){const p=new Path();p.absarc(0,0,1.2,0,2*Math.PI,true);s.holes.push(p);}return s;};return {body:square(true),cover:square(true)};},[]);
 const color=(id:string,c:string)=>id===selected?'#b78be8':c;
 const box=(id:string,p:PianoPoint,size:PianoPoint,c:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.35:.65}/></mesh>;
 const tag=(id:string,children:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>;
 return <group name="piano-eight-key-keyboard">{pianoSwitches.map((key,i)=>{const id=key.id;return <group key={id} position={key.at}>
 {tag(id+'-body',<mesh position={[0,10.6,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.body,{depth:3.2,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={color(id+'-body','#29323f')} roughness={.65}/></mesh>)}
 {tag(id+'-cover',<><mesh position={[0,14,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.cover,{depth:.25,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={color(id+'-cover','#aab6bf')} metalness={.75} roughness={.35}/></mesh>{[-1,1].map(side=><group key={side}>{box(id+'-cover',[side*3.05,12.8,0],[.3,2.9,3],'#aab6bf',.7)}</group>)}</>)}
 {tag(id+'-cap',<KeyMotion index={i} down={held[i]}><group onPointerDown={e=>{e.stopPropagation();(e.target as unknown as Element).setPointerCapture(e.pointerId);choose(id+'-cap');press?.(i,true);}} onPointerUp={e=>{e.stopPropagation();(e.target as unknown as Element).releasePointerCapture(e.pointerId);press?.(i,false);}} onLostPointerCapture={()=>press?.(i,false)}>
 <mesh position={[0,15.45,0]} castShadow><cylinderGeometry args={[1.45,1.45,1,32]}/><meshStandardMaterial color={color(id+'-cap',held[i]?'#a67aca':'#67538d')} roughness={.45}/></mesh><mesh position={[0,14.3,0]}><cylinderGeometry args={[1,1,2,24]}/><meshStandardMaterial color={color(id+'-cap','#333d4a')} roughness={.6}/></mesh></group></KeyMotion>)}
 {([-1,1] as const).map(bank=>{const contact=id+(bank<0?'-signal':'-ground');return tag(contact,<>{[-2.54,2.54].map(x=><group key={x}>{box(contact,[x,8.3,bank*3.81],[.7,5.4,.3],'#b7baae',.7)}{box(contact,[x,11,bank*3.15],[.7,.4,1.32],'#b7baae',.7)}</group>)}{box(contact,[0,11.2,bank*2.5],[5.6,.4,.6],'#b7baae',.7)}</>);})}
 <Text name={id+'-printed-note'} position={[0,10.05,16]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.5} color="#533970" anchorX="center">{key.note}</Text>
 </group>;})}</group>;
}
export default memo(PianoKeyboardParts);
