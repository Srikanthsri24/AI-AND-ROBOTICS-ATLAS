import{Box3,Matrix4,Vector3,type Object3D,type Mesh,type InstancedMesh,type PerspectiveCamera}from'three';
import{floodVisible}from'../data/flood-surface';
import type{PickAssemblyMotion}from'./pick-rover-assembly-motion';
/** Focus the hardware, with room for the whole current placement path.
 * Translation paths include every leg endpoint; deforming placements add
 * explicit view samples. Static hardware is collected once. Completed steps
 * focus the assembled pose. */
export function fitPickAssemblyView(root:Object3D,motion:PickAssemblyMotion,step:number,progress:number,camera:PerspectiveCamera,controls:{target:Vector3;update:()=>void},width:number,height:number){
 if(width<=0||height<=0)return;
 const points:Vector3[]=[],matrix=new Matrix4();
 const moving=new Set(motion.units.filter(u=>u.step===step).flatMap(u=>[u.object,...(u.affects??[]).map(name=>root.getObjectByName(name)!).filter(Boolean)]));let first=true;
 const positions=progress===1?[1]:[...new Set([0,1,...motion.units.filter(u=>u.step===step).flatMap(u=>[...u.path?.map(p=>p.at)??[],...u.viewSamples??[]])])].sort((a,b)=>a-b);
 try{for(const position of positions){motion.apply(step,position);root.updateWorldMatrix(true,true);root.traverse(o=>{const mesh=o as Mesh;if(!mesh.isMesh||'text'in mesh||!floodVisible(mesh))return;if(!first){let active=false;for(let p=mesh as Object3D|null;p;p=p.parent)if(moving.has(p)){active=true;break;}if(!active)return;}const a=mesh.geometry.attributes.position;if(!a)return;const collect=(world:Matrix4)=>{for(let i=0;i<a.count;i++)points.push(new Vector3().fromBufferAttribute(a,i).applyMatrix4(world));};const instances=mesh as InstancedMesh;if(instances.isInstancedMesh){for(let i=0;i<instances.count;i++){instances.getMatrixAt(i,matrix);matrix.premultiply(mesh.matrixWorld);collect(matrix);}}else collect(mesh.matrixWorld);});first=false;}}finally{motion.apply(step,progress);}
 if(!points.length)return;
 const centre=new Box3().setFromPoints(points).getCenter(new Vector3()),aspect=width/height,dir=(aspect<1?new Vector3(.35,1,-1.8):new Vector3(1,.8,-1.35)).normalize(),right=new Vector3(0,1,0).cross(dir).normalize(),up=dir.clone().cross(right).normalize(),tanV=Math.tan(camera.getEffectiveFOV()*Math.PI/360),tanH=tanV*aspect,p=new Vector3();let distance=.1;
 for(const vertex of points){p.copy(vertex).sub(centre);const depth=p.dot(dir);distance=Math.max(distance,depth+Math.abs(p.dot(right))*1.14/tanH,depth+Math.abs(p.dot(up))*1.14/tanV);if(progress===1)vertex.set(p.dot(right),p.dot(up),depth);}
 // A world-axis box can leave an asymmetric rover low in a perspective view.
 // Centre the rendered silhouette of completed hardware in the camera plane.
 if(progress===1){let ox=0,oy=0;for(let n=0;n<6;n++){let l=points[0],r=points[0],b=points[0],t=points[0],xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;for(const v of points){const w=distance-v.z,x=(v.x-ox)/w,y=(v.y-oy)/w;if(x<xmin){xmin=x;l=v;}if(x>xmax){xmax=x;r=v;}if(y<ymin){ymin=y;b=v;}if(y>ymax){ymax=y;t=v;}}const wl=distance-l.z,wr=distance-r.z,wb=distance-b.z,wt=distance-t.z;ox=(l.x*wr+r.x*wl)/(wl+wr);oy=(b.y*wt+t.y*wb)/(wb+wt);}centre.addScaledVector(right,ox).addScaledVector(up,oy);}
 camera.near=.01;camera.updateProjectionMatrix();camera.position.copy(centre).addScaledVector(dir,distance);controls.target.copy(centre);controls.update();camera.updateMatrixWorld();
}
