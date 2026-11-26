import {memo,useMemo,useLayoutEffect,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import type {RailwayUsbMotion} from '../data/railway-usb';
import {Text} from '@react-three/drei';
import {CatmullRomCurve3,Group,Mesh,Path,Shape,Vector3,type Texture,type TubeGeometry} from 'three';
import {railwayUsbConnected,railwayUsbHostFace,railwayUsbPose} from '../data/railway-usb';
import type {RailwayPoint as P} from '../data/railway-electrical-layout';
import {rewriteCubeSatTube as rewriteTube} from './cubesat-tube-motion';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function rectangle(x:number,y:number){const s=new Shape();s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();return s;}
function opening(shape:Shape,x:number,y:number,w:number,h:number){const p=new Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();shape.holes.push(p);}
function rectangularRing(x:number,y:number,t:number){const s=rectangle(x,y);opening(s,0,0,2*(x-t),2*(y-t));return s;}
function bShield(){
 const s=new Shape();s.moveTo(-4.9,-4.4);s.lineTo(4.9,-4.4);s.lineTo(4.9,3);s.lineTo(3.5,4.4);s.lineTo(-3.5,4.4);s.lineTo(-4.9,3);s.closePath();
 const h=new Path();h.moveTo(-4.55,-4.05);h.lineTo(-4.55,2.86);h.lineTo(-3.36,4.05);h.lineTo(3.36,4.05);h.lineTo(4.55,2.86);h.lineTo(4.55,-4.05);h.closePath();s.holes.push(h);return s;
}
/** Actual authored receptacle fits, supported contacts and a continuous two-ended cable. Native mm. */
function RailwayUsbParts({selected,select,unoWithdrawal=0,hostWithdrawal=0,usb=false,screen=null,motion}:{selected:string;select:(id:string)=>void;unoWithdrawal?:number;hostWithdrawal?:number;usb?:boolean;screen?:Texture|null;motion?:RefObject<RailwayUsbMotion>}){
 const root=useRef<Group>(null),last=useRef('');
 const connected=railwayUsbConnected(usb,unoWithdrawal,hostWithdrawal),mated=unoWithdrawal===0&&hostWithdrawal===0;
 const geometry=useMemo(()=>{
  const side=new Shape();side.moveTo(100,2);side.lineTo(200,2);side.lineTo(200,10);side.lineTo(100,10);side.closePath();opening(side,165,6,13,5.6);
  return{side,hostSocket:rectangularRing(6.4,2.7,.35),a:rectangularRing(5.9,2.2,.35),b:bShield(),curve:new CatmullRomCurve3(railwayUsbPose().points.map(p=>new Vector3(...p)),false,'centripetal')};
 },[]);
 function update(u:number,h:number){const key=u+'/'+h;if(last.current===key)return;const pose=railwayUsbPose(u,h),r=root.current!;r.getObjectByName('railway-usb-b-body')!.position.set(...pose.uno);r.getObjectByName('railway-usb-a-body')!.position.set(...pose.host);rewriteTube((r.getObjectByName('railway-usb-cable-tube') as Mesh<TubeGeometry>).geometry,new CatmullRomCurve3(pose.points.map(p=>new Vector3(...p)),false,'centripetal'));last.current=key;}
 useLayoutEffect(()=>{if(!motion)update(unoWithdrawal,hostWithdrawal);},[unoWithdrawal,hostWithdrawal,motion]);
 useFrame(()=>{if(!motion)return;const m=motion.current;update(m.usbUno,m.usbHost);const on=railwayUsbConnected(m.usb,m.usbUno,m.usbHost),mated=m.usbUno===0&&m.usbHost===0;for(const[name,text]of[['railway-computer-usb-status',on?'USB CONNECTED':mated?'USB HOST OFF':'USB DISCONNECTED'],['railway-computer-usb-detail',on?'Serial monitor · 115200 baud':mated?'Host power off · Uno logic unpowered':'Connect Type A to host · Type B to Uno']]){const node=root.current?.getObjectByName(name) as any;if(node&&node.text!==text){node.text=text;node.sync?.();}}});
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const material=(id:string,c:string,metal=0)=><meshStandardMaterial color={selected===id?'#b78be8':c} metalness={metal} roughness={metal?.3:.6}/>;
 const box=(id:string,at:P,size:P,c:string,metal=0)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/>{material(id,c,metal)}</mesh>;
 const extrusion=(id:string,shape:Shape,x:number,depth:number,c:string,metal=0)=><mesh position={[x,0,0]} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:24}]}/>{material(id,c,metal)}</mesh>;
 const boot=(id:string,x:number,out:1|-1)=><mesh position={[x,0,0]} rotation={[0,0,-out*Math.PI/2]} castShadow><cylinderGeometry args={[1.8,4,6,32]}/>{material(id,'#2d446a')}</mesh>;
 return <group ref={root} name="railway-usb-host-hardware">
  {tag('railway-host-platform',box('railway-host-platform',[295,-3,260],[300,6,170],'#d9cbb4'))}
  <group position={[600,0,420]}>
  {tag('railway-computer-base',<>
   {box('railway-computer-base',[-285,1.5,-150],[150,1,100],'#414b62',.5)}
   {box('railway-computer-base',[-285,10.5,-150],[150,1,100],'#a6adbf',.6)}
   {box('railway-computer-base',[-359.25,6,-150],[1.5,8,100],'#64718a',.5)}
   {[-100.75,-199.25].map(z=><group key={z}>{box('railway-computer-base',[-285,6,z],[147,8,1.5],'#64718a',.5)}</group>)}
   {extrusion('railway-computer-base',geometry.side,-211.5,1.5,'#64718a',.5)}
   {[-345,-225].flatMap(x=>[-188,-112].map(z=><group key={`${x}/${z}`}>{box('railway-computer-base',[x,.5,z],[8,1,8],'#2c3343')}</group>))}
  </>)}
  {tag('railway-computer-input',<>
   {box('railway-computer-input',[-285,11.2,-160],[130,.4,48],'#3b4358')}
   {Array.from({length:5},(_,row)=>Array.from({length:12},(_,col)=><group key={`${row}/${col}`}>
    {box('railway-computer-input',[-340+col*10,11.8,-180+row*9],[8,.8,7],'#263044')}
   </group>))}
   {box('railway-computer-input',[-285,11.3,-132],[45,.6,5],'#263044')}
   {box('railway-computer-input',[-285,11.05,-118],[43,.08,20],'#78869c')}
  </>)}
  {tag('railway-computer-hinges',<>{[-340,-230].map(x=><mesh key={x} position={[x,12,-197]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[2.5,2.5,15,32]}/>{material('railway-computer-hinges','#65738c',.7)}</mesh>)}</>)}
  <group position={[-285,13,-197]} rotation={[-Math.PI/15,0,0]}>
   {tag('railway-computer-frame',box('railway-computer-frame',[0,45,0],[150,90,5],'#3e475f',.5))}
   {tag('railway-computer-screen',<>
    <mesh name="railway-computer-display" position={[0,46,2.9]}><boxGeometry args={[137,77,.7]}/><meshStandardMaterial color={selected==='railway-computer-screen'?'#b78be8':screen?'#ffffff':'#17223d'} map={screen} roughness={.35} emissive="#233e65" emissiveIntensity={.15}/></mesh>
    {!screen&&<>
     <Text position={[0,73,3.35]} font={font} fontSize={3.1} color="#eee5fc">ATLAS · RAILWAY CROSSING</Text>
     <Text name="railway-computer-usb-status" position={[0,49,3.35]} font={font} fontSize={3.2} color={connected?'#8fddc4':'#c5bbdc'}>{connected?'USB CONNECTED':mated?'USB HOST OFF':'USB DISCONNECTED'}</Text>
     <Text name="railway-computer-usb-detail" position={[0,37,3.35]} font={font} fontSize={2.4} color="#c5bbdc">{connected?'Serial monitor · 115200 baud':mated?'Host power off · Uno logic unpowered':'Connect Type A to host · Type B to Uno'}</Text>
     <Text position={[0,20,3.35]} font={font} fontSize={2} color="#a9b8d0">Standalone browser simulation</Text>
    </>}
   </>)}
  </group>
  {tag('railway-computer-usb-port',<group position={[railwayUsbHostFace[0]-600,railwayUsbHostFace[1],railwayUsbHostFace[2]-420]}>
   {extrusion('railway-computer-usb-port',geometry.hostSocket,-10,10,'#bcc5d0',.85)}
   {box('railway-computer-usb-port',[-4.5,-1.2,0],[9,1.2,10],'#d4ccaf')}
   {[-3.75,-1.25,1.25,3.75].map(z=><group key={z}>{box('railway-computer-usb-port',[-3.25,-.55,z],[4.5,.1,.8],'#c6b27a',.8)}</group>)}
  </group>)}
  </group>
  {tag('railway-usb-cable',<mesh name="railway-usb-cable-tube" castShadow><tubeGeometry args={[geometry.curve,200,1.5,12,false]}/>{material('railway-usb-cable','#2d446a')}</mesh>)}
  <group name="railway-usb-b-body">
   {tag('railway-usb-b-shield',extrusion('railway-usb-b-shield',geometry.b,-6,10,'#b8c2cd',.85))}
   {tag('railway-usb-b-grip',<>{box('railway-usb-b-grip',[-12,0,0],[12,11,13],'#2d446a')}{boot('railway-usb-b-grip',-21,-1)}</>)}
   {tag('railway-usb-b-contacts',<>
    {box('railway-usb-b-contacts',[-3.5,-.5,0],[5,5.9,7.5],'#d6cdb7')}
    {[-3.2,2.2].map(y=><group key={y}>{box('railway-usb-b-contacts',[1.4,y,0],[4.8,.5,7.5],'#d6cdb7')}</group>)}
    {[-2,2].flatMap(z=>[-2.85,1.85].map(y=><group key={`${z}/${y}`}>{box('railway-usb-b-contacts',[1.5,y,z],[4.6,.2,.9],'#c6b27a',.8)}</group>))}
   </>)}
  </group>
  <group name="railway-usb-a-body">
   {tag('railway-usb-a-shield',extrusion('railway-usb-a-shield',geometry.a,-4,10,'#b8c2cd',.85))}
   {tag('railway-usb-a-grip',<>{box('railway-usb-a-grip',[12,0,0],[12,8,14],'#2d446a')}{boot('railway-usb-a-grip',21,1)}</>)}
   {tag('railway-usb-a-contacts',<>
    {box('railway-usb-a-contacts',[1.1,.5,0],[9.8,1.7,10],'#d6cdb7')}
    {[-3.75,-1.25,1.25,3.75].map(z=><group key={z}>{box('railway-usb-a-contacts',[.6,-.425,z],[8.8,.15,.8],'#c6b27a',.8)}</group>)}
   </>)}
  </group>
 </group>;
}
export default memo(RailwayUsbParts);
