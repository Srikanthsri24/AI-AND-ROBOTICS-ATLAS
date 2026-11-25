import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {CurvePath,LineCurve3,Vector3,type Group} from 'three';
import {vacuumNozzleAt,vacuumPickupCurve,vacuumOutletCurve} from '../data/vacuum-hose-geometry';
import type {VacuumAir} from '../data/vacuum-pneumatics';
/** Coloured explanatory air markers, not visible real air or a computed CFD streamline. */
export default function VacuumAirGuides({air,site,gap}:{air:VacuumAir;site:number;gap:number}){
 const paths=useMemo(()=>{const exhaust=new CurvePath<Vector3>();exhaust.add(new LineCurve3(new Vector3(307,60,-75),new Vector3(352,60,-75)));return [vacuumPickupCurve(vacuumNozzleAt(site,gap)),vacuumOutletCurve(),exhaust];},[site,gap]),nodes=useRef<(Group|null)[]>([]),travel=useRef([0,0,0]),last=useRef(air.clock),flows=[air.flows.nozzle,air.flows.inlet,air.flows.outlet],counts=[14,5,3];
 useFrame(()=>{const dt=Math.max(0,air.clock-last.current);last.current=air.clock;for(let route=0,offset=0;route<3;route++){const length=paths[route].getLength(),flow=Math.max(0,flows[route]);travel.current[route]=(travel.current[route]+dt*flow*1000/(Math.PI*3**2))%length;for(let i=0;i<counts[route];i++){const node=nodes.current[offset+i];if(!node)continue;node.visible=flow>1;node.position.copy(paths[route].getPointAt(((travel.current[route]/length+i/counts[route])%1)));}offset+=counts[route];}});
 return <group name='vacuum-illustrative-air-guides'>{Array.from({length:22},(_,i)=><group key={i} ref={o=>{nodes.current[i]=o;}}><mesh raycast={()=>null}><sphereGeometry args={[.7,10,8]}/><meshBasicMaterial color={i<14?'#9371d6':i<19?'#419cba':'#cf8a3d'} transparent opacity={.75}/></mesh></group>)}</group>;
}
