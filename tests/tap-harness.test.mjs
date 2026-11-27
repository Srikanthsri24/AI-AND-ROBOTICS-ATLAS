import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import ts from'typescript';
const cache=new Map();async function load(url){if(cache.has(url.href))return cache.get(url.href);if(url.pathname.endsWith('.json'))return'data:text/javascript;base64,'+Buffer.from('export default '+await readFile(url,'utf8')).toString('base64');let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const m of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(m[0],"from '"+await load(new URL(m[1]+(m[1].endsWith('.json')?'':'.ts'),url))+"'");const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;}
const h=await import(await load(new URL('../src/data/tap-harness.ts',import.meta.url))),engine=await import(await load(new URL('../src/data/automatic-tap-session.ts',import.meta.url)));
const input={assembled:true,usb:true,supplyEnabled:true,barrelWithdrawal:0,echoPresent:true,distanceCm:26,water:true};
function completed(){let s=h.tapHarnessInitial();for(const t of h.tapHarnessTasks)s=h.tapHarnessSetEnd(s,t.wireId,t.end,true);return{...s,stemma:true,referenceHeader:true};}
test('factory-attached leads are preserved and all 24 student terminations are distinct',()=>{
 const s=h.tapHarnessInitial();assert.equal(h.tapHarnessWires.length,15);assert.equal(h.tapHarnessTasks.length,24);assert.equal(new Set(h.tapHarnessWires.map(w=>w.id)).size,15);
 const points=new Set();for(const w of h.tapHarnessWires)for(const [end,p]of [w.a,w.b].entries()){assert.ok(p.point.every(Number.isFinite));const key=p.point.join('/');assert.ok(!points.has(key),'Two terminations occupy the same physical point');points.add(key);assert.equal(s.ends[w.id][end],!!p.fixed);if(p.fixed)assert.throws(()=>h.tapHarnessSetEnd(s,w.id,end,false),/factory/);}
 assert.throws(()=>h.tapHarnessSetEnd(s,'unknown',0,true),RangeError);
 const settings=h.tapHarnessSettings(s,input);assert.equal(settings.pumpPower,false);assert.equal(settings.levelSignal,false);assert.equal(settings.sensorPower,false);
});
test('completed harness powers all required paths without directly bridging motor VIN and Uno 5 V',()=>{
 const s=completed(),settings=h.tapHarnessSettings(s,input);for(const key of ['pumpPower','pumpCircuit','driverReference','driverSignal','sensorPower','sensorGround','trig','echo','levelPower','levelGround','levelSignal'])assert.equal(settings[key],true,key);
 assert.equal(h.tapHarnessConnected(s,'driver-vin','uno-5v'),false);assert.equal(h.tapHarnessConnected(s,'supply-positive','bb:2:-1'),false);
 assert.equal(h.tapHarnessConnected(s,'supply-negative','driver-ground'),true);assert.equal(h.tapHarnessConnected(s,'driver-ground','uno-ground'),true);
 assert.equal(h.tapHarnessConnected(s,'bb:2:-1','bb:8:-1'),false);assert.equal(h.tapHarnessConnected(s,'bb:2:-1','bb:2:1'),false);
});
test('every user termination independently breaks its corresponding functional path',()=>{
 const s=completed(),keys={'logic':'sensorPower','ground':'sensorGround','sonar-vcc':'sensorPower','sonar-ground':'sensorGround','trigger':'trig','echo':'echo','level-vcc':'levelPower','level-ground':'levelGround','level-out':'levelSignal','driver-signal':'driverSignal','driver-vin':'pumpPower','driver-ground':'pumpPower','reference':'driverReference','motor-positive':'pumpCircuit','motor-negative':'pumpCircuit'};
 for(const t of h.tapHarnessTasks){const broken=h.tapHarnessSetEnd(s,t.wireId,t.end,false),settings=h.tapHarnessSettings(broken,input);assert.equal(settings[keys[t.wireId.replace('tap-wire-','')]],false,t.wireId+' end '+t.end);assert.equal(h.tapHarnessSettings(h.tapHarnessSetEnd(broken,t.wireId,t.end,true),input)[keys[t.wireId.replace('tap-wire-','')]],true);}
 assert.equal(h.tapHarnessSettings({...s,stemma:false},input).pumpPower,false);assert.equal(h.tapHarnessSettings({...s,stemma:false},input).driverSignal,false);assert.equal(h.tapHarnessSettings({...s,referenceHeader:false},input).driverReference,false);
 assert.equal(h.tapHarnessSettings(s,{...input,barrelWithdrawal:16}).pumpPower,false);
});
test('the actual sketch session drives only through a complete harness and separate supply',()=>{
 const s=completed(),run=(harness,override={})=>{let v=engine.tapSessionInitial();v=engine.tapSessionAdvance(v,h.tapHarnessSettings(harness,{...input,...override}),300);v=engine.tapSessionAdvance(v,h.tapHarnessSettings(harness,{...input,...override,distanceCm:8}),600);return v;};
 const working=run(s);assert.equal(working.controller.mode,'RUNNING');assert.ok(working.poweredUs>300000);
 for(const id of ['driver-vin','driver-ground','driver-signal','reference','motor-positive','motor-negative']){const w=h.tapHarnessWires.find(w=>w.id==='tap-wire-'+id),end=w.a.fixed?1:0,broken=h.tapHarnessSetEnd(s,w.id,end,false),v=run(broken);assert.equal(v.controller.mode,'RUNNING');assert.equal(v.poweredUs,0,id);}
 assert.equal(run(s,{supplyEnabled:false}).poweredUs,0);assert.equal(run({...s,stemma:false}).poweredUs,0);assert.equal(run({...s,referenceHeader:false}).poweredUs,0);
 for(const id of ['level-vcc','level-ground','level-out','trigger','echo','sonar-vcc','sonar-ground']){const w=h.tapHarnessWires.find(w=>w.id==='tap-wire-'+id),v=run(h.tapHarnessSetEnd(s,w.id,w.a.fixed?1:0,false));assert.equal(v.controller.driver,false,id);assert.equal(v.poweredUs,0,id);}
});
