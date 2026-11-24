import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls } from '@react-three/drei';
import { Group } from 'three';
import { ChevronLeft, ChevronRight, Layers, Pause, Play, RotateCcw, StepForward } from 'lucide-react';
import { Breadboard } from './RoomClimateWorkshop';
import { Mount, Uno, Wire } from './RoverWorkshopModel';
import { Resistor } from './NightLightWorkshop';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { WorldLabel } from './LabWorkbench';
import '../styles/rover-workshop.css';
import '../styles/traffic-signal-workshop.css';
type Point = [
    number,
    number,
    number
];
type Phase = 'Red' | 'Green' | 'Amber';
type Part = 'road' | 'mast' | 'red' | 'amber' | 'green' | 'resistors' | 'uno' | 'wires';
const lamps = [{ id: 'red' as const, name: 'Red', color: '#d84737', y: 2.06, pin: 8 }, { id: 'amber' as const, name: 'Amber', color: '#e3a83d', y: 1.73, pin: 9 }, { id: 'green' as const, name: 'Green', color: '#4cae72', y: 1.40, pin: 10 }];
const parts: {
    id: Part;
    name: string;
    purpose: string;
    connection: string;
}[] = [
    { id: 'road', name: 'Model road and stop line', purpose: 'Shows where a model vehicle would wait while the red lamp is on.', connection: 'Place the signal upright beside the road, facing the stop line.' },
    { id: 'mast', name: 'Signal head and mast', purpose: 'Keeps the three LEDs separate and places them in the familiar red, amber, green order.', connection: 'The head mounts on the mast. Each lamp has an independent pair of leads behind the face.' },
    { id: 'red', name: 'Upper red LED · D8', purpose: 'Lights for the first three seconds of each cycle.', connection: 'D8 → its own 330 Ω resistor → red anode. Red cathode → shared ground.' },
    { id: 'amber', name: 'Middle amber LED · D9', purpose: 'Lights for one second after green and before the next red phase.', connection: 'D9 → its own 330 Ω resistor → amber anode. Amber cathode → shared ground.' },
    { id: 'green', name: 'Lower green LED · D10', purpose: 'Lights for three seconds after red.', connection: 'D10 → its own 330 Ω resistor → green anode. Green cathode → shared ground.' },
    { id: 'resistors', name: 'Three separate 330 Ω resistors', purpose: 'Each lamp has its own current-limited output path.', connection: 'One resistor per LED anode. The outputs do not share one terminal row.' },
    { id: 'uno', name: 'Arduino Uno timer', purpose: 'Runs a seven-second cycle: red 3 s, green 3 s, amber 1 s.', connection: 'D8, D9 and D10 drive the three branches. USB powers the Uno and GND provides the shared return.' },
    { id: 'wires', name: 'Three outputs and shared return', purpose: 'Carries each independent lamp command while returning the cathode current to ground.', connection: 'Trace each colored anode lead through its resistor. The three dark cathode leads join the Uno GND return.' },
];
const steps: {
    title: string;
    part: Part;
    text: string;
    check: string;
}[] = [
    { title: 'Road', part: 'road', text: 'Mark a miniature roadway and a white stop line. Position the head so its face is visible from the approaching lane.', check: 'The signal faces the model stop line.' },
    { title: 'Mast', part: 'mast', text: 'Build an upright mast and three-hole card head. Leave space behind the face for six separate LED leads.', check: 'The support stays stable and the three lamp holes remain separate.' },
    { title: 'Lamps', part: 'red', text: 'Fit red at the top, amber in the middle and green at the bottom. Identify the shorter cathode before fixing each lamp.', check: 'The six leads do not touch each other.' },
    { title: 'Resistors', part: 'resistors', text: 'Place three 330 Ω resistors on separate breadboard rows. Each resistor will supply one LED anode.', check: 'Each LED has its own resistor.' },
    { title: 'Controller', part: 'uno', text: 'Mount the Uno beside the board with its USB socket accessible. Keep power off while connecting outputs.', check: 'D8, D9, D10 and GND are identifiable.' },
    { title: 'Wiring', part: 'wires', text: 'Wire D8 to red, D9 to amber and D10 to green, each through its resistor. Join the cathodes to the shared GND rail.', check: 'No two output pins share one connected row.' },
    { title: 'Inspect', part: 'resistors', text: 'Trace all three paths from output pin through resistor and LED, back to ground. Follow the shorter cathode lead on each branch.', check: 'The red, amber and green branches are independent.' },
    { title: 'Operate', part: 'red', text: 'Run the timer or advance one second at a time. Compare the live output states with the illuminated lamp.', check: 'Red lasts 3 s, green 3 s, amber 1 s. Exactly one LED is on at a time.' },
];
function SignalScene({ step, phase, selected, select, explode }: {
    step: number;
    phase: Phase;
    selected: Part;
    select: (part: Part) => void;
    explode: boolean;
}) {
    const lenses = useRef<Group>(null);
    useFrame((_, dt) => { if (lenses.current)
        lenses.current.position.z += ((explode ? .48 : 0) - lenses.current.position.z) * Math.min(dt * 7, 1); });
    const choose = (part: Part) => (event: {
        stopPropagation: () => void;
    }) => { event.stopPropagation(); select(part); };
    const anchors: Record<Part, Point> = { road: [-1.25, .42, .8], mast: [-1.66, 2.48, -.8], red: [-1.66, 2.40, -.33], amber: [-1.66, 2.05, -.33], green: [-1.66, 1.70, -.33], resistors: [.53, .62, .64], uno: [1.50, .58, -.68], wires: [-.30, .88, -.18] };
    return <>
  <group onClick={choose('road')}>
   <Box at={[-1.23, .028, .48]} size={[1.15, .045, 2.76]} color={selected === 'road' ? '#a58ac3' : '#536273'}/>
   <Box at={[-1.23, .056, .33]} size={[1.04, .008, .09]} color='#e9e6d9'/>
   {[-.50, .03, .90, 1.43].map(z => <Box key={z} at={[-1.23, .057, z]} size={[.026, .008, .23]} color='#e3d9b8'/>)}
  </group>
  {step >= 1 && <Mount from={[0, .8, 0]}><group onClick={choose('mast')}>
   <Box at={[-1.66, .12, -.8]} size={[.49, .23, .54]} color='#515e6e' metal={.45}/><Box at={[-1.66, .73, -.8]} size={[.075, 1.15, .075]} color='#9ca8b3' metal={.7}/>
   <Box at={[-1.66, 1.73, -.8]} size={[.47, 1.14, .20]} color={selected === 'mast' ? '#b28bd6' : '#393f49'}/><Box at={[-1.66, 1.73, -.683]} size={[.40, 1.08, .045]} color='#252c33'/>
   {[-.17, .17].flatMap(x => [1.23, 2.23].map(y => <mesh key={`${x},${y}`} position={[-1.66 + x, y, -.65]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.018, .018, .015, 6]}/><meshStandardMaterial color='#b2bbc1' metalness={.8}/></mesh>))}
  </group></Mount>}
  {step >= 2 && <group ref={lenses}>{lamps.map((lamp, index) => <Mount key={lamp.id} from={[0, 0, .6]} delay={index * .18}>
   <group position={[-1.66, lamp.y, -.62]} onClick={choose(lamp.id)}>
    <mesh castShadow><torusGeometry args={[.135, .023, 10, 40]}/><meshStandardMaterial color='#1d252e' roughness={.56}/></mesh>
    <mesh name={`traffic-${lamp.id}-lens`} position={[0, 0, .018]} castShadow><sphereGeometry args={[.112, 32, 24]}/><meshPhysicalMaterial color={selected === lamp.id ? '#b583df' : lamp.color} roughness={.20} clearcoat={1} emissive={step >= 5 && phase === lamp.name ? lamp.color : '#000'} emissiveIntensity={step >= 5 && phase === lamp.name ? 2 : 0}/></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .018, .09]} castShadow><cylinderGeometry args={[.145, .145, .18, 32, 1, true, Math.PI / 2, Math.PI]}/><meshStandardMaterial color='#27313c' roughness={.59} side={2}/></mesh>
    {step >= 5 && phase === lamp.name && <pointLight position={[0, 0, .19]} intensity={.16} distance={.65} color={lamp.color}/>}
   </group>
  </Mount>)}</group>}
  {step >= 3 && <Mount from={[0, .5, 0]}><group position={[.53, .17, .54]} onClick={choose('resistors')}><Breadboard active={selected === 'resistors'}/></group>
   {lamps.map((lamp, index) => <group key={lamp.id} onClick={choose('resistors')}><Resistor at={[.03 + index * .50, .30, .62]} colors={['#da7a37', '#da7a37', '#76503a', '#c0a25b']} selected={selected === 'resistors'}/></group>)}
  </Mount>}
  {step >= 4 && <Mount from={[.6, .25, 0]}><group position={[1.50, .15, -.68]} onClick={choose('uno')}><Uno active={selected === 'uno'}/></group><Box at={[1.31, .24, -1.22]} size={[.18, .10, .18]} color='#334151'/><Wire points={[[1.31, .24, -1.31], [1.26, .13, -1.53], [.61, .07, -1.62], [.39, .05, -1.88]]} color='#4c6f94' connectors={false} width={4}/></Mount>}
  {step >= 5 && <group onClick={choose('wires')}>
   {lamps.map((lamp, index) => {
                const x = .03 + index * .5;
                return <group key={lamp.id}>
     <Wire points={[[1.18, .25, -.88 + index * .10], [1.01, .40, -.27], [x - .17, .33, .22], [x - .14, .30, .62]]} color={selected === 'wires' ? '#be87ea' : lamp.color} width={2.4}/>
     <Wire points={[[x + .14, .30, .62], [x + .24, .23, .30], [-1.42, .20, -.67], [-1.55, .90, -.72], [-1.61, lamp.y, -.64]]} color={selected === 'wires' ? '#be87ea' : lamp.color} width={2.4}/>
     <Wire points={[[-1.71, lamp.y, -.64], [-1.77, .95, -.76], [-1.74, .20, -.60], [-.44, .25, 1.09]]} color={selected === 'wires' ? '#be87ea' : '#303a44'} width={2.1}/>
    </group>;
            })}
   <Wire points={[[-.44, .25, 1.09], [1.86, .14, 1.24], [1.92, .19, -.42], [1.18, .24, -.42]]} color={selected === 'wires' ? '#be87ea' : '#303a44'} width={2.6}/>
  </group>}
  <WorldLabel position={anchors[selected]} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part => part.id === selected)?.name}<small>{selected === 'red' ? 'D8 · red · 3 seconds' : selected === 'amber' ? 'D9 · amber · 1 second' : selected === 'green' ? 'D10 · green · 3 seconds' : 'Select to trace the physical connection'}</small></span></WorldLabel>
 </>;
}
export default function TrafficSignalWorkshop() {
    const [step, setStep] = useState(0), [selected, select] = useState<Part>('road'), [replay, setReplay] = useState(0), [explode, setExplode] = useState(false);
    const [running, setRunning] = useState(false), [elapsed, setElapsed] = useState(0);
    const time = useRef(0);
    useEffect(() => {
        if (!running)
            return;
        let frame: number, last = performance.now();
        function tick(now: number) { time.current += Math.min((now - last) / 1000, .1); last = now; setElapsed(time.current); frame = requestAnimationFrame(tick); }
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [running]);
    const t = elapsed % 7;
    const phase: Phase = t < 3 ? 'Red' : t < 6 ? 'Green' : 'Amber';
    const remaining = (t < 3 ? 3 : t < 6 ? 6 : 7) - t;
    const part = parts.find(item => item.id === selected)!;
    const available = parts.filter(item => ({ road: 0, mast: 1, red: 2, amber: 2, green: 2, resistors: 3, uno: 4, wires: 5 })[item.id] <= step);
    function stage(index: number) { setRunning(false); setStep(index); select(steps[index].part); setExplode(false); }
    function reset() { setRunning(false); time.current = 0; setElapsed(0); }
    return <div className='rw-workshop tw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Three-output timer workshop</p><h3>Wire three lamps. Follow one timer.</h3><p>Assemble a miniature signal and compare each live output with the red, green and amber phases.</p></div><span className='rw-chip'>Arduino Uno · D8 / D9 / D10</span></div>
  <div className='rw-layout'>
   <div className='rw-view'>
    <div className='rw-view-top'><span><i />{step === 7 ? 'Traffic signal test bench' : 'Signal assembly bench'}</span><div><button type='button' onClick={() => setReplay(value => value + 1)}><RotateCcw size={15}/>Replay assembly</button>{step >= 2 && <button type='button' aria-pressed={explode} onClick={() => setExplode(!explode)}><Layers size={15}/>{explode ? 'Assembled' : 'Exploded lenses'}</button>}</div></div>
    <div className='rw-canvas' role='region' aria-label='Traffic signal 3D workshop'>
     <Canvas shadows dpr={[1, 1.6]} camera={{ position: [3.1, 3.4, 6.5], fov: 40 }} fallback={<p>WebGL is required for the signal workbench.</p>}>
      <color attach='background' args={['#edf0f8']}/><hemisphereLight args={['#fff1db', '#788099', 2.1]}/><directionalLight position={[-3, 7, 5]} color='#fff0dc' intensity={2.8} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.025, 0]} receiveShadow><planeGeometry args={[40, 40]}/><meshStandardMaterial color='#e3e6ef' roughness={.87}/></mesh><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .001, 0]} receiveShadow><planeGeometry args={[4.7, 3.9]}/><meshStandardMaterial color='#69778d' roughness={.83}/></mesh><Grid args={[4.7, 3.9]} position={[0, .005, 0]} cellSize={.2} sectionSize={1} cellColor='#a2adc0' sectionColor='#c1cbd9' cellThickness={.4} sectionThickness={.7} fadeDistance={13}/>
      <SignalScene key={replay} {...{ step, phase, selected, select, explode }}/><ContactShadows position={[0, .009, 0]} opacity={.29} scale={5.2} far={2.4} resolution={256} frames={1}/><OrbitControls target={[0, .84, .1]} enablePan={false} minDistance={3.6} maxDistance={11} maxPolarAngle={Math.PI / 2 - .05}/>
     </Canvas>
    </div>
    <div className='rw-view-footer'><span>Drag to orbit · Select a lamp, resistor bank or wire</span><span>{step + 1} / {steps.length}</span></div>
    <nav className='rw-build-strip' aria-label='Traffic signal assembly stages'>{steps.map((item, index) => <button type='button' key={item.title} aria-current={step === index ? 'step' : undefined} onClick={() => stage(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</nav>
   </div>
   <aside className='rw-panel'>
    <div className='rw-panel-title'><span>{step + 1}</span><div><p className='rw-eyebrow'>{step === 7 ? 'Time & verify' : 'Assemble & inspect'}</p><h4>{steps[step].title}</h4></div></div><p>{steps[step].text}</p>
    {step === 7 && <>
     <div className='tw-readings' aria-label='Traffic signal readings'><div><span>Current phase</span><strong>{phase}</strong></div><div><span>Remaining</span><strong>{remaining.toFixed(1)} s</strong></div><div><span>Full cycles</span><strong>{Math.floor(elapsed / 7)}</strong></div></div>
     <div className='tw-timeline' aria-label='Seven-second signal timeline'><span data-active={phase === 'Red'} style={{ flex: 3 }}>Red · 3 s</span><span data-active={phase === 'Green'} style={{ flex: 3 }}>Green · 3 s</span><span data-active={phase === 'Amber'} style={{ flex: 1 }}>Amber · 1 s</span></div>
     <div className='rw-run'><button type='button' className='rw-primary' onClick={() => setRunning(!running)}>{running ? <Pause size={15}/> : <Play size={15}/>} {running ? 'Pause timer' : 'Run timer'}</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset</button></div>
     <div className='rw-step-actions'><button type='button' onClick={() => { setRunning(false); time.current += 1; setElapsed(time.current); }}><StepForward size={15}/>Advance 1 second</button><button type='button' onClick={reset}>Hold red</button></div>
     <div className='tw-outputs' aria-label='Live lamp output pins'>{lamps.map(lamp => <div key={lamp.id} data-active={phase === lamp.name}><i style={{ background: phase === lamp.name ? lamp.color : '#d8d3e3' }}/><span>D{lamp.pin} · {lamp.name}</span><strong>{phase === lamp.name ? 'HIGH' : 'LOW'}</strong></div>)}</div>
     <div className='rw-explain' role='status'><strong>{phase === 'Red' ? 'Stop · red output only.' : phase === 'Green' ? 'Go · green output only.' : 'Amber · prepare for the next red phase.'}</strong><p>The timer activates one output at a time. The 3 + 3 + 1 second sequence repeats every seven seconds.</p></div><p className='tw-note'>This tabletop model demonstrates a timed sequence. It uses the same lamp order and durations as the guide’s Arduino sketch.</p>
    </>}
    <div className='rw-inspect'><p className='rw-eyebrow'>Inspect each lamp branch</p><div className='rw-part-list' role='group' aria-label='Inspect traffic signal parts'>{available.map(item => <button type='button' key={item.id} aria-pressed={selected === item.id} onClick={() => select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
    <div className='rw-check'><p>{steps[step].check}</p></div>
    {step < 7 && <div className='rw-step-actions'><button type='button' disabled={step === 0} onClick={() => stage(step - 1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' onClick={() => stage(step + 1)}>{step === 6 ? 'Run the sequence' : 'Next step'}<ChevronRight size={15}/></button></div>}
   </aside>
  </div>
 </div>;
}
