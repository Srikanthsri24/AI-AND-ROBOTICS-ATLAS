import {memo,useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {rainServoLeads,rainServoLeadRoute} from '../data/rain-servo-leads';
function RainServoLeadParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const curves=useMemo(()=>rainServoLeads.map((_,n)=>new CatmullRomCurve3(rainServoLeadRoute(n).map(p=>new Vector3(...p)))),[]);
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const box=(id:string,p:[number,number,number],size:[number,number,number],color:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.35:.65}/></mesh>;
 return <group name="rain-servo-factory-harness">
 {rainServoLeads.map((w,n)=><group key={w.id}>{tag(w.id,<><mesh name={w.id+'-jacket'} castShadow><tubeGeometry args={[curves[n],80,.45,10,false]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh>{[-1,1].map(side=><group key={side}>{box(w.id,[-44.2,15+side*.39,w.socketZ],[4,.14,.7],'#baa66e',.8)}</group>)}{box(w.id,[-40.5,15,w.socketZ],[3.5,.5,.5],'#baa66e',.8)}</>)}</group>)}
 {tag('rain-servo-plug',<>{[-1,1].map(side=><group key={side}>{box('rain-servo-plug',[-43,15+side*1.1,-30],[9,.6,8.2],'#2b3340')}{box('rain-servo-plug',[-43,15,-30+side*3.8],[9,1.6,.6],'#2b3340')}{box('rain-servo-plug',[-43,15,-30+side*1.27],[9,1.6,.6],'#2b3340')}</group>)}</>)}
 </group>;
}
export default memo(RainServoLeadParts);
