import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Mesh,Path,Shape,type MeshStandardMaterial} from 'three';
import {railwaySupplyAt,railwaySupplyPorts} from '../data/railway-power-layout';
import type {RailwayInputs} from '../data/railway-workshop';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function rectangle(x0:number,x1:number,y0:number,y1:number){const s=new Shape();s.moveTo(x0,y0);s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();return s;}
function bore(s:Shape,x:number,y:number,r:number){const h=new Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);}
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);bore(s,0,0,inner);return s;}
function RailwaySupplyParts({selected='',select=()=>{},inputs}:{selected?:string;select?:(id:string)=>void;inputs?:RefObject<RailwayInputs>}){
 const lcd=useRef<Mesh>(null),button=useRef<Mesh>(null),voltage=useRef<any>(null);
 useFrame(()=>{const on=!!inputs?.current.servoPower;if(lcd.current){const m=lcd.current.material as MeshStandardMaterial;m.color.set(selected==='railway-supply-display'?'#b78be8':on?'#b8d7cc':'#687785');m.emissive.set(on?'#44796a':'#000000');}if(button.current)(button.current.material as MeshStandardMaterial).color.set(selected==='railway-supply-switch'?'#b78be8':on?'#865bcb':'#48536a');const text=on?'5.00 V':'OFF';if(voltage.current&&voltage.current.text!==text){voltage.current.text=text;voltage.current.sync();}});
 const shapes=useMemo(()=>{const front=rectangle(-38,38,5,37);for(const p of railwaySupplyPorts)bore(front,p.x,13,2.6);bore(front,27,28,3);const window=new Path();window.moveTo(-18,22.5);window.lineTo(-18,33.5);window.lineTo(18,33.5);window.lineTo(18,22.5);window.closePath();front.holes.push(window);const bezel=rectangle(-19.5,19.5,21,35);bezel.holes.push(window.clone());const back=rectangle(-38,38,5,37);for(const y of[11,16,21,26,31]){const h=new Path();h.moveTo(-18,y-.7);h.lineTo(-18,y+.7);h.lineTo(18,y+.7);h.lineTo(18,y-.7);h.closePath();back.holes.push(h);}return{front,back,bezel,collar:ring(3.8,2.7),socket:ring(2.6,2.1)};},[]);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c,mat=(id:string,c:string,metal=0)=><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.3:.58}/>;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],s:[number,number,number],c:string,metal=0)=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/>{mat(id,c,metal)}</mesh>;
 const ext=(id:string,shape:Shape,z:number,depth:number,c:string,metal=0)=><mesh position={[0,0,z]} castShadow><extrudeGeometry args={[shape,{depth,curveSegments:32,bevelEnabled:false}]}/>{mat(id,c,metal)}</mesh>;
 return <group name="railway-servo-source" position={[...railwaySupplyAt]}>
 {tag('railway-supply-case',<>{box('railway-supply-case',[0,4,0],[76,2,50],'#c9d2df')}{box('railway-supply-case',[0,38,0],[76,2,50],'#dce2e9')}{[-37,37].map(x=>box('railway-supply-case',[x,21,0],[2,32,46],'#c9d2df'))}{ext('railway-supply-case',shapes.front,23,2,'#33384f')}{ext('railway-supply-case',shapes.back,-25,2,'#bdc8d6')}
  <Text font={font} position={[0,18.8,25.1]} fontSize={1.8} color="#e5dff5">REGULATED SERVO SOURCE</Text><Text font={font} position={[0,39.05,0]} rotation={[-Math.PI/2,0,0]} fontSize={3.3} color="#4e456b">ATLAS · 5 V DC</Text>
 </>)}
 {tag('railway-supply-feet',<>{[-29,29].flatMap(x=>[-18,18].map(z=>box('railway-supply-feet',[x,1.5,z],[8,3,8],'#343744')))}</>)}
 {tag('railway-supply-display',<>{ext('railway-supply-display',shapes.bezel,25,.8,'#202a3a')}<mesh ref={lcd} name="railway-supply-lcd" position={[0,28,24.7]}><boxGeometry args={[36,11,1]}/><meshStandardMaterial color="#687785" emissive="#000000" emissiveIntensity={.16} roughness={.3}/></mesh><Text font={font} position={[0,31.3,25.35]} fontSize={1.6} color="#24394a">SERVO OUTPUT</Text><Text ref={voltage} name="railway-supply-voltage" font={font} position={[0,26.8,25.35]} fontSize={4.7} color="#24394a">{inputs?.current.servoPower?'5.00 V':'OFF'}</Text></>)}
 {tag('railway-supply-switch',<group position={[27,28,25]}>{[[-1,2.9,2],[.7,3.5,1.4]].map(([z,r,len],n)=><mesh key={n} position={[0,0,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[r,r,len,32]}/>{mat('railway-supply-switch','#aab6c6',.8)}</mesh>)}<mesh ref={button} name="railway-supply-button" position={[0,0,2.2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2.6,2.6,2,32]}/>{mat('railway-supply-switch','#48536a')}</mesh><Text font={font} position={[0,-6,1]} fontSize={1.8} color="#e6dff5">OUTPUT</Text></group>)}
 {railwaySupplyPorts.map(p=>tag(p.id,<><group position={[p.x,13,0]}>{ext(p.id,shapes.collar,25,2.5,p.color)}{ext(p.id,shapes.socket,22,7,'#bbc6d3',.85)}<mesh position={[0,0,26]}><torusGeometry args={[1.9,.15,8,32]}/>{mat(p.id,'#bfa779',.7)}</mesh></group>{p.id==='railway-supply-reference'&&box(p.id,[10,15.4,21.7],[20,1,1],'#bda97c',.75)}<Text font={font} position={[p.x,6.9,25.1]} fontSize={1.55} color="#e6dff5">{p.name}</Text></>))}
 </group>;
}
export default memo(RailwaySupplyParts);
