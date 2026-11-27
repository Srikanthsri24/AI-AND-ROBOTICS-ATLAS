const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 950 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5190/');
    await page.evaluate(async () => {
      document.querySelector('#root').style.display = 'none';
      (await import('/scripts/fixtures/rover-arm-cables.tsx')).mount(
        document.body.appendChild(document.createElement('div')),
        { fullStation: true, loomSupport: true, powerOn: false }
      );
    });
    await page.waitForFunction(() => window.__raLoomFocus && window.__raLoomScene.scene.getObjectByName('ra-arm-cables')?.userData.route5);
    const parts = await page.evaluate(async () => (await import('/src/data/rover-arm-loom-support.ts')).raArmLoomSupportParts);
    assert.equal(parts.length, 15);
    await page.evaluate(() => {
      const meshes = [];
      window.__raLoomScene.scene.getObjectByName('ra-arm-loom-support').traverse(o => { if (o.isMesh) meshes.push(o); });
      window.__raSupportBuffers = meshes.map(o => ({ mesh: o, geometry: o.geometry, position: o.geometry.attributes.position, index: o.geometry.index }));
    });
    for (const part of parts) {
      const point = await page.evaluate(async id => {
        const { Vector3 } = await import('/node_modules/three/build/three.module.js');
        const group = window.__raLoomScene.scene.getObjectByName(id);
        // The first mesh of a guide is its actual eye, not the arm or collar.
        let mesh;
        group.traverse(o => { if (!mesh && o.isMesh) mesh = o; });
        const geometry = mesh.geometry, a = geometry.attributes.position, indices = geometry.index;
        const vertex = n => new Vector3().fromBufferAttribute(a, indices ? indices.getX(n) : n);
        const preferred = mesh.localToWorld(vertex(0).add(vertex(1)).add(vertex(2)).divideScalar(3));
        return window.__raLoomFocus(id, preferred.toArray());
      }, part.id);
      assert.ok(point, 'Actual organizer surface available: ' + part.id);
      const canvas = await page.locator('canvas').boundingBox();
      await page.mouse.click(canvas.x + point.x, canvas.y + point.y);
      await page.waitForFunction(id => window.__raLoomSelected === id, part.id);
      await page.locator('.crane-surface-label').filter({ hasText: part.label }).waitFor();
      const check = await page.evaluate(async id => {
        const { floodOwner } = await import('/src/data/flood-surface.ts');
        const anchor = window.__raLoomAnchor.current, group = window.__raLoomScene.scene.getObjectByName(id), colors = [];
        group.traverse(o => { if (o.isMesh) colors.push(o.material.color.getHexString()); });
        const retained = window.__raSupportBuffers.every(b => b.mesh.geometry === b.geometry && b.geometry.attributes.position === b.position && b.geometry.index === b.index);
        let firstMesh; group.traverse(o => { if (!firstMesh && o.isMesh) firstMesh = o; });
        return { owner: anchor ? floodOwner(anchor.object) : null, eyePicked: anchor?.object === firstMesh, colors, retained };
      }, part.id);
      assert.equal(check.owner, part.id, 'Attached to selected actual part');
      if (part.id.includes('-in-') || part.id.includes('-out-')) assert.ok(check.eyePicked, 'Actual guide eye picked, not its support arm');
      assert.ok(check.colors.length && check.colors.every(c => c === 'c4a2ff'), 'All owned surfaces highlighted');
      assert.ok(check.retained, 'Geometry buffers retained during selection');
      console.log('ACTUAL ORGANIZER PART / HIGHLIGHT / ATTACHED LABEL / RETAINED BUFFERS PASS', part.id);
    }
    await page.screenshot({ path: '/tmp/atlas-ra-support-selected.png' });
    assert.deepEqual(errors, []);
  } finally {
    await Promise.race([browser.close(), new Promise(resolve => { const t = setTimeout(resolve, 5000); t.unref(); })]);
  }
})().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
