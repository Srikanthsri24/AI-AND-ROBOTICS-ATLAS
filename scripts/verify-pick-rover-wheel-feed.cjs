const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('../node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(
  fs.readFileSync(file, 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }
).outputText, file);
const { pickWheelSupplyFeed } = require('../src/data/pick-rover-wheel-supply-feed.ts');
const { pickWheelSupplyRoute } = require('../src/data/pick-rover-wheel-supply-leads.ts');
for (const index of [0, 1]) {
  const reference = pickWheelSupplyRoute(index);
  let worstLength = 0;
  for (let n = 0; n <= 1000; n++) {
    const pose = pickWheelSupplyFeed(index, n / 1000);
    assert.ok(pose.curve.getPoint(0).distanceTo(reference.start) < 1e-8, 'source joint moved');
    assert.ok(pose.curve.getPoint(1).distanceTo(pose.plug.clone().add({ x: 0, y: 8.05, z: 0 })) < 1e-8, 'wire detached from plug');
    assert.ok(pose.curve.points.every(p => p.toArray().every(Number.isFinite)));
    worstLength = Math.max(worstLength, Math.abs(pose.curve.getLength() - pose.length));
  }
  assert.ok(worstLength < .01, 'service loop stretched');
  const seated = pickWheelSupplyFeed(index, 1);
  assert.equal(seated.plug.y, reference.pin[1] - 2.75);
  console.log('FIXED SOURCE / REAL PLUG EXIT / 1001 POSES / LENGTH RESIDUAL', index, worstLength);
}
for (const [index, progress] of [[-1, 0], [2, 0], [0, -1], [1, 2], [0, NaN]])
  assert.throws(() => pickWheelSupplyFeed(index, progress));
