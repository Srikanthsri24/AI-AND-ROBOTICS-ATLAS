import type { ExpansionInfo } from '../data/project-expansion';
import { Suspense, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Bounds, Center, Environment, Lightformer, Line, RoundedBox, useGLTF } from '@react-three/drei';
import { Box3, CatmullRomCurve3, Vector3, type Group } from 'three';

import { WorldLabel } from './LabWorkbench';

type Point = [number, number, number];
function Box({ at, size, color, metal = 0 }: {at: Point; size: Point; color: string; metal?: number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.16} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal>.4?.34:.53}/>
  </RoundedBox>;
}
function Disk({ at, radius, depth, color, axle = false, glow = false }: {at: Point; radius: number; depth: number; color: string; axle?: boolean; glow?: boolean}) {
  return <mesh position={at} rotation={axle ? [0,0,Math.PI/2] : undefined}><cylinderGeometry args={[radius,radius,depth,40]}/><meshStandardMaterial color={color} roughness={.32} metalness={.28} emissive={color} emissiveIntensity={glow ? 2 : 0}/></mesh>;
}
function Wire({path,color}: {path: Point[];color:string}) {
  const curve = new CatmullRomCurve3(path.map(([x,y,z])=>new Vector3(x,y,z)));
  return <mesh><tubeGeometry args={[curve,24,.025,8,false]}/><meshStandardMaterial color={color} roughness={.48}/></mesh>;
}
function Lamp({at, color, lit}: {at: Point; color: string; lit: boolean}) {
  return <group position={at}>
    {[-.047,.047].map(x=><Box key={x} at={[x,.075,0]} size={[.021,.16,.023]} color="#bcc4c8" metal={.73}/>)}
    <Disk at={[0,.16,0]} radius={.106} depth={.027} color={color}/>
    <mesh position={[0,.212,0]}><cylinderGeometry args={[.088,.088,.09,32]}/>
      <meshPhysicalMaterial color={color} roughness={.18} clearcoat={1} emissive={color} emissiveIntensity={lit?2.2:0}/></mesh>
    <mesh position={[0,.255,0]}><sphereGeometry args={[.088,32,16,0,Math.PI*2,0,Math.PI/2]}/>
      <meshPhysicalMaterial color={color} roughness={.14} clearcoat={1} emissive={color} emissiveIntensity={lit?2.6:0}/></mesh>
    {lit && <pointLight position={[0,.32,0]} color={color} intensity={.8} distance={.85}/>}
  </group>;
}

function Gear({at, teeth, radius, color, speed, crank=false}: {at: Point; teeth: number; radius: number; color: string; speed: number; crank?:boolean}) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if(ref.current) ref.current.rotation.y += speed * dt; });
  return <group ref={ref} position={at}>
    <Disk at={[0,0,0]} radius={radius} depth={.21} color={color}/>
    {Array.from({length:teeth}, (_,i)=><group key={i} rotation={[0,2*Math.PI*i/teeth,0]}><Box at={[radius,0,0]} size={[.16,.20,.10]} color={color} metal={.58}/></group>)}
    <Disk at={[0,.10,0]} radius={.13} depth={.25} color="#b6bfc8"/>
    <Box at={[radius*.62,.115,0]} size={[.12,.02,.07]} color="#ffcd62"/>
    {crank && <>
      <Disk at={[0,.22,0]} radius={.08} depth={.31} color="#a2b0bd"/>
      <Box at={[-.20,.40,0]} size={[.49,.062,.105]} color="#a2b0bd" metal={.68}/>
      <Disk at={[-.41,.53,0]} radius={.067} depth={.24} color="#242a30"/>
    </>}
  </group>;
}
function FittedHardware({id,at,size,rotation,names}: {id:string;at:Point;size:Point;rotation?:Point;names?:string[]}) {
  const {scene} = useGLTF(`./models/hardware/${id}.glb`);
  const fitted = useMemo(()=>{
    const model=selectHardware(scene,names);
    const bounds=new Box3().setFromObject(model);
    const extent=bounds.getSize(new Vector3());
    return {model,center:bounds.getCenter(new Vector3()).multiplyScalar(-1),
      scale:new Vector3(...size).divide(extent.max(new Vector3(.001,.001,.001)))};
  },[scene,size,names]);
  return <group position={at} rotation={rotation} scale={fitted.scale}>
    <group position={fitted.center}><primitive object={fitted.model}/></group>
  </group>;
}

