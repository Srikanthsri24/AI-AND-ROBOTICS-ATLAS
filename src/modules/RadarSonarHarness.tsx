import {memo,useMemo,useLayoutEffect,useRef,type ReactNode} from 'react';
import {CatmullRomCurve3,Group,Mesh,TubeGeometry,Vector3} from 'three';
import {radarLeadPose,radarSonarLeads,type RadarHarnessPoint} from '../data/radar-harness';
import {radarYaw} from '../data/radar-workshop';
import {rewriteCubeSatTube as rewriteTube} from './cubesat-tube-motion';

function curve(index:number,heading:number,sonarWithdraw:number,unoWithdraw:number){return new CatmullRomCurve3(radarLeadPose(index,heading,sonarWithdraw,unoWithdraw).points.map(p=>new Vector3(...p)),false,'centripetal');}
/** Four independently selectable flexible wires and their eight real mating plugs. */
function RadarSonarHarness({selected,select,heading=90,sonarWithdraw=0,unoWithdraw=0}:{selected:string;select:(id:string)=>void;heading?:number;sonarWithdraw?:number;unoWithdraw?:number}){
 const root=useRef<Group>(null),initial=useMemo(()=>radarSonarLeads.map((_,index)=>curve(index,90,0,0)),[]);
 useLayoutEffect(()=>{const r=root.current;if(!r)return;for(let i=0;i<radarSonarLeads.length;i++){
  const lead=radarSonarLeads[i],pose=radarLeadPose(i,heading,sonarWithdraw,unoWithdraw);
  const wire=r.getObjectByName(lead.id+'-tube') as Mesh<TubeGeometry>;
  rewriteTube(wire.geometry,curve(i,heading,sonarWithdraw,unoWithdraw));
  const sonar=r.getObjectByName(lead.id+'-sonar-body')!,uno=r.getObjectByName(lead.id+'-uno-body')!;
  sonar.position.set(...pose.sonarPlug);sonar.rotation.y=radarYaw(heading);uno.position.set(...pose.unoPlug);
 }},[heading,sonarWithdraw,unoWithdraw]);
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,at:RadarHarnessPoint,size:RadarHarnessPoint,c:string,metal=0)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={selected===id?'#b78be8':c} roughness={metal?.3:.58} metalness={metal}/></mesh>;
 return <group ref={root} name="radar-sonar-harness">{radarSonarLeads.map((lead,i)=><group key={lead.id}>
  {tag(lead.id,<mesh name={lead.id+'-tube'} castShadow><tubeGeometry args={[initial[i],200,.65,10,false]}/><meshStandardMaterial color={selected===lead.id?'#b78be8':lead.color} roughness={.58}/></mesh>)}
  {tag(lead.id+'-sonar',<group name={lead.id+'-sonar-body'}>
   {box(lead.id+'-sonar',[0,50.45,0],[2.4,2.9,2.4],'#263241')}
   {[-1,1].map(side=><group key={side}>
    {box(lead.id+'-sonar',[side*.95,53.45,0],[.5,3.1,2.4],'#263241')}
    {box(lead.id+'-sonar',[0,53.45,side*.95],[1.4,3.1,.5],'#263241')}
    {box(lead.id+'-sonar',[side*.38,53.4,0],[.14,2.5,.8],'#c5b48b',.8)}
   </group>)}
  </group>)}
  {tag(lead.id+'-uno',<group name={lead.id+'-uno-body'}>
   {box(lead.id+'-uno',[0,5,0],[2.4,6,2.4],'#263241')}
   {box(lead.id+'-uno',[0,1,0],[.64,6,.64],'#c5b48b',.8)}
  </group>)}
 </group>)}</group>;
}
export default memo(RadarSonarHarness);
