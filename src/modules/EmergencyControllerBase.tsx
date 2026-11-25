import {memo,useMemo,useState,type ReactNode}from'react';
import {useFrame} from '@react-three/fiber';
import {Text}from'@react-three/drei';
import {Path,Shape}from'three';
import {emergencyUsbHost as hostAt,emergencyUnoFeet as unoFeet,emergencyUsbCentre as usbCentre,emergencyUsbCurve}from'../data/emergency-controller';
const usbHost={at:hostAt};
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function EmergencyControllerBase({selected,select,powered=true,animateUsb=false}:{selected:string;select:(id:string)=>void;powered?:boolean;animateUsb?:boolean}){
 const [usbTravel,setUsbTravel]=useState(powered?0:18);useFrame((_,dt)=>{if(!animateUsb)return;const target=powered?0:18;setUsbTravel(old=>Math.abs(target-old)<.001?target:old+Math.sign(target-old)*Math.min(Math.abs(target-old),Math.min(dt,.05)*60));});const withdrawal=animateUsb?usbTravel:(powered?0:18);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const block=(at:[number,number,number],size:[number,number,number],color:string,metal=0)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={metal?.3:.6} metalness={metal}/></mesh>;
 const spacer=useMemo(()=>{const s=new Shape();s.absarc(0,0,2.65,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,1.4,0,Math.PI*2,true);s.holes.push(hole);return s;},[]),hostShell=useMemo(()=>{const s=new Shape();s.moveTo(-22,-10);s.lineTo(22,-10);s.lineTo(22,10);s.lineTo(-22,10);s.closePath();const hole=new Path();hole.moveTo(-7,-2.8);hole.lineTo(-7,2.8);hole.lineTo(7,2.8);hole.lineTo(7,-2.8);hole.closePath();s.holes.push(hole);return s;},[]);
 const cable=useMemo(()=>emergencyUsbCurve(withdrawal),[withdrawal]);
 return <>
 {tag('emergency-uno-feet',<>{unoFeet.map((p,i)=><group key={i} position={p}><mesh rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[spacer,{depth:8.2,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('emergency-uno-feet','#e1dbc9')} roughness={.7}/></mesh></group>)}</>)}
 {tag('emergency-uno-screws',<>{unoFeet.map((p,i)=><group key={i} position={p}><mesh position={[0,5.1,0]}><cylinderGeometry args={[1.15,1.15,9.8,14]}/><meshStandardMaterial color={c('emergency-uno-screws','#b9bec4')} metalness={.8} roughness={.3}/></mesh><mesh position={[0,10.5,0]}><cylinderGeometry args={[2.1,2.1,1.4,6]}/><meshStandardMaterial color={c('emergency-uno-screws','#b9bec4')} metalness={.8} roughness={.3}/></mesh></group>)}</>)}
 {tag('emergency-usb-cable',<><group position={[usbCentre[0]-withdrawal,usbCentre[1],usbCentre[2]]}>{[-1,1].map(side=><group key={side}>{block([-9,side*3.45,0],[8,.5,9],c('emergency-usb-cable','#b4bec7'),.8)}{block([-9,0,side*4.25],[8,6.4,.5],c('emergency-usb-cable','#b4bec7'),.8)}</group>)}{block([-19,0,0],[12,10,11],c('emergency-usb-cable','#34384c'))}{[-27,-29,-31].map(x=><group key={x}>{block([x,0,0],[1,6,7],c('emergency-usb-cable','#292f43'))}</group>)}</group><mesh><tubeGeometry args={[cable,80,1.8,12,false]}/><meshStandardMaterial color={c('emergency-usb-cable','#525879')} roughness={.6}/></mesh>{block([usbHost.at[0]+23,10,usbHost.at[2]],[12,4.5,12],c('emergency-usb-cable','#b4bec7'),.8)}{block([usbHost.at[0]+31,10,usbHost.at[2]],[10,7,15],c('emergency-usb-cable','#34384c'))}</>)}
 {tag('emergency-usb-host',<group position={usbHost.at}>{block([-1,0,0],[36,20,44],c('emergency-usb-host','#d9deea'))}<mesh position={[17,0,0]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[hostShell,{depth:2,bevelEnabled:false}]}/><meshStandardMaterial color={c('emergency-usb-host','#e9edf3')} roughness={.5}/></mesh><Text position={[0,10.1,0]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={3} color="#35415e">COMPUTER USB</Text></group>)}
 </>;
}
export default memo(EmergencyControllerBase);
