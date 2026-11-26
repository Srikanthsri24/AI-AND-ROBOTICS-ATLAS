const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:1200,height:850}});await p.goto('http://127.0.0.1:5190/');
 await p.evaluate(async()=>{document.getElementById('root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);(await import('/scripts/fixtures/traffic-parking-barrier.tsx')).mount(el);window.__T=await import('/node_modules/.vite/deps/three.js');});
 await p.waitForFunction(()=>window.__tpBarrierAngle);await p.waitForTimeout(700);
 const bores=await p.evaluate(()=>{const T=window.__T,s=window.__tpBarrierScene;s.scene.updateMatrixWorld(true);const check=(name,x,y,empty)=>{const m=s.scene.getObjectByName(name),start=new T.Vector3(x,y,10).multiplyScalar(.01),end=new T.Vector3(x,y,-30).multiplyScalar(.01),ray=new T.Raycaster(start,end.sub(start).normalize()),hit=ray.intersectObject(m).length>0;if(hit===empty)throw Error('Bore/control mismatch '+name+' '+x+','+y);};
  check('tp-servo-front-cover',0,0,true);check('tp-servo-front-cover',2,0,false);
  for(const [n,x] of [[0,-9.5],[1,21]]){check('tp-servo-ear-'+n,x,0,true);check('tp-servo-ear-'+n,x+2,0,false);check('tp-servo-bracket-sheet',x,0,true);check('tp-servo-bracket-sheet',x+2,0,false);}
  check('tp-servo-bracket-sheet',5,0,true);check('tp-servo-bracket-sheet',5,8,false);
  check('tp-gate-horn-solid',0,0,true);check('tp-gate-horn-solid',2,0,false);
  check('tp-servo-output-shaft',0,0,true);check('tp-servo-output-shaft',.75,0,false);
  const floor=new T.Box3().setFromObject(s.scene.getObjectByName('tp-horn-screw-head-floor')),horn=new T.Box3().setFromObject(s.scene.getObjectByName('tp-gate-horn-solid')),shank=new T.Box3().setFromObject(s.scene.getObjectByName('tp-horn-screw-shank'));
  if(Math.abs(floor.min.z-horn.max.z)>1e-8)throw Error('Screw head does not bear on horn');
  if(Math.abs(shank.max.z-floor.min.z)>1e-8)throw Error('Shank does not meet bearing face');
  const shaft=s.scene.getObjectByName('tp-servo-output-shaft'),positions=shank.max.x;
  if(positions>=.005)throw Error('Shank wider than shaft bore');
  if(Math.abs(new T.Box3().setFromObject(shaft).max.z-.035)>1e-8)throw Error('Shaft engagement height changed');
  for(const name of ['tp-horn-screw-head-left','tp-horn-screw-head-right'])check(name,0,0,true);
  check('tp-horn-screw-head-left',-.7,0,false);check('tp-horn-screw-head-right',.7,0,false);
  return 8;});assert.equal(bores,8);
 for(const angle of [20,30,40,50,60,70,80,90,100]){
  await p.evaluate(angle=>window.__tpBarrierAngle(angle),angle);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.evaluate(angle=>{const T=window.__T,s=window.__tpBarrierScene;s.scene.updateMatrixWorld(true);const moving=s.scene.getObjectByName('tp-barrier-motion'),end=moving.localToWorld(new T.Vector3(72,0,3)),a=(angle-20)*Math.PI/180,expected=new T.Vector3(72*Math.cos(a),72*Math.sin(a),3).multiplyScalar(.01);if(end.distanceTo(expected)>1e-7)throw Error('Wrong barrier calibration '+angle);const horn=s.scene.getObjectByName('tp-gate-horn-solid'),positions=horn.geometry.attributes.position,cover=s.scene.getObjectByName('tp-servo-front-cover'),box=new T.Box3().setFromObject(cover);for(let i=0;i<positions.count;i++){const v=horn.localToWorld(new T.Vector3().fromBufferAttribute(positions,i));if(v.z<=box.max.z+.001)throw Error('Arm strikes stationary cover '+angle);}const shaft=s.scene.getObjectByName('tp-servo-shaft-motion');if(Math.abs(shaft.rotation.z-a)>1e-8)throw Error('Bare shaft not rotating');const mark=s.scene.getObjectByName('tp-shaft-index').getWorldPosition(new T.Vector3()),markExpected=new T.Vector3(-.72*Math.sin(a),.72*Math.cos(a),3.51).multiplyScalar(.01);if(mark.distanceTo(markExpected)>1e-7)throw Error('Bare shaft index detached');for(let n=0;n<21;n++){const mesh=s.scene.getObjectByName('tp-shaft-spline-'+n),p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=mesh.localToWorld(new T.Vector3().fromBufferAttribute(p,i));if(Math.hypot(v.x,v.y)>=.0105)throw Error('Spline cannot fit horn bore');}}const screw=s.scene.getObjectByName('tp-horn-screw-shank').getWorldPosition(new T.Vector3());if(screw.distanceTo(new T.Vector3(0,0,.0135))>1e-7)throw Error('Retaining screw moved with arm');},angle);
 }
 await p.evaluate(()=>window.__tpBarrierFocus('tp-gate-horn'));await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const before=await p.evaluate(()=>window.__tpBarrierScene.scene.getObjectByName('crane-selected-surface').position.toArray());
 await p.evaluate(()=>window.__tpBarrierAngle(20));await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const after=await p.evaluate(()=>window.__tpBarrierScene.scene.getObjectByName('crane-selected-surface').position.toArray());
 const rot=-80*Math.PI/180;assert.ok(Math.abs(after[0]-(before[0]*Math.cos(rot)-before[1]*Math.sin(rot)))<1e-7);assert.ok(Math.abs(after[1]-(before[0]*Math.sin(rot)+before[1]*Math.cos(rot)))<1e-7);assert.ok(Math.abs(after[2]-before[2])<1e-7);
 await p.evaluate(()=>{window.__tpBarrierChoose('');const s=window.__tpBarrierScene;s.camera.near=.001;s.camera.updateProjectionMatrix();s.camera.position.set(.8,.6,1);s.controls.target.set(.25,0,0);s.controls.update();});await p.waitForTimeout(200);await p.screenshot({path:'/tmp/atlas-traffic-barrier-down.png'});
 await p.evaluate(()=>window.__tpBarrierAngle(100));await p.waitForTimeout(200);await p.screenshot({path:'/tmp/atlas-traffic-barrier-up.png'});
 await p.evaluate(()=>window.__tpBarrierCutaway(true));await p.waitForTimeout(200);await p.screenshot({path:'/tmp/atlas-traffic-barrier-cutaway.png'});
 console.log('TRAFFIC PARKING BARRIER REAL BORES / ROTATING INDEX / 21 SPLINE CLEARANCE / SHAFT BORE / SEATED SLOTTED SCREW / NINE CALIBRATED POSES / COVER CLEARANCE / MOVING SURFACE LABEL PASS',{bores,poses:9});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
