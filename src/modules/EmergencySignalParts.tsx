import type {} from '@react-three/fiber';
import {useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,DoubleSide,Shape,Vector3} from 'three';
import {emergencyLampMounts,type EmergencyPoint as P} from '../data/emergency-corridor';
import {emergencyLampTerminal,emergencyLightTerminal} from '../data/emergency-signals';
export default function EmergencySignalParts({selected='',select=()=>{},powered=false,paths=false,beacon=false}:{selected?:string;select?:(id:string)=>void;powered?:boolean;paths?:boolean;beacon?:boolean}){
 const flat=useMemo(()=>{const radius=2.9,x=2.5,a=Math.acos(x/radius),edge=Math.sqrt(radius*radius-x*x),s=new Shape();s.moveTo(x,-edge);s.lineTo(x,edge);s.absarc(0,0,radius,a,Math.PI*2-a,false);s.closePath();return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b48bec':color,owner=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const metal=(id:string,p:P,size:P)=><mesh key={id+p.join(',')} position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,'#bcc2cb')} metalness={.8} roughness={.3}/></mesh>;
 const lead=(id:string,p:P,top:number)=>metal(id,[p[0],(p[1]+top)/2,p[2]],[.5,top-p[1],.5]);
 const bond=(id:string,points:P[],radius:number)=><mesh><tubeGeometry args={[new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal'),24,radius,8,false]}/><meshStandardMaterial color={c(id,'#bfc6d0')} metalness={.8} roughness={.3}/></mesh>;
 return <group name="emergency-signal-packages-mm">
 {emergencyLampMounts.map(m=>{const id=(part:string)=>`emergency-${m.key}-${part}`,base=m.top+2,on=powered&&(m.key==='beacon'?beacon:paths),red=m.key==='beacon',color=red?'#d7575f':'#ede9d6',emissive=on?(red?'#ff304d':'#fff1ce'):'#000000',a=emergencyLampTerminal(m.key,'anode'),k=emergencyLampTerminal(m.key,'cathode');
 const glass=<meshPhysicalMaterial color={c(id('lens'),color)} transparent opacity={.72} roughness={.19} clearcoat={.85} clearcoatRoughness={.14} emissive={emissive} emissiveIntensity={on?1.8:0}/>;
 return <group key={m.key}>
 {owner(id('lens'),<group name={`emergency-${m.key}-live-lens`}><mesh position={[m.x,base,m.z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[flat,{depth:.8,bevelEnabled:false,curveSegments:48}]}/>{glass}</mesh><mesh position={[m.x,base+2.9,m.z]} castShadow><cylinderGeometry args={[2.5,2.5,4.2,48]}/>{glass}</mesh><mesh position={[m.x,base+5,m.z]} castShadow><sphereGeometry args={[2.5,48,24,0,Math.PI*2,0,Math.PI/2]}/>{glass}</mesh>{on&&<pointLight position={[m.x,base+5,m.z+2]} color={red?'#ff5262':'#fff0cf'} intensity={red?.15:.32} distance={red?.6:1.05} decay={2}/>}</group>)}
 {owner(id('anode'),<>{lead(id('anode'),a,base+1.3)}{metal(id('anode'),[m.x-.9,base+1.35,m.z],[.9,.35,.65])}{bond(id('anode'),[[a[0],base+1.5,m.z],[m.x-1,base+2.8,m.z],[m.x+.35,base+1.6,m.z]],.035)}</>)}
 {owner(id('cathode'),<>{lead(id('cathode'),k,base+1.8)}{metal(id('cathode'),[m.x+.9,base+1.8,m.z],[1.1,.45,.65])}<mesh position={[m.x+.35,base+2,m.z]}><cylinderGeometry args={[1.55,.55,1.4,32,1,true]}/><meshStandardMaterial color={c(id('cathode'),'#bfc5ce')} metalness={.9} roughness={.23} side={DoubleSide}/></mesh><mesh position={[m.x+.35,base+1.3,m.z]}><cylinderGeometry args={[.55,.55,.2,24]}/><meshStandardMaterial color={c(id('cathode'),'#bfc5ce')} metalness={.9} roughness={.23}/></mesh>{metal(id('cathode'),[m.x+.35,base+1.5,m.z],[.55,.2,.55])}</>)}
 </group>;})}
 {owner('emergency-ldr-body',<><mesh position={[-245,133.5,-83]} castShadow><cylinderGeometry args={[2.5,2.5,1,48]}/><meshStandardMaterial color={c('emergency-ldr-body','#bc9865')} roughness={.85}/></mesh>{bond('emergency-ldr-body',[[-1.7,-1],[-1.2,-1],[-1.2,1],[-.6,1],[-.6,-1],[0,-1],[0,1],[.6,1],[.6,-1],[1.2,-1],[1.2,1],[1.7,1]].map(([x,z])=>[-245+x,134.04,-83+z] as P),.075)}</>)}
 {(['supply','signal']as const).map(kind=>owner('emergency-ldr-'+kind,lead('emergency-ldr-'+kind,emergencyLightTerminal(kind),133.3)))}
 </group>;
}
