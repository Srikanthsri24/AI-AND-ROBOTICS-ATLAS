import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group, type PerspectiveCamera } from 'three';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { CameraBoard, SerialAdapter } from './TiltCameraDemo';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
const labels: {name:string; at:Point; detail:string}[] = [
  {name:'OV2640 camera',at:[-.38,1.15,1.26],detail:'The ribbon carries camera data to the ESP32-CAM. The still preview shows what this lens sees from its mount.'},
  {name:'Reed switch · GPIO13',at:[1.04,1.39,.01],detail:'The fixed wired contact reads low when its magnet is next to it. An open door separates them and GPIO13 reads high.'},
  {name:'Door and magnet',at:[-.03,1.77,-.05],detail:'The magnet follows the door panel. Closing the door brings it back to the switch and rearms the next capture.'},
  {name:'USB-to-serial adapter',at:[-1.43,.50,-.24],detail:'This cable uploads code and shows the Wi-Fi address in Serial Monitor. The camera gets power from a separate 5 V supply.'},
];

function Contact({selected=false}:{selected?:boolean}) {
  return <>
    <Box at={[0,0,0]} size={[.225,.08,.135]} color={selected?'#e4ad66':'#e7e5d9'}/>
    {[-.077,.077].map(x=><mesh key={x} position={[x,.043,0]}><cylinderGeometry args={[.017,.017,.015,12]}/><meshStandardMaterial color="#77858e" metalness={.7}/></mesh>)}
  </>;
}

function Doorway({open,request,select,selected,onStill}:{open:boolean;request:number;select:(i:number)=>void;selected:number;onStill:(image:string)=>void}) {
  const door = useRef<Group>(null);
  const lens = useRef<PerspectiveCamera>(null);
  const saved = useRef(0);
  useFrame(({gl,scene,camera,size},delta)=>{
    if(!door.current||!lens.current) return;
    const heading=open?-1.83:0;
    door.current.rotation.y=MathUtils.damp(door.current.rotation.y,heading,11,delta);
    if(request===0||saved.current===request||Math.abs(door.current.rotation.y-heading)>.045) return;
    saved.current=request;
    lens.current.aspect=size.width/Math.max(size.height,1);
    lens.current.lookAt(.50,.67,-.65);
    lens.current.updateProjectionMatrix();
    scene.updateMatrixWorld(true);
    gl.render(scene,lens.current);
    const still=gl.domElement.toDataURL('image/jpeg',.87);
    gl.render(scene,camera);
    onStill(still);
  });
  return <>
    <color attach="background" args={['#263d4d']}/>
    <hemisphereLight args={['#edf5fb','#867264',2.35]}/>
    <directionalLight position={[-3,6,4]} color="#fff1dd" intensity={2.35}/>
    <directionalLight position={[4,4,-4]} color="#b4d3e4" intensity={1.05}/>
    <RoundedBox args={[4.8,.24,3.65]} radius={.065} position={[0,-.13,0]}><meshStandardMaterial color="#73878c" roughness={.72}/></RoundedBox>
    <Box at={[.24,.10,-.69]} size={[2.65,.20,1.65]} color="#8a7764"/>
    {Array.from({length:14},(_,i)=><Box key={i} at={[-1.015+i*.188,.206,-.68]} size={[.012,.005,1.59]} color="#674e40"/>)}
    <Box at={[.33,.96,-1.49]} size={[2.55,1.62,.13]} color="#c4b397"/>
    <Box at={[1.52,.96,-.84]} size={[.14,1.62,1.37]} color="#b9a78d"/>
    {Array.from({length:12},(_,i)=><Box key={i} at={[.33,.32+i*.115,-1.416]} size={[2.49,.007,.009]} color="#9b8d74"/>)}
    <Box at={[-.44,.99,.017]} size={[.14,1.58,.18]} color="#8a6853"/>
    <Box at={[1.19,.99,.017]} size={[.14,1.58,.18]} color="#8a6853"/>
    <Box at={[.38,1.79,.017]} size={[1.77,.13,.18]} color="#8a6853"/>
    <Box at={[.38,.215,.017]} size={[1.53,.063,.21]} color="#6f5a49"/>
    <group ref={door} position={[-.36,.236,.10]} onClick={()=>select(2)}>
      <Box at={[.697,.734,.027]} size={[1.39,1.47,.092]} color={selected===2?'#bb8464':'#a16f53'}/>
      <Box at={[.693,.84,.081]} size={[1.11,1.09,.032]} color="#775744"/>
      <Box at={[.693,.84,.103]} size={[1.01,.985,.022]} color="#aa785a"/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[.26+i*.123,.84,.116]} size={[.007,.978,.004]} color="#8d664f"/>)}
      <Box at={[1.19,.67,.125]} size={[.062,.14,.065]} color="#c0a383" metal={.6}/>
      <group position={[1.28,1.056,.101]}><Contact selected={selected===2}/></group>
      {[.23,1.22].map(y=><Box key={y} at={[.035,y,.095]} size={[.1,.145,.045]} color="#8f9b9c" metal={.65}/>)}
    </group>
    <group position={[1.20,1.292,.20]} onClick={()=>select(1)}><Contact selected={selected===1}/></group>
    <Box at={[.52,.405,-.82]} size={[.52,.39,.44]} color="#c7955e"/>
    <Box at={[.52,.604,-.82]} size={[.11,.011,.44]} color="#dfbb80"/>
    <Box at={[.59,.463,-.596]} size={[.18,.105,.005]} color="#e9dec5"/>
    <Box at={[.06,.301,-1.01]} size={[.26,.18,.24]} color="#789892"/>
    <Box at={[-.59,.076,1.23]} size={[.66,.16,.72]} color="#5d6e75" metal={.35}/>
    <Box at={[-.59,.325,1.23]} size={[.081,.53,.09]} color="#697b84" metal={.53}/>
    <Box at={[-.59,.613,1.23]} size={[.39,.11,.37]} color="#657680"/>
    <group position={[-.41,.76,1.14]} rotation={[0,-.40,0]} onClick={()=>select(0)}>
      <group rotation={[-Math.PI/2,0,0]} scale={.55}><CameraBoard highlighted={selected===0}/></group>
    </group>
    <perspectiveCamera ref={lens} args={[56,1,.04,12]} position={[-.33,.98,.94]}/>
    <group position={[-1.64,.11,-.46]} scale={.60} onClick={()=>select(3)}><SerialAdapter highlighted={selected===3}/></group>
    <Line points={[[-1.36,.22,-.42],[-1.52,.13,.14],[-1.45,.20,.85],[-.42,.78,1.20]]} color="#4b96ae" lineWidth={2.7}/>
    <Line points={[[1.25,1.30,.20],[1.36,1.22,.19],[1.44,.36,.18],[1.39,.11,.53],[.24,.13,1.32],[-.59,.45,1.18],[-.40,.78,1.18]]} color="#ceb063" lineWidth={2.75}/>
    <Line points={[[-2.28,.07,1.52],[-1.80,.071,1.46],[-1.41,.21,1.38],[-.44,.77,1.20]]} color="#363b40" lineWidth={3.8}/>
    {labels.map(({at,name},index)=><WorldLabel key={name} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>
        {index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.008,0]} opacity={.34} scale={5} far={1.2} resolution={128} frames={1}/>
  </>;
}

