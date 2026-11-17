import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls, RoundedBox, useTexture } from '@react-three/drei';
import { Object3D, SRGBColorSpace } from 'three';
import { missionLimits, stationInView } from '../data/weather-cubesat';
import { WorldLabel } from './LabWorkbench';
import { download } from './state';

type Point=[number,number,number];
const earthRadius=1.34, orbitRadius=1.94;
const earthImage='./images/project-parts/cubesat-earth.png';

function Block({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={2}>
    <meshStandardMaterial color={color} roughness={metal>.3?.36:.61} metalness={metal}/>
  </RoundedBox>;
}

export function CubeCamera() {
  return <>
    <Block at={[0,0,0]} size={[.43,.41,.24]} color="#354652" metal={.48}/>
    <mesh position={[0,0,.15]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.136,.136,.10,31]}/>
      <meshStandardMaterial color="#192c3a" metalness={.70}/></mesh>
    <mesh position={[0,0,.207]}><sphereGeometry args={[.099,26,14]}/>
      <meshPhysicalMaterial color="#5d8fba" metalness={.55} roughness={.205} clearcoat={1}/></mesh>
    <Block at={[.133,.142,.119]} size={[.060,.043,.012]} color="#e7b96f"/>
  </>;
}

export function CubeBus({pointing=true}: {pointing?:boolean}) {
  return <>
    <Block at={[0,0,0]} size={[.55,.62,.53]} color="#c4ad86" metal={.7}/>
    <Block at={[0,0,-.277]} size={[.47,.54,.032]} color="#46596c"/>
    {[-.24,.24].flatMap(x=>[-.265,.265].map(y=><Block key={`${x}:${y}`} at={[x,y,0]} size={[.068,.069,.58]} color="#dcd5bf" metal={.73}/>))}
    {[-1,1].map(side=><group key={side} position={[side*.46,0,-.017]}>
      <Block at={[0,0,0]} size={[.40,.48,.043]} color="#879baa" metal={.56}/>
      {Array.from({length:6},(_,i)=><Block key={i} at={[(i%2-.5)*.188,(Math.floor(i/2)-1)*.145,.029]}
        size={[.169,.129,.018]} color={i%2===0?'#23466f':'#31598a'} metal={.39}/>)}
    </group>)}
    <group position={[0,0,.293]} rotation={[0,pointing?0:Math.PI/2,0]} scale={.66}><CubeCamera/></group>
    <Line points={[[.09,.31,-.16],[.13,.58,-.235],[.18,.65,-.25]]} color="#c8d6dc" lineWidth={1.8}/>
  </>;
}

export function GroundStation() {
  return <>
    <Block at={[0,.027,0]} size={[.62,.052,.53]} color="#637b85"/>
    <Block at={[0,.16,-.016]} size={[.089,.25,.085]} color="#b7bdc0" metal={.55}/>
    <mesh position={[0,.36,0]} rotation={[-Math.PI*.19,0,0]}>
      <sphereGeometry args={[.24,31,19,0,Math.PI*2,0,Math.PI*.37]}/>
      <meshStandardMaterial color="#d9dcd2" side={2} metalness={.42}/>
    </mesh>
    <Line points={[[0,.23,-.10],[0,.42,.14],[0,.53,.17]]} color="#9daab3" lineWidth={1.7}/>
  </>;
}

const pointAt=(longitude:number,radius:number):Point=>{
  const angle=longitude*Math.PI/180;
  return [radius*Math.cos(angle),0,-radius*Math.sin(angle)];
};
const orbit=Array.from({length:97},(_,index)=>pointAt(index*360/96, orbitRadius));
const contact=Array.from({length:21},(_,index)=>pointAt(35+index*2.5,orbitRadius));
const starPositions=new Float32Array(Array.from({length:112},(_,i)=>[
  Math.sin(i*178.32)*7.7, Math.cos(i*33.19)*4.7, -3.6-Math.sin(i*16.91)*3.0,
]).flat());

