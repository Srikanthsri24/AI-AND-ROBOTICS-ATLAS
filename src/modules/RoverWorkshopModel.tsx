import { WorldLabel } from './LabWorkbench';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, RoundedBox } from '@react-three/drei';
import { CanvasTexture, CatmullRomCurve3, Group, InstancedMesh, Matrix4, Mesh, Object3D, Vector3 } from 'three';
export type RoverPart = 'chassis' | 'motors' | 'wheels' | 'decks' | 'driver' | 'controller' | 'sensor' | 'servo' | 'power' | 'wiring' | 'led' | 'buzzer';
export const workshopParts: {
    id: RoverPart;
    name: string;
    why: string;
    connection: string;
}[] = [
    { id: 'chassis', name: 'Acrylic chassis', why: 'Keeps the motor shafts aligned and carries the electronics.', connection: 'Motor brackets fasten underneath. Brass standoffs support the upper deck.' },
    { id: 'motors', name: 'Four geared motors', why: 'Gearboxes reduce speed and increase torque at the wheels.', connection: 'Each side receives matching direction commands. This four-wheel reference uses a separately rated driver channel per motor.' },
    { id: 'wheels', name: 'Rubber tyres and hubs', why: 'The tread grips the floor. Different left and right speeds turn the car.', connection: 'Yellow hubs push onto the gearbox output shafts.' },
    { id: 'decks', name: 'Upper deck and fasteners', why: 'Creates space for the controller and battery above the motors.', connection: 'Screws pass through the acrylic into six brass standoffs.' },
    { id: 'driver', name: 'Motor driver stage', why: 'Two dual-channel drivers switch battery current into the four motors while the Uno supplies control signals.', connection: 'Each board drives one front or rear pair. D5/D6, D4/D7 and D8/D11 are shared between corresponding left/right channels. D12 enables both boards. Each motor has its own two-wire output pair.' },
    { id: 'controller', name: 'Arduino Uno', why: 'Reads distance, selects an action and commands the outputs.', connection: 'D2 TRIG · D3 ECHO · D9 servo · D10 LED · A0 buzzer. All circuits share ground.' },
    { id: 'sensor', name: 'Ultrasonic sensor', why: 'Estimates range from the time between a trigger pulse and its returning echo.', connection: 'VCC → 5 V, GND → ground, TRIG → D2, ECHO → D3. The cone illustrates the simulator’s range direction.' },
    { id: 'servo', name: 'Scanning servo', why: 'Looks left and right while the car is stopped to compare clear space.', connection: 'Signal → D9. Regulated servo power and common ground. Center is 90°, left scan 145°, right scan 35°.' },
    { id: 'power', name: 'Switched battery pack', why: 'Supplies the motor current. A regulated rail supplies the controller and servo.', connection: 'Battery → switch → motor supply. Use a regulated logic supply and join grounds. Match the pack to the actual motors.' },
    { id: 'wiring', name: 'Signal and power wiring', why: 'Carries commands and power between the parts.', connection: 'Red is positive, black is ground, yellow is ultrasonic signal, orange is servo signal, green/blue are motor control.' },
    { id: 'led', name: 'Status LED', why: 'Lights when the obstacle routine stops the car.', connection: 'D10 → 330 Ω resistor → LED anode. Cathode → GND.' },
    { id: 'buzzer', name: 'Piezo sounder', why: 'Gives an audible warning during the obstacle stop.', connection: 'A0 used as a digital output → passive piezo → GND.' },
];
type Point = [
    number,
    number,
    number
];
export function Mount({children,from=[0,1,0],delay=0}:{children:React.ReactNode;from?:Point;delay?:number}) {
    const group=useRef<Group>(null);
    const elapsed=useRef(0);
    const reduced=useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useFrame((_,dt)=>{
        if(!group.current)return;
        elapsed.current+=dt;
        const progress=reduced.current?1:Math.min(1,Math.max(0,(elapsed.current-delay)/2.2));
        const remaining=1-(progress*progress*(3-2*progress));
        group.current.position.set(from[0]*remaining,from[1]*remaining,from[2]*remaining);
    });
    return <group name="workshop-mount" ref={group} position={from}>{children}</group>;
}
function BoardPrint(){
    const texture=useMemo(()=>{
        const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;
        const ctx=canvas.getContext('2d')!;
        ctx.fillStyle='#19758a';ctx.fillRect(0,0,512,768);
        ctx.fillStyle='#e7eee6';ctx.font='bold 40px Arial';ctx.fillText('UNO',175,155);
        ctx.font='17px Arial';ctx.fillText('DIGITAL  PWM ~',160,40);ctx.fillText('ANALOG IN',290,724);
        ctx.strokeStyle='#d0d9c9';ctx.lineWidth=2;ctx.strokeRect(165,250,170,325);
        for(let i=0;i<12;i++){ctx.fillText(String(i),38,160+i*43);ctx.fillText(String(i),443,160+i*43);}
        return new CanvasTexture(canvas);
    },[]);
    useEffect(()=>()=>texture.dispose(),[texture]);
    return <mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,0]}><planeGeometry args={[.75,.99]}/><meshStandardMaterial map={texture} roughness={.58}/></mesh>;
}
export function Wire({points,color,width=3,connectors=true,startRotation,segments=40}:{points:Point[];color:string;width?:number;connectors?:boolean;startRotation?:Point;segments?:number}) {
    const pathKey=points.map(point=>point.join(',')).join('|');
    const curve=useMemo(()=>new CatmullRomCurve3(points.map(p=>new Vector3(...p))),[pathKey]);
    const tube=useRef<Mesh>(null);
    const elapsed=useRef(0);
    const reduced=useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useFrame((_,dt)=>{elapsed.current+=dt;if(tube.current){const progress=reduced.current?1:Math.min(1,elapsed.current/.95);tube.current.geometry.setDrawRange(0,Math.floor(progress*segments)*48);}});
    return <group>
        <mesh ref={tube} castShadow><tubeGeometry args={[curve,segments,width*.0031,8,false]}/><meshStandardMaterial color={color} roughness={.39}/></mesh>
        {!connectors&&<mesh><tubeGeometry args={[curve,40,.03,8,false]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/></mesh>}
        {connectors&&[points[0],points[points.length-1]].map((at,index)=><group key={index} position={at} rotation={index===0?startRotation:undefined}>
            <Solid at={[0,0,0]} size={[.036,.075,.034]} color='#222730'/>
            <Solid at={[0,-.044,0]} size={[.009,.03,.009]} color='#d7b66e' metal={.8}/>
        </group>)}
    </group>;
}
function Solid({ at, size, color, metal = 0, glow = false }: {
    at: Point;
    size: Point;
    color: string;
    metal?: number;
    glow?: boolean;
}) {
    return <RoundedBox position={at} args={size} radius={Math.min(...size) * .16} smoothness={2} castShadow receiveShadow><meshStandardMaterial color={color} metalness={metal} roughness={metal > .4 ? .27 : .48} emissive={glow ? color : '#000'} emissiveIntensity={glow ? 1.4 : 0}/></RoundedBox>;
}
function Bolt({ at }: {
    at: Point;
}) {
    return <group position={at}><mesh castShadow><cylinderGeometry args={[.036, .036, .025, 6]}/><meshStandardMaterial color="#b5bcc4" metalness={.85} roughness={.24}/></mesh><Solid at={[0, .014, 0]} size={[.038, .003, .008]} color="#48505b"/></group>;
}
function Plate({ y, upper, active }: {
    y: number;
    upper?: boolean;
    active: boolean;
}) {
    return <group position={[0, y, 0]}>
  <RoundedBox args={[1.62, .055, 2.62]} radius={.12} smoothness={4} castShadow receiveShadow><meshPhysicalMaterial color={active ? '#c5a4ff' : '#d1f2ee'} roughness={.08} metalness={.02} transparent opacity={active ? .48 : .22} clearcoat={1} side={2}/></RoundedBox>
  {[-.67, .67].flatMap(x => [-1.1, 0, 1.1].map(z => <group key={`${x},${z}`}><Bolt at={[x, .037, z]}/>{!upper && <mesh position={[x, .18, z]} castShadow><cylinderGeometry args={[.036, .036, .31, 12]}/><meshStandardMaterial color="#c6a44f" metalness={.8} roughness={.26}/></mesh>}</group>))}
  {[-.45, .45].map(x => <Solid key={x} at={[x, -.031, .15]} size={[.035, .003, .63]} color="#dce6de"/>)}
 </group>;
}
function TyreTread({color}:{color:string}){
    const tread=useRef<InstancedMesh>(null);
    const grooves=useRef<InstancedMesh>(null);
    useLayoutEffect(()=>{
        const part=new Object3D();
        let index=0;
        for(let segment=0;segment<36;segment++){
            const around=new Matrix4().makeRotationY(segment*Math.PI/18);
            for(const side of [-1,1]){
                part.position.set(0,side*.078,.446);part.rotation.set(0,0,side*.28);part.updateMatrix();
                const placement=new Matrix4().multiplyMatrices(around,part.matrix);
                tread.current!.setMatrixAt(index,placement);
                grooves.current!.setMatrixAt(index,new Matrix4().multiplyMatrices(placement,new Matrix4().makeTranslation(.025,0,.03)));
                index++;
            }
        }
        tread.current!.instanceMatrix.needsUpdate=true;grooves.current!.instanceMatrix.needsUpdate=true;
    },[]);
    return <>
        <instancedMesh ref={tread} args={[undefined,undefined,72]} castShadow receiveShadow><boxGeometry args={[.062,.137,.056]}/><meshStandardMaterial color={color} roughness={.88}/></instancedMesh>
        <instancedMesh ref={grooves} args={[undefined,undefined,72]}><boxGeometry args={[.009,.10,.005]}/><meshStandardMaterial color='#404649' roughness={.93}/></instancedMesh>
    </>;
}
function Wheel({at,spin,active}:{at:Point;spin:number;active:boolean}){
    const rubber=active?'#574467':'#24282b';
    return <group position={at} rotation={[spin,0,Math.PI/2]}>
        <mesh castShadow receiveShadow><cylinderGeometry args={[.435,.435,.29,64]}/><meshStandardMaterial color={rubber} roughness={.89}/></mesh>
        {[-1,1].map(side=><group key={side} position={[0,side*.145,0]} rotation={[Math.PI/2,0,0]}>
            <mesh castShadow><torusGeometry args={[.375,.071,12,64]}/><meshStandardMaterial color={rubber} roughness={.84}/></mesh>
            <mesh><torusGeometry args={[.304,.014,8,48]}/><meshStandardMaterial color='#eeb820' roughness={.42}/></mesh>
        </group>)}
        <TyreTread color={rubber}/>
        {[-1,1].map(side=><group key={side} position={[0,side*.16,0]}>
            <mesh><cylinderGeometry args={[.125,.125,.045,32]}/><meshStandardMaterial color='#eeb823' roughness={.34}/></mesh>
            {Array.from({length:5},(_,index)=><group key={index} rotation={[0,index*Math.PI*2/5,0]}>
                <Solid at={[0,0,.195]} size={[.085,.035,.22]} color='#f0bf26'/>
                <mesh position={[0,side*.022,.27]}><cylinderGeometry args={[.018,.018,.012,12]}/><meshStandardMaterial color='#e2a917' metalness={.2}/></mesh>
            </group>)}
            <mesh><cylinderGeometry args={[.045,.045,.065,6]}/><meshStandardMaterial color='#b6bec4' metalness={.8} roughness={.25}/></mesh>
        </group>)}
    </group>;
}
export function Uno({ active }: {
    active: boolean;
}) {
    return <group>
  <BoardPrint/>
  {active&&<Line points={[[ -.38,.056,-.50],[.38,.056,-.50],[.38,.056,.50],[-.38,.056,.50],[-.38,.056,-.50]]} color="#ba88f4" lineWidth={3}/>}
  <Solid at={[0, 0, 0]} size={[.76, .045, 1.00]} color={active ? '#9a78d4' : '#147e9d'}/>
  <Solid at={[-.19, .09, -.44]} size={[.22, .16, .22]} color="#c4c9cf" metal={.8}/>
  <Solid at={[.23, .069, -.44]} size={[.15, .10, .18]} color="#2a3036"/>
  <Solid at={[0, .047, .08]} size={[.14, .065, .40]} color="#202830"/>
  {[-1, 1].flatMap(side => Array.from({ length: 12 }, (_, i) => <group key={`${side},${i}`}><Solid at={[side * .31, .063, -.28 + i * .059]} size={[.075, .065, .043]} color="#202b31"/><Solid at={[side * .31, .099, -.28 + i * .059]} size={[.029, .008, .019]} color="#a3a9ab" metal={.6}/></group>))}
  {Array.from({ length: 14 }, (_, i) => <Solid key={i} at={[i % 2 ? .17 : -.15, .042, -.17 + Math.floor(i / 2) * .075]} size={[.046, .017, .025]} color={i % 3 ? '#d5c6a2' : '#c3cad0'} metal={.3}/>)}
  {[-.28, .28].flatMap(x => [-.41, .41].map(z => <Bolt key={`${x},${z}`} at={[x, .03, z]}/>))}
  <Solid at={[.20, .06, .30]} size={[.038, .028, .044]} color="#6bea80" glow/>
 </group>;
}
export function WorkshopRover({ step, explode, selected, onSelect, spin = 0, servo = 90, alert = false, beam = false }: {
    step: number;
    explode: boolean;
    selected: RoverPart;
    onSelect: (part: RoverPart) => void;
    spin?: number;
    servo?: number;
    alert?: boolean;
    beam?: boolean;
}) {
    const top = useRef<Group>(null);
    useFrame((_, dt) => { if (top.current)
        top.current.position.y += ((explode ? 1.28 : 0) - top.current.position.y) * Math.min(dt * 8, 1); });
    const choose = (part: RoverPart) => (event: {
        stopPropagation: () => void;
    }) => { event.stopPropagation(); onSelect(part); };
    return <group>
  <group onClick={choose('chassis')}><Plate y={.58} active={selected === 'chassis'}/></group>
  {step >= 1 && [-1, 1].flatMap(side => [-.84, .84].map(z => <group key={`${side},${z}`}>
    <group onClick={choose('motors')}><Mount from={[side*.45,-.2,0]}><Solid at={[side * .53, .47, z]} size={[.34, .31, .52]} color={selected === 'motors' ? '#d29bff' : '#efb72b'}/><Solid at={[side * .34, .47, z + .24]} size={[.26, .25, .32]} color="#aeb5b5" metal={.75}/><Solid at={[side * .77, .47, z]} size={[.12, .12, .13]} color="#ece3c2"/>
      <Solid at={[side * .57, .65, z]} size={[.43, .045, .10]} color="#d5ded7" metal={.5}/><Bolt at={[side * .67, .69, z]}/></Mount>
    </group>
    <group onClick={choose('wheels')}><Mount from={[side*.75,.25,0]} delay={.2}><Wheel at={[side * .96, .47, z]} spin={spin} active={selected === 'wheels'}/></Mount></group>
  </group>))}
  <group ref={top}>
    {step >= 2 && <group onClick={choose('decks')}><Mount from={[0,.85,0]}><Plate y={.94} upper active={selected === 'decks'}/></Mount></group>}
    {step >= 3 && <group onClick={choose('driver')}>
      {[-.48,.15].map((z,index)=><group key={z} position={[-.42,1.02,z]}>
        <Mount from={[0,.7,0]} delay={index*.25}>
          <Solid at={[0,0,0]} size={[.39,.045,.57]} color={selected==='driver'?'#ad76da':'#b23e43'}/>
          <Solid at={[0,.055,0]} size={[.19,.10,.25]} color='#222f34'/>
          {[-.12,-.06,0,.06,.12].map(x=><Solid key={x} at={[x,.16,0]} size={[.025,.14,.22]} color='#41484d' metal={.7}/>)}
          {[-.22,.22].map(end=><group key={end}>
            <Solid at={[0,.055,end]} size={[.31,.10,.09]} color='#398a7f'/>
            {[-.09,.09].map(x=><Bolt key={x} at={[x,.11,end]}/>)}
          </group>)}
        </Mount>
      </group>)}
    </group>}
    {step >= 4 && <group position={[.25, 1.04, -.11]} onClick={choose('controller')}><Mount from={[0,.9,0]}><Uno active={selected === 'controller'}/></Mount></group>}
    {step >= 5 && <group position={[0, 1.03, -1.08]}>
      <group onClick={choose('servo')}><Solid at={[0, .10, 0]} size={[.35, .26, .20]} color={selected === 'servo' ? '#ac7edb' : '#285dba'}/><Solid at={[0, .24, 0]} size={[.31, .05, .11]} color="#e3dace"/></group>
      <group rotation={[0, (servo - 90) * Math.PI / 180, 0]}>
        <Solid at={[0, .34, 0]} size={[.44, .20, .06]} color="#303d43"/>
        <group position={[0, .43, -.047]} onClick={choose('sensor')}>
          <Solid at={[0, 0, 0]} size={[.57, .26, .035]} color={selected === 'sensor' ? '#9c71d7' : '#167d93'}/>
          {[-.17, .17].map(x => <group key={x} position={[x, 0, -.065]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow><cylinderGeometry args={[.107, .107, .13, 32]}/><meshStandardMaterial color="#bfc8cb" metalness={.85} roughness={.22}/></mesh>
            <mesh position={[0, -.068, 0]}><cylinderGeometry args={[.079, .079, .005, 24]}/><meshStandardMaterial color="#36444b" metalness={.55} roughness={.65}/></mesh>
            {Array.from({ length: 5 }, (_, i) => <Solid key={i} at={[(i - 2) * .025, -.073, 0]} size={[.005, .003, .12]} color="#79858b"/>)}
          </group>)}
        </group>
        {beam && <mesh position={[0, .43, -1.17]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[.43, 2.1, 32, 1, true]}/><meshBasicMaterial color={alert ? '#e98449' : '#4abac6'} transparent opacity={.12} depthWrite={false} side={2}/></mesh>}
      </group>
    </group>}
    {step >= 6 && <group position={[0, 1.11, .85]} onClick={choose('power')}>
      <Solid at={[0, -.02, 0]} size={[.96, .16, .78]} color={selected === 'power' ? '#8f6bb7' : '#2c333b'}/>
      {[-.21, .21].map(x => <group key={x} position={[x, .08, 0]} rotation={[Math.PI / 2, 0, 0]}><mesh castShadow><cylinderGeometry args={[.18, .18, .65, 40]}/><meshStandardMaterial color="#287ac6" metalness={.38} roughness={.35}/></mesh><mesh position={[0, .335, 0]}><cylinderGeometry args={[.125, .125, .018, 24]}/><meshStandardMaterial color="#c5cace" metalness={.85}/></mesh></group>)}
      <Solid at={[.42, .12, .21]} size={[.12, .05, .08]} color="#20292e"/>
    </group>}
    {step >= 7 && <group onClick={choose('wiring')}>
      {[
                { p: [[-.40, 1.09, -.43], [-.56, 1.36, -.52], [-.24, 1.42, -.72], [.21, 1.14, -.43]], c: '#45a8a1' },
                { p: [[.20, 1.14, -.47], [.19, 1.65, -.67], [0, 1.71, -1.07], [0, 1.51, -1.11]], c: '#e5ba53' },
                { p: [[.29, 1.14, -.45], [.28, 1.68, -.72], [.06, 1.75, -1.07], [.06, 1.32, -1.09]], c: '#bd4f45' },
                { p: [[.35, 1.14, -.46], [.34, 1.62, -.73], [.10, 1.66, -1.07], [.10, 1.30, -1.09]], c: '#25323e' },
                { p: [[-.25, 1.14, .94], [-.60, 1.19, .63], [-.61, 1.19, -.30], [-.44, 1.13, -.36]], c: '#c4493e' },
                { p: [[.23, 1.15, .93], [.64, 1.19, .56], [.63, 1.21, .18], [.50, 1.13, .12]], c: '#263641' },
            ].map((wire, i) => <Wire key={i} points={wire.p as Point[]} color={selected === 'wiring' ? '#ba85ed' : wire.c} width={selected === 'wiring' ? 4 : 3}/>)}
      {[-1,1].flatMap(side=>[-.84,.84].map(z=>{
        const driverZ=z<0?-.48:.15;
        const terminalZ=driverZ+(side<0?-.22:.22);
        return <group key={`${side},${z}`}>
          {[0,.035].map((offset,index)=><Wire key={index} points={[
            [side*.28,.52,z+.24+offset],
            [side*.16,.76,z+offset],
            [-.42+(index? .065:-.065),1.08,terminalZ],
          ]} color={selected==='wiring'?'#ba85ed':index?'#333a44':side<0?'#5d9ac5':'#4ca68b'} width={2.5}/>)}
        </group>;
      }))}
      {['#dcaa4c','#4d92b2','#4ea08b'].map((color,index)=><Wire key={color} points={[
        [-.59+index*.045,1.13,-.49],
        [-.67+index*.045,1.32,-.30],
        [-.67+index*.045,1.32,-.03],
        [-.59+index*.045,1.13,.15],
      ]} color={selected==='wiring'?'#ba85ed':color} width={2.2}/>)}
      {[-.48,.15].map(z=><group key={z}>
        <Wire points={[[-.25,1.15,.94],[-.65,1.19,.72],[-.69,1.15,z],[-.55,1.10,z]]} color={selected==='wiring'?'#ba85ed':'#c4493e'}/>
        <Wire points={[[.23,1.15,.93],[-.62,1.12,.75],[-.65,1.10,z+.05],[-.53,1.10,z+.05]]} color={selected==='wiring'?'#ba85ed':'#263641'}/>
      </group>)}
    </group>}
    {step >= 7 && <><group onClick={choose('led')}>
      <group position={[-.54,1.09,-.54]} rotation={[Math.PI/2,0,0]}>
        <mesh><cylinderGeometry args={[.022,.022,.12,16]}/><meshStandardMaterial color='#d5bb8e' roughness={.65}/></mesh>
        {['#df7837','#df7837','#65442c','#c4a24f'].map((color,index)=><mesh key={index} position={[0,(index-1.5)*.024,0]}><cylinderGeometry args={[.023,.023,.009,16]}/><meshStandardMaterial color={color}/></mesh>)}
      </group>
      <Wire points={[[.48,1.14,-.40],[-.33,1.21,-.43],[-.54,1.10,-.46]]} color='#bd554c' width={1.7}/>
      <Wire points={[[-.54,1.10,-.61],[-.54,1.12,-.65],[-.54,1.12,-.68]]} color='#b6bdc4' width={1.4}/>
      <mesh position={[-.54, 1.11, -.68]} castShadow><sphereGeometry args={[.045, 16, 12]}/><meshStandardMaterial color={selected === 'led' ? '#bb7fe5' : '#e64a3f'} emissive="#ee4326" emissiveIntensity={alert ? 2 : 0}/></mesh></group><group onClick={choose('buzzer')}><mesh position={[.54, 1.07, .54]} castShadow><cylinderGeometry args={[.10, .10, .11, 24]}/><meshStandardMaterial color={selected === 'buzzer' ? '#af82d8' : '#25313c'}/></mesh><Solid at={[.54, 1.13, .54]} size={[.035, .005, .035]} color="#111a24"/></group></>}
    <WorldLabel className="rw-label-anchor" position={[selected === 'power' ? 0 : selected === 'driver' ? -.42 : selected === 'sensor' || selected === 'servo' ? 0 : .25, selected === 'sensor' ? 1.85 : 1.65, selected === 'sensor' || selected === 'servo' ? -1.1 : selected === 'power' ? .85 : 0]}><span className="rw-world-label">{workshopParts.find(part => part.id === selected)?.name}<small>{selected==='sensor'?'TRIG D2 · ECHO D3':selected==='servo'?'Signal D9 · regulated power':selected==='wiring'?'Two leads per motor · common control bus':'Selected part · highlighted in purple'}</small></span></WorldLabel>
  </group>
 </group>;
}
