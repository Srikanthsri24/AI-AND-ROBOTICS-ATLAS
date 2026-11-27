import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/data/tap-peristaltic-geometry.ts',import.meta.url),'utf8');
const ts=await import('../node_modules/typescript/lib/typescript.js');
const {tapTubeSection,tapTubePoint,tapRollerCenters,tapPumpDimensions:d}=await import('data:text/javascript;base64,'+Buffer.from(ts.default.transpile(source,{target:99,module:99})).toString('base64'));
test('reference envelope retains motor diameter, total depth, tubing and mount pitch',()=>{assert.equal(d.motorDiameter,27.8);assert.equal(d.totalLength,66.8);assert.equal(d.mountPitch,50);assert.equal(d.mountHoleDiameter,3.7);assert.equal(d.tubeOuterDiameter,5);assert.equal(d.tubeInnerDiameter,3.5);});
test('tube is tangent to rollers and constrained by the stationary track over a full turn',()=>{
 for(let k=0;k<90;k++){const phase=k*Math.PI/45;
  for(let i=0;i<=180;i++){const theta=-3*Math.PI/4+i*Math.PI/120,s=tapTubeSection(theta,phase);
   assert.ok(Math.abs(s.center+s.radial-20)<1e-10);
   assert.ok(s.radial>=.75&&s.radial<=2.5);assert.ok(Math.abs(s.radial+s.axial-5)<1e-10);
   const inner=s.center-s.radial;
   for(const [x,y] of tapRollerCenters(phase)){
    const distance=Math.hypot(inner*Math.sin(theta)-x,inner*Math.cos(theta)-y);
    assert.ok(distance>=5-1e-9,'roller must not penetrate tube inner contact boundary');
   }
   for(const inside of [false,true])assert.ok(tapTubePoint(theta,.7,phase,inside).every(Number.isFinite));
  }
 }
});
test('each roller fully closes the lumen at contact while tube between rollers recovers',()=>{
 for(let i=0;i<3;i++){const a=.31+i*2*Math.PI/3,s=tapTubeSection(a,.31);assert.equal(s.radial,.75);assert.equal(s.innerRadial,0);}
 assert.equal(tapTubeSection(.31+Math.PI/3,.31).radial,2.5);
 assert.throws(()=>tapTubeSection(NaN,0),RangeError);assert.throws(()=>tapRollerCenters(Infinity),RangeError);
});
