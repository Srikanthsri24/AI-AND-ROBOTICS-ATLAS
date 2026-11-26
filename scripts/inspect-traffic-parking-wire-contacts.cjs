const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:1200,height:850}});await p.goto('http://127.0.0.1:5190/');
 await p.evaluate(async()=>{document.getElementById('root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);(await import('/scripts/fixtures/traffic-parking-workbench.tsx')).mount(el);window.__T=await import('/node_modules/.vite/deps/three.js');window.__wires=(await import('/src/data/traffic-parking-wires.ts')).trafficParkingWires;window.__uno=(await import('/src/data/uno-r3-board-layout.json')).default;});
 await p.waitForFunction(()=>window.__tpBenchScene?.scene.getObjectByName('tp-wire-servo-reference-jacket'));await p.waitForTimeout(500);
 const checks=await p.evaluate(()=>{const T=window.__T,s=window.__tpBenchScene;s.scene.updateMatrixWorld(true);const box=m=>new T.Box3().setFromObject(m),same=(a,b,message)=>{if(Math.abs(a-b)>1e-7)throw Error(message+' '+a+' '+b);};let upward=0,ledSockets=0,servoPins=0,supplyClamps=0;
  for(const w of window.__wires)for(const [end,port] of [w.a,w.b].entries()){
   const name=end?w.to:w.from,g=s.scene.getObjectByName(w.id+'-end-'+end),id=w.id;
   if(port.kind==='male-up'){
    const [device,pin,bank,row]=name.split('.'),shaft=box(s.scene.getObjectByName(id+'-pin-'+end)),grip=box(s.scene.getObjectByName(id+'-grip-'+end));let springs=[],surface;
    if(device==='uno'){const n=window.__uno.headers.findIndex(h=>h.name===pin),header=s.scene.getObjectByName('tp-uno-headers').children[n];surface=box(header).max.y;springs=header.children.filter(m=>m.isMesh&&m.material.metalness>.5&&m.position.y>.1).map(box);}else{const owner=s.scene.getObjectByName('tp-board-'+device);surface=box(owner).max.y;let inst;owner.traverse(m=>{if(m.isInstancedMesh&&m.count===340)inst=m;});inst.geometry.computeBoundingBox();for(const side of [0,1]){const matrix=new T.Matrix4(),n=((+pin*2+(+bank<0?0:1))*5+ +row)*2+side;inst.getMatrixAt(n,matrix);springs.push(inst.geometry.boundingBox.clone().applyMatrix4(matrix).applyMatrix4(inst.matrixWorld));}}
    if(springs.length!==2||grip.min.y-surface<.004)throw Error('Grip hits socket top '+name);for(const spring of springs){const overlap=Math.min(shaft.max.y,spring.max.y)-Math.max(shaft.min.y,spring.min.y);if(overlap<.019)throw Error('Insufficient actual pin/spring overlap '+name);}
    const x=(springs[0].getCenter(new T.Vector3()).x+springs[1].getCenter(new T.Vector3()).x)/2,z=(springs[0].getCenter(new T.Vector3()).z+springs[1].getCenter(new T.Vector3()).z)/2;same(shaft.getCenter(new T.Vector3()).x,x,'Pin X');same(shaft.getCenter(new T.Vector3()).z,z,'Pin Z');upward++;
   }else if(port.kind==='female-led'){
    const [,lamp,leg]=name.split('.'),shaft=s.scene.getObjectByName(lamp+'-'+leg+'-metal'),socket=s.scene.getObjectByName(id+'-socket-'+end);shaft.geometry.computeBoundingBox();const transform=new T.Matrix4().copy(g.matrixWorld).invert().multiply(shaft.matrixWorld),local=shaft.geometry.boundingBox.clone().applyMatrix4(transform);same(local.min.x,-.25,'LED contact local lower face');
    // Local connector units are millimetres; its parent supplies the 0.01 scale.
    same(local.max.x,.25,'LED contact local upper face');same(local.min.z,-.25,'LED square leg depth');same(local.max.z,.25,'LED square leg depth');
    for(const side of [-1,1]){const m=s.scene.getObjectByName(id+'-spring-'+end+'-'+side),face=m.position.x-side*m.geometry.parameters.width/2;same(face,side*.25,'Female contact face');if(Math.min(.3,local.max.y)-Math.max(-3.5,local.min.y)<3.49)throw Error('LED contact insertion too short');}
    const at=(x,y,z)=>g.localToWorld(new T.Vector3(x,y,z)),ray=(x)=>{const a=at(x,-5,0),b=at(x,3,0);return new T.Raycaster(a,b.sub(a).normalize()).intersectObject(socket).length;};if(ray(0)||!ray(.7))throw Error('Female connector bore/control '+name);ledSockets++;
   }else if(port.kind==='male-servo'){
    const role=name.split('.')[1],shaft=box(s.scene.getObjectByName(id+'-pin-'+end));for(const side of [-1,1]){const spring=box(s.scene.getObjectByName('tp-servo-contact-'+role+'-spring-'+side));same(side<0?shaft.min.x:shaft.max.x,side<0?spring.max.x:spring.min.x,'Servo spring face');if(Math.min(shaft.max.z,spring.max.z)-Math.max(shaft.min.z,spring.min.z)<.049)throw Error('Servo insertion too short');}
    const grip=box(s.scene.getObjectByName(id+'-grip-'+end)),housing=box(s.scene.getObjectByName('tp-servo-plug-housing'));if(grip.min.z-housing.max.z<.0049)throw Error('Servo grip hits plug');servoPins++;
   }else{
    const [,polarity,index]=name.split('.'),bare=box(s.scene.getObjectByName(id+'-bare-'+end)),clamp=box(s.scene.getObjectByName(`tp-supply-${polarity}-${index}-screw-shank`)),barrel=box(s.scene.getObjectByName(`tp-supply-${polarity}-${index}-barrel`));same(bare.max.y,clamp.min.y,'Supply clamp does not touch conductor');if(bare.min.z<barrel.min.z||bare.min.z>barrel.max.z)throw Error('Stripped tip misses terminal');supplyClamps++;
   }
  }return {upward,ledSockets,servoPins,supplyClamps};});
 assert.deepEqual(checks,{upward:46,ledSockets:14,servoPins:3,supplyClamps:3});console.log('TRAFFIC PARKING ALL 66 RENDERED CONNECTOR INSERTIONS / SPRING CONTACTS / REAL BORES / CLAMPS PASS',checks);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
