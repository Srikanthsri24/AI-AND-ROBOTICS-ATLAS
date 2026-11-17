import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { entryReading, mineAlarm, mineRules, mineScenarios } from '../data/mine-safety';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Alarm=ReturnType<typeof mineAlarm>;
const colors:Record<Alarm,string>={Normal:'#56e3aa',Alarm:'#ff5b52','Sensor fault':'#fac663'};
function Block({at,size,color}:{at:Point;size:Point;color:string}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.17} smoothness={2}>
    <meshStandardMaterial color={color} roughness={.72}/>
  </RoundedBox>;
}

export function MineStation({warning=false}:{warning?:boolean}) {
  return <>
    <Block at={[0,.02,0]} size={[.16,.14,.56]} color="#6e7c81"/>
    <Block at={[-.08,.42,0]} size={[.12,.84,.10]} color="#566b72"/>
    <Block at={[.035,.69,0]} size={[.29,.27,.19]} color="#dc9e44"/>
    <Block at={[.06,.68,.101]} size={[.19,.113,.021]} color="#283b47"/>
    <mesh position={[.092,.77,.122]}><sphereGeometry args={[.032,18,12]}/>
      <meshStandardMaterial color={warning?'#ff6659':'#8cffc5'} emissive={warning?'#c63025':'#32945e'} emissiveIntensity={1.15}/></mesh>
  </>;
}

export function MineBeacon({state='Normal'}:{state?:Alarm}) {
  return <>
    <Block at={[0,.058,0]} size={[.36,.12,.36]} color="#333d44"/>
    <mesh position={[0,.296,0]}>
      <cylinderGeometry args={[.13,.16,.365,32]}/>
      <meshStandardMaterial color={colors[state]} emissive={colors[state]} emissiveIntensity={1.65} roughness={.35}/>
    </mesh>
    <Block at={[0,.486,0]} size={[.29,.072,.29]} color="#303943"/>
    {[-.13,.13].flatMap(x=>[-.13,.13].map(z=><Block key={`${x}:${z}`} at={[x,.294,z]} size={[.021,.38,.021]} color="#4f6164"/>))}
  </>;
}

export function MineDashboardModel() {
  return <>
    <Block at={[0,.34,0]} size={[.73,.48,.07]} color="#303e49"/>
    <Block at={[0,.35,.044]} size={[.61,.36,.018]} color="#497976"/>
    <Block at={[0,.08,.054]} size={[.79,.071,.40]} color="#2e3d49"/>
    {[0,1,2].map(i=><Block key={i} at={[-.12,.25+i*.09,.056]} size={[.29,.026,.011]} color={i===2?'#fcaa5d':'#9be4c1'}/>)}
  </>;
}

