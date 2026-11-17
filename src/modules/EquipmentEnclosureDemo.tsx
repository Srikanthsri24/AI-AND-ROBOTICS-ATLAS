import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point = [number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Case probe · A0',at:[.41,.93,.55],detail:'The suspended TMP36 samples the air inside the enclosure. Its signal wire goes to A0.'},
  {name:'Room probe · A1',at:[-1.63,.93,.40],detail:'The outside TMP36 samples room air away from the exhaust. Its signal goes to A1.'},
  {name:'Sliding vent',at:[1.42,1.68,-.33],detail:'Sliding the vent exposes the top grille, letting warmer air escape from the case.'},
  {name:'Warm-water bottle',at:[1.55,.72,.59],detail:'A sealed bottle of warm water models the heat an operating device gives off.'},
  {name:'Warning LED · D8',at:[-.70,.42,1.13],detail:'The LED turns on at 34 °C inside and clears at 32 °C. The series resistor limits its current.'},
];

function Probe({at,active,select}:{at:Point;active:boolean;select:()=>void}) {
  return <group position={at} onClick={select}>
    <Box at={[0,-.65,0]} size={[.24,.08,.28]} color="#87949c" metal={.58}/>
    <Box at={[0,-.31,-.024]} size={[.048,.62,.06]} color="#a4b0b8" metal={.58}/>
    <Box at={[0,0,0]} size={[.145,.13,.09]} color={active?'#ffbd71':'#232b33'}/>
    {[-.04,0,.04].map(x=><Box key={x} at={[x,-.098,.017]} size={[.012,.095,.014]} color="#c3c8cb" metal={.67}/>)}
  </group>;
}

function Bench({open,heat,warning,selected,select}:{open:boolean;heat:boolean;warning:boolean;selected:number;select:(index:number)=>void}) {
  const vent=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(vent.current)vent.current.position.x+=((open?.68:0)-vent.current.position.x)*(1-Math.exp(-12*dt));
  });
  const probeWires:{from:Point;via:Point;to:Point;color:string}[]=[
    {from:[.39,.81,.25],via:[.39,.23,.61],to:[-1.07,.21,.82],color:'#eaba63'},
    {from:[-1.63,.75,.18],via:[-1.63,.23,.61],to:[-1.19,.21,.82],color:'#72b7cd'},
  ];
  return <>
    <color attach="background" args={['#354957']}/>
    <hemisphereLight args={['#e9f4ff','#84796d',2]}/>
    <directionalLight position={[-2,6,4]} color="#fff1e0" intensity={2.1}/>
    <Box at={[0,-.10,0]} size={[4.8,.20,3.1]} color="#647581"/>
    <Box at={[.85,.15,-.2]} size={[2.48,.16,1.65]} color="#383f47"/>
    <Box at={[-.10,1.40,-.2]} size={[.58,.083,1.65]} color="#6d8189"/>
    <Box at={[1.75,1.40,-.2]} size={[.68,.083,1.65]} color="#6d8189"/>
    <Box at={[.80,1.40,-.848]} size={[1.24,.083,.354]} color="#6d8189"/>
    <Box at={[.80,1.40,.277]} size={[1.24,.083,.696]} color="#6d8189"/>
    {[-.36,2.06].flatMap(x=>[-.99,.59].map(z=><Box key={x+','+z} at={[x,.80,z]} size={[.08,1.23,.08]} color="#788d98" metal={.38}/>))}
    <mesh position={[.85,.80,-.98]}><boxGeometry args={[2.37,1.20,.024]}/><meshPhysicalMaterial color="#859fac" roughness={.34} transparent opacity={.26} depthWrite={false}/></mesh>
    <mesh position={[2.06,.80,-.2]}><boxGeometry args={[.024,1.20,1.53]}/><meshPhysicalMaterial color="#b4d5df" roughness={.22} transparent opacity={.25} depthWrite={false}/></mesh>
    <mesh position={[.85,.8,.60]} renderOrder={2}><boxGeometry args={[2.34,1.18,.022]}/><meshPhysicalMaterial color="#b4d5df" roughness={.25} transparent opacity={.11} depthWrite={false}/></mesh>
    <group onClick={()=>select(2)}>

      {Array.from({length:7},(_,i)=><Box key={i} at={[.27+i*.177,1.435,-.365]} size={[.067,.04,.594]} color="#a3adb3" metal={.48}/>)}
      <group ref={vent}>
        <Box at={[.8,1.49,-.365]} size={[1.25,.067,.65]} color={selected===2?'#eab170':'#4f6877'} metal={.47}/>
        <Box at={[.68,1.555,-.365]} size={[.19,.071,.21]} color="#263b46"/>
      </group>
    </group>
    <group position={[1.43,.24,-.17]} onClick={()=>select(3)}>
      <mesh position={[0,.38,0]}><cylinderGeometry args={[.254,.26,.75,38]}/><meshPhysicalMaterial color={selected===3?'#ffb771':heat?'#cd7253':'#849fad'} roughness={.28} clearcoat={.65}/></mesh>
      <mesh position={[0,.803,0]}><cylinderGeometry args={[.12,.25,.10,32]}/><meshStandardMaterial color="#bfd0d4"/></mesh>
      <mesh position={[0,.889,0]}><cylinderGeometry args={[.135,.135,.08,28]}/><meshStandardMaterial color="#243b4b"/></mesh>
      <mesh position={[0,.43,0]}><cylinderGeometry args={[.261,.262,.205,38]}/><meshStandardMaterial color={heat?'#f1d8ad':'#cbdde2'}/></mesh>
    </group>
    <Probe at={[.39,.92,.25]} active={selected===0} select={()=>select(0)}/>
    <Probe at={[-1.63,.86,.18]} active={selected===1} select={()=>select(1)}/>
    <Box at={[-1.39,.11,1.0]} size={[.82,.083,.52]} color="#22788c"/>
    <Box at={[-1.71,.19,1.08]} size={[.16,.13,.18]} color="#bfc9ce" metal={.65}/>
    <Box at={[-1.32,.18,1.01]} size={[.24,.052,.09]} color="#282f34"/>
    {[.82,1.21].map(z=><Box key={z} at={[-1.34,.174,z]} size={[.53,.06,.06]} color="#283133"/>)}
    <group onClick={()=>select(4)}>
      <Box at={[-.72,.117,1.08]} size={[.44,.10,.43]} color={selected===4?'#e6b988':'#e1dfd3'}/>
      <Box at={[-.72,.187,1.04]} size={[.28,.039,.048]} color="#b89b71"/>
      <mesh position={[-.63,.265,1.15]}><sphereGeometry args={[.064,24,16]}/><meshStandardMaterial color={warning?'#ff6842':'#863f37'} emissive="#ff603c" emissiveIntensity={warning?2.8:0}/></mesh>
      {warning&&<pointLight position={[-.63,.33,1.15]} color="#ff7752" intensity={1.1} distance={.8}/>}
    </group>
    {probeWires.map(({from,via,to,color})=><Line key={color} points={[from,via,to]} color={color} lineWidth={3}/>)}
    <Line points={[[-1.18,.20,1.21],[-.98,.19,1.30],[-.76,.19,1.12]]} color="#ad5855" lineWidth={3}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.33} scale={5} far={1.9} resolution={128} frames={1}/>
  </>;
}

