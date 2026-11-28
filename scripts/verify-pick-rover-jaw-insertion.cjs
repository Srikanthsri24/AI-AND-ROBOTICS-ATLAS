const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('../node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const{pickJawCableInsertion}=require('../src/data/pick-rover-jaw-cable-insertion.ts'),{pickJawCableRoutes}=require('../src/data/pick-rover-jaw-cable.ts');
const angle=-40*Math.PI/180,reference=pickJawCableRoutes(angle).routes,worst=[0,0,0];
for(let n=0;n<=1000;n++){
 const p=pickJawCableInsertion(angle,n/1000);
 p.conductors.forEach((r,i)=>{
  assert.ok(r.curve.getPoint(0).distanceTo(reference[i].curve.getPoint(0))<1e-8,'servo strain relief moved');
  const end=r.curve.getPoint(1);
  assert.ok(Math.abs(end.x-p.seat[0])<1e-8&&Math.abs(end.y-p.seat[1]-8.05)<1e-8&&Math.abs(end.z-(p.seat[2]-r.wire.pin))<1e-8,'wire detached from real contact exit');
  assert.ok(r.curve.getPoints(100).every(v=>v.toArray().every(Number.isFinite)));
  worst[i]=Math.max(worst[i],Math.abs(r.curve.getLength()-r.length));
 });
}
assert.ok(worst.every(v=>v<.001));assert.equal(pickJawCableInsertion(angle,0).lift,8);assert.equal(pickJawCableInsertion(angle,1).lift,0);
for(const p of[-1,2,NaN,Infinity])assert.throws(()=>pickJawCableInsertion(angle,p));
console.log('1001 POSES / THREE FIXED SERVO EXITS / ACTUAL THREE-WAY PLUG EXITS / LENGTH RESIDUAL PASS',worst);

for(const angle of[-20*Math.PI/180,0])for(let n=0;n<=100;n++){const p=pickJawCableInsertion(angle,n/100);for(const r of p.conductors)assert.ok(Math.abs(r.curve.getLength()-r.length)<.001);}console.log('MID AND UPPER LIFT POSES / LENGTH PRESERVED PASS');