function RoverWheel({side,position}: {side:number;position:React.RefObject<Group | null>}) {
  const wheel=useRef<Group>(null);
  useFrame(()=>{
    if(wheel.current && position.current) wheel.current.rotation.x=position.current.position.z/.37;
  });
  return <group position={[side,.37,.32]} ref={wheel}>
    <Disk at={[0,0,0]} radius={.35} depth={.25} color="#171a1d" axle/>
    {Array.from({length:22},(_,i)=><group key={i} rotation={[i*Math.PI/11,0,0]}>
      <Box at={[0,.351,0]} size={[.24,.034,.062]} color="#24282b"/>
    </group>)}
    <Disk at={[side*.135,0,0]} radius={.238} depth={.05} color="#cc972a" axle/>
    <Disk at={[side*.171,0,0]} radius={.072} depth={.05} color="#939da5" axle/>
    {Array.from({length:6},(_,i)=><group key={i} rotation={[i*Math.PI/3,0,0]}>
      <Box at={[side*.169,.15,0]} size={[.016,.11,.034]} color="#edbb50"/>
    </group>)}
  </group>;
}

function Rover({active,approaching,reducedMotion,threshold,children}: {active:boolean;approaching:boolean;reducedMotion:boolean;threshold?:number;children?:ReactNode}) {
  const rover=useRef<Group>(null);
  const obstacle=useRef<Group>(null);
  useFrame((_, dt)=>{
    if (!rover.current || !obstacle.current) return;
    const roverPosition = rover.current.position;
    if (!active && !reducedMotion) roverPosition.z = Math.min(.62,roverPosition.z + Math.min(dt,.05)*.42);
    const clearance = threshold===undefined ? (active ? .30 : approaching ? .66 : 1.43) : (threshold+(active?-5:approaching?2:15))*.028;
    const target = roverPosition.z + 1.12 + clearance;
    obstacle.current.position.z += (target-obstacle.current.position.z)*Math.min(1,dt*10);
  });
  return <>
    <group ref={rover} position={[0,0,-.65]}>
      <Box at={[0,.37,0]} size={[1.8,.16,2.2]} color="#3d5265" metal={.65}/>
      <Suspense fallback={<Box at={[0,.53,-.24]} size={[1.05,.14,.8]} color="#126a8f"/>}>
        <FittedHardware id="boards-01" at={[0,.56,-.24]} size={[1.1,.29,.82]}/>
      </Suspense>
      {[-.69,.69].flatMap(x=>[-.77,.72].map(z=><Disk key={`${x}:${z}`} at={[x,.47,z]} radius={.056} depth={.035} color="#b0b9bf"/>))}
      <Suspense fallback={null}><FittedHardware id="components-34" names={['board','chip','capacitor','pads']} at={[.56,.52,.45]} size={[.50,.16,.35]}/></Suspense>
      {[-.64,.64].map(x=><Box key={x} at={[x,.28,.32]} size={[.42,.28,.52]} color="#d8a129"/>)}
      <Wire path={[[-.62,.36,.31],[-.55,.63,.55],[.25,.57,.49]]} color="#dd7b45"/>
      <Box at={[0,.49,-.77]} size={[1,.25,.38]} color="#24282e"/>
      <Wire path={[[.45,.63,-.77],[.7,.81,-.35],[.65,.60,.36]]} color="#e5564e"/>
      <Wire path={[[.45,.61,-.22],[.56,.89,.3],[.33,.69,.98]]} color="#f1b850"/>
      {[-1,1].map(side=><RoverWheel key={side} side={side} position={rover}/>)}
      <Disk at={[0,.13,-.75]} radius={.13} depth={.22} color="#697785" axle/>
      <Suspense fallback={<Box at={[0,.58,.99]} size={[.79,.33,.08]} color="#167eae"/>}>
        <FittedHardware id="sensors-08" at={[0,.60,1.01]} size={[.85,.35,.22]}/>
      </Suspense>
      {children}
    </group>
    <group ref={obstacle} position={[0,0,1.9]}>
      <Box at={[0,.43,0]} size={[1.45,.86,.23]} color="#b08256"/>
      <Box at={[0,.48,.122]} size={[.23,.76,.018]} color="#d6b38e"/>
    </group>
  </>;
}
function Linkage({hand,active,target}: {hand:boolean;active:boolean;target?:number}) {
  const joint=useRef<Group>(null);
  const tip=useRef<Group>(null);
  useFrame((_,dt)=>{
    const blend=Math.min(1,dt*6);
    if(joint.current) joint.current.rotation.z += ((target===undefined ? (active ? (hand ? -.72 : .349) : (hand ? 0 : -.349)) : (target-90)*Math.PI/180*(hand?-1:1))-joint.current.rotation.z)*blend;
    if(tip.current) tip.current.rotation.z += ((hand&&active?-.53:0)-tip.current.rotation.z)*blend;
  });
  return <>
    <Box at={[0,.08,0]} size={[2.7,.16,1.4]} color="#414f5e" metal={.5}/>
    <Suspense fallback={null}><FittedHardware id="boards-01" at={[-1.08,.21,.91]} size={[1.12,.28,.73]}/></Suspense>
    <Box at={[.68,.23,-.92]} size={[.86,.30,.58]} color="#333e4b"/>
    <Wire path={[[-.64,.23,.86],[-.52,.43,.66],[-.46,.33,.30]]} color="#e5b04d"/>
    <Wire path={[[.33,.25,-.92],[-.20,.36,-.72],[-.48,.28,-.29]]} color="#db5448"/>
    <Suspense fallback={null}><FittedHardware id="anatomy-31" names={['case','cap','fins','ears','spline']} at={[-.55,.46,0]} size={[.69,.68,.64]}/></Suspense>
    {[-1.13,1.13].map(x=><Disk key={x} at={[x,.17,-.52]} radius={.061} depth={.024} color="#a9b2b9"/>)}
    {hand && <group position={[-.08,.58,-.35]}>
      <Box at={[0,0,0]} size={[1.1,.22,1.05]} color="#a7b6c3" metal={.48}/>
      {[-.48,-.23,.01].map((z,i)=><group key={z} position={[.51,0,z]}>
        <Box at={[.22,0,0]} size={[.53,.15,.16]} color="#c2cbd2" metal={.45}/>
        <Box at={[.59,-.055,0]} size={[.26-i*.035,.14,.15]} color="#b0bcc9" metal={.45}/>
        <Disk at={[.43,.025,0]} radius={.08} depth={.16} color="#6e8294"/>
      </group>)}
      <Box at={[.12,.02,.56]} size={[.52,.16,.19]} color="#b0bcc9" metal={.45}/>
    </group>}
    <group position={[-.55,.83,0]} ref={joint}>
      <Box at={[.48,.13,0]} size={[1.12,.27,.33]} color="#bbc9d4" metal={.66}/>
      <group position={[1,.13,0]} ref={tip}>
        <Box at={[.32,0,0]} size={[.68,.24,.28]} color="#b5c5d0" metal={.6}/>
        <Disk at={[.02,.08,0]} radius={.12} depth={.30} color="#718494"/>
        {hand && <Wire path={[[-.43,-.12,0],[.06,-.14,0],[.59,-.11,0]]} color="#e39b42"/>}
      </group>
    </group>
  </>;
}
function Counter({active}: {active:boolean}) {
  const target=useRef<Group>(null);
  useFrame((_,delta)=>{
    if (target.current) target.current.position.x+=((active?-.41:0)-target.current.position.x)*Math.min(1,delta*6);
  });
  return <>
    <Box at={[0,.06,0]} size={[3.25,.12,2.1]} color="#27303a"/>
    <Box at={[-1.55,1.16,-.88]} size={[.13,2.32,.13]} color="#667784" metal={.6}/>
    <Box at={[-.83,2.25,-.88]} size={[1.5,.13,.13]} color="#667784" metal={.6}/>
    <Suspense fallback={null}><FittedHardware id="sensors-37" names={['camera-board','lens','focus']} at={[-.13,2.14,-.88]} size={[.66,.25,.40]} rotation={[Math.PI,0,0]}/></Suspense>
    <Box at={[-.84,2.11,-.88]} size={[.56,.19,.42]} color="#e8e2d2"/>
    <spotLight position={[-.84,2.05,-.88]} angle={.66} intensity={8} penumbra={.9}/>
    <Box at={[1.15,.15,-.64]} size={[1.11,.18,.70]} color="#718697" metal={.5}/>
    <Box at={[1.15,.50,-.92]} size={[1.11,.67,.09]} color="#293d53"/>
    <Wire path={[[.18,2.12,-.9],[.62,1.84,-1.01],[.79,.62,-1.01],[1.3,.23,-.85]]} color="#30363e"/>
    {[-.92,.89].map(x=><Box key={x} at={[x,.27,.25]} size={[.51,.30,.63]} color="#f5dc9b"/>)}
    <group ref={target}><Box at={[0,.27,.25]} size={[.51,.30,.63]} color="#f5dc9b"/></group>
    <WorldLabel position={[1.15,.57,-.86]} className="gp-marker-anchor"><span className="gp-demo-readout">{active?2:3} regions</span></WorldLabel>
  </>;
}
function Electronics({id,active,hold,storyStep,phaseSeconds=3}: {id:string;active:boolean;hold:boolean;storyStep:number|null;phaseSeconds?:number}) {
  const signal = id==='traffic-sequencer';
  const soil = id==='soil-observer';
  const inputChanged = active || (storyStep!==null && storyStep>=1);
  const phase = useRef(0);
  const lights = useRef<Group>(null);
  const cycle = useRef(0);
  useFrame((_, delta)=>{
    if (!lights.current) return;
    if (!active) cycle.current = 0;
    else if (!hold) cycle.current = (cycle.current + delta)%(phaseSeconds*2+1);
    const seconds = cycle.current;
    phase.current = !active || seconds<phaseSeconds ? 0 : seconds<phaseSeconds*2 ? 1 : 2;
    lights.current.children.forEach((child,i)=>{child.visible=i===phase.current;});
  });
  return <>
    <Suspense fallback={<Box at={[-.93,.12,0]} size={[1.65,.21,1.23]} color="#086e98"/>}>
      <FittedHardware id="boards-01" at={[-.93,.21,0]} size={[1.65,.34,1.23]}/>
    </Suspense>
    <Suspense fallback={<Box at={[.89,.13,0]} size={[1.67,.22,1.39]} color="#ece8dd"/>}>
      <FittedHardware id="components-25" at={[.89,.13,0]} size={[1.67,.22,1.39]}/>
    </Suspense>
    <Wire path={[[ -.3,.29,.48],[-.09,.52,.66],[.38,.25,.58]]} color="#cb3f41"/>
    <Wire path={[[ -.3,.29,-.5],[-.05,.51,-.7],[.43,.25,-.58]]} color="#232936"/>
    {!signal && <><Wire path={[[ -.28,.30,.29],[-.02,.57,.30],[.91,.25,.42]]} color="#ca9d29"/>
      <Disk at={[.96,.28,.40]} radius={.065} depth={.25} color="#b99765" axle/></>}

    {soil && <>
      <Suspense fallback={null}><FittedHardware id="sensors-27" names={['probe','probe-pcb','circuit']} at={[.72,.81,-.20]} size={[.24,.65,.27]}/></Suspense>
      <Disk at={[.85,.27,-.18]} radius={.45} depth={.49} color="#a47359"/>
      <Disk at={[.85,.53,-.18]} radius={.41} depth={.05} color={inputChanged?'#8b6544':'#423328'}/>
      <Wire path={[[.72,1.02,-.20],[.42,.85,-.37],[.31,.25,-.40]]} color="#e2ae5d"/>
    </>}
    {id==='ambient-light' && <>
      <Suspense fallback={null}><FittedHardware id="sensors-21" at={[.54,.40,-.20]} size={[.31,.29,.26]}/></Suspense>
      <Disk at={[.66,.29,.04]} radius={.036} depth={.23} color="#bc9a68" axle/>
      {!inputChanged && <spotLight position={[.54,1.25,-.20]} intensity={3.8} angle={.35} penumbra={.8}/>}
    </>}
    {id==='home-project' && <>
      <mesh position={[.54,.39,-.20]}><cylinderGeometry args={[.091,.091,.22,32,1,false,0,Math.PI]}/><meshStandardMaterial color="#242b33" side={2}/></mesh>
      <Box at={[.54,.39,-.20]} size={[.019,.22,.18]} color="#242b33"/>
      {[-.055,0,.055].map(offset=><Box key={offset} at={[.54+offset,.27,-.20]} size={[.014,.12,.019]} color="#b9c3cb" metal={.6}/>)}
    </>}
    {id==='button-indicator' && <Suspense fallback={null}>
      <FittedHardware id="components-06" names={['frame','terminals']} at={[.54,.28,-.20]} size={[.28,.11,.28]}/>
      <FittedHardware id="components-06" names={['cap']} at={[.54,inputChanged?.34:.39,-.20]} size={[.14,.10,.14]}/>
    </Suspense>}
    {signal ? <>{[.44,.87,1.31].map((x,i)=><group key={x}>
      <Disk at={[x,.28,-.4]} radius={.036} depth={.23} color="#b99765" axle/>
      <Wire path={[[ -.3,.29,-.34+i*.18],[.14,.49,-.38+i*.09],[x,.25,-.39]]} color={['#ce504b','#55a26e','#dba73c'][i]}/>
    </group>)}<group ref={lights}>{[0,1,2].map(i=><group key={i}>{['#fd4036','#48f0a2','#ffc04a'].map((color,j)=><Lamp key={color} at={[.39+j*.48,.26,0]} color={color} lit={i===j}/>)}</group>)}</group></>
      : <Lamp at={[1.25,.25,.40]} color={id==='soil-observer'?'#ffb34a':'#56eca2'} lit={active}/>}
  </>;
}
const demoAnchors: Record<string, Record<number, Point>> = {
  'rover-project': {0:[0,.78,-.24],1:[0,.77,1.09],2:[.56,.62,.45],5:[0,.64,-.77],6:[.68,.81,-.35],3:[1.19,.47,.32],4:[-.68,.43,-.64]},
  'hand-project': {0:[-1.08,.35,.91],1:[-.55,.47,.35],2:[.55,1.06,0],3:[1.02,.77,0],4:[.68,.42,-.92],5:[-.52,.45,.66]},
  'desktop-arm': {0:[-1.08,.35,.91],1:[-.55,.47,.35],2:[.55,1.06,0],3:[.68,.42,-.92],4:[-.52,.45,.66]},
  'soil-observer': {0:[-.93,.32,0],1:[.69,1.1,-.18],2:[.85,.57,-.18],3:[1.25,.6,.40],4:[.38,.49,.58]},
  'home-project': {0:[-.93,.32,0],1:[.54,.53,-.20],2:[1.25,.6,.40],3:[.89,.26,.74]},
  'ambient-light': {0:[-.93,.32,0],1:[.54,.53,-.20],2:[.66,.36,.04],3:[1.25,.6,.40],4:[.89,.26,.74]},
  'button-indicator': {0:[-.93,.32,0],1:[.54,.53,-.20],2:[1.25,.6,.40],3:[.89,.26,.74]},
  'traffic-sequencer': {0:[-.93,.32,0],1:[.88,.62,0],2:[1.15,.34,-.4],3:[.89,.26,.74]},
  'mechanism-study': {0:[-1,.61,0],1:[.36,.61,0],2:[.36,.74,0],3:[-.9,.25,.79]},
  'vision-counter': {0:[-.13,2.28,-.88],1:[1.15,.85,-.92],2:[.89,.43,.25],3:[-1.55,1.51,-.88]},
};

