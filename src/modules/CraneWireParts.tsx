import {memo,useMemo,type ReactNode} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {CatmullRomCurve3,Vector3} from 'three';
import {craneConnections,craneLayout,type CranePoint as P} from '../data/crane-layout';
import {craneWireRoute} from '../data/crane-wires';
function CraneWireParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const curves=useMemo(()=>craneConnections.map((_,i)=>new CatmullRomCurve3(craneWireRoute(i).map(p=>new Vector3(...p)))),[]);
 const color=(id:string,c:string)=>id===selected?'#b78be8':c,tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>;
 const box=(id:string,p:P,size:P,c:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.35:.55}/></mesh>;
 return <group name="crane-control-jumpers">
 {craneConnections.map((w,n)=>{const c=color(w.id,w.color);return <group key={w.id}>{tag(w.id,<><mesh name={w.id+'-tube'} castShadow><tubeGeometry args={[curves[n],128,.45,12,false]}/><meshStandardMaterial color={c} roughness={.55}/></mesh>{[w.from,w.to].map((p,end)=>{const kind=end?w.toKind:w.fromKind;return <group key={end} name={w.id+(end?'-b':'-a')}>{kind==='pin'?<>{box(w.id,[p[0],p[1]-1.75,p[2]],[.64,6.5,.64],'#b9c1c8',.8)}{box(w.id,[p[0],p[1]+3.5,p[2]],[2.1,6,2.1],'#2d3846')}{box(w.id,[p[0],p[1]+7,p[2]],[1.25,1,1.25],w.color)}</>:kind==='jst'?<>{[-1,1].map(side=><group key={side}>{box(w.id,[p[0]-.4,p[1]+side*.31,p[2]],[2.8,.14,.7],'#c4b58d',.8)}</group>)}{box(w.id,[craneLayout.driver[0]-3.3,p[1],p[2]],[1.8,.7,.7],'#b8bfc4',.8)}<mesh position={[craneLayout.driver[0]-1.7,p[1],p[2]]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.25,.25,6.8,12]}/><meshStandardMaterial color={color(w.id,'#bb9e73')} metalness={.7} roughness={.4}/></mesh></>:<mesh position={[p[0],p[1],p[2]+4.85]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.3,.3,11.7,16]}/><meshStandardMaterial color={color(w.id,'#bda775')} metalness={.75} roughness={.4}/></mesh>}</group>;})}</>)}</group>;})}
 {tag('crane-jst-plug',<group position={[craneLayout.driver[0],craneLayout.driver[1],craneLayout.driver[2]-8.89]}>{box('crane-jst-plug',[-.55,2.9,0],[5.9,.6,8.6],'#deded3')}{box('crane-jst-plug',[-.55,6.4,0],[5.9,.6,8.6],'#deded3')}{[-4,4].map(z=><group key={z}>{box('crane-jst-plug',[-.55,4.65,z],[5.9,3,.6],'#deded3')}</group>)}{[-1,1].map(z=><group key={z}>{box('crane-jst-plug',[-.55,4.65,z],[5.9,3,.4],'#deded3')}</group>)}{box('crane-jst-plug',[-1,6.95,0],[2,.5,2],'#deded3')}</group>)}
 </group>;
}
export default memo(CraneWireParts);
