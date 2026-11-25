import {CatmullRomCurve3,Curve,Vector3} from 'three';
import {industrialWirePoints,type IndustrialWire} from '../data/industrial-wiring';
/** Flex only the two local end spans. The routed middle stays fixed during insertion. */
export function industrialInsertionCurve(wire:IndustrialWire,withdrawA:number,withdrawB:number):Curve<Vector3>{
 for(const value of[withdrawA,withdrawB])if(!Number.isFinite(value)||value<0||value>5)throw Error('Industrial jumper withdrawal must be 0–5 mm');
 const points=industrialWirePoints(wire).map(p=>new Vector3(...p)),base=new CatmullRomCurve3(points,false,'centripetal');
 if(withdrawA===0&&withdrawB===0)return base;
 const a=new Vector3(...wire.a.out).multiplyScalar(withdrawA),b=new Vector3(...wire.b.out).multiplyScalar(withdrawB),span=2/(points.length-1),fade=(n:number)=>{const f=Math.max(0,Math.min(1,n));return f*f*(3-2*f);};
 return new class extends Curve<Vector3>{
  constructor(){super();}
  getPoint(t:number,target=new Vector3()){base.getPoint(t,target);return target.addScaledVector(a,fade(1-t/span)).addScaledVector(b,fade(1-(1-t)/span));}
 }();
}
