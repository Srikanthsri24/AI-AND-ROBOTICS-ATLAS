import {memo,useMemo,useLayoutEffect,useRef,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {CatmullRomCurve3,Group,Mesh,Path,Shape,Vector3,type Texture,type TubeGeometry} from 'three';
import {raArmUsbConnected,raArmUsbHostFace,raArmUsbPose} from '../data/rover-arm-usb';
import type{RaArmUsbPoint as P}from'../data/rover-arm-usb';
import {rewriteCubeSatTube as rewriteTube} from './cubesat-tube-motion';
function cpu(t:{gpuAccelerateSDF:boolean}|null){if(t)t.gpuAccelerateSDF=false;}
const extrusionOptions={1.5:{depth:1.5,bevelEnabled:false,curveSegments:24},10:{depth:10,bevelEnabled:false,curveSegments:24}};
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function rectangle(x:number,y:number){const s=new Shape();s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();return s;}
function opening(shape:Shape,x:number,y:number,w:number,h:number){const p=new Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();shape.holes.push(p);}
function rectangularRing(x:number,y:number,t:number){const s=rectangle(x,y);opening(s,0,0,2*(x-t),2*(y-t));return s;}
function bShield(){
 const s=new Shape();s.moveTo(-4.9,-4.4);s.lineTo(4.9,-4.4);s.lineTo(4.9,3);s.lineTo(3.5,4.4);s.lineTo(-3.5,4.4);s.lineTo(-4.9,3);s.closePath();
 const h=new Path();h.moveTo(-4.55,-4.05);h.lineTo(-4.55,2.86);h.lineTo(-3.36,4.05);h.lineTo(3.36,4.05);h.lineTo(4.55,2.86);h.lineTo(4.55,-4.05);h.closePath();s.holes.push(h);return s;
}
/** Actual authored receptacle fits, supported contacts and a continuous two-ended cable. Native mm. */
function RoverArmUsbParts({selected,select,unoWithdrawal=0,hostWithdrawal=0,usb=false,screen=null}:{selected:string;select:(id:string)=>void;unoWithdrawal?:number;hostWithdrawal?:number;usb?:boolean;screen?:Texture|null}){
 const root=useRef<Group>(null),last=useRef('');
 const connected=raArmUsbConnected(usb,unoWithdrawal,hostWithdrawal),mated=unoWithdrawal===0&&hostWithdrawal===0;
 const geometry=useMemo(()=>{
  const side=new Shape();side.moveTo(100,2);side.lineTo(200,2);side.lineTo(200,10);side.lineTo(100,10);side.closePath();opening(side,165,6,13,5.6);
  return{side,hostSocket:rectangularRing(6.4,2.7,.35),a:rectangularRing(5.9,2.2,.35),b:bShield(),curve:new CatmullRomCurve3(raArmUsbPose().points.map(p=>new Vector3(...p)),false,'centripetal')};
 },[]);
 function update(u:number,h:number){const key=u+'/'+h;if(last.current===key)return;const pose=raArmUsbPose(u,h),r=root.current!;r.getObjectByName('ra-arm-usb-b-body')!.position.set(...pose.uno);r.getObjectByName('ra-arm-usb-a-body')!.position.set(...pose.host);rewriteTube((r.getObjectByName('ra-arm-usb-cable-tube') as Mesh<TubeGeometry>).geometry,new CatmullRomCurve3(pose.points.map(p=>new Vector3(...p)),false,'centripetal'));last.current=key;}
 useLayoutEffect(()=>{update(unoWithdrawal,hostWithdrawal);},[unoWithdrawal,hostWithdrawal]);
 const tag=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const material=(id:string,c:string,metal=0)=><meshStandardMaterial color={selected===id?'#b78be8':c} metalness={metal} roughness={metal?.3:.6}/>;
 const box=(id:string,at:P,size:P,c:string,metal=0)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/>{material(id,c,metal)}</mesh>;
 const extrusion=(id:string,shape:Shape,x:number,depth:1.5|10,c:string,metal=0)=><mesh position={[x,0,0]} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[shape,extrusionOptions[depth]]}/>{material(id,c,metal)}</mesh>;
 const boot=(id:string,x:number,out:1|-1)=><mesh position={[x,0,0]} rotation={[0,0,-out*Math.PI/2]} castShadow><cylinderGeometry args={[1.8,4,6,32]}/>{material(id,'#2d446a')}</mesh>;
 return <group ref={root} name="ra-arm-usb-host-hardware">
  {tag('ra-arm-computer-base',<>
   {box('ra-arm-computer-base',[-285,1.5,-150],[150,1,100],'#414b62',.5)}
   {box('ra-arm-computer-base',[-285,10.5,-150],[150,1,100],'#a6adbf',.6)}
   {box('ra-arm-computer-base',[-359.25,6,-150],[1.5,8,100],'#64718a',.5)}
   {[-100.75,-199.25].map(z=><group key={z}>{box('ra-arm-computer-base',[-285,6,z],[147,8,1.5],'#64718a',.5)}</group>)}
   {extrusion('ra-arm-computer-base',geometry.side,-211.5,1.5,'#64718a',.5)}
   {[-345,-225].flatMap(x=>[-188,-112].map(z=><group key={`${x}/${z}`}>{box('ra-arm-computer-base',[x,.5,z],[8,1,8],'#2c3343')}</group>))}
  </>)}
  {tag('ra-arm-computer-input',<>
   {box('ra-arm-computer-input',[-285,11.2,-160],[130,.4,48],'#3b4358')}
   {Array.from({length:5},(_,row)=>Array.from({length:12},(_,col)=><group key={`${row}/${col}`}>
    {box('ra-arm-computer-input',[-340+col*10,11.8,-180+row*9],[8,.8,7],'#263044')}
   </group>))}
   {box('ra-arm-computer-input',[-285,11.3,-132],[45,.6,5],'#263044')}
   {box('ra-arm-computer-input',[-285,11.05,-118],[43,.08,20],'#78869c')}
  </>)}
  {tag('ra-arm-computer-hinges',<>{[-340,-230].map(x=><mesh key={x} position={[x,12,-197]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[2.5,2.5,15,32]}/>{material('ra-arm-computer-hinges','#65738c',.7)}</mesh>)}</>)}
  <group position={[-285,13,-197]} rotation={[-Math.PI/15,0,0]}>
   {tag('ra-arm-computer-frame',box('ra-arm-computer-frame',[0,45,0],[150,90,5],'#3e475f',.5))}
   {tag('ra-arm-computer-screen',<>
    <mesh name="ra-arm-computer-display" position={[0,46,2.9]}><boxGeometry args={[137,77,.7]}/><meshStandardMaterial color={screen?'#ffffff':'#17223d'} map={screen} roughness={.35} emissive="#233e65" emissiveIntensity={.15}/></mesh>
    {[-69.5,69.5].map(x=><group key={x}>{box('ra-arm-computer-screen',[x,46,3.3],[1,79,.2],'#3e475f')}</group>)}{[7,85].map(y=><group key={y}>{box('ra-arm-computer-screen',[0,y,3.3],[139,1,.2],'#3e475f')}</group>)}
    {!screen&&<>
     <Text ref={cpu} position={[0,73,3.35]} font={font} fontSize={4} color="#eee5fc">ATLAS · ARM WORKSHOP</Text>
     <Text ref={cpu} name="ra-arm-computer-usb-status" position={[0,49,3.35]} font={font} fontSize={5} color={connected?'#8fddc4':'#c5bbdc'}>{connected?'USB CONNECTED':mated?'USB HOST OFF':'USB DISCONNECTED'}</Text>
     <Text ref={cpu} name="ra-arm-computer-usb-detail" position={[0,37,3.35]} font={font} fontSize={3.1} color="#c5bbdc">{connected?'Serial monitor · 115200 baud':mated?'Host power off · Uno logic unpowered':'Connect Type A to host · Type B to Uno'}</Text>
     <Text ref={cpu} position={[0,20,3.35]} font={font} fontSize={2.5} color="#a9b8d0">Standalone browser simulation</Text>
    </>}
   </>)}
  </group>
  {tag('ra-arm-computer-usb-port',<group position={raArmUsbHostFace}>
   {extrusion('ra-arm-computer-usb-port',geometry.hostSocket,-10,10,'#bcc5d0',.85)}
   {box('ra-arm-computer-usb-port',[-4.5,-1.2,0],[9,1.2,10],'#d4ccaf')}
   {[-3.75,-1.25,1.25,3.75].map(z=><group key={z}>{box('ra-arm-computer-usb-port',[-3.25,-.55,z],[4.5,.1,.8],'#c6b27a',.8)}</group>)}
  </group>)}
  {tag('ra-arm-usb-cable',<mesh name="ra-arm-usb-cable-tube" castShadow><tubeGeometry args={[geometry.curve,200,1.5,12,false]}/>{material('ra-arm-usb-cable','#2d446a')}</mesh>)}
  <group name="ra-arm-usb-b-body">
   {tag('ra-arm-usb-b-shield',extrusion('ra-arm-usb-b-shield',geometry.b,-6,10,'#b8c2cd',.85))}
   {tag('ra-arm-usb-b-grip',<>{box('ra-arm-usb-b-grip',[-12,0,0],[12,11,13],'#2d446a')}{boot('ra-arm-usb-b-grip',-21,-1)}</>)}
   {tag('ra-arm-usb-b-contacts',<>
    {box('ra-arm-usb-b-contacts',[-3.5,-.5,0],[5,5.9,7.5],'#d6cdb7')}
    {[-3.2,2.2].map(y=><group key={y}>{box('ra-arm-usb-b-contacts',[1.4,y,0],[4.8,.5,7.5],'#d6cdb7')}</group>)}
    {[-2,2].flatMap(z=>[-2.85,1.85].map(y=><group key={`${z}/${y}`}>{box('ra-arm-usb-b-contacts',[1.5,y,z],[4.6,.2,.9],'#c6b27a',.8)}</group>))}
   </>)}
  </group>
  <group name="ra-arm-usb-a-body">
   {tag('ra-arm-usb-a-shield',extrusion('ra-arm-usb-a-shield',geometry.a,-4,10,'#b8c2cd',.85))}
   {tag('ra-arm-usb-a-grip',<>{box('ra-arm-usb-a-grip',[12,0,0],[12,8,14],'#2d446a')}{boot('ra-arm-usb-a-grip',21,1)}</>)}
   {tag('ra-arm-usb-a-contacts',<>
    {box('ra-arm-usb-a-contacts',[1.1,.5,0],[9.8,1.7,10],'#d6cdb7')}
    {[-3.75,-1.25,1.25,3.75].map(z=><group key={z}>{box('ra-arm-usb-a-contacts',[.6,-.425,z],[8.8,.15,.8],'#c6b27a',.8)}</group>)}
   </>)}
  </group>
 </group>;
}
export default memo(RoverArmUsbParts);
