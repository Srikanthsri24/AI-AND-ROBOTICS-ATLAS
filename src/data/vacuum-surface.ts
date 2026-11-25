import {Mesh,Object3D,Triangle,Vector3,type Face} from 'three';
export type VacuumAnchor={object:Mesh;point:Vector3;vertices?:[number,number,number];weights?:Vector3};
export function vacuumPartOwner(o:Object3D|null):string|undefined{while(o){if(o.userData.partId)return o.userData.partId;o=o.parent;}return undefined;}
export function vacuumSurfaceAnchor(object:Object3D,world:Vector3,face?:Face|null):VacuumAnchor|null{
 if(!(object as Mesh).isMesh)return null;const mesh=object as Mesh,point=object.worldToLocal(world.clone()),position=mesh.geometry.attributes.position;
 if(!face||!position)return {object:mesh,point};const vertices:[number,number,number]=[face.a,face.b,face.c],points=vertices.map(i=>new Vector3().fromBufferAttribute(position,i)),weights=Triangle.getBarycoord(point,points[0],points[1],points[2],new Vector3());return weights?{object:mesh,point,vertices,weights}:{object:mesh,point};
}
export function vacuumAnchorWorld(a:VacuumAnchor){const point=a.point.clone(),p=a.object.geometry.attributes.position;if(a.vertices&&a.weights&&p&&a.vertices.every(i=>i<p.count)){point.set(0,0,0);a.vertices.forEach((index,i)=>point.addScaledVector(new Vector3().fromBufferAttribute(p,index),a.weights!.getComponent(i)));}a.object.updateWorldMatrix(true,false);return a.object.localToWorld(point);}
