import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
import {CatmullRomCurve3,Vector3} from 'three';
const cache=new Map();
async function load(url){if(cache.has(url.href))return cache.get(url.href);let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const m of[...code.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.json)['"];?/g)])code=code.replace(m[0],'const '+m[1]+'='+await readFile(new URL(m[2],url),'utf8')+';');for(const m of[...code.matchAll(/from ['"](\.[^'"]+)['"]/g)])code=code.replace(m[0],"from '"+await load(new URL(m[1]+'.ts',url))+"'");code=code.replaceAll("from 'three'","from '"+import.meta.resolve('three')+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;}
const {industrialInsertionCurve}=await import(await load(new URL('../src/modules/industrial-wire-curve.ts',import.meta.url))),m=await import(await load(new URL('../src/data/industrial-wiring.ts',import.meta.url))),leds=await import(await load(new URL('../src/data/industrial-indicators.ts',import.meta.url)));
function segmentDistanceSq(a,b){const u=a.v,v=b.v,w={x:a.p.x-b.p.x,y:a.p.y-b.p.y,z:a.p.z-b.p.z},aa=a.n,cc=b.n,bb=u.dot(v),dd=u.x*w.x+u.y*w.y+u.z*w.z,ee=v.x*w.x+v.y*w.y+v.z*w.z,clamp=n=>Math.max(0,Math.min(1,n)),distance=(s,t)=>(w.x+u.x*s-v.x*t)**2+(w.y+u.y*s-v.y*t)**2+(w.z+u.z*s-v.z*t)**2;let result=Math.min(distance(0,clamp(ee/cc)),distance(1,clamp((ee+bb)/cc)),distance(clamp(-dd/aa),0),distance(clamp((bb-dd)/aa),1));const determinant=aa*cc-bb*bb;if(determinant>1e-12){const s=(bb*ee-cc*dd)/determinant,t=(aa*ee-bb*dd)/determinant;if(s>=0&&s<=1&&t>=0&&t<=1)result=Math.min(result,distance(s,t));}return result;}

const wires=m.industrialWires(),segments=curve=>{const pts=curve.getSpacedPoints(180);return pts.slice(0,-1).map((p,i)=>{const q=pts[i+1],v=q.clone().sub(p);return{p,v,n:v.lengthSq(),min:[Math.min(p.x,q.x),Math.min(p.y,q.y),Math.min(p.z,q.z)],max:[Math.max(p.x,q.x),Math.max(p.y,q.y),Math.max(p.z,q.z)]};});};
test('insertion bends only local tails, keeps connector tangents and restores the exact verified final route',()=>{
 for(const [i,w]of wires.entries()){
  const fixed=new CatmullRomCurve3(m.industrialWirePoints(w).map(p=>new Vector3(...p)),false,'centripetal');
  assert.deepEqual(industrialInsertionCurve(w,0,0).getSpacedPoints(180),fixed.getSpacedPoints(180));
  for(const f of[0,.1,.25,.5,.75,.9,1]){const progress=3+(i+f)/17,seat=m.industrialWireSeating(i,progress),staged=m.industrialSeatedWire(w,i,progress),curve=industrialInsertionCurve(w,seat.a,seat.b);
   assert.ok(curve.getPoint(0).distanceTo(new Vector3(...m.industrialWireExit(staged.a)))<1e-8);
   assert.ok(curve.getPoint(1).distanceTo(new Vector3(...m.industrialWireExit(staged.b)))<1e-8);
   assert.ok(curve.getPoint(.5).distanceTo(fixed.getPoint(.5))<1e-8);
   for(const t of[0,1])assert.ok(curve.getTangent(t).dot(fixed.getTangent(t))>.999);
  }
 }
 for(const value of[-1,5.1,NaN,Infinity])assert.throws(()=>industrialInsertionCurve(wires[0],value,0));
});
test('each moving jumper clears already installed insulation throughout both connector insertions',()=>{
 const fixed=wires.map(w=>segments(industrialInsertionCurve(w,0,0)));
 for(let i=0;i<wires.length;i++)for(const f of Array.from({length:41},(_,i)=>i/40)){
  const seat=m.industrialWireSeating(i,3+(i+f)/17),curve=industrialInsertionCurve(wires[i],seat.a,seat.b),active=segments(curve);
  for(let j=0;j<i;j++)for(const a of active)for(const b of fixed[j]){
   if(a.min.some((v,k)=>v>b.max[k]+1.05)||b.min.some((v,k)=>v>a.max[k]+1.05))continue;
   const distance=Math.sqrt(segmentDistanceSq(a,b));assert.ok(distance>=1.05,wires[i].id+' crosses '+wires[j].id+' at fraction '+f+' distance '+distance);
  }
  for(const p of curve.getPoints(300)){
   assert.ok(p.y>.5,wires[i].id+' below bench');
   assert.ok(!(p.x>-33&&p.x<163&&p.z>-105.5&&p.z<-.5&&p.y>36.5&&p.y<40.5),wires[i].id+' crosses panel');
   for(const[x,z]of[[-20,-95],[-20,-15],[150,-95],[150,-15]])assert.ok(!(p.y<37.5&&Math.hypot(p.x-x,p.z-z)<4.5),wires[i].id+' crosses post');
   assert.ok(!(p.x>12&&p.x<16&&p.z>63.5&&p.z<96.5&&p.y<50.5),wires[i].id+' crosses bracket');
   for(const d of leds.industrialIndicators){const x=(d.anode[0]+d.cathode[0])/2;assert.ok(!(p.y>14.6&&p.y<22.2&&Math.hypot(p.x-x,p.z-d.anode[2])<3.3),wires[i].id+' crosses lens');}
  }
 }
});
