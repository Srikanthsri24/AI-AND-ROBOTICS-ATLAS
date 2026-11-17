import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, type Mesh } from 'three';
import { homeCommands, homeResponse, type HomeCommand } from '../data/bluetooth-home';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const parts = [
  ['Phone', 'Send one character through the Bluetooth UART connection. The display below shows the Uno’s reply.'],
  ['Bluefruit UART breakout', 'The board forwards received bytes to D2 and returns replies from D3. CTS and RTS coordinate when each side can send.'],
  ['Arduino Uno', 'The sketch maps each command to one or both LED outputs. Unknown characters leave both lamps unchanged.'],
  ['Room lamp', 'D6 supplies current through a 220 Ω resistor. The LED’s short lead returns to ground.'],
  ['Porch lamp', 'D7 controls its own LED, independently of the room lamp.'],
] as const;
const controlPath = new CatmullRomCurve3([
  new Vector3(-3.25,.6,1.28),new Vector3(-3.01,.88,.61),new Vector3(-2.18,.82,.50),
  new Vector3(-1.53,.26,.35),new Vector3(-1.71,.30,-.25),new Vector3(-2.32,.25,-.56),
]);
const tracePoints = controlPath.getPoints(32);

function Box({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.16} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal?.32:.68}/>
  </RoundedBox>;
}

function Lamp({at,on,porch,highlighted}:{at:Point;on:boolean;porch?:boolean;highlighted:boolean}) {
  return <group position={at}>
    <Box at={[0,.09,-.09]} size={[.22,.19,.11]} color="#4a514e" metal={.2}/>
    <mesh rotation={[Math.PI,0,0]} position={[0,-.025,.02]}>
      <cylinderGeometry args={[.139,.075,.14,28,1,true]}/>
      <meshStandardMaterial color={highlighted?'#d3ae69':porch?'#69604e':'#e2d7c0'} metalness={porch?.3:.05} side={2}/>
    </mesh>
    <mesh position={[0,-.082,.02]}>
      <sphereGeometry args={[.065,20,12]}/>
      <meshStandardMaterial color={on?'#ffe6a4':'#bcc3c7'} emissive="#ffcf68" emissiveIntensity={on?3.0:0}/>
    </mesh>
    {on&&<pointLight position={[0,-.18,.17]} color="#ffcc7c" intensity={5.4} distance={4.3} decay={2}/>}
  </group>;
}

function RadioPulse() {
  const pulse=useRef<Mesh>(null);
  const start=useRef(0);
  useFrame(({clock})=>{
    if(!pulse.current)return;
    if(!start.current)start.current=clock.elapsedTime;
    const elapsed=clock.elapsedTime-start.current;
    pulse.current.visible=elapsed<.95;
    controlPath.getPointAt(elapsed<.47?Math.min(1,elapsed/.47):Math.max(0,1-(elapsed-.47)/.48),pulse.current.position);
  });
  return <mesh ref={pulse}><sphereGeometry args={[.044,14,10]}/><meshBasicMaterial color="#a4e6ff"/></mesh>;
}