function Tunnel({state,faceAlarm,link}:{state:Alarm;faceAlarm:Alarm;link:boolean}) {
  return <>
    <Block at={[0,-.14,0]} size={[7.4,.25,3.26]} color="#41474a"/>
    <Block at={[0,.012,-.08]} size={[6.82,.073,1.51]} color="#6f6459"/>
    <Block at={[0,.66,-1.0]} size={[6.98,1.29,.38]} color="#5d5957"/>
    {Array.from({length:13},(_,i)=><Block key={i} at={[-3.24+i*.54,.60+(i%3)*.13,-.76]}
      size={[.50,.75+(i%4)*.11,.20]} color={['#625b55','#615f62','#746a61'][i%3]}/>)}
    {[-2.85,-1.5,-.1,1.28,2.68].map(x=><group key={x}>
      <Block at={[x,.72,.64]} size={[.113,1.43,.117]} color="#4e5b60"/>
      <Block at={[x,.72,-.67]} size={[.112,1.43,.11]} color="#4e5b60"/>
      <Block at={[x,1.45,-.035]} size={[.13,.14,1.45]} color="#667177"/>
    </group>)}
    <mesh position={[0,1.29,-.49]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.105,.105,6.25,24]}/>
      <meshStandardMaterial color="#8b8273" metalness={.31} roughness={.52}/>
    </mesh>
    <Block at={[-1.98,.053,.21]} size={[1.18,.038,.59]} color="#777d71"/>
    <Block at={[1.83,.053,.19]} size={[1.25,.038,.58]} color="#756d5f"/>
    <group position={[-2.12,.068,.17]}><MineStation/></group>
    <group position={[1.78,.067,.16]}><MineStation warning={faceAlarm!=='Normal'}/></group>
    <group position={[2.65,1.54,-.18]} scale={.66}><MineBeacon state={state}/></group>
    <Block at={[-2.65,.09,1.10]} size={[1.16,.16,.47]} color="#29424d"/>
    <group position={[-2.72,.16,1.10]} scale={.74}><MineDashboardModel/></group>
    {link&&<Line points={[[1.68,.98,.16],[.22,1.29,.23],[-1.91,1.20,.23],[-2.73,.62,1.10]]}
      color="#8ddbd7" lineWidth={1.6} dashed dashSize={.12} gapSize={.065}/>}
    <WorldLabel position={[-2.12,1.07,.22]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Entry station</span></WorldLabel>
    <WorldLabel position={[1.78,1.07,.23]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Working face</span></WorldLabel>
    <WorldLabel position={[2.65,2.14,-.18]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label" style={{color:colors[state]}}>{state}</span>
    </WorldLabel>
    <ContactShadows position={[0,-.014,0]} scale={8} opacity={.37} blur={2.4} far={4}/>
  </>;
}

export default function MineSafetyDemo() {
  const [choice,setChoice]=useState(0);
  const [connected,setConnected]=useState(true);
  const [stale,setStale]=useState(false);
  const [last,setLast]=useState<Alarm>('Normal');
  const face=mineScenarios[choice];
  const local=mineAlarm([entryReading,face]);
  useEffect(()=>{
    if(connected) return;
    const timeout=window.setTimeout(()=>setStale(true),mineRules.staleMs);
    return ()=>window.clearTimeout(timeout);
  },[connected]);
  function toggleLink() {
    if(connected) setLast(local);
    setStale(false);
    setConnected(!connected);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive mine monitoring simulation">
        <Canvas dpr={[1,1.5]} camera={{position:[3.0,3.8,7.55],fov:44}} fallback={<p>The synthetic readings and alarm controls are available without the 3D tunnel.</p>}>
          <color attach="background" args={['#253745']}/>
          <ambientLight intensity={1.19}/>
          <directionalLight position={[-2,5,4]} intensity={2.35}/>
          <Tunnel state={local} faceAlarm={mineAlarm([face])} link={connected}/>
          <OrbitControls target={[0,.80,0]} enablePan={false} minDistance={4} maxDistance={15}/>
        </Canvas>
      </div>
      <div className="gp-table"><table>
        <caption>Current synthetic readings · 0–100 training indices</caption>
        <thead><tr><th>Station</th><th>Gas index</th><th>Ventilation index</th></tr></thead>
        <tbody><tr><td>Entry</td><td>{entryReading.gas}</td><td>{entryReading.ventilation}</td></tr>
        <tr><td>Working face</td><td>{face.gas??'Missing'}</td><td>{face.ventilation??'Missing'}</td></tr></tbody>
      </table></div>
    </div>
    <div className="gp-guide">
      <h3>Test the alarm rules</h3>
      <p>The fictional gas index triggers at 70 or above. Ventilation triggers at 30 or below. Change the working-face readings and compare the beacon with the remote console.</p>
      <div className="gp-steps" role="group" aria-label="Working-face scenarios">
        {mineScenarios.map(({name},index)=><button type="button" key={name} aria-pressed={index===choice} onClick={()=>setChoice(index)}>{name}</button>)}
      </div>
      <p className="gp-check" role="status">Local beacon · {local}</p>
      <section className="gp-program-card" aria-label="Remote mine dashboard">
        <h4>Remote console</h4>
        <p><strong>{connected?'Live telemetry':stale?'Stale · no recent packet':'Waiting for a packet'}</strong> · {connected?local:`Last received: ${last}`}</p>
        <button className="gp-button gp-secondary" type="button" aria-pressed={connected} onClick={toggleLink}>{connected?'Disconnect network':'Restore network'}</button>
      </section>
      <p>Try disconnecting at Baseline, then selecting Low ventilation. The local beacon should change immediately, and the remote console should mark its old result stale after three seconds.</p>
    </div>
  </div>;
}
