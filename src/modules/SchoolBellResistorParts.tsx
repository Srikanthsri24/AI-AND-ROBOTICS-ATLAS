import {memo,useMemo} from 'react';
import {CurvePath,LineCurve3,QuadraticBezierCurve3,Vector3} from 'three';
import {schoolBellResistor as d} from '../data/school-bell-sounder';
function SchoolBellResistorParts({selected,choose}:{selected:string;choose:(id:string)=>void}){const id='school-piezo-resistor',x=(d.from[0]+d.to[0])/2,y=16,z=0,c=(normal:string)=>selected===id?'#b48bec':normal;
 const leads=useMemo(()=>[-1,1].map(sign=>{const end=sign<0?d.from:d.to,path=new CurvePath<Vector3>();path.add(new LineCurve3(new Vector3(end[0],8,0),new Vector3(end[0],15,0)));path.add(new QuadraticBezierCurve3(new Vector3(end[0],15,0),new Vector3(end[0],16,0),new Vector3(end[0]-sign,16,0)));path.add(new LineCurve3(new Vector3(end[0]-sign,16,0),new Vector3(x+sign*3.15,16,0)));return path;}),[x]);
 return <group name={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();choose(id);}}><mesh name={id+'-body'} position={[x,y,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.1,1.1,6.3,32]}/><meshStandardMaterial color={c('#c7b18a')} roughness={.6}/></mesh>{d.bands.map((color,n)=><mesh key={n} name={id+'-band-'+n} position={[x-2.3+n*1.25,y,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.115,1.115,.4,32]}/><meshStandardMaterial color={c(color)} roughness={.5}/></mesh>)}{leads.map((path,n)=><mesh key={n} name={id+'-lead-'+n}><tubeGeometry args={[path,32,.32,12,false]}/><meshStandardMaterial color={c('#c0c6ca')} metalness={.8} roughness={.3}/></mesh>)}</group>;
}
export default memo(SchoolBellResistorParts);
