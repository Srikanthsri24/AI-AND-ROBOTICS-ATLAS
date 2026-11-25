// Native browser verification of the unregistered radar scanner.
// Requires local Vite on 5190, Playwright and Chrome. Run with node scripts/inspect-radar-scanner.cjs.
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
    try {
        const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        await p.goto('http://127.0.0.1:5190/');
        await p.evaluate(async () => { const R = await import('/node_modules/.vite/deps/react.js'), D = await import('/node_modules/.vite/deps/react-dom_client.js'), F = await import('/node_modules/.vite/deps/@react-three_fiber.js'), T = await import('/node_modules/.vite/deps/three.js'), { default: Parts } = await import('/src/modules/RadarScannerParts.tsx'), { default: Lighting } = await import('/src/modules/WorkshopStudioLighting.tsx'), h = R.createElement ?? R.default.createElement; window.__T = T; document.querySelector('#root').style.display = 'none'; const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0'; document.body.append(el); function Preview() { const [selected, select] = (R.useState ?? R.default.useState)(''); const [pose, setPose] = (R.useState ?? R.default.useState)({ actual: 90, hornOffset: 0, explode: 0 }); window.__pose = setPose; window.__selected = selected; return h(F.Canvas, { shadows: true, camera: { position: [3.4, 3.5, 4.5], fov: 42, near: .001 }, onCreated: s => window.__get = s.get }, h(Lighting), h('ambientLight', { intensity: 1.5 }), h('directionalLight', { position: [-4, 7, 6], intensity: 2.5 }), h('color', { attach: 'background', args: ['#edf0f8'] }), h('group', { name: 'radar-scanner', scale: .02 }, h(Parts, { selected, select, ...pose }))); } (D.createRoot ?? D.default.createRoot)(el).render(h(Preview)); });
        await p.waitForFunction(() => window.__get?.().scene.getObjectByName('radar-scanner'));
        const ids = await p.evaluate(() => { const T = window.__T, root = window.__get().scene.getObjectByName('radar-scanner'); root.updateWorldMatrix(true, true); const ids = [], parts = {}; root.traverse(o => { if (o.userData.partId) {
            ids.push(o.userData.partId);
            parts[o.userData.partId] = o;
        } }); if (ids.length !== 20 || new Set(ids).size !== 20)
            throw Error('Expected twenty unique scanner owners, got ' + ids.length); const meshes = id => { const out = []; parts[id].traverse(o => { if (o.isMesh && o.text === undefined)
            out.push(o); }); return out; }, ray = new T.Raycaster(); for (const x of [-10.1, 20.9]) {
            ray.set(new T.Vector3(x * .02, .021, 0), new T.Vector3(0, 1, 0));
            ray.far = .58;
            if (ray.intersectObjects(['radar-base', 'radar-posts', 'radar-servo-case'].flatMap(meshes), false).length)
                throw Error('Base/post/ear bore blocked');
        } for (const [x, y] of [[-20, -7.5], [20, -7.5], [-20, 7.5], [20, 7.5]]) {
            ray.set(new T.Vector3(x * .02, (68 + y) * .02, -.12), new T.Vector3(0, 0, 1));
            ray.far = .15;
            if (ray.intersectObjects(['radar-bracket', 'radar-sonar-pcb'].flatMap(meshes), false).length)
                throw Error('Sensor and bracket holes misaligned');
        } ray.set(new T.Vector3(0, 69.8 * .02, -.1), new T.Vector3(0, 0, 1)); ray.far = .027; if (ray.intersectObjects(meshes('radar-bracket'), false).length)
            throw Error('Bracket blocks rear electronics'); window.__get().camera.position.set(2.8, 2.4, 3.4); window.__get().camera.lookAt(0, .75, 0); window.__get().camera.updateMatrixWorld(); return ids; });
        console.log('TWENTY OWNERS / TWO BASE-POST-EAR BORES / FOUR SENSOR-STRAP BORES / OPEN REAR PASS');
        await p.screenshot({ path: '/tmp/atlas-radar-scanner.png' });
        for (const id of ids) {
            let clicked = false;
            for (let attempt = 0; attempt < 10 && !clicked; attempt++) {
                const hit = await p.evaluate(({ id, attempt }) => { const T = window.__T, s = window.__get(), root = s.scene.getObjectByName('radar-scanner'); root.updateWorldMatrix(true, true); let owner; root.traverse(o => { if (o.userData.partId === id)
                    owner = o; }); const meshes = [], all = []; owner.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry?.attributes.position && o.text === undefined)
                    meshes.push(o); }); root.traverse(o => { if (o.isMesh && o.geometry?.attributes.position && o.text === undefined)
                    all.push(o); }); const box = new T.Box3().setFromObject(owner), centre = box.getCenter(new T.Vector3()), span = box.getSize(new T.Vector3()).length(), ray = new T.Raycaster(); let seen = 0; for (const dir of [[1, 1, 2], [-1, 1, 2], [1, 2, -2], [-1, 2, -2], [1, .05, 1], [-1, .05, 1], [0, 3, 0], [0, -.3, 1], [0, .1, -1], [1, .15, -2], [-1, .15, -2]]) {
                    s.camera.position.copy(centre).add(new T.Vector3(...dir).normalize().multiplyScalar(Math.max(.13, span * 1.4)));
                    s.camera.lookAt(centre);
                    s.camera.updateMatrixWorld();
                    for (const mesh of meshes) {
                        const a = mesh.geometry.attributes.position, index = mesh.geometry.index, count = index ? index.count : a.count;
                        for (let i = 0; i + 2 < count; i += 3 * Math.max(1, Math.floor(count / 300))) {
                            const point = new T.Vector3();
                            for (let k = 0; k < 3; k++)
                                point.add(new T.Vector3().fromBufferAttribute(a, index ? index.getX(i + k) : i + k));
                            point.multiplyScalar(1 / 3).applyMatrix4(mesh.matrixWorld);
                            const screen = point.project(s.camera);
                            if (Math.abs(screen.x) > .94 || Math.abs(screen.y) > .94)
                                continue;
                            const x = Math.round((screen.x + 1) * 1200 / 2), y = Math.round((1 - screen.y) * 900 / 2);
                            ray.setFromCamera(new T.Vector2(x / 1200 * 2 - 1, 1 - y / 900 * 2), s.camera);
                            const first = ray.intersectObjects(all, false)[0];
                            let o = first?.object;
                            while (o && !o.userData.partId)
                                o = o.parent;
                            if (o?.userData.partId === id) {
                                if (seen++ < attempt)
                                    continue;
                                return { x, y };
                            }
                        }
                    }
                } return null; }, { id, attempt });
                if (!hit)
                    continue;
                await p.mouse.click(hit.x, hit.y);
                await p.waitForTimeout(120);
                clicked = await p.evaluate(id => window.__selected === id, id);
            }
            if (!clicked)
                throw Error('Native mesh click failed ' + id);
            await p.evaluate(id => { let owner; window.__get().scene.traverse(o => { if (o.userData.partId === id)
                owner = o; }); let highlighted = false; owner.traverse(o => { if (['b48bec', 'b78be8'].includes(o.material?.color?.getHexString()))
                highlighted = true; }); if (!highlighted)
                throw Error('Actual owner not highlighted ' + id); }, id);
            console.log('ACTUAL PART CLICK / HIGHLIGHT', id);
        }
        for (const actual of [30, 60, 90, 120, 150])
            for (const hornOffset of [-20, 0, 20]) {
                await p.evaluate(pose => window.__pose(pose), { actual, hornOffset, explode: 0 });
                await p.waitForTimeout(80);
                await p.evaluate(async ({ actual, hornOffset }) => { const T = window.__T, { radarSonarContact } = await import('/src/data/radar-scanner-layout.ts'), scene = window.__get().scene; scene.updateMatrixWorld(true); for (const [id, x] of [['radar-sonar-vcc', -3.81], ['radar-sonar-trigger', -1.27], ['radar-sonar-echo', 1.27], ['radar-sonar-ground', 3.81]]) {
                    let owner;
                    scene.traverse(o => { if (o.userData.partId === id)
                        owner = o; });
                    let pin;
                    owner.traverse(o => { if (o.isMesh && o.geometry.parameters?.height === 6)
                        pin = o; });
                    if (!pin)
                        throw Error('Missing actual header pin ' + id);
                    const tip = new T.Vector3(0, -3, 0).applyMatrix4(pin.matrixWorld), expected = new T.Vector3(...radarSonarContact(x, actual + hornOffset)).multiplyScalar(.02);
                    if (tip.distanceTo(expected) > 1e-7)
                        throw Error('Head/contact transform mismatch ' + id);
                } }, { actual, hornOffset });
            }
        console.log('ACTUAL FOUR PIN TIPS MATCH PHYSICAL HEAD AT FIFTEEN POSES');
        console.log('CHASSIS OWNERS', ids.join(', '));
    }
    finally {
        await browser.close();
    }
})().then(() => process.exit(0)).catch(e => { console.error(e.stack); process.exit(1); });
