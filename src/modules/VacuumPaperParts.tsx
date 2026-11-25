import {useMemo} from 'react';
import {Quaternion,Vector3} from 'three';
import {vacuumLayout as d} from '../data/vacuum-workshop-layout';
import {vacuumTray} from '../data/vacuum-hose-geometry';
import {vacuumPapersInitial,type VacuumPaper} from '../data/vacuum-paper';
/** Paper dimensions and orientation are shared with the contact solver; sheets are never replaced by a pickup counter. */
export default function VacuumPaperParts({papers=vacuumPapersInitial(),selected='',select=()=>{}}:{papers?:VacuumPaper[];selected?:string;select?:(id:string)=>void}){
 const orientations=useMemo(()=>papers.map(p=>new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...p.normal).normalize())),[papers]);
 return <><group userData={{partId:'paper-tray'}} onClick={e=>{e.stopPropagation();select('paper-tray');}}>
 <mesh position={[-125,1,140]} receiveShadow><boxGeometry args={[80,2,70]}/><meshStandardMaterial color={selected==='paper-tray'?'#b78be8':'#dad6ea'} roughness={.8}/></mesh>
 {([-1,1] as const).map(sign=><mesh key={'side'+sign} position={[-125+sign*39,4,140]} castShadow><boxGeometry args={[2,4,70]}/><meshStandardMaterial color='#968aa9'/></mesh>)}
 {([-1,1] as const).map(sign=><mesh key={'end'+sign} position={[-125,4,140+sign*34]} castShadow><boxGeometry args={[76,4,2]}/><meshStandardMaterial color='#968aa9'/></mesh>)}
 {vacuumTray.sites.map(([x,z],i)=><mesh key={i} position={[x,vacuumTray.top+.005,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[3,3.25,32]}/><meshStandardMaterial color='#75618f' roughness={.85}/></mesh>)}
 </group>{papers.map((p,i)=><mesh key={p.id} name={'vacuum-paper-'+p.id} position={p.position} quaternion={orientations[i]} userData={{partId:'paper-'+p.id}} onClick={e=>{e.stopPropagation();select('paper-'+p.id);}} castShadow receiveShadow><boxGeometry args={[d.paper.side,d.paper.thickness,d.paper.side]}/><meshStandardMaterial color={selected==='paper-'+p.id?'#b78be8':['#ecb852','#e7a249','#e6b758','#dd9f45','#efbf65','#e3ad4b'][p.id]} roughness={.95}/></mesh>)}</>;
}
