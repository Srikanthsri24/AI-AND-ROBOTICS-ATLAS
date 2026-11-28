import{Vector2}from'three';const reliefProfile=[[.85,-2],[2.7,-2],[1,2],[.85,2],[.85,-2]].map(p=>new Vector2(p[0],p[1]));import{memo,useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{pickServoSupplyLinks,pickServoSupplyLeadRoute}from'../data/pick-rover-servo-supply-leads';
function PickRoverServoSupplyLeads({selected,choose,connected=pickServoSupplyLinks.map(l=>l.id)}:{selected:string;choose:(id:string)=>void;connected?:readonly string[]}){
 const routes=useMemo(()=>pickServoSupplyLinks.map((_,i)=>pickServoSupplyLeadRoute(i)),[]),mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.45}),tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="pick-servo-supply-leads">{routes.filter(r=>connected.includes(r.link.id)).map(r=>{const id=(end:string)=>'pick-servo-feed-'+r.link.id+'-'+end;return <group key={r.link.id}>
 {tag(id('wire'),<mesh name={id('wire')+'-insulation'}><tubeGeometry args={[r.curve,240,.8,12,false]}/><meshStandardMaterial {...mat(id('wire'),r.link.color)}/></mesh>)}
 {tag(id('source'),<group position={r.socket.toArray()}><mesh name={id('source')+'-pin'} position={[0,0,18.525]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.56,1.56,4.05,32]}/><meshStandardMaterial {...mat(id('source'),'#baaa79',.8)}/></mesh><mesh name={id('source')+'-housing'} position={[0,0,23.55]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2.7,2.7,6,32]}/><meshStandardMaterial {...mat(id('source'),r.link.color)}/></mesh><mesh name={id('source')+'-strain-relief'} position={[0,0,28.55]} rotation={[Math.PI/2,0,0]}><latheGeometry args={[reliefProfile,32]}/><meshStandardMaterial {...mat(id('source'),'#2b3445')}/></mesh></group>)}
 {tag(id('tip'),<mesh name={id('tip')+'-copper'} position={[r.end.x,r.end.y,r.end.z+1.55]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.56,.56,3.1,24]}/><meshStandardMaterial {...mat(id('tip'),'#b98b58',.8)}/></mesh>)}
 </group>;})}</group>;
}
export default memo(PickRoverServoSupplyLeads);
