import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Shape,Path,Vector3,CatmullRomCurve3,Group,type Mesh,type TubeGeometry} from 'three';
import {rewriteCubeSatTube} from './cubesat-tube-motion';
import {soapUsbPose,soapUsbHostFace,type SoapUsbMotion} from '../data/soap-dispenser-usb';
type P=readonly[number,number,number];
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function rect(w:number,h:number){const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;}
function hole(s:Shape,x:number,y:number,w:number,h:number){const p=new Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();s.holes.push(p);}
function ring(w:number,h:number){const s=rect(w,h);hole(s,0,0,w-.7,h-.7);return s;}
type Props={selected:string;choose:(id:string)=>void;powered:boolean;rows?:readonly string[];motion?:RefObject<SoapUsbMotion>};
function SoapUsbParts({selected,choose,powered,rows=[],motion}:Props){
 const shapes=useMemo(()=>{const side=rect(65,10);hole(side,-10,.5,13,5.6);const b=new Shape();b.moveTo(-4.9,-4.4);b.lineTo(4.9,-4.4);b.lineTo(4.9,3);b.lineTo(3.5,4.4);b.lineTo(-3.5,4.4);b.lineTo(-4.9,3);b.closePath();const h=new Path();h.moveTo(-4.55,-4.05);h.lineTo(-4.55,2.86);h.lineTo(-3.36,4.05);h.lineTo(3.36,4.05);h.lineTo(4.55,2.86);h.lineTo(4.55,-4.05);h.closePath();b.holes.push(h);return{side,b,a:ring(11.8,4.4),port:ring(12.8,5.4)};},[]);
 const extrusionSettings=useMemo(()=>new Map([1,10].map(depth=>[depth,{depth,bevelEnabled:false,curveSegments:24} as const])),[]);
 const root=useRef<Group>(null),last=useRef('');
 const pose=useMemo(()=>soapUsbPose(12,12),[]),curve=useMemo(()=>new CatmullRomCurve3(pose.points.map(p=>new Vector3(...p)),false,'centripetal'),[pose]);
 useFrame(()=>{if(!root.current)return;const m=motion?.current??{unoWithdrawal:powered?0:12,hostWithdrawal:powered?0:12},key=m.unoWithdrawal+'/'+m.hostWithdrawal;if(last.current===key)return;const p=soapUsbPose(m.unoWithdrawal,m.hostWithdrawal);root.current.getObjectByName('soap-usb-b-body')!.position.set(...p.uno);root.current.getObjectByName('soap-usb-a-body')!.position.set(...p.host);rewriteCubeSatTube((root.current.getObjectByName('soap-usb-cable-tube') as Mesh<TubeGeometry>).geometry,new CatmullRomCurve3(p.points.map(p=>new Vector3(...p)),false,'centripetal'));last.current=key;},-2);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const mat=(id:string,color:string,metal=0)=><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.33:.6}/>;
 const box=(id:string,p:P,size:P,color:string,metal=0)=><mesh key={id+p.join(',')} position={p} castShadow><boxGeometry args={[...size]}/>{mat(id,color,metal)}</mesh>;
 const extrude=(id:string,s:Shape,p:P,depth:number)=><mesh position={p} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[s,extrusionSettings.get(depth)!]}/>{mat(id,'#bac4d0',.8)}</mesh>;
 const owner=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} key={id} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group ref={root} name="soap-usb-hardware">
 <group name="soap-computer-assembly" position={[-45,0,0]}>{owner('soap-host-platform',<>{box('soap-host-platform',[-275,5,-30],[170,10,130],'#27344b')}{[-345,-205].flatMap(x=>[-80,20].map(z=><mesh key={x+'/'+z} name={'soap-host-foot-'+x+'-'+z} position={[x,-3,z]}><cylinderGeometry args={[5,5,6,32]}/>{mat('soap-host-platform','#51436e')}</mesh>))}</>)}
 {owner('soap-host-body',<>{box('soap-host-body',[-280,10.5,-20],[110,1,65],'#556078',.5)}{box('soap-host-body',[-280,20.5,-20],[110,1,65],'#8491a6',.5)}{box('soap-host-body',[-334.5,15.5,-20],[1,9,65],'#556078',.5)}{[-32,32].map(dz=>box('soap-host-body',[-280,15.5,dz-20],[108,9,1],'#556078',.5))}{extrude('soap-host-body',shapes.side,[-226,15.5,-20],1)}</>)}
 {owner('soap-host-input',<>{Array.from({length:4},(_,r)=>Array.from({length:11},(_,col)=>box('soap-host-input',[-325+col*9,21.7,-42+r*7],[7,.8,5],'#28364e')))}{box('soap-host-input',[-280,21.2,-1],[30,.3,17],'#64738d')}</>)}
 {owner('soap-host-display',<group position={[-280,22,-52]} rotation={[-.2,0,0]}>{box('soap-host-display',[0,32.5,0],[110,65,3],'#45516b',.5)}{box('soap-host-display',[0,32.5,1.6],[101,56,.2],'#20213a')}<Text font={font} position={[-46,54,1.8]} fontSize={3.2} color="#d3bbff" anchorX="left">Soap dispenser · Serial Monitor</Text><Text font={font} position={[-46,47,1.8]} fontSize={2.6} color="#e1d8f0" anchorX="left">{powered?'USB connected · 115200 baud':'USB disconnected · Uno off'}</Text>{(powered?rows.slice(-5):['Connect USB after wiring.']).map((row,n)=><Text key={n} font={font} position={[-46,37-n*6,1.8]} fontSize={2.4} color="#cfdbeb" anchorX="left">{row}</Text>)}</group>)}
 </group>{owner('soap-host-port',<group position={soapUsbHostFace}>{extrude('soap-host-port',shapes.port,[-10,0,0],10)}{box('soap-host-port',[-4.5,-1.2,0],[9,1.2,10],'#d8d0b6')}{[-3.75,-1.25,1.25,3.75].map(z=>box('soap-host-port',[-3.25,-.55,z],[4.5,.1,.8],'#c6b27a',.8))}</group>)}
 {owner('soap-usb-cable',<mesh name="soap-usb-cable-tube" castShadow><tubeGeometry args={[curve,120,1.5,12,false]}/>{mat('soap-usb-cable','#35476b')}</mesh>)}
 <group name="soap-usb-b-body" position={pose.uno}>
 {owner('soap-usb-b-shield',extrude('soap-usb-b-shield',shapes.b,[-6,0,0],10))}
 {owner('soap-usb-b-grip',<>{box('soap-usb-b-grip',[-12,0,0],[12,11,13],'#35476b')}<mesh position={[-21,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.8,4,6,24]}/>{mat('soap-usb-b-grip','#35476b')}</mesh></>)}
 {owner('soap-usb-b-contacts',<>{box('soap-usb-b-contacts',[-3.5,-.5,0],[5,5.9,7.5],'#d8d0b6')}{[-3.2,2.2].map(y=>box('soap-usb-b-contacts',[1.4,y,0],[4.8,.5,7.5],'#d8d0b6'))}{[-2,2].flatMap(z=>[-2.85,1.85].map(y=>box('soap-usb-b-contacts',[1.5,y,z],[4.6,.2,.9],'#c6b27a',.8)))}</>)}
 </group>
 <group name="soap-usb-a-body" position={pose.host}>
 {owner('soap-usb-a-shield',extrude('soap-usb-a-shield',shapes.a,[-4,0,0],10))}
 {owner('soap-usb-a-grip',<>{box('soap-usb-a-grip',[12,0,0],[12,8,14],'#35476b')}<mesh position={[21,0,0]} rotation={[0,0,-Math.PI/2]}><cylinderGeometry args={[1.8,4,6,24]}/>{mat('soap-usb-a-grip','#35476b')}</mesh></>)}
 {owner('soap-usb-a-contacts',<>{box('soap-usb-a-contacts',[1.1,.5,0],[9.8,1.7,10],'#d8d0b6')}{[-3.75,-1.25,1.25,3.75].map(z=>box('soap-usb-a-contacts',[.6,-.425,z],[8.8,.15,.8],'#c6b27a',.8))}</>)}
 </group></group>;
}
export default memo(SoapUsbParts);
