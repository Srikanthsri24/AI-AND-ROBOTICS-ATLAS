const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('../node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const{pickServoFeedMotion}=require('../src/data/pick-rover-servo-feed-motion.ts'),{pickServoSupplyLeadRoute}=require('../src/data/pick-rover-servo-supply-leads.ts');
for(const index of[0,1]){
 const reference=pickServoSupplyLeadRoute(index);let worst=0;
 for(let n=0;n<=1000;n++){
  const progress=n/1000,p=pickServoFeedMotion(index,progress);
  assert.ok(p.curve.points.every(v=>v.toArray().every(Number.isFinite)));
  const a=reference.start.clone();a.z+=p.sourceOffset;
  const b=reference.end.clone();b.z+=p.tipOffset;
  assert.ok(p.curve.getPoint(0).distanceTo(a)<1e-8,'source plug exit detached');
  assert.ok(p.curve.getPoint(1).distanceTo(b)<1e-8,'terminal copper detached');
  assert.ok(p.release>=0&&p.release<=1);
  if(progress>.15&&progress<.55)assert.equal(p.release,1,'terminal must stay open during insertion');
  if(progress>=.7){assert.ok(p.tipOffset===0);assert.equal(p.release,0,'secure conductor before connecting source');}
  if(progress<=.7)assert.equal(p.sourceOffset,12,'source must remain unplugged while clamping');
  worst=Math.max(worst,Math.abs(p.curve.getLength()-p.length));
 }
 assert.ok(worst<.01);assert.equal(pickServoFeedMotion(index,0).tipOffset,-8);assert.equal(pickServoFeedMotion(index,1).sourceOffset,0);
 console.log('1001 POSES / REAL ENDPOINTS / CLAMP SEQUENCE / FIXED LENGTH PASS',index,worst);
}
for(const args of[[-1,0],[2,0],[0,-1],[0,2],[0,NaN]])assert.throws(()=>pickServoFeedMotion(...args));
