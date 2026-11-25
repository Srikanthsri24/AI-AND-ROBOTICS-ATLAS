import type {} from '@react-three/fiber';
import { useMemo, type ReactNode } from 'react';
import { Shape, Path, DoubleSide } from 'three';
import { mineTunnel as d, mineRibs, mineStations, mineDuctHangerBottom as low, mineDuctHangerTop as high, type MinePoint } from '../data/mine-workshop-layout';

export default function MineWorkshopMechanical({ selected = '', select = () => {} }: { selected?: string; select?: (id: string) => void }) {
  const shapes = useMemo(() => {
    const arch = new Shape(), r=d.archRadius, R=r+d.ribThickness;
    arch.moveTo(-R,0); arch.lineTo(-R,d.springY); arch.absarc(0,d.springY,R,Math.PI,0,true); arch.lineTo(R,0); arch.lineTo(r,0); arch.lineTo(r,d.springY); arch.absarc(0,d.springY,r,0,Math.PI,false); arch.lineTo(-r,0); arch.closePath();
    const ring=(outer:number,inner:number)=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;};
    return { arch, duct:ring(d.ductRadius,d.ductRadius-.012), collar:ring(d.ductRadius+.025,d.ductRadius+.003) };
  },[]);
  const color=(id:string,c:string)=>selected===id?'#b48bec':c;
  const owner=(id:string,children:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{children}</group>;
  const box=(id:string,at:MinePoint,size:MinePoint,c:string)=><mesh key={id+at.join(',')} position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color(id,c)} roughness={.84}/></mesh>;
  const alongX=(id:string,shape:Shape,x:number,y:number,z:number,length:number,c:string)=><mesh key={x} position={[x,y,z]} rotation={[0,Math.PI/2,0]} castShadow receiveShadow><extrudeGeometry args={[shape,{depth:length,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={color(id,c)} metalness={.46} roughness={.56} side={DoubleSide}/></mesh>;
  return <group name="mine-mechanical-foundation">
    {owner('mine-base',box('mine-base',[0,-.19,0],[7.7,.28,3.5],'#303649'))}
    {owner('mine-floor',box('mine-floor',[0,-.015,0],[7.3,.07,2.56],'#69645f'))}
    {owner('mine-rock',<>{Array.from({length:18},(_,i)=>box('mine-rock',[-3.5+i*.412,.3+(i%3)*.07,-1.43],[.46,.65+(i%4)*.13,.35],['#535760','#68646a','#5c6068'][i%3]))}</>)}
    {owner('mine-rib-feet',<>{mineRibs.flatMap(x=>[-1,1].map(side=>box('mine-rib-feet',[x,.05,side*1.245],[.26,.06,.25],'#727c88')))}</>)}
    {owner('mine-ribs',<>{mineRibs.map(x=>alongX('mine-ribs',shapes.arch,x-d.ribDepth/2,.08,0,d.ribDepth,'#67788b'))}</>)}
    {owner('mine-duct',alongX('mine-duct',shapes.duct,-3.4,d.ductY,d.ductZ,6.8,'#c2b7a4'))}
    {owner('mine-duct-collars',<>{mineRibs.filter((_,i)=>i%2===0).map(x=>alongX('mine-duct-collars',shapes.collar,x-.025,d.ductY,d.ductZ,.05,'#7d8794'))}</>)}
    {owner('mine-duct-hangers',<>{mineRibs.filter((_,i)=>i%2===0).map(x=>box('mine-duct-hangers',[x,(low+high)/2,d.ductZ],[.025,high-low,.025],'#9ca6b2'))}</>)}
    {mineStations.map(station=>owner(`mine-${station.key}-pad`,box(`mine-${station.key}-pad`,[station.at[0],.06,station.at[2]],[.7,.08,.65],'#8b9298')))}
  </group>;
}