export default function Esp32DoorCameraDemo() {
  const [open,setOpen] = useState(false);
  const [request,requestStill] = useState(0);
  const [count,setCount] = useState(0);
  const [image,setImage] = useState('');
  const [selected,select] = useState(0);
  const nextRequest = useRef(0);
  function moveDoor(){
    setOpen(!open);
    requestStill(open?0:++nextRequest.current);
  }
  function restart(){
    requestStill(0);
    setCount(0);
    setImage('');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D ESP32-CAM doorway model">
        <Canvas camera={{position:[3.15,3.4,6.0],fov:44}} dpr={[1,1.6]} fallback={<p>Follow the event counter and capture status below.</p>}>
          <Doorway {...{open,request,selected,select}} onStill={still=>{setImage(still);setCount(previous=>previous+1);requestStill(0);}}/>
          <OrbitControls target={[0,.52,-.10]} enablePan={false} minDistance={3.9} maxDistance={10} maxPolarAngle={1.48}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Door camera readings">
        <div><span>Door</span><strong>{open?'Open':'Closed'}</strong></div>
        <div><span>GPIO13 contact</span><strong>{open?'High':'Low'}</strong></div>
        <div><span>Successful captures</span><strong>{count}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Door camera dashboard</h3>
      <p>Open the model door to take a still. Hold it open and check that the counter stays fixed. Close it to rearm the next capture.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={moveDoor}>{open?'Close door':'Open door'}</button>
        <button type="button" onClick={restart}>Restart camera</button>
      </div>
      <p role="status">{request?'Taking a still…':open?'Door open · Close to rearm':'Door closed · Ready'}</p>
      {image?<figure className="gp-door-camera-still"><img src={image} alt={`Latest camera still of the model doorway, event ${count}`}/><figcaption>Camera view · Event {count}</figcaption></figure>:<p>No snapshot yet.</p>}
      <ol className="gp-demo-labels">{labels.map(({name},index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
