import { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { enclosure } from '../data/printed-enclosure';
import { WorldLabel } from './LabWorkbench';

type Point = [number, number, number];
const scale = .055;
const notchZ = (enclosure.width / 2 - enclosure.usbCenter) * scale;
const caseEdge = -enclosure.length * scale / 2;
const top = enclosure.height * scale;
const plugY = 15.5 * scale;
const parts = [
  ['Printed base', 'The floor and walls protect the board. The notch lets the cable reach the recessed USB socket.'],
  ['Vented lift-off lid', 'Four tabs locate the lid on the long walls. The slots let warm air escape. Lift the lid to inspect the board and activity light.'],
  ['Arduino Uno R3', 'The USB cable supplies power and data. The onboard light turns on for one second and off for one second after Blink is uploaded.'],
  ['Nylon PCB supports', 'The supports carry the board at its mounting holes and hold the solder joints away from the floor.'],
  ['USB plug and wall notch', 'The molded shoulder has to cross the front wall. Allow at least 1 mm of space on each side.'],
] as const;

function Box({ at, size, color, metal = 0 }: { at: Point; size: Point; color: string; metal?: number }) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size) * .16} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={metal ? .32 : .66} metalness={metal}/>
  </RoundedBox>;
}

export function EnclosureSupport({ highlighted = false }: { highlighted?: boolean }) {
  return <>
    <Box at={[0,.04,0]} size={[.52,.08,.52]} color={highlighted ? '#ffd693' : '#d4d4cb'}/>
    <mesh position={[0,.23,0]}><cylinderGeometry args={[.13,.16,.32,20]}/><meshStandardMaterial color={highlighted ? '#ffd693' : '#e0dfd1'}/></mesh>
    <mesh position={[0,.43,0]}><coneGeometry args={[.10,.14,18]}/><meshStandardMaterial color={highlighted ? '#ffd693' : '#d4d4cb'}/></mesh>
  </>;
}

export function EnclosurePlug({ width = 16, highlighted = false }: { width?: number; highlighted?: boolean }) {
  return <>
    <Box at={[-.22,0,0]} size={[.95,.73,width * scale]} color={highlighted ? '#a57036' : '#26343b'}/>
    <Box at={[.45,0,0]} size={[.44,.56,.63]} color="#b9c8ca" metal={.68}/>
    <Box at={[-.77,0,0]} size={[.24,.38,.37]} color="#252e32"/>
  </>;
}

function Uno({ active, selected }: { active: boolean; selected: boolean }) {
  const lamp = useRef<import('three').MeshStandardMaterial>(null);
  useFrame(({clock}) => {
    if (lamp.current) lamp.current.emissiveIntensity = active && Math.floor(clock.elapsedTime) % 2 === 0 ? 3.5 : 0;
  });
  return <group position={[.12,.50,0]}>
    <Box at={[0,0,0]} size={[3.77,.09,2.94]} color={selected ? '#2c8ea3' : '#166781'}/>
    <Box at={[-1.64,plugY-.50,notchZ]} size={[.58,.67,.67]} color="#b7c6cd" metal={.7}/>
    <Box at={[-1.955,plugY-.50,notchZ]} size={[.035,.46,.48]} color="#17212b"/>
    <Box at={[-1.57,.27,1.05]} size={[.63,.50,.50]} color="#171b20"/>
    <Box at={[.40,.14,.38]} size={[1.73,.16,.51]} color="#1e252c"/>
    {[-1.26,1.27].map(z => <group key={z} position={[.30,.17,z]}>
      <Box at={[0,0,0]} size={[2.77,.31,.18]} color="#232833"/>
      {Array.from({ length: 16 }, (_, i) => <Box key={i} at={[i*.163-1.22,.166,0]} size={[.061,.013,.068]} color="#b89a61" metal={.48}/>)}
    </group>)}
    {[-.47,-.22,.05,.32].map(x => <Box key={x} at={[x,.10,-.63]} size={[.115,.06,.08]} color="#b9ac8a" metal={.42}/>)}
    <Box at={[-.74,.12,.82]} size={[.43,.13,.18]} color="#b4c1cc" metal={.5}/>
    <mesh position={[-.28,.088,-.08]}>
      <boxGeometry args={[.125,.075,.105]}/><meshStandardMaterial ref={lamp} color="#93bb66" emissive="#85f954"/>
    </mesh>
  </group>;
}