type Marker = {index:number;name:string};
const storySignalPaths: Record<string, [number,number][]> = {
  'rover-project': [[1,0],[0,2],[2,3]],
  'hand-project': [[0,1],[1,3],[3,2]],
  'soil-observer': [[1,0],[1,0],[0,3]],
  'home-project': [[1,0],[1,0],[0,2]],
  'ambient-light': [[1,0],[1,0],[0,3]],
  'traffic-sequencer': [[0,1],[0,1],[0,1]],
  'button-indicator': [[1,0],[1,0],[0,2]],
  'mechanism-study': [[3,0],[0,1],[0,1]],
  'desktop-arm': [[0,1],[1,2],[1,2]],
  'vision-counter': [[2,0],[0,1],[0,1]],
};

function StorySignal({from,to,hold}: {from:Point;to:Point;hold:boolean}) {
  const pulse=useRef<Group>(null);
  const time=useRef(0);
  const path=useMemo(()=>new CatmullRomCurve3([
    new Vector3(...from),
    new Vector3((from[0]+to[0])/2,Math.max(from[1],to[1])+.37,(from[2]+to[2])/2),
    new Vector3(...to),
  ]),[from,to]);
  const points=useMemo(()=>path.getPoints(20),[path]);
  useFrame((_,delta)=>{
    if (!hold) time.current=(time.current+delta*1.3)%1;
    pulse.current?.position.copy(path.getPoint(time.current));
  });
  return <>
    <Line points={points} color="#87fff2" lineWidth={2} transparent opacity={.62}/>
    <group ref={pulse} position={from}><mesh><sphereGeometry args={[.061,16,12]}/><meshBasicMaterial color="#fff4a2"/></mesh></group>
  </>;
}

