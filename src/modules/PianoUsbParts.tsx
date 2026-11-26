import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Shape,Path,Vector3,CatmullRomCurve3,Group,type Mesh,type TubeGeometry} from 'three';
import {rewriteCubeSatTube} from './cubesat-tube-motion';
import {pianoUsbPose,pianoUsbHostFace,type PianoUsbMotion} from '../data/piano-usb';
import type {PianoPoint as P} from '../data/piano-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function rect(w:number,h:number){const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;}
function hole(s:Shape,x:number,y:number,w:number,h:number){const p=new Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();s.holes.push(p);}
function ring(w:number,h:number){const s=rect(w,h);hole(s,0,0,w-.7,h-.7);return s;}
type Props={selected:string;choose:(id:string)=>void;powered:boolean;rows?:readonly string[];motion?:RefObject<PianoUsbMotion>};
function PianoUsbParts({selected,choose,powered,rows=[],motion}:Props){
 const shapes=useMemo(()=>{const side=rect(65,10);hole(side,-10,.5,13,5.6);const b=new Shape();b.moveTo(-4.9,-4.4);b.lineTo(4.9,-4.4);b.lineTo(4.9,3);b.lineTo(3.5,4.4);b.lineTo(-3.5,4.4);b.lineTo(-4.9,3);b.closePath();const h=new Path();h.moveTo(-4.55,-4.05);h.lineTo(-4.55,2.86);h.lineTo(-3.36,4.05);h.lineTo(3.36,4.05);h.lineTo(4.55,2.86);h.lineTo(4.55,-4.05);h.closePath();b.holes.push(h);return{side,b,a:ring(11.8,4.4),port:ring(12.8,5.4)};},[]);
 const extrusionSettings=useMemo(()=>new Map([1,10].map(depth=>[depth,{depth,bevelEnabled:false,curveSegments:24} as const])),[]);
 const root=useRef<Group>(null),last=useRef('');
 const pose=useMemo(()=>pianoUsbPose(12),[]),curve=useMemo(()=>new CatmullRomCurve3(pose.points.map(p=>new Vector3(...p)),false,'centripetal'),[pose]);
 useFrame(()=>{if(!root.current)return;const m=motion?.current??{unoWithdrawal:powered?0:12,hostWithdrawal:0},key=m.unoWithdrawal+'/'+m.hostWithdrawal;if(last.current===key)return;const p=pianoUsbPose(m.unoWithdrawal,m.hostWithdrawal);root.current.getObjectByName('piano-usb-b-body')!.position.set(...p.uno);root.current.getObjectByName('piano-usb-a-body')!.position.set(...p.host);rewriteCubeSatTube((root.current.getObjectByName('piano-usb-cable-tube') as Mesh<TubeGeometry>).geometry,new CatmullRomCurve3(p.points.map(p=>new Vector3(...p)),false,'centripetal'));last.current=key;},-2);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const mat=(id:string,color:string,metal=0)=><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.33:.6}/>;
 const box=(id:string,p:P,size:P,color:string,metal=0)=><mesh key={id+p.join(',')} position={p} castShadow><boxGeometry args={[...size]}/>{mat(id,color,metal)}</mesh>;
 const extrude=(id:string,s:Shape,p:P,depth:number)=><mesh position={p} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[s,extrusionSettings.get(depth)!]}/>{mat(id,'#bac4d0',.8)}</mesh>;
 const owner=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} key={id} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group ref={root} name="piano-usb-hardware">
 {owner('piano-host-platform',box('piano-host-platform',[-185,4,-10],[130,8,130],'#b69b78'))}
 {owner('piano-host-body',<>{box('piano-host-body',[-190,8.5,0],[110,1,65],'#556078',.5)}{box('piano-host-body',[-190,18.5,0],[110,1,65],'#8491a6',.5)}{box('piano-host-body',[-244.5,13.5,0],[1,9,65],'#556078',.5)}{[-32,32].map(dz=>box('piano-host-body',[-190,13.5,dz],[108,9,1],'#556078',.5))}{extrude('piano-host-body',shapes.side,[-136,13.5,0],1)}</>)}
 {owner('piano-host-input',<>{Array.from({length:4},(_,r)=>Array.from({length:11},(_,col)=>box('piano-host-input',[-235+col*9,19.7,-22+r*7],[7,.8,5],'#28364e')))}{box('piano-host-input',[-190,19.2,19],[30,.3,17],'#64738d')}</>)}
 {owner('piano-host-display',<group position={[-190,20,-32]} rotation={[-.2,0,0]}>{box('piano-host-display',[0,32.5,0],[110,65,3],'#45516b',.5)}{box('piano-host-screen-surface',[0,32.5,1.6],[101,56,.2],'#20213a')}<Text font={font} position={[-46,54,1.8]} fontSize={3.2} color="#d3bbff" anchorX="left">Piano · Serial Monitor</Text><Text font={font} position={[-46,47,1.8]} fontSize={2.6} color="#e1d8f0" anchorX="left">{powered?'USB connected · 115200 baud':'USB disconnected · Uno off'}</Text>{(powered?rows.slice(-5):['Connect USB after wiring.']).map((row,n)=><Text key={n} font={font} position={[-46,37-n*6,1.8]} fontSize={2.4} color="#cfdbeb" anchorX="left">{row}</Text>)}</group>)}
 {owner('piano-host-port',<group position={pianoUsbHostFace}>{extrude('piano-host-port',shapes.port,[-10,0,0],10)}{box('piano-host-port',[-4.5,-1.2,0],[9,1.2,10],'#d8d0b6')}{[-3.75,-1.25,1.25,3.75].map(z=>box('piano-host-port',[-3.25,-.55,z],[4.5,.1,.8],'#c6b27a',.8))}</group>)}
 {owner('piano-usb-cable',<mesh name="piano-usb-cable-tube" castShadow><tubeGeometry args={[curve,120,1.5,12,false]}/>{mat('piano-usb-cable','#35476b')}</mesh>)}
 <group name="piano-usb-b-body" position={pose.uno}>
 {owner('piano-usb-b-shield',extrude('piano-usb-b-shield',shapes.b,[-6,0,0],10))}
 {owner('piano-usb-b-grip',<>{box('piano-usb-b-grip',[-12,0,0],[12,11,13],'#35476b')}<mesh position={[-21,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.8,4,6,24]}/>{mat('piano-usb-b-grip','#35476b')}</mesh></>)}
 {owner('piano-usb-b-contacts',<>{box('piano-usb-b-contacts',[-3.5,-.5,0],[5,5.9,7.5],'#d8d0b6')}{[-3.2,2.2].map(y=>box('piano-usb-b-contacts',[1.4,y,0],[4.8,.5,7.5],'#d8d0b6'))}{[-2,2].flatMap(z=>[-2.85,1.85].map(y=>box('piano-usb-b-contacts',[1.5,y,z],[4.6,.2,.9],'#c6b27a',.8)))}</>)}
 </group>
 <group name="piano-usb-a-body" position={pose.host}>
 {owner('piano-usb-a-shield',extrude('piano-usb-a-shield',shapes.a,[-4,0,0],10))}
 {owner('piano-usb-a-grip',<>{box('piano-usb-a-grip',[12,0,0],[12,8,14],'#35476b')}<mesh position={[21,0,0]} rotation={[0,0,-Math.PI/2]}><cylinderGeometry args={[1.8,4,6,24]}/>{mat('piano-usb-a-grip','#35476b')}</mesh></>)}
 {owner('piano-usb-a-contacts',<>{box('piano-usb-a-contacts',[1.1,.5,0],[9.8,1.7,10],'#d8d0b6')}{[-3.75,-1.25,1.25,3.75].map(z=>box('piano-usb-a-contacts',[.6,-.425,z],[8.8,.15,.8],'#c6b27a',.8))}</>)}
 </group></group>;
}
export default memo(PianoUsbParts);
