import {memo,useMemo} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {mq2Wires,mq2WireRoute,type Mq2Mode} from '../data/mq2-wires';
function Mq2WireParts({selected,choose,mode}:{selected:string;choose:(id:string)=>void;mode:Mq2Mode}){
 const wires=useMemo(()=>mq2Wires(mode),[mode]),curves=useMemo(()=>wires.map((w,n)=>new CatmullRomCurve3(mq2WireRoute(w,n).map(p=>new Vector3(...p)))),[wires]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 return <group name="mq2-jumpers">{wires.map((w,n)=><group key={w.id} name={w.id} userData={{partId:w.id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(w.id);}}><mesh name={w.id+'-jacket'} castShadow><tubeGeometry args={[curves[n],128,.45,10,false]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh>{[w.from,w.to].map((p,end)=>{const female=end===0&&w.fromKind==='female';return <group key={end}>{female?<group position={[p[0]+2.5,p[1],p[2]]}><mesh position={[0,.85,0]}><boxGeometry args={[9,1.1,2.1]}/><meshStandardMaterial color={c(w.id,'#29323e')}/></mesh>{[-1,1].map(side=><mesh key={side} position={[0,0,side*.8]}><boxGeometry args={[9,.6,.5]}/><meshStandardMaterial color={c(w.id,'#29323e')}/></mesh>)}<mesh position={[0,-.85,0]}><boxGeometry args={[9,1.1,2.1]}/><meshStandardMaterial color={c(w.id,'#29323e')}/></mesh></group>:<><mesh position={[p[0],p[1]-1.75,p[2]]}><boxGeometry args={[.64,6.5,.64]}/><meshStandardMaterial color={c(w.id,'#bdc3c7')} metalness={.8} roughness={.35}/></mesh><mesh position={[p[0],p[1]+3.5,p[2]]}><boxGeometry args={[2.1,6,2.1]}/><meshStandardMaterial color={c(w.id,'#29323e')} roughness={.6}/></mesh><mesh position={[p[0],p[1]+7,p[2]]}><boxGeometry args={[1.25,1.1,1.25]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh></>}</group>;})}</group>)}</group>;
}
export default memo(Mq2WireParts);
