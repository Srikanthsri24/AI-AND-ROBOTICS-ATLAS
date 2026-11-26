import {memo,useMemo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import type {ThreeEvent} from '@react-three/fiber';
import {Path,Shape} from 'three';
import {rainWaterSensor as layout} from '../data/rain-water-sensor';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type P=[number,number,number];
function RainWaterSensorParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const board=useMemo(()=>{const s=new Shape();s.moveTo(0,0);s.lineTo(8,0);s.absarc(10,0,2,Math.PI,2*Math.PI,false);s.lineTo(28,0);s.absarc(30,0,2,Math.PI,0,true);s.lineTo(40,0);s.lineTo(40,8);s.absarc(40,10,2,-Math.PI/2,Math.PI/2,false);s.lineTo(40,20);s.lineTo(32,20);s.absarc(30,20,2,0,-Math.PI,true);s.lineTo(12,20);s.absarc(10,20,2,0,Math.PI,false);s.lineTo(0,20);s.lineTo(0,12);s.absarc(0,10,2,Math.PI/2,-Math.PI/2,true);s.closePath();for(const [x,z]of layout.holes){const h=new Path();h.absarc(x,z,1,0,Math.PI*2,true);s.holes.push(h);}return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,box=(id:string,p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.35:.7}/></mesh>;
 return <group name="rain-grove-water-sensor">
 {tag('rain-water-pcb',<mesh rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[board,{depth:1.6,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('rain-water-pcb','#155e78')} roughness={.65}/></mesh>)}
 {(['signal','ground'] as const).map(net=>{const id='rain-electrode-'+net;return <group key={id}>{tag(id,<>{layout.electrodes.filter(e=>e.net===net).map(e=><mesh key={e.index} name={'rain-electrode-'+e.index} position={[(e.x0+e.x1)/2,1.65,-e.z]}><boxGeometry args={[e.x1-e.x0,.1,e.width]}/><meshStandardMaterial color={c(id,'#c5c9c5')} metalness={.88} roughness={.32}/></mesh>)}</>)}</group>;})}
 {tag('rain-water-vias',<>{layout.electrodes.map(e=><mesh key={e.index} position={[16.8,1.65,-e.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.22,.48,16]}/><meshStandardMaterial color={c('rain-water-vias','#b6b99d')} metalness={.8}/></mesh>)}{layout.holes.map(([x,z],n)=><mesh key={'mount'+n} position={[x,1.62,-z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1,1.5,24]}/><meshStandardMaterial color={c('rain-water-vias','#b6b99d')} metalness={.8}/></mesh>)}</>)}
 {tag('rain-water-pullup',<>{box('rain-water-pullup',[10.5,1.95,-10],[1.2,.6,2],'#30343b')}{[-1,1].map(side=><group key={side}>{box('rain-water-pullup',[10.5,1.95,-10+side*.85],[1.3,.65,.35],'#c3c7c7',.8)}</group>)}<Text position={[12.1,1.66,-10]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={.8} color="#f0eee1">R1</Text></>)}
 {tag('rain-water-socket',<>{box('rain-water-socket',[4,1.95,-10],[5,.7,10.8],'#e5e1d2')}{[-1,1].map(side=><group key={side}>{box('rain-water-socket',[4+side*2.2,5.1,-10],[.6,5.6,10.8],'#e5e1d2')}{box('rain-water-socket',[4,5.1,-10+side*5.1],[4.4,5.6,.6],'#e5e1d2')}</group>)}</>)}
 {layout.pins.map((pin,n)=>{const id='rain-water-pin-'+pin.toLowerCase(),z=-layout.pinZ[n];return <group key={pin}>{tag(id,<>{box(id,[4,4.3,z],[.5,4,.5],'#bba87c',.8)}{box(id,[4,-.2,z],[.5,1,.5],'#bac2c5',.8)}</>)}<Text position={[7.8,1.66,z]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={.8} color="#f0eee1">{pin}</Text></group>;})}
 </group>;
}
export default memo(RainWaterSensorParts);
