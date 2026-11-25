import {memo,useMemo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {CatmullRomCurve3,Path,Shape,Vector3} from 'three';
import BluetoothMiniBreadboard from './BluetoothMiniBreadboard';
import {radarReferenceBoardAt,radarServoContacts,radarServoTail,radarSupplyPorts} from '../data/radar-power-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function rectangle(left:number,right:number,bottom:number,top:number){const s=new Shape();s.moveTo(left,bottom);s.lineTo(right,bottom);s.lineTo(right,top);s.lineTo(left,top);s.closePath();return s;}
function bore(shape:Shape,x:number,y:number,r:number){const p=new Path();p.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(p);}
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);bore(s,0,0,inner);return s;}

/** Authored enclosed DC source, real mating bores and three permanently attached servo leads. */
function RadarPowerParts({selected,select,servoPower=false}:{selected:string;select:(id:string)=>void;servoPower?:boolean}){
 const shapes=useMemo(()=>{
  const front=rectangle(67,143,5,37);for(const p of radarSupplyPorts)bore(front,p.x,13,2.6);bore(front,132,28,3);
  const screen=new Path();screen.moveTo(87,22.5);screen.lineTo(87,33.5);screen.lineTo(123,33.5);screen.lineTo(123,22.5);screen.closePath();front.holes.push(screen);
  const bezel=rectangle(85.5,124.5,21,35);bezel.holes.push(screen.clone());
  const back=rectangle(67,143,5,37);for(const y of[11,16,21,26,31]){const h=new Path();h.moveTo(87,y-.7);h.lineTo(87,y+.7);h.lineTo(123,y+.7);h.lineTo(123,y-.7);h.closePath();back.holes.push(h);}
  return{front,back,bezel,collar:ring(3.8,2.7),socket:ring(2.6,2.1)};
 },[]);
 const tails=useMemo(()=>radarServoContacts.map((_,i)=>new CatmullRomCurve3(radarServoTail(i).map(p=>new Vector3(...p)),false,'centripetal')),[]);
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const material=(id:string,c:string,metal=0)=><meshStandardMaterial color={selected===id?'#b78be8':c} metalness={metal} roughness={metal?.32:.6}/>;
 const block=(id:string,at:[number,number,number],size:[number,number,number],c:string,metal=0)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/>{material(id,c,metal)}</mesh>;
 const extrusion=(id:string,shape:Shape,z:number,depth:number,c:string,metal=0)=><mesh position={[0,0,z]} castShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:32}]}/>{material(id,c,metal)}</mesh>;
 return <group name="radar-servo-power-hardware">
  {tag('radar-supply-case',<>
   {block('radar-supply-case',[105,4,-120],[76,2,50],'#ccd3df')}
   {block('radar-supply-case',[105,38,-120],[76,2,50],'#dbe0e8')}
   {[68,142].map(x=><group key={x}>{block('radar-supply-case',[x,21,-120],[2,32,46],'#ccd3df')}</group>)}
   {extrusion('radar-supply-case',shapes.front,-97,2,'#33384f')}
   {extrusion('radar-supply-case',shapes.back,-145,2,'#b9c4d3')}
   <Text position={[105,18.8,-94.9]} font={font} fontSize={1.8} color="#dcd5f1">REGULATED SERVO SUPPLY</Text>
   <Text position={[105,39.05,-120]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={3.3} color="#4e456b">ATLAS · 5 V DC</Text>
  </>)}
  {tag('radar-supply-feet',<>{[76,134].flatMap(x=>[-138,-102].map(z=><group key={`${x}/${z}`}>{block('radar-supply-feet',[x,1.5,z],[8,3,8],'#343744')}</group>))}</>)}
  {tag('radar-supply-display',<>
   {extrusion('radar-supply-display',shapes.bezel,-95,.8,'#202a3a')}
   <mesh name="radar-supply-lcd" position={[105,28,-95.3]}><boxGeometry args={[36,11,1]}/><meshStandardMaterial color={selected==='radar-supply-display'?'#b78be8':servoPower?'#b8d7cc':'#687785'} emissive={servoPower?'#44796a':'#000000'} emissiveIntensity={.16} roughness={.3}/></mesh>
   <Text position={[105,31.3,-94.65]} font={font} fontSize={1.6} color="#24394a">SERVO OUTPUT</Text>
   <Text position={[105,26.8,-94.65]} font={font} fontSize={4.7} color="#24394a">{servoPower?'5.00 V':'OFF'}</Text>
  </>)}
  {tag('radar-supply-switch',<group position={[132,28,-95]}>
   <mesh rotation={[Math.PI/2,0,0]} position={[0,0,-1]}><cylinderGeometry args={[2.9,2.9,2,32]}/>{material('radar-supply-switch','#728093',.7)}</mesh>
   <mesh rotation={[Math.PI/2,0,0]} position={[0,0,.7]}><cylinderGeometry args={[3.5,3.5,1.4,32]}/>{material('radar-supply-switch','#aeb9c6',.8)}</mesh>
   <mesh name="radar-supply-button" rotation={[Math.PI/2,0,0]} position={[0,0,2.2]}><cylinderGeometry args={[2.6,2.6,2,32]}/>{material('radar-supply-switch',servoPower?'#865bcb':'#48536a')}</mesh>
   <Text position={[0,-6,1]} font={font} fontSize={1.8} color="#e6dff5">OUTPUT</Text>
  </group>)}
  {radarSupplyPorts.map(p=>tag(p.id,<>
   <group position={[p.x,13,0]}>
    {extrusion(p.id,shapes.collar,-95,2.5,p.color)}
    {extrusion(p.id,shapes.socket,-98,7,'#bcc3ca',.85)}
    <mesh position={[0,0,-94]}><torusGeometry args={[1.9,.15,8,32]}/>{material(p.id,'#bca979',.7)}</mesh>
   </group>
   {p.id==='radar-supply-reference'&&block(p.id,[115,15.4,-98.3],[20,1,1],'#bdab7e',.75)}
   <Text position={[p.x,6.9,-94.9]} font={font} fontSize={1.55} color="#e6dff5">{p.name}</Text>
  </>))}
  {tag('radar-reference-board',<group position={[...radarReferenceBoardAt]} scale={50}><BluetoothMiniBreadboard selected={selected==='radar-reference-board'} supplyLabel="No rail" returnLabel="No rail"/></group>)}
  {tag('radar-servo-connector',block('radar-servo-connector',[75,14,-44.55],[7.48,2.4,2.9],'#263241'))}
  {tag('radar-servo-rest',block('radar-servo-rest',[75,6.4,-44.55],[12,12.8,6],'#c2b5d5'))}
  {radarServoContacts.map((c,i)=><group key={c.id}>
   {tag(c.id,<group position={[c.x,14,0]}>{[-1,1].map(side=><group key={side}>
    {block(c.id,[side*.95,0,-41.55],[.5,2.4,3.1],'#263241')}
    {block(c.id,[0,side*.95,-41.55],[1.4,.5,3.1],'#263241')}
    {block(c.id,[side*.38,0,-41.6],[.14,.8,2.5],'#bca979',.8)}
   </group>)}</group>)}
   {tag(c.wireId,<mesh name={c.wireId+'-tube'} castShadow><tubeGeometry args={[tails[i],120,.55,10,false]}/>{material(c.wireId,c.color)}</mesh>)}
  </group>)}
 </group>;
}
export default memo(RadarPowerParts);
