import type {} from '@react-three/fiber';
import { useMemo,type ReactNode } from 'react';
import { Text } from '@react-three/drei';
import { Shape,Path } from 'three';
import { industrialPanel as d,industrialKnobs,industrialKnobAngle,industrialPotTerminal,type IndustrialPoint as P } from '../data/industrial-panel';
import { industrialIndex } from '../data/industrial-workshop';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
export default function IndustrialPanelParts({selected='',select=()=>{},temperatureAdc=205,vibrationAdc=184}:{selected?:string;select?:(id:string)=>void;temperatureAdc?:number;vibrationAdc?:number}){
 const shapes=useMemo(()=>{const ring=(outer:number,inner:number,hex=false)=>{const s=new Shape();if(hex){for(let i=0;i<6;i++){const a=i*Math.PI/3;if(i===0)s.moveTo(Math.cos(a)*outer,Math.sin(a)*outer);else s.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);}s.closePath();}else s.absarc(0,0,outer,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);return s;},plate=new Shape();plate.moveTo(-d.width/2,-d.depth/2);plate.lineTo(d.width/2,-d.depth/2);plate.lineTo(d.width/2,d.depth/2);plate.lineTo(-d.width/2,d.depth/2);plate.closePath();for(const [x,z,r]of[...industrialKnobs.map(k=>[k.x,k.z,d.shaftHole]),...d.posts.map(([x,z])=>[x,z,d.postHole])]){const h=new Path();h.absarc(x-d.at[0],-(z-d.at[2]),r,0,Math.PI*2,true);plate.holes.push(h);}return{plate,post:ring(4,1.8),bushing:ring(3.5,3.05),shoulder:ring(5.5,3.05),washer:ring(6.3,3.7),nut:ring(6,3.7,true),knob:ring(10,3.2)};},[]);
 const color=(id:string,c:string)=>id===selected?'#b48bec':c,owner=(id:string,children:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{children}</group>;
 const box=(id:string,p:P,size:P,c:string)=><mesh key={id+p.join(',')} position={p} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color(id,c)} roughness={.55}/></mesh>;
 const cylinder=(id:string,p:P,r:number,height:number,c:string,metal=.65)=><mesh key={id+p.join(',')} position={p} castShadow><cylinderGeometry args={[r,r,height,48]}/><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.32:.6}/></mesh>;
 const plate=(id:string,shape:Shape,p:P,depth:number,c:string,metal=.6)=><mesh key={id+p.join(',')} position={p} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={.4}/></mesh>;
 const text=(p:P,value:string,size=3,c='#313452')=><Text key={value} position={p} rotation={[-Math.PI/2,0,0]} font={font} fontSize={size} color={c} raycast={()=>null}>{value}</Text>;
 return <group name="industrial-panel-mm">
 {owner('industrial-bench',box('industrial-bench',[0,-7,0],[560,14,350],'#424b64'))}
 {owner('industrial-panel',<>{plate('industrial-panel',shapes.plate,d.at,d.thickness,'#a1acbd')}{text([65,40.15,-97],'SYNTHETIC INPUTS · 10 kΩ TEST KNOBS',3.3)}</>)}
 {owner('industrial-panel-posts',<>{d.posts.map(([x,z])=>plate('industrial-panel-posts',shapes.post,[x,0,z],37,'#7f8ea2'))}</>)}
 {owner('industrial-panel-screws',<>{d.posts.map(([x,z])=><group key={x+'/'+z}>{cylinder('industrial-panel-screws',[x,35,z],1.5,10,'#abb6c2')}{cylinder('industrial-panel-screws',[x,41,z],3,2,'#b5bfcb')}{box('industrial-panel-screws',[x,42.05,z],[3.4,.1,.55],'#434c61')}</group>)}</>)}
 {industrialKnobs.map(k=>{const id=(part:string)=>`industrial-${k.key}-${part}`,adc=k.key==='temperature'?temperatureAdc:vibrationAdc,angle=industrialKnobAngle(adc);return <group key={k.key}>
 {owner(id('body'),<>{cylinder(id('body'),[k.x,26,k.z],8,12,'#9eabbb')}{cylinder(id('body'),[k.x,20.5,k.z],7.6,1,'#4b4140',0)}{box(id('body'),[k.x,24,k.z+7],[14,5,3],'#846f57')}{text([k.x,32.1,k.z],'B10K',2.4)}</>)}
 {owner(id('bushing'),<>{plate(id('bushing'),shapes.shoulder,[k.x,32,k.z],5,'#c4b78c')}{plate(id('bushing'),shapes.bushing,[k.x,37,k.z],7,'#c4b78c')}</>)}
 {owner(id('washer'),plate(id('washer'),shapes.washer,[k.x,40,k.z],.6,'#bac4d0'))}
 {owner(id('nut'),plate(id('nut'),shapes.nut,[k.x,40.6,k.z],3,'#b8aa7e'))}
 {owner(id('shaft'),<group position={[k.x,0,k.z]} rotation={[0,angle,0]}>{cylinder(id('shaft'),[0,45.25,0],3,26.5,'#b6c0cf')}{box(id('shaft'),[0,46,3.025],[.7,2,.1],'#68758b')}</group>)}
 {owner(id('knob'),<group position={[k.x,0,k.z]} rotation={[0,angle,0]}>{plate(id('knob'),shapes.knob,[0,47,0],12,'#30384d',0)}{cylinder(id('knob'),[0,60,0],10,2,'#3f4562',0)}{Array.from({length:24},(_,i)=>{const a=i*Math.PI*2/24;return <group key={i} position={[Math.sin(a)*10,54,Math.cos(a)*10]} rotation={[0,a,0]}>{box(id('knob'),[0,0,0],[.9,12,.8],'#394058')}</group>})}{box(id('knob'),[0,61.15,6.3],[1.4,.3,5.5],'#e6d5fb')}</group>)}
 {(['ground','wiper','supply']as const).map((kind,i)=>{const tip=industrialPotTerminal(k.key,kind);return owner(id(kind),<>{box(id(kind),[tip[0],tip[1],tip[2]-3],[1.4,1,6],'#c3b07d')}{text([tip[0],24.55,tip[2]-3],['G','W','+'][i],1.5,'#243348')}</>);})}
 {text([k.x,40.15,k.z-20],`${k.key==='temperature'?'TEMPERATURE':'VIBRATION'} · ${k.pin}`,3.1)}
 {text([k.x,40.15,k.z+24],`${industrialIndex(adc)} / 100 · ADC ${adc}`,2.9)}
 {[0,100].map((value,i)=>text([k.x+(i===0?13:-13),40.15,k.z-13],String(value),2.2))}
 </group>;})}
 </group>;
}
