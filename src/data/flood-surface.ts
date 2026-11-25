import {InstancedMesh,Matrix4,Mesh,Object3D,Triangle,Vector3,type Face}from'three';
export type FloodAnchor={object:Mesh;point:Vector3;vertices?:[number,number,number];weights?:Vector3;instanceId?:number};
export function floodOwner(o:Object3D|null):string|undefined{while(o){if(o.userData.partId)return o.userData.partId;o=o.parent;}}
export function floodVisible(o:Object3D|null){while(o){if(!o.visible)return false;o=o.parent;}return true;}
export function floodSurfaceAnchor(object:Object3D,world:Vector3,face?:Face|null,instanceId?:number):FloodAnchor|null{
 if(!(object as Mesh).isMesh)return null;const mesh=object as Mesh,point=mesh.worldToLocal(world.clone());
 if(mesh instanceof InstancedMesh&&instanceId!==undefined){const matrix=new Matrix4();mesh.getMatrixAt(instanceId,matrix);point.applyMatrix4(matrix.invert());}
 const p=mesh.geometry.attributes.position;if(!face||!p)return {object:mesh,point,instanceId};const vertices:[number,number,number]=[face.a,face.b,face.c],points=vertices.map(i=>new Vector3().fromBufferAttribute(p,i)),weights=Triangle.getBarycoord(point,points[0],points[1],points[2],new Vector3());return weights?{object:mesh,point,vertices,weights,instanceId}:{object:mesh,point,instanceId};
}
export function floodAnchorWorld(a:FloodAnchor){const point=a.point.clone(),p=a.object.geometry.attributes.position;if(a.vertices&&a.weights&&p&&a.vertices.every(i=>i<p.count)){point.set(0,0,0);a.vertices.forEach((n,i)=>point.addScaledVector(new Vector3().fromBufferAttribute(p,n),a.weights!.getComponent(i)));}if(a.object instanceof InstancedMesh&&a.instanceId!==undefined){const matrix=new Matrix4();a.object.getMatrixAt(a.instanceId,matrix);point.applyMatrix4(matrix);}a.object.updateWorldMatrix(true,false);return a.object.localToWorld(point);}
