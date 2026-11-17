import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { WorldLabel } from './LabWorkbench';
import { PN532Shield, TagCard } from './RFIDDoorDemo';

type Point = [number, number, number];
type Tag = 'none' | 'plain' | 'A' | 'B';
const readouts = { A: '042A81C5176B80', B: '047DE2338A1180' };
const parts = [
  ['Microwave radar', 'Movement changes the reflected radio signal. The module produces digital transitions for the Uno to count.'],
  ['Ultrasonic module', 'The two transducers send sound and listen for its echo. With a good return, the Uno converts travel time to distance.'],
  ['PN532 reader and tag', 'The antenna reads a supported tag at close range. A plain card produces no identifier.'],
] as const;

function Block({ at, size, tint, metal = 0 }: { at: Point; size: Point; tint: string; metal?: number }) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.13} smoothness={3} receiveShadow castShadow>
    <meshStandardMaterial color={tint} metalness={metal} roughness={metal ? .34 : .63}/>
  </RoundedBox>;
}

export function MicrowaveBoard({ highlighted = false }: { highlighted?: boolean }) {
  return <>
    <Block at={[0,0,0]} size={[1.14,.079,.87]} tint={highlighted?'#387f73':'#256350'}/>
    <Block at={[0,.104,.045]} size={[.77,.136,.64]} tint="#b8c7ca" metal={.68}/>
    <Block at={[0,.178,.045]} size={[.36,.008,.27]} tint="#d9d9c9"/>
    {[-.46,.46].flatMap(x=>[-.325,.325].map(z=><mesh key={`${x}:${z}`} position={[x,.043,z]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.044,.065,18]}/><meshStandardMaterial color="#ac8d50" metalness={.53}/>
    </mesh>))}
    <Block at={[-.26,.076,-.355]} size={[.27,.075,.12]} tint="#e0dfcb"/>
    {[0,1,2].map(i=><Block key={i} at={[-.34+i*.08,.079,-.424]} size={[.031,.032,.054]} tint="#bca064" metal={.46}/>)}
  </>;
}

export function Sonar({ highlighted }: {highlighted:boolean}) {
  return <>
    <Block at={[0,.32,0]} size={[1.05,.46,.072]} tint={highlighted?'#426caa':'#285786'}/>
    {[-.29,.29].map(x=><group key={x} position={[x,.344,.083]} rotation={[Math.PI/2,0,0]}>
      <mesh><cylinderGeometry args={[.151,.151,.13,30]}/><meshStandardMaterial color="#c0c8cc" metalness={.67} roughness={.31}/></mesh>
      <mesh position={[0,-.067,0]}><cylinderGeometry args={[.109,.109,.008,25]}/><meshStandardMaterial color="#56616a" roughness={.9}/></mesh>
      <mesh position={[0,-.074,0]} rotation={[Math.PI/2,0,0]}><ringGeometry args={[.102,.129,24]}/><meshStandardMaterial color="#a5b0b4" side={2}/></mesh>
    </group>)}
    <Block at={[0,.22,.046]} size={[.13,.069,.055]} tint="#a6aaa4"/>
  </>;
}

