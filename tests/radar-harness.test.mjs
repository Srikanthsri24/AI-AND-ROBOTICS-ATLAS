import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {CatmullRomCurve3,Vector3} from 'three';

const cache=new Map();
async function load(url){
 if(cache.has(url.href))return cache.get(url.href);
 const text=await readFile(url,'utf8');
 let code=url.pathname.endsWith('.json')?'export default '+text:ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const match of[...code.matchAll(/from ['"]([^'"]+)['"]/g)]){
  const path=match[1]+(match[1].endsWith('.json')?'':'.ts');
  code=code.replace(match[0],"from '"+await load(new URL(path,url))+"'");
 }
 const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
const m=await import(await load(new URL('../src/data/radar-harness.ts',import.meta.url)));
const power=await import(await load(new URL('../src/data/radar-power-layout.ts',import.meta.url)));
const jumpers=await import(await load(new URL('../src/data/radar-power-jumpers.ts',import.meta.url)));
const clamp=x=>Math.max(0,Math.min(1,x));
// Closest distance between two finite segments, including clamped end contacts.
function segmentDistance(p1,q1,p2,q2){
 const u=q1.clone().sub(p1),v=q2.clone().sub(p2),r=p1.clone().sub(p2),a=u.dot(u),e=v.dot(v),b=u.dot(v),c=u.dot(r),f=v.dot(r),den=a*e-b*b;
 let s=den>1e-12?clamp((b*f-c*e)/den):0,t=(b*s+f)/e;
 if(t<0){t=0;s=clamp(-c/a);}else if(t>1){t=1;s=clamp((b-c)/a);}
 return p1.clone().addScaledVector(u,s).distanceTo(p2.clone().addScaledVector(v,t));
}
test('radar leads use the real Uno contacts and clear the sonar header when withdrawn',()=>{
 assert.deepEqual(m.radarSonarLeads.map(l=>l.socket),['5V','D2','D3','GND-P1']);
 assert.deepEqual(m.radarUnoSocket('D2'),[-90.87,18.3,-104.13]);
 assert.equal(new Set(m.radarHarnessParts.map(p=>p[0])).size,12);
 for(let i=0;i<4;i++){
  const seated=m.radarLeadPose(i,90),out=m.radarLeadPose(i,90,4,5);
  assert.equal(seated.sonar[1],52);assert.equal(55+out.sonarPlug[1],51);
  assert.ok(49+out.sonarPlug[1]>42+.65,'Female housing clears bracket floor');
  assert.ok(out.unoPlug[1]-2>out.socket[1],'Withdrawn male pin clears socket');
  assert.deepEqual(seated.points.at(-1),[seated.socket[0],26.3,seated.socket[2]]);
 }
 assert.throws(()=>m.radarLeadPose(4,90));assert.throws(()=>m.radarLeadPose(0,NaN));
 assert.throws(()=>m.radarLeadPose(0,90,4.01));assert.throws(()=>m.radarLeadPose(0,90,0,5.01));
});
test('all twelve radar cables stay separated across head fitting, sensor travel and the ten-plug seating sequence',()=>{
 let minimum=Infinity;
 const cases=[];
 for(let heading=10;heading<=170;heading+=5)for(const[w1,w2]of[[0,0],[4,0],[0,5],[4,5]])cases.push({heading,w1,w2,progress:1});
 for(let step=0;step<=40;step++)cases.push({heading:90,w1:0,w2:0,progress:step/40});
 for(const{heading,w1,w2,progress}of cases){
  const paths=Array.from({length:4},(_,i)=>new CatmullRomCurve3(m.radarLeadPose(i,heading,w1,w2).points.map(p=>new Vector3(...p)),false,'centripetal').getPoints(160));
  paths.push(...Array.from({length:3},(_,i)=>new CatmullRomCurve3(power.radarServoTail(i).map(p=>new Vector3(...p)),false,'centripetal').getPoints(160)));
  const ws=jumpers.radarPowerSeating(progress);
  paths.push(...Array.from({length:5},(_,i)=>new CatmullRomCurve3(jumpers.radarPowerJumperPose(i,ws[i].a,ws[i].b).points.map(p=>new Vector3(...p)),false,'centripetal').getPoints(160)));
  for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)for(let i=1;i<paths[a].length;i++)for(let j=1;j<paths[b].length;j++){
   const pa=paths[a][i-1],qa=paths[a][i],pb=paths[b][j-1],qb=paths[b][j];
   if(Math.max(Math.min(pa.x,qa.x)-Math.max(pb.x,qb.x),Math.min(pb.x,qb.x)-Math.max(pa.x,qa.x),Math.min(pa.y,qa.y)-Math.max(pb.y,qb.y),Math.min(pb.y,qb.y)-Math.max(pa.y,qa.y),Math.min(pa.z,qa.z)-Math.max(pb.z,qb.z),Math.min(pb.z,qb.z)-Math.max(pa.z,qa.z))>minimum+1.3)continue;
   minimum=Math.min(minimum,segmentDistance(pa,qa,pb,qb)-(a>=4&&a<7?.55:.65)-(b>=4&&b<7?.55:.65));
  }
 }
 assert.ok(minimum>.2,'160-segment path sampling retains surface clearance for 1.3 mm jumpers / 1.1 mm servo tails; got '+minimum);
});
test('radar servo supply keeps its positive source separate and references one real breadboard strip',()=>{
 assert.deepEqual(power.radarSupplyPorts.map(p=>p.node),['servo-positive','common-ground','common-ground']);
 assert.deepEqual(power.radarPowerConnections.map(c=>c.node),['servo-command','servo-positive','common-ground','common-ground','common-ground']);
 assert.deepEqual(power.radarPowerConnections[0].from,m.radarUnoSocket('D9'));
 assert.deepEqual(power.radarPowerConnections[1].to,power.radarServoContact(1));
 assert.deepEqual(power.radarPowerConnections[2].to,power.radarServoContact(2));
 assert.deepEqual(power.radarPowerConnections[4].to,m.radarUnoSocket('GND-P2'));
 for(const edge of power.radarPowerConnections)for(const p of[edge.from,edge.to])assert.notDeepEqual(p,m.radarUnoSocket('5V'),'Independent servo circuit must not join Uno positive');
 const a=power.radarReferenceContact(0),b=power.radarReferenceContact(1);
 assert.equal(a[0],b[0]);assert.equal(a[1],10);assert.ok(Math.abs(b[2]-a[2]-2.54)<1e-10);
 assert.ok(a[2]<power.radarReferenceBoardAt[2]&&b[2]<power.radarReferenceBoardAt[2]);
 assert.equal(new Set(power.radarPowerParts.map(p=>p[0])).size,16);
 assert.throws(()=>power.radarReferenceContact(5));assert.throws(()=>power.radarSupplyContact('Uno 5V'));
});
test('fixed servo tails leave the actual grommet and end behind their own connector contacts',()=>{
 for(let i=0;i<3;i++){
  const points=power.radarServoTail(i),c=power.radarServoContacts[i];
  assert.deepEqual(points[0],[17.9,12,(i-1)*1.5]);assert.deepEqual(points.at(-1),[c.x,14,-46]);
  assert.deepEqual(power.radarServoContact(i),[c.x,14,-40]);
  assert.ok(points[0][2]+.55<2.5&&points[0][2]-.55>-2.5,'Cable fits moulded strain relief');
 }
 assert.throws(()=>power.radarServoTail(3));assert.throws(()=>power.radarServoContact(-1));
});
test('the ten actual power plugs seat individually along their socket axes',()=>{
 assert.equal(jumpers.radarPowerJumperParts.length,15);
 assert.equal(new Set(jumpers.radarPowerJumperParts.map(p=>p[0])).size,15);
 assert.deepEqual(jumpers.radarPowerJumpers.map(j=>j.a.kind),['male','banana','banana','banana','male']);
 let previous=jumpers.radarPowerSeating(0);
 assert.deepEqual(previous.map(w=>[w.a,w.b]),[[5,5],[8,5],[8,5],[8,5],[5,5]]);
 for(let step=0;step<=40;step++){
  const ws=jumpers.radarPowerSeating(step/40);let moving=0;
  for(let i=0;i<5;i++){
   const j=jumpers.radarPowerJumpers[i],pose=jumpers.radarPowerJumperPose(i,ws[i].a,ws[i].b);
   for(const end of['a','b']){
    assert.ok(ws[i][end]<=previous[i][end]+1e-10);
    if(ws[i][end]>0&&ws[i][end]<j[end].travel)moving++;
    assert.deepEqual(pose[end],j[end].at.map((n,k)=>n+j[end].out[k]*ws[i][end]));
    const wireEnd=pose.points[end==='a'?0:pose.points.length-1],exit=j[end].kind==='banana'?11:8;
    assert.deepEqual(wireEnd,pose[end].map((n,k)=>n+j[end].out[k]*exit));
   }
  }
  assert.ok(moving<=1,'Only one plug travels at a time');previous=ws;
 }
 assert.deepEqual(previous,Array.from({length:5},()=>({a:0,b:0})));
 assert.throws(()=>jumpers.radarPowerSeating(-.1));assert.throws(()=>jumpers.radarPowerSeating(NaN));
 assert.throws(()=>jumpers.radarPowerJumperPose(5));assert.throws(()=>jumpers.radarPowerJumperPose(0,5.01));
 assert.throws(()=>jumpers.radarPowerJumperPose(1,8.01));assert.throws(()=>jumpers.radarPowerJumperPose(1,0,5.01));
});