export default function ProjectDemo({id,active,hold=false,storyStep=null,markers,selected,onSelect,configuration}: {id:string;active:boolean;configuration?:ExpansionInfo;hold?:boolean;storyStep?:number | null;markers?:Marker[];selected?:number;onSelect?:(part:number)=>void}) {
  const ratio=configuration?.kind==='ratio'?configuration.limit:3;
  const gearOffset=(ratio-3)*.25;
  const motion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const connection = storyStep!==null && storyStep>0 ? storySignalPaths[id]?.[storyStep-1] : undefined;
  const signal = connection && <StorySignal key={storyStep}
    from={demoAnchors[id][connection[0]]} to={demoAnchors[id][connection[1]]} hold={hold||motion.current}/>;
  const partMarkers = markers?.map(marker => {
        const anchor = demoAnchors[id]?.[marker.index];
        const position: Point | undefined = anchor && id==='mechanism-study' && [1,2].includes(marker.index) ? [anchor[0]+gearOffset,anchor[1],anchor[2]] : anchor;
        return position && <group key={marker.index}>
          {selected===marker.index && <mesh position={position}><sphereGeometry args={[.135,20,16]}/><meshBasicMaterial color="#ffd776" transparent opacity={.38} depthWrite={false}/></mesh>}
          <WorldLabel position={position} className="gp-marker-anchor">
          <button className="gp-marker" aria-label={marker.name} aria-pressed={selected===marker.index} onClick={()=>onSelect?.(marker.index)}>{marker.index+1}{selected===marker.index&&<span className="gp-demo-marker-name">{marker.name}</span>}</button>
        </WorldLabel></group>;
      });
  return <div className="gp-canvas" aria-label="Interactive 3D demonstration">
    <Canvas dpr={[1,1.5]} camera={{position:[4,4.6,6],fov:39}} fallback={<p>3D viewing requires WebGL. The expected result is shown below.</p>}>
      <color attach="background" args={['#293641']}/>
      <ambientLight intensity={.55}/>
      <directionalLight position={[3,6,5]} intensity={1.5}/>
      <Environment resolution={128}>
        <Lightformer intensity={3.2} color="#fff4e5" position={[2,5,1]} rotation={[Math.PI/2,0,0]} scale={6}/>
        <Lightformer intensity={1.7} color="#bad9ff" position={[-5,3,-3]} rotation={[0,-Math.PI/2,0]} scale={4}/>
      </Environment>
      <Box at={[0,-.075,0]} size={[14,.12,14]} color="#3b4b56"/>
      {id==='rover-project' ? <Rover active={active} threshold={configuration?.kind==='distance'?configuration.limit:undefined} approaching={storyStep===1} reducedMotion={motion.current || hold}>{partMarkers}{signal}</Rover>
        : id==='hand-project'||id==='desktop-arm' ? <Linkage hand={id==='hand-project'} active={active} target={configuration?.kind==='angle'?(active?configuration.limit:75):undefined}/>
        : id==='vision-counter' ? <Counter active={active}/>
        : id==='mechanism-study' ? <><Box at={[0,.12,0]} size={[3.25+Math.max(0,gearOffset*2),.24,2+Math.max(0,gearOffset)]} color="#526472" metal={.55}/><Gear at={[-1,.47,0]} teeth={12} radius={.32} color="#b58b56" crank speed={active&&!hold&&!motion.current?2.4:0}/><Gear at={[.36+gearOffset,.47,0]} teeth={12*ratio} radius={.91+gearOffset} color="#9ba9b6" speed={active&&!hold&&!motion.current?-2.4/ratio:0}/></>
        : <Electronics id={id} active={active} hold={hold} storyStep={storyStep} phaseSeconds={configuration?.kind==='timer'?configuration.limit:undefined}/>}
      {id!=='rover-project' && <>{partMarkers}{signal}</>}
      {id==='mechanism-study' && <>
        <Disk at={[-1,.33,0]} radius={.14} depth={.29} color="#8294a2"/>
        <Disk at={[.36+gearOffset,.33,0]} radius={.14} depth={.29} color="#8294a2"/>
        {[-1.45,1.36].flatMap(x=>[-.79,.79].map(z=><Disk key={`${x}/${z}`} at={[x,.245,z]} radius={.055} depth={.025} color="#acb7bf"/>))}
      </>}
      <ContactShadows opacity={.45} scale={8} blur={2} resolution={128}/>
      <OrbitControls target={[0,.45,0]} enablePan={false} minDistance={3.5} maxDistance={13} maxPolarAngle={1.48}/>
    </Canvas>
  </div>;
}

