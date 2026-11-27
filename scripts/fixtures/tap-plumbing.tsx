import {createRoot} from 'react-dom/client';
import {useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows} from '@react-three/drei';
import {Box3,Vector3,Raycaster,type PerspectiveCamera} from 'three';
import Sensors from '../../src/modules/TapSensorParts';
import {soapSonar} from '../../src/data/soap-dispenser-sonar';
import {tapSensorParts} from '../../src/data/tap-sensors';
import Plumbing from '../../src/modules/TapPlumbingParts';
import Pump,{tapPumpParts} from '../../src/modules/TapPeristalticPump';
import {tapPlumbing,tapPlumbingParts,tapReturnPath} from '../../src/data/tap-plumbing';
import Label from '../../src/modules/CraneSurfaceLabel';
import Studio from '../../src/modules/SchoolBellStudioLight';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,floodAnchorWorld,type FloodAnchor} from '../../src/data/flood-surface';
function Scene({selected,choose,volume,levelOffset}:{selected:string;choose:(id:string)=>void;volume:number;levelOffset:number}){
 const s=useThree(),anchor=useRef<FloodAnchor|null>(null);
 useFrame(()=>Object.assign(window,{__tapPlumbingScene:s,__tapPlumbingSelected:selected,__tapPlumbingChoose:choose,__tapSensorAudit:()=>{s.scene.updateMatrixWorld(true);const bounds=(id:string)=>new Box3().setFromObject(s.scene.getObjectByName(id)!,true),board=bounds('tap-soap-sonar-pcb'),spacers=bounds('tap-sonar-spacers'),plate=bounds('tap-sonar-plate'),face=bounds('tap-level-face'),tank=bounds('tap-tank'),tx=bounds('tap-soap-sonar-transmitter'),rx=bounds('tap-soap-sonar-receiver');const ray=new Raycaster(),boreHits=soapSonar.holes.map(([x,z])=>{ray.set(new Vector3((45+x)*.01,4.3,(40+z)*.01),new Vector3(0,-1,0));return ray.intersectObjects(['tap-sonar-plate','tap-sonar-spacers','tap-soap-sonar-pcb'].map(id=>s.scene.getObjectByName(id)!),true).length;});return{boardTop:board.max.y*100,spacerBottom:spacers.min.y*100,spacerTop:spacers.max.y*100,plateBottom:plate.min.y*100,levelFace:face.min.z*100,tankFace:tank.max.z*100,transmitterFront:tx.min.y*100,receiverFront:rx.min.y*100,boreHits};},__tapDrainAudit:()=>{s.scene.updateMatrixWorld(true);const [x,,z]=tapReturnPath[0],ray=new Raycaster(new Vector3(x*.01,2,z*.01),new Vector3(0,-1,0));const basin=s.scene.getObjectByName('tap-basin')!,drain=s.scene.getObjectByName('tap-return')!;const open=ray.intersectObjects([basin,drain],true).length;ray.ray.origin.x=(x+15)*.01;const solid=ray.intersectObject(basin,true);return{open,solid:solid.length,top:solid[0]?.point.y};},__tapPlumbingAnchor:anchor,__tapPlumbingFocus:(id:string)=>{
  s.scene.updateMatrixWorld(true);const part=s.scene.getObjectByName(id);if(!part)return null;
  const box=new Box3().setFromObject(part,true),camera=s.camera as PerspectiveCamera,distance=Math.max(.08,box.getSize(new Vector3()).length()*1.7);camera.near=distance/250;camera.updateProjectionMatrix();
  const a=inspectCraneSurface(s.scene.getObjectByName('tap-complete-plumbing')!,camera,s.controls as any,id,box.getCenter(new Vector3()),distance,s.size.width,s.size.height);
  if(!a)return null;const point=floodAnchorWorld(a).project(camera);return {x:(point.x+1)*s.size.width/2,y:(1-point.y)*s.size.height/2};
 }}));
 return <><Studio/><color attach="background" args={['#eef0fa']}/><ambientLight intensity={1.3}/><directionalLight position={[3,5,4]} intensity={2.4}/><group name="tap-complete-plumbing" scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Plumbing {...{selected,choose}} volumeMl={volume}/><Sensors {...{selected,choose,levelOffset}}/><group position={[...tapPlumbing.pump]}><Pump {...{selected,choose}} cutaway/></group></group><ContactShadows position={[0,-.065,0]} opacity={.22} scale={10} blur={2} far={5} frames={1}/><Label anchor={anchor} selected={selected} name={[...tapPlumbingParts,...tapPumpParts,...tapSensorParts].find(p=>p[0]===selected)?.[1]??''}/><OrbitControls makeDefault target={[0,2.1,0]}/></>;
}
function Fixture(){const[selected,choose]=useState(''),[volume,setVolume]=useState(2600),[levelOffset,setLevelOffset]=useState(0);return <><div style={{height:670}}><Canvas camera={{position:[7,5.8,8],fov:42,near:.001}}><Scene {...{selected,choose,volume,levelOffset}}/></Canvas></div><button onClick={()=>setVolume(volume?0:2600)}>Empty / refill reservoir</button><button onClick={()=>setLevelOffset(levelOffset?0:25)}>Inspect level sensing face</button><output data-tap-plumbing-selected>{selected}</output><p>{[...tapPlumbingParts,...tapSensorParts].find(p=>p[0]===selected)?.[2]}</p></>}
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;background:#eef0fa;color:#172341;padding:20px;overflow:auto';const root=createRoot(el);root.render(<Fixture/>);return()=>root.unmount();}
