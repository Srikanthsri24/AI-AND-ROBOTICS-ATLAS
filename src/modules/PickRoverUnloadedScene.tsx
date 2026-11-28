import { useLayoutEffect, useRef, type ElementRef } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Vector3, type Group, type Scene, type Camera, type PerspectiveCamera } from 'three';
import Platform from './PickRoverPlatform';
import Studio from './SchoolBellStudioLight';
import Label from './CraneSurfaceLabel';
import { createPickAssemblyMotion, type PickAssemblyMotion } from './pick-rover-assembly-motion';
import { fitPickAssemblyView } from './pick-rover-assembly-view';
import { inspectCraneSurface } from './crane-inspection';
import { floodOwner, floodSurfaceAnchor, floodAnchorWorld, type FloodAnchor } from '../data/flood-surface';
import { pickMechanicalAssembly } from '../data/pick-rover-assembly';
import { pickRoverParts } from '../data/pick-rover-parts';
import { pickRoverRig } from '../data/pick-rover-motion';
import { pickLogicLinks } from '../data/pick-rover-power-leads';
import { pickMotorLinks } from '../data/pick-rover-motor-leads';
import { pickWheelSupplyLinks } from '../data/pick-rover-wheel-supply-leads';
import { pickServoSupplyLinks } from '../data/pick-rover-servo-supply-leads';
import type { PickUnloadedCalibration } from '../data/pick-rover-unloaded-calibration';
const unloadedAssemblyStep=pickMechanicalAssembly.findIndex(step=>step.id==='usb-cable-insertion');
if(unloadedAssemblyStep<0)throw Error('Unloaded calibration requires the completed USB connection stage');
export type PickUnloadedSceneApi = { scene: Scene; camera: Camera; motion: PickAssemblyMotion; inspect: (id: string, select?: boolean) => {x:number;y:number}|null; home: () => void };
export default function PickRoverUnloadedScene({ state, selected, choose, toggle, onReady }: { state: PickUnloadedCalibration; selected: string; choose: (id: string) => void; toggle: (source: 'logic' | 'servo') => void; onReady: (api: PickUnloadedSceneApi) => void }) {
  const r = useThree(), orbit = useRef<ElementRef<typeof OrbitControls>>(null), root = useRef<Group>(null), motion = useRef<PickAssemblyMotion | null>(null), anchor = useRef<FloodAnchor | null>(null), live = useRef(choose); live.current = choose;
  useLayoutEffect(() => { const engine = createPickAssemblyMotion(root.current!); motion.current = engine; engine.apply(unloadedAssemblyStep, 1); r.invalidate(); return () => { engine.restore(); motion.current = null; }; }, []);
  useLayoutEffect(() => { r.invalidate(); }, [state, selected]);
  useLayoutEffect(() => {
    const api: PickUnloadedSceneApi = { scene: r.scene, camera: r.camera, motion: motion.current!, home() { const v = r.get(), controls=v.controls??orbit.current; if (root.current && motion.current && controls) fitPickAssemblyView(root.current, motion.current, unloadedAssemblyStep, 1, v.camera as PerspectiveCamera, controls as any, v.size.width, v.size.height); v.invalidate(); }, inspect(id, select=true) {
      const v = r.get(), controls=v.controls??orbit.current, part = root.current?.getObjectByName(id); if (!part || !root.current || !controls) return null;
      root.current.updateWorldMatrix(true, true); const box = new Box3().setFromObject(part, true), distance = Math.max(id==='pick-grip-servo-shaft'?.22:.14, box.getSize(new Vector3()).length() * 1.8);
      v.camera.near = distance / 300; v.camera.updateProjectionMatrix(); const a = inspectCraneSurface(root.current, v.camera, controls as any, id, box.getCenter(new Vector3()), distance, v.size.width, v.size.height,id==='pick-lift-servo-shaft'?[[1,-.7,-.7]]:id==='pick-grip-servo-shaft'?[[.7,-.25,-1]]:[]);
      if (!a) return null; if(select){anchor.current = a; live.current(id);} v.invalidate(); const point=floodAnchorWorld(a).project(v.camera);return{x:(point.x+1)*v.size.width/2,y:(1-point.y)*v.size.height/2};
    } }; onReady(api); const frame = requestAnimationFrame(api.home); return () => cancelAnimationFrame(frame);
  }, [r.scene, r.camera, r.size.width, r.size.height, onReady]);
  const part = pickRoverParts.find(p => p.id === selected);
  return <><Studio /><color attach="background" args={['#efedf7']} /><ambientLight intensity={1} /><directionalLight position={[2, 4, -3]} intensity={2.4} castShadow />
    <group scale={.01}><mesh position={[0, -83, 60]} receiveShadow><boxGeometry args={[290, 6, 400]} /><meshStandardMaterial color="#d6d8e4" roughness={.85} /></mesh>
      {[[50, -35], [-50, -35], [79, 185], [-79, 185]].map(([x, z]) => <group key={x + '/' + z} position={[x, -80, z]}><mesh position={[0, 57.5, 0]}><boxGeometry args={[6, 115, 6]} /><meshStandardMaterial color="#716092" /></mesh><mesh position={[0, 1.5, 0]}><boxGeometry args={[15, 3, 15]} /><meshStandardMaterial color="#45455d" /></mesh></group>)}
      <group ref={root} name="pick-unloaded-hardware" onPointerDown={(e: ThreeEvent<PointerEvent>) => { if (!floodOwner(e.object)) return; e.stopPropagation(); anchor.current = floodSurfaceAnchor(e.object, e.point, e.face, e.instanceId); r.invalidate(); }}>
        <Platform angle={pickRoverRig.lowAngle} gap={pickRoverRig.openGap} bareLiftAngle={state.angles[0]} bareJawAngle={state.angles[1]} indexMarks assemblyFeed showUsb usb={state.logic} onUsbPowerToggle={() => toggle('logic')} showWheelBattery wheelPower={false} showServoSupply servoPower={state.servo} onServoPowerToggle={() => toggle('servo')} showLiftCable showJawCable selected={selected} choose={choose} logicLeadIds={pickLogicLinks.map(l => l.id)} motorLeadIds={pickMotorLinks.map(l => l.id)} wheelSupplyLeadIds={pickWheelSupplyLinks.map(l => l.id)} servoFeedIds={pickServoSupplyLinks.map(l => l.id)} />
      </group></group><Label targetRadius={.0006} calloutGap={46} selected={selected} anchor={anchor} name={part?.label ?? 'Unloaded output'} /><OrbitControls ref={orbit} makeDefault enableDamping={false} minDistance={.06} maxDistance={14} />
  </>;
}
