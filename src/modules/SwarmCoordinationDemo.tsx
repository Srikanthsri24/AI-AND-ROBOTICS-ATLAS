import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, type Group, type Mesh } from 'three';
import { swarmGapMs, swarmHeartbeatMs, swarmTimeoutMs, swarmTurnMs } from '../data/swarm-coordination';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { MegaBoard } from './GpsGsmParts';
import { Drv8833Part } from './TrolleyParts';

type Phase = 'ready' | 'a' | 'handoff' | 'b' | 'done' | 'fault';
type Anchor = [number, number, number];
const patchLeads = [
  {name:'Command · A TX → B RX', color:'#e29a52', offset:-.08},
  {name:'Reply · B TX → A RX', color:'#6dbac9', offset:0},
  {name:'Shared ground', color:'#222d36', offset:.08},
];
function leadPoints(offset: number): Anchor[] {
  return [[-1.22,.54,-.53+offset],[-.81,.28,-.68+offset],[0,.18,-.49+offset],[.81,.28,-.68+offset],[1.22,.54,-.53+offset]];
}
const packetPaths = patchLeads.slice(0,2).map(({offset})=>
  new CatmullRomCurve3(leadPoints(offset).map(point=>new Vector3(...point))));
function PacketMotion({reply=false}:{reply?:boolean}) {
  const packet = useRef<Mesh>(null);
  useFrame(({clock})=>{
    if (!packet.current) return;
    const progress = (clock.elapsedTime*.95+(reply ? .63 : 0))%1;
    packetPaths[Number(reply)].getPointAt(reply?1-progress:progress,packet.current.position);
  });
  return <mesh ref={packet}>
    <sphereGeometry args={[.037,16,12]}/>
    <meshStandardMaterial color={reply?'#c9f8ff':'#fff1bb'} emissive={reply?'#55cce9':'#ffc468'} emissiveIntensity={1.4}/>
  </mesh>;
}
const parts = [
  {name:'Robot A controller', at:[-1.57,.91,-.38], detail:'A gives one robot permission to move at a time. It stops the trial when B stops acknowledging its commands.'},
  {name:'UART patch leads', at:[0,.55,-.36], detail:'The two crossed signal leads carry commands and acknowledgments. The third lead supplies the shared ground reference.'},
  {name:'Robot B motor driver', at:[1.44,.82,.19], detail:'B enables its DRV8833 only with a fresh drive command. If the commands stop arriving, B’s timer switches the driver off.'},
  {name:'Robot A raised wheel', at:[-2.42,.95,.58], detail:'Watch this wheel turn during the first slot and stop during the handoff. The bench rig stays stationary.'},
  {name:'Robot B raised wheel', at:[2.42,.95,.58], detail:'This wheel turns in the second slot. The motor stops if the active command expires.'},
  {name:'Switched AA motor packs', at:[1.59,.62,1.1], detail:'Each three-cell pack powers only its local motor driver. The motor switches let you turn off both drive rails during wiring and upload.'},
] satisfies Array<{name:string; at:Anchor; detail:string}>;

const phaseNames: Record<Phase,string> = {
  ready:'Ready for a trial', a:'Robot A drives', handoff:'Both stopped · Passing token',
  b:'Robot B drives', done:'Trial complete · Both stopped', fault:'Link lost · Both stopped',
};

