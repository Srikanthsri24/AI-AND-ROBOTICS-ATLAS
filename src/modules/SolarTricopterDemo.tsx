import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, PerspectiveCamera, SRGBColorSpace, WebGLRenderTarget, type Group } from 'three';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { TrackerPanel } from './SolarTrackerParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const descriptions=[
  ['Solar panel','The pan servo rotates the carrier toward the brighter light sensor. Balanced or dim readings hold the angle.'],
  ['Shade fin and sensors','The fin shades one photoresistor when the lamp is off-center. The Arduino compares two separate divider counts.'],
  ['Tail pod','Yaw tilts the rear pod. The virtual aircraft rotates in response. The bench model moves the pod without spinning anything.'],
  ['Camera','Aim the virtual camera toward the portrait target, then take a simulated snapshot.'],
] as const;
const deg=MathUtils.degToRad;
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-pressed={selected===i} aria-label={descriptions[i][0]} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{descriptions[i][0]}</span>}</button>
  </WorldLabel>;
}
function Rotor({spinning}:{spinning:boolean}){
  const blade=useRef<Group>(null);
  useFrame((_,dt)=>{if(blade.current&&spinning)blade.current.rotation.y+=dt*33;});
  return <>
    <mesh><cylinderGeometry args={[.115,.119,.16,24]}/><meshStandardMaterial color="#46576c" metalness={.67}/></mesh>
    <group ref={blade} position={[0,.117,0]}>
      <Box at={[0,0,0]} size={[.61,.024,.103]} color="#293442" metal={.33}/>
      {[-.26,.26].map(x=><Box key={x} at={[x,.013,0]} size={[.076,.015,.095]} color="#c6aa72"/>)}
    </group>
  </>;
}
function Bench({pan,lamp,bright,airborne,yaw,ctrl,target,aligned,selected,select,capture,onCapture}:{
  pan:number;lamp:number;bright:boolean;airborne:boolean;yaw:number;ctrl:number;target:number;aligned:boolean;selected:number;select:(i:number)=>void;capture:number;onCapture:(image:string)=>void;
}){
  const frame=useRef<Group>(null);
  const aimingGuide=useRef<Group>(null);
  const lastCapture=useRef(0);
  const {gl,scene}=useThree();
  useEffect(()=>{
    if(capture===0||capture===lastCapture.current)return;
    lastCapture.current=capture;
    const width=320,height=200;
    const camera=new PerspectiveCamera(47,width/height,.06,12);
    const direction=deg(yaw);
    camera.position.set(1.24+Math.sin(direction)*.47,1.22,-.18+Math.cos(direction)*.47);
    camera.lookAt(1.24+Math.sin(direction)*1.57,.33,-.18+Math.cos(direction)*1.57);
    const buffer=new WebGLRenderTarget(width,height);
    buffer.texture.colorSpace=SRGBColorSpace;
    const previous=gl.getRenderTarget();
    const guide=aimingGuide.current;
    try {
      if(guide)guide.visible=false;
      gl.setRenderTarget(buffer);
      gl.render(scene,camera);
      const pixels=new Uint8Array(width*height*4);
      gl.readRenderTargetPixels(buffer,0,0,width,height,pixels);
      const image=document.createElement('canvas');
      image.width=width;image.height=height;
      const ctx=image.getContext('2d');
      if(!ctx)return;
      const flipped=ctx.createImageData(width,height);
      for(let row=0;row<height;row++)flipped.data.set(pixels.subarray((height-1-row)*width*4,(height-row)*width*4),row*width*4);
      ctx.putImageData(flipped,0,0);
      onCapture(image.toDataURL('image/png'));
    } finally {
      if(guide)guide.visible=true;
      gl.setRenderTarget(previous);
      buffer.dispose();
    }
  },[capture,gl,scene,yaw,onCapture]);
  useFrame((_,dt)=>{
    if(frame.current){
      frame.current.position.y=MathUtils.damp(frame.current.position.y,airborne?1.24:.22,5,dt);
      frame.current.rotation.y=MathUtils.damp(frame.current.rotation.y,deg(yaw),7,dt);
    }
  });
  const photoTarget:Point=[1.24+Math.sin(deg(target))*1.43,.17,Math.cos(deg(target))*1.48];
  return <>
    <color attach="background" args={['#28374a']}/>
    <hemisphereLight args={['#e5f0ff','#695d4b',2.34]}/>
    <directionalLight position={[-4,7,5]} intensity={2.45}/>
    <Box at={[0,-.14,0]} size={[6.52,.25,4.32]} color="#526b78"/>
    <Box at={[-1.69,.043,-.33]} size={[1.85,.12,1.78]} color="#334756"/>
    <Box at={[-1.69,.24,-.33]} size={[.57,.35,.45]} color="#2a343d"/>
    <group position={[-1.69,.52,-.33]} rotation={[0,deg(pan),0]}>
      <Box at={[0,0,0]} size={[1.55,.10,1.47]} color="#af916e"/>
      <group position={[0,.24,0]} rotation={[.55,0,0]} scale={.79} onClick={()=>select(0)}><TrackerPanel light={bright?90:13} selected={selected===0}/></group>
      <Marker i={0} at={[-.44,.46,-.31]} {...{selected,select}}/>
      <group position={[.64,.12,.47]} onClick={()=>select(1)}>
        <Box at={[0,0,0]} size={[.43,.052,.31]} color={selected===1?'#d5b268':'#b29064'}/>
        <Box at={[0,.105,0]} size={[.035,.21,.29]} color="#28333b"/>
        {[-.128,.128].map(x=><mesh key={x} position={[x,.039,0]}><cylinderGeometry args={[.063,.063,.03,20]}/><meshStandardMaterial color="#c29062"/></mesh>)}
      </group>
      <Marker i={1} at={[.72,.35,.66]} {...{selected,select}}/>
    </group>
    <mesh position={[-1.69+lamp/70,1.36,1.27]}><sphereGeometry args={[.112,22,16]}/><meshBasicMaterial color={bright?'#ffe09a':'#8590a1'}/></mesh>
    <pointLight position={[-1.69+lamp/70,1.36,1.27]} color="#ffe2a2" intensity={bright?16:0} distance={6}/>
    <group position={[-.83,.074,1.19]} scale={1.25}><Uno at={[0,0,0]}/></group>
    <Line points={[[-1.29,.27,-.17],[-.91,.12,.28],[-.49,.286,.89]]} color="#e1a14f" lineWidth={2.6}/>
    <Box at={[1.24,.031,-.18]} size={[2.34,.052,1.85]} color="#3b5964"/>
    {[-.70,.70].map(x=><Box key={x} at={[1.24+x,.057,-.18]} size={[.042,.014,1.38]} color="#b7c8c7"/>)}
    <group ref={frame} position={[1.24,.22,-.18]}>
      <Box at={[0,.01,0]} size={[.57,.19,.66]} color="#4a5868"/>
      <Box at={[0,.121,-.10]} size={[.38,.056,.30]} color="#36587d"/>
      {[-1,1].map(side=><group key={side} rotation={[0,side*.91,0]}>
        <Box at={[0,0,.38]} size={[.117,.109,.84]} color="#a0aab0" metal={.62}/>
        <group position={[0,.02,.75]}><Rotor spinning={airborne}/></group>
      </group>)}
      <Box at={[0,0,-.51]} size={[.13,.11,.80]} color="#9ca8ae" metal={.55}/>
      <group position={[0,.02,-.89]} rotation={[0,0,deg(ctrl)]} onClick={()=>select(2)}>
        <Box at={[0,-.061,0]} size={[.22,.10,.19]} color={selected===2?'#d7ae63':'#385b76'}/>
        <Rotor spinning={airborne}/>
      </group>
      <Marker i={2} at={[.09,.36,-1.10]} {...{selected,select}}/>
      <group position={[0,-.045,.37]} onClick={()=>select(3)}>
        <Box at={[0,0,0]} size={[.28,.20,.16]} color={selected===3?'#d8b26d':'#27323e'}/>
        <mesh position={[0,.018,.091]}><sphereGeometry args={[.058,22,16]}/><meshStandardMaterial color="#5a9cb7" metalness={.57} roughness={.19}/></mesh>
      </group>
      <Marker i={3} at={[.38,.19,.39]} {...{selected,select}}/>
      {airborne&&<group ref={aimingGuide}><Line points={[[0,-.02,.48],[0,-.9,1.45]]} color={aligned?'#71d9ac':'#789fae'} dashed gapSize={.06} dashSize={.08} lineWidth={2.1}/></group>}
    </group>
    <group position={photoTarget}>
      <Box at={[0,.09,0]} size={[.33,.21,.20]} color={aligned?'#8bd5ad':'#dba867'}/>
      <Box at={[0,.245,0]} size={[.21,.12,.15]} color="#d4b88a"/>
    </group>
  </>;
}

