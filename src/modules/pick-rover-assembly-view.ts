import{Box3,Matrix4,Vector3,type Object3D,type Mesh,type InstancedMesh,type PerspectiveCamera}from'three';
import{floodVisible}from'../data/flood-surface';
import type{PickAssemblyMotion}from'./pick-rover-assembly-motion';
/** Focus the hardware, with room for the whole current placement path.
 * Every placement is a translation between these two end poses; their
 * vertex envelope also contains all independently delayed intermediate poses. */
export function fitPickAssemblyView(root:Object3D,motion:PickAssemblyMotion,step:number,progress:number,camera:PerspectiveCamera,controls:{target:Vector3;update:()=>void},width:number,height:number){
 if(width<=0||height<=0)return;
 const points:Vector3[]=[],matrix=new Matrix4();
 try{for(const position of[0,1]){motion.apply(step,position);root.updateWorldMatrix(true,true);root.traverse(o=>{const mesh=o as Mesh;if(!mesh.isMesh||'text'in mesh||!floodVisible(mesh))return;const a=mesh.geometry.attributes.position;if(!a)return;const collect=(world:Matrix4)=>{for(let i=0;i<a.count;i++)points.push(new Vector3().fromBufferAttribute(a,i).applyMatrix4(world));};const instances=mesh as InstancedMesh;if(instances.isInstancedMesh){for(let i=0;i<instances.count;i++){instances.getMatrixAt(i,matrix);matrix.premultiply(mesh.matrixWorld);collect(matrix);}}else collect(mesh.matrixWorld);});}}finally{motion.apply(step,progress);}
 if(!points.length)return;
 const centre=new Box3().setFromPoints(points).getCenter(new Vector3()),aspect=width/height,dir=(aspect<1?new Vector3(.35,1,-1.8):new Vector3(1,.8,-1.35)).normalize(),right=new Vector3(0,1,0).cross(dir).normalize(),up=dir.clone().cross(right).normalize(),tanV=Math.tan(camera.getEffectiveFOV()*Math.PI/360),tanH=tanV*aspect,p=new Vector3();let distance=.1;
 for(const vertex of points){p.copy(vertex).sub(centre);const depth=p.dot(dir);distance=Math.max(distance,depth+Math.abs(p.dot(right))*1.14/tanH,depth+Math.abs(p.dot(up))*1.14/tanV);}
 camera.near=.01;camera.updateProjectionMatrix();camera.position.copy(centre).addScaledVector(dir,distance);controls.target.copy(centre);controls.update();camera.updateMatrixWorld();
}