function Bench({ open, connected, width, selected, select, labels }: {
  open: boolean; connected: boolean; width: number; selected: number; select: (index: number) => void; labels: boolean;
}) {
  const base = useLoader(STLLoader, './project-files/uno-base.stl');
  const lid = useLoader(STLLoader, './project-files/uno-lid.stl');
  const lidGroup = useRef<Group>(null);
  const cable = useRef<Group>(null);
  useFrame((_, delta) => {
    if (lidGroup.current) {
      lidGroup.current.position.y = MathUtils.damp(lidGroup.current.position.y, open ? top + 1.4 : top, 7, delta);
      lidGroup.current.position.z = MathUtils.damp(lidGroup.current.position.z, open ? -.85 : 0, 7, delta);
      lidGroup.current.rotation.x = MathUtils.damp(lidGroup.current.rotation.x, open ? .27 : 0, 7, delta);
    }
    if (cable.current) cable.current.position.x = MathUtils.damp(cable.current.position.x, connected ? caseEdge-.1 : caseEdge-.84, 10, delta);
  });
  const anchors: Point[] = [[1.8,.21,1.65],[1.3,open?top+1.44:top+.14,open?-.85:0],[.6,.62,.34],[1.7,.27,1.1],[caseEdge,plugY,notchZ]];
  const tags: Point[] = [[2.5,.45,1.8],[1.8,open?top+1.73:top+.70,-.85],[.45,1.20,1.1],[2.0,.74,1.23],[caseEdge-.72,1.36,notchZ-.16]];
  return <>
    <color attach="background" args={['#253646']}/>
    <ambientLight intensity={.62}/>
    <directionalLight intensity={2.6} color="#faf0d8" position={[-4,8,5]}/>
    <directionalLight intensity={1.35} color="#b7dafa" position={[4,5,-6]}/>
    <Box at={[0,-.155,0]} size={[15,.28,11]} color="#364a55"/>
    <mesh geometry={base} rotation={[-Math.PI/2,0,0]} position={[caseEdge,0,enclosure.width*scale/2]} scale={scale}>
      <meshStandardMaterial color={selected===0 ? '#5299ab' : '#306e81'} roughness={.72}/>
    </mesh>
    <group ref={lidGroup} position={[0,top,0]}>
      <mesh geometry={lid} rotation={[Math.PI/2,0,0]} position={[caseEdge,enclosure.lidThickness*scale,-enclosure.width*scale/2]} scale={scale}>
        <meshStandardMaterial color={selected===1 ? '#70a5b3' : '#4a8796'} roughness={.69}/>
      </mesh>
    </group>
    {[[-1.34,-1.20],[-1.38,1.24],[1.66,-.78],[1.66,.80]].map(([x,z]) =>
      <group key={z} position={[x,enclosure.floor*scale,z]} scale={[1,.77,1]}><EnclosureSupport highlighted={selected===3}/></group>
    )}
    <Uno active={connected} selected={selected===2}/>
    <group ref={cable} position={[caseEdge-.84,plugY,notchZ]}>
      <EnclosurePlug width={width} highlighted={selected===4}/>
      <Line points={[[-.84,0,0],[-1.10,-.07,.02],[-1.45,-.30,.20],[-1.72,-.58,.54],[-2.25,-.72,.93],[-2.90,-.73,1.35]]} color="#202932" lineWidth={5}/>
    </group>
    <ContactShadows position={[0,.003,0]} scale={11} opacity={.51} blur={2.5} far={6}/>
    {labels && tags.map((tag,index) => (open || (index!==2 && index!==3)) && <group key={index}>
      <Line points={[anchors[index],tag]} color={selected===index ? '#ffe09e' : '#b9d0d9'} lineWidth={1.35}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" aria-label={parts[index][0]} aria-pressed={selected===index} className="gp-marker" onClick={() => select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
  </>;
}

export default function PrintedEnclosureDemo() {
  const [open,setOpen] = useState(true);
  const [width,setWidth] = useState(16);
  const [connected,setConnected] = useState(false);
  const [selected,setSelected] = useState(0);
  const [labels,setLabels] = useState(true);
  const [notice,setNotice] = useState('Try the 16 mm plug, then compare a wider one.');
  const clearance = (enclosure.usbWidth-width)/2;
  function select(index: number) {
    setSelected(index);
    if (index===2 || index===3) setOpen(true);
  }
  function plugIn() {
    setSelected(4);
    setConnected(clearance>=1);
    setNotice(clearance>=1 ? 'Plug seated. USB powers the Uno and the onboard activity light blinks.' :
      clearance<0 ? 'The plug is wider than the notch. Increase usb_width and try another gauge.' :
      'The plug needs more clearance. Allow at least 1 mm per side for this build.');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D printed Arduino enclosure">
        <Canvas dpr={[1,1.65]} camera={{position:[-5.1,6.2,7.8],fov:42}} fallback={<p>Use the fit controls to check the plug dimensions.</p>}>
          <Bench open={open} connected={connected} width={width} selected={selected} select={select} labels={labels}/>
          <OrbitControls target={[-.30,1.01,0]} minDistance={4.4} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Enclosure fit readings">
        <div><span>Wall notch</span><strong>{enclosure.usbWidth} mm</strong></div>
        <div><span>Gap per side</span><strong>{clearance.toFixed(1)} mm</strong></div>
        <div><span>Uno status</span><strong>{connected ? 'Blinking' : 'Unpowered'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Fit the lid and test a plug</h3>
      <p>Look at how the lid registers on the walls, then try connecting USB with the lid seated.</p>
      <label htmlFor="enclosure-plug">Plug housing width · {width} mm</label>
      <input id="enclosure-plug" className="gp-lidar-range" type="range" min={13} max={23} step={.5} value={width} onChange={event => {
        setWidth(Number(event.target.value)); setConnected(false); setNotice('Width changed. Insert the plug to check the fit.');
      }}/>
      <div className="gp-steps">
        <button type="button" onClick={() => setOpen(value => !value)}>{open ? 'Seat lid' : 'Lift lid'}</button>
        <button type="button" className="gp-button" onClick={connected ? () => {
          setConnected(false); setNotice('Plug removed. The Uno loses USB power.');
        } : plugIn}>{connected ? 'Unplug USB' : 'Insert USB plug'}</button>
        <button type="button" aria-pressed={labels} onClick={() => setLabels(value => !value)}>Scene labels</button>
      </div>
      <p className="gp-demo-description" role="status">{notice}</p>
      <h4>Inspect the case</h4>
      <ol className="gp-demo-labels">{parts.map(([name],index) => <li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={() => select(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
