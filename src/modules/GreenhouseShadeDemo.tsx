import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Uncovered reference sensor',at:[-1.76,.64,.41],detail:'A0 measures the available light outside the cover. Below 20%, the ratio is unavailable.'},
  {name:'Tray sensor',at:[.89,.66,.69],detail:'A1 measures light at seedling height. The Uno divides this reading by the reference reading.'},
  {name:'Sliding shade screen',at:[.80,1.70,-.29],detail:'Slide the screen over the tray and leave the reference exposed. Both sensors are affected when room lighting changes.'},
  {name:'Shade warning LED',at:[-.69,.52,1.21],detail:'D8 lights the warning below a 48% ratio. The warning clears at 55% or with an insufficient reference.'},
];

function Cell({at,selected}:{at:Point;selected:boolean}){
  const [x,y,z]=at;
  return <group position={[x,y,z]}>
    <Box at={[0,0,0]} size={[.32,.103,.26]} color="#d7dacf"/>
    <mesh position={[0,.074,0]}><cylinderGeometry args={[.064,.067,.034,22]}/><meshStandardMaterial color={selected?'#f4bb77':'#bda684'}/></mesh>
    <Line points={[[-.04,.093,-.023],[.044,.093,-.023],[.044,.093,0],[-.04,.093,0],[-.04,.093,.022],[.044,.093,.022]]} color="#7d4b38" lineWidth={2}/>
  </group>;
}

function Greenhouse({shade,reference,warning,selected,select}:{shade:number;reference:number;warning:boolean;selected:number;select:(i:number)=>void}){
  const ambient=.43+reference*.023;
  const coverLength=.22+shade*.017;
  return <>
    <color attach="background" args={['#2b4250']}/>
    <hemisphereLight args={['#e7f2ff','#758265',ambient]}/>
    <directionalLight position={[-3,6,4]} intensity={ambient} color="#fff1d6"/>
    <Box at={[0,.015,0]} size={[4.96,.20,3.08]} color="#546e6b"/>
    <Box at={[.64,.16,-.03]} size={[2.91,.12,1.99]} color="#9d9f8a"/>
    {[-.78,2.06].flatMap(x=>[-.95,.92].map(z=><Box key={x+':'+z} at={[x,.93,z]} size={[.057,1.52,.058]} color="#718c83" metal={.54}/>))}
    {[-.95,.92].map(z=><Box key={z} at={[.64,1.68,z]} size={[2.9,.06,.06]} color="#78958a" metal={.52}/>)}
    {[-.79,.62,2.07].map(x=><Line key={x} points={[[x,1.68,-.95],[x,2.12,-.01],[x,1.68,.92]]} color="#9baea6" lineWidth={3}/>)}
    <Box at={[.64,2.12,-.01]} size={[2.9,.055,.06]} color="#a8b7ac"/>
    <mesh position={[.64,.95,-.955]}><planeGeometry args={[2.81,1.4]}/><meshStandardMaterial color="#b7ded3" transparent opacity={.22} side={2} depthWrite={false}/></mesh>
    <group onClick={()=>select(2)}>
      <Box at={[.89,1.44,-.76+coverLength/2]} size={[2.23,.045,coverLength]} color={selected===2?'#b59564':'#455a55'}/>
      <Box at={[.89,1.44,-.76+coverLength]} size={[2.3,.082,.086]} color="#a7b29c" metal={.44}/>
      {[.43,.78,1.13,1.48].map(x=><Box key={x} at={[x-.02,1.465,-.76+coverLength/2]} size={[.011,.008,coverLength*.95]} color="#76867a"/>)}
    </group>
    <Box at={[.98,.30,-.16]} size={[1.83,.20,1.21]} color="#353d3b"/>
    {[-.56,-.15,.26].flatMap((z,row)=>[.37,.77,1.17,1.57].map((x,col)=><group key={x+':'+z} position={[x,.411,z]}>
      <Box at={[0,0,0]} size={[.32,.044,.31]} color={shade>52?'#483b2f':'#685441'}/>
      <mesh position={[0,.12,0]}><cylinderGeometry args={[.011,.013,.20,8]}/><meshStandardMaterial color="#6d975d"/></mesh>
      {[-1,1].map(side=><mesh key={side} position={[side*.062,.22+(row%2)*.02,0]} rotation={[.14,(col%3)*.45,side*.32]} scale={[.103,.018,.053]}>
        <sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={shade>52?'#557747':'#77a464'}/>
      </mesh>)}
    </group>))}
    <group onClick={()=>select(0)}><Cell at={[-1.68,.27,.28]} selected={selected===0}/></group>
    <group onClick={()=>select(1)}><Cell at={[.81,.43,.55]} selected={selected===1}/></group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.32,.19,1.09]} size={[.83,.094,.50]} color={selected===3?'#c08853':'#27728d'}/>
      <Box at={[-1.55,.27,1.16]} size={[.195,.11,.17]} color="#b7c3c7" metal={.64}/>
      <Box at={[-1.23,.26,1.07]} size={[.27,.063,.13]} color="#29343d"/>
      {[.9,1.28].map(z=><Box key={z} at={[-1.21,.25,z]} size={[.48,.065,.057]} color="#263037"/>)}
      <Box at={[-.46,.18,1.12]} size={[.61,.10,.45]} color="#dddcd0"/>
      {[-.15,0,.15].map(z=><group key={z} position={[-.43,.26,1.12+z]}><Box at={[0,0,0]} size={[.32,.02,.026]} color="#b3baba" metal={.6}/><Box at={[0,.011,0]} size={[.15,.055,.058]} color="#c0aa7e"/></group>)}
      <mesh position={[-.69,.335,1.2]}><sphereGeometry args={[.05,18,12]}/><meshStandardMaterial color={warning?'#ff764d':'#993d37'} emissive="#ff5e39" emissiveIntensity={warning?2.5:0}/></mesh>
      {warning&&<pointLight position={[-.69,.39,1.23]} color="#ff8365" intensity={.7} distance={.7}/>}
    </group>
    <Line points={[[-1.64,.29,.35],[-1.58,.25,.54],[-1.42,.26,.72],[-1.21,.27,.90]]} color="#e1a758" lineWidth={3}/>
    <Line points={[[.83,.45,.61],[.74,.29,.79],[.11,.24,.93],[-.49,.26,1.01],[-1.15,.27,.90]]} color="#6390be" lineWidth={3}/>
    <Line points={[[.75,.45,.61],[.62,.27,.85],[-.4,.23,.87],[-1.3,.27,.90]]} color="#c86652" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.12,0]} opacity={.31} scale={5.5} far={1.5} resolution={128} frames={1}/>
  </>;
}

