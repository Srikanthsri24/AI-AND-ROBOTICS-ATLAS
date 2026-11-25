import {memo,useMemo} from 'react';
import {CatmullRomCurve3,Quaternion,Vector3} from 'three';
import {floodWires,type FloodWire} from '../data/flood-wiring';
function Jumper({wire,selected,select,echoConnected}:{wire:FloodWire;selected:string;select:(id:string)=>void;echoConnected:boolean}){
 const points=useMemo(()=>wire.points.map(p=>new Vector3(...p)),[wire]),curve=useMemo(()=>new CatmullRomCurve3(points,false,'centripetal'),[points]),loose=wire.id==='wire-sonar-echo'&&!echoConnected;
 const activeCurve=useMemo(()=>{if(!loose)return curve;const p=points.map(p=>p.clone());p[p.length-1].add(new Vector3(10,9,-6));p[p.length-2].add(new Vector3(5,9,0));return new CatmullRomCurve3(p,false,'centripetal');},[curve,points,loose]),color=selected===wire.id?'#b78be8':wire.color;
 return <group userData={{partId:wire.id}} onClick={e=>{e.stopPropagation();select(wire.id);}}><mesh castShadow><tubeGeometry args={[activeCurve,100,.72,8,false]}/><meshStandardMaterial color={color} roughness={.48}/></mesh>{[0,1].map(end=>{const at=activeCurve.getPoint(end),outward=activeCurve.getTangent(end).normalize().multiplyScalar(end?-1:1),q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),outward);return <group key={end} position={at} quaternion={q}><mesh position={[0,3,0]}><boxGeometry args={[2.2,5,2.2]}/><meshStandardMaterial color={selected===wire.id?'#b78be8':'#252c39'} roughness={.6}/></mesh><mesh position={[0,-.8,0]}><boxGeometry args={[.55,2.6,.55]}/><meshStandardMaterial color={selected===wire.id?'#b78be8':'#c3bb9c'} metalness={.7} roughness={.3}/></mesh></group>;})}</group>;
}
function FloodWiring({selected,select,mountGapMm=230,echoConnected=true}:{selected:string;select:(id:string)=>void;mountGapMm?:number;echoConnected?:boolean}){const wires=useMemo(()=>floodWires(mountGapMm),[mountGapMm]);return <>{wires.map(wire=><Jumper key={wire.id} wire={wire} selected={selected} select={select} echoConnected={echoConnected}/>)}</>;}
export default memo(FloodWiring);
