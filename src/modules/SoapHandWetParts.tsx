import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo,useEffect} from 'react';
import type {BufferGeometry} from 'three';
import {DoubleSide} from 'three';
import type {SoapFluid,SoapWetMark} from '../data/soap-dispenser-fluid';
import {soapHandWetGeometry} from './soap-hand-wet-geometry';
function Patch({mark,geometries,selected,index}:{mark:SoapWetMark;geometries:BufferGeometry[];selected:boolean;index:number}){const geometry=useMemo(()=>soapHandWetGeometry(geometries,mark.x,mark.z,mark.packets),[geometries,mark.x,mark.z,mark.packets]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh name={'soap-hand-wet-mark-'+index} geometry={geometry}><meshPhysicalMaterial side={DoubleSide} color={selected?'#b78be8':'#1685b1'} roughness={.16} clearcoat={1}/></mesh>;}
function SoapHandWetParts({fluid,geometries,selected,choose}:{fluid?:SoapFluid;geometries:BufferGeometry[];selected:string;choose:(id:string)=>void}){return <group name='soap-hand-received-soap' userData={{partId:'soap-liquid'}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose('soap-liquid');}}>{fluid?.wetMarks.filter(m=>m.receiver==='hand').map((m,i)=><Patch key={m.x+'/'+m.z} mark={m} index={i} geometries={geometries} selected={selected==='soap-liquid'}/>)}</group>;}
export default memo(SoapHandWetParts);
