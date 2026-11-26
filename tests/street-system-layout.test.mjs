import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
 if(cache.has(url.href))return cache.get(url.href);
 let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const m of [...code.matchAll(/import (\w+) from ['"]([^'"]+\.json)['"];?/g)])code=code.replace(m[0],`const ${m[1]} = ${await readFile(new URL(m[2],url),'utf8')};`);
 for(const m of [...code.matchAll(/^import[ \t]+[^;\n]*?from ['"]([^'"]+)['"]/gm)])code=code.replace(m[0],m[0].slice(0,m[0].lastIndexOf('from '))+`from '${await load(new URL(m[1]+'.ts',url))}'`);
 const result='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,result);return result;
}
const w=await import(await load(new URL('../src/data/street-system-layout.ts',import.meta.url)));
test('three branches use distinct 5-hole strips and one series limiter each',()=>{
 const occupied=new Set();
 for(const b of w.streetSystemBranches){
  for(const p of [b.resistorInput,b.resistorOutput,b.returnContact]){const key=p[0];assert.ok(!occupied.has(key));occupied.add(key);}
  assert.equal(b.resistorInput[0],b.driveContact[0]);assert.equal(b.resistorOutput[0],b.lampContact[0]);
  assert.notEqual(b.resistorInput[0],b.resistorOutput[0]);assert.notEqual(b.lampContact[0],b.returnContact[0]);
  assert.ok(Math.abs(b.cathode[0]-b.anode[0]-2.54)<1e-10);
 }
 assert.deepEqual(w.streetSystemBranches.map(b=>b.pin),['D5','D6','D7']);
});
test('all 17 cables have unique IDs, distinct physical contacts and explicit electrical nodes',()=>{
 assert.equal(w.streetSystemCables.length,17);assert.equal(new Set(w.streetSystemCables.map(c=>c.id)).size,17);
 const contacts=new Set();for(const c of w.streetSystemCables){assert.ok(c.node&&c.name);for(const p of [c.a,c.b]){assert.ok(p.every(Number.isFinite));const key=p.join(',');assert.ok(!contacts.has(key),'double-seated contact '+key);contacts.add(key);}}
 for(const b of w.streetSystemBranches){assert.deepEqual(w.streetSystemCables.find(c=>c.id===b.id+'-drive').a,w.streetSystemSocket(b.pin));assert.deepEqual(w.streetSystemCables.find(c=>c.id===b.id+'-anode').b,b.positiveTail);assert.deepEqual(w.streetSystemCables.find(c=>c.id===b.id+'-return').a,b.returnTail);}
});
test('divider ground and junction are independent of the lamp bank',()=>{
 assert.notEqual(w.streetSystemDivider.junction[0],w.streetSystemDivider.ground[0]);
 assert.ok(w.streetSystemDivider.junction[2]>w.streetSystemLayout.breadboard[2]);
 assert.ok(w.streetSystemBranches.every(b=>b.resistorInput[2]<w.streetSystemLayout.breadboard[2]));
 assert.throws(()=>w.streetSystemSocket('NOT-A-PIN'));assert.throws(()=>w.streetSystemHole(17,1,0));
 assert.equal(w.streetSystemAssembly.length,9);
});

const assembly=await import(await load(new URL('../src/data/street-system-assembly.ts',import.meta.url)));
const catalog=await import(await load(new URL('../src/data/street-system-parts.ts',import.meta.url)));
test('every physical part has a bounded monotone assembly lift and seats at its chapter',()=>{
 assert.equal(catalog.streetSystemParts.length,79);
 for(const part of catalog.streetSystemParts){let previous=Infinity;
  for(let n=0;n<=80;n++){const p=n/10,pose=assembly.streetSystemAssemblyPose(part.id,p);assert.ok(pose.lift>=0&&pose.lift<=70);assert.ok(pose.lift<=previous+1e-9);previous=pose.lift;if(p>=part.stage){assert.equal(pose.lift,0);assert.equal(pose.seated,true);assert.equal(pose.visible,true);}}
 }
 assert.throws(()=>assembly.streetSystemAssemblyPose('missing',0));assert.throws(()=>assembly.streetSystemAssemblyPose('street-base',9));
});

