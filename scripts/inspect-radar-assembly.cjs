// Native verification of actual radar assembly; requires local Vite on 5190, Playwright and Chrome.
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
    try {
        const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        const errors = [];
        p.on('pageerror', e => errors.push(e.message));
        await p.goto('http://127.0.0.1:5190/');
        await p.evaluate(async () => { const R = await import('/node_modules/.vite/deps/react.js'), D = await import('/node_modules/.vite/deps/react-dom_client.js'), F = await import('/node_modules/.vite/deps/@react-three_fiber.js'), T = await import('/node_modules/.vite/deps/three.js'), { default: Parts } = await import('/src/modules/RadarWorkshopPrototype.tsx'), { default: Bridge } = await import('/src/modules/RadarMotionBridge.tsx'), { default: Lighting } = await import('/src/modules/WorkshopStudioLighting.tsx'), A = await import('/src/data/radar-assembly.ts'), h = R.createElement ?? R.default.createElement; window.__T = T; window.__A = A; const assembly = { current: 0 }, motion = { current: A.radarAssemblyMotion(0) }, live = { current: A.radarAssemblyMotion(9) }; window.__p = assembly; window.__motion = motion; window.__live = live; document.querySelector('#root').style.display = 'none'; const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0'; document.body.append(el); function Preview() { const [selected, select] = (R.useState ?? R.default.useState)(''); window.__select = select; window.__selected = selected; return h(F.Canvas, { shadows: true, camera: { position: [6, 5, 8], fov: 42, near: .001, far: 150 }, onCreated: s => window.__get = s.get }, h('color', { attach: 'background', args: ['#edf0f8'] }), h(Lighting), h('ambientLight', { intensity: 1.5 }), h('directionalLight', { position: [-4, 7, 6], intensity: 2.5 }), h(Bridge, { assembly, motion, live }), h('group', { name: 'radar-assembly-test', scale: .02 }, h(Parts, { selected, select, assembly, motion }))); } (D.createRoot ?? D.default.createRoot)(el).render(h(Preview)); });
        await p.waitForFunction(() => window.__get?.().scene.getObjectByName('radar-assembly-rig')?.userData.assemblyProgress === 0);
        await p.evaluate(() => { const r = window.__get().scene.getObjectByName('radar-assembly-test'), ids = [], buffers = {}; r.traverse(o => { if (o.userData.partId)
            ids.push(o.userData.partId); if (o.isMesh && o.text === undefined)
            buffers[o.uuid] = { geometry: o.geometry, position: o.geometry.getAttribute('position'), array: o.geometry.getAttribute('position').array }; }); if (ids.length !== 92 || new Set(ids).size !== 92)
            throw Error('92 owner groups required'); if (JSON.stringify(ids.slice().sort()) !== JSON.stringify(window.__A.radarAssemblyParts.map(p => p.id).sort()))
            throw Error('Assembly catalogue mismatch'); window.__meshBuffers = buffers; });
        console.log('92 OWNERS / COMPLETE ASSEMBLY CATALOGUE PASS');
        const samples = Array.from(new Set([...Array.from({ length: 181 }, (_, i) => i / 20), .2, .35, .45, .55, .7, .88, 2.25, 2.8, 2.9, 3.7, 4.6, 4.8, 5.5, 5.7, 8.7])).sort((a, b) => a - b);
        for (const progress of samples) {
            await p.evaluate(n => window.__p.current = n, progress);
            await p.waitForFunction(n => window.__get().scene.getObjectByName('radar-assembly-rig').userData.assemblyProgress === n, progress);
            await p.evaluate(async (progress) => {
                const T = window.__T, A = window.__A, m = A.radarAssemblyMotion(progress), root = window.__get().scene.getObjectByName('radar-assembly-test');
                root.updateWorldMatrix(true, true);
                const owners = {};
                root.traverse(o => { if (o.userData.partId)
                    owners[o.userData.partId] = o; });
                const visible = o => { for (let p = o; p; p = p.parent)
                    if (!p.visible)
                        return false; return true; }, owner = o => { while (o && !o.userData.partId)
                    o = o.parent; return o?.userData.partId; };
                for (const [id, g] of Object.entries(owners)) {
                    if (visible(g) !== A.radarAssemblyPose(id, progress).visible)
                        throw Error('Actual owner visibility mismatch ' + id + ' ' + progress);
                }
                for (const name of ['radar-bracket-nut-set', 'radar-bracket-screw-set', 'radar-sonar-nut-set', 'radar-sonar-screw-set']) {
                    const g = root.getObjectByName(name);
                    if (g.visible !== A.radarAssemblyPose(name, progress).visible)
                        throw Error('Fastener approach visibility mismatch');
                }
                root.traverse(o => { if (!o.isMesh || o.text !== undefined)
                    return; const saved = window.__meshBuffers[o.uuid]; if (!saved || saved.geometry !== o.geometry || saved.position !== o.geometry.getAttribute('position') || saved.array !== o.geometry.getAttribute('position').array)
                    throw Error('Assembly recreated mesh buffers ' + owner(o)); if (visible(o)) {
                    const b = new T.Box3().setFromObject(o);
                    if (b.min.y < -.00001)
                        throw Error('Part penetrates bench ' + owner(o) + ' ' + progress + ' ' + b.min.y);
                } });
                const b = id => new T.Box3().setFromObject(owners[id]), scale = .02;
                if (progress <= .35 && Math.abs(b('radar-feet').min.y - b('radar-assembly-supports').max.y) > 1e-7)
                    throw Error('Base not supported while underside screws seat');
                if (progress >= .45 && progress <= .55 && b('radar-feet').min.y - b('radar-assembly-supports').max.y < .0399)
                    throw Error('Support blocks withdrawn before base lifted');
                if (progress >= 4.6 && progress < 5) {
                    const nuts = new T.Box3().setFromObject(root.getObjectByName('radar-bracket-nut-set'));
                    if (Math.abs(nuts.min.y / scale - 36.8) > 1e-5 || Math.abs(nuts.max.y / scale - 38) > 1e-5)
                        throw Error('Bracket nuts not sliding beneath horn');
                    if (progress < 4.8 && visible(root.getObjectByName('radar-bracket-screw-set')))
                        throw Error('Screws inserted before nuts seated');
                }
                if (progress >= 5.5 && progress < 5.7) {
                    const nuts = new T.Box3().setFromObject(root.getObjectByName('radar-sonar-nut-set'));
                    if (nuts.max.z / scale > -3.59999)
                        throw Error('Sensor nuts pass through rear strap');
                }
                const { radarUsbConnected } = await import('/src/data/radar-usb.ts'), expectOn = radarUsbConnected(m.usb, m.usbUno, m.usbHost);
                let emitting = false;
                root.getObjectByName('radar-uno-led-ON').traverse(o => { if (o.material?.emissive?.getHex() > 0 && o.material.emissiveIntensity > .5)
                    emitting = true; });
                if (emitting !== expectOn)
                    throw Error('Actual Uno power mismatches assembly ' + progress);
                if (root.getObjectByName('radar-supply-voltage').text !== (m.servoPower ? '5.00 V' : 'OFF'))
                    throw Error('Actual servo supply voltage text wrong ' + progress);
                if (progress >= 3 && progress < 8 && (expectOn || m.servoPower))
                    throw Error('Horn/board installation while powered');
                for (const [id, field] of [['radar-usb-b-body', 'uno'], ['radar-usb-a-body', 'host']]) {
                    const { radarUsbPose } = await import('/src/data/radar-usb.ts'), expected = radarUsbPose(m.usbUno, m.usbHost)[field], actual = new T.Vector3().setFromMatrixPosition(root.getObjectByName(id).matrixWorld);
                    if (actual.distanceTo(new T.Vector3(...expected).multiplyScalar(scale)) > 1e-7)
                        throw Error('Actual USB end not following assembly');
                }
                const { radarServoTail } = await import('/src/data/radar-power-layout.ts');
                for (let i = 0; i < 3; i++) {
                    const id = ['radar-servo-signal-tail', 'radar-servo-positive-tail', 'radar-servo-ground-tail'][i], wire = root.getObjectByName(id + '-tube'), g = wire.geometry, a = g.getAttribute('position'), n = g.parameters.radialSegments;
                    for (const end of [0, 1]) {
                        const centre = new T.Vector3();
                        for (let k = 0; k < n; k++)
                            centre.add(new T.Vector3().fromBufferAttribute(a, (end ? g.parameters.tubularSegments * (n + 1) : 0) + k));
                        centre.divideScalar(n).applyMatrix4(wire.matrixWorld);
                        const p = radarServoTail(i)[end ? 5 : 0], offset = A.radarAssemblyPose(id, progress).offset, expected = new T.Vector3(p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]).multiplyScalar(scale);
                        if (centre.distanceTo(expected) > 1e-6)
                            throw Error('Permanent servo tail detached while mounting');
                    }
                }
                for (const prefix of ['radar-lead-vcc', 'radar-lead-trigger', 'radar-lead-echo', 'radar-lead-ground', 'radar-jumper-servo-command', 'radar-jumper-servo-positive', 'radar-jumper-servo-return', 'radar-jumper-logic-reference', 'radar-jumper-uno-reference', 'radar-usb-cable']) {
                    const wire = root.getObjectByName(prefix + '-tube'), g = wire.geometry, path = g.userData.motionPath;
                    if (!path)
                        throw Error('Missing animated physical cable');
                    const a = g.getAttribute('position'), n = g.parameters.radialSegments;
                    for (const end of [0, 1]) {
                        const centre = new T.Vector3();
                        for (let k = 0; k < n; k++)
                            centre.add(new T.Vector3().fromBufferAttribute(a, (end ? g.parameters.tubularSegments * (n + 1) : 0) + k));
                        centre.divideScalar(n);
                        if (centre.distanceTo(path.getPoint(end)) > 1e-4)
                            throw Error('Animated cable end detaches');
                    }
                }
                if (progress >= .7) {
                    const g = owners['radar-shaft'], mesh = [];
                    g.traverse(o => { if (o.isMesh)
                        mesh.push(o); });
                    const parent = g.parent, direction = new T.Vector3(0, 0, 1).transformDirection(parent.matrixWorld), angle = (m.actual - 90) * Math.PI / 180;
                    if (direction.distanceTo(new T.Vector3(Math.sin(angle), 0, Math.cos(angle))) > 1e-7)
                        throw Error('Bare shaft angle does not match setup');
                }
            }, progress);
            if (Number.isInteger(progress))
                console.log('ACTUAL ASSEMBLY CHAPTER / POSES / POWER / ATTACHED CABLES / RETAINED BUFFERS', progress);
        }
        await p.evaluate(() => window.__p.current = 2.6);
        await p.waitForFunction(() => window.__get().scene.getObjectByName('radar-assembly-rig').userData.assemblyProgress === 2.6);
        await p.evaluate(() => window.__select('radar-supply-display'));
        await p.waitForTimeout(250);
        await p.evaluate(() => { const lcd = window.__get().scene.getObjectByName('radar-supply-lcd'); if (lcd.material.color.getHexString() !== 'b78be8')
            throw Error('Assembly power bridge loses actual selection highlight'); const v = window.__get().scene.getObjectByName('radar-supply-voltage'); if (v.text !== '5.00 V' || v.textRenderInfo?.parameters?.text !== '5.00 V')
            throw Error('Troika voltage glyphs did not sync to actual power state'); });
        console.log('ACTUAL HIGHLIGHT / LIVE VOLTAGE GLYPH SYNC PASS');
        await p.evaluate(() => window.__p.current = 0);
        await p.waitForFunction(() => window.__get().scene.getObjectByName('radar-assembly-rig').userData.assemblyProgress === 0);
        await p.evaluate(() => { const T = window.__T, c = window.__get().camera; c.position.set(-32 * .02, 20 * .02, 90 * .02); c.lookAt(new T.Vector3(-32 * .02, 15 * .02, 27 * .02)); c.updateMatrixWorld(); });
        await p.waitForTimeout(80);
        await p.mouse.click(600, 450);
        await p.waitForTimeout(100);
        await p.evaluate(() => { if (window.__selected !== 'radar-assembly-supports')
            throw Error('Actual support-block click did not choose fixture'); const r = window.__get().scene.getObjectByName('radar-assembly-supports'); r.traverse(o => { if (o.isMesh && o.material.color.getHexString() !== 'b78be8')
            throw Error('Actual supports not highlighted'); }); });
        console.log('ACTUAL TEMPORARY SUPPORT CLICK / HIGHLIGHT PASS');
        await p.evaluate(() => { window.__live.current = { ...window.__A.radarAssemblyMotion(9), actual: 150, hornOffset: -10, servoPower: true }; window.__p.current = 9; });
        await p.waitForFunction(() => window.__get().scene.getObjectByName('radar-assembly-rig').userData.assemblyProgress === 9);
        await p.evaluate(async () => { const T = window.__T, { radarRotate } = await import('/src/data/radar-workshop.ts'), root = window.__get().scene.getObjectByName('radar-assembly-test'); root.updateWorldMatrix(true, true); let tx; root.traverse(o => { if (o.userData.partId === 'radar-sonar-transmitter')
            tx = o.children[0]; }); const p = tx.localToWorld(new T.Vector3(0, 0, 13.2)), expected = radarRotate(-13, 13.2, 140); if (p.distanceTo(new T.Vector3(expected[0] * .02, 68 * .02, expected[1] * .02)) > 1e-7)
            throw Error('Completed rig ignores live head pose'); if (root.getObjectByName('radar-supply-voltage').text !== '5.00 V')
            throw Error('Completed rig ignores live power'); });
        console.log('READY BENCH FOLLOWS LIVE HEAD / FITTING OFFSET / SUPPLY REF PASS');
        if (errors.length)
            throw Error(errors.join('\n'));
        console.log('ASSEMBLY NATIVE VERIFICATION PASS', samples.length);
    }
    finally {
        await browser.close();
    }
})().then(() => process.exit(0)).catch(e => { console.error(e.stack); process.exit(1); });