const partAssets: Record<string, [string, string[]?][]> = {
  'Arduino Uno R3': [['boards-01']],
  'HC-SR04 ultrasonic module': [['sensors-08']],
  'TB6612FNG breakout': [['components-34',['board','chip','capacitor','pads']]],
  'Breadboard and jumper wires': [['components-25'],['components-24']],
  'LED and 330 Ω resistor': [['components-20'],['components-01']],
  '330 Ω resistors': [['components-01']],
  '10 kΩ resistor': [['components-01']],
  'Positional micro servo': [['anatomy-31',['case','horn','shaft','cable','mounting']]],
  'Hinged finger and palm frame': [['anatomy-13',['palm','fingers','joints','thumb','knuckle-caps']]],
  'Nylon cord and elastic return': [['anatomy-14',['cords']]],
  '5 V-compatible analog capacitive probe': [['sensors-27',['probe','probe-pcb','circuit','cable']]],
  'Photoresistor': [['sensors-21']],
  'Momentary tactile button': [['components-06']],
  'Red, amber and green LEDs': [['components-20']],
  'Matching shafts and bearings': [['robots-45',['races','balls','shafts','collars']]],
  'Arm link and base fixture': [['anatomy-14',['plate','bracket','links','pins']]],
};

function selectHardware(scene: Group, names?: string[]) {
  if (!names) return scene.clone(true);
  const group = scene.clone(false);
  for (const name of names) {
    const part = scene.getObjectByName(name);
    if (!part) continue;
    const copy = part.clone(true);
    part.updateWorldMatrix(true, false);
    part.matrixWorld.decompose(copy.position,copy.quaternion,copy.scale);
    group.add(copy);
  }
  return group.children.length ? group : scene.clone(true);
}

