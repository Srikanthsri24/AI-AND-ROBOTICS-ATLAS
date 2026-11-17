import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { porchOffAt, porchOnAt } from '../data/esp32-smart-home';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Esp32Board } from './ProjectDemo';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
const labels: {name:string; at:Point; detail:string}[] = [
  {name:'ESP32 access point', at:[-1.4,.57,1.12], detail:'The board hosts the page on its own Wi-Fi network. The room and porch commands go from the browser to the ESP32.'},
  {name:'Room LED · GPIO25', at:[-.78,1.67,-.88], detail:'The GPIO25 output sends current through this lamp’s 220 Ω resistor. It follows the room switch in both porch modes.'},
  {name:'Porch LED · GPIO26', at:[.88,1.53,-.76], detail:'GPIO26 switches the porch lamp. In Auto, the firmware decides when to turn it on by checking the divider voltage.'},
  {name:'Photoresistor · GPIO34', at:[1.57,.69,.83], detail:'The photoresistor and 10 kΩ resistor form the divider. GPIO34 measures its midpoint. Darkness lowers the reading.'},
];

function Lamp({x,y,z,on,selected,select}:{x:number;y:number;z:number;on:boolean;selected:boolean;select:()=>void}) {
  return <group position={[x,y,z]} onClick={select}>
    <Box at={[0,.027,-.04]} size={[.28,.17,.12]} color={selected?'#f5b962':'#48525a'} metal={.55}/>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,0,.08]}>
      <cylinderGeometry args={[.105,.073,.18,24]}/>
      <meshStandardMaterial color="#454a4c" roughness={.43} metalness={.58}/>
    </mesh>
    <mesh position={[0,-.037,.147]}>
      <sphereGeometry args={[.060,20,14]}/>
      <meshStandardMaterial color={on?'#fff1c0':'#a7a9a5'} emissive="#ffd37f" emissiveIntensity={on?2.8:0}/>
    </mesh>
    {on&&<pointLight color="#ffbd68" intensity={4.6} distance={2.4} decay={2}/>}
  </group>;
}

