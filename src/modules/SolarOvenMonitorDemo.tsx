import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Foil reflector',at:[.52,2.04,-.32],detail:'Change the angle to see how much light reaches the absorber in this model. The most effective angle depends on the light source position.'},
  {name:'Clear cover and absorber',at:[1.32,.68,.66],detail:'Light enters through the cover and reaches dark card. Opening the cover lets the model lose heat faster.'},
  {name:'Collector air probe · A0',at:[.50,.55,.57],detail:'The TMP36 measures air above the absorber. Compare its changing reading with the recorded peak.'},
  {name:'Warm indicator · D8',at:[-.30,.50,1.06],detail:'D8 lights when the current air reading reaches 38 °C. Cooling clears the LED while the recorded peak remains.'},
];
function Collector({angle,sun,closed,warm,selected,select}:{angle:number;sun:number;closed:boolean;warm:boolean;selected:number;select:(i:number)=>void}){
  const ambient=.80+sun*.014;
  const transmission=sun*Math.max(0,1-Math.abs(angle-45)/45);
  return <>
    <color attach="background" args={[sun<50?'#304353':'#3f5668']}/>
    <hemisphereLight args={['#e3efff','#857763',ambient]}/>
    <directionalLight position={[-3,6,4]} intensity={ambient} color="#fff0d1"/>
    <directionalLight position={[0,1.05,5]} intensity={.76} color="#e5f1fc"/>
    <Box at={[0,-.094,0]} size={[4.91,.188,3.06]} color="#637b85"/>
    <Box at={[.56,.123,-.13]} size={[2.83,.24,2.01]} color="#9a8064"/>
    <Box at={[.56,.254,-.13]} size={[2.63,.028,1.78]} color="#303944"/>
    {[-.81,1.94].map(x=><Box key={x} at={[x,.379,-.13]} size={[.10,.33,1.99]} color="#a88d70"/>)}
    {[-1.085,.823].map(z=><Box key={z} at={[.56,.370,z]} size={[2.83,.31,.10]} color="#a58b6f"/>)}
    <group position={[.56,.539,-1.09]} rotation={[-angle*Math.PI/180,0,0]} onClick={()=>select(0)}>
      <Box at={[0,0,1.04]} size={[2.82,.086,2.07]} color="#a3886d"/>
      <Box at={[0,-.054,1.045]} size={[2.64,.028,1.9]} color={selected===0?'#e1c4a3':'#d7e0df'} metal={.31}/>
      {Array.from({length:6},(_,i)=><Line key={i} points={[[-1.28+i*.49,-.075,.14],[-1.21+i*.49,-.076,1.23],[-1.25+i*.49,-.075,1.93]]} color="#83949a" lineWidth={1}/>)}
      <Box at={[0,-.07,1.99]} size={[2.7,.041,.058]} color="#d1d4c9" metal={.62}/>
    </group>
    <group position={[.56,.509,-.94]} rotation={[closed?0:-.30,0,0]} onClick={()=>select(1)}>
      <mesh position={[0,0,.80]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.56,1.68]}/><meshStandardMaterial color="#b4dadb" transparent opacity={.14} depthWrite={false} side={2}/></mesh>
      {[-1.26,1.26].map(x=><Box key={x} at={[x,.007,.80]} size={[.044,.049,1.72]} color={selected===1?'#d2a87b':'#8d9f9d'}/>)}
      {[-.04,1.66].map(z=><Box key={z} at={[0,.007,z]} size={[2.55,.047,.046]} color="#91a39f"/>)}
    </group>
    {transmission>25&&<mesh position={[.55,.275,-.09]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.62,1.0]}/><meshBasicMaterial color="#e4ae67" transparent opacity={transmission*.0026} depthWrite={false}/></mesh>}
    <group onClick={()=>select(2)}>
      <Box at={[.52,.318,.53]} size={[.27,.111,.23]} color="#8f9f9a"/>
      <Box at={[.52,.448,.48]} size={[.153,.094,.103]} color={selected===2?'#d6a779':'#2d3941'}/>
      {[-.047,0,.047].map(x=><Box key={x} at={[.52+x,.389,.529]} size={[.016,.077,.015]} color="#afb9bc" metal={.69}/>)}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.48,.12,1.0]} size={[.83,.081,.49]} color="#27788e"/>
      <Box at={[-1.73,.197,1.07]} size={[.174,.118,.15]} color="#b0bac1" metal={.71}/>
      <Box at={[-1.39,.181,1.0]} size={[.25,.058,.121]} color="#28343e"/>
      {[.83,1.18].map(z=><Box key={z} at={[-1.38,.176,z]} size={[.5,.055,.057]} color="#28343e"/>)}
      <Box at={[-.70,.118,1.022]} size={[.53,.099,.48]} color="#dfdbce"/>
      <Box at={[-.72,.189,.98]} size={[.35,.021,.023]} color="#aeb9bd" metal={.66}/>
      <Box at={[-.72,.199,.98]} size={[.15,.054,.052]} color="#bda278"/>
      <mesh position={[-.42,.258,1.09]}><sphereGeometry args={[.066,22,14]}/><meshStandardMaterial color={warm?'#ff784e':'#a0443f'} emissive="#ff5f39" emissiveIntensity={warm?2.15:0}/></mesh>
      {warm&&<pointLight position={[-.42,.329,1.12]} color="#ff8057" intensity={1.0} distance={.83}/>}
    </group>
    <Line points={[[.52,.36,.58],[.44,.32,.73],[.28,.18,.91],[-.47,.183,.87],[-1.27,.183,.83]]} color="#d9a35a" lineWidth={3}/>
    <Line points={[[.56,.36,.58],[.55,.32,.78],[.39,.17,1.10],[-.71,.177,1.18],[-1.40,.181,1.18]]} color="#35414a" lineWidth={2}/>
    <Line points={[[.48,.36,.58],[.40,.30,.78],[.18,.179,.99],[-.72,.189,.91],[-1.55,.183,.83]]} color="#b86253" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===0?[.56,.68+Math.sin(angle*Math.PI/180)*1.84,-1.03+Math.cos(angle*Math.PI/180)*1.74]:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.33} scale={5.2} far={1.4} resolution={128} frames={1}/>
  </>;
}
type Reading={temperature:number;peak:number;index:number;samples:{index:number;temperature:number}[]};
function initial(temperature=24):Reading{return {temperature,peak:temperature,index:0,samples:[{index:0,temperature}]};}
export default function SolarOvenMonitorDemo(){
  const [angle,setAngle]=useState(45);
  const [sun,setSun]=useState(100);
  const [closed,setClosed]=useState(true);
  const [running,run]=useState(false);
  const [reading,setReading]=useState(()=>initial());
  const [selected,select]=useState(0);
  const target=24+Math.round(sun/100*Math.max(0,1-Math.abs(angle-45)/45)*(closed?20:7));
  const warm=reading.temperature>=38;
  useEffect(()=>{
    if(!running||reading.temperature===target)return;
    const timer=window.setTimeout(()=>setReading(previous=>{
      const temperature=previous.temperature+Math.sign(target-previous.temperature);
      const index=previous.index+1;
      return {temperature,index,peak:Math.max(temperature,previous.peak),samples:[...previous.samples.slice(-119),{index,temperature}]};
    }),230);
    return ()=>window.clearTimeout(timer);
  },[running,reading.temperature,target]);

  function exportReadings(){
    const csv=['sample,collector_c',...reading.samples.map(({index,temperature})=>`${index},${temperature}`)].join('\n')+'\n';
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    const link=document.createElement('a');
    link.href=url;
    link.download='solar-oven-trial.csv';
    link.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),0);
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D solar oven model">
        <Canvas camera={{position:[2.59,3.49,6.58],fov:41}} dpr={[1,1.6]} fallback={<p>Compare the collector readings below.</p>}>
          <Collector {...{angle,sun,closed,warm,selected,select}}/><OrbitControls target={[0,.83,0]} enablePan={false} minDistance={3.8} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Solar oven readings">
        <div><span>Collector air</span><strong>{reading.temperature} °C</strong></div><div><span>Recorded peak</span><strong>{reading.peak} °C</strong></div><div><span>38 °C indicator</span><strong>{warm?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare reflector settings</h3>
      <label className="gp-home-light">Reflector angle <output>{angle}°</output><input type="range" aria-label="Reflector angle" min="10" max="85" value={angle} onChange={e=>setAngle(e.target.valueAsNumber)}/></label>
      <label className="gp-home-light">Available light <output>{sun}%</output><input type="range" aria-label="Available light" min="0" max="100" value={sun} onChange={e=>setSun(e.target.valueAsNumber)}/></label>
      <label className="gp-camera-check"><input type="checkbox" checked={closed} onChange={e=>setClosed(e.target.checked)}/> Close clear cover</label>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>run(!running)}>{running?'Pause trial':'Run trial'}</button>
        <button type="button" onClick={()=>setReading(previous=>initial(previous.temperature))}>Reset recorded peak</button>
        <button type="button" onClick={exportReadings}>Download trial CSV</button>
      </div>
      <p role="status">{running?(reading.temperature<target?'Collector warming.':reading.temperature>target?'Collector cooling.':'Collector steady.'):'Trial paused.'}</p>
      <p><strong>Recent samples</strong> {reading.samples.slice(-5).map(sample=>sample.temperature+' °C').join(' → ')}</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
