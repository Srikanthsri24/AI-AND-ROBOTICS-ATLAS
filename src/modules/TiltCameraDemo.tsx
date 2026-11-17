import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, PerspectiveCamera, type Group } from 'three';
import { tiltLimits } from '../data/tilt-camera';
import { BalanceImu } from './PickBalanceDemo';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
type Capture = { id: number; angle: number };
const parts = [
  ['OV2640 lens and ESP32-CAM', 'The ESP32 captures a JPEG through the ribbon cable once the tilt crosses 20°. The lens faces the toy scene.'],
  ['MPU6050 breakout', 'Two I²C leads carry the measured gravity components. Tilting around the marked hinge changes the X and Z readings.'],
  ['USB-to-serial adapter', 'TX and RX carry commands and image data to the computer at 3.3 V logic. The camera board has separate 5 V power.'],
  ['Hinged test plate', 'Keeps both modules moving around the same axis. Returning within 10° of level rearms the capture.'],
] as const;

function Box({ at, size, color, metal = 0 }: {at:Point; size:Point; color:string; metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.13} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal?.34:.65}/>
  </RoundedBox>;
}

export function CameraBoard({ highlighted = false }: {highlighted?:boolean}) {
  return <>
    <Box at={[0,.048,0]} size={[1.05,.088,1.49]} color={highlighted?'#4b5750':'#303735'}/>
    <Box at={[0,.106,.40]} size={[.65,.044,.48]} color="#aeb2ab" metal={.65}/>
    <Box at={[0,.127,-.12]} size={[.58,.044,.32]} color="#b69352"/>
    <Box at={[0,.147,-.375]} size={[.49,.05,.39]} color="#80583e"/>
    <Box at={[0,.215,-.38]} size={[.42,.11,.36]} color="#2c2e35"/>
    <mesh position={[0,.292,-.38]}><cylinderGeometry args={[.141,.141,.083,32]}/><meshStandardMaterial color="#222835" metalness={.36}/></mesh>
    <mesh position={[0,.339,-.38]}><sphereGeometry args={[.084,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#29475c" metalness={.48} roughness={.19}/></mesh>
    {[-.43,.43].map(x=><group key={x}>
      <Box at={[x,.127,.09]} size={[.093,.068,1.12]} color="#22282c"/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[x,.167,-.35+i*.127]} size={[.037,.037,.033]} color="#bd9960" metal={.45}/>)}
    </group>)}
    <Box at={[.31,.117,-.47]} size={[.09,.03,.09]} color="#ecdaac"/>
  </>;
}

export function SerialAdapter({ highlighted = false }: {highlighted?:boolean}) {
  return <>
    <Box at={[0,.058,0]} size={[1.04,.082,.48]} color={highlighted?'#3b7a9b':'#2e567e'}/>
    <Box at={[-.40,.136,0]} size={[.26,.105,.25]} color="#bac4cb" metal={.62}/>
    <Box at={[.05,.123,.006]} size={[.26,.058,.20]} color="#272e36"/>
    <Box at={[.40,.119,0]} size={[.15,.115,.40]} color="#292d32"/>
    {Array.from({length:6},(_,i)=><Box key={i} at={[.47,.174,i*.057-.14]} size={[.026,.018,.029]} color="#bda065" metal={.49}/>)}
  </>;
}

function Marker({ at, tag, index, selected, select }: {at:Point;tag:Point;index:number;selected:number;select:(index:number)=>void}) {
  return <>
    <Line points={[at,tag]} color={selected===index?'#ffe296':'#c2d1d7'} lineWidth={1.35}/>
    <WorldLabel position={tag} className="gp-marker-anchor"><button type="button" aria-label={parts[index][0]}
      aria-pressed={selected===index} className="gp-marker" onClick={()=>select(index)}>{index+1}</button></WorldLabel>
  </>;
}

