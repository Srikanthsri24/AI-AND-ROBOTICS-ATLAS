import{useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Matrix4,Path,Quaternion,Shape,Vector3}from'three';
import{pickDriveD,pickDriveHub as H}from'../data/pick-rover-drive-hub';
import{pickChassis as C}from'../data/pick-rover-chassis';
const orientation=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(new Vector3(0,1,0),new Vector3(0,0,1),new Vector3(1,0,0)));
const end=H.hubFace-H.shaftRoot-.2,options={body:{depth:end-7,bevelEnabled:false,curveSegments:48},tip:{depth:7,bevelEnabled:false,curveSegments:48},washer:{depth:.7,bevelEnabled:false,curveSegments:48},head:{depth:.7,bevelEnabled:false,curveSegments:48}};
function circle(r:number,inner?:number){const s=new Shape();s.absarc(0,0,r,0,Math.PI*2,false);if(inner){const p=new Path();p.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(p);}return s;}
/** Exact visible mating envelopes in mm; both sides follow independent wheel angles. */
export default function PickRoverDriveRetention({leftAngle,rightAngle,wheelWithdrawal=0,selected,choose}:{leftAngle:number;rightAngle:number;wheelWithdrawal?:number;selected:string;choose:(id:string)=>void}){
 const shapes=useMemo(()=>{const body=pickDriveD(new Shape(),H.shaftRadius,H.flat),tip=pickDriveD(new Shape(),H.shaftRadius,H.flat),hole=new Path();hole.absarc(0,0,.95,0,Math.PI*2,true);tip.holes.push(hole);const head=circle(2.8),recess=circle(2.8),cross=new Path();for(const[i,[x,y]]of[[-.3,-1.7],[-.3,-.3],[-1.7,-.3],[-1.7,.3],[-.3,.3],[-.3,1.7],[.3,1.7],[.3,.3],[1.7,.3],[1.7,-.3],[.3,-.3],[.3,-1.7]].entries())i?cross.lineTo(x,y):cross.moveTo(x,y);cross.closePath();recess.holes.push(cross);return{body,tip,washer:circle(5,1.05),head,recess};},[]);
 const mat=(id:string,plastic=false)=>({color:selected===id?'#c4a2ff':plastic?'#d8cdb1':'#a9b6c2',metalness:plastic?0:.75,roughness:plastic?.6:.32});
 const tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const extrude=(id:string,shape:Shape,x:number,option:keyof typeof options,plastic=false)=><mesh name={id+'-'+(shape===shapes.recess?'recess':option)} position={[x,0,0]} quaternion={orientation} castShadow><extrudeGeometry args={[shape,options[option]]}/><meshStandardMaterial {...mat(id,plastic)}/></mesh>;
 const face=H.hubFace-H.shaftRoot;
 return <group name="pick-drive-retention">{([-1,1]as const).map(side=>{const key=side<0?'left':'right',shaft=`pick-drive-${key}-shaft`,washer=`pick-drive-${key}-washer`,screw=`pick-drive-${key}-screw`;return <group key={side} name={`pick-drive-${key}-rotation`} position={[side*H.shaftRoot,C.wheelY,C.axleZ]} rotation={[side<0?leftAngle:rightAngle,0,0]} scale={[side,1,1]}>
 {tag(shaft,<>{extrude(shaft,shapes.body,0,'body',true)}{extrude(shaft,shapes.tip,end-7,'tip',true)}</>)}
 {tag(washer,<group position={[wheelWithdrawal*1.25,0,0]}>{extrude(washer,shapes.washer,face,'washer')}</group>)}
 {tag(screw,<group position={[wheelWithdrawal*1.5,0,0]}><mesh name={screw+'-shank'} position={[face-2.65,0,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.9,.9,6.7,24]}/><meshStandardMaterial {...mat(screw)}/></mesh>{extrude(screw,shapes.head,face+.7,'head')}{extrude(screw,shapes.recess,face+1.4,'head')}</group>)}
 </group>;})}</group>;
}
