import {createRoot} from 'react-dom/client';
import {useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows} from '@react-three/drei';
import {Box3,Vector3,Raycaster,type PerspectiveCamera} from 'three';
import Plumbing from '../../src/modules/TapPlumbingParts';
import Pump,{tapPumpParts} from '../../src/modules/TapPeristalticPump';
import {tapPlumbing,tapPlumbingParts,tapReturnPath} from '../../src/data/tap-plumbing';
import Label from '../../src/modules/CraneSurfaceLabel';
import Studio from '../../src/modules/SchoolBellStudioLight';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,floodAnchorWorld,type FloodAnchor} from '../../src/data/flood-surface';
function Scene({selected,choose,volume}:{selected:string;choose:(id:string)=>void;volume:number}){
 const s=useThree(),anchor=useRef<FloodAnchor|null>(null);
 useFrame(()=>Object.assign(window,{__tapPlumbingScene:s,__tapPlumbingSelected:selected,__tapPlumbingChoose:choose,__tapDrainAudit:()=>{s.scene.updateMatrixWorld(true);const [x,,z]=tapReturnPath[0],ray=new Raycaster(new Vector3(x*.01,2,z*.01),new Vector3(0,-1,0));const basin=s.scene.getObjectByName('tap-basin')!,drain=s.scene.getObjectByName('tap-return')!;const open=ray.intersectObjects([basin,drain],true).length;ray.ray.origin.x=(x+15)*.01;const solid=ray.intersectObject(basin,true);return{open,solid:solid.length,top:solid[0]?.point.y};},__tapPlumbingAnchor:anchor,__tapPlumbingFocus:(id:string)=>{
  s.scene.updateMatrixWorld(true);const part=s.scene.getObjectByName(id);if(!part)return null;
  const box=new Box3().setFromObject(part,true),camera=s.camera as PerspectiveCamera,distance=Math.max(.08,box.getSize(new Vector3()).length()*1.7);camera.near=distance/250;camera.updateProjectionMatrix();
  const a=inspectCraneSurface(s.scene.getObjectByName('tap-complete-plumbing')!,camera,s.controls as any,id,box.getCenter(new Vector3()),distance,s.size.width,s.size.height);
  if(!a)return null;const point=floodAnchorWorld(a).project(camera);return {x:(point.x+1)*s.size.width/2,y:(1-point.y)*s.size.height/2};
 }}));
 return <><Studio/><color attach="background" args={['#eef0fa']}/><ambientLight intensity={1.3}/><directionalLight position={[3,5,4]} intensity={2.4}/><group name="tap-complete-plumbing" scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Plumbing {...{selected,choose}} volumeMl={volume}/><group position={[...tapPlumbing.pump]}><Pump {...{selected,choose}} cutaway/></group></group><ContactShadows position={[0,-.065,0]} opacity={.22} scale={10} blur={2} far={5} frames={1}/><Label anchor={anchor} selected={selected} name={[...tapPlumbingParts,...tapPumpParts].find(p=>p[0]===selected)?.[1]??''}/><OrbitControls makeDefault target={[0,2.1,0]}/></>;
}
function Fixture(){const[selected,choose]=useState(''),[volume,setVolume]=useState(2600);return <><div style={{height:670}}><Canvas camera={{position:[7,5.8,8],fov:42,near:.001}}><Scene {...{selected,choose,volume}}/></Canvas></div><button onClick={()=>setVolume(volume?0:2600)}>Empty / refill reservoir</button><output data-tap-plumbing-selected>{selected}</output><p>{tapPlumbingParts.find(p=>p[0]===selected)?.[2]}</p></>}
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;background:#eef0fa;color:#172341;padding:20px;overflow:auto';const root=createRoot(el);root.render(<Fixture/>);return()=>root.unmount();}