function Rig({x, drive, second, selected, select}:{x:number;drive:boolean;second:boolean;selected:number;select:(i:number)=>void}) {
  const wheel = useRef<Group>(null);
  const direction = second ? 1 : -1;
  const color = second ? '#a5623d' : '#28798e';
  const wheelIndex = second ? 4 : 3;
  useFrame((_,delta)=>{ if (drive && wheel.current) wheel.current.rotation.x += direction * delta * 14; });
  return <group position={[x,0,0]}>
    <Box at={[0,.08,0]} size={[1.65,.16,1.5]} color="#7b858a" metal={.45}/>
    {[-.46,.46].map(offset=><Box key={offset} at={[offset,.24,0]} size={[.19,.26,1.14]} color="#625b53"/>)}
    <Box at={[0,.40,0]} size={[1.48,.10,1.31]} color={color} metal={.46}/>
    {[-.64,.64].flatMap(a=>[-.54,.54].map(b=><mesh key={a+':'+b} position={[a,.465,b]}>
      <cylinderGeometry args={[.044,.044,.028,12]}/><meshStandardMaterial color="#c1c2ba" metalness={.78} roughness={.24}/>
    </mesh>))}
    <group position={[0,.48,-.32]} onClick={second ? undefined : ()=>select(0)}>
      <group rotation={[0,second ? Math.PI : 0,0]} scale={.77}><MegaBoard selected={!second&&selected===0}/></group>
      <mesh position={[-.29,.059,.05]}><sphereGeometry args={[.027,12,8]}/><meshStandardMaterial color={drive?'#82e6b0':'#48635b'} emissive="#7ef0ad" emissiveIntensity={drive?1.4:0}/></mesh>
    </group>
    <group position={[-direction*.14,.54,.18]} scale={.55} onClick={second ? ()=>select(2) : undefined}><Drv8833Part/></group>
    {second&&selected===2&&<Box at={[-direction*.14,.46,.18]} size={[.64,.025,.39]} color="#f4b951"/>}
    <Box at={[direction*.39,.53,.40]} size={[.47,.24,.31]} color="#cd9b40"/>
    <Box at={[direction*.49,.54,.39]} size={[.15,.16,.23]} color="#abb2b5" metal={.74}/>
    <group position={[-direction*.11,.175,.92]} onClick={()=>select(5)}>
      <Box at={[0,0,0]} size={[.79,.20,.42]} color={selected===5?'#d5a45b':'#2c3033'}/>
      {[-.124,0,.124].map(z=><group key={z} position={[0,.098,z]}>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.054,.054,.54,18]}/><meshStandardMaterial color="#374a60" metalness={.35} roughness={.37}/></mesh>
        <mesh position={[.207,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.055,.055,.10,16]}/><meshStandardMaterial color="#b5804b" metalness={.67} roughness={.32}/></mesh>
      </group>)}
      <Box at={[.347,.115,0]} size={[.10,.05,.12]} color="#373d42"/>
    </group>
    <Line points={[[-direction*.10,.29,.94],[-direction*.21,.31,.67],[-direction*.36,.52,.47],[-direction*.19,.59,.21]]} color="#bb554b" lineWidth={2.5}/>
    <Line points={[[-direction*.04,.29,.97],[-direction*.11,.29,.67],[-direction*.30,.49,.47],[-direction*.14,.57,.25]]} color="#30363d" lineWidth={2.5}/>

    <Line points={[[0,.55,-.15],[-direction*.26,.56,.13],[direction*.21,.56,.34]]} color={drive?'#f69058':'#9b5141'} lineWidth={3}/>
    <group position={[direction*.77,.40,.40]} onClick={()=>select(wheelIndex)}>
      <group ref={wheel}>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.28,.28,.17,36]}/><meshStandardMaterial color="#22282d" roughness={.88}/></mesh>
        <mesh position={[direction*.099,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.175,.175,.035,24]}/><meshStandardMaterial color={selected===wheelIndex?'#f7c572':'#a5a8a2'} roughness={.34} metalness={.7}/></mesh>
        {Array.from({length:8},(_,i)=><group key={i} rotation={[i*Math.PI/4,0,0]}>
          <Box at={[direction*.118,.11,0]} size={[.02,.069,.035]} color="#465057"/>
          <Box at={[0,.272,0]} size={[.158,.025,.046]} color="#292d30"/>
        </group>)}
      </group>
    </group>
  </group>;
}

