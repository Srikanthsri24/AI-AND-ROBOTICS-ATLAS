import {rfidFittingPose,rfidFittingTotal} from '../data/rfid-fitting';
import {memo,useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {rfidWires} from '../data/rfid-wires';
function RfidWireParts({selected,choose,cursor=rfidFittingTotal}:{selected:string;choose:(id:string)=>void;cursor?:number}){
 const poses=useMemo(()=>rfidWires.map((_,n)=>rfidFittingPose(n,cursor)),[cursor]);
 const curves=useMemo(()=>poses.map(p=>new CatmullRomCurve3(p.points.map(p=>new Vector3(...p)))),[poses]),c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const box=(id:string,p:readonly number[],size:[number,number,number],color:string,metal=0)=><mesh position={[p[0],p[1],p[2]]}><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.3:.55}/></mesh>;
 const tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="rfid-circuit-jumpers">{rfidWires.map((w,n)=><group key={w.id} visible={poses[n].visible}>{tag(w.id,<><mesh name={w.id+'-jacket'}><tubeGeometry args={[curves[n],160,.45,10,false]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh>{[w.from,w.to].map((p,end)=>{const kind=end?w.toKind:w.fromKind;return <group key={end} position={[...(end?poses[n].destination:poses[n].source)]}>{kind==='pin'?<>{box(w.id,[p[0],p[1]-1.75,p[2]],[.64,6.5,.64],'#bfc6c7',.8)}{box(w.id,[p[0],p[1]+3.5,p[2]],[2.1,6,2.1],'#2d3542')}{box(w.id,[p[0],p[1]+7,p[2]],[1.25,1.1,1.25],w.color)}</>:kind==='clamp'?<mesh position={[p[0],p[1],p[2]+4.85]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.3,.3,11.7,12]}/><meshStandardMaterial color={c(w.id,'#bba77b')} metalness={.8} roughness={.3}/></mesh>:<>{box(w.id,[p[0]-1.55,p[1],p[2]],[6.5,.64,.64],'#bdc5c7',.8)}{box(w.id,[p[0]-6.9,p[1],p[2]],[4.2,2.1,2.1],'#2d3542')}{box(w.id,[p[0]-9.4,p[1],p[2]],[.8,1.25,1.25],w.color)}</>}</group>;})}</>)}</group>)}</group>;
}
export default memo(RfidWireParts);