function Bench({ angle, capture, selected, select, labels, onImage }: {
  angle:number;capture:Capture|null;selected:number;select:(index:number)=>void;labels:boolean;onImage:(image:string, capture:Capture)=>void;
}) {
  const hinge = useRef<Group>(null);
  const lens = useRef<PerspectiveCamera>(null);
  const completed = useRef(0);
  useFrame(({ gl, scene, camera, size },delta)=>{
    if(!hinge.current||!lens.current) return;
    const physical = MathUtils.degToRad(angle);
    hinge.current.rotation.z = MathUtils.damp(hinge.current.rotation.z,physical,11,delta);
    if(capture&&capture.id!==completed.current&&Math.abs(hinge.current.rotation.z-physical)<.035) {
      completed.current=capture.id;
      lens.current.aspect=size.width/Math.max(1,size.height);
      lens.current.updateProjectionMatrix();
      scene.updateMatrixWorld(true);
      gl.render(scene,lens.current);
      const image=gl.domElement.toDataURL('image/jpeg',.88);
      gl.render(scene,camera);
      onImage(image,capture);
    }
  });
  const rig = {selected,select};
  return <>
    <color attach="background" args={['#273645']}/>
    <ambientLight intensity={.63}/>
    <directionalLight position={[-5,8,7]} intensity={2.5} color="#fff0d9"/>
    <directionalLight position={[5,6,-4]} intensity={1.25} color="#bbdfff"/>
    <Box at={[0,-.17,.22]} size={[12,.32,9]} color="#41535a"/>
    <Box at={[-.87,.10,-.92]} size={[2.53,.17,1.72]} color="#756858"/>
    <Box at={[-.87,.35,-.92]} size={[.23,.43,1.35]} color="#566067" metal={.43}/>
    {[-1.62,-.25].map(z=><mesh key={z} position={[-.87,.52,z]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.095,.095,.26,24]}/><meshStandardMaterial color="#a4afb0" metalness={.75} roughness={.32}/>
    </mesh>)}
    <group position={[-.87,.53,-.9]} ref={hinge}>
      <Box at={[0,.05,0]} size={[2.65,.10,1.32]} color={selected===3?'#bb9668':'#938476'}/>
      <Box at={[-.59,.24,.28]} size={[.55,.32,.18]} color="#4e585f"/>
      <group position={[-.59,.36,.31]} rotation={[Math.PI/2,0,0]} scale={.72}><CameraBoard highlighted={selected===0}/></group>
      <perspectiveCamera ref={lens} args={[44,1,.04,15]} position={[-.59,.62,.62]} rotation={[0,Math.PI,0]}/>
      <group position={[.69,.105,-.09]} scale={.67}><BalanceImu selected={selected===1}/></group>
      {['#dc8a63','#273139','#77c5ce','#d0b56b'].map((color,i)=><Line key={color}
        points={[[.42+i*.17,.23,-.16],[.42+i*.16,.21,-.45],[-.35+i*.082,.13,-.49],[-.43+i*.07,.22,.10]]} color={color} lineWidth={1.95}/>)}
      {labels&&<>
        <Marker at={[-.58,.53,.49]} tag={[-1.48,.97,.85]} index={0} {...rig}/>
        <Marker at={[.71,.25,-.08]} tag={[1.18,.78,-.32]} index={1} {...rig}/>
        <Marker at={[.74,.10,.51]} tag={[1.40,.32,.82]} index={3} {...rig}/>
      </>}
    </group>
    <group position={[-2.31,.11,-.22]}><SerialAdapter highlighted={selected===2}/></group>
    <Line points={[[-2.74,.25,-.22],[-3.02,.14,.06],[-3.36,.10,.54],[-3.66,.10,.71]]} color="#283237" lineWidth={4.0}/>
    {['#3c414c','#6fa9cd','#d4b269'].map((color,i)=><Line key={color}
      points={[[-1.86,.24,-.34+i*.073],[-1.46,.21,-.05+i*.04],[-1.20,.19,-.09+i*.05],[-.94,.36,-.33+i*.06]]} color={color} lineWidth={1.65}/>)}
    <Box at={[-2.83,.13,-1.48]} size={[.79,.23,.45]} color="#373d42"/>
    <Line points={[[-2.47,.23,-1.49],[-2.05,.16,-1.47],[-1.58,.34,-1.33],[-1.34,.60,-1.14]]} color="#ba6b59" lineWidth={1.8}/>
    <group position={[-1.42,.08,2.04]}>
      <Box at={[0,0,.08]} size={[2.19,.14,1.45]} color="#47696c"/>
      <Box at={[0,.65,.58]} size={[2.14,1.26,.09]} color="#d0cec1"/>
      {[-.75,-.45,-.15,.15,.45,.75].map((x,i)=><Box key={x} at={[x,.66,.528]} size={[.074,1.10,.013]} color={i%2?'#c2b89f':'#93a3a2'}/>)}
      <Box at={[-.32,.37,0]} size={[.55,.62,.57]} color="#e4ac4d"/>
      <Box at={[.33,.28,.17]} size={[.56,.45,.54]} color="#497c9e"/>
      <mesh position={[.36,.60,.16]}><sphereGeometry args={[.16,24,14]}/><meshStandardMaterial color="#b95549" roughness={.42}/></mesh>
    </group>
    <ContactShadows position={[0,.003,0]} scale={10} opacity={.51} blur={2.8}/>
    {labels&&<Marker at={[-2.28,.26,-.21]} tag={[-3.08,.81,-.43]} index={2} {...rig}/>}
  </>;
}

