import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const names=['Edge probe · A0','Inner probe · A1','Edge LED · D8','Inner LED · D9'];
const anchors:Point[]=[[-.94,1.10,.73],[.26,1.11,.26],[-1.11,.42,1.38],[.14,.42,1.38]];
const detail=[
  'The edge probe samples the outer cell. Its analog output feeds A0 and is scaled using its own dry and damp readings.',
  'The inner probe feeds A1. It reads its own cell at the same depth, so watering the edge does not change this channel in the model.',
  'D8 lights the edge flag through a 330 Ω resistor at 35 or below. The flag clears at 45 or above.',
  'D9 controls the inner flag with the same limits. Each LED remembers its own state between the thresholds.',
];
const positions:Point[]=[[-1.20,.35,.43],[0,.35,.43],[1.20,.35,.43],[-1.20,.35,-.69],[0,.35,-.69],[1.20,.35,-.69]];
type Cell={moisture:number;flag:boolean};
const initial:Cell[]=[{moisture:26,flag:true},{moisture:61,flag:false}];

function Tray({cells,selected,select}:{cells:Cell[];selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#394a54']}/>
    <hemisphereLight args={['#edf6ff','#8b7564',2.1]}/><directionalLight position={[-3,6,4]} color="#fff1dc" intensity={2.1}/>
    <Box at={[0,-.09,0]} size={[4.86,.18,3.42]} color="#778986"/>
    <Box at={[0,.115,-.13]} size={[3.91,.15,2.45]} color="#526864"/>
    <Box at={[0,.223,-.13]} size={[3.65,.22,2.23]} color="#252f31"/>
    {positions.map(([x,y,z],i)=>{
      const soil=cells[i]?.moisture??55;
      return <group key={i} position={[x,y,z]}>
        <Box at={[0,-.036,0]} size={[1.11,.16,1.02]} color={selected===i?'#656f62':'#303a39'}/>
        <Box at={[0,.04,0]} size={[.98,.055,.88]} color={soil<35?'#80694a':soil<50?'#624b33':'#45362a'}/>
        {Array.from({length:18},(_,grain)=><mesh key={grain} position={[Math.sin(grain*93)*.44,.07,Math.cos(grain*32)*.40]}><icosahedronGeometry args={[.012+grain%5*.006,0]}/><meshStandardMaterial color={grain%4?'#857356':'#b1a48a'} roughness={1}/></mesh>)}
        <group position={[-.18,.07,-.14]}>
          <mesh position={[0,.16,0]}><cylinderGeometry args={[.015,.021,.34,12]}/><meshStandardMaterial color="#78a552"/></mesh>
          {[-1,1].map(side=><mesh key={side} position={[side*.117,.31,.013]} rotation={[0,side*.55,side*.49]} scale={[.155,.026,.085]}><sphereGeometry args={[1,20,12]}/><meshPhysicalMaterial color={i%2?'#69a04f':'#80b25d'} roughness={.54} clearcoat={.24}/></mesh>)}
          <mesh position={[.019,.40,-.01]} rotation={[0,.5,.17]} scale={[.069,.031,.047]}><sphereGeometry args={[1,18,10]}/><meshStandardMaterial color="#6fa758"/></mesh>
        </group>
        {i<2&&<group onClick={()=>select(i)} position={[.26,.26,.12]} rotation={[0,0,-.12]}>
          <Box at={[0,-.13,0]} size={[.17,.39,.028]} color={selected===i?'#e1b675':'#212d37'}/>
          <Box at={[0,.059,0]} size={[.183,.15,.039]} color="#213641"/>
          <Box at={[0,.13,.022]} size={[.115,.067,.060]} color="#e5dfcb"/>
          <Box at={[.044,.048,.026]} size={[.045,.043,.014]} color="#131b26"/>
        </group>}
      </group>;
    })}
    <Box at={[-1.74,.106,1.22]} size={[.74,.075,.50]} color="#2c7c89"/>
    <Box at={[-2.00,.17,1.29]} size={[.17,.083,.136]} color="#b8c5c8" metal={.62}/>
    <Box at={[-1.64,.164,1.22]} size={[.22,.052,.13]} color="#2c363b"/>
    {cells.map(({flag},i)=>{
      const x=-.99+i*1.15;
      const probeX=positions[i][0]+.26;
      return <group key={i}>
        <Line points={[[probeX,.76,.55],[probeX,.88,1.00],[-1.38,.19,1.16+i*.09]]} color={i?'#71c2d2':'#e8b159'} lineWidth={3}/>
        <Line points={[[-1.58,.195,1.39],[x-.32,.16,1.53],[x-.15,.15,1.31]]} color={i?'#6ea7bc':'#bc6660'} lineWidth={3}/>
        <group onClick={()=>select(i+2)}>
          <Box at={[x,.10,1.31]} size={[.49,.10,.35]} color={selected===i+2?'#e9bf8c':'#dcd5c3'}/>
          <Box at={[x-.06,.18,1.31]} size={[.25,.039,.043]} color="#a88b65"/>
          <mesh position={[x+.12,.25,1.34]}><sphereGeometry args={[.061,20,14]}/><meshStandardMaterial color={flag?'#ff7548':'#803c35'} emissive="#ff5a32" emissiveIntensity={flag?2.4:0}/></mesh>
          {flag&&<pointLight position={[x+.12,.31,1.34]} color="#ff7542" intensity={.9} distance={.67}/>}
        </group>
      </group>;
    })}
    {names.map((name,i)=><WorldLabel key={name} position={anchors[i]} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={i===selected} onClick={()=>select(i)}>{i+1}{i===selected&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.37} scale={5.1} far={1.8} frames={1}/>
  </>;
}
export default function SeedlingTrayMoistureDemo(){
  const [cells,setCells]=useState(initial);
  const [selected,select]=useState(0);
  function setMoisture(channel:number,moisture:number){
    setCells(previous=>previous.map((cell,i)=>i===channel?{moisture,flag:moisture<=35||(moisture<45&&cell.flag)}:cell));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D seedling tray moisture check">
        <Canvas camera={{position:[2.2,3.9,6.2],fov:41}} dpr={[1,1.6]} fallback={<p>Use the two readouts to compare the cells.</p>}><Tray {...{cells,selected,select}}/><OrbitControls target={[0,.43,0]} enablePan={false} minDistance={3.4} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Seedling tray readings">{cells.map(({moisture,flag},i)=><div key={i}><span>{i?'Inner':'Edge'} · relative index</span><strong>{moisture} · {flag?'Check soil':'Flag off'}</strong></div>)}</div>
    </div>
    <div className="gp-guide">
      <h3>Water each cell independently</h3>
      <p>The demo starts with both probes calibrated. The edge dries first. Water it and compare what happens to each reading and light.</p>
      {cells.map(({moisture},i)=>{
        const name=i?'Inner':'Edge';
        return <label key={name} className="gp-home-light">{name} cell moisture <output>{moisture}</output><input aria-label={name+' cell moisture'} type="range" min="0" max="100" value={moisture} onChange={event=>setMoisture(i,event.target.valueAsNumber)}/></label>;
      })}
      <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>{setMoisture(0,75);select(0);}}>Water edge cell</button><button type="button" className="gp-button gp-secondary" onClick={()=>{setMoisture(1,75);select(1);}}>Water inner cell</button><button type="button" onClick={()=>{setCells(initial);select(0);}}>Reset tray</button></div>
      <p role="status">{cells.every(cell=>!cell.flag)?'Both flags off.':cells.every(cell=>cell.flag)?'Check both cells.':cells[0].flag?'Check the edge cell.':'Check the inner cell.'}</p>
      <ol className="gp-demo-labels">{names.map((name,i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{detail[selected]}</p>
    </div>
  </div>;
}