function Bench({connected,room,porch,signal,selected,select,labels}:{
  connected:boolean;room:boolean;porch:boolean;signal:number;selected:number;select:(index:number)=>void;labels:boolean;
}) {
  const anchors:Point[]=[[-3.22,.34,1.24],[-1.53,.25,.39],[-2.26,.22,-.51],[.30,1.21,-.94],[2.42,.93,-.12]];
  const tags:Point[]=[[-3.70,.73,1.46],[-1.17,.74,.53],[-2.69,.85,-1.0],[.09,1.70,-.99],[3.15,1.37,-.04]];
  return <>
    <color attach="background" args={['#263746']}/>
    <ambientLight intensity={.51}/>
    <directionalLight intensity={2.15} position={[-5,7,6]} color="#ffedd4"/>
    <directionalLight intensity={1.45} position={[4,5,-5]} color="#bcdfff"/>
    <Box at={[0,-.17,0]} size={[12,.31,8]} color="#3f505c"/>
    <Box at={[-2.49,.043,.28]} size={[2.64,.102,3.28]} color="#476361"/>
    <group position={[-3.18,.17,1.20]} rotation={[0,.14,-.09]}>
      <Box at={[0,0,0]} size={[.65,.13,1.06]} color={selected===0?'#44516a':'#293342'} metal={.16}/>
      <Box at={[0,.072,0]} size={[.57,.022,.95]} color={connected?'#245773':'#26354d'}/>
      <Box at={[0,.086,-.32]} size={[.39,.017,.035]} color={connected?'#89c9bd':'#647288'}/>
      {[-.14,.01,.15].map((z,i)=><Box key={z} at={[0,.087,z]} size={[i===1?.43:.33,.014,.07]} color={connected?'#619aaf':'#465a77'}/>)}
    </group>
    <Uno at={[-2.32,.14,-.58]} highlighted={selected===2}/>
    <group position={[-1.53,.13,.38]} rotation={[0,-.19,0]}>
      <Box at={[0,0,0]} size={[.50,.055,.71]} color={selected===1?'#326fa1':'#20558a'}/>
      <Box at={[0,.052,.12]} size={[.30,.059,.27]} color="#bdc4cc" metal={.58}/>
      <Box at={[0,.042,.289]} size={[.28,.036,.066]} color="#c8b57c"/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[-.18+i*.051,.04,-.281]} size={[.020,.024,.04]} color="#cbab64" metal={.43}/>)}
      <mesh position={[-.15,.059,.19]}><sphereGeometry args={[.031,14,9]}/><meshStandardMaterial color="#73b7d3" emissive="#4fc6ff" emissiveIntensity={connected?2:.1}/></mesh>
    </group>
    {['#d07968','#446e80','#6cbbb4','#dbc36f','#323940'].map((color,i)=><Line key={color}
      points={[[-2.34+i*.073,.306,-.34],[-2.13+i*.064,.342,-.12],[-1.85+i*.059,.28,.11],[-1.71+i*.049,.17,.112]]}
      color={color} lineWidth={1.5}/>)}
    {connected&&<Line points={tracePoints.slice(0,19)} color="#9fccec" lineWidth={1.8} dashed dashSize={.10} gapSize={.074} transparent opacity={.62}/>}
    {connected&&signal>0&&<RadioPulse key={signal}/>}
    <group>
      <Box at={[1.31,.065,.30]} size={[4.1,.11,3.07]} color="#8d826f"/>
      <Box at={[.22,.138,.14]} size={[1.95,.055,2.67]} color="#b59d7d"/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[-.56+i*.226,.17,.18]} size={[.012,.007,2.54]} color="#9e8569"/>)}
      <Box at={[.29,.82,-1.14]} size={[2.12,1.34,.12]} color="#cca991"/>
      <Box at={[-.80,.81,-.49]} size={[.12,1.32,1.31]} color="#bfa48c"/>
      <Box at={[1.30,.81,-.48]} size={[.13,1.34,1.28]} color="#c9a68a"/>
      <Box at={[-.37,1.00,-1.058]} size={[.59,.47,.038]} color="#4d7084"/>
      <Box at={[-.37,1.00,-1.03]} size={[.032,.50,.022]} color="#f0e1d0"/>
      <Box at={[-.37,1.00,-1.03]} size={[.61,.024,.022]} color="#f0e1d0"/>
      <Box at={[.38,.38,-.53]} size={[.73,.40,.47]} color="#6e8a84"/>
      <Box at={[.38,.59,-.71]} size={[.77,.31,.15]} color="#748f8a"/>
      <Box at={[2.31,.15,.42]} size={[1.85,.076,2.15]} color="#a19380"/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[2.31,.19,-.51+i*.257]} size={[1.78,.008,.012]} color="#80776a"/>)}
      <Box at={[2.45,.70,-.69]} size={[1.55,1.06,.14]} color="#9c8065"/>
      <Box at={[2.93,.70,-.59]} size={[.39,.98,.060]} color="#5f5651"/>
      <Box at={[2.00,.35,.89]} size={[.32,.29,.31]} color="#a27553"/>
      <mesh position={[2.00,.61,.88]}><sphereGeometry args={[.18,16,12]}/><meshStandardMaterial color="#5a7c55"/></mesh>
    </group>
    <Lamp at={[.36,1.27,-.93]} on={room} highlighted={selected===3}/>
    <Lamp at={[2.39,.92,-.45]} on={porch} porch highlighted={selected===4}/>
    {['#d19379','#9fabc2'].map((color,i)=><group key={color}>
      <Line points={[[-2.19+i*.082,.282,-.36],[-2.42-i*.079,.29,-.01],[-2.43,.214,.34+i*.13],[-2.35,.214,.34+i*.13]]}
        color={color} lineWidth={1.7}/>
      <Line points={[[-2.19,.214,.34+i*.13],[-2.10,.23,.34+i*.13],[-1.20,.15,.29+i*.10],
        [-.94,.14,-1.36+i*.08],[i===1?2.39:.36,.17,-1.36+i*.08],[i===1?2.39:.36,i===1?.88:1.21,i===1?-.52:-1.03]]}
        color={color} lineWidth={1.7}/>
    </group>)}
    <Line points={[[-2.52,.269,-.35],[-2.70,.21,-.05],[-1.01,.15,-1.43],[.47,.15,-1.42],[.47,1.19,-1.01]]}
      color="#293540" lineWidth={1.8}/>
    <Line points={[[.47,.15,-1.42],[2.48,.15,-1.42],[2.48,.84,-.52]]} color="#293540" lineWidth={1.8}/>
    <Box at={[-2.37,.132,.40]} size={[.69,.095,.48]} color="#d7d9cb"/>
    {Array.from({length:8},(_,i)=>[-.13,-.05,.05,.13].map(z=><mesh key={i+':'+z} position={[-2.64+i*.075,.181,.40+z]}>
      <boxGeometry args={[.022,.006,.022]}/><meshStandardMaterial color="#73807b"/>
    </mesh>))}
    {[[-2.27,.214,.34],[-2.27,.214,.47]].map((coords,i)=><mesh key={i} position={coords as Point} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.032,.032,.16,14]}/><meshStandardMaterial color="#c8a47d"/>
    </mesh>)}
    <ContactShadows position={[0,.003,0]} scale={11} opacity={.47} blur={2.7}/>
    {labels&&tags.map((tag,i)=><group key={i}><Line points={[anchors[i],tag]} color={selected===i?'#ffe7a0':'#c1d3db'} lineWidth={1.3}/>
      <WorldLabel position={tag} className="gp-marker-anchor"><button type="button" aria-label={parts[i][0]} aria-pressed={selected===i} className="gp-marker" onClick={()=>select(i)}>{i+1}</button></WorldLabel>
    </group>)}
  </>;
}

