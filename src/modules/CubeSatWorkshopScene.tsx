import {memo,useEffect,useRef,useState,type RefObject,type ComponentProps} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {Line,OrbitControls,useTexture} from '@react-three/drei';
import {Group,Mesh,MeshBasicMaterial,Quaternion,SRGBColorSpace,TextureLoader,Vector3,type Texture,type InterleavedBufferAttribute} from 'three';
import type {Line2} from 'three/examples/jsm/lines/Line2.js';
import Prototype from './CubeSatWorkshopPrototype';
import Lighting from './WorkshopStudioLighting';
import Inspection,{type CubeSatWorkshopView} from './CubeSatWorkshopInspection';
import {createCubeSatFrameRenderer} from './cubesat-frame-renderer';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
import {stationInView} from '../data/weather-cubesat';
import type {CubeSatMission} from '../data/cubesat-workshop';
import {WorldLabel} from './LabWorkbench';
export type CubeSatCameraAPI=ReturnType<typeof createCubeSatFrameRenderer>;
export type CubeSatInspection='none'|'optics'|'shield'|'digital'|'coax'|'power'|'station';
function lineEnds(line:Line2|null,a:Vector3,b:Vector3){if(!line)return;const attr=line.geometry.getAttribute('instanceStart') as InterleavedBufferAttribute;attr.data.array.set([...a.toArray(),...b.toArray()]);attr.data.needsUpdate=true;line.geometry.computeBoundingBox();line.geometry.computeBoundingSphere();}
const Body=memo(Prototype),at=(degrees:number,radius:number):[number,number,number]=>{const a=degrees*Math.PI/180;return[radius*Math.cos(a),0,-radius*Math.sin(a)];};
function CameraBridge({mission,api,onLive,onReady}:{mission:RefObject<CubeSatMission>;api:RefObject<CubeSatCameraAPI|null>;onLive:(image:string)=>void;onReady:(ready:boolean)=>void}){
 const{gl}=useThree(),map=useTexture('./images/project-parts/cubesat-earth.png'),last=useRef('');
 useEffect(()=>{const camera=createCubeSatFrameRenderer(gl,map);api.current=camera;last.current='';onReady(true);return()=>{if(api.current===camera)api.current=null;camera.dispose();onReady(false);};},[gl,map,api,onReady]);
 useFrame(()=>{const m=mission.current,key=[m.longitude,m.clouds,m.earthFacing].join('/');if(key===last.current||!api.current)return;last.current=key;onLive(api.current.render(m));});return null;
}
function Orbit({mission,api,body}:{mission:RefObject<CubeSatMission>;api:RefObject<CubeSatCameraAPI|null>;body:ComponentProps<typeof Prototype>}){
 const map=useTexture('./images/project-parts/cubesat-earth.png'),position=useRef<Group>(null),attitude=useRef<Group>(null),cloud=useRef<Mesh>(null),beam=useRef<Line2>(null),link=useRef<Line2>(null),caption=useRef<HTMLSpanElement>(null);
 useEffect(()=>{map.colorSpace=SRGBColorSpace;map.needsUpdate=true;},[map]);
 useFrame(()=>{const m=mission.current,longitude=m.longitude+m.remainderMs/250,p=new Vector3(...at(longitude,3.1)),q=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),p.clone().negate().normalize());if(!m.earthFacing)q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),Math.PI/2));position.current?.position.copy(p);attitude.current?.quaternion.copy(q);attitude.current?.updateWorldMatrix(true,true);const lens=new Vector3(0,0,.375).applyQuaternion(q).add(p),target=m.earthFacing?new Vector3(...at(longitude,1.82)):new Vector3(0,0,1.3).applyQuaternion(q).add(lens);lineEnds(beam.current,lens,target);const antenna=new Vector3(0,.354,-.27).applyQuaternion(q).add(p);lineEnds(link.current,antenna,new Vector3(...at(60,1.84)));if(link.current)link.current.visible=stationInView(m.longitude)&&(!!m.onboard||!!body.transmitting);if(caption.current)caption.current.textContent=`CubeSat · ${m.longitude}° E`;if(cloud.current){const material=cloud.current.material as MeshBasicMaterial;material.opacity=m.clouds/100;if(api.current&&material.map!==api.current.cloudMap){material.map=api.current.cloudMap;material.needsUpdate=true;}}});
 return <group name="cubesat-orbital-pass"><mesh userData={{cubesatOccluder:true}} onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}><sphereGeometry args={[1.8,96,64]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh><mesh ref={cloud}><sphereGeometry args={[1.8108,96,64]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
 <Line points={Array.from({length:97},(_,i)=>at(i*360/96,3.1))} color="#697da2" lineWidth={1}/><Line points={Array.from({length:41},(_,i)=>at(35+i*50/40,3.1))} color="#78d8bc" lineWidth={3}/>
 <Line ref={beam} points={[[0,0,0],[0,0,1]]} color="#c1d8ff" lineWidth={1.4} dashed dashSize={.09} gapSize={.06}/><Line ref={link} points={[[0,0,0],[0,1,0]]} color="#70e1bb" lineWidth={2}/>
 <group position={at(60,1.84)}><mesh><sphereGeometry args={[.055,20,12]}/><meshBasicMaterial color="#72e2bc"/></mesh><WorldLabel position={[0,-.26,0]} className="lw-part-label" keepInView avoidOverlap><span>Ground contact · 60° E</span></WorldLabel></group>
 <group ref={position}><group ref={attitude}><group scale={.006}><group position={[0,-80,0]}><Body {...body} scope="spacecraft"/></group></group></group><WorldLabel position={[0,.68,0]} className="lw-part-label" keepInView avoidOverlap><span ref={caption}>CubeSat · 0° E</span></WorldLabel></group></group>;
}
type Props={mission:RefObject<CubeSatMission>;assembly:RefObject<number>;ready:boolean;busy:boolean;selected:string;name:string;focus:number;view:CubeSatWorkshopView;version:number;inspection:CubeSatInspection;deployment:number;image:string|null;transmitting:boolean;anchor:RefObject<FloodAnchor|null>;api:RefObject<CubeSatCameraAPI|null>;choose:(id:string)=>void;onLive:(image:string)=>void;onReady:(ready:boolean)=>void;occupied:boolean};
function Scene({mission,assembly,ready,busy,selected,name,focus,view,version,inspection,deployment,image,transmitting,anchor,api,choose,onLive,onReady,occupied}:Props){
 const pending=useRef<FloodAnchor|null>(null),[received,setReceived]=useState<Texture|null>(null);
 useEffect(()=>{let active=true,texture:Texture|null=null;setReceived(null);if(image)new TextureLoader().load(image,t=>{texture=t;t.colorSpace=SRGBColorSpace;t.needsUpdate=true;if(active)setReceived(t);else t.dispose();});return()=>{active=false;texture?.dispose();};},[image]);
 function surface(e:ThreeEvent<PointerEvent>){if(busy)return;const id=floodOwner(e.object);if(!id)return;e.stopPropagation();pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}
 function select(id:string){if(busy)return;if(pending.current&&floodOwner(pending.current.object)===id)anchor.current=pending.current;pending.current=null;choose(id);}
 const body={selected,select,occupied,transmitting,deployment,image:received,opticalInspection:inspection==='optics',shieldOpen:inspection==='shield',inspectDigital:inspection==='digital',inspectCoax:inspection==='coax',inspectPower:inspection==='power',inspectStationSockets:inspection==='station'};
 return <><color attach="background" args={[view==='orbit'?'#111a32':'#edf0f8']}/><Lighting/><ambientLight intensity={1.1}/><directionalLight position={[4,8,6]} intensity={2.6} castShadow shadow-mapSize={[1024,1024]}/><CameraBridge {...{mission,api,onLive,onReady}}/><group onPointerDown={surface}>{view==='orbit'?<Orbit {...{mission,api,body}}/>:<group scale={.02} position={[-1.4,0,0]}><Body {...body} assembly={ready?undefined:assembly}/></group>}</group><OrbitControls makeDefault enabled={!busy} target={[0,1,0]} minDistance={.03} maxDistance={50} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,name,anchor,focus,busy,view}} viewVersion={version}/></>;
}
export default memo(Scene);