type Trial={shade:number;reference:number;warning:boolean};
function measurement(shade:number,reference:number){
  const tray=Math.round(reference*(100-shade)/100);
  return {tray,ratio:reference>=20?Math.floor(tray*100/reference):null};
}

export default function GreenhouseShadeDemo(){
  const [trial,setTrial]=useState<Trial>({shade:0,reference:80,warning:false});
  const [selected,select]=useState(2);
  const {shade,reference,warning}=trial;
  const {tray,ratio}=measurement(shade,reference);
  function change(update:Partial<Pick<Trial,'shade'|'reference'>>){
    setTrial(previous=>{
      const next={...previous,...update};
      const {ratio}=measurement(next.shade,next.reference);
      return {...next,warning:ratio!==null&&(ratio<48||(ratio<55&&previous.warning))};
    });
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D greenhouse shade monitor">
        <Canvas camera={{position:[2.72,2.85,6.3],fov:41}} dpr={[1,1.6]} fallback={<p>Compare the readings below.</p>}>
          <Greenhouse {...{shade,reference,warning,selected,select}}/><OrbitControls target={[0,.78,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Greenhouse light readings">
        <div><span>Reference A0</span><strong>{reference}%</strong></div><div><span>Tray A1</span><strong>{tray}%</strong></div><div><span>Tray / reference</span><strong>{ratio===null?'Unavailable':ratio+'%'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test shade and room light</h3>
      <label className="gp-home-light">Shade screen <output>{shade}%</output><input type="range" aria-label="Shade screen" min="0" max="100" value={shade} onChange={e=>change({shade:e.target.valueAsNumber})}/></label>
      <label className="gp-home-light">Room light <output>{reference}%</output><input type="range" aria-label="Room light" min="0" max="100" value={reference} onChange={e=>change({reference:e.target.valueAsNumber})}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>change({shade:0,reference:80})}>Expose tray</button>
        <button type="button" onClick={()=>change({shade:65,reference:80})}>Shade tray</button>
        <button type="button" onClick={()=>change({reference:10})}>Dim the whole room</button>
      </div>
      <p role="status">{ratio===null?'Reference too dim · Warning paused.':warning?'Tray shaded · Warning LED on.':'Tray clear · Warning LED off.'}</p>
      <p>The ratio compares calibrated sensor signals on a relative scale.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
