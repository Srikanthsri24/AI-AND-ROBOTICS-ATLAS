

import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
  if(cache.has(url.href))return cache.get(url.href);
  if(url.pathname.endsWith('.json'))return 'data:text/javascript;base64,'+Buffer.from('export default '+await readFile(url,'utf8')).toString('base64');
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(new URL(match[1]+(match[1].endsWith('.json')?'':'.ts'),url))+"'");
  const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
import {CatmullRomCurve3,Vector3} from 'three';
const m=await import(await load(new URL('../src/data/mq2-wires.ts',import.meta.url)));
function segments(points){return points.slice(0,-1).map((p,n)=>{const q=points[n+1],v=q.clone().sub(p);return{p,v,length:v.lengthSq(),min:[Math.min(p.x,q.x),Math.min(p.y,q.y),Math.min(p.z,q.z)],max:[Math.max(p.x,q.x),Math.max(p.y,q.y),Math.max(p.z,q.z)]};});}
function lowerBound(a,b){let d=0;for(let n=0;n<3;n++){const gap=Math.max(a.min[n]-b.max[n],b.min[n]-a.max[n],0);d+=gap*gap;}return d;}
const clamp=n=>Math.max(0,Math.min(1,n));
function segmentDistanceSquared(a,b){const rx=a.p.x-b.p.x,ry=a.p.y-b.p.y,rz=a.p.z-b.p.z,A=a.length,E=b.length,F=b.v.x*rx+b.v.y*ry+b.v.z*rz;let s,t;if(A<1e-12&&E<1e-12)return rx*rx+ry*ry+rz*rz;if(A<1e-12){s=0;t=clamp(F/E);}else{const C=a.v.x*rx+a.v.y*ry+a.v.z*rz;if(E<1e-12){t=0;s=clamp(-C/A);}else{const B=a.v.dot(b.v),den=A*E-B*B;s=den>1e-12?clamp((B*F-C*E)/den):0;t=(B*s+F)/E;if(t<0){t=0;s=clamp(-C/A);}else if(t>1){t=1;s=clamp((B-C)/A);}}}const x=rx+a.v.x*s-b.v.x*t,y=ry+a.v.y*s-b.v.y*t,z=rz+a.v.z*s-b.v.z*t;return x*x+y*y+z*z;}


let minimum=Infinity,worst;const collisions=new Map();
for(const mode of ['dial','sensor']){
 const wires=m.mq2Wires(mode),cache=new Map();
 for(let tick=0;tick<=2200;tick++){
  const cursor=tick/100,paths=wires.map((w,n)=>{const p=m.mq2WireSeating(n,cursor);if(!p.visible)return null;const key=n+':'+p.a+':'+p.b;if(!cache.has(key))cache.set(key,segments(new CatmullRomCurve3(m.mq2WireRoute(w,n,p.a,p.b).map(p=>new Vector3(...p))).getPoints(128)));return cache.get(key);});
  for(let a=0;a<wires.length;a++)for(let b=a+1;b<wires.length;b++){
   if(!paths[a]||!paths[b])continue;let d=Infinity;
   for(const p of paths[a])for(const q of paths[b])if(lowerBound(p,q)<d)d=Math.min(d,segmentDistanceSquared(p,q));
   const gap=Math.sqrt(d)-.9;if(gap<=0){const key=mode+':'+a+':'+b;if(!collisions.has(key)||collisions.get(key).gap>gap)collisions.set(key,{mode,cursor,a,b,gap});}if(gap<minimum){minimum=gap;worst={mode,cursor,a:wires[a].id,b:wires[b].id};}
  }
 }
}
console.log(JSON.stringify({fittingPoses:4402,minimumSegmentEnvelopeGapMm:minimum,worst,collisions:[...collisions.values()]}));
if(minimum<=0)throw new Error('Moving wire envelope overlap');
