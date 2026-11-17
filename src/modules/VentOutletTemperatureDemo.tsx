import {useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Vent outlet probe · A0',at:[.80,1.03,.72],detail:'This TMP36 samples air at the grille without touching it.'},
  {name:'Room probe · A1',at:[-1.42,.61,.54],detail:'This probe measures room air outside the main stream and provides the comparison value.'},
  {name:'Model vent grille',at:[1.64,1.54,.32],detail:'The moving lines visualize the outlet stream. The Arduino measures temperature at the two probes.'},
  {name:'Warm-outlet flag · D8',at:[-.43,.47,1.01],detail:'The flag requires 30 °C or above at the outlet and at least 4 °C difference. It clears at an outlet of 28 °C or a difference of 2 °C.'},
];
function Vent({warm,selected,select,outlet,room}:{warm:boolean;selected:number;select:(i:number)=>void;outlet:number;room:number}){
  const air=useRef<Group>(null);
  useFrame(({clock})=>{if(air.current)air.current.position.z=(clock.elapsedTime*.38)% .31;});
  const flow=outlet-room>=4?'#ecc18e':'#a0c6d2';
  return <>
    <color attach="background" args={['#354c60']}/><hemisphereLight args={['#e6f2ff','#746b62',2.1]}/><directionalLight position={[-3,6,4]} intensity={2.2} color="#fff0d7"/>
    <Box at={[0,-.09,0]} size={[4.8,.18,3]} color="#697e8b"/>
    <Box at={[.94,.20,-.51]} size={[2.30,.38,1.57]} color="#64757d"/>
    <group onClick={()=>select(2)}>
      <Box at={[.95,1.02,-.56]} size={[2.05,.20,1.46]} color={selected===2?'#c39365':'#8195a0'}/>
      <Box at={[.95,.46,-.56]} size={[2.05,.15,1.46]} color="#7f929a"/>
      {[0,1.90].map(x=><Box key={x} at={[x,.75,-.56]} size={[.14,.62,1.43]} color="#748696"/>)}
      <Box at={[.94,.77,-1.25]} size={[1.76,.52,.12]} color="#3d4d5c"/>
      <Box at={[.95,.75,.19]} size={[1.84,.56,.05]} color="#354653"/>
      {[.56,.65,.74,.83,.92].map(y=><Box key={y} at={[.96,y,.231]} size={[1.81,.038,.11]} color="#a6b4b9" metal={.48}/>)}
      <Box at={[.95,1.14,-.77]} size={[1.87,.079,1.14]} color="#9eaaae" metal={.36}/>
    </group>
    <group ref={air}>{[.38,.68,1.08,1.47].map((x,i)=><Line key={x} points={[[x,.79,.25],[x+.02,.76,.46+i*.05],[x+.04,.71,.69+i*.05]]} color={flow} opacity={.48} transparent lineWidth={1.8}/>)}</group>
    {[{x:.73,z:.68,y:.67},{x:-1.42,z:.53,y:.43}].map(({x,y,z},i)=><group key={x} onClick={()=>select(i)}>
      <Box at={[x,.102,z]} size={[.32,.13,.31]} color="#929e99"/>
      <Box at={[x,(y+.11)/2,z]} size={[.065,y-.11,.067]} color="#7d9297" metal={.48}/>
      <Box at={[x,y+.014,z]} size={[.15,.10,.12]} color={selected===i?'#dbad79':'#2b3944'}/>
      {[-.043,0,.043].map(dx=><Box key={dx} at={[x+dx,y-.049,z+.066]} size={[.015,.085,.013]} color="#adbac0" metal={.66}/>)}
    </group>)}
    <Box at={[-1.20,.122,1.04]} size={[.86,.08,.49]} color="#267a91"/>
    <Box at={[-1.46,.192,1.10]} size={[.175,.113,.154]} color="#b0bdc4" metal={.68}/>
    <Box at={[-1.11,.181,1.03]} size={[.24,.058,.121]} color="#26343e"/>
    {[.87,1.20].map(z=><Box key={z} at={[-1.11,.176,z]} size={[.51,.052,.056]} color="#29353e"/>)}
    <group onClick={()=>select(3)}>
      <Box at={[-.43,.124,1.02]} size={[.49,.095,.44]} color={selected===3?'#d9b180':'#dedbd0'}/>
      <Box at={[-.48,.198,.94]} size={[.30,.05,.048]} color="#b9a486"/>
      <mesh position={[-.36,.263,1.12]}><sphereGeometry args={[.067,22,14]}/><meshStandardMaterial color={warm?'#ff7651':'#9d4843'} emissive="#ff6139" emissiveIntensity={warm?2.1:0}/></mesh>
      {warm&&<pointLight position={[-.36,.32,1.13]} color="#ff7950" intensity={1.05} distance={.85}/>}
    </group>
    <Line points={[[.73,.61,.75],[.65,.27,.83],[.41,.198,1.03],[-.91,.181,.87]]} color="#dba357" lineWidth={3}/>
    <Line points={[[-1.42,.38,.60],[-1.36,.25,.73],[-1.24,.181,.87]]} color="#628aaf" lineWidth={3}/>
    <Line points={[[.76,.61,.75],[.73,.23,.96],[.50,.187,1.24],[-1.07,.187,1.20]]} color="#364553" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.35} scale={5.1} far={1.4} resolution={128} frames={1}/>
  </>;
}
type Reading={outlet:number;room:number;warm:boolean};
const initial:Reading={outlet:24,room:24,warm:false};
export default function VentOutletTemperatureDemo(){
  const [{outlet,room,warm},setReading]=useState(initial);
  const [selected,select]=useState(0);
  const delta=outlet-room;
  function change(update:Partial<Pick<Reading,'outlet'|'room'>>){
    setReading(previous=>{
      const {outlet,room}={...previous,...update};
      const delta=outlet-room;
      return {outlet,room,warm:(outlet>=30&&delta>=4)||(previous.warm&&outlet>28&&delta>2)};
    });
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D vent outlet temperature indicator">
        <Canvas camera={{position:[2.47,3.16,6.09],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the two readings below.</p>}>
          <Vent {...{outlet,room,warm,selected,select}}/><OrbitControls target={[0,.61,0]} enablePan={false} minDistance={3.6} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Vent outlet readings"><div><span>Outlet A0</span><strong>{outlet} °C</strong></div><div><span>Room A1</span><strong>{room} °C</strong></div><div><span>Outlet minus room</span><strong>{delta>0?'+':''}{delta} °C</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Compare outlet air with room air</h3>
      <label className="gp-home-light">Outlet temperature <output>{outlet} °C</output><input aria-label="Outlet temperature" type="range" min="18" max="40" value={outlet} onChange={e=>change({outlet:e.target.valueAsNumber})}/></label>
      <label className="gp-home-light">Room temperature <output>{room} °C</output><input aria-label="Room temperature" type="range" min="18" max="40" value={room} onChange={e=>change({room:e.target.valueAsNumber})}/></label>
      <div className="gp-steps"><button type="button" onClick={()=>change({outlet:33,room:25})}>Warm the outlet</button><button type="button" onClick={()=>change({outlet:32,room:32})}>Warm both probes</button><button type="button" onClick={()=>setReading(initial)}>Reset trial</button></div>
      <p role="status">{warm?'Warm outlet · Flag on.':'Flag off.'}</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
