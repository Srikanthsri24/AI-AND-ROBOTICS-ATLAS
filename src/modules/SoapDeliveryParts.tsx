import type {ThreeEvent} from '@react-three/fiber';
import {memo} from 'react';
import {soapDropPosition,type SoapFluid} from '../data/soap-dispenser-fluid';
function SoapDeliveryParts({fluid,receiverY=0,selected,choose}:{fluid?:SoapFluid;receiverY?:number;selected:string;choose:(id:string)=>void}){if(!fluid)return null;return <group name='soap-visible-delivery' userData={{partId:'soap-liquid'}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose('soap-liquid');}}>{fluid.emissions.map(drop=>{const point=soapDropPosition(drop,fluid.clockMs,receiverY);return point?<mesh key={drop.id} name={'soap-delivery-drop-'+drop.id} position={[...point]} scale={[1,1.68,1]}><sphereGeometry args={[1.25,20,16]}/><meshPhysicalMaterial color={selected==='soap-liquid'?'#b78be8':'#1685b1'} roughness={.18} clearcoat={1}/></mesh>:null;})}</group>;}
export default memo(SoapDeliveryParts);
