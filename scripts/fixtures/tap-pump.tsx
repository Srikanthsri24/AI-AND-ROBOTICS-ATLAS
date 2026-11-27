import {createRoot} from 'react-dom/client';
import {useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Pump,{tapPumpParts} from '../../src/modules/TapPeristalticPump';
import Label from '../../src/modules/CraneSurfaceLabel';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,floodAnchorWorld,type FloodAnchor} from '../../src/data/flood-surface';
function Scene({selected,choose,cutaway,phase}:{selected:string;choose:(id:string)=>void;cutaway:boolean;phase:number}){
 const s=useThree(),anchor=useRef<FloodAnchor|null>(null);
 useFrame(()=>Object.assign(window,{__tapPumpScene:s,__tapPumpSelected:selected,__tapPumpChoose:choose,__tapPumpAnchor:anchor,__tapPumpFocus:(id:string)=>{
  s.scene.updateMatrixWorld(true);const part=s.scene.getObjectByName(id);if(!part)return null;
  const box=new Box3().setFromObject(part,true),camera=s.camera as PerspectiveCamera,distance=Math.max(.06,box.getSize(new Vector3()).length()*1.8);camera.near=distance/200;camera.updateProjectionMatrix();
  const a=inspectCraneSurface(s.scene.getObjectByName('tap-peristaltic-pump')!,camera,s.controls as any,id,box.getCenter(new Vector3()),distance,s.size.width,s.size.height);
  if(!a)return null;const point=floodAnchorWorld(a).project(camera);return {x:(point.x+1)*s.size.width/2,y:(1-point.y)*s.size.height/2};
 }}));
 return <><color attach="background" args={['#eef0fa']}/><ambientLight intensity={1.5}/><directionalLight position={[3,4,5]} intensity={3}/><group scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Pump {...{selected,choose,cutaway,phase}}/></group><Label anchor={anchor} selected={selected} name={tapPumpParts.find(p=>p[0]===selected)?.[1]??''}/><OrbitControls makeDefault target={[0,0,-.2]}/></>;
}
function Fixture(){const[selected,choose]=useState(''),[cutaway,setCutaway]=useState(true),[phase,setPhase]=useState(0);return <><div style={{height:600}}><Canvas camera={{position:[.7,.45,1.45],fov:42,near:.001}}><Scene {...{selected,choose,cutaway,phase}}/></Canvas></div><button onClick={()=>setCutaway(!cutaway)}>Toggle cover</button><button onClick={()=>setPhase(phase+.4)}>Rotate rollers</button><output data-tap-pump-selected>{selected}</output>{tapPumpParts.map(([id,title,description])=><button key={id} onClick={()=>choose(id)}>{title}{selected===id?' · '+description:''}</button>)}</>}
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;background:#eef0fa;color:#172341;padding:20px;overflow:auto';const root=createRoot(el);root.render(<Fixture/>);return()=>root.unmount();}
