import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const labels=[
  ['Page sensor',[-.44,.48,.43],'A0 measures light at the open book. Shading the sensor lowers the page reading.'],
  ['Cutoff dial',[1.52,.67,.69],'A1 reads the center terminal of the potentiometer. The dial selects a cutoff between 25% and 85%.'],
  ['Status LED',[1.34,.63,-.48],'D8 lights this LED through a 330 Ω resistor when the page falls below the selected cutoff.'],
  ['Arduino Uno',[.46,.46,.99],'The Uno compares the two readings. Once the LED turns on, the page must reach cutoff plus five points before it clears.'],
] as const;

type Settings={light:number;cutoff:number;alert:boolean};
function Desk({light,cutoff,alert,selected,select}:{light:number;cutoff:number;alert:boolean;selected:number;select:(i:number)=>void}){
  const ambient=.46+light*.024;
  return <>
    <color attach="background" args={['#32465a']}/>
    <hemisphereLight args={['#e5f1ff','#826856',ambient]}/>
    <directionalLight position={[-3,6,4]} intensity={ambient} color="#fff0d5"/>
    <Box at={[0,.03,0]} size={[4.76,.23,3]} color="#a57c59"/>
    {Array.from({length:8},(_,i)=><Box key={i} at={[-2+i*.55,.149,0]} size={[.008,.007,2.96]} color="#8e6f57"/>)}
    <group position={[-1.11,.26,-.22]}>
      <Box at={[0,-.051,0]} size={[1.93,.097,1.34]} color="#475f70"/>
      {[-1,1].map(sign=><group key={sign} position={[sign*.47,.011,0]} rotation={[0,0,sign*.071]}>
        <Box at={[0,0,0]} size={[.91,.108,1.24]} color="#f0e3c7"/>
        {[0,.1].map(y=><Box key={y} at={[0,y-.057,.614]} size={[.89,.013,.009]} color="#c0ae92"/>)}
        <Box at={[-.12,.056,-.40]} size={[.42,.006,.018]} color="#657985"/>
        {Array.from({length:8},(_,i)=><Box key={i} at={[-.015-(i%3)*.028,.056,-.30+.102*i]} size={[.64-(i%3)*.056,.007,.010]} color="#8e8b80"/>)}
      </group>)}
    </group>
    {light<50&&<mesh position={[-.99,.36,-.11]} rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[1.03,1.02]}/><meshBasicMaterial color="#313744" transparent opacity={(50-light)/100} depthWrite={false}/>
    </mesh>}
    <group onClick={()=>select(0)}>
      <Box at={[-.44,.184,.43]} size={[.29,.078,.24]} color="#dedbce"/>
      <mesh position={[-.44,.253,.43]}><cylinderGeometry args={[.064,.064,.038,22]}/><meshStandardMaterial color={selected===0?'#ffd18c':'#c69771'}/></mesh>
      <Line points={[[-.483,.275,.405],[-.4,.275,.405],[-.4,.275,.43],[-.48,.275,.43],[-.48,.275,.45],[-.4,.275,.45]]} color="#80503b" lineWidth={2}/>
    </group>
    <group position={[1.54,.27,.64]} onClick={()=>select(1)}>
      <Box at={[0,-.035,0]} size={[.43,.15,.46]} color="#6b7175" metal={.53}/>
      <mesh position={[0,.065,0]}><cylinderGeometry args={[.193,.193,.036,32]}/><meshStandardMaterial color="#ded7c8"/></mesh>
      <group position={[0,.15,0]} rotation={[0,(cutoff-55)*.064,0]}>
        <mesh><cylinderGeometry args={[.132,.147,.15,28]}/><meshStandardMaterial color={selected===1?'#d29e68':'#2d3c49'}/></mesh>
        <Box at={[0,.078,.057]} size={[.022,.009,.11]} color="#f0d7a8"/>
      </group>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[1.41,.224,-.43]} size={[.46,.15,.38]} color={selected===2?'#c68248':'#627383'}/>
      <mesh position={[1.41,.34,-.43]}><sphereGeometry args={[.082,22,14]}/><meshStandardMaterial color={alert?'#ff794e':'#a33133'} emissive="#ff592f" emissiveIntensity={alert?2.4:0}/></mesh>
      {alert&&<pointLight position={[1.41,.44,-.43]} color="#ff6247" intensity={1.1} distance={.8}/>}
    </group>
    <group position={[.59,.21,1]} onClick={()=>select(3)}>
      <Box at={[0,0,0]} size={[.98,.07,.54]} color={selected===3?'#c68a51':'#277b91'}/>
      <Box at={[-.32,.084,.08]} size={[.19,.126,.17]} color="#b3bec2" metal={.67}/>
      <Box at={[.08,.063,0]} size={[.31,.066,.115]} color="#293238"/>
      {[-.19,.19].map(z=><Box key={z} at={[.08,.065,z]} size={[.59,.08,.057]} color="#29363d"/>)}
    </group>
    <Box at={[.54,.18,.14]} size={[.76,.065,.53]} color="#e2ddd0"/>
    {Array.from({length:9},(_,i)=>[-.13,.13].map(z=><Box key={i+':'+z} at={[.25+i*.072,.216,.14+z]} size={[.020,.004,.020]} color="#7b7e7b"/>))}
    <Box at={[.59,.267,.17]} size={[.32,.026,.021]} color="#aeb1b1" metal={.65}/>
    <Box at={[.59,.268,.17]} size={[.14,.049,.052]} color="#b49e74"/>
    <Box at={[.59,.267,.02]} size={[.32,.026,.021]} color="#aeb1b1" metal={.65}/>
    <Box at={[.59,.268,.02]} size={[.14,.049,.052]} color="#b49e74"/>
    <Line points={[[1.59,.24,.69],[1.24,.23,.61],[1.12,.255,.41],[.50,.25,.39],[.46,.31,.81]]} color="#b95d53" lineWidth={2}/>
    <Line points={[[1.64,.24,.69],[1.37,.24,.92],[1.12,.27,1.25],[.74,.30,1.19]]} color="#353e45" lineWidth={2}/>
    <Line points={[[-.44,.22,.43],[-.26,.31,.43],[.17,.28,.26],[.43,.24,.17],[.56,.30,.81]]} color="#d8a14c" lineWidth={3}/>
    <Line points={[[1.48,.24,.69],[1.25,.25,.75],[.93,.27,.55],[.80,.30,.81]]} color="#668ab5" lineWidth={3}/>
    <Line points={[[1.42,.29,-.20],[1.17,.28,.01],[.89,.252,.09],[.74,.24,.17]]} color="#b65a59" lineWidth={3}/>
    <Line points={[[1.42,.24,-.23],[1.00,.24,-.10],[.91,.20,.42],[.87,.29,.81]]} color="#38424e" lineWidth={3}/>
    {labels.map(([name,at],i)=><WorldLabel key={name} position={[...at]} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.152,0]} opacity={.3} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function ReadingCornerDemo(){
  const [settings,set]=useState<Settings>({light:72,cutoff:55,alert:false});
  const [selected,select]=useState(0);
  const {light,cutoff,alert}=settings;
  function adjust(update:Partial<Pick<Settings,'light'|'cutoff'>>){
    set(previous=>{
      const {light,cutoff}={...previous,...update};
      return {light,cutoff,alert:light<cutoff||(light<cutoff+5&&previous.alert)};
    });
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D reading corner">
        <Canvas camera={{position:[2.15,3.9,5.7],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the readings below.</p>}>
          <Desk {...{light,cutoff,alert,selected,select}}/><OrbitControls target={[0,.28,0]} enablePan={false} minDistance={3.3} maxDistance={9}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Reading corner measurements">
        <div><span>Page brightness</span><strong>{light}%</strong></div><div><span>Cutoff</span><strong>{cutoff}%</strong></div><div><span>Status LED</span><strong>{alert?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare page light and cutoff</h3>
      <label className="gp-home-light">Page brightness <output>{light}%</output><input type="range" aria-label="Page brightness" min="0" max="100" value={light} onChange={e=>adjust({light:e.target.valueAsNumber})}/></label>
      <label className="gp-home-light">Cutoff dial <output>{cutoff}%</output><input type="range" aria-label="Cutoff dial" min="25" max="85" value={cutoff} onChange={e=>adjust({cutoff:e.target.valueAsNumber})}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>adjust({light:35})}>Shade the page</button>
        <button type="button" onClick={()=>adjust({light:82})}>Add desk light</button>
        <button type="button" onClick={()=>set({light:72,cutoff:55,alert:false})}>Reset trial</button>
      </div>
      <p role="status">{alert?'Add light · Status LED on.':'Status LED off.'}</p>
      <p>With this cutoff, the reminder clears at {cutoff+5}% or higher. The readings use a relative scale for this model.</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][2]}</p>
    </div>
  </div>;
}