export default function TiltCameraDemo() {
  const [angle,setAngle]=useState(0);
  const [running,setRunning]=useState(false);
  const [armed,setArmed]=useState(true);
  const [capture,setCapture]=useState<Capture|null>(null);
  const [latest,setLatest]=useState<{image:string;capture:Capture}|null>(null);
  const [sequence,setSequence]=useState(0);
  const [selected,select]=useState(0);
  const [labels,setLabels]=useState(true);
  const [rendererReady,setRendererReady]=useState(false);
  function tilt(value:number) {
    setAngle(value);
    if(!running||capture) return;
    if(Math.abs(value)<=tiltLimits.rearm) setArmed(true);
    if(armed&&Math.abs(value)>=tiltLimits.capture) {
      setArmed(false);
      setSequence(sequence+1);
      setCapture({id:sequence+1,angle:value});
    }
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D ESP32-CAM and MPU6050 tilt bench">
        <Canvas dpr={[1,1.6]} camera={{position:[5.2,5.4,4.4],fov:36}} onCreated={()=>setRendererReady(true)} fallback={<p>WebGL is required to capture the simulated camera image.</p>}>
          <Bench angle={capture?.angle??angle} capture={capture} selected={selected} select={select} labels={labels}
            onImage={(image,snapshot)=>{setLatest({image,capture:snapshot});setCapture(null);}}/>
          <OrbitControls target={[-1.20,.58,.60]} minDistance={4.7} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Tilt bench readings">
        <div><span>Measured tilt</span><strong>{angle}°</strong></div>
        <div><span>Capture state</span><strong>{capture ? 'Capturing' : running ? armed ? 'Armed' : 'Held' : 'Stopped'}</strong></div>
        <div><span>Saved frames</span><strong>{latest?.capture.id??0}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Tilt the platform and inspect the frame</h3>
      <p>Calibrate at level, cross {tiltLimits.capture}°, and hold the angle. Return within {tiltLimits.rearm}° before trying another capture.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={!rendererReady||capture!==null} onClick={()=>{
          if(running) setRunning(false);
          else { setRunning(true); setAngle(0); setArmed(true); }
        }}>{running?'Stop bench':'Run and calibrate'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <label htmlFor="tilt-camera-angle">Platform angle · {angle}°</label>
      <input id="tilt-camera-angle" className="gp-lidar-range" type="range" min={-40} max={40}
        value={angle} disabled={!running||capture!==null} onChange={e=>tilt(Number(e.target.value))}/>
      <div className="gp-steps">
        {[-30,0,30].map(value=><button type="button" key={value} disabled={!running||capture!==null}
          onClick={()=>tilt(value)}>{value===0?'Return to level':`Tilt to ${value}°`}</button>)}
      </div>
      <p className="gp-demo-description" role="status">{capture?'Exposing the virtual frame…':latest?`Frame ${latest.capture.id} saved at ${latest.capture.angle}°.`:'No frames saved yet.'}</p>
      {latest&&<figure className="gp-part-preview">
        <img src={latest.image} alt={`Simulated camera image of toy blocks at ${latest.capture.angle}°`}/>
        <figcaption><a className="gp-button gp-secondary" href={latest.image} download={`tilt-frame-${latest.capture.id}.jpg`}>Download JPEG</a></figcaption>
      </figure>}
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