export default function SolarTricopterDemo(){
  const [mode,setMode]=useState<'solar'|'drone'>('solar');
  const [lamp,setLamp]=useState(25);
  const [bright,setBright]=useState(true);
  const [pan,setPan]=useState(0);
  const [yaw,setYaw]=useState(0);
  const [ctrl,setCtrl]=useState(0);
  const [target,setTarget]=useState(28);
  const [airborne,fly]=useState(false);
  const [selected,select]=useState(0);
  const [shot,setShot]=useState<number|null>(null);
  const [capture,setCapture]=useState(0);
  const [portrait,setPortrait]=useState<string|null>(null);
  const [notice,setNotice]=useState('Use the lamp and shade to test the panel.');
  const difference=bright?Math.round((lamp-pan)*10):0;
  const aligned=airborne&&Math.abs(yaw-target)<=7;
  useEffect(()=>{
    const timer=window.setInterval(()=>{
      if(mode==='solar'&&bright)setPan(value=>Math.abs(lamp-value)>3?value+Math.sign(lamp-value):value);
      if(mode==='drone'&&airborne)setYaw(value=>MathUtils.clamp(value+ctrl*.07,-65,65));
    },40);
    return ()=>window.clearInterval(timer);
  },[mode,bright,lamp,airborne,ctrl]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D solar and tricopter workbench">
        <Canvas camera={{position:[3.7,5.5,7.6],fov:42}} dpr={[1,1.6]} fallback={<p>Use the practice controls and state readouts.</p>}>
          <Bench {...{pan,lamp,bright,airborne,yaw,ctrl,target,aligned,selected,select,capture}} onCapture={setPortrait}/>
          <OrbitControls target={[0,.45,.08]} minDistance={4.7} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Workbench readings">
        <div><span>Solar pan</span><strong>{pan}°</strong></div>
        <div><span>Light difference</span><strong>{difference}</strong></div>
        <div><span>Tricopter yaw</span><strong>{Math.round(yaw)}°</strong></div>
        <div><span>Camera</span><strong>{aligned?'Framed':'Unframed'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Choose a station</h3>
      <div className="gp-steps" role="group" aria-label="Workbench station">
        <button type="button" aria-pressed={mode==='solar'} onClick={()=>{fly(false);setCtrl(0);setMode('solar');setNotice('Use the lamp and shade to test the panel.');}}>Solar station</button>
        <button type="button" aria-pressed={mode==='drone'} onClick={()=>{setMode('drone');setNotice('Lift the virtual tricopter and steer toward the target.');}}>Tricopter station</button>
      </div>
      {mode==='solar'?<>
        <label className="gp-solar-light">Lamp heading · {lamp}° <input type="range" min="-45" max="45" value={lamp} onChange={event=>setLamp(Number(event.target.value))}/></label>
        <div className="gp-steps"><button type="button" aria-pressed={!bright} onClick={()=>setBright(value=>!value)}>Cover light sensors</button></div>
      </>:<>
        <label className="gp-solar-light">Tail tilt command · {ctrl}° <input type="range" min="-25" max="25" step="1" value={ctrl} onChange={event=>setCtrl(Number(event.target.value))}/></label>
        <label className="gp-solar-light">Portrait target · {target}° <input type="range" min="-50" max="50" value={target} onChange={event=>setTarget(Number(event.target.value))}/></label>
        <div className="gp-steps">
          <button type="button" onClick={()=>{fly(!airborne);setCtrl(0);}}>{airborne?'Land':'Lift into hover'}</button>
          <button type="button" onClick={()=>setCtrl(0)}>Center tail</button>
          <button type="button" className="gp-button" disabled={!aligned} onClick={()=>{setShot(Math.round(yaw));setCapture(value=>value+1);setNotice('Simulated portrait captured.');}}>Capture portrait</button>
        </div>
        {portrait&&<figure className="gp-tricopter-portrait"><img src={portrait} alt="Virtual tricopter camera capture"/><figcaption>Capture heading · {shot}°</figcaption></figure>}
      </>}
      <p role="status" className="gp-demo-description">{notice}</p>
      <ol className="gp-demo-labels">{descriptions.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{descriptions[selected][1]}</p>
    </div>
  </div>;
}
