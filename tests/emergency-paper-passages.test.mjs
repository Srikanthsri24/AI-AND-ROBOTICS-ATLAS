import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFile} from 'node:fs/promises';
import {Mesh,MeshBasicMaterial,DoubleSide,ExtrudeGeometry,Raycaster,Vector3} from 'three';
async function load(path){let source=ts.transpileModule(await readFile(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;source=source.replace(/from ['"]three['"]/g,`from '${import.meta.resolve('three')}'`);return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));}
const {emergencyLampMounts:lamps}=await load('../src/data/emergency-corridor.ts');
const {emergencyWallProfile,emergencyCarrierBackProfile,emergencyWireBoreRadius:radius}=await load('../src/modules/emergency-paper-profiles.ts');
test('all eight actual paper feed-throughs align through three wall layers and each folded flange',()=>{
 const material=new MeshBasicMaterial({side:DoubleSide}),wall=emergencyWallProfile(lamps),meshes=[];
 assert.equal(wall.holes.length,8);
 function add(shape,depth,x,y,z){const mesh=new Mesh(new ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:48}),material);mesh.position.set(x,y,z);mesh.updateMatrixWorld(true);meshes.push(mesh);}
 add(wall,.3,21.5,56,-128);add(wall,2.4,21.5,56,-127.7);add(wall,.3,21.5,56,-125.3);
 for(const m of lamps)add(emergencyCarrierBackProfile(m.top),2,m.x,6+(m.top-6)/2,-125);
 const cast=(x,y)=>new Raycaster(new Vector3(x,y,-135),new Vector3(0,0,1),0,18).intersectObjects(meshes,false);
 try{for(const m of lamps)for(const side of[-1,1]){
  const x=m.x+side*1.27,y=m.top-15;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;assert.equal(cast(x+Math.cos(a)*.4,y+Math.sin(a)*.4).length,0,'wire skin + .05 mm clearance must fit the actual bore');}
  assert.equal(cast(x,y).length,0);
  assert.ok(cast(x,y+radius+.2).length>=8,'adjacent paper must remain solid through all four physical layers');
 }
 assert.ok(cast(75,60).length>=6,'unperforated back wall must not disappear');
 }finally{for(const m of meshes)m.geometry.dispose();material.dispose();}
});
