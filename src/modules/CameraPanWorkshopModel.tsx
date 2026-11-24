import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Line,OrbitControls} from '@react-three/drei';
import {Group,Mesh,TubeGeometry,Vector3} from 'three';
import {Mount,Uno,Wire} from './RoverWorkshopModel';
import {Breadboard} from './RoomClimateWorkshop';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {WorldLabel} from './LabWorkbench';
import {PanCardCamera,PanDriveHorn,PanFramingTarget,PanServoFixture,PanCylinder as Cylinder,PanPrint as Print,type PanPoint as Point} from './CameraPanWorkshopParts';
import {cameraPanTarget,cameraPanYaw} from '../data/camera-pan-workshop';
export const cameraPanParts:[string,string,Point,string,number][]=[
 ['bench','Dry pan-model workbench',[3.8,.14,2.8],'The camera is a light card mock-up. This workshop teaches physical aiming; it does not capture video.',0],
 ['servo','Fixed vertical-axis servo and base',[.11,.94,0],'The servo body stays stationary. Its upright output shaft pans the balanced card camera about a vertical axis.',1],
 ['shaft','Vertical servo output shaft',[0,1.22,0],'Test the bare shaft at the 90 degree center command before fitting the horn.',1],
 ['targetLeft','Fixed left framing target',cameraPanTarget(35),'This marker lies on the 35 degree radial sight line. It must not move when the camera pans.',2],
 ['targetCenter','Fixed center framing target',cameraPanTarget(90),'The center target lies straight ahead at a 90 degree servo command. Use it to align the horn with power disconnected.',2],
 ['targetRight','Fixed right framing target',cameraPanTarget(145),'This marker lies on the 145 degree sight line. Compare center returns from both the left and right.',2],
 ['horn','Centered drive horn',[0,1.21,0],'The real bore fits around the vertical output shaft. Fit only with both supplies disconnected after centering.',3],
 ['camera','Hollow light card camera',[0,1.48,0],'Separate thin card panels keep the load light. The model is balanced over the pivot, not cantilevered on a heavy camera.',3],
 ['lens','Rolled-card mock lens',[0,1.48,.47],'The rolled tube passes through an actual opening in the front panel. It is an aiming reference, not a functioning camera lens.',3],
 ['centerline','Printed forward sight line',[0,1.713,.15],'This fixed mark rotates with the shell. Compare its physical direction against the stationary targets.',3],
 ['uno','Arduino Uno R3',[-2.6,.42,-1.8],'Reads lowercase l, c and r, then takes one due two-degree step every 20 ms until the requested endpoint is reached.',4],
 ['rail','Breadboard common-ground rail',[-.8,.30,-2.25],'Uno GND, servo return and external supply negative use separate contacts on this shared ground rail.',4],
 ['supply','Separate regulated servo supply',[2.7,.58,-1.8],'The external regulated 5 V source powers the servo. Its positive remains separate from USB positive.',5],
 ['positive','External servo positive lead',[1.5,.5,-1.1],'External +5 V goes to the servo red lead. The Uno is powered separately by USB.',6],
 ['common','Shared signal-reference ground',[-1.5,.4,-2.3],'All returns share a reference so the D9 signal is meaningful. Each lead has its own physical rail contact.',6],
 ['signal','D9 pan command wire',[-1.3,.5,-1.1],'The command wire stays behind the stationary servo body. No wire is attached to the rotating card shell.',6],
 ['usb','USB data and Uno power',[-2.79,.41,-2.46],'Upload the sketch and open Serial Monitor at 115200 baud. Only lowercase l / c / r select targets.',7],
];
export type CameraPanPose={servo:number;fit:number;yaw:number};
export default function CameraPanWorkshopModel({step,selected,select,command,powered,external,fitGoal,offset,focus,overview,aimView,assembling,onAssembly,onPose}:{step:number;selected:string;select:(id:string)=>void;command:number;powered:boolean;external:boolean;fitGoal:number;offset:number;focus:number;overview:number;aimView:number;assembling:boolean;onAssembly:(v:boolean)=>void;onPose:(v:CameraPanPose)=>void}){
 const{scene,camera,size}=useThree(),orbit=useRef<any>(null),assembly=useRef<Group>(null),horn=useRef<Group>(null),shaft=useRef<Group>(null),pose=useRef<CameraPanPose>({servo:90,fit:0,yaw:0}),busy=useRef<boolean|null>(null),seen=useRef(new WeakSet<Mesh>());const part=cameraPanParts.find(p=>p[0]===selected)??cameraPanParts[0],color=(id:string,c:string)=>selected===id?'#ad85e6':c,choose=(id:string)=>(e:any)=>{e.stopPropagation();select(id);};
 const label=(id:string,at:Point)=>selected===id&&!assembling?<WorldLabel position={at} className='rw-label-anchor dbw-label' keepInView avoidOverlap calloutGap={100}><span className='rw-world-label'>{part[1]}</span></WorldLabel>:null;
 const wrap=(id:string,children:React.ReactNode,n:number,from:Point=[0,1,0])=>step>=n?<group key={id} userData={{partId:id}} onClick={choose(id)}><Mount from={from}>{children}</Mount></group>:null;
 const wire=(id:string,points:Point[],c:string)=><group key={id+points.flat().join(',')}>{wrap(id,<Wire points={points} color={color(id,c)} connectors={false}/>,6,[0,0,0])}</group>;
 function home(){camera.position.set(...(size.width<500?[8.5,9,17]:[6,6.7,11]) as Point);orbit.current?.target.set(0,.9,0);orbit.current?.update();}useEffect(home,[size.width]);useEffect(()=>{if(overview)home();},[overview]);useEffect(()=>{if(!aimView)return;camera.position.set(...(size.width<500?[0,7,8.5]:[0,5.5,6]) as Point);orbit.current?.target.set(0,1,.8);orbit.current?.update();},[aimView]);useEffect(()=>{if(!focus)return;let at=wireAt??part[2];if(['camera','lens','centerline'].includes(selected)&&assembly.current){const p:Point=selected==='lens'?[0,.23,.47]:selected==='centerline'?[0,.463,.15]:[.3,.23,0];at=assembly.current.localToWorld(new Vector3(...p)).toArray() as Point;}if(selected==='horn'&&horn.current)at=horn.current.localToWorld(new Vector3(.09,0,0)).toArray() as Point;const rear=['servo','signal','positive'].includes(selected);camera.position.set(at[0]+1,at[1]+1.2,at[2]+(rear?-1.8:2));orbit.current?.target.set(...at);orbit.current?.update();},[focus]);
 useFrame((_,delta)=>{const dt=Math.min(.05,delta),p=pose.current,old={...p};let moving=false;scene.traverse(o=>{if(o.name==='workshop-mount'&&o.position.length()>1e-6)moving=true;if(o instanceof Mesh&&o.geometry instanceof TubeGeometry){const materials=Array.isArray(o.material)?o.material:[o.material];if(materials.every(m=>m.opacity===0))o.raycast=()=>{};else if(o.geometry.index){const n=o.geometry.drawRange.count;if((n===Infinity&&!seen.current.has(o))||(n!==Infinity&&n<o.geometry.index.count))moving=true;seen.current.add(o);}}});if(moving!==busy.current){busy.current=moving;onAssembly(moving);}if(powered&&external){p.servo+=(command-p.servo)*Math.min(1,dt*10);if(Math.abs(p.servo-command)<.005)p.servo=command;}p.fit+=Math.sign(fitGoal-p.fit)*Math.min(Math.abs(fitGoal-p.fit),dt/5);if(Math.abs(fitGoal-p.fit)<1e-6)p.fit=fitGoal;const e=(a:number,b:number)=>{const t=Math.max(0,Math.min(1,(p.fit-a)/(b-a)));return t*t*(3-2*t);};p.yaw=p.fit===1?cameraPanYaw(p.servo,offset):0;if(shaft.current)shaft.current.rotation.y=cameraPanYaw(p.servo);
 if(horn.current){horn.current.position.set(-1.1*(1-e(.15,.30)),.19+2.5*e(0,.15)-1.48*e(.3,.5),.8*(1-e(.15,.3)));horn.current.rotation.y=p.fit===1?p.yaw:0;}if(assembly.current){assembly.current.position.set(1.7*(1-e(.6,.75)),.14+2.8*e(.5,.6)-1.69*e(.75,1),-1.1*(1-e(.6,.75)));assembly.current.rotation.y=p.fit===1?p.yaw:0;}if(Object.keys(p).some(k=>p[k as keyof CameraPanPose]!==old[k as keyof CameraPanPose]))onPose({...p});});
 let wireAt:Point|undefined;if(['common','signal','positive'].includes(selected))scene.traverse(o=>{if(wireAt||!(o instanceof Mesh)||!(o.geometry instanceof TubeGeometry))return;let parent=o.parent;while(parent&&parent.userData.partId!==selected)parent=parent.parent;if(parent)wireAt=o.geometry.parameters.path.getPoint(.5).applyMatrix4(o.matrixWorld).toArray() as Point;});
 return <><color attach='background' args={['#eeedf7']}/><ambientLight intensity={.9}/><directionalLight position={[-4,8,6]} intensity={1.8}/><OrbitControls ref={orbit} minDistance={.5} maxDistance={30} maxPolarAngle={Math.PI*.48}/>
 {wrap('bench',<Box at={[0,.04,0]} size={[9,.20,6.8]} color={color('bench','#bbab98')}/>,0,[0,0,0])}
 {wrap('servo',<PanServoFixture selected={selected==='servo'}/>,1)}
 {wrap('shaft',<group position={[0,1.16,0]} ref={shaft}><Cylinder at={[0,0,0]} r={.06} h={.12} color={color('shaft','#b9bec7')}/><Box at={[0,.061,.025]} size={[.012,.003,.05]} color='#58475e'/></group>,1)}
 {([['Left',35],['Center',90],['Right',145]] as const).map(([name,a])=>wrap('target'+name,<group position={cameraPanTarget(a)} rotation={[0,cameraPanYaw(a)+Math.PI,0]}><PanFramingTarget name={name} selected={selected==='target'+name}/></group>,2))}
 {step>=3&&<Mount from={[0,1,0]}><group ref={horn} position={[-1.1,.19,.8]} name='pan-drive-horn' userData={{partId:'horn'}} onClick={choose('horn')}><PanDriveHorn selected={selected==='horn'}/>{label('horn',[.09,.04,0])}</group><group ref={assembly} position={[1.7,.14,-1.1]} name='pan-card-camera'><PanCardCamera selected={selected} select={select}/>{label('camera',[.3,.23,0])}{label('lens',[0,.23,.47])}{label('centerline',[0,.463,.15])}{pose.current.fit===1&&<Line name='pan-sight-line' points={[[0,.23,.47],[0,.23,2.4]]} color='#b18b46' lineWidth={2} dashed dashSize={.10} gapSize={.05}/>}</group></Mount>}
 {wrap('uno',<group position={[-2.6,.32,-1.8]}>{[-.28,.28].flatMap(x=>[-.4,.4].map(z=><Cylinder key={x+','+z} at={[x,-.10125,z]} r={.032} h={.1575} color='#ddcfb4'/>))}<Uno active={selected==='uno'}/></group>,4)}
 {wrap('rail',<><Box at={[-.8,.145,-2.25]} size={[1.4625,.01,.884]} color='#d2c6b2'/><group position={[-.8,.22,-2.25]} scale={[.65,1,.65]}><Breadboard active={selected==='rail'}/></group></>,4)}
 {wrap('supply',<><Box at={[2.7,.35,-1.8]} size={[1,.42,.74]} color={color('supply','#494454')}/><Box at={[2.7,.566,-1.8]} size={[.66,.012,.44]} color='#d6d0c0'/><Print at={[2.7,.58,-1.8]} text='REGULATED 5 V' size={.055}/>{[-1,1].map(s=><Cylinder key={s} at={[2.7+s*.25,.54,-1.43]} r={.06} h={.08} color={s<0?'#bd4c59':'#30313b'}/>)}</>,5)}
 {wire('positive',[[2.45,.58,-1.43],[2.0,.65,-1.3],[.6,.70,-.6],[-.01,.6,-.22]],'#bd4c59')}
 {wire('common',[[-2.29,.4225,-1.785],[-1.9,.45,-2.9],[-1.32,.4,-2.6205],[-1.32,.30,-2.6205]],'#30313b')}
 {wire('common',[[2.95,.58,-1.43],[3.4,.4,-2.9],[-1.19,.4,-2.6205],[-1.19,.30,-2.6205]],'#30313b')}
 {wire('common',[[.11,.6,-.22],[.4,.6,-.6],[.6,.4,-2.8],[-1.06,.4,-2.6205],[-1.06,.30,-2.6205]],'#30313b')}
 {wire('signal',[[-2.91,.4225,-1.549],[-3.3,.5,-1.2],[-3.4,.35,-3.0],[.7,.45,-3.0],[.8,.65,-.8],[.23,.6,-.22]],'#c79660')}
 {step>=7&&<group userData={{partId:'usb'}} onClick={choose('usb')}><Mount from={[0,0,-.3]}><Box at={[-2.79,.41,powered?-2.46:-2.69]} size={[.17,.11,.22]} color={color('usb','#514360')}/><Wire points={[[-2.79,.41,powered?-2.57:-2.8],[-3.2,.25,-3.1],[-4,.2,-3.1]]} color={color('usb','#514360')} connectors={false}/></Mount></group>}
 {!['horn','camera','lens','centerline'].includes(selected)&&label(selected,wireAt??(selected.startsWith('target')?[part[2][0],1.48,part[2][2]]:part[2]))}
 </>;
}