function Globe() {
  const map=useTexture(earthImage);
  useEffect(()=>{map.colorSpace=SRGBColorSpace;map.needsUpdate=true;},[map]);
  return <>
    <mesh><sphereGeometry args={[earthRadius,72,40]}/><meshStandardMaterial map={map} roughness={.82}/></mesh>
    <mesh><sphereGeometry args={[earthRadius+.018,64,33]}/>
      <meshBasicMaterial color="#79c8d8" transparent opacity={.073} depthWrite={false}/></mesh>
  </>;
}

function OrbitScene({longitude,pointing,contactReady}:{longitude:number;pointing:boolean;contactReady:boolean}) {
  const satellite=pointAt(longitude, orbitRadius);
  const footprint=pointAt(longitude,earthRadius+.02);
  const station=pointAt(missionLimits.stationLongitude,earthRadius+.028);
  const orientation=useMemo(()=>{
    const object=new Object3D();
    object.position.set(...satellite);
    object.lookAt(0,0,0);
    return object.quaternion;
  },[longitude]);
  return <>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[starPositions,3]}/></bufferGeometry>
      <pointsMaterial color="#d9ebfa" size={.018} transparent opacity={.67}/></points>
    <Suspense fallback={<mesh><sphereGeometry args={[earthRadius,48,32]}/><meshStandardMaterial color="#397b96"/></mesh>}><Globe/></Suspense>
    <Line points={orbit} color="#487487" lineWidth={1.18}/>
    <Line points={contact} color="#72e0b5" lineWidth={2}/>
    <group position={satellite} quaternion={orientation} scale={.55}><CubeBus pointing={pointing}/></group>
    <mesh position={station}><sphereGeometry args={[.043,24,16]}/>
      <meshStandardMaterial color="#7af3bf" emissive="#34d89c" emissiveIntensity={1.6}/></mesh>
    {pointing&&<Line points={[satellite,footprint]} color="#8ae3f5" dashed dashSize={.073} gapSize={.046} lineWidth={1.6}/>}
    {contactReady&&<Line points={[satellite,station]} color="#89ecb6" lineWidth={1.6}/>}
    <WorldLabel position={[satellite[0],.56,satellite[2]]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label">CubeSat · {longitude}° E</span>
    </WorldLabel>
    <WorldLabel position={[station[0],-.40,station[2]]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label">Ground station · 60° E</span>
    </WorldLabel>
  </>;
}

type Frame={id:number;longitude:number;clouds:number};
function CameraFrame({frame}:{frame:Omit<Frame,'id'>}) {
  const percentage=(frame.longitude+180-45)/270*100;
  return <div className="gp-cube-image" role="img" aria-label={`Camera frame at ${frame.longitude}° east with ${frame.clouds}% cloud setting`}
    style={{backgroundImage:`url("${earthImage}")`,backgroundPosition:`${percentage}% 50%`}}>
    {frame.clouds>0&&<div className="gp-cube-clouds" style={{opacity:frame.clouds/100}}/>}
  </div>;
}

export default function WeatherCubeSatDemo() {
  const [longitude,setLongitude]=useState(0);
  const [clouds,setClouds]=useState(0);
  const [pointing,setPointing]=useState(true);
  const [onboard,setOnboard]=useState<Frame|null>(null);
  const [archive,setArchive]=useState<Frame[]>([]);
  const [view,setView]=useState<number|null>(null);
  const contactReady=stationInView(longitude);
  const chosen=archive.find(frame=>frame.id===view);
  const preview=chosen??onboard??{longitude,clouds};

  function capture() {
    setOnboard({id:archive.length+1,longitude,clouds});
    setView(null);
  }
  function downlink() {
    if(!onboard||!contactReady)return;
    setArchive(previous=>[...previous,onboard]);
    setView(onboard.id);
    setOnboard(null);
  }
  return <>
    <div className="gp-split gp-demo">
      <div className="gp-story-stage">
        <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive CubeSat orbital pass">
          <Canvas dpr={[1,1.5]} camera={{position:[4,2.7,-6],fov:41}} fallback={<p>The camera and telemetry controls are available without WebGL.</p>}>
            <color attach="background" args={['#0d1b2d']}/>
            <ambientLight intensity={.96}/>
            <directionalLight position={[3,5,-5]} intensity={2.2}/>
            <OrbitScene longitude={longitude} pointing={pointing} contactReady={contactReady}/>
            <OrbitControls enablePan={false} minDistance={4} maxDistance={12}/>
          </Canvas>
        </div>
        <div className="gp-demo-result" aria-label="Simulated CubeSat telemetry">
          <div><span>Station contact</span><strong>{contactReady?'In contact':'Outside contact'}</strong></div>
          <div><span>Onboard buffer</span><strong>{onboard?'1 frame stored':'Empty'}</strong></div>
          <div><span>Ground archive</span><strong>{archive.length} received</strong></div>
        </div>
      </div>
      <div className="gp-guide">
        <h3>Plan and run a pass</h3>
        <p>Capture at any Earth-facing position. Move into the green contact arc to send the stored frame.</p>
        <label htmlFor="gp-cube-longitude">Satellite longitude · {longitude}° E</label>
        <input className="gp-lidar-range" id="gp-cube-longitude" type="range" value={longitude} min={missionLimits.min} max={missionLimits.max}
          onChange={event=>setLongitude(Number(event.target.value))}/>
        <div className="gp-steps" role="group" aria-label="Orbital pass presets">
          {[0,60,120].map(value=><button key={value} type="button" aria-pressed={longitude===value} onClick={()=>setLongitude(value)}>{value}° E</button>)}
        </div>
        <label htmlFor="gp-cube-clouds">Simulated cloud setting · {clouds}%</label>
        <input className="gp-lidar-range" id="gp-cube-clouds" type="range" min={0} max={100} step={10} value={clouds}
          onChange={event=>{setClouds(Number(event.target.value));setView(null);}}/>
        <div className="gp-steps">
          <button type="button" aria-pressed={pointing} onClick={()=>{setPointing(value=>!value);setView(null);}}>
            {pointing?'Camera Earth-facing':'Camera sideways'}
          </button>
          <button type="button" className="gp-button" disabled={!pointing||onboard!==null} onClick={capture}>Capture frame</button>
          <button type="button" disabled={!contactReady||onboard===null} onClick={downlink}>Downlink frame</button>
        </div>
        <p className="gp-check" role="status">{onboard ? contactReady?'Frame stored · ready to downlink':'Frame stored · awaiting contact'
          : chosen?`Frame ${chosen.id} received`:pointing?'Camera ready':'Point the camera toward Earth to capture'}</p>
        <figure className="gp-cube-preview">
          <figcaption>{chosen?`Received frame ${chosen.id}`:onboard?'Stored frame':'Live camera'}</figcaption>
          {chosen||onboard||pointing ? <CameraFrame frame={preview}/> : <div className="gp-cube-image">Earth is outside the camera view.</div>}
        </figure>
        <p>Basemap: <a href="https://svs.gsfc.nasa.gov/2915" target="_blank" rel="noreferrer">NASA Blue Marble</a>. Cloud patterns are simulated.</p>
      </div>
    </div>
    <div className="gp-table"><table aria-label="Downlinked frames">
      <thead><tr><th>Frame</th><th>Capture longitude</th><th>Cloud setting</th><th>Preview</th></tr></thead>
      <tbody>{archive.length===0?<tr><td colSpan={4}>Downlink a frame to see it here.</td></tr>:archive.map(frame=>
        <tr key={frame.id}><td>{frame.id}</td><td>{frame.longitude}° E</td><td>{frame.clouds}%</td>
          <td><button type="button" className="gp-button gp-secondary" onClick={()=>setView(frame.id)}>View frame {frame.id}</button></td></tr>)}</tbody>
    </table></div>
    <button type="button" className="gp-button gp-secondary" disabled={!archive.length} onClick={()=>download('cubesat_frames.csv',
      ['frame,longitude_deg_e,cloud_setting_percent',...archive.map(frame=>`${frame.id},${frame.longitude},${frame.clouds}`)].join('\n')+'\n')}>
      Download frame metadata
    </button>
  </>;
}