export default function SwarmCoordinationDemo() {
  const [phase,setPhase] = useState<Phase>('ready');
  const [connected,setConnected] = useState(true);
  const [selected,select] = useState(0);
  const timers = useRef<number[]>([]);
  const active = phase==='a'||phase==='handoff'||phase==='b';
  function clearTimers() { timers.current.forEach(timer=>window.clearTimeout(timer)); timers.current=[]; }
  useEffect(()=>()=>{timers.current.forEach(timer=>window.clearTimeout(timer));},[]);
  function schedule(delay:number, next:Phase) { timers.current.push(window.setTimeout(()=>setPhase(next),delay)); }
  function run() {
    clearTimers();
    setPhase('a');
    schedule(swarmTurnMs,'handoff');
    schedule(swarmTurnMs+swarmGapMs,'b');
    schedule(swarmTurnMs*2+swarmGapMs,'done');
  }
  function toggleLink() {
    if (connected&&active) {
      clearTimers();
      schedule(swarmTimeoutMs,'fault');
    }
    if (!active) setPhase(connected ? 'fault' : 'ready');
    setConnected(!connected);
  }
  function stop() { clearTimers(); setPhase(connected?'ready':'fault'); }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D two-robot coordination bench">
        <Canvas camera={{position:[.8,4.8,5.7],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the robot and link readings below.</p>}>
          <color attach="background" args={['#253847']}/>
          <hemisphereLight args={['#edf7ff','#624e3c',2.3]}/>
          <directionalLight position={[-4,6,5]} intensity={2.7}/>
          <Box at={[0,-.12,0]} size={[5.85,.22,3.4]} color="#697b84"/>
          <Rig x={-1.48} drive={phase==='a'} second={false} {...{selected,select}}/>
          <Rig x={1.48} drive={phase==='b'} second {...{selected,select}}/>
          <Box at={[0,.079,-.49]} size={[.62,.15,.32]} color={selected===1?'#d5a45b':'#485561'}/>
          {patchLeads.map(({name,offset,color},index)=>{
            const points=leadPoints(offset);
            const open=!connected&&index===0;
            return <group key={name} onClick={()=>select(1)}>
              <Line points={[...points.slice(0,2),open?[-.26,.18,-.49+offset]:points[2]]} color={color} lineWidth={3}/>
              <Line points={[open?[.25,.18,-.49+offset]:points[2],...points.slice(3)]} color={color} lineWidth={3}/>
            </group>;
          })}
          {connected&&<><PacketMotion/><PacketMotion reply/></>}
          <group position={[0,.16,-.49]} onClick={()=>select(1)}>
            <mesh><sphereGeometry args={[.047,14,10]}/><meshStandardMaterial color={connected?'#74d6ac':'#d77057'} emissive={connected?'#397c66':'#b14026'} emissiveIntensity={.8}/></mesh>
          </group>
          {parts.map(({name,at},index)=><WorldLabel key={name} position={at} className="gp-marker-anchor">
            <button className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>
              {index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}
            </button>
          </WorldLabel>)}
          <ContactShadows position={[0,.002,0]} opacity={.4} scale={5.8} far={1.1} resolution={128} frames={1}/>
          <OrbitControls enablePan={false} minDistance={4} maxDistance={9} maxPolarAngle={1.38}/>
        </Canvas>
      </div>
      <ul className="gp-demo-wire-key" aria-label="UART wire colors">
        {patchLeads.map(({name,color})=><li key={name}><span style={{backgroundColor:color}} aria-hidden="true"/>{name}</li>)}
      </ul>
      <div className="gp-demo-result" aria-label="Robot coordination readings">
        <div><span>Robot A</span><strong>{phase==='a'?'Driving':'Stopped'}</strong></div>
        <div><span>Robot B</span><strong>{phase==='b'?'Driving':'Stopped'}</strong></div>
        <div><span>UART link</span><strong>{connected?`Heartbeat every ${swarmHeartbeatMs} ms`:'Signal wire open'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Give two robots a turn</h3>
      <p>Start a trial and watch the wheels. Open the orange signal lead during Robot B’s turn to see what happens when its drive command expires. The moving dots show the message directions at a slowed-down pace.</p>
      <p role="status">{phaseNames[phase]}</p>
      <div className="gp-steps">
        <button className="gp-button" disabled={active||!connected} onClick={run}>Run trial</button>
        <button className="gp-button gp-secondary" disabled={active&&!connected} onClick={toggleLink}>{connected?'Open signal lead':'Reconnect lead'}</button>
        <button className="gp-button gp-secondary" disabled={!active} onClick={stop}>Stop trial</button>
      </div>
      <ol className="gp-demo-labels">{parts.map(({name},index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <div className="gp-check"><div><strong>{parts[selected].name}</strong><p>{parts[selected].detail}</p></div></div>
      <p>Each rig must be able to stop on its own. The same pattern helps coordinate devices sharing a conveyor, track, or work zone.</p>
    </div>
  </div>;
}
