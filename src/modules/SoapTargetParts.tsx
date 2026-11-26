import type {ThreeEvent} from '@react-three/fiber';
import {memo} from 'react';
import {Text} from '@react-three/drei';
import {soapTargetSize,soapTargetPark} from '../data/soap-dispenser-target';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function SoapTargetParts({selected,choose,top=soapTargetPark}:{selected:string;choose:(id:string)=>void;top?:readonly[number,number,number]}){const color=selected==='soap-calibration-card'?'#b78be8':'#ebe8e1';return <group name='soap-calibration-card' userData={{partId:'soap-calibration-card'}} position={[...top]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose('soap-calibration-card');}}><mesh name='soap-card-solid' position={[0,-.5,0]}><boxGeometry args={[soapTargetSize[0],soapTargetSize[1],soapTargetSize[2]]}/><meshStandardMaterial color={color} roughness={.85}/></mesh><Text font={font} position={[0,.025,37]} rotation={[-Math.PI/2,0,0]} fontSize={3} color='#55456d' raycast={()=>null}>FLAT CALIBRATION TARGET</Text><Text font={font} position={[0,.025,43]} rotation={[-Math.PI/2,0,0]} fontSize={2} color='#635970' raycast={()=>null}>Keep level · measure to this face</Text></group>;}
export default memo(SoapTargetParts);
