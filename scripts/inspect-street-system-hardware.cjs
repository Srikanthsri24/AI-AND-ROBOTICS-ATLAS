const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});
 page.on('console',m=>{if(m.type()==='error')console.error('BROWSER',m.text())});
 try{
  await page.goto('http://127.0.0.1:5190/');
  await page.evaluate(async()=>{
   document.querySelector('#root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);
   const {mountStreetHardware}=await import('/scripts/fixtures/street-system-hardware.tsx');mountStreetHardware(el);
  });
  await page.waitForFunction(()=>window.__get?.().scene.getObjectByName('street-lamp-3-resistor'),null,{timeout:120000});
  await page.waitForTimeout(1500);
  const result=await page.evaluate(async()=>{
   const scene=window.__get().scene;let meshes=0;const owners=new Set();scene.traverse(o=>{if(o.userData.partId)owners.add(o.userData.partId);if(o.isMesh)meshes++;});
   const {streetSystemParts}=await import('/src/data/street-system-parts.ts');
   if(streetSystemParts.length!==owners.size||new Set(streetSystemParts.map(p=>p.id)).size!==owners.size)throw Error('Part catalog size mismatch');
   for(const p of streetSystemParts)if(!owners.has(p.id)||!p.what||!p.connection)throw Error('Missing physical part or explanation '+p.id);
   for(let n=1;n<=3;n++){
    const lens=scene.getObjectByName('street-lamp-'+n+'-lens');let emission=0;lens.traverse(o=>{if(o.isMesh)emission=Math.max(emission,o.material.emissiveIntensity??0)});
    if(emission!==(n===2?0:2.8))throw Error('Wrong physical lamp emission '+n);
   }
   return {owners:owners.size,meshes};
  });
  for(const travel of [0,25,50,75,100,0]){
   await page.evaluate(travel=>window.__shadeTravel(travel),travel);
   await page.waitForFunction(async travel=>{const {streetShadePose}=await import('/src/data/street-system-shade.ts');const card=window.__get().scene.getObjectByName('street-shade-card');return Math.abs(card.position.x-streetShadePose(travel).x)<1e-8;},travel);
   const covered=await page.evaluate(async travel=>{
    const T=await import('/node_modules/.vite/deps/three.js'),{streetShadeGeometry:g,streetShadeCoverage}=await import('/src/data/street-system-shade.ts');
    const card=window.__get().scene.getObjectByName('street-shade-card');card.updateWorldMatrix(true,false);const box=new T.Box3().setFromObject(card);let total=0,shadow=0;
    for(let x=0;x<400;x++)for(let z=0;z<400;z++){const dx=((x+.5)/400*2-1)*g.radius,dz=((z+.5)/400*2-1)*g.radius;if(dx*dx+dz*dz>g.radius*g.radius)continue;total++;const wx=(g.sensorX+dx)*.01,wz=(g.sensorZ+dz)*.01;if(wx>=box.min.x&&wx<=box.max.x&&wz>=box.min.z&&wz<=box.max.z)shadow++;}
    const observed=shadow/total*100;if(Math.abs(observed-streetShadeCoverage(travel))>.1)throw Error('Rendered card overlap differs from controller');return observed;
   },travel);
   console.log('ACTUAL SHADE CARD POSE / SAMPLED FACE COVERAGE',travel,covered);
  }
  await page.screenshot({path:'/tmp/atlas-street-system-hardware.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);await page.screenshot({path:'/tmp/atlas-street-system-hardware-phone.png'});
  if(errors.length)throw Error(errors.join(';'));console.log('STREET HARDWARE RENDER / INDEPENDENT ACTUAL LED MATERIALS PASS',result);
 }finally{await page.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