const shade=await import(await load(new URL('../src/data/street-system-shade.ts',import.meta.url)));
test('moving shade uses circular overlap and stays above the sensor and connector tops',()=>{
 let previous=-1;
 for(let n=0;n<=100;n++){
  const p=shade.streetShadePose(n),coverage=shade.streetShadeCoverage(n),g=shade.streetShadeGeometry;
  assert.ok(coverage>=previous);previous=coverage;
  assert.ok(Math.abs(p.x+g.width/2-p.rightEdge)<1e-10);
  assert.ok(g.height-g.thickness/2>27);
  assert.ok(g.depth/2>g.radius);
  assert.ok(Math.abs(coverage+shade.streetShadeCoverage(100-n)-100)<1e-10);
 }
 assert.equal(shade.streetShadeCoverage(0),0);assert.equal(shade.streetShadeCoverage(50),50);assert.equal(shade.streetShadeCoverage(100),100);
 assert.ok(shade.streetShadeCoverage(25)<25);assert.ok(shade.streetShadeCoverage(75)>75);
 assert.throws(()=>shade.streetShadePose(-1));assert.throws(()=>shade.streetShadePose(NaN));
});
test('mounts seat before supported boards, hoods and fasteners; resistors fit sequentially',()=>{
 const pose=assembly.streetSystemAssemblyPose;
 assert.equal(pose('street-lamp-1-foot',.25).seated,true);
 assert.equal(pose('street-lamp-1-post',.25).visible,false);
 assert.equal(pose('street-lamp-1-post',.55).seated,true);
 assert.equal(pose('street-lamp-1-hood',.55).visible,false);
 assert.equal(pose('street-lamp-1-hood',.8).seated,true);
 assert.equal(pose('street-lamp-1-bolts',.8).visible,false);
 assert.equal(pose('street-uno-supports',2.25).seated,true);
 assert.equal(pose('street-uno-pcb',2.25).visible,false);
 assert.equal(pose('street-lamp-1-resistor',4.5).seated,true);
 assert.equal(pose('street-lamp-3-resistor',4.5).visible,false);
});

const faults=await import(await load(new URL('../src/data/street-system-faults.ts',import.meta.url)));
const controller=await import(await load(new URL('../src/data/street-system-workshop.ts',import.meta.url)));
test('each selectable fault opens one physical cable and powers down before connection changes',()=>{
 for(const fault of faults.streetSystemFaults){
  const settings=faults.streetFaultSettings({...controller.streetSystemDefaults,usb:true},fault.id);
  assert.equal(settings.usb,false);
  const open=w.streetSystemCables.filter(c=>faults.streetCableWithdrawal(c.id,settings)>0);
  assert.deepEqual(open.map(c=>c.id),fault.cable?[fault.cable]:[]);
  for(const c of open)assert.equal(faults.streetCableWithdrawal(c.id,settings),8);
  const powered={...settings,usb:true,ambient:0},state=controller.streetSystemAdvance(controller.streetSystemInitial(),100,powered),lamps=controller.streetSystemLamps(state,powered);
  if(fault.id==='a0'){assert.equal(state.raw,null);assert.deepEqual(lamps,[null,null,null]);}
  else {assert.equal(state.command,true);assert.deepEqual(lamps,[1,2,3].map(n=>fault.id===`drive-${n}`||fault.id===`return-${n}`?false:true));}
 }
 assert.throws(()=>faults.streetFaultSettings(controller.streetSystemDefaults,'unknown'));
});

const usb=await import(await load(new URL('../src/data/street-system-usb.ts',import.meta.url)));
test('USB Type-B seats on the authored Uno face and withdraws along its actual axis',()=>{
 const seated=usb.streetUsbPose(0),open=usb.streetUsbPose(12);
 assert.deepEqual(seated.uno,usb.streetUsbUnoFace);assert.equal(seated.uno[0]-open.uno[0],12);
 assert.equal(seated.uno[1],open.uno[1]);assert.equal(seated.uno[2],open.uno[2]);
 assert.deepEqual(seated.host,open.host);assert.deepEqual(seated.host,usb.streetUsbHostFace);
 for(let n=0;n<=12;n++){const pose=usb.streetUsbPose(n);assert.equal(pose.points[0][0],pose.uno[0]-24);assert.equal(pose.points.at(-1)[0],pose.host[0]+24);assert.ok(pose.points.every(p=>p[1]-1.5>8));}
 assert.throws(()=>usb.streetUsbPose(13));assert.throws(()=>usb.streetUsbPose(-1));assert.throws(()=>usb.streetUsbPose(NaN));
});

test('USB motion gates power until both plugs seat and supports reversal without overshoot',()=>{
 let p={unoWithdrawal:12,hostWithdrawal:0};
 assert.equal(usb.streetUsbMated(true,p),false);
 p=usb.streetUsbAdvance(p,250,0,0);assert.equal(p.unoWithdrawal,6);assert.equal(usb.streetUsbMated(true,p),false);
 p=usb.streetUsbAdvance(p,250,0,0);assert.equal(usb.streetUsbMated(true,p),true);assert.equal(usb.streetUsbMated(false,p),false);
 p=usb.streetUsbAdvance(p,250,12,12);assert.deepEqual(p,{unoWithdrawal:6,hostWithdrawal:6});
 p=usb.streetUsbAdvance(p,1000,12,12);assert.deepEqual(p,{unoWithdrawal:12,hostWithdrawal:12});
 const exposed=usb.streetUsbPose(12,12);assert.equal(exposed.host[0]-usb.streetUsbHostFace[0],12);assert.equal(exposed.points.at(-1)[0],exposed.host[0]+24);
 assert.equal(usb.streetUsbMated(true,{unoWithdrawal:0,hostWithdrawal:12}),false);
 assert.deepEqual(usb.streetUsbAdvance({unoWithdrawal:6,hostWithdrawal:6},250,0,0),{unoWithdrawal:0,hostWithdrawal:0});
 assert.throws(()=>usb.streetUsbAdvance(p,-1,0,0));assert.throws(()=>usb.streetUsbPose(0,13));
});

