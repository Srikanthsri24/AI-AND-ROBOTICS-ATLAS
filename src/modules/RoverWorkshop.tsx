import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls, Line } from '@react-three/drei';
import { Group } from 'three';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronLeft, ChevronRight, Expand, Layers, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from 'lucide-react';
import { WorkshopRover, workshopParts, type RoverPart } from './RoverWorkshopModel';
import '../styles/rover-workshop.css';
type Drive = 'forward' | 'back' | 'left' | 'right' | 'stop';
type Phase = 'Cruising' | 'Obstacle detected' | 'Scanning left' | 'Scanning right' | 'Reversing' | 'Turning left' | 'Turning right';
type Block = {
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
};
const blocks: Block[] = [{ x: 0, z: -2.8, w: 2.1, d: 1, h: .9 }, { x: -3, z: .3, w: .9, d: 1.8, h: .65 }, { x: 3, z: -3.8, w: 1.5, d: .8, h: 1.1 }, { x: 2.8, z: 2.7, w: 1.1, d: 1.2, h: .6 }];
const steps = [
    { name: 'Chassis', part: 'chassis', title: 'Start with the frame', text: 'An acrylic plate keeps the wheelbase square. Inspect the mounting holes and the six threaded spacers before adding the drivetrain.', check: 'Find the front of the chassis and the standoff positions.' },
    { name: 'Motors', part: 'motors', title: 'Fit the four gearmotors', text: 'The yellow gearboxes slow the motors down. Wheels on the same side turn together, while different side speeds steer the rover.', check: 'Select a tyre and inspect the hub, tread and motor shaft.' },
    { name: 'Decks', part: 'decks', title: 'See how the upper deck fits', text: 'The upper plate bolts onto brass spacers. Use Exploded view to lift the plate and reveal the motors below.', check: 'Identify the screws and the clearance above each gearbox.' },
    { name: 'Driver', part: 'driver', title: 'Separate commands from motor current', text: 'The motor driver switches battery current. The four-wheel reference needs a driver channel per motor, with sufficient current capacity.', check: 'Follow motor power into the driver and the outputs toward the motors.' },
    { name: 'Controller', part: 'controller', title: 'Mount the Arduino Uno', text: 'The Uno decides when to drive and stop. Its header pins connect sensors and outputs, while motor current travels through the driver stage.', check: 'Find the USB socket, processor and header rows.' },
    { name: 'Sensor', part: 'sensor', title: 'Look ahead and scan', text: 'The front ultrasonic sensor sends a pulse and listens for its echo. The servo rotates it to compare the left and right paths.', check: 'Change the inspection angle and locate both transducers.' },
    { name: 'Power', part: 'power', title: 'Add a switched power supply', text: 'The battery pack feeds the motors. A regulated supply feeds the logic and servo. Common ground gives the signals a shared reference.', check: 'Inspect polarity and keep the motor and logic supply paths clear.' },
    { name: 'Wiring', part: 'wiring', title: 'Trace the connections', text: 'Follow each wire to understand which circuit it belongs to. Select the sensor, servo or driver to read its pin connections.', check: 'Trace a signal wire and its ground return.' },
    { name: 'Logic', part: 'controller', title: 'Understand the obstacle routine', text: 'Drive forward. If an obstacle is closer than 24 cm, stop, scan both sides and turn toward the clearer path. Reverse first if both sides are tight.', check: 'The live flow display in the arena follows this exact simulator sequence.' },
    { name: 'Drive', part: 'sensor', title: 'Test the assembled rover', text: 'Try manual driving, then run Auto and watch the distance, scanning servo, warning light and decision sequence.', check: 'Observe a complete detect → stop → scan → turn → resume cycle.' },
] as const;
function distance(x: number, z: number, yaw: number) {
    const dx = -Math.sin(yaw), dz = -Math.cos(yaw);
    for (let t = .56; t <= 7; t += .025) {
        const px = x + dx * t, pz = z + dz * t;
        if (Math.abs(px) > 5.65 || Math.abs(pz) > 5.65 || blocks.some(b => Math.abs(px - b.x) < b.w / 2 && Math.abs(pz - b.z) < b.d / 2))
            return Math.max(0, t - .56);
    }
    return 7;
}
function blocked(x: number, z: number) { return Math.abs(x) > 5.05 || Math.abs(z) > 5.05 || blocks.some(b => Math.abs(x - b.x) < b.w / 2 + .64 && Math.abs(z - b.z) < b.d / 2 + .64); }
interface Sim {
    x: number;
    z: number;
    yaw: number;
    spin: number;
    servo: number;
    phase: Phase;
    elapsed: number;
    range: number;
    left: number;
    right: number;
    turn: number;
    running: boolean;
    mode: 'manual' | 'auto';
    command: Drive;
    speed: number;
    led: boolean;
    buzzer: boolean;
}
const initial = (): Sim => ({ x: 0, z: 1.25, yaw: 0, spin: 0, servo: 90, phase: 'Cruising', elapsed: 0, range: distance(0, 1.25, 0), left: 0, right: 0, turn: 1, running: false, mode: 'manual', command: 'stop', speed: 55, led: false, buzzer: false });
const phases: Phase[] = ['Cruising', 'Obstacle detected', 'Scanning left', 'Scanning right', 'Turning left'];
function Simulation({ sim, onReading, onEvent, selected, onSelect }: {
    sim: React.RefObject<Sim>;
    selected: RoverPart;
    onSelect: (part: RoverPart) => void;
    onReading: (s: Sim) => void;
    onEvent: (text: string) => void;
}) {
    const root = useRef<Group>(null);
    useFrame((_, delta) => {
        const s = sim.current, dt = Math.min(delta, .045);
        if (s.running) {
            let drive: Drive = s.command;
            s.elapsed += dt;
            if (s.mode === 'auto') {
                drive = 'stop';
                const transition = (next: Phase) => { s.phase = next; s.elapsed = 0; onEvent(next); };
                if (s.phase === 'Cruising') {
                    s.servo = 90;
                    if (distance(s.x, s.z, s.yaw) < .96)
                        transition('Obstacle detected');
                    else
                        drive = 'forward';
                }
                else if (s.phase === 'Obstacle detected' && s.elapsed > .6)
                    transition('Scanning left');
                else if (s.phase === 'Scanning left') {
                    s.servo = Math.min(145, s.servo + dt * 110);
                    if (s.elapsed > .8) {
                        s.left = distance(s.x, s.z, s.yaw + 55 * Math.PI / 180);
                        transition('Scanning right');
                    }
                }
                else if (s.phase === 'Scanning right') {
                    s.servo = Math.max(35, s.servo - dt * 150);
                    if (s.elapsed > 1.0) {
                        s.right = distance(s.x, s.z, s.yaw - 55 * Math.PI / 180);
                        s.turn = s.left >= s.right ? 1 : -1;
                        onEvent(`Scan · left ${Math.round(s.left * 25)} cm · right ${Math.round(s.right * 25)} cm`);
                        transition(Math.max(s.left, s.right) < 1.2 ? 'Reversing' : s.turn === 1 ? 'Turning left' : 'Turning right');
                    }
                }
                else if (s.phase === 'Reversing') {
                    drive = 'back';
                    s.servo = 90;
                    if (s.elapsed > .75)
                        transition(s.turn === 1 ? 'Turning left' : 'Turning right');
                }
                else if (s.phase === 'Turning left' || s.phase === 'Turning right') {
                    drive = s.phase === 'Turning left' ? 'left' : 'right';
                    s.servo = 90;
                    if (s.elapsed > .96)
                        transition('Cruising');
                }
            }
            const rate = .45 + s.speed / 100 * 1.35;
            if (drive === 'left' || drive === 'right') {
                s.yaw += (drive === 'left' ? 1 : -1) * dt * 1.45;
                s.spin += dt * rate * 2;
            }
            if (drive === 'forward' || drive === 'back') {
                const sign = drive === 'forward' ? 1 : -1;
                const nx = s.x - Math.sin(s.yaw) * rate * dt * sign, nz = s.z - Math.cos(s.yaw) * rate * dt * sign;
                if (!blocked(nx, nz)) {
                    s.x = nx;
                    s.z = nz;
                    s.spin -= dt * rate * sign * 3;
                }
                else if (s.mode === 'manual' && s.command !== 'stop') {
                    s.command = 'stop';
                    onEvent('Movement stopped · obstacle or arena boundary');
                }
            }
        }
        s.range = distance(s.x, s.z, s.yaw + (s.servo - 90) * Math.PI / 180);
        if (root.current) {
            root.current.position.set(s.x, 0, s.z);
            root.current.rotation.y = s.yaw;
        }
        onReading({ ...s });
    });
    return <group ref={root}><RoverAnimated sim={sim} selected={selected} onSelect={onSelect}/></group>;
}
// A single persistent model remains mounted as simulation values change.
function RoverAnimated({ sim, selected, onSelect }: {
    sim: React.RefObject<Sim>;
    selected: RoverPart;
    onSelect: (part: RoverPart) => void;
}) {
    const [frame, setFrame] = useState({ spin: 0, servo: 90, alert: false });
    useFrame(() => { const s = sim.current; setFrame({ spin: s.spin, servo: s.servo, alert: s.led || (s.mode === 'auto' && s.phase !== 'Cruising') }); });
    return <group scale={.53}><WorkshopRover step={9} explode={false} selected={selected} onSelect={onSelect} {...frame} beam/></group>;
}
function CameraPosition({ arena, reset }: {
    arena: boolean;
    reset: number;
}) {
    const { camera } = useThree();
    useEffect(() => { camera.position.set(...(arena ? [4.3, 3.7, 5.4] : [3.8, 3.5, -4.6]) as [
        number,
        number,
        number
    ]); camera.lookAt(0, arena ? 0 : .65, 0); camera.updateProjectionMatrix(); }, [arena, reset, camera]);
    return null;
}
function Floor({ arena }: {
    arena: boolean;
}) {
    return <>
  <color attach="background" args={['#edf0eb']}/><fog attach="fog" args={['#edf0eb', 19, 38]}/>
  <hemisphereLight args={['#fffaf0', '#74827e', 2.1]}/><directionalLight position={[-4, 8, 5]} intensity={3.1} color="#fff4df" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.0003}/><directionalLight position={[5, 3, -4]} intensity={1.2} color="#d0e6ff"/>
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.018, 0]} receiveShadow><planeGeometry args={[80, 80]}/><meshStandardMaterial color={arena ? '#e5e6dd' : '#d8ded5'} roughness={.9}/></mesh>
  {!arena && <><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .002, 0]} receiveShadow><planeGeometry args={[4.3, 5.05]}/><meshStandardMaterial color="#28685d" roughness={.85}/></mesh><Grid position={[0, .007, 0]} args={[4.3, 5.05]} cellSize={.2} sectionSize={1} cellColor="#85ad95" sectionColor="#a0bea3" cellThickness={.5} sectionThickness={.8} fadeDistance={12}/></>}
  {arena && <><Grid position={[0, .005, 0]} args={[12, 12]} cellSize={.5} sectionSize={2} cellColor="#b5bdb6" sectionColor="#8c9e99" cellThickness={.5} sectionThickness={.75} fadeDistance={23}/>{blocks.map((b, i) => <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow><boxGeometry args={[b.w, b.h, b.d]}/><meshStandardMaterial color={i % 2 ? '#b4bfae' : '#d8b578'} roughness={.8}/></mesh>)}<Line points={[[-5.65, .01, -5.65], [5.65, .01, -5.65], [5.65, .01, 5.65], [-5.65, .01, 5.65], [-5.65, .01, -5.65]]} color="#708d86" lineWidth={2}/></>}
 </>;
}
export default function RoverWorkshop() {
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState<RoverPart>('chassis');
    const [explode, setExplode] = useState(false);
    const [assemblyReplay,setAssemblyReplay]=useState(0);
    const [inspectServo, setInspectServo] = useState(90);
    const sim = useRef<Sim>(initial());
    const [reading, setReading] = useState<Sim>(initial);
    const [logs, setLogs] = useState<string[]>(['Workbench ready. Build the car or open Drive.']);
    const [sound, setSound] = useState(false);
    const [cameraKey, setCameraKey] = useState(0);
    const [webglError, setWebglError] = useState(false);
    const audio = useRef<AudioContext | null>(null);
    const lastReading = useRef(0);
    const arena = step === 9;
    const current = steps[step];
    const part = workshopParts.find(p => p.id === selected)!;
    const allowed = workshopParts.filter(p => ({ chassis: 0, motors: 1, wheels: 1, decks: 2, driver: 3, controller: 4, sensor: 5, servo: 5, power: 6, wiring: 7, led: 7, buzzer: 7 })[p.id] <= step);
    function log(text: string) { setLogs(previous => [text, ...previous].slice(0, 8)); }
    function emit(text: string) {
        log(text);
        if (text === 'Obstacle detected' && sound) {
            const context = audio.current;
            if (context) {
                const osc = context.createOscillator(), gain = context.createGain();
                osc.frequency.value = 740;
                gain.gain.setValueAtTime(.035, context.currentTime);
                gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .16);
                osc.connect(gain);
                gain.connect(context.destination);
                osc.start();
                osc.stop(context.currentTime + .17);
            }
        }
    }
    function update() { setReading({ ...sim.current }); }
    function changeStep(index: number) { sim.current.running = false; sim.current.command = 'stop'; setStep(index); setSelected(steps[index].part); setExplode(false); update(); }
    function reset() { sim.current = initial(); update(); setLogs(['Arena reset. Choose Manual or Auto, then press Run.']); }
    function command(value: Drive) { const s = sim.current; s.mode = 'manual'; s.command = value; s.running = value !== 'stop'; update(); if (value !== 'stop')
        log(`Manual · ${value}`); }
    useEffect(() => {
        if (!arena)
            return;
        const keys: Record<string, Drive> = { w: 'forward', ArrowUp: 'forward', s: 'back', ArrowDown: 'back', a: 'left', ArrowLeft: 'left', d: 'right', ArrowRight: 'right', ' ': 'stop' };
        const down = (event: KeyboardEvent) => { if (event.target instanceof HTMLElement && event.target.closest('input,select,textarea'))
            return; const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; if (keys[key]) {
            event.preventDefault();
            if (!event.repeat)
                command(keys[key]);
        } };
        const up = (event: KeyboardEvent) => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; if (keys[key] && sim.current.mode === 'manual') {
            sim.current.command = 'stop';
            sim.current.running = false;
            update();
        } };
        const release = () => { if (sim.current.mode === 'manual') {
            sim.current.command = 'stop';
            sim.current.running = false;
            update();
        } };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        window.addEventListener('pointerup', release);
        window.addEventListener('blur', release);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('pointerup', release); window.removeEventListener('blur', release); sim.current.running = false; sim.current.command = 'stop'; };
    }, [arena]);
    useEffect(() => () => { audio.current?.close(); }, []);
    const explanatory: Record<Phase, string> = { Cruising: 'The forward path is clear. Both sides drive at the selected speed.', 'Obstacle detected': 'An obstacle is within 24 cm. The motors stop before the sensor scans.', 'Scanning left': 'The servo turns to 145°. The simulator measures the left path.', 'Scanning right': 'The servo turns to 35°. The simulator measures the right path.', Reversing: 'Both scans are tight. The car backs away before turning.', 'Turning left': 'The left scan has more room. The drivetrain pivots left.', 'Turning right': 'The right scan has more room. The drivetrain pivots right.' };
    return <div className="rw-workshop">
  <div className="rw-heading"><div><p className="rw-eyebrow">Interactive robotics workbench</p><h3>Build it. Inspect it. Drive it.</h3><p>A four-wheel reference inspired by your video. Explore each layer, then test the complete rover.</p></div><span className="rw-chip">Arduino Uno · Browser simulation</span></div>
  <div className="rw-layout">
   <div className="rw-view">
    <div className="rw-view-top"><span><i />{arena ? 'Test arena' : 'Assembly bench'}</span><div><button type="button" title="Reset camera" aria-label="Reset workshop camera" onClick={() => setCameraKey(k => k + 1)}><Expand size={17}/></button>{!arena&&step>=1&&<button type="button" onClick={()=>setAssemblyReplay(value=>value+1)}><RotateCcw size={15}/>Replay assembly</button>}{!arena && step >= 2 && <button type="button" aria-pressed={explode} onClick={() => setExplode(!explode)}><Layers size={16}/>{explode ? 'Assembled' : 'Exploded view'}</button>}</div></div>
    <div className="rw-canvas" role="region" aria-label={arena ? 'Interactive rover driving arena' : 'Interactive rover assembly bench'}>
     {webglError ? <p className="rw-fallback">This device could not start the 3D viewer. Try enabling hardware acceleration and reopening this stage.</p> : <Canvas shadows dpr={[1, 1.7]} camera={{ position: arena ? [4.3, 3.7, 5.4] : [3.8, 3.5, -4.6], fov: 40 }} fallback={<p>WebGL is required for the 3D workbench.</p>} onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', () => setWebglError(true), { once: true })}>
      <CameraPosition arena={arena} reset={cameraKey}/><Floor arena={arena}/>
      {arena ? <Simulation sim={sim} selected={selected} onSelect={setSelected} onReading={s => { if (performance.now() - lastReading.current > 90) {
            lastReading.current = performance.now();
            setReading(s);
        } }} onEvent={emit}/> : <><WorkshopRover key={`${step}-${assemblyReplay}`} step={step} explode={explode} selected={selected} onSelect={setSelected} servo={inspectServo}/><ContactShadows position={[0, .014, 0]} opacity={.28} scale={5.2} far={3} resolution={256} frames={1}/></>}
      <OrbitControls key={`${arena}-${cameraKey}`} makeDefault target={arena ? [0, 0, 0] : [0, .65, 0]} enablePan={arena} minDistance={arena ? 4 : 2.7} maxDistance={arena ? 20 : 9} maxPolarAngle={Math.PI / 2 - .035}/>
     </Canvas>}
     {arena && <><div className="rw-telemetry" aria-label="Live rover telemetry"><div><span>Distance</span><strong>{Math.round(reading.range * 25)}<small> cm</small></strong></div><div><span>Speed</span><strong>{reading.speed}<small>%</small></strong></div><div><span>Sensor</span><strong>{Math.round(reading.servo)}<small>°</small></strong></div></div><div className="rw-map" aria-label="Arena map"><svg viewBox="-6 -6 12 12" role="img" aria-label="Rover position and arena obstacles"><rect x="-5.65" y="-5.65" width="11.3" height="11.3" fill="#f0f3ea" stroke="#98aaa3" strokeWidth=".12"/>{blocks.map((b, i) => <rect key={i} x={b.x - b.w / 2} y={b.z - b.d / 2} width={b.w} height={b.d} fill="#c6a776"/>)}<g transform={`translate(${reading.x} ${reading.z}) rotate(${-reading.yaw * 180 / Math.PI})`}><path d="M 0 -.58 L .34 .36 L -.34 .36 Z" fill="#366d76"/></g></svg><span>3 × 3 m arena</span></div></>}
    </div>
    <div className="rw-view-footer"><span>Drag to orbit · Scroll to zoom · Select a part to inspect</span>{arena ? <span>{reading.running ? 'Simulation running' : 'Paused'}</span> : <span>{step + 1} / 10</span>}</div>
    <nav className="rw-build-strip" aria-label="Workshop build steps">{steps.map((s, index) => <button type="button" key={s.name} aria-current={step === index ? 'step' : undefined} aria-label={`Workshop step ${index + 1}: ${s.name}`} onClick={() => changeStep(index)}><span>{index < step ? <Check size={14}/> : String(index + 1).padStart(2, '0')}</span>{s.name}</button>)}</nav>
   </div>
   <aside className="rw-panel">
    <div className="rw-panel-title"><span>{String(step + 1).padStart(2, '0')}</span><div><p className="rw-eyebrow">{arena ? 'Simulation' : 'Build & understand'}</p><h4>{current.title}</h4></div></div>
    <p>{current.text}</p>
    {arena ? <>
     <div className="rw-mode" role="group" aria-label="Rover driving mode">{(['manual', 'auto'] as const).map(mode => <button type="button" key={mode} aria-pressed={reading.mode === mode} onClick={() => { sim.current.mode = mode; sim.current.running = false; sim.current.command = 'stop'; sim.current.phase = 'Cruising'; sim.current.elapsed = 0; sim.current.servo = 90; update(); log(`${mode === 'auto' ? 'Auto' : 'Manual'} selected. Press Run to start.`); }}>{mode === 'auto' ? 'Auto avoid' : 'Manual'}</button>)}</div>
     <div className="rw-run"><button className="rw-primary" type="button" onClick={() => { const s = sim.current; s.running = !s.running; if (s.mode === 'manual')
            s.command = s.running ? 'forward' : 'stop'; update(); log(s.running ? 'Simulation started' : 'Simulation paused'); }}>{reading.running ? <Pause size={17}/> : <Play size={17}/>} {reading.running ? 'Pause' : 'Run'}</button><button type="button" onClick={reset}><RotateCcw size={16}/>Reset arena</button></div>
     <label className="rw-range">Drive speed <output>{reading.speed}%</output><input aria-label="Rover drive speed" type="range" min="15" max="100" value={reading.speed} onChange={event => { sim.current.speed = event.target.valueAsNumber; update(); }}/></label>
     <div className="rw-drive" role="group" aria-label="Manual rover controls">{([{ v: 'forward', Icon: ArrowUp }, { v: 'left', Icon: ArrowLeft }, { v: 'stop', Icon: Square }, { v: 'right', Icon: ArrowRight }, { v: 'back', Icon: ArrowDown }] as const).map(({ v, Icon }) => <button type="button" key={v} className={`rw-drive-${v}`} aria-label={`Drive ${v}`} onPointerDown={event => { event.preventDefault(); command(v); }} onClick={event => { if (event.detail === 0)
            command(v); }}><Icon size={21}/></button>)}</div><p className="rw-help">Hold a direction or use W A S D. Release to stop. Space stops immediately.</p>
     <div className="rw-flow" aria-label="Obstacle avoidance program flow">{phases.map(phase => <span key={phase} data-active={reading.mode === 'auto' && (reading.phase === phase || (phase === 'Turning left' && reading.phase === 'Turning right'))}>{phase === 'Turning left' ? 'Choose & turn' : phase}</span>)}</div>
     <div className="rw-explain" role="status"><strong>{reading.mode === 'auto' ? reading.phase : reading.running ? 'Manual drive' : 'Ready to drive'}</strong><p>{reading.mode === 'auto' ? explanatory[reading.phase] : 'Drive around the obstacles, or select Auto avoid to watch the sensor make decisions.'}</p></div>
     <div className="rw-actuators"><button type="button" aria-pressed={reading.led} onClick={() => { sim.current.led = !sim.current.led; update(); }}><i data-on={reading.led || (reading.mode === 'auto' && reading.phase !== 'Cruising')}/>Status LED</button><button type="button" aria-pressed={sound} onClick={() => { if (!sound) {
            audio.current ??= new AudioContext();
            audio.current.resume();
        } setSound(!sound); }}>{sound ? <Volume2 size={15}/> : <VolumeX size={15}/>}Sound {sound ? 'on' : 'off'}</button></div>
     {reading.mode === 'manual' && <label className="rw-range">Look direction <output>{Math.round(reading.servo)}°</output><input aria-label="Rover sensor angle" type="range" min="35" max="145" value={reading.servo} onChange={event => { sim.current.servo = event.target.valueAsNumber; update(); }}/></label>}
     <details className="rw-inspect"><summary>Inspect assembled parts</summary><div className="rw-part-list" role="group" aria-label="Inspect assembled rover parts">{workshopParts.map(p => <button type="button" key={p.id} aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}>{p.name}</button>)}</div><h5>{part.name}</h5><p>{part.why}</p><div className="rw-connections"><strong>How it connects</strong><p>{part.connection}</p></div></details>
     <details className="rw-log" open><summary>Live event monitor</summary><ol aria-label="Rover event log">{logs.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol></details>
    </> : <>
     <div className="rw-inspect"><p className="rw-eyebrow">Select an actual part in 3D</p><div className="rw-part-list" role="group" aria-label="Inspect rover parts">{allowed.map(p => <button type="button" key={p.id} aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}>{p.name}</button>)}</div><h5>{part.name}</h5><p>{part.why}</p><div className="rw-connections"><strong>How it connects</strong><p>{part.connection}</p></div></div>
     {step >= 5 && <label className="rw-range">Inspect sensor rotation <output>{inspectServo}°</output><input aria-label="Inspect sensor rotation" type="range" min="35" max="145" value={inspectServo} onChange={event => setInspectServo(event.target.valueAsNumber)}/></label>}
     <div className="rw-check"><Check size={18}/><p>{current.check}</p></div>
     <div className="rw-step-actions"><button type="button" disabled={step === 0} onClick={() => changeStep(step - 1)}><ChevronLeft size={17}/>Previous</button><button type="button" className="rw-primary" onClick={() => changeStep(step + 1)}> {step === 8 ? 'Enter driving arena' : 'Next step'}<ChevronRight size={17}/></button></div>
    </>}
   </aside>
  </div>
  <p className="rw-reference">Four-wheel learning reference · The first five stages describe the original two-wheel build. This workshop visualizes a four-motor chassis with scanning servo, LED and sounder. Its range and motion are browser simulations. Hardware wiring and driver ratings must match the version you build.</p>
 </div>;
}
