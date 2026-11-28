const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1200,height:950}});await page.goto('http://127.0.0.1:5190/scripts/fixtures/pick-rover-assembly.html');await page.waitForFunction(()=>!!window.__pickAssemblyApi);
 for(const index of[0,1])for(const progress of[0,.075,.15,.35,.55,.625,.7,.85,1]){
  const result=await page.evaluate(async({index,progress})=>{
   const{Box3}=await import('/node_modules/three/build/three.module.js'),{roverConnectorMeshesIntersect:hit}=await import('/src/modules/rover-connector-intersection.ts'),{pickServoFeedMotion}=await import('/src/data/pick-rover-servo-feed-motion.ts');
   const api=window.__pickAssemblyApi;api.motion.apply(37+index,progress);api.scene.updateMatrixWorld(true);
   const board=api.scene.getObjectByName('pick-rover-pca-hardware'),id=index?'return':'positive',clamp=board.getObjectByName('pick-pca-clamp-'+id),screw=board.getObjectByName('pick-pca-clamp-screw-'+id),expected=pickServoFeedMotion(index,progress),moving=[],fixed=[];
   const within=(o,parent)=>{for(let q=o;q;q=q.parent)if(q===parent)return true;return false;};
   board.traverse(o=>{if(o.isMesh&&!('text'in o))(within(o,clamp)?moving:fixed).push(o);});const unexpected=[];
   for(const a of moving)for(const b of fixed)if(new Box3().setFromObject(a,true).intersectsBox(new Box3().setFromObject(b,true))&&hit(a,b))unexpected.push({moving:a.geometry.type,fixed:b.geometry.type,owner:b.parent.name});
   return{unexpected,plate:clamp.position.y,screw:screw.rotation.y,expected:expected.release,meshes:moving.length};
  },{index,progress});assert.equal(result.meshes,4);assert.deepEqual(result.unexpected,[]);assert.ok(Math.abs(result.plate-result.expected*1.5)<1e-8);assert.ok(Math.abs(result.screw-result.expected*Math.PI*1.5)<1e-8);console.log('ACTUAL CLAMP / CAGE CLEARANCE / SCREW ROTATION PASS',index,progress);
 }
 await page.evaluate(()=>{const api=window.__pickAssemblyApi;api.motion.apply(38,.35);api.motion.apply(0,0);});
 const reset=await page.evaluate(()=>['positive','return'].map(id=>window.__pickAssemblyApi.scene.getObjectByName('pick-pca-clamp-'+id).position.y));assert.deepEqual(reset,[0,0]);console.log('REWIND CLOSES BOTH TERMINALS PASS');
}finally{await browser.close();}})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