test('host plug clears the port before lifting and lowers before final mating',()=>{
 for(let n=0;n<=120;n++){const withdrawal=n/10,p=usb.streetUsbPose(12,withdrawal);if(withdrawal<=6)assert.equal(p.host[1],usb.streetUsbHostFace[1]);else {assert.ok(p.host[0]-4>usb.streetUsbHostFace[0]+2);assert.ok(p.host[1]>usb.streetUsbHostFace[1]);}assert.equal(p.points.at(-2)[1],p.host[1]);assert.equal(p.points.at(-1)[1],p.host[1]);}
 assert.equal(usb.streetUsbPose(12,12).host[1],34);
 assert.equal(usb.streetUsbPose(12,0).host[1],14);
});

const jumpers=await import(await load(new URL('../src/data/street-system-jumpers.ts',import.meta.url)));
test('all 34 plug steps seat A before B and hide future wires',()=>{
 for(let index=0;index<17;index++){
  const chapter=index<5?5:6,count=index<5?5:12,local=index<5?index:index-5,start=chapter+local/count;
  const before=jumpers.streetJumperSeating(index,start);assert.equal(before.visible,false);assert.equal(before.aWithdrawal,16);assert.equal(before.bWithdrawal,16);
  const middle=jumpers.streetJumperSeating(index,start+.5/count);assert.equal(middle.aWithdrawal,0);assert.equal(middle.bWithdrawal,16);
  const end=jumpers.streetJumperSeating(index,chapter+(local+1)/count);assert.equal(end.aWithdrawal,0);assert.equal(end.bWithdrawal,0);assert.equal(end.seated,true);
  const w=wSource(index),route=jumpers.streetJumperRoute(index,0,16);assert.equal(route[0][1],w.a[1]+7.5);assert.equal(route.at(-1)[1],w.b[1]+23.5);
 }
 assert.throws(()=>jumpers.streetJumperSeating(17,6));assert.throws(()=>jumpers.streetJumperRoute(0,-1,0));
});
function wSource(index){return w.streetSystemCables[index];}
test('assembly timing is partition independent and manual stepping lands on each plug',()=>{
 assert.equal(assembly.streetAssemblyAdvance(5,1000),5.1);assert.equal(assembly.streetAssemblyAdvance(6,1000),6+1/24);
 let p=5;for(let n=0;n<34;n++)p=assembly.streetAssemblyNextStop(p);assert.equal(p,7);
 assert.equal(assembly.streetAssemblyAdvance(0,100000),8);
 const one=assembly.streetAssemblyAdvance(4.7,15000);let split=4.7;for(let n=0;n<150;n++)split=assembly.streetAssemblyAdvance(split,100);assert.ok(Math.abs(one-split)<1e-10);
 assert.throws(()=>assembly.streetAssemblyAdvance(0,-1));
});
test('plug instructions name actual endpoint order, including the reversed A0 descriptive arrow',()=>{
 assert.equal(jumpers.streetJumperEndLabel(2,'a'),'Uno A0');assert.equal(jumpers.streetJumperEndLabel(2,'b'),'divider junction · front column 6');
 assert.equal(jumpers.streetJumperEndLabel(5,'a'),'Uno D5');assert.equal(jumpers.streetJumperEndLabel(9,'a'),'Uno D6');assert.equal(jumpers.streetJumperEndLabel(13,'a'),'Uno D7');
 for(let n=0;n<17;n++)for(const end of ['a','b'])assert.ok(jumpers.streetJumperEndLabel(n,end).length>5);
});
const sockets=await import(await load(new URL('../src/data/street-system-sockets.ts',import.meta.url)));
test('eight supported socket mouths match actual jumper ends and leave the sensor face clear',()=>{
 assert.equal(sockets.streetSocketSpecs.length,8);assert.equal(new Set(sockets.streetSocketSpecs.map(s=>s.id)).size,8);
 for(const s of sockets.streetSocketSpecs){assert.equal(s.at[1],20);const ends=w.streetSystemCables.flatMap(c=>[c.a,c.b]).filter(p=>p.every((v,n)=>v===s.at[n]));assert.equal(ends.length,1);assert.equal(s.at[1]-6,14);}
 assert.ok(w.streetSystemDivider.sensorPositive[2]-1.05>-90+3.2);
 for(let n=0;n<3;n++){const b=w.streetSystemBranches[n],x=(b.anode[0]+b.cathode[0])/2;assert.ok(Math.abs(b.positiveTail[0]-x)-1.05>4);assert.ok(Math.abs(b.returnTail[0]-x)-1.05>4);for(const sign of [true,false]){const path=sockets.streetLampTail(n,sign);assert.equal(path.at(-1)[1],14.7);assert.equal(path.at(-1)[0],(sign?b.positiveTail:b.returnTail)[0]);}}
 for(const positive of [true,false])assert.deepEqual(sockets.streetSensorLead(positive).at(-1),[positive?-151.27:-148.73,14.7,-85]);
});