export default function EquipmentEnclosureDemo(){
  const [open,setOpen]=useState(false);
  const [heat,setHeat]=useState(false);
  const [room,setRoom]=useState(24);
  const [selected,select]=useState(0);
  const [{inside,warning},setReading]=useState({inside:24,warning:false});
  const target=room+(heat?(open?4:14):0);
  useEffect(()=>{
    if(inside===target)return;
    const timer=window.setTimeout(()=>setReading(previous=>{
      const inside=previous.inside+Math.sign(target-previous.inside);
      return {inside,warning:inside>=34||(previous.warning&&inside>32)};
    }),250);
    return ()=>window.clearTimeout(timer);
  },[inside,target]);
  const difference=inside-room;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D equipment enclosure monitor">
        <Canvas camera={{position:[3.1,3.5,6.5],fov:39}} dpr={[1,1.6]} fallback={<p>Follow the temperature and warning readings below.</p>}>
          <Bench {...{open,heat,warning,selected,select}}/><OrbitControls target={[0,.64,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Enclosure readings"><div><span>Case air</span><strong>{inside} °C</strong></div><div><span>Room air</span><strong>{room} °C</strong></div><div><span>Case minus room</span><strong>{difference>0?'+':''}{difference} °C</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Test how the vent affects the case</h3>
      <label className="gp-home-light">Room temperature <output>{room} °C</output><input type="range" aria-label="Room temperature" min="20" max="34" value={room} onChange={event=>setRoom(event.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setHeat(!heat)}>{heat?'Turn heat off':'Turn heat on'}</button>
        <button type="button" className="gp-button gp-secondary" onClick={()=>setOpen(!open)}>{open?'Close vent':'Open vent'}</button>
        <button type="button" onClick={()=>{setOpen(false);setHeat(false);setRoom(24);select(0);setReading({inside:24,warning:false});}}>Reset trial</button>
      </div>
      <p role="status">{warning?'Temperature warning on.':'Temperature warning off.'}</p>
      <p>Heat the case with the vent closed. Then open it and compare the readings. The model speeds up warming and cooling. The LED turns on at 34 °C and clears at 32 °C.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p>{labels[selected].detail}</p>
    </div>
  </div>;
}