function AtlasPart({asset}: {asset:[string,string[]?]}) {
  const [id, names] = asset;
  const {scene} = useGLTF(`./models/hardware/${id}.glb`);
  const object = useMemo(() => selectHardware(scene,names),[scene,names]);
  return <primitive object={object}/>;
}

function PartGeometry({name}: {name:string}) {
  const assets = partAssets[name];
  if (assets) return <>{assets.map((asset,index)=>
    <group key={asset[0]} position={[assets.length===1?0:index*1.8-.9,0,0]}><Center><AtlasPart asset={asset}/></Center></group>
  )}</>;
  if (name.endsWith('spur gear')) {
    const teeth = Number.parseInt(name,10);
    return <Gear at={[0,0,0]} teeth={teeth} radius={teeth*.025} color="#91a2b2" speed={0}/>;
  }
  switch (name) {
    case '6 V geared DC motors and wheels':
      return <><Box at={[-.43,0,0]} size={[.82,.45,.48]} color="#efba33"/><Disk at={[-.94,0,0]} radius={.21} depth={.43} color="#9aa7ae" axle/><Disk at={[.62,0,0]} radius={.49} depth={.22} color="#25282b" axle/><Disk at={[.75,0,0]} radius={.31} depth={.05} color="#e2a928" axle/></>;
    case 'Chassis and caster':
      return <><Box at={[0,.05,0]} size={[1.65,.09,2.2]} color="#57646f" metal={.5}/><Disk at={[0,-.21,.75]} radius={.18} depth={.13} color="#2c343b" axle/></>;
    case 'Switched 4×AA holder':
      return <><Box at={[0,0,0]} size={[1.5,.24,1.38]} color="#20262f"/>{[-.49,-.16,.16,.49].map(x=><mesh key={x} position={[x,.20,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.135,.135,1.18,28]}/><meshStandardMaterial color="#9c732a" metalness={.5}/></mesh>)}<Box at={[.57,.23,.73]} size={[.23,.17,.19]} color="#333c46"/></>;
    case 'Regulated 5 V servo supply':
      return <><Box at={[0,0,0]} size={[.83,.58,.72]} color="#252a34"/><Wire path={[[.3,0,.25],[.67,-.09,.34],[.91,-.14,.18],[1.18,-.14,.22]]} color="#20242a"/><Disk at={[1.22,-.14,.22]} radius={.05} depth={.16} color="#aeb8bd" axle/></>;
    case 'TMP36 analog temperature sensor':
      return <><Disk at={[0,.18,0]} radius={.23} depth={.38} color="#252b32"/>{[-.11,0,.11].map(x=><Box key={x} at={[x,-.25,0]} size={[.035,.55,.035]} color="#aeb9c5" metal={.65}/>)}</>;
    case 'Dry and damp soil samples':
      return <>{[-.52,.52].map((x,index)=><group key={x}><Disk at={[x,0,0]} radius={.43} depth={.55} color="#a97352"/><Disk at={[x,.29,0]} radius={.39} depth={.05} color={index?'#493229':'#886047'}/></group>)}</>;
    case 'USB webcam':
      return <><Box at={[0,0,0]} size={[1.15,.43,.34]} color="#252d37"/><mesh position={[0,0,.22]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.17,.17,.15,32]}/><meshStandardMaterial color="#3e7596" metalness={.45}/></mesh><Wire path={[[.54,0,0],[.76,0,0],[.87,-.26,0],[1.03,-.32,.22]]} color="#262b31"/></>;
    case 'Computer with webcam support':
      return <><Box at={[0,-.25,.21]} size={[1.56,.09,1.04]} color="#768999" metal={.52}/><Box at={[0,.22,-.29]} size={[1.56,.87,.08]} color="#334b63"/><Box at={[0,.23,-.24]} size={[1.40,.73,.03]} color="#122138"/></>;
    case 'Matte dark card and bright targets':
      return <><Box at={[0,0,0]} size={[1.9,.055,1.3]} color="#202530"/>{[-.55,0,.55].map(x=><Box key={x} at={[x,.10,0]} size={[.31,.17,.35]} color="#ffe3a6"/>)}</>;
    case 'Fixed stand and diffuse lamp':
      return <><Box at={[0,-.64,0]} size={[.85,.12,.68]} color="#475869"/><Box at={[-.28,0,0]} size={[.08,1.28,.08]} color="#aab7c2" metal={.55}/><Box at={[.1,.62,0]} size={[.82,.09,.09]} color="#aab7c2" metal={.55}/><Box at={[.43,.54,0]} size={[.39,.18,.48]} color="#e7dfc8"/></>;
    case 'Base, hand crank and hardware':
      return <><Box at={[0,-.17,0]} size={[1.6,.16,1.15]} color="#455a6d"/><Disk at={[-.32,.04,0]} radius={.13} depth={.46} color="#aab7c2"/><Box at={[-.06,.28,0]} size={[.57,.08,.12]} color="#aab7c2" metal={.5}/><Disk at={[.21,.42,0]} radius={.08} depth={.32} color="#323d48"/></>;
    default:
      return null;
  }
}

export function ProjectPartView({name}: {name:string}) {
  return <div className="gp-canvas" role="region" aria-label={`3D model of ${name}`}>
    <Canvas dpr={[1,1.5]} camera={{position:[4,3.5,5],fov:37}} fallback={<p>3D viewing requires WebGL.</p>}>
      <color attach="background" args={['#192a3d']}/>
      <ambientLight intensity={1.6}/>
      <directionalLight position={[3,6,5]} intensity={2.7}/>
      <directionalLight position={[-4,3,-3]} color="#a9c9ff" intensity={1.35}/>
      <OrbitControls makeDefault enablePan={false}/>
      <Suspense fallback={null}><Bounds key={name} fit clip observe margin={1.3}><Center><PartGeometry name={name}/></Center></Bounds></Suspense>
    </Canvas>
  </div>;
}