export default function BluetoothHomeDemo() {
  const [connected,setConnected]=useState(false);
  const [room,setRoom]=useState(false);
  const [porch,setPorch]=useState(false);
  const [reply,setReply]=useState('—');
  const [signal,setSignal]=useState(0);
  const [selected,select]=useState(0);
  const [labels,setLabels]=useState(true);
  const [notice,setNotice]=useState('Connect the simulated phone to send a command.');
  function send(command:HomeCommand){
    if(!connected)return;
    const result=homeResponse(command,room,porch);
    setRoom(result.room);setPorch(result.porch);
    setSignal(value=>value+1);
    setReply(result.reply);
    setNotice(command==='X'?'Unknown command. Both lamps kept their previous states.':`Sent ${command}. Arduino replied ${result.reply}.`);
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Bluetooth smart home model">
        <Canvas camera={{position:[.08,5.9,8.45],fov:42}} dpr={[1,1.6]} fallback={<p>Use the command controls and lamp readings below.</p>}>
          <Bench connected={connected} room={room} porch={porch} signal={signal} selected={selected} select={select} labels={labels}/>
          <OrbitControls target={[-.01,.41,.11]} minDistance={5.2} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Bluetooth home readings">
        <div><span>Room lamp</span><strong>{room?'On':'Off'}</strong></div>
        <div><span>Porch lamp</span><strong>{porch?'On':'Off'}</strong></div>
        <div><span>Phone reply</span><strong>{reply}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Drive two lamps from the phone</h3>
      <p>Connect the simulated phone and send one command. Compare the returned room and porch flags with the two lights.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{
          setConnected(!connected);setSignal(0);
          setNotice(connected?'Disconnected. The Uno retains both lamp states.':'Phone connected. Send a command to the Uno.');
        }}>{connected?'Disconnect phone':'Connect phone'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <div className="gp-steps" aria-label="UART commands" role="group">{homeCommands.map(([key,label])=><button type="button" key={key}
        disabled={!connected} onClick={()=>send(key)}><code>{key}</code> {label}</button>)}</div>
      <p className="gp-demo-description" role="status">{notice}</p>
      <ol className="gp-demo-labels">{parts.map(([name],index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===index}
        onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