function Bench({ running, moving, range, tag, selected, choose, labels }: {
  running:boolean; moving:boolean; range:number|null; tag:Tag; selected:number; choose:(value:number)=>void; labels:boolean;
}) {
  const radarTarget = useRef<Group>(null);
  const wave = useRef<Group>(null);
  const beam = useRef<Group>(null);
  useFrame(({clock})=>{
    if(radarTarget.current) radarTarget.current.position.x = -2.6 + (moving&&running ? Math.sin(clock.elapsedTime*2.7)*.39 : 0);
    if(beam.current) {
      const progress = clock.elapsedTime % .9 / .9;
      beam.current.position.z = -.65 + 1.85*progress;
      beam.current.scale.x = .65 + progress*.75;
    }
    if(wave.current) {
      const progress = clock.elapsedTime % 1.25 / 1.25;
      wave.current.position.z = -.85 + (range===null ? 2.2 : .37+range*.018)*(range===null ? progress : progress < .5 ? progress*2 : (1-progress)*2);
    }
  });
  const targets: Point[] = [[-2.61,.52,-.96],[.08,.40,-.91],[2.75,.33,-.93]];
  const tags: Point[] = [[-3.15,.98,-1.11],[.67,.93,-1.16],[3.28,.90,-1.18]];
  return <>
    <color attach="background" args={['#243747']}/>
    <ambientLight intensity={.63}/>
    <directionalLight intensity={2.4} position={[-4,8,5]} color="#fff1db"/>
    <directionalLight intensity={1.4} position={[5,4,-6]} color="#bce0ff"/>
    <Block at={[0,-.15,0]} size={[11,.29,8]} tint="#42535a"/>
    {[-2.61,.08,2.62].map((x,i)=><group key={x}>
      <Block at={[x,.042,.19]} size={[2.31,.063,3.52]} tint={['#425e63','#485a6e','#5d596c'][i]}/>
      <Block at={[x,.078,-1.29]} size={[2.21,.015,.055]} tint={['#a8b7a2','#acbed2','#c8b5cb'][i]}/>
    </group>)}
    <group position={[-2.61,.14,-.93]}><group rotation={[Math.PI/3,0,0]}><MicrowaveBoard highlighted={selected===0}/></group></group>
    {running&&<group ref={beam} position={[-2.61,.51,-.63]}>
      <Line points={[[-.38,0,0],[-.23,0,.10],[0,0,.16],[.23,0,.10],[.38,0,0]]} color="#ebbf79" transparent opacity={.77} lineWidth={1.75}/>
    </group>}
    <group ref={radarTarget} position={[-2.6,.19,1.20]}>
      <Block at={[0,0,0]} size={[.87,.20,.64]} tint="#59656b"/>
      <Block at={[0,.46,0]} size={[.68,.77,.087]} tint="#c9a664" metal={.29}/>
    </group>
    <group position={[.08,.09,-.92]}><Sonar highlighted={selected===1}/></group>
    {Array.from({length:7},(_,i)=><Block key={i} at={[.08,.083,-.56+i*.34]} size={[i%2?.45:1.19,.006,.014]} tint="#a2b3bd"/>)}
    {range!==null&&<group position={[.08,.115,-.48+range*.018]}>
      <Block at={[0,.28,0]} size={[.88,.57,.059]} tint="#dad1b5"/>
      <Block at={[0,0,.02]} size={[.50,.08,.36]} tint="#797d79"/>
    </group>}
    {running&&<group ref={wave} position={[0,.42,0]}>
      <Line points={[[-.39,0,0],[-.19,.05,.11],[.08,.07,.14],[.35,.05,.11],[.56,0,0]]} color="#8bdafd" lineWidth={1.9}/>
    </group>}
    <group position={[2.62,.18,-.94]}>
      <Block at={[0,-.055,0]} size={[2.09,.105,.99]} tint="#19648a"/>
      <Block at={[-1.015,-.005,-.27]} size={[.31,.18,.18]} tint="#b5c6ca" metal={.69}/>
      <PN532Shield selected={selected===2}/>
      {running&&(tag==='A'||tag==='B')&&<mesh position={[.55,.075,.02]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.41,.435,44]}/><meshBasicMaterial color="#7ce3cb" transparent opacity={.82} side={2}/>
      </mesh>}
      {tag==='plain'&&<Block at={[.55,.157,.02]} size={[.77,.044,.49]} tint="#d8c9a7"/>}
      {(tag==='A'||tag==='B')&&<group position={[.55,.157,.02]}><TagCard tag={tag}/></group>}
    </group>
    {['#c87762','#222d37','#7cc1a9','#529bce'].map((color,i)=><Line key={color}
      points={[[1.66+i*.055,.30,-.62],[1.34+i*.075,.22,-.31],[.82+i*.065,.125,-.19],[.43+i*.072,.20,-.85]]} color={color} lineWidth={1.8}/>)}
    {['#c87762','#222d37','#dab16e'].map((color,i)=><Line key={color}
      points={[[1.67+i*.07,.29,-1.29],[1.01+i*.04,.20,-1.67],[-.58,.12,-1.75+i*.078],[-2.83+i*.08,.18,-1.18]]} color={color} lineWidth={1.77}/>)}
    <ContactShadows position={[0,.003,0]} scale={11} opacity={.46} blur={2.8}/>
    {labels&&tags.map((point,i)=><group key={i}><Line points={[targets[i],point]} color={selected===i?'#ffe1a8':'#bbcdd7'} lineWidth={1.5}/>
      <WorldLabel position={point} className="gp-marker-anchor"><button type="button" aria-label={parts[i][0]} className="gp-marker" aria-pressed={i===selected} onClick={()=>choose(i)}>{i+1}</button></WorldLabel>
    </group>)}
  </>;
}

export default function DetectionBenchDemo() {
  const [running,setRunning]=useState(false);
  const [moving,setMoving]=useState(false);
  const [range,setRange]=useState<number|null>(40);
  const [tag,setTag]=useState<Tag>('none');
  const [selected,choose]=useState(0);
  const [labels,setLabels]=useState(true);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D radar sonar and RFID test bench">
        <Canvas dpr={[1,1.65]} camera={{position:[.95,6.7,8.0],fov:41}} fallback={<p>Run the three trials using the controls and the readings below.</p>}>
          <Bench running={running} moving={moving} range={range} tag={tag} selected={selected} choose={choose} labels={labels}/>
          <OrbitControls target={[0,.12,-.10]} minDistance={5.7} maxDistance={17} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Detection readings" aria-live="polite">
        <div><span>Radar</span><strong>{running ? moving ? 'Motion · 3 edges/s' : 'Still · 0 edges/s' : 'Waiting'}</strong></div>
        <div><span>Ultrasonic</span><strong>{running ? range===null ? 'No echo' : `${range} cm` : 'Waiting'}</strong></div>
        <div><span>RFID</span><strong>{running ? tag==='A'||tag==='B' ? readouts[tag] : 'No tag ID' : 'Waiting'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Change one target at a time</h3>
      <p>Run the bench, then try motion, measured distance and tag identity separately. Radar uses example edge counts and the radio and sound travel are visualized.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setRunning(value=>!value)}>{running?'Stop bench':'Run bench'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <h4>Radar target</h4>
      <div className="gp-steps"><button type="button" aria-pressed={moving} onClick={()=>{setMoving(value=>!value);choose(0);}}>{moving?'Stop target motion':'Move radar target'}</button></div>
      <h4>Sonar target</h4>
      <div className="gp-steps">
        {[40,80,null].map(value=><button type="button" key={value??'none'} aria-pressed={range===value} onClick={()=>{setRange(value);choose(1);}}>{value===null?'Remove obstacle':`Obstacle at ${value} cm`}</button>)}
      </div>
      <h4>RFID target</h4>
      <div className="gp-steps">
        {(['A','B','plain','none'] as const).map(value=><button type="button" key={value} aria-pressed={tag===value} onClick={()=>{setTag(value);choose(2);}}>{value==='none'?'Clear antenna':value==='plain'?'Plain card':`Tag ${value}`}</button>)}
      </div>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>choose(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
