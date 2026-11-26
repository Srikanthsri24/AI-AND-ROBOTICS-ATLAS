import {Suspense,useEffect,useRef,type RefObject} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls,ContactShadows,useGLTF} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import type {SoapWorkflow,SoapWorkshopProbe} from '../data/soap-dispenser-workflow';
import {soapWorkflowUsb} from '../data/soap-dispenser-workflow';
import {soapFittingCursors} from '../data/soap-dispenser-fitting';
import {soapTargetTravel} from '../data/soap-dispenser-target';
import {soapHandPose,soapHandParts} from '../data/soap-dispenser-hand';
import {soapMechanismParts} from '../data/soap-dispenser-mechanism';
import {floodSurfaceAnchor,floodVisible,type FloodAnchor} from '../data/flood-surface';
import {inspectCraneSurface} from './crane-inspection';
import Mechanism from './SoapMechanismParts';
import Hand from './SoapHandParts';
import {soapHandProbe} from './soap-hand-probe';
import Label from './CraneSurfaceLabel';
import Studio from './SchoolBellStudioLight';
export const soapWorkshopParts=[...soapMechanismParts,...soapHandParts];
export type SoapWorkshopCamera='overview'|'pump'|'electronics'|'sensor'|'servo';
type Props={state:SoapWorkflow;selected:string;choose:(id:string)=>void;preset:SoapWorkshopCamera;focusId:string;version:number;probe:RefObject<SoapWorkshopProbe|undefined>;onHandReady:(ready:boolean)=>void};
export default function SoapWorkbenchScene({state:s,selected,choose,preset,focusId,version,probe,onHandReady}:Props){
 const scene=useThree(),anchor=useRef<FloodAnchor|null>(null),usb=useRef(s.usb),ready=useRef(false);usb.current=s.usb;
 useEffect(()=>{useGLTF.preload(new URL('./models/project-soap-hand.glb',document.baseURI).href);},[]);
 useFrame(()=>{const hand=scene.scene.getObjectByName('soap-human-hand');if(!!hand!==ready.current){ready.current=!!hand;onHandReady(!!hand);}probe.current=hand?(position=>{hand.position.set(...position);const p=soapHandProbe(hand);return{distanceCm:p.distanceCm,echoPresent:p.echoPresent,hand:p.receiver??undefined};}):undefined;});
 useEffect(()=>()=>{probe.current=undefined;},[probe]);
 useEffect(()=>{
  const camera=scene.camera as PerspectiveCamera,controls=scene.controls as any;scene.scene.updateMatrixWorld(true);
  if(focusId){const part=scene.scene.getObjectByName(focusId),root=scene.scene.getObjectByName('soap-workshop-hardware');if(part&&root&&floodVisible(part)){const box=new Box3().setFromObject(part,true);if(!box.isEmpty()){const distance=Math.max(.06,box.getSize(new Vector3()).length()*2/Math.min(1,scene.size.width/scene.size.height));camera.near=distance/200;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(root,camera,controls,focusId,box.getCenter(new Vector3()),distance,scene.size.width,scene.size.height);return;}}anchor.current=null;}
  const bounds:Record<SoapWorkshopCamera,[number[],number[]]>={overview:[[-3.5,-.06,-1.3],[2.7,3.2,1.7]],pump:[[-.85,-.06,-.75],[2.7,3,1.5]],electronics:[[-2.05,-.06,-1.3],[-.85,.7,1.1]],sensor:[[.08,2.45,.8],[.75,2.85,1.25]],servo:[[-.1,2.19,-.6],[.5,2.53,.35]]};
  const box=new Box3(new Vector3(...bounds[preset][0]),new Vector3(...bounds[preset][1])),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3()),aspect=scene.size.width/scene.size.height,distance=1.25*Math.max(size.y,size.x/aspect,size.z)/(2*Math.tan(camera.fov*Math.PI/360));camera.near=.001;camera.position.copy(center).addScaledVector((preset==='pump'?new Vector3(-.55,.55,1):new Vector3(.65,.4,1)).normalize(),distance);camera.updateProjectionMatrix();controls?.target.copy(center);controls?.update();
 },[preset,version,focusId,scene.camera,scene.controls,scene.size.width,scene.size.height]);
 const fitting=soapFittingCursors(s.fitting),targetTop=soapTargetTravel(s.cardGap,s.cardCursor),angle=s.sketch==='calibration'?s.calibration.angle:s.wet.workbench.session.angle;
 const rows=s.sketch==='calibration'?s.calibration.rows:s.wet.workbench.session.controller?.rows??[];
 return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.1}/><directionalLight position={[-3,5,4]} intensity={2.5}/><group name="soap-workshop-hardware" scale={.01} onPointerDown={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Mechanism foundationAssembly={s.foundation} sensorAssembly={s.sensor} toolsVisible={s.fitting>0||s.linkage>0||s.view!=='foundation'&&s.view!=='sensor'} hornFitted={s.linkage>0} linkageAssembly={s.linkage} angle={angle} fill={s.wet.fluid.fill} fluid={s.wet.fluid} flow={s.wet.fluid.motion} logicPowered={soapWorkflowUsb(s)} servoPowered={s.servoPower} usbMotion={usb} serialRows={rows} targetTop={targetTop} selected={selected} choose={choose} {...fitting}/>{s.sketch==='working'&&<Suspense fallback={null}><Hand position={soapHandPose(s.mode==='hand'?s.handCursor:0)} fluid={s.wet.fluid} selected={selected} choose={choose}/></Suspense>}</group><ContactShadows position={[-.3,-.061,0]} opacity={.28} scale={12} blur={2.5} far={3} frames={s.paused?1:Infinity}/><Label selected={selected} anchor={anchor} name={soapWorkshopParts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[-.4,1.2,.2]}/></>;
}
