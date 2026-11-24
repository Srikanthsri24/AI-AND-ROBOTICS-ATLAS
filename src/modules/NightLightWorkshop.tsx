import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Grid, Line, OrbitControls } from '@react-three/drei';
import { Group } from 'three';
import { ChevronLeft, ChevronRight, Layers, Play, RotateCcw } from 'lucide-react';
import { Breadboard } from './RoomClimateWorkshop';
import { Mount, Uno, Wire } from './RoverWorkshopModel';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { WorldLabel } from './LabWorkbench';
import '../styles/rover-workshop.css';
import '../styles/night-light-workshop.css';
type Point = [
    number,
    number,
    number
];
type Part = 'board' | 'ldr' | 'divider' | 'uno' | 'resistor' | 'lamp' | 'shield' | 'wires' | 'cover';
const parts: {
    id: Part;
    name: string;
    purpose: string;
    connection: string;
}[] = [
    { id: 'board', name: 'Breadboard and power rails', purpose: 'Holds the divider and keeps supply and ground separate.', connection: 'The photoresistor and 10 kΩ resistor meet at one analog junction. The power rails provide 5 V and GND.' },
    { id: 'ldr', name: 'Photoresistor sensing disc', purpose: 'Its resistance increases when shaded. The visible track is the light-sensitive pattern.', connection: 'One leg connects to 5 V. The other connects to the A0 junction at the top of the 10 kΩ resistor.' },
    { id: 'divider', name: '10 kΩ resistor and A0 junction', purpose: 'Converts the photoresistor’s resistance into a voltage. In this arrangement brighter light gives a higher A0 reading.', connection: '5 V → photoresistor → A0 junction → 10 kΩ resistor → GND.' },
    { id: 'uno', name: 'Arduino Uno controller', purpose: 'Samples A0 and remembers the lamp state between 360 and 460 counts.', connection: 'A0 receives the divider voltage. D8 drives the lamp. The controller and indicator share ground.' },
    { id: 'resistor', name: '330 Ω lamp resistor', purpose: 'Limits the LED current while the lamp output is HIGH.', connection: 'Uno D8 → 330 Ω resistor → LED anode. The cathode returns to GND.' },
    { id: 'lamp', name: 'Diffused LED night light', purpose: 'Turns on at or below 360 counts and turns off at or above 460.', connection: 'The LED is powered from D8 through its resistor. The diffuser spreads its light around the model room.' },
    { id: 'shield', name: 'Light-isolating card shield', purpose: 'Stops the lamp from shining back onto its own sensor.', connection: 'Place it between the lamp and photoresistor while leaving the sensor exposed to ambient light.' },
    { id: 'cover', name: 'Movable shade card', purpose: 'Blocks ambient light so you can record a shaded reference.', connection: 'This is a measurement aid. Move it over the sensing disc, then remove it to restore ambient light.' },
    { id: 'wires', name: 'Divider and lamp connections', purpose: 'Carries the sensor voltage and drives the indicator through a separate output path.', connection: 'Red → 5 V, black → GND, yellow → A0, orange → D8 through the series resistor.' },
];
const steps: {
    title: string;
    part: Part;
    text: string;
    check: string;
}[] = [
    { title: 'Base', part: 'board', text: 'Start with the breadboard and identify the terminal rows, supply rail and ground rail.', check: 'Supply and ground occupy separate rails.' },
    { title: 'Sensor', part: 'ldr', text: 'Fit the photoresistor with both legs in separate rows. Leave the sensing face exposed to room light.', check: 'The two legs are not joined by one breadboard terminal row.' },
    { title: 'Divider', part: 'divider', text: 'Join one photoresistor leg to 5 V. Connect its other leg to a 10 kΩ resistor that returns to GND.', check: 'The junction between the components is the voltage measurement point.' },
    { title: 'Controller', part: 'uno', text: 'Connect the divider junction to A0. Join the Uno 5 V and GND to the matching breadboard rails.', check: 'A0 measures the divider junction, rather than a supply rail.' },
    { title: 'Lamp', part: 'resistor', text: 'Connect D8 through 330 Ω to the lamp anode. Run the cathode back to ground.', check: 'The LED has its own series current-limiting resistor.' },
    { title: 'Shield', part: 'shield', text: 'Place a card shield between the lamp and sensor. It should block the lamp without covering the sensor’s ambient view.', check: 'The lamp cannot illuminate its own photoresistor.' },
    { title: 'Measure', part: 'ldr', text: 'Record a bright reading and a shaded reading. Check that the 360 and 460 switch points lie inside that measured range.', check: 'Shading lowers A0. Bright light raises it.' },
    { title: 'Operate', part: 'lamp', text: 'Move through dusk in both directions. Pause between 360 and 460 to observe state retention, then remove the shield to test feedback.', check: 'A0 at 410 can leave the lamp on or off depending on the previous threshold crossing.' },
];
export function Resistor({ at, colors, selected }: {
    at: Point;
    colors: string[];
    selected: boolean;
}) {
    return <group position={at} rotation={[0, 0, Math.PI / 2]}>
  <mesh castShadow><cylinderGeometry args={[.043, .043, .28, 20]}/><meshStandardMaterial color={selected ? '#b38ad9' : '#d1b989'} roughness={.68}/></mesh>
  {colors.map((color, index) => <mesh key={index} position={[0, (index - 1.5) * .05, 0]}><cylinderGeometry args={[.044, .044, .017, 20]}/><meshStandardMaterial color={color}/></mesh>)}
 </group>;
}
function LightScene({ step, raw, lit, covered, shielded, selected, select, explode }: {
    step: number;
    raw: number;
    lit: boolean;
    covered: boolean;
    shielded: boolean;
    selected: Part;
    select: (part: Part) => void;
    explode: boolean;
}) {
    const shield = useRef<Group>(null), cover = useRef<Group>(null), sensor = useRef<Group>(null);
    useFrame((_, dt) => {
        if (shield.current)
            shield.current.position.z += ((shielded ? 0 : -1.45) - shield.current.position.z) * Math.min(dt * 7, 1);
        if (cover.current) {
            cover.current.position.y += ((covered ? 0 : -.21) - cover.current.position.y) * Math.min(dt * 7, 1);
            cover.current.position.x += ((covered ? 0 : -.50) - cover.current.position.x) * Math.min(dt * 7, 1);
        }
        if (sensor.current)
            sensor.current.position.y += ((explode ? .65 : 0) - sensor.current.position.y) * Math.min(dt * 7, 1);
    });
    const choose = (part: Part) => (event: {
        stopPropagation: () => void;
    }) => { event.stopPropagation(); select(part); };
    const anchors: Record<Part, Point> = { board: [-.80, .62, .49], ldr: [-1.35, .95, .35], divider: [-.62, .57, .42], uno: [.72, .52, 1.05], resistor: [.04, .57, .70], lamp: [1.35, 1.88, -.31], shield: [.25, 1.45, -.3], cover: [covered ? -1.35 : -1.85, covered ? 1.04 : .83, .5], wires: [.15, .61, .95] };
    const daylight = .35 + raw / 1023 * 1.4;
    return <>
  <color attach='background' args={[raw < 360 ? '#d8dceb' : '#eef0f8']}/>
  <hemisphereLight args={['#fff1da', '#6b7590', daylight]}/><directionalLight position={[-4, 7, 4]} color='#fff1df' intensity={daylight + 1.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.025, 0]} receiveShadow><planeGeometry args={[40, 40]}/><meshStandardMaterial color='#e0e3ed' roughness={.87}/></mesh>
  <Box at={[0, .04, -1.02]} size={[4.5, .10, .11]} color='#a1a7b7'/><Box at={[0, 1.02, -1.10]} size={[4.5, 1.96, .09]} color='#d8dbe4'/>
  <Box at={[-1.24, 1.35, -1.04]} size={[1.18, .86, .06]} color='#9ca8ba'/><Box at={[-1.24, 1.35, -.995]} size={[1.04, .73, .025]} color={raw < 360 ? '#384c6d' : '#98bed6'}/><Box at={[-1.24, 1.35, -.975]} size={[.036, .75, .018]} color='#e5e2d8'/><Box at={[-1.24, 1.35, -.973]} size={[1.06, .035, .018]} color='#e5e2d8'/>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .006, .43]} receiveShadow><planeGeometry args={[4.5, 2.8]}/><meshStandardMaterial color='#69768b' roughness={.82}/></mesh><Grid args={[4.5, 2.8]} position={[0, .01, .43]} cellSize={.2} sectionSize={1} cellColor='#9eacc0' sectionColor='#c4ceda' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
  <group position={[-.8, .18, .53]} onClick={choose('board')}><Breadboard active={selected === 'board'}/></group>
  {step >= 1 && <group ref={sensor}><Mount from={[0, .65, 0]}><group position={[-1.35, .62, .34]} onClick={choose('ldr')}>
   {[-.07, .07].map(x => <Box key={x} at={[x, -.17, 0]} size={[.017, .33, .019]} color='#b9c1c6' metal={.8}/>)}
   <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.14, .14, .045, 36]}/><meshStandardMaterial color={selected === 'ldr' ? '#c39be6' : '#c5a775'} roughness={.59}/></mesh>
   <Line points={[[-.09, -.075, .026], [.085, -.075, .026], [.085, -.04, .026], [-.085, -.04, .026], [-.085, 0, .026], [.085, 0, .026], [.085, .04, .026], [-.085, .04, .026], [-.085, .075, .026], [.09, .075, .026]]} color='#784b38' lineWidth={2.2}/>
  </group></Mount></group>}
  {step >= 2 && <Mount from={[0, .5, 0]}><group onClick={choose('divider')}>
   <Resistor at={[-.69, .31, .41]} colors={['#805130', '#2b2929', '#d27b35', '#c1a45f']} selected={selected === 'divider'}/>
   <mesh position={[-.88, .28, .34]} castShadow><cylinderGeometry args={[.033, .033, .08, 16]}/><meshStandardMaterial color={selected === 'divider' ? '#b086d5' : '#b49a53'} metalness={.65}/></mesh>
   <Wire points={[[-1.28, .28, .34], [-1.05, .33, .34], [-.88, .28, .34], [-.83, .31, .41]]} color='#b5bdc3' width={1.4}/>
   <Wire points={[[-.55, .31, .41], [-.45, .27, .51], [-.45, .27, 1.10]]} color='#303a44' width={2}/>
  </group></Mount>}
  {step >= 3 && <><Mount from={[.5, .25, 0]}><group position={[.67, .15, 1.06]} onClick={choose('uno')}><Uno active={selected === 'uno'}/></group></Mount><group onClick={choose('wires')}>
   <Wire points={[[.35, .24, .88], [-.15, .47, .72], [-.88, .28, .34]]} color={selected === 'wires' ? '#bd86e9' : '#dfb04d'}/>
   <Wire points={[[.37, .24, 1.31], [-.38, .21, 1.43], [-1.78, .25, 1.11], [-1.78, .28, .34], [-1.42, .28, .34]]} color={selected === 'wires' ? '#bd86e9' : '#bd564b'}/>
   <Wire points={[[.40, .24, 1.36], [-.30, .17, 1.51], [-.45, .27, 1.10]]} color={selected === 'wires' ? '#bd86e9' : '#303a44'}/>
  </group></>}
  {step >= 4 && <Mount from={[0, .7, 0]}>
   <group onClick={choose('resistor')}><Resistor at={[0, .31, .70]} colors={['#db7c39', '#db7c39', '#77513a', '#c1a35d']} selected={selected === 'resistor'}/></group>
   <group onClick={choose('lamp')}>
    <Box at={[1.35, .08, -.31]} size={[.65, .15, .55]} color='#485467' metal={.5}/><Box at={[1.35, .65, -.31]} size={[.07, 1.10, .07]} color='#b0bac2' metal={.75}/>
    <mesh position={[1.35, 1.35, -.31]} castShadow><cylinderGeometry args={[.29, .21, .58, 48, 1, true]}/><meshPhysicalMaterial color={selected === 'lamp' ? '#c6a0e7' : '#f1e7cf'} roughness={.52} side={2} transparent opacity={.82}/></mesh>
    <mesh position={[1.35, 1.17, -.31]}><sphereGeometry args={[.095, 24, 16]}/><meshStandardMaterial color={lit ? '#ffdda2' : '#d6b989'} emissive={lit ? '#ffc16b' : '#000'} emissiveIntensity={lit ? 2.3 : 0}/></mesh>
    {lit && <pointLight position={[1.35, 1.25, -.28]} color='#ffc67d' intensity={1.1} distance={3.2} castShadow shadow-mapSize={[512, 512]}/>}
   </group>
   <group onClick={choose('wires')}>
    <Wire points={[[.39, .24, .64], [.25, .36, .60], [-.14, .31, .70]]} color='#d69344' width={2}/>
    <Wire points={[[.14, .31, .70], [.95, .13, .50], [1.39, .18, -.31], [1.39, 1.13, -.31]]} color='#5b93b3' width={2.2}/>
    <Wire points={[[1.31, 1.13, -.31], [1.31, .13, -.31], [1.55, .12, .76], [.41, .24, 1.35]]} color='#303a44' width={2.2}/>
   </group>
  </Mount>}
  {step >= 5 && <group ref={shield}><Mount from={[0, .55, 0]}><group onClick={choose('shield')}>
   <Box at={[.22, .10, -.23]} size={[.48, .20, .72]} color='#8a7760'/><Box at={[.22, .70, -.23]} size={[.055, 1.10, .82]} color={selected === 'shield' ? '#b98bd8' : '#b3946b'}/>
   {[-.019, .019].map(x => <Box key={x} at={[.22 + x, .70, -.23]} size={[.006, 1.07, .78]} color='#d0b28a'/>)}
  </group></Mount></group>}
  {step >= 6 && <group ref={cover}><group position={[-1.35, .62, .40]} onClick={choose('cover')}><Box at={[0, 0, 0]} size={[.36, .32, .04]} color={selected === 'cover' ? '#a77cd0' : '#303946'}/><Box at={[0, .22, 0]} size={[.07, .18, .04]} color='#6c7684'/></group></group>}
  <WorldLabel position={anchors[selected]} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part => part.id === selected)?.name}<small>{selected === 'divider' ? 'Brown · black · orange · gold' : selected === 'lamp' ? 'On ≤ 360 · Off ≥ 460' : selected === 'ldr' ? 'Light-sensitive track → A0 divider' : 'Select to trace the connection'}</small></span></WorldLabel>
 </>;
}
const lightCycle = [760, 520, 410, 350, 180, 410, 470, 760];
export default function NightLightWorkshop() {
    const [step, setStep] = useState(0), [selected, select] = useState<Part>('board'), [replay, setReplay] = useState(0), [explode, setExplode] = useState(false);
    const [raw, setRaw] = useState(760), [sampled, setSampled] = useState(760), [lit, setLit] = useState(false), [covered, setCovered] = useState(false), [shielded, setShielded] = useState(true);
    const [cycling, setCycling] = useState(false), [cycleIndex, setCycleIndex] = useState(0), [bright, setBright] = useState<number | null>(null), [dark, setDark] = useState<number | null>(null), [transitions, setTransitions] = useState(0);
    const [events, setEvents] = useState(['Ready · expose the sensor to ambient light.']);
    const effective = Math.max(0, Math.min(1023, Math.round(raw * (covered ? .20 : 1) + (!shielded && lit ? 240 : 0))));
    useEffect(() => {
        const timer = window.setInterval(() => {
            setSampled(effective);
            const next = effective <= 360 ? true : effective >= 460 ? false : lit;
            if (next !== lit) {
                setLit(next);
                setTransitions(value => value + 1);
                setEvents(previous => [`A0 ${effective} · Lamp ${next ? 'ON' : 'OFF'}`, ...previous].slice(0, 7));
            }
        }, 300);
        return () => window.clearInterval(timer);
    }, [effective, lit]);
    useEffect(() => {
        if (!cycling)
            return;
        const timer = window.setTimeout(() => { const next = cycleIndex + 1; if (next >= lightCycle.length) {
            setCycling(false);
            return;
        } setCycleIndex(next); setRaw(lightCycle[next]); }, 1600);
        return () => window.clearTimeout(timer);
    }, [cycling, cycleIndex]);
    function stage(index: number) { setCycling(false); setStep(index); select(steps[index].part); setExplode(false); }
    function reset() { setCycling(false); setRaw(760); setSampled(760); setLit(false); setCovered(false); setShielded(true); setCycleIndex(0); setBright(null); setDark(null); setTransitions(0); setEvents(['Reset · sensor exposed and shield installed.']); }
    const part = parts.find(item => item.id === selected)!;
    const available = parts.filter(item => ({ board: 0, ldr: 1, divider: 2, uno: 3, wires: 3, resistor: 4, lamp: 4, shield: 5, cover: 6 })[item.id] <= step);
    const band = sampled > 360 && sampled < 460;
    const referencesValid = bright !== null && dark !== null && dark < 360 && bright > 460;
    return <div className='rw-workshop nw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Light sensing and feedback workshop</p><h3>Build a lamp that follows dusk.</h3><p>Trace the divider voltage, test the hold band, and see why the sensor needs shielding from the lamp.</p></div><span className='rw-chip'>Photoresistor · A0 · 360 / 460 counts</span></div>
  <div className='rw-layout'>
   <div className='rw-view'>
    <div className='rw-view-top'><span><i />{step >= 6 ? 'Dusk and daylight bench' : 'Night-light assembly bench'}</span><div><button type='button' onClick={() => setReplay(value => value + 1)}><RotateCcw size={15}/>Replay assembly</button>{step >= 1 && <button type='button' aria-pressed={explode} onClick={() => setExplode(!explode)}><Layers size={15}/>{explode ? 'Assembled' : 'Lift sensor'}</button>}</div></div>
    <div className='rw-canvas' role='region' aria-label='Automatic night light 3D workshop'>
     <Canvas shadows dpr={[1, 1.6]} camera={{ position: [3.4, 3.1, 5.6], fov: 40 }} fallback={<p>WebGL is required for the night-light workbench.</p>}>
      <LightScene key={replay} {...{ step, raw, covered, shielded, selected, select, explode }} lit={step >= 4 && lit && !explode}/><ContactShadows position={[0, .014, 0]} opacity={.27} scale={5.1} far={2.5} resolution={256} frames={1}/><OrbitControls target={[0, .77, .2]} enablePan={false} minDistance={3.4} maxDistance={10} maxPolarAngle={Math.PI / 2 - .05}/>
     </Canvas>
    </div>
    <div className='rw-view-footer'><span>Drag to orbit · Inspect the divider, lamp and shield</span><span>{step + 1} / {steps.length}</span></div>
    <nav className='rw-build-strip' aria-label='Night-light assembly stages'>{steps.map((item, index) => <button type='button' key={item.title} aria-current={step === index ? 'step' : undefined} onClick={() => stage(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</nav>
   </div>
   <aside className='rw-panel'>
    <div className='rw-panel-title'><span>{step + 1}</span><div><p className='rw-eyebrow'>{step >= 6 ? 'Measure & operate' : 'Assemble & inspect'}</p><h4>{steps[step].title}</h4></div></div><p>{steps[step].text}</p>
    {step >= 6 && <>
     <div className='nw-readings' aria-label='Night-light readings'><div><span>Sampled A0</span><strong>{sampled}</strong></div><div><span>Lamp</span><strong>{lit && !explode ? 'On' : 'Off'}</strong></div><div><span>Switch events</span><strong>{transitions}</strong></div></div>
     <label className='rw-range'>Ambient light input <output>{raw} counts</output><input type='range' aria-label='Ambient light input' min='0' max='1023' value={raw} onChange={event => { setCycling(false); setRaw(event.target.valueAsNumber); }}/></label>
     <div className='nw-band'><span>ON ≤ 360</span><span data-active={band}>Hold previous state</span><span>OFF ≥ 460</span></div>
     <div className='rw-step-actions'><button type='button' aria-pressed={covered} onClick={() => { setCycling(false); setCovered(!covered); select('cover'); }}>{covered ? 'Uncover sensor' : 'Cover sensor'}</button><button type='button' aria-pressed={shielded} onClick={() => { setShielded(!shielded); select('shield'); }}>{shielded ? 'Remove light shield' : 'Install light shield'}</button></div>
     <div className='rw-run'><button className='rw-primary' type='button' disabled={explode} onClick={() => { if (cycling) {
            setCycling(false);
            return;
        } setCovered(false); setShielded(true); setCycleIndex(0); setRaw(lightCycle[0]); setCycling(true); }}><Play size={15}/>{cycling ? 'Pause light cycle' : 'Run dusk / dawn cycle'}</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset</button></div>
     <div className='rw-step-actions'><button type='button' onClick={() => setBright(sampled)}>Record bright</button><button type='button' onClick={() => setDark(sampled)}>Record shaded</button></div>
     <p className='nw-reference-values'>Bright {bright ?? '—'} · Shaded {dark ?? '—'}</p>
     {bright !== null && dark !== null && <p className='nw-reference-check'>{referencesValid ? 'Both switch points lie between the recorded shaded and bright values.' : 'These readings do not bracket both switch points. Try a brighter and a darker condition.'}</p>}
     <div className='rw-explain' role='status'><strong>{explode ? 'Sensor lifted · reassemble before testing.' : !shielded ? 'Shield removed · lamp light feeds back into the sensor.' : band ? `Inside the hold band · lamp remains ${lit ? 'on' : 'off'}.` : lit ? 'Dark threshold crossed · D8 HIGH · lamp on.' : 'Bright threshold crossed · D8 LOW · lamp off.'}</strong><p>{!shielded ? 'Try 300 ambient counts. In this simulation lamp light adds 240 counts, causing repeated switching until the shield is restored.' : 'The controller switches at two different readings to avoid flicker near dusk.'}</p></div>
     <details className='rw-log' open><summary>Live switch monitor</summary><ol aria-label='Night-light events'>{events.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)}</ol></details>
     <p className='nw-note'>Light levels and feedback are simulated. A0 counts represent this divider setup and do not measure lux.</p>
    </>}
    <div className='rw-inspect'><p className='rw-eyebrow'>Inspect the actual components</p><div className='rw-part-list' role='group' aria-label='Inspect night-light parts'>{available.map(item => <button type='button' key={item.id} aria-pressed={selected === item.id} onClick={() => select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
    <div className='rw-check'><p>{steps[step].check}</p></div>
    {step < 7 && <div className='rw-step-actions'><button type='button' disabled={step === 0} onClick={() => stage(step - 1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' onClick={() => stage(step + 1)}>{step === 5 ? 'Measure the light' : 'Next step'}<ChevronRight size={15}/></button></div>}
   </aside>
  </div>
 </div>;
}
