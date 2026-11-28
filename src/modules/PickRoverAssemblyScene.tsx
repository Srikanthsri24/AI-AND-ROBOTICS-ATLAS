import{memo,useLayoutEffect,useRef}from'react';
import{useThree,type ThreeEvent}from'@react-three/fiber';
import{OrbitControls}from'@react-three/drei';
import{Box3,Vector3,type Group,type Scene,type Camera,type PerspectiveCamera}from'three';
import Platform from'./PickRoverPlatform';
import Studio from'./SchoolBellStudioLight';
import Label from'./CraneSurfaceLabel';
import{fitPickAssemblyView}from'./pick-rover-assembly-view';
import{createPickAssemblyMotion,type PickAssemblyMotion}from'./pick-rover-assembly-motion';
import{inspectCraneSurface}from'./crane-inspection';
import{floodOwner,floodVisible,floodSurfaceAnchor,floodAnchorWorld,type FloodAnchor}from'../data/flood-surface';
import{pickRoverParts}from'../data/pick-rover-parts';
import{pickRoverRig}from'../data/pick-rover-motion';
import{pickServoSupplyLinks}from'../data/pick-rover-servo-supply-leads';
import{pickWheelSupplyLinks}from'../data/pick-rover-wheel-supply-leads';
import{pickMotorLinks}from'../data/pick-rover-motor-leads';
import{pickLogicLinks}from'../data/pick-rover-power-leads';
const links={servoFeedIds:pickServoSupplyLinks.map(l=>l.id),wheelSupplyLeadIds:pickWheelSupplyLinks.map(l=>l.id),motorLeadIds:pickMotorLinks.map(l=>l.id),logicLeadIds:pickLogicLinks.map(l=>l.id)};
const Hardware=memo(function Hardware({selected,choose}:{selected:string;choose:(id:string)=>void}){return <Platform angle={pickRoverRig.lowAngle} gap={60} showUsb showWheelBattery showServoSupply showLiftCable showJawCable {...links} {...{selected,choose}}/>;});
export type PickAssemblyApi={scene:Scene;camera:Camera;motion:PickAssemblyMotion;home:()=>void;inspect:(id:string,select?:boolean)=>{x:number;y:number}|null};
type Props={step:number;progress:number;selected:string;choose:(id:string)=>void;onReady:(api:PickAssemblyApi)=>void};
export default function PickRoverAssemblyScene({step,progress,selected,choose,onReady}:Props){
 const r=useThree(),hardware=useRef<Group>(null),motion=useRef<PickAssemblyMotion|null>(null),anchor=useRef<FloodAnchor|null>(null),live=useRef({step,progress,choose});live.current={step,progress,choose};
 useLayoutEffect(()=>{const engine=createPickAssemblyMotion(hardware.current!);motion.current=engine;engine.apply(live.current.step,live.current.progress);return()=>{engine.restore();motion.current=null;};},[]);
 useLayoutEffect(()=>{motion.current?.apply(step,progress);},[step,progress]);
 useLayoutEffect(()=>{anchor.current=null;},[step]);
 useLayoutEffect(()=>{const api:PickAssemblyApi={scene:r.scene,camera:r.camera,motion:motion.current!,home(){const v=r.get();if(hardware.current&&motion.current&&v.controls)fitPickAssemblyView(hardware.current,motion.current,live.current.step,live.current.progress,v.camera as PerspectiveCamera,v.controls as any,v.size.width,v.size.height);},inspect(id,select=true){const v=r.get(),root=hardware.current,part=root?.getObjectByName(id);if(!root||!part||!floodVisible(part)||!v.controls)return null;root.updateWorldMatrix(true,true);const box=new Box3().setFromObject(part,true),distance=Math.max(.14,box.getSize(new Vector3()).length()*1.8);v.camera.near=distance/300;v.camera.updateProjectionMatrix();const a=inspectCraneSurface(root,v.camera,v.controls as any,id,box.getCenter(new Vector3()),distance,v.size.width,v.size.height);if(!a)return null;if(select){anchor.current=a;live.current.choose(id);}const p=floodAnchorWorld(a).project(v.camera);return{x:(p.x+1)*v.size.width/2,y:(1-p.y)*v.size.height/2};}};onReady(api);const frame=requestAnimationFrame(api.home);return()=>cancelAnimationFrame(frame);},[r.scene,r.camera,r.size.width,r.size.height,onReady]);
 const part=pickRoverParts.find(p=>p.id===selected);
 return <><Studio/><color attach="background" args={['#efedf7']}/><ambientLight intensity={1}/><directionalLight position={[2,4,-3]} intensity={2.4} castShadow/>
 <group scale={.01} name="pick-assembly-workspace">
 <mesh position={[0,-83,60]} receiveShadow><boxGeometry args={[290,6,400]}/><meshStandardMaterial color="#d6d8e4" roughness={.85}/></mesh>
 {[[50,-35],[-50,-35],[79,185],[-79,185]].map(([x,z])=><group key={x+'/'+z} position={[x,-80,z]}><mesh position={[0,57.5,0]} castShadow><boxGeometry args={[6,115,6]}/><meshStandardMaterial color="#716092" metalness={.35} roughness={.45}/></mesh><mesh position={[0,1.5,0]}><boxGeometry args={[15,3,15]}/><meshStandardMaterial color="#45455d"/></mesh></group>)}
 <group ref={hardware} name="pick-assembly-hardware" onPointerDown={(e:ThreeEvent<PointerEvent>)=>{if(!floodOwner(e.object))return;e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Hardware {...{selected,choose}}/></group>
 </group><Label selected={selected} anchor={anchor} name={part?.label??'Selected component'}/><OrbitControls makeDefault target={[0,.3,.4]} minDistance={.12} maxDistance={14}/></>;
}
