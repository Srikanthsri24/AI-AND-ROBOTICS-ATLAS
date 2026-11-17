import { useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { Line as ThreeLine, MathUtils, Vector3, type BufferAttribute, type Group } from 'three';
import { gestureLimits, interpretGesture, type Gesture } from '../data/gesture-rover';
import { Uno } from './ClassroomStationsDemo';
import { BalanceImu } from './PickBalanceDemo';
import { WorldLabel } from './LabWorkbench';

extend({ ThreeLine });

type Point=[number,number,number];
const details = [
  ['Wrist pad and MPU6050', 'The X and Y acceleration components are compared with Z to estimate pitch and roll. Calibrate with the pad resting level.'],
  ['Hold-to-run switch', 'A press pulls D2 low. When it is released, the internal pull-up makes the input high and the driver stops.'],
  ['Rover and motor driver', 'The two channels turn the wheels together for straight travel and in opposite directions to pivot.'],
  ['Signal tether', 'The tether carries 5 V, ground, SDA, SCL and the enable signal. Keep it clear of the wheels.'],
] as const;
const wheelMotion:Record<Gesture,[number,number]> = {
  Stop:[0,0],Forward:[1,1],Reverse:[-1,-1],'Turn left':[-1,1],'Turn right':[1,-1],
};
const wheelWords=(motion:number)=>motion>0?'Forward':motion<0?'Reverse':'Stopped';
const pose = [1.00,.18,.17] as const;

function Box({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal?.35:.64}/>
  </RoundedBox>;
}

function RoverWheel({side,reference}:{side:number;reference:React.RefObject<Group|null>}) {
  return <group position={[side*.43,.15,-.05]} rotation={[0,0,Math.PI/2]}>
    <group ref={reference}>
      <mesh><cylinderGeometry args={[.22,.22,.134,30]}/><meshStandardMaterial color="#242b34" roughness={.75}/></mesh>
      <mesh position={[0,side*.07,0]}><cylinderGeometry args={[.135,.135,.026,24]}/><meshStandardMaterial color="#ba954a" metalness={.22}/></mesh>
      {Array.from({length:14},(_,i)=><group key={i} rotation={[0,i*Math.PI/7,0]}>
        <Box at={[.215,0,0]} size={[.027,.135,.046]} color="#39424c"/>
        {i%3===0&&<Box at={[.073,side*.086,0]} size={[.084,.008,.018]} color="#6f562d"/>}
      </group>)}
    </group>
  </group>;
}

function Bench({pitch,roll,enabled,command,selected,select,labels,reset}:{
  pitch:number;roll:number;enabled:boolean;command:Gesture;selected:number;select:(i:number)=>void;labels:boolean;reset:number;
}) {
  const rover=useRef<Group>(null);
  const controller=useRef<Group>(null);
  const left=useRef<Group>(null),right=useRef<Group>(null);
  const tether=useRef<BufferAttribute>(null);
  const tetherVertices=useRef(new Float32Array(75));
  const observedReset=useRef(reset);
  const padSocket=useRef(new Vector3());
  useFrame((_,seconds)=>{
    const delta=Math.min(seconds,.055);
    if(controller.current){
      controller.current.rotation.x=MathUtils.damp(controller.current.rotation.x,MathUtils.degToRad(-pitch),12,delta);
      controller.current.rotation.z=MathUtils.damp(controller.current.rotation.z,MathUtils.degToRad(-roll),12,delta);
    }
    if(!rover.current)return;
    const robot=rover.current;
    if(observedReset.current!==reset){
      observedReset.current=reset;robot.position.set(...pose);robot.rotation.y=0;
    }
    const [l,r]=wheelMotion[command];
    if(left.current)left.current.rotation.y+=l*7*delta;
    if(right.current)right.current.rotation.y-=r*7*delta;
    robot.rotation.y+=(r-l)*1.15*delta;
    const step=(l+r)*.43*delta;
    robot.position.x=MathUtils.clamp(robot.position.x+Math.sin(robot.rotation.y)*step,.52,2.69);
    robot.position.z=MathUtils.clamp(robot.position.z+Math.cos(robot.rotation.y)*step,-.85,1.02);
    if(tether.current){
      const endX=robot.position.x-Math.sin(robot.rotation.y)*.44;
      const endZ=robot.position.z-Math.cos(robot.rotation.y)*.44;
      const socket=padSocket.current.set(.60,.086,-.20);
      controller.current?.localToWorld(socket);
      for(let i=0;i<=24;i++){
        const q=i/24;
        tether.current.setXYZ(i,MathUtils.lerp(socket.x,endX,q),MathUtils.lerp(socket.y,.31,q)-Math.sin(Math.PI*q)*.10,MathUtils.lerp(socket.z,endZ,q)-.31*Math.sin(q*Math.PI));
      }
      tether.current.needsUpdate=true;
    }
  });
  const anchors:Point[]=[[-2.25,.45,-.01],[-2.55,.37,.40],[2.04,.30,-1.20],[-.60,.32,-.30]];
  const tags:Point[]=[[-2.82,.96,-.48],[-2.86,.75,.70],[2.55,.85,-1.00],[-.48,.79,-.35]];
  return <>
    <color attach="background" args={['#233749']}/>
    <ambientLight intensity={.63}/>
    <directionalLight position={[-4,8,7]} intensity={2.4} color="#ffe8cc"/>
    <directionalLight position={[4,5,-6]} intensity={1.5} color="#bddcfa"/>
    <Box at={[0,-.16,0]} size={[12,.30,8]} color="#415663"/>
    <Box at={[-2.20,.046,.05]} size={[2.38,.09,2.30]} color="#536b6f"/>
    <Box at={[-2.22,.17,.06]} size={[.24,.19,.86]} color="#444e53" metal={.35}/>
    <group ref={controller} position={[-2.22,.41,.06]}>
      <Box at={[0,0,0]} size={[1.29,.10,1.11]} color={selected===0?'#7b8c8b':'#647a79'}/>
      <group position={[-.09,.073,-.17]} scale={.84}><BalanceImu selected={selected===0}/></group>
      <Box at={[-.31,.088,.32]} size={[.25,.105,.23]} color={selected===1?'#8d7043':'#303941'}/>
      <mesh position={[-.31,enabled?.133:.170,.32]}><cylinderGeometry args={[.077,.077,.092,22]}/>
        <meshStandardMaterial color={enabled?'#e3ad62':'#9a815b'}/></mesh>
      {[0,1,2,3].map(i=><Line key={i} points={[[.09+i*.087,.18,-.10],[.33+i*.057,.107,-.29],[.60,.086,-.24+i*.027]]}
        color={['#bd7362','#303a41','#7cc1d1','#dbc084'][i]} lineWidth={1.35}/>)}
    </group>
    <threeLine frustumCulled={false}>
      <bufferGeometry><bufferAttribute ref={tether} attach="attributes-position" args={[tetherVertices.current,3]}/></bufferGeometry>
      <lineBasicMaterial color={selected===3?'#efc075':'#b3c4ca'}/>
    </threeLine>
    <Box at={[1.61,.055,.17]} size={[3.46,.098,3.07]} color="#354956"/>
    {[-1.26,1.65].map(z=><Box key={z} at={[1.61,.114,z]} size={[3.41,.017,.037]} color="#b6cabf"/>)}
    {[-.06,3.29].map(x=><Box key={x} at={[x,.115,.18]} size={[.036,.017,2.89]} color="#b6cabf"/>)}
    {Array.from({length:6},(_,i)=><Box key={i} at={[.28+i*.46,.112,.18]} size={[.18,.010,.028]} color="#b7c6cf"/>)}
    <group ref={rover} position={[...pose]}>
      <Box at={[0,.17,0]} size={[.79,.14,1.0]} color={selected===2?'#e5be65':'#c79749'}/>
      <Box at={[0,.29,-.35]} size={[.59,.18,.31]} color="#454c50"/>
      <group position={[-.085,.215,.17]} scale={.62}><Uno at={[0,0,0]}/></group>
      <Box at={[.25,.274,-.05]} size={[.19,.055,.29]} color="#236d88"/>
      <Box at={[.25,.31,-.03]} size={[.09,.04,.092]} color="#242b31"/>
      <Box at={[.25,.303,.066]} size={[.15,.025,.064]} color="#69908a"/>
      <Line points={[[.25,.306,-.173],[.29,.33,-.27],[.35,.25,-.18],[.42,.23,-.05]]} color="#ba776b" lineWidth={1.82}/>
      <Line points={[[.22,.302,.075],[.16,.33,.18],[-.04,.316,.22]]} color="#76b5d6" lineWidth={1.63}/>
      <mesh position={[0,.083,-.43]}><sphereGeometry args={[.089,20,12]}/><meshStandardMaterial color="#444c55"/></mesh>
      <RoverWheel side={1} reference={left}/><RoverWheel side={-1} reference={right}/>
      {labels&&<>
        <Line points={[[.24,.31,-.05],[.68,.92,-.44]]} color={selected===2?'#ffe4a0':'#c0d3dd'} lineWidth={1.5}/>
        <WorldLabel position={[.68,.92,-.44]} className="gp-marker-anchor"><button type="button" aria-label={details[2][0]} aria-pressed={selected===2}
          className="gp-marker" onClick={()=>select(2)}>3</button></WorldLabel>
      </>}
    </group>
    <ContactShadows position={[0,.004,0]} scale={10} opacity={.52} blur={2.7}/>
    {labels&&tags.map((tag,i)=>i===2?null:<group key={i}>
      <Line points={[anchors[i],tag]} lineWidth={1.5} color={selected===i?'#ffe4a0':'#c0d3dd'}/>
      <WorldLabel position={tag} className="gp-marker-anchor"><button type="button" aria-label={details[i][0]} aria-pressed={selected===i}
        className="gp-marker" onClick={()=>select(i)}>{i+1}</button></WorldLabel>
    </group>)}
  </>;
}

export default function GestureRoverDemo() {
  const [pitch,setPitch]=useState(0),[roll,setRoll]=useState(0);
  const [enabled,setEnabled]=useState(false),[calibrated,setCalibrated]=useState(false),[sensor,setSensor]=useState(true);
  const [selected,select]=useState(0),[labels,setLabels]=useState(true),[reset,setReset]=useState(0);
  const [notice,setNotice]=useState('Set the pad level and calibrate before the first motion test.');
  const command=interpretGesture(pitch,roll,enabled,calibrated,sensor);
  const [left,right]=wheelMotion[command];
  function setGesture(p:number,r:number){setPitch(p);setRoll(r);}
  function calibrate(){
    if(enabled||!sensor||Math.abs(pitch)>10||Math.abs(roll)>10){
      setCalibrated(false);setNotice('Release Enable, connect the sensor and level the pad before calibrating.');return;
    }
    setGesture(0,0);setCalibrated(true);setNotice('Pad calibrated. Enable drive and choose a gesture.');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D gesture-controlled rover and tilt pad">
        <Canvas camera={{position:[-.70,5.20,7.10],fov:39}} dpr={[1,1.6]} fallback={<p>Use the gesture controls and wheel readings below.</p>}>
          <Bench pitch={pitch} roll={roll} enabled={enabled} command={command} selected={selected} select={select} labels={labels} reset={reset}/>
          <OrbitControls target={[0,.23,.08]} minDistance={5} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Gesture and wheel readings">
        <div><span>Command</span><strong>{command}</strong></div>
        <div><span>Left wheel</span><strong>{wheelWords(left)}</strong></div>
        <div><span>Right wheel</span><strong>{wheelWords(right)}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Calibrate, enable and tilt</h3>
      <p>Small tilts under {gestureLimits.deadband}° stay neutral. When both axes are nearly equal the rover stops.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={calibrate}>Calibrate pad</button>
        <button type="button" disabled={!calibrated||!sensor} aria-pressed={enabled}
          onClick={()=>{setEnabled(value=>!value);setNotice(enabled?'Enable released. Both wheels stop.':'Enable held. Tilt the pad to drive.');}}>{enabled?'Release enable':'Hold enable'}</button>
        <button type="button" aria-pressed={sensor} onClick={()=>{
          setSensor(value=>!value);setEnabled(false);setCalibrated(false);
          setNotice(sensor?'Sensor disconnected. Both wheels stop.':'Sensor connected. Level the pad and calibrate again.');
        }}>{sensor?'Disconnect IMU':'Reconnect IMU'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <label htmlFor="gesture-pitch">Pitch · {pitch}°</label>
      <input id="gesture-pitch" className="gp-lidar-range" type="range" min={-65} max={65} value={pitch} onChange={event=>setPitch(Number(event.target.value))}/>
      <label htmlFor="gesture-roll">Roll · {roll}°</label>
      <input id="gesture-roll" className="gp-lidar-range" type="range" min={-65} max={65} value={roll} onChange={event=>setRoll(Number(event.target.value))}/>
      <div className="gp-steps">
        <button type="button" onClick={()=>setGesture(0,0)}>Level pad</button>
        <button type="button" onClick={()=>setGesture(25,0)}>Tilt forward</button>
        <button type="button" onClick={()=>setGesture(-25,0)}>Tilt back</button>
        <button type="button" onClick={()=>setGesture(0,-25)}>Tilt left</button>
        <button type="button" onClick={()=>setGesture(0,25)}>Tilt right</button>
        <button type="button" onClick={()=>setGesture(24,24)}>Diagonal tilt</button>
        <button type="button" onClick={()=>{setReset(value=>value+1);setGesture(0,0);setEnabled(false);setNotice('Rover returned to neutral.');}}>Reset rover</button>
      </div>
      <p className="gp-demo-description" role="status">{notice}</p>
      <ol className="gp-demo-labels">{details.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i}
        onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{details[selected][1]}</p>
    </div>
  </div>;
}
