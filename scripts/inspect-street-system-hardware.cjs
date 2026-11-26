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
  await page.screenshot({path:'/tmp/atlas-street-system-hardware.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);await page.screenshot({path:'/tmp/atlas-street-system-hardware-phone.png'});
  if(errors.length)throw Error(errors.join(';'));console.log('STREET HARDWARE RENDER / INDEPENDENT ACTUAL LED MATERIALS PASS',result);
 }finally{await page.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
