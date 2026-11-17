import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils } from 'three';
import { recyclingTypes } from '../data/recycling-vending';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { ColorBreakout } from './RecyclingVendingParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Sample={kind:number;ms:number;jam:boolean};
type Run={sample:Sample|null;last:number|null;counts:number[];points:number;locked:boolean;message:string};
const initial:Run={sample:null,last:null,counts:[0,0,0],points:0,locked:false,message:'Choose a sample and insert it.'};
const labels=[
  ['Intake beam','This starts one sorting cycle when an item reaches the reading chamber.'],
  ['RGB reader','Fixed white illumination lets the sensor compare the blue and green tag readings. Other tags go to Return.'],
  ['Servo diverter','The diverter points to the chosen path before the hold gate releases the item.'],
  ['Exit confirmation','A break at the selected exit confirms the drop. Only confirmed bottle and can exits award a point.'],
] as const;
const laneX=(i:number)=>[-1.97,-.71,.55][i];
function Item({kind,at,turn=0}:{kind:number;at:Point;turn?:number}){
  const {color,shape}=recyclingTypes[kind];
  return <group position={at} rotation={[0,0,turn]}>
    <mesh><cylinderGeometry args={[.135,.135,.44,28]}/>
      <meshStandardMaterial color={shape==='bottle'?'#bad0d4':color} metalness={shape==='bottle'?.08:.47} roughness={.39}/>
    </mesh>
    {shape==='bottle'&&<>
      <mesh position={[0,.247,0]}><cylinderGeometry args={[.070,.127,.096,22]}/><meshStandardMaterial color="#c3d5d7"/></mesh>
      <mesh position={[0,.318,0]}><cylinderGeometry args={[.066,.067,.043,20]}/><meshStandardMaterial color="#305779"/></mesh>
    </>}
    {shape==='can'&&[-.227,.227].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.136,.136,.018,26]}/><meshStandardMaterial color="#aeb8bc" metalness={.66}/></mesh>)}
    <mesh><cylinderGeometry args={[.137,.137,.172,28]}/><meshStandardMaterial color={color} roughness={.68}/></mesh>
  </group>;
}
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-pressed={selected===i} aria-label={labels[i][0]} onClick={()=>select(i)}>
      {i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}
    </button>
  </WorldLabel>;
}
function Sorter({run,selected,select,markers,chosen}:{run:Run;selected:number;select:(i:number)=>void;markers:boolean;chosen:number}){
  const sample=run.sample;
  const phase=sample?.ms??0;
  const route=sample?.kind??run.last??2;
  const align=phase>=280||!sample;
  const exit=phase>880&&phase<1220&&!sample?.jam;
  const progress=MathUtils.clamp((phase-650)/580,0,1);
  const x=MathUtils.lerp(-.71,laneX(route),progress);
  const y=phase<220?MathUtils.lerp(2.72,1.61,phase/220):
    sample?.jam?MathUtils.lerp(1.61,1.22,progress):MathUtils.lerp(1.61,.45,progress);
  const mark=(i:number,at:Point)=>markers?<Marker {...{i,at,selected,select}}/>:null;
  return <>
    <color attach="background" args={['#263548']}/>
    <hemisphereLight args={['#e4efff','#675747',2.43]}/>
    <directionalLight position={[-4,7,6]} intensity={2.36}/>
    <Box at={[0,-.13,0]} size={[6.29,.24,4.03]} color="#526c75"/>
    <Box at={[-.72,.115,-.28]} size={[3.92,.22,1.52]} color="#3e505d"/>
    <Box at={[-.71,1.32,-.99]} size={[3.90,2.43,.09]} color="#97795e"/>
    <Box at={[-.71,2.50,-.45]} size={[1.54,.15,1.04]} color="#b89c7a"/>
    <Box at={[-.71,2.24,-.29]} size={[1.13,.13,.73]} color="#667779"/>
    {[-1.24,-.18].map(x=><Box key={x} at={[x,1.95,-.50]} size={[.11,.96,.79]} color="#a78a6e"/>)}
    {[-.95,-.47].map(x=><Box key={x} at={[x,2.17,.14]} size={[.11,.155,.15]} color={selected===0?'#d5af5f':'#2b3c44'}/>)}
    <Line points={[[-.94,2.17,.22],[-.47,2.17,.22]]} color={sample&&phase<220?'#ec8b61':'#69abb9'} lineWidth={2} dashed dashSize={.04} gapSize={.026}/>
    {mark(0,[-1.15,2.50,.27])}
    <group position={[-.21,1.93,-.03]} rotation={[Math.PI/2,0,0]} onClick={()=>select(1)}><ColorBreakout selected={selected===1}/></group>
    {sample&&phase<300&&<pointLight position={[-.30,1.80,.20]} color="#fff1c4" intensity={2} distance={.7}/>}
    {mark(1,[-.07,2.15,.20])}
    <group position={[-.71,1.48,.02]} rotation={[.20,0,align?(route-1)*.55:0]} onClick={()=>select(2)}>
      <Box at={[0,0,0]} size={[.84,.09,.63]} color={selected===2?'#e1bb71':'#547988'} metal={.37}/>
    </group>
    {mark(2,[-.68,1.45,.68])}
    {recyclingTypes.map(({color,route:label},i)=><group key={label} position={[laneX(i),0,.19]}>
      <Box at={[0,.27,0]} size={[1.03,.11,.85]} color="#354958"/>
      {[-.49,.49].map(x=><Box key={x} at={[x,.478,0]} size={[.09,.41,.85]} color={color}/>)}
      <Box at={[0,.386,.48]} size={[1.02,.205,.077]} color={color}/>
      <Box at={[0,.555,-.214]} size={[.82,.06,.48]} color="#a88964"/>
      <Box at={[-.34,.77,.03]} size={[.115,.18,.16]} color={i===route&&exit?'#dc986e':'#293542'}/>
      <Box at={[.34,.77,.03]} size={[.115,.18,.16]} color="#293542"/>
      <Line points={[[-.32,.77,.04],[.31,.77,.04]]} color={exit&&i===route?'#e58d65':'#72afbb'} lineWidth={1.8} dashed dashSize={.06} gapSize={.045}/>
      {run.counts[i]>0&&<Item at={[.05,.50,.28]} kind={i} turn={Math.PI/2}/>}
    </group>)}
    {mark(3,[.61,.97,.46])}
    {sample&&<Item at={[x,y,.11+progress*.16]} kind={sample.kind} turn={progress*Math.PI/2}/>}
    <group position={[1.72,.081,-.47]} scale={1.46}><Uno at={[0,0,0]}/></group>
    <Item kind={chosen} at={[1.70,.285,.74]}/>
    <Box at={[1.70,.035,.74]} size={[.79,.09,.71]} color="#647989"/>
    <Line points={[[.21,1.86,-.12],[.52,.11,-.46],[1.27,.34,-.10]]} color="#d49b64" lineWidth={3}/>
    <Line points={[[.70,.70,.10],[1.09,.13,.20],[1.58,.26,-.10]]} color="#71adbf" lineWidth={2.7}/>
  </>;
}
function tick(run:Run):Run{
  if(!run.sample)return run;
  const sample={...run.sample,ms:run.sample.ms+40};
  if(sample.jam&&sample.ms>=2350)return {...run,sample:null,locked:true,message:'No exit confirmation · Sorting locked'};
  if(!sample.jam&&sample.ms>=1240){
    return {...run,sample:null,last:sample.kind,counts:run.counts.map((value,i)=>i===sample.kind?value+1:value),
      points:run.points+(sample.kind===2?0:1),message:sample.kind===2?'Returned · No point':'Exit confirmed · One point'};
  }
  return {...run,sample,message:sample.ms>=650?'Waiting for the selected exit':sample.ms>=280?'Diverter aligning':'Reading the color tag'};
}
export default function RecyclingVendingDemo(){
  const [run,setRun]=useState<Run>(initial);
  const [chosen,setChosen]=useState(0);
  const [jam,setJam]=useState(false);
  const [selected,select]=useState(0);
  const [markers,setMarkers]=useState(true);
  const busy=!!run.sample;
  useEffect(()=>{
    if(!busy)return;
    const timer=window.setInterval(()=>setRun(tick),40);
    return ()=>window.clearInterval(timer);
  },[busy]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D recycling vending station">
        <Canvas camera={{position:[3.7,4.6,7.5],fov:42}} dpr={[1,1.6]} fallback={<p>Use the sample controls and readouts to test sorting.</p>}>
          <Sorter {...{run,selected,select,markers,chosen}}/>
          <OrbitControls target={[0,.91,.07]} minDistance={4.9} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Sorting readouts">
        <div><span>Bottles</span><strong>{run.counts[0]}</strong></div>
        <div><span>Cans</span><strong>{run.counts[1]}</strong></div>
        <div><span>Returned</span><strong>{run.counts[2]}</strong></div>
        <div><span>Points</span><strong>{run.points}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Return one sample at a time</h3>
      <p>Choose a sample and inspect its route. The machine gives a point after the correct bin confirms a tagged sample. Try an untagged sample and a jam.</p>
      <div className="gp-steps" role="group" aria-label="Sorting samples">
        {recyclingTypes.map(({name},i)=><button key={name} type="button" aria-pressed={chosen===i} disabled={busy} onClick={()=>setChosen(i)}>{name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={busy||run.locked} onClick={()=>setRun({...run,sample:{kind:chosen,ms:0,jam},message:'Reading the color tag'})}>Insert sample</button>
        <button type="button" aria-pressed={jam} disabled={busy||run.locked} onClick={()=>setJam(!jam)}>Simulate jam</button>
        <button type="button" onClick={()=>{setRun(initial);setJam(false);}}>Reset sorter</button>
        <button type="button" aria-pressed={markers} onClick={()=>setMarkers(!markers)}>Scene labels</button>
      </div>
      <p role="status" className="gp-demo-description">{run.message}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
