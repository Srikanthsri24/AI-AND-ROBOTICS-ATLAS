import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line,OrbitControls} from '@react-three/drei';
import {BufferAttribute,BufferGeometry,Group,Line as ThreeLine,LineBasicMaterial,Vector3} from 'three';
import Lighting from './WorkshopStudioLighting';
import Bottle from './RocketBottleParts';
import Stand from './RocketStandParts';
import Field from './RocketFieldParts';
import Inspection,{type RocketAnchor} from './RocketInspection';
import {WorldLabel} from './LabWorkbench';
import {vacuumPartOwner as owner,vacuumSurfaceAnchor as surfaceAnchor} from '../data/vacuum-surface';
import {rocketAssemblyPose,rocketWorkshop as d,type RocketTrial} from '../data/rocket-workshop';
import {flightAt,flightPoint} from '../data/water-rocket';
export type RocketDisplay={position:[number,number,number];angle:number;guideAngle:number;open:number;receiverClose:number};
export default function RocketWorkshopModel({progress,angle,trial,runtime,display,selected,name,select,anchor,focus,busy,view,viewVersion,guides}:{progress:number;angle:number;trial:RocketTrial;runtime:RefObject<RocketTrial>;display:RefObject<RocketDisplay>;selected:string;name:string;select:(id:string)=>void;anchor:RefObject<RocketAnchor|null>;focus:number;busy:boolean;view:'stand'|'field'|'follow';viewVersion:number;guides:boolean}){
 const p=rocketAssemblyPose(progress),body=useRef<Group>(null),trace=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(129*3),3));return g;},[]),receiverX=useRef(flightAt(trial.angle).range),receiverAngle=useRef(-trial.angle),position=new Vector3(),history=trial.history,traceLine=useMemo(()=>{const line=new ThreeLine(trace,new LineBasicMaterial({color:'#8053bc'}));line.raycast=()=>{};return line;},[trace]);useEffect(()=>()=>{trace.dispose();(traceLine.material as LineBasicMaterial).dispose();},[trace,traceLine]);
 useFrame(({scene},dt)=>{const s=runtime.current,pose=display.current;if(body.current&&progress===7){body.current.position.set(...pose.position);body.current.rotation.z=(pose.angle-90)*Math.PI/180;}if(progress===7){const guide=scene.getObjectByName('rocket-guide-position'),pointer=scene.getObjectByName('rocket-angle-pointer-pose');if(guide)guide.rotation.z=(pose.guideAngle-90)*Math.PI/180;if(pointer)pointer.rotation.z=pose.guideAngle*Math.PI/180;for(const y of d.rails)for(const side of [-1,1]){const keeper=scene.getObjectByName('rocket-keeper-'+y+'-'+side);if(keeper)keeper.position.x=side*d.keeperTravel*pose.open;}const capture=scene.getObjectByName('rocket-receiver');if(capture){const target=flightAt(s.angle).range;receiverX.current+=Math.sign(target-receiverX.current)*Math.min(Math.abs(target-receiverX.current),3*dt);capture.position.x=receiverX.current;receiverAngle.current+=Math.sign(-s.angle-receiverAngle.current)*Math.min(Math.abs(-s.angle-receiverAngle.current),90*dt);const carriage=capture.getObjectByName('rocket-receiver-cradle');if(carriage)carriage.rotation.z=(receiverAngle.current-90)*Math.PI/180;}if(capture)for(const side of [-1,1]){const jaw=capture.getObjectByName('rocket-receiver-keeper-'+side)?.parent;if(jaw)jaw.position.x=side*.04*(1-pose.receiverClose);}}
 const a=trace.attributes.position;for(let i=0;i<=128;i++){const t=s.elapsed*i/128;a.setXYZ(i,s.vx*t,d.datum+Math.max(0,flightAt(s.angle).vy*t-d.gravity*t*t/2),0);}a.needsUpdate=true;trace.computeBoundingSphere();},-.5);
 const ghost=(a:number)=>{const f=flightAt(a);return Array.from({length:129},(_,i)=>{const[x,y]=flightPoint(f,f.time*i/128);return [x,d.datum+y,0] as [number,number,number];});};
 return <><color attach='background' args={['#edf0f8']}/><Lighting/><hemisphereLight args={['#fff6e8','#758696',1.1]}/><directionalLight position={[-3,12,6]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-2} shadow-camera-right={18} shadow-camera-top={9} shadow-camera-bottom={-3} shadow-bias={-.0001}/>
 <group name='rocket-workshop-root' userData={{progress,angle}} onPointerDown={e=>{const id=owner(e.object);if(!id||busy)return;e.stopPropagation();anchor.current=surfaceAnchor(e.object,e.point,e.face);select(id);}}>
 <Field {...{selected,select}} showReceiver={progress===7} receiverX={flightAt(trial.angle).range} receiverAngle={-trial.angle} receiverClose={display.current.receiverClose}/>
 <Stand {...{selected,select,angle}} {...p} open={progress===7?display.current.open:p.keepersOpen}/>
 {p.bottle&&<group ref={body} name='rocket-flight-body' position={progress===7?display.current.position:[0,d.datum,p.bottleFront]} rotation={[0,0,((progress===7?display.current.angle:angle)-90)*Math.PI/180]}><Bottle {...{selected,select}} trim={p.trimTravel} showTrim={p.trim}/></group>}
 </group>
 {progress===7&&<><primitive object={traceLine}/>{history.map((r,i)=><Line key={r.angle} raycast={()=>null} points={ghost(r.angle)} color={r.angle===30?'#a47d45':r.angle===60?'#3d94a4':'#8b6ac0'} lineWidth={1.3} dashed dashSize={.12} gapSize={.09}/>)}{guides&&<><Line raycast={()=>null} points={[[-.5,d.datum,0],[17,d.datum,0]]} color='#6f9db8' lineWidth={1} dashed dashSize={.15} gapSize={.12}/>{view!=='follow'&&<WorldLabel position={[0,d.datum,-.12]} className='lw-end-label' keepInView avoidOverlap><span>Launch datum · h = 0</span></WorldLabel>}{trial.phase==='returned'&&<WorldLabel position={[trial.position[0],d.datum,-.12]} className='lw-end-label' keepInView avoidOverlap><span>Returned · {trial.position[0].toFixed(2)} m</span></WorldLabel>}</>}</>}
 <OrbitControls makeDefault target={[0,.26,.08]} minDistance={.04} maxDistance={90} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,name,anchor,focus,busy,view,viewVersion}}/>
 </>;
}
