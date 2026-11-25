import type{}from'@react-three/fiber';
import{memo,useMemo,type ReactNode}from'react';import{Shape,Path,DoubleSide}from'three';
import{binLidPassages}from'../data/smart-bin-loom';
import{binPhysical as d,binLoadPose,binLidAngle}from'../data/smart-bin-layout';
type P=[number,number,number];
function SmartBinMechanicalParts({selected,select,lidDegrees=0,gapMm=500,cutaway=false}:{selected:string;select:(id:string)=>void;lidDegrees?:number;gapMm?:number;cutaway?:boolean}){
 const load=binLoadPose(gapMm),shapes=useMemo(()=>{const rounded=(w:number,h:number,r:number)=>{const p=new Shape(),x=-w/2,y=-h/2;p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);p.lineTo(x+w,y+h-r);p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);p.lineTo(x+r,y+h);p.quadraticCurveTo(x,y+h,x,y+h-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);return p;},ring=(w:number,h:number,r:number,iw:number,ih:number,ir:number)=>{const s=rounded(w,h,r),inside=rounded(iw,ih,ir),hole=new Path();hole.curves=inside.curves;hole.currentPoint.copy(inside.currentPoint);s.holes.push(hole);return s;},sleeve=new Shape();sleeve.absarc(0,0,6,0,Math.PI*2,false);const bore=new Path();bore.absarc(0,0,2.8,0,Math.PI*2,true);sleeve.holes.push(bore);const lid=rounded(286,256,20);for(const p of binLidPassages){const hole=new Path();hole.absarc(p.x,-p.z,p.hole,0,Math.PI*2,true);lid.holes.push(hole);}return{body:ring(280,250,18,260,230,10),rim:ring(286,256,20,260,230,10),lid,gasket:ring(274,244,15,264,234,10),sleeve};},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>,box=(at:P,size:P,id:string,color:string)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} roughness={.62}/></mesh>,plate=(shape:Shape,at:P,depth:number,id:string,color:string)=><mesh position={at} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:28}]}/><meshStandardMaterial color={c(id,color)} roughness={.48} side={DoubleSide}/></mesh>,sleeve=(x:number,id:string)=><mesh key={x} position={[x-12.5,0,0]} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[shapes.sleeve,{depth:25,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={c(id,'#788795')} metalness={.7} roughness={.32}/></mesh>;
 return <>
 {tag('bin-body',<group visible={!cutaway}>{plate(shapes.body,[0,20,0],520,'bin-body','#667a87')}</group>)}
 {tag('bin-floor',box([0,10,0],[270,20,240],'bin-floor','#5a707c'))}
 {tag('bin-rim',plate(shapes.rim,[0,540,0],10,'bin-rim','#465c69'))}
 {tag('bin-hinge-pin',<mesh position={[0,d.hingeY,d.hingeZ]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[2.5,2.5,155,32]}/><meshStandardMaterial color={c('bin-hinge-pin','#b3bdc5')} metalness={.8} roughness={.26}/></mesh>)}
 {tag('bin-hinge-fixed',<group position={[0,d.hingeY,d.hingeZ]}>{[-30,30].map(x=><group key={x}>{sleeve(x,'bin-hinge-fixed')}{box([x,-8,9],[20,12,18],'bin-hinge-fixed','#788795')}</group>)}</group>)}
 <group name="smart-bin-moving-lid" position={[0,d.hingeY,d.hingeZ]} rotation={[binLidAngle(lidDegrees),0,0]}>
 {tag('bin-lid',plate(shapes.lid,[0,2,-d.hingeZ],10,'bin-lid','#506575'))}
 {tag('bin-gasket',plate(shapes.gasket,[0,0,-d.hingeZ],2,'bin-gasket','#323d4b'))}
 {tag('bin-hinge-moving',<>{[-60,0,60].map(x=><group key={x}>{sleeve(x,'bin-hinge-moving')}{box([x,7,9],[20,10,18],'bin-hinge-moving','#788795')}</group>)}</>)}
 {tag('bin-handle',<>{[-43,43].map(x=><group key={x}>{box([x,21,96-d.hingeZ],[8,18,13],'bin-handle','#344b5c')}</group>)}{box([0,32,96-d.hingeZ],[94,7,13],'bin-handle','#344b5c')}</>)}
 </group>
 {tag('bin-load-target',<group visible={load.visible}>{box([0,load.top-load.thickness/2,0],[230,load.thickness,200],'bin-load-target','#ccb58e')}</group>)}
 {tag('bin-load-support',<group visible={load.visible&&load.height>3}>{[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}/${z}`}>{box([x*52,20+(load.height-3)/2,z*43],[96,Math.max(.01,load.height-3),78],'bin-load-support','#b59b76')}{box([x*52,20+(load.height-3)/2,z*43+39.1],[4,Math.max(.01,load.height-3),.3],'bin-load-support','#e0d4b6')}</group>))}</group>)}
 </>;
}
export default memo(SmartBinMechanicalParts);
