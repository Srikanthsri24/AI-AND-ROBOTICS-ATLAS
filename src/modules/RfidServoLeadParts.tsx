import {memo,useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {rfidServoLeads,rfidServoLeadRoute} from '../data/rfid-servo-harness';
function RfidServoLeadParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const curves=useMemo(()=>rfidServoLeads.map((_,n)=>new CatmullRomCurve3(rfidServoLeadRoute(n).map(p=>new Vector3(...p)))),[]),c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],size:[number,number,number],color:string,metal=0)=><mesh position={p}><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.3:.6}/></mesh>;
 return <group name="rfid-servo-factory-harness">{rfidServoLeads.map((w,n)=><group key={w.id}>{tag(w.id,<><mesh name={w.id+'-jacket'}><tubeGeometry args={[curves[n],128,.45,10,false]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh>{[-1,1].map(side=><group key={side}>{box(w.id,[106.8,7.4+side*.39,w.socketZ],[4,.14,.7],'#baa77a',.8)}</group>)}{box(w.id,[110.5,7.4,w.socketZ],[3.5,.5,.5],'#baa77a',.8)}</>)}</group>)}{tag('rfid-servo-plug',<>{[-1,1].map(side=><group key={side}>{box('rfid-servo-plug',[108,7.4+side*1.1,-20],[9,.6,8.2],'#2b3442')}{box('rfid-servo-plug',[108,7.4,-20+side*3.8],[9,1.6,.6],'#2b3442')}{box('rfid-servo-plug',[108,7.4,-20+side*1.27],[9,1.6,.6],'#2b3442')}</group>)}</>)}</group>;
}
export default memo(RfidServoLeadParts);
