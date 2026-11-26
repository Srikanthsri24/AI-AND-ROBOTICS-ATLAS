import {memo,useMemo,useEffect,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {CatmullRomCurve3,MeshPhysicalMaterial,Path,Shape,Vector3} from 'three';
import {Text} from '@react-three/drei';
import BluetoothMiniBreadboard from './BluetoothMiniBreadboard';
import {railwayWarningBoardAt,railwayWarningHole,railwayWarningPins as pins,railwayServoLeads,railwayServoTail,railwayServoContact} from '../data/railway-electrical-layout';
import type {RailwayClock} from '../data/railway-workshop';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function RailwayElectricalParts({selected='',select=()=>{},clock}:{selected?:string;select?:(id:string)=>void;clock?:RefObject<RailwayClock>}){
 const lens=useMemo(()=>new MeshPhysicalMaterial({color:'#bb263d',roughness:.14,metalness:0,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:.78,transmission:.12,ior:1.5,emissive:'#ff233f'}),[]);
 useEffect(()=>()=>lens.dispose(),[lens]);
 useFrame(()=>{lens.color.set(selected==='railway-warning-lens'?'#b78be8':'#bb263d');lens.emissive.set(selected==='railway-warning-lens'?'#8e55d9':'#ff233f');lens.emissiveIntensity=clock?.current.powered&&clock.current.phase!=='clear'?1.6:0;});
 const shapes=useMemo(()=>{const flange=new Shape(),a=Math.acos(2.3/2.8);flange.absarc(0,0,2.8,a,Math.PI*2-a,false);flange.closePath();const grommet=new Shape();grommet.absarc(0,0,1.8,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,1.3,0,Math.PI*2,true);grommet.holes.push(h);const front=new Shape(),back=new Shape();for(const shape of[front,back]){shape.moveTo(-4.31,-2);shape.lineTo(4.31,-2);shape.lineTo(4.31,2);shape.lineTo(-4.31,2);shape.closePath();}for(const x of[-2.54,0,2.54]){const square=new Path();square.moveTo(x-.45,-.45);square.lineTo(x-.45,.45);square.lineTo(x+.45,.45);square.lineTo(x+.45,-.45);square.closePath();front.holes.push(square);const hole=new Path();hole.absarc(x,0,.45,0,Math.PI*2,true);back.holes.push(hole);}return{flange,grommet,front,back};},[]);
 const curves=useMemo(()=>railwayServoLeads.map((_,n)=>new CatmullRomCurve3(railwayServoTail(n).map(p=>new Vector3(...p)))),[]);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c,mat=(id:string,c:string,metal=0)=><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.32:.55}/>;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],s:[number,number,number],c:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={s}/>{mat(id,c,metal)}</mesh>;
 const tube=(id:string,curve:CatmullRomCurve3,r:number,c:string,metal=0)=><mesh castShadow><tubeGeometry args={[curve,64,r,10,false]}/>{mat(id,c,metal)}</mesh>;
 const cx=(pins.anode[0]+pins.cathode[0])/2,cz=pins.anode[2],resX=(pins.resistorInput[0]+pins.resistorOutput[0])/2,resZ=pins.resistorInput[2];
 const resistorLeads=useMemo(()=>[pins.resistorInput,pins.resistorOutput].map((p,n)=>new CatmullRomCurve3([new Vector3(p[0],5.4,p[2]),new Vector3(p[0],10.5,p[2]),new Vector3(p[0],13,p[2]),new Vector3(resX+(n?3:-3),13,p[2])])),[resX]);
 return <group name="railway-fixed-electrical">
 {tag('railway-servo-grommet',<mesh position={[-71,10,45]} rotation={[0,-Math.PI/2,0]} castShadow><extrudeGeometry args={[shapes.grommet,{depth:2,curveSegments:48,bevelEnabled:false}]}/>{mat('railway-servo-grommet','#202938')}</mesh>)}
 {railwayServoLeads.map((w,n)=>tag(`railway-servo-${w.pin}-tail`,tube(`railway-servo-${w.pin}-tail`,curves[n],.35,w.color)))}
 {tag('railway-servo-plug',<>
  {([[shapes.back,88.5],[shapes.front,95.5]] as const).map(([shape,z],n)=><mesh key={n} position={[-100,8,z]} castShadow><extrudeGeometry args={[shape,{depth:1,bevelEnabled:false,curveSegments:32}]}/>{mat('railway-servo-plug','#263141')}</mesh>)}
  {[-1,1].map(side=><group key={side}>{box('railway-servo-plug',[-100+side*3.81,8,92.5],[1,4,6],'#263141')}{box('railway-servo-plug',[-100,8+side*1.5,92.5],[6.62,1,6],'#263141')}{box('railway-servo-plug',[-100+side*1.27,8,92.5],[.45,2,6],'#263141')}</group>)}
 </>)}
 {railwayServoLeads.map((w,n)=>{const p=railwayServoContact(n);const id=`railway-servo-${w.pin}-contact`;return tag(id,<>
  {box(id,[p[0],8,89.4],[.65,.65,1.8],'#b8a46f',.7)}
  {box(id,[p[0],7.65,92.9],[.8,.1,5.2],'#b8a46f',.7)}
  {[-1,1].map(side=><group key={side}>{box(id,[p[0]+side*.35,8,92.9],[.1,.8,5.2],'#b8a46f',.7)}</group>)}
 </>);})}
 {tag('railway-warning-board',<><group position={[...railwayWarningBoardAt]} scale={50}><BluetoothMiniBreadboard selected={selected==='railway-warning-board'} supplyLabel="170 pts" returnLabel="5-HOLE"/></group>{[5,9,10].map(column=><Text key={column} font={font} position={[railwayWarningHole(column,0)[0],10.12,103.5]} rotation={[-Math.PI/2,0,0]} fontSize={1.1} color="#516078" anchorX="center">{column+1}</Text>)}</>)}
 {tag('railway-warning-resistor',<>
  <mesh position={[resX,13,resZ]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[1.1,1.1,6,40]}/>{mat('railway-warning-resistor','#c9b58f')}</mesh>
  {[-1.9,-.9,.1,2].map((x,n)=><mesh key={n} position={[resX+x,13,resZ]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.115,1.115,.42,40]}/>{mat('railway-warning-resistor',['#ad3545','#ad3545','#684e39','#b89d58'][n],n===3?.6:0)}</mesh>)}
 </>)}
 {resistorLeads.map((curve,n)=>{const id=n?'railway-warning-resistor-output':'railway-warning-resistor-input';return tag(id,tube(id,curve,.25,'#b7bec8',.8));})}
 {tag('railway-warning-lens',<group position={[cx,0,cz]}>
  <mesh position={[0,18,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.flange,{depth:.5,curveSegments:48,bevelEnabled:false}]}/><primitive object={lens} attach="material"/></mesh>
  <mesh position={[0,20,0]} castShadow><cylinderGeometry args={[2.5,2.5,3,48]}/><primitive object={lens} attach="material"/></mesh>
  <mesh position={[0,21.5,0]} castShadow><sphereGeometry args={[2.5,48,24,0,Math.PI*2,0,Math.PI/2]}/><primitive object={lens} attach="material"/></mesh>
 </group>)}
 {tag('railway-warning-anode',<>{box('railway-warning-anode',[pins.anode[0],12.4,cz],[.5,14,.5],'#b6beca',.8)}{box('railway-warning-anode',[pins.anode[0],19.7,cz],[.8,1.1,.8],'#b6beca',.8)}</>)}
 {tag('railway-warning-cathode',<>{box('railway-warning-cathode',[pins.cathode[0],12.4,cz],[.5,14,.5],'#b6beca',.8)}<mesh position={[pins.cathode[0],19.8,cz]}><cylinderGeometry args={[1,.5,.8,20]}/>{mat('railway-warning-cathode','#c1c9d3',.8)}</mesh></>)}
 </group>;
}
export default memo(RailwayElectricalParts);
