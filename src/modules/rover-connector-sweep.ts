import{Mesh,Vector3}from'three';import{ConvexGeometry}from'three/addons/geometries/ConvexGeometry.js';
/** Conservative world-space swept envelope of ONE solid connector primitive.
 * Sweep walls separately: combining a whole hollow housing would fill its port.
 * Translation only; caller verifies unchanged geometry/orientation and static targets.
 * Caller owns and disposes the returned geometry; source/material stay shared. */
export function roverConnectorSweptMesh(source:Mesh,translation:Vector3):Mesh{const positions=source.geometry.attributes.position,points:Vector3[]=[],seen=new Set<string>();for(let n=0;n<positions.count;n++){const p=new Vector3().fromBufferAttribute(positions,n).applyMatrix4(source.matrixWorld);for(const q of[p,p.clone().add(translation)]){const key=q.toArray().map(v=>v.toFixed(9)).join(',');if(!seen.has(key)){seen.add(key);points.push(q);}}}const result=new Mesh(new ConvexGeometry(points),source.material);result.matrixAutoUpdate=false;return result;}
