import{useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Shape,Path}from'three';
import{balanceFrame as F,balanceFrameCorners as corners,balanceFrameAssembly as assembly}from'../data/balance-robot-frame';
const plateOptions={depth:F.thickness,bevelEnabled:false,curveSegments:48},lowerOptions={depth:F.middleY-F.lowerY-F.thickness,bevelEnabled:false,curveSegments:48},upperOptions={depth:F.upperY-F.middleY-F.thickness,bevelEnabled:false,curveSegments:48},washerOptions={depth:.8,bevelEnabled:false,curveSegments:48},nutOptions={depth:3.2,bevelEnabled:false,curveSegments:48};
function circleHole(s:Shape,x:number,y:number,r:number){const p=new Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);}
function polygon(points:readonly(readonly[number,number])[]){const s=new Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
function ring(out:number,inside:number){const s=new Shape();s.absarc(0,0,out,0,Math.PI*2,false);circleHole(s,0,0,inside);return s;}
/** Project-specific three-tier structure. All plate, tube, washer and nut bores
 * are real holes. Units mm; caller sets world scale. No balancing behaviour is
 * inferred from a static frame or from moving the assembly slider. */
export default function BalanceRobotFrame({selected='',choose=()=>{},step=-1,progress=1}:{selected?:string;choose?:(id:string)=>void;step?:number;progress?:number}){
 const shapes=useMemo(()=>{const lower=polygon([[-84,-65],[84,-65],[84,-52],[F.motorPocketX,-52],[F.motorPocketX,25],[84,25],[84,65],[-84,65],[-84,25],[-F.motorPocketX,25],[-F.motorPocketX,-52],[-84,-52]]),shelf=()=>polygon([[-54,-62],[54,-62],[58,-58],[58,58],[54,62],[-54,62],[-58,58],[-58,-58]]),middle=shelf(),upper=shelf();
  for(const plate of[lower,middle,upper])for(const c of corners)circleHole(plate,c.x,-c.z,F.plateBore);
  for(const x of[-54,54])for(const z of[8,22])circleHole(lower,x,-z,2.2);
  for(const[plate,w,h]of[[middle,32,38],[upper,18,30]]as const){const cut=new Path();cut.moveTo(-w/2,-h/2);cut.lineTo(-w/2,h/2);cut.lineTo(w/2,h/2);cut.lineTo(w/2,-h/2);cut.closePath();plate.holes.push(cut);}
  const nut=polygon(Array.from({length:6},(_,i)=>[3.9*Math.cos(i*Math.PI/3),3.9*Math.sin(i*Math.PI/3)]as const));circleHole(nut,0,0,2.05);
  return{lower,middle,upper,tube:ring(F.postRadius,F.postBore),washer:ring(4.5,2.05),nut};
 },[]);
 const mat=(id:string,color='#a9b6c2',metalness=.7)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:metalness?.3:.45});
 const part=(id:string,node:ReactNode)=>{const index=assembly.findIndex(s=>(s.parts as readonly string[]).includes(id)),offset=step===index?assembly[index].from.map(v=>v*(1-Math.max(0,Math.min(1,progress)))):[0,0,0];return <group key={id} name={id} userData={{partId:id,placement:index}} visible={step<0||index<=step} position={offset as[number,number,number]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;};
 const horizontal=(id:string,shape:Shape,y:number,options:typeof washerOptions)=><mesh name={id+'-solid'} position={[0,y,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shape,options]}/><meshStandardMaterial {...mat(id)}/></mesh>;
 return <group name="balance-robot-frame" userData={{units:'mm',authoredTeachingGeometry:true}}>
  {(['lower','middle','upper']as const).map((tier,i)=>{const id='balance-'+tier+'-plate';return part(id,<mesh name={id+'-solid'} position={[0,[F.lowerY,F.middleY,F.upperY][i],0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shapes[tier],plateOptions]}/><meshPhysicalMaterial {...mat(id,'#c7ab65',0)} transparent opacity={.8} roughness={.27} transmission={.08} thickness={3}/></mesh>);})}
  {corners.map(c=><group key={c.key} position={[c.x,0,c.z]}>
   {part('balance-stud-'+c.key,<mesh name={'balance-stud-'+c.key+'-solid'} position={[0,109,0]} castShadow><cylinderGeometry args={[F.studRadius,F.studRadius,158,32]}/><meshStandardMaterial {...mat('balance-stud-'+c.key)}/></mesh>)}
   {(['lower','upper']as const).map(tier=>{const id=`balance-${tier}-spacer-${c.key}`;return part(id,horizontal(id,shapes.tube,tier==='lower'?38:105,tier==='lower'?lowerOptions:upperOptions));})}
   {(['lower','upper']as const).flatMap(tier=>{const w=`balance-${tier}-washer-${c.key}`,n=`balance-${tier}-nut-${c.key}`;return[part(w,horizontal(w,shapes.washer,tier==='lower'?34.2:183,washerOptions)),part(n,horizontal(n,shapes.nut,tier==='lower'?31:183.8,nutOptions))];})}
  </group>)}
 </group>;
}
