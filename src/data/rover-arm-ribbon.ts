import{CatmullRomCurve3,Vector3}from'three';
/** A continuously transported ribbon orientation. Projecting a fixed world axis
 * at every sample can reverse the wire order at a vertical tangent. */
export class RaArmRibbonFrame{
 readonly frames;readonly anchors:{t:number;angle:number}[];
 constructor(readonly route:CatmullRomCurve3,startNormal:Vector3,endNormal:Vector3,constraints:readonly{t:number;normal:Vector3}[]=[]){
  this.frames=route.computeFrenetFrames(512,false);
  const angle=(t:number,direction:Vector3)=>{const at=t*512,lo=Math.min(511,Math.floor(at)),tangent=route.getTangentAt(t),normal=this.frames.normals[lo].clone().lerp(this.frames.normals[lo+1],at-lo);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();const projected=direction.clone().addScaledVector(tangent,-direction.dot(tangent)).normalize();return Math.atan2(tangent.dot(normal.clone().cross(projected)),normal.dot(projected));};
  this.anchors=[{t:0,normal:startNormal},...constraints,{t:1,normal:endNormal}].map(({t,normal})=>({t,angle:angle(t,normal)}));
  for(let i=1;i<this.anchors.length;i++){const previous=this.anchors[i-1].angle;while(this.anchors[i].angle-previous>Math.PI)this.anchors[i].angle-=2*Math.PI;while(this.anchors[i].angle-previous< -Math.PI)this.anchors[i].angle+=2*Math.PI;}

 }
 normal(t:number,target=new Vector3()){
  const at=Math.min(1,Math.max(0,t))*512,lo=Math.min(511,Math.floor(at)),tangent=this.route.getTangentAt(t),normal=this.frames.normals[lo].clone().lerp(this.frames.normals[lo+1],at-lo);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();const binormal=new Vector3().crossVectors(tangent,normal).normalize(),right=this.anchors.findIndex(a=>a.t>=t),last=this.anchors[Math.max(1,right)],first=this.anchors[Math.max(0,right-1)],u=(t-first.t)/(last.t-first.t),angle=first.angle+(last.angle-first.angle)*u;
  return target.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal,Math.sin(angle)).normalize();
 }
}
