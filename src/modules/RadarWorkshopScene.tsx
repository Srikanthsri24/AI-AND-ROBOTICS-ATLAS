import {memo,useEffect,useMemo,useRef,useState,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Line,OrbitControls} from '@react-three/drei';
import {Group,Vector3,type InterleavedBufferAttribute} from 'three';
import type {Line2} from 'three/examples/jsm/lines/Line2.js';
import Prototype from './RadarWorkshopPrototype';
import Bridge from './RadarMotionBridge';
import Lighting from './WorkshopStudioLighting';
import Inspection,{type RadarWorkshopView} from './RadarWorkshopInspection';
import {WorldLabel} from './LabWorkbench';
import {createRadarHostDisplay} from './radar-host-display';
import {radarLiveMotion,type RadarInspection} from '../data/radar-session';
import {radarEcho,radarRotate,type RadarClock,type RadarInputs,type RadarSample} from '../data/radar-workshop';
import type {RadarBenchMotion} from '../data/radar-assembly';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
function ends(line:Line2|null,a:Vector3,b:Vector3){if(!line)return;const attr=line.geometry.getAttribute('instanceStart') as InterleavedBufferAttribute;attr.data.array.set([...a.toArray(),...b.toArray()]);attr.data.needsUpdate=true;line.geometry.computeBoundingBox();line.geometry.computeBoundingSphere();}
const point=(x:number,z:number)=>new Vector3(x*.02,68*.02,z*.02);
function Echo({clock,inputs,playing,replay,ready}:{clock:RefObject<RadarClock>;inputs:RefObject<RadarInputs>;playing:RefObject<boolean>;replay:number;ready:boolean}){
 const [showPulse,setShowPulse]=useState(false),shown=useRef(false);
 const outgoing=useRef<Line2>(null),returning=useRef<Line2>(null),pulse=useRef<Group>(null),caption=useRef<HTMLSpanElement>(null),last=useRef(-1),sample=useRef<RadarSample|null>(null),age=useRef(0);
 useFrame((_,dt)=>{const i=inputs.current;if(last.current!==replay){last.current=replay;sample.current=clock.current.rows.at(-1)??null;age.current=0;}else if(!playing.current)age.current+=Math.min(100,dt*1000);
  if(!clock.current.rows.length)sample.current=null;const s=sample.current,live=playing.current,visible=ready&&i.usb&&i.sonarPower&&(live||!!s);if(outgoing.current)outgoing.current.visible=visible;if(returning.current)returning.current.visible=false;if(!visible){if(pulse.current)pulse.current.visible=false;if(shown.current){shown.current=false;setShowPulse(false);}return;}
  const angle=live?clock.current.actual+i.hornOffset:s!.actualHeading,tx=radarRotate(-13,13.2,angle),rx=radarRotate(13,13.2,angle),echo=live?radarEcho(i,angle):s!,a=point(...tx),b=echo.hit?point(...echo.hit):a.clone().add(point(...radarRotate(0,1500,angle)).sub(new Vector3(0,1.36,0))),c=point(...rx);ends(outgoing.current,a,b);
  if(echo.hit){ends(returning.current,b,c);if(returning.current)returning.current.visible=true;}
  const t=age.current/1200,show=!live&&t>=0&&t<1;if(pulse.current)pulse.current.visible=show;if(shown.current!==show){shown.current=show;setShowPulse(show);}if(show&&pulse.current){pulse.current.position.copy(t<.5||!echo.hit?a.clone().lerp(b,echo.hit?t*2:t):b.clone().lerp(c,(t-.5)*2));if(caption.current)caption.current.textContent=echo.hit?(t<.5?'Transmitted pulse · slowed':'Reflected return · slowed'):'No face return · slowed';}
 });
 return <><Line name="radar-outgoing-ray" ref={outgoing} points={[[0,0,0],[0,0,1]]} color="#ac8be8" lineWidth={1.8} dashed dashSize={.07} gapSize={.04}/><Line name="radar-return-ray" ref={returning} points={[[0,0,0],[0,0,1]]} color="#5abca1" lineWidth={1.6} dashed dashSize={.06} gapSize={.04}/><group name="radar-echo-pulse" ref={pulse} visible={false}><mesh><sphereGeometry args={[.045,20,12]}/><meshStandardMaterial color="#b7f4df" emissive="#70dfb7" emissiveIntensity={1}/></mesh>{showPulse&&<WorldLabel position={[0,.15,0]} className="lw-part-label" keepInView avoidOverlap><span ref={caption}>Echo replay · slowed</span></WorldLabel>}</group></>;
}
type Props={assembly:RefObject<number>;clock:RefObject<RadarClock>;inputs:RefObject<RadarInputs>;playing:RefObject<boolean>;busy:boolean;ready:boolean;selected:string;name:string;focus:number;view:RadarWorkshopView;version:number;inspection:RadarInspection;replay:number;anchor:RefObject<FloodAnchor|null>;choose:(id:string)=>void;target:RadarInputs};
function Scene({assembly,clock,inputs,playing,busy,ready,selected,name,focus,view,version,inspection,replay,anchor,choose,target}:Props){
 const motion=useRef<RadarBenchMotion>(radarLiveMotion(clock.current,inputs.current)),live=useRef(motion.current),pending=useRef<FloodAnchor|null>(null),display=useMemo(createRadarHostDisplay,[]),lastDisplay=useRef('');
 useEffect(()=>()=>display.dispose(),[display]);
 useFrame(()=>{live.current=radarLiveMotion(clock.current,inputs.current,inspection);const s=clock.current,key=[s.rows.at(-1)?.id??0,s.command,inputs.current.usb,inspection,playing.current].join('/');if(key!==lastDisplay.current){lastDisplay.current=key;display.render(s,inputs.current.usb&&inspection==='none',playing.current);}},-5);
 function surface(e:ThreeEvent<PointerEvent>){if(busy)return;const id=floodOwner(e.object);if(!id)return;e.stopPropagation();pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}
 function select(id:string){if(busy)return;if(pending.current&&floodOwner(pending.current.object)===id)anchor.current=pending.current;pending.current=null;choose(id);}
 return <><color attach="background" args={['#edf0f8']}/><Lighting/><ambientLight intensity={1.1}/><directionalLight position={[-5,12,7]} intensity={2.6} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-camera-far={100}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.001,0]} receiveShadow><planeGeometry args={[120,120]}/><meshStandardMaterial color="#e4e9f3" roughness={.95}/></mesh><Bridge {...{assembly,motion,live}}/><group onPointerDown={surface}><group scale={.02}><Prototype {...{assembly,motion,selected,target}} select={select} screen={ready?display.texture:null}/></group></group><Echo {...{clock,inputs,playing,replay}} ready={ready&&!selected}/><OrbitControls makeDefault enabled={!busy} minDistance={.02} maxDistance={150} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,name,anchor,focus,busy,view}} viewVersion={version}/></>;
}
export default memo(Scene);
