const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:1200,height:850}});
 await p.goto('http://127.0.0.1:5190/');
 await p.evaluate(async()=>{document.getElementById('root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);(await import('/scripts/fixtures/traffic-parking-signals.tsx')).mount(el);window.__T=await import('/node_modules/.vite/deps/three.js');window.__signals=await import('/src/data/traffic-parking-signals.ts');window.__logic=await import('/src/data/traffic-parking-workshop.ts');});
 await p.waitForFunction(()=>window.__tpSignalsOutput);
 await p.waitForTimeout(700);
 const geometry=await p.evaluate(()=>{const T=window.__T,s=window.__tpSignalsScene,{trafficParkingLamps:lamps,trafficParkingLampTerminal:terminal}=window.__signals;s.scene.updateMatrixWorld(true);let leads=0,bores=0;for(const l of lamps){
  const head=s.scene.getObjectByName('tp-'+l.head+'-head'),plate=s.scene.getObjectByName('tp-'+l.head+'-plate-sheet');
  const at=(x,y,z)=>head.localToWorld(new T.Vector3(x,y,z));
  const ray=new T.Raycaster(at(0,l.height,12),at(0,l.height,-12).sub(at(0,l.height,12)).normalize());
  if(ray.intersectObject(plate).length)throw Error('LED hole is filled '+l.id);
  const control=new T.Raycaster(at(4,l.height,12),at(4,l.height,-12).sub(at(4,l.height,12)).normalize());
  if(!control.intersectObject(plate).length)throw Error('Missing surrounding card '+l.id);bores++;
  for(const kind of ['anode','cathode']){const m=s.scene.getObjectByName(l.id+'-'+kind+'-metal'),len=m.geometry.parameters.depth,actual=m.localToWorld(new T.Vector3(0,0,-len/2)),expected=new T.Vector3(...terminal(l.id,kind)).multiplyScalar(.01);if(actual.distanceTo(expected)>1e-7)throw Error('Terminal mismatch '+l.id+' '+kind);leads++;}
  const hood=s.scene.getObjectByName(l.id+'-visor-shell'),opening=new T.Raycaster(at(0,l.height,12),at(0,l.height,-12).sub(at(0,l.height,12)).normalize());if(opening.intersectObject(hood).length)throw Error('Hood blocks centre '+l.id);
 }
 const a=s.scene.getObjectByName('tp-main-head').getWorldQuaternion(new T.Quaternion()),b=s.scene.getObjectByName('tp-cross-head').getWorldQuaternion(new T.Quaternion());if(Math.abs(a.angleTo(b)-Math.PI/2)>1e-8)throw Error('Heads do not face perpendicular approaches');return {leads,bores,owners:window.__tpSignalsParts.length};});
 assert.deepEqual(geometry,{leads:14,bores:7,owners:37});
 const phases=await p.evaluate(()=>{const {trafficParkingInitial,trafficParkingLoop,trafficParkingControllerOutputs}=window.__logic;let c=trafficParkingInitial();const rows=[];for(const now of [0,5000,6600,7500,12500,14100,15000]){c=trafficParkingLoop(c,now,{entry:false,exit:false});rows.push(trafficParkingControllerOutputs(c));}return rows;});
 for(const output of [...phases,{main:null,cross:null,full:false},{main:'Red',cross:'Green',full:true}]){
  await p.evaluate(output=>window.__tpSignalsOutput(output),output);
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.evaluate(output=>{const s=window.__tpSignalsScene;for(const l of window.__signals.trafficParkingLamps){const expected=l.head==='full'?output.full:output[l.head]===l.color,m=s.scene.getObjectByName(l.id+'-die');if((m.material.emissive.getHex()!==0&&m.material.emissiveIntensity>0)!==expected)throw Error('Wrong physical LED state '+l.id);}},output);
 }
 await p.evaluate(()=>window.__tpSignalsOutput({main:'Green',cross:'Red',full:false}));
 await p.waitForTimeout(100);
 await p.screenshot({path:'/tmp/atlas-traffic-signals-overview.png'});
 console.log('TRAFFIC SIGNAL BORES / LEAD ENDPOINTS / ORIENTATION / FIRMWARE LAMP STATES PASS',geometry,phases.length+2,'output states');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
