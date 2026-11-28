import { useLayoutEffect, useRef, type ElementRef } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Vector3, type Group, type Scene, type Camera, type PerspectiveCamera } from 'three';
import Platform from './PickRoverPlatform';
import Protectors from './PickRoverCableProtectors';
import Studio from './SchoolBellStudioLight';
import Label from './CraneSurfaceLabel';
import { createPickAssemblyMotion, type PickAssemblyMotion } from './pick-rover-assembly-motion';
import { inspectCraneSurface } from './crane-inspection';
import { floodOwner, floodVisible, floodSurfaceAnchor, floodAnchorWorld, type FloodAnchor } from '../data/flood-surface';
import { pickMechanicalAssembly } from '../data/pick-rover-assembly';
import { pickRoverParts } from '../data/pick-rover-parts';
import { pickRoverRig } from '../data/pick-rover-motion';
import { pickLogicLinks } from '../data/pick-rover-power-leads';
import { pickMotorLinks } from '../data/pick-rover-motor-leads';
import { pickWheelSupplyLinks } from '../data/pick-rover-wheel-supply-leads';
import { pickServoSupplyLinks } from '../data/pick-rover-servo-supply-leads';
import {createPickJawFittingMotion} from './pick-rover-jaw-fitting-motion';
import {createPickLiftFittingMotion} from './pick-rover-lift-fitting-motion';
const unloadedAssemblyStep=pickMechanicalAssembly.findIndex(step=>step.id==='usb-cable-insertion');
if(unloadedAssemblyStep<0)throw Error('Unloaded calibration requires the completed USB connection stage');
export type PickCableDressingSceneApi = { scene: Scene; camera: Camera; motion: PickAssemblyMotion;  inspect: (id: string, select?: boolean) => {x:number;y:number}|null; home: () => void };
export default function PickRoverCableDressingScene({ progress, selected, choose, onReady }: { progress:number; selected:string; choose:(id:string)=>void; onReady:(api:PickCableDressingSceneApi)=>void }) {
  const r = useThree(), orbit = useRef<ElementRef<typeof OrbitControls>>(null), root = useRef<Group>(null), motion = useRef<PickAssemblyMotion | null>(null), fitting=useRef<ReturnType<typeof createPickLiftFittingMotion>|null>(null), anchor = useRef<FloodAnchor | null>(null), live = useRef(choose); live.current = choose;
  useLayoutEffect(() => { const engine = createPickAssemblyMotion(root.current!); motion.current = engine; engine.apply(unloadedAssemblyStep, 1); const jaw=createPickJawFittingMotion(root.current!,pickRoverRig.lowAngle);jaw.apply(1);fitting.current=createPickLiftFittingMotion(root.current!); fitting.current.apply(1); r.invalidate(); return () => { fitting.current?.restore(); fitting.current=null; jaw.restore(); engine.restore(); motion.current = null; }; }, []);
  useLayoutEffect(() => { fitting.current?.apply(progress); r.invalidate(); }, [progress, selected]);
  useLayoutEffect(() => {
    const api: PickCableDressingSceneApi = { scene: r.scene, camera: r.camera, motion: motion.current!, home() {const v=r.get(),controls=v.controls??orbit.current,workspace=root.current?.parent;if(workspace&&controls){workspace.updateWorldMatrix(true,true);const box=new Box3().setFromObject(workspace,true),center=box.getCenter(new Vector3()),camera=v.camera as PerspectiveCamera,direction=new Vector3(-.8,.35,-1).normalize(),right=new Vector3(0,1,0).cross(direction).normalize(),up=direction.clone().cross(right).normalize(),tan=Math.tan(camera.fov*Math.PI/360),aspect=v.size.width/v.size.height;let distance=0;for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){const p=new Vector3(x,y,z).sub(center);distance=Math.max(distance,p.dot(direction)+Math.abs(p.dot(right))/(tan*aspect),p.dot(direction)+Math.abs(p.dot(up))/tan);}camera.near=.001;camera.position.copy(center).addScaledVector(direction,distance*1.15);camera.updateProjectionMatrix();(controls as any).target.copy(center);(controls as any).update();}v.invalidate(); }, inspect(id, select=true) {
      const v = r.get(), controls=v.controls??orbit.current, part = r.scene.getObjectByName(id); if (!part || !floodVisible(part) || !root.current || !controls) return null;
      root.current.updateWorldMatrix(true, true); const box = new Box3().setFromObject(part, true), distance = Math.max(id==='pick-grip-servo-shaft'?.22:.14, box.getSize(new Vector3()).length() * 1.8);
      v.camera.near = distance / 300; v.camera.updateProjectionMatrix(); const a = inspectCraneSurface(root.current.parent!, v.camera, controls as any, id, box.getCenter(new Vector3()), distance, v.size.width, v.size.height,id==='pick-lift-servo-shaft'?[[1,-.7,-.7]]:id==='pick-grip-servo-shaft'?[[.7,-.25,-1]]:[]);
      if (!a) return null; if(select){anchor.current = a; live.current(id);} v.invalidate(); const point=floodAnchorWorld(a).project(v.camera);return{x:(point.x+1)*v.size.width/2,y:(1-point.y)*v.size.height/2};
    } }; onReady(api); const frame = requestAnimationFrame(api.home); return () => cancelAnimationFrame(frame);
  }, [r.scene, r.camera, r.size.width, r.size.height, onReady]);
  const part = pickRoverParts.find(p => p.id === selected);
  return <><Studio /><color attach="background" args={['#efedf7']} /><ambientLight intensity={1} /><directionalLight position={[2, 4, -3]} intensity={2.4} castShadow />
    <group scale={.01}><mesh position={[0, -83, 60]} receiveShadow><boxGeometry args={[290, 6, 400]} /><meshStandardMaterial color="#d6d8e4" roughness={.85} /></mesh>
      {[[50, -35], [-50, -35], [79, 185], [-79, 185]].map(([x, z]) => <group key={x + '/' + z} position={[x, -80, z]}><mesh position={[0, 57.5, 0]}><boxGeometry args={[6, 115, 6]} /><meshStandardMaterial color="#716092" /></mesh><mesh position={[0, 1.5, 0]}><boxGeometry args={[15, 3, 15]} /><meshStandardMaterial color="#45455d" /></mesh></group>)}
      <group ref={root} name="pick-cable-dressing-hardware" onPointerDown={(e: ThreeEvent<PointerEvent>) => { if (!floodOwner(e.object)) return; e.stopPropagation(); anchor.current = floodSurfaceAnchor(e.object, e.point, e.face, e.instanceId); r.invalidate(); }}>
        <Platform angle={pickRoverRig.lowAngle} gap={pickRoverRig.openGap} bareLiftAngle={pickRoverRig.lowAngle} bareJawAngle={0} assemblyFeed showUsb usb={false} showWheelBattery wheelPower={false} showServoSupply servoPower={false} showLiftCable showJawCable selected={selected} choose={choose} logicLeadIds={pickLogicLinks.map(l => l.id)} motorLeadIds={pickMotorLinks.map(l => l.id)} wheelSupplyLeadIds={pickWheelSupplyLinks.map(l => l.id)} servoFeedIds={pickServoSupplyLinks.map(l => l.id)} />
      </group><group onPointerDown={(e:ThreeEvent<PointerEvent>)=>{if(!floodOwner(e.object))return;e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);r.invalidate();}}><Protectors {...{progress,selected,choose}}/></group></group><Label targetRadius={.0006} calloutGap={46} selected={selected} anchor={anchor} name={part?.label ?? 'Cable dressing'} /><OrbitControls ref={orbit} makeDefault enableDamping={false} minDistance={.06} maxDistance={14} />
  </>;
}