function House({light,room,porch,connected,selected,select}:{light:number;room:boolean;porch:boolean;connected:boolean;selected:number;select:(n:number)=>void}) {
  return <>
    <color attach="background" args={[light<porchOnAt?'#152734':'#344b58']}/>
    <hemisphereLight args={['#e4f6ff','#847055',light < porchOnAt ? .95 : 2.35]}/>
    <directionalLight position={[-3,5,4]} intensity={light<porchOnAt?1:2.6}/>
    <RoundedBox args={[5.1,.22,3.4]} radius={.065} position={[0,-.13,0]}>
      <meshStandardMaterial color="#7e8c83" roughness={.68}/>
    </RoundedBox>
    <Box at={[0,.09,-.48]} size={[3.54,.22,1.87]} color="#aba396"/>
    <Box at={[-.63,.22,-.52]} size={[2.16,.08,1.68]} color="#a78160"/>
    {Array.from({length:13},(_,i)=><Box key={i} at={[-1.64+i*.161,.266,-.49]} size={[.008,.003,1.60]} color="#674b3a"/>)}
    <Box at={[1.075,.224,-.49]} size={[1.22,.08,1.77]} color="#9ba0a0"/>
    {[-.92,-.54,-.16,.21].map(z=><Box key={z} at={[1.07,.266,z]} size={[1.19,.004,.012]} color="#606c72"/>)}
    <Box at={[-.04,.91,-1.37]} size={[3.5,1.48,.12]} color="#dfc5a3"/>
    {Array.from({length:11},(_,i)=><Box key={i} at={[.02,.36+i*.113,-1.304]} size={[3.38,.008,.006]} color="#af9a83"/>)}
    <Box at={[-1.68,.96,-.63]} size={[.12,1.43,1.51]} color="#cbb79b"/>
    <Box at={[.40,.93,-.50]} size={[.11,1.39,1.55]} color="#d9c2a5"/>
    <Box at={[-.63,1.78,-.82]} size={[2.38,.13,1.24]} color="#536770" metal={.12}/>
    <Box at={[1.095,1.63,-.65]} size={[1.36,.10,1.48]} color="#586b71" metal={.16}/>
    <Box at={[1.72,.95,.02]} size={[.08,1.43,.09]} color="#d1b89a"/>
    <Box at={[-.62,.91,-1.291]} size={[.59,.47,.04]} color="#634d3e"/>
    <Box at={[-.62,.91,-1.266]} size={[.48,.36,.019]} color="#6c8ea0" metal={.31}/>
    <Box at={[-.62,.91,-1.251]} size={[.034,.36,.021]} color="#d7baa1"/>
    <Box at={[-.62,.91,-1.250]} size={[.48,.034,.021]} color="#d7baa1"/>
    <Box at={[-1.24,.51,-.52]} size={[.49,.36,.72]} color="#527270"/>
    <Box at={[-1.12,.694,-.47]} size={[.33,.072,.53]} color="#6a8782"/>
    <Box at={[-.46,.42,-.26]} size={[.47,.06,.44]} color="#755f4c"/>
    {[-.62,-.31].map(x=><Box key={x} at={[x,.333,-.26]} size={[.049,.16,.29]} color="#594f45"/>)}
    <Box at={[1.07,.123,.63]} size={[1.06,.13,.37]} color="#a4a5a1"/>
    <Box at={[1.04,.047,.99]} size={[.91,.09,.28]} color="#8c9792"/>
    <Lamp x={-.83} y={1.42} z={-1.265} on={room} selected={selected===1} select={()=>select(1)}/>
    <Lamp x={.92} y={1.41} z={-1.263} on={porch} selected={selected===2} select={()=>select(2)}/>
    <group position={[-1.31,.115,1.02]} onClick={()=>select(0)}>
      <Box at={[0,-.075,0]} size={[1.29,.11,.75]} color={selected===0?'#e6ba76':'#c2c7c3'}/>
      {[-.51,.51].flatMap(x=>Array.from({length:10},(_,i)=><Box key={x+':'+i} at={[x,-.014,(i-4.5)*.059]} size={[.05,.007,.026]} color="#777771"/>))}
      <group rotation={[0,Math.PI/2,0]}><Esp32Board receiving={connected}/></group>
    </group>
    <Line points={[[-1.75,.161,1.02],[-1.96,.12,1.15],[-2.26,.09,1.12],[-2.42,.05,.92]]} color="#222a30" lineWidth={4}/>
    <Line points={[[-1.10,.16,.90],[-1,.19,.63],[-1.50,.32,.40],[-1.60,.54,-1.24],[-.83,1.40,-1.22]]} color="#bf624d" lineWidth={2.8}/>
    <Line points={[[-1.02,.16,1.11],[-.83,.16,.82],[.18,.11,.60],[.56,.33,.14],[.56,1.17,-1.19],[.92,1.40,-1.22]]} color="#c69a56" lineWidth={2.8}/>
    <Line points={[[-.88,.15,1.04],[-.63,.09,1.12],[.83,.10,1.27],[1.56,.35,.85]]} color="#42919b" lineWidth={3}/>
    <group position={[1.56,.38,.85]} onClick={()=>select(3)}>
      <Box at={[0,-.15,0]} size={[.26,.28,.25]} color="#536067"/>
      <mesh><cylinderGeometry args={[.079,.079,.036,18]}/><meshStandardMaterial color={selected===3?'#e3ac66':'#c9ac7c'}/></mesh>
      <Line points={[[-.049,.022,-.031],[.045,.022,-.031],[.045,.022,-.012],[-.041,.022,-.012],[-.041,.022,.012],[.046,.022,.012],[.046,.022,.033],[-.049,.022,.033]]} color="#773d2d" lineWidth={1.5}/>
    </group>
    {labels.map(({name,at},index)=><WorldLabel key={name} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>
        {index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.008,0]} opacity={.35} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function Esp32SmartHomeDemo() {
  const [light,setLight] = useState(2650);
  const [room,setRoom] = useState(false);
  const [porch,setPorch] = useState(false);
  const [automatic,setAutomatic] = useState(false);
  const [connected,setConnected] = useState(true);
  const [selected,select] = useState(0);
  const [message,setMessage] = useState('Connected to the model home.');
  function readLight(value:number) {
    setLight(value);
    if (automatic) setPorch(previous=>value<=porchOnAt || value<porchOffAt&&previous);
  }
  function setPorchMode(mode:'on'|'off'|'auto') {
    setAutomatic(mode==='auto');
    setPorch(previous=>mode==='on' || mode==='auto' && (light<=porchOnAt || light<porchOffAt&&previous));
    setMessage(mode==='auto'?'ESP32 is controlling the porch from the sensor.':'Manual porch command applied.');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D ESP32 smart home model">
        <Canvas camera={{position:[3.2,4.25,6.4],fov:39}} dpr={[1,1.6]} fallback={<p>Follow the room, porch and sensor readings below.</p>}>
          <House {...{light,room,porch,connected,selected,select}}/>
          <OrbitControls target={[0,.52,-.14]} enablePan={false} minDistance={4.2} maxDistance={10} maxPolarAngle={1.48}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Live model home readings">
        <div><span>Room light</span><strong>{room?'On':'Off'}</strong></div>
        <div><span>Light sensor</span><strong>{light} / 4095</strong></div>
        <div><span>Porch · {automatic?'Auto':'Manual'}</span><strong>{porch?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Model home dashboard</h3>
      <p>Switch the room light, then put the porch in Auto. Disconnect the dashboard and try changing the light again.</p>
      <div className="gp-steps">
        <button type="button" onClick={()=>{setRoom(!room);setMessage('Room command applied.');}} disabled={!connected}>{room?'Turn room off':'Turn room on'}</button>
        <button type="button" onClick={()=>{setConnected(!connected);setMessage(connected?'Dashboard disconnected. The ESP32 keeps running.':'Reconnected. The dashboard reads the current state.');}}>{connected?'Disconnect dashboard':'Reconnect dashboard'}</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Porch mode">
        <button type="button" disabled={!connected} aria-pressed={!automatic&&porch} onClick={()=>setPorchMode('on')}>Manual on</button>
        <button type="button" disabled={!connected} aria-pressed={!automatic&&!porch} onClick={()=>setPorchMode('off')}>Manual off</button>
        <button type="button" disabled={!connected} aria-pressed={automatic} onClick={()=>setPorchMode('auto')}>Auto night light</button>
      </div>
      <label className="gp-home-light">
        Outside light <output>{light}</output>
        <input type="range" min={0} max={4095} step={1} value={light} onChange={event=>readLight(event.target.valueAsNumber)}/>
      </label>
      <div className="gp-steps">
        <button type="button" onClick={()=>readLight(500)}>Cover sensor</button>
        <button type="button" onClick={()=>readLight(1400)}>Twilight</button>
        <button type="button" onClick={()=>readLight(2650)}>Daylight</button>
      </div>
      <p role="status">{message}</p>
      <p>In Auto, the porch switches on at {porchOnAt} and off at {porchOffAt}. Between those values it holds its last state so a small light change does not make it flicker.</p>
      <ol className="gp-demo-labels">{labels.map(({name},index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={index===selected} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
