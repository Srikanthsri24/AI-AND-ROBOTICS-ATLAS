import{fitPickRoverView}from'./pick-rover-view';import{useEffect,useRef}from'react';
import{useThree,useFrame,type ThreeEvent}from'@react-three/fiber';
import{OrbitControls,Text}from'@react-three/drei';
import{Box3,Vector3,type Scene,type Camera,type PerspectiveCamera}from'three';
import Model,{pickFoamPart}from'./PickRoverWorkingModel';
import Studio from'./SchoolBellStudioLight';
import Label from'./CraneSurfaceLabel';
import{inspectCraneSurface}from'./crane-inspection';
import{floodSurfaceAnchor,floodAnchorWorld,type FloodAnchor}from'../data/flood-surface';
import{pickRoverParts}from'../data/pick-rover-parts';
import{pickRoverCourse}from'../data/pick-rover-motion';
import type{PickRoverRig,PickRoverWiring}from'../data/pick-rover-rig';
export type PickOperatingSceneApi={scene:Scene;camera:Camera;home:()=>void;inspect:(id:string,select?:boolean)=>{x:number;y:number}|null};
type Props={rig:PickRoverRig;wiring:PickRoverWiring;selected:string;choose:(id:string)=>void;toggle:(source:'usb'|'motorSupply'|'servoSupply')=>void;onReady?:(api:PickOperatingSceneApi)=>void};
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function cpu(t:{gpuAccelerateSDF:boolean}|null){if(t)t.gpuAccelerateSDF=false;}
export default function PickRoverOperatingScene({rig,wiring,selected,choose,toggle,onReady}:Props){
 const r=useThree(),previous=useRef({x:rig.world.x,z:rig.world.z}),anchor=useRef<FloodAnchor|null>(null),current=useRef({choose});current.current={choose};
 useFrame(()=>{const v=r.get(),dx=(rig.world.x-previous.current.x)*.01,dz=(rig.world.z-previous.current.z)*.01;previous.current={x:rig.world.x,z:rig.world.z};if((dx||dz)&&v.controls){v.camera.position.x+=dx;v.camera.position.z+=dz;const c=v.controls as any;c.target.x+=dx;c.target.z+=dz;c.update();}});
 useEffect(()=>{const api:PickOperatingSceneApi={scene:r.scene,camera:r.camera,home(){const v=r.get(),root=v.scene.getObjectByName('pick-rover-working-model');if(root&&v.controls){fitPickRoverView(root,v.camera as PerspectiveCamera,v.controls as any,v.size.width,v.size.height);const pose=root.getObjectByName('pick-rover-working-pose');if(pose)previous.current={x:pose.position.x,z:pose.position.z};}},inspect(id,select=true){const v=r.get(),root=v.scene.getObjectByName('pick-rover-working-model'),part=root?.getObjectByName(id);if(!root||!part||!v.controls)return null;v.scene.updateMatrixWorld(true);const box=new Box3().setFromObject(part,true),distance=Math.max(id.startsWith('pick-usb-bank-')?.9:.12,box.getSize(new Vector3()).length()*1.8);v.camera.near=distance/300;v.camera.updateProjectionMatrix();const a=inspectCraneSurface(root,v.camera,v.controls as any,id,box.getCenter(new Vector3()),distance,v.size.width,v.size.height,id==='pick-usb-bank-switch'||id==='pick-usb-bank-led'?[new Vector3(0,.05,-1).transformDirection(part.matrixWorld).toArray() as [number,number,number]]:[]);if(!a)return null;if(select){anchor.current=a;current.current.choose(id);}const p=floodAnchorWorld(a).project(v.camera);return{x:(p.x+1)*v.size.width/2,y:(1-p.y)*v.size.height/2};}};onReady?.(api);const handle=requestAnimationFrame(()=>api.home());return()=>cancelAnimationFrame(handle);},[r.scene,r.camera,r.size.width,r.size.height,onReady]);
 const part=selected===pickFoamPart.id?pickFoamPart:pickRoverParts.find(p=>p.id===selected);
 return <><Studio/><color attach="background" args={['#f0eff8']}/><ambientLight intensity={1}/><directionalLight position={[2,4,3]} intensity={2.5} castShadow/><group scale={.01} onPointerDown={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}>
 <Model onUsbPowerToggle={()=>toggle('usb')} world={rig.world} usb={wiring.usb} wheelPower={wiring.motorSupply} servoPower={wiring.servoSupply} onWheelPowerToggle={()=>toggle('motorSupply')} onServoPowerToggle={()=>toggle('servoSupply')} {...{selected,choose}}/>
 <mesh position={[0,-2,0]} receiveShadow><boxGeometry args={[900,4,1000]}/><meshStandardMaterial color="#dce0e9" roughness={.93}/></mesh>
 {[pickRoverCourse.pickupZ,pickRoverCourse.deliveryZ].map((z,i)=><group key={z}><mesh position={[0,.15,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[80,70]}/><meshStandardMaterial color={i?'#d9caef':'#c8e4dc'} roughness={.9}/></mesh><Text ref={cpu} raycast={()=>null} font={font} position={[0,.25,z-43]} rotation={[-Math.PI/2,0,Math.PI]} fontSize={7} color={i?'#72539f':'#3f786a'}>{i?'DELIVER':'PICK UP'}</Text></group>)}
 </group><Label {...{anchor,selected}} name={part?.label??'Selected part'}/><OrbitControls makeDefault target={[0,.7,-.5]} minDistance={.1} maxDistance={12}/></>;
}
