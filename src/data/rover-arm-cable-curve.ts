import{CatmullRomCurve3,Vector3}from'three';
/** Preserve the authored centreline while giving the tube exact axial end
 * tangents. Finite-difference tangents can tilt an end ring into a mating cap. */
export function raRoverCableCurve(points:readonly (readonly number[])[]):CatmullRomCurve3{const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal'),tangent=curve.getTangent.bind(curve);curve.getTangent=(t:number,target=new Vector3())=>{if(t<=0)return target.copy(curve.points[1]).sub(curve.points[0]).normalize();if(t>=1)return target.copy(curve.points[curve.points.length-1]).sub(curve.points[curve.points.length-2]).normalize();return tangent(t,target);};return curve;}
