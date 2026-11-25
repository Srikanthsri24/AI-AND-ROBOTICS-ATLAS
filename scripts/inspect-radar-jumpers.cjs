// Native browser verification of the unregistered radar removable jumpers.
// Requires local Vite on 5190, Playwright and Chrome. Run with node scripts/inspect-radar-jumpers.cjs.
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
    try {
        const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        await p.goto('http://127.0.0.1:5190/');
        await p.evaluate(async () => { const R = await import('/node_modules/.vite/deps/react.js'), D = await import('/node_modules/.vite/deps/react-dom_client.js'), F = await import('/node_modules/.vite/deps/@react-three_fiber.js'), T = await import('/node_modules/.vite/deps/three.js'), { default: Parts } = await import('/src/modules/RadarScannerParts.tsx'), { default: Harness } = await import('/src/modules/RadarSonarHarness.tsx'), { default: Jumpers } = await import('/src/modules/RadarPowerJumpers.tsx'), { radarPowerSeating: seating } = await import('/src/data/radar-power-jumpers.ts'), { default: Power } = await import('/src/modules/RadarPowerParts.tsx'), { default: Uno } = await import('/src/modules/RadarUnoParts.tsx'), { default: Lighting } = await import('/src/modules/WorkshopStudioLighting.tsx'), h = R.createElement ?? R.default.createElement; window.__T = T; document.querySelector('#root').style.display = 'none'; const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0'; document.body.append(el); function Preview() { const [selected, select] = (R.useState ?? R.default.useState)(''); const [pose, setPose] = (R.useState ?? R.default.useState)({ actual: 90, hornOffset: 0, explode: 0 }); window.__pose = setPose; window.__selected = selected; return h(F.Canvas, { shadows: true, camera: { position: [3.4, 3.5, 4.5], fov: 42, near: .001 }, onCreated: s => window.__get = s.get }, h(Lighting), h('ambientLight', { intensity: 1.5 }), h('directionalLight', { position: [-4, 7, 6], intensity: 2.5 }), h('color', { attach: 'background', args: ['#edf0f8'] }), h('group', { name: 'radar-scanner', scale: .02 }, h(Parts, { selected, select, ...pose }), h(Jumpers, { selected, select, withdrawals: seating(pose.powerProgress ?? 1) }), h(Power, { selected, select, servoPower: pose.servoPower ?? false }), h(Uno, { selected, select }), h(Harness, { selected, select, heading: pose.actual + pose.hornOffset, sonarWithdraw: pose.sonarWithdraw ?? 0, unoWithdraw: pose.unoWithdraw ?? 0 }))); } (D.createRoot ?? D.default.createRoot)(el).render(h(Preview)); });
        await p.waitForFunction(() => window.__get?.().scene.getObjectByName('radar-scanner'));
        const ids = await p.evaluate(() => {
            const T = window.__T, root = window.__get().scene.getObjectByName('radar-scanner');
            root.updateWorldMatrix(true, true);
            const ids = [], parts = {};
            root.traverse(o => {
                if (o.userData.partId) {
                    ids.push(o.userData.partId);
                    parts[o.userData.partId] = o;
                }
            });
            if (ids.length !== 75 || new Set(ids).size !== 75)
                throw Error('Expected 75 unique connected owners, got ' + ids.length);
            const meshes = id => {
                const out = [];
                parts[id].traverse(o => {
                    if (o.isMesh && o.text === undefined)
                        out.push(o);
                });
                return out;
            }, ray = new T.Raycaster();
            for (const x of [-10.1, 20.9]) {
                ray.set(new T.Vector3(x * .02, .021, 0), new T.Vector3(0, 1, 0));
                ray.far = .58;
                if (ray.intersectObjects(['radar-base', 'radar-posts', 'radar-servo-case'].flatMap(meshes), false).length)
                    throw Error('Base/post/ear bore blocked');
            }
            for (const [x, y] of [[-20, -7.5], [20, -7.5], [-20, 7.5], [20, 7.5]]) {
                ray.set(new T.Vector3(x * .02, (68 + y) * .02, -.12), new T.Vector3(0, 0, 1));
                ray.far = .15;
                if (ray.intersectObjects(['radar-bracket', 'radar-sonar-pcb'].flatMap(meshes), false).length)
                    throw Error('Sensor and bracket holes misaligned');
            }
            ray.set(new T.Vector3(0, 69.8 * .02, -.1), new T.Vector3(0, 0, 1));
            ray.far = .027;
            if (ray.intersectObjects(meshes('radar-bracket'), false).length)
                throw Error('Bracket blocks rear electronics');
            window.__get().camera.position.set(5.4, 5.2, 6);
            window.__get().camera.lookAt(0, .6, -1.2);
            window.__get().camera.updateMatrixWorld();
            return ids;
        });
        console.log('75 OWNERS / TWO BASE-POST-EAR BORES / FOUR SENSOR-STRAP BORES / OPEN REAR PASS');
        await p.evaluate(() => {
            const T = window.__T, r = window.__get().scene.getObjectByName('radar-scanner');
            r.updateWorldMatrix(true, true);
            const owner = o => {
                while (o && !o.userData.partId)
                    o = o.parent;
                return o?.userData.partId;
            }, caseMeshes = [], ports = [];
            r.traverse(o => {
                if (!o.isMesh || o.text !== undefined)
                    return;
                const id = owner(o);
                if (id === 'radar-supply-case')
                    caseMeshes.push(o);
                if (/^radar-supply-(positive|negative|reference)$/.test(id))
                    ports.push(o);
            });
            const ray = new T.Raycaster();
            for (const x of [85, 105, 125])
                for (const [dx, dy] of [[0, 0], [1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6]]) {
                    ray.set(new T.Vector3((x + dx) * .02, (13 + dy) * .02, -90 * .02), new T.Vector3(0, 0, -1));
                    ray.far = .2;
                    if (ray.intersectObjects([...caseMeshes, ...ports], false).length)
                        throw Error('Supply plug insertion bore obstructed');
                }
            for (const y of [11, 16, 21, 26, 31]) {
                ray.set(new T.Vector3(105 * .02, y * .02, -146 * .02), new T.Vector3(0, 0, 1));
                ray.far = .08;
                if (ray.intersectObjects(caseMeshes, false).length)
                    throw Error('Rear ventilation slot filled');
            }
            const sides = caseMeshes.filter(o => o.geometry.parameters?.width === 2);
            if (sides.length !== 2)
                throw Error('Two side walls required');
            for (const wall of sides) {
                const b = new T.Box3().setFromObject(wall);
                if (Math.abs(b.min.z / .02 + 143) > 1e-6 || Math.abs(b.max.z / .02 + 97) > 1e-6)
                    throw Error('Enclosure wall overlaps front/back cover');
            }
        });
        console.log('THREE REAL INSERTION BORES / FIVE OPEN VENTS / ENCLOSURE SEAMS PASS');
        await p.screenshot({ path: '/tmp/atlas-radar-jumpers.png' });
        for (const id of ids.filter(id => /^radar-jumper-/.test(id))) {
            let clicked = false;
            for (let attempt = 0; attempt < 10 && !clicked; attempt++) {
                const hit = await p.evaluate(({ id, attempt }) => {
                    const T = window.__T, s = window.__get(), root = s.scene.getObjectByName('radar-scanner');
                    root.updateWorldMatrix(true, true);
                    let owner;
                    root.traverse(o => {
                        if (o.userData.partId === id)
                            owner = o;
                    });
                    const meshes = [], all = [];
                    owner.traverse(o => {
                        if (o.isMesh && !o.isInstancedMesh && o.geometry?.attributes.position && o.text === undefined)
                            meshes.push(o);
                    });
                    root.traverse(o => {
                        if (o.isMesh && o.geometry?.attributes.position && o.text === undefined)
                            all.push(o);
                    });
                    const box = new T.Box3().setFromObject(owner), centre = box.getCenter(new T.Vector3()), span = box.getSize(new T.Vector3()).length(), ray = new T.Raycaster();
                    let seen = 0;
                    for (const dir of [[1, 1, 2], [-1, 1, 2], [1, 2, -2], [-1, 2, -2], [1, .05, 1], [-1, .05, 1], [0, 3, 0], [0, -.3, 1], [0, .1, -1], [1, .15, -2], [-1, .15, -2]]) {
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
                    }
                    return null;
                }, { id, attempt });
                if (!hit)
                    continue;
                await p.mouse.click(hit.x, hit.y);
                await p.waitForTimeout(120);
                clicked = await p.evaluate(id => window.__selected === id, id);
            }
            if (!clicked)
                throw Error('Native mesh click failed ' + id);
            await p.evaluate(id => {
                let owner;
                window.__get().scene.traverse(o => {
                    if (o.userData.partId === id)
                        owner = o;
                });
                let highlighted = false;
                owner.traverse(o => {
                    if (['b48bec', 'b78be8'].includes(o.material?.color?.getHexString()))
                        highlighted = true;
                });
                if (!highlighted)
                    throw Error('Actual owner not highlighted ' + id);
            }, id);
            console.log('ACTUAL PART CLICK / HIGHLIGHT', id);
        }
        for (const actual of [30, 60, 90, 120, 150])
            for (const hornOffset of [-20, 0, 20]) {
                await p.evaluate(pose => window.__pose(pose), { actual, hornOffset, explode: 0 });
                await p.waitForTimeout(80);
                await p.evaluate(async ({ actual, hornOffset }) => {
                    const T = window.__T, { radarSonarContact } = await import('/src/data/radar-scanner-layout.ts'), scene = window.__get().scene;
                    scene.updateMatrixWorld(true);
                    for (const [id, x] of [['radar-sonar-vcc', -3.81], ['radar-sonar-trigger', -1.27], ['radar-sonar-echo', 1.27], ['radar-sonar-ground', 3.81]]) {
                        let owner;
                        scene.traverse(o => {
                            if (o.userData.partId === id)
                                owner = o;
                        });
                        let pin;
                        owner.traverse(o => {
                            if (o.isMesh && o.geometry.parameters?.height === 6)
                                pin = o;
                        });
                        if (!pin)
                            throw Error('Missing actual header pin ' + id);
                        const tip = new T.Vector3(0, -3, 0).applyMatrix4(pin.matrixWorld), expected = new T.Vector3(...radarSonarContact(x, actual + hornOffset)).multiplyScalar(.02);
                        if (tip.distanceTo(expected) > 1e-7)
                            throw Error('Head/contact transform mismatch ' + id);
                    }
                }, { actual, hornOffset });
            }
        console.log('ACTUAL FOUR PIN TIPS MATCH PHYSICAL HEAD AT FIFTEEN POSES');
        const stable = await p.evaluate(() => {
            const ids = {};
            window.__get().scene.traverse(o => {
                if (o.name.endsWith('-tube'))
                    ids[o.name] = { geometry: o.geometry, position: o.geometry.getAttribute('position'), array: o.geometry.getAttribute('position').array };
            });
            window.__buffers = ids;
            return Object.keys(ids).length;
        });
        if (stable !== 12)
            throw Error('Twelve wire buffers required');
        for (const heading of [10, 30, 60, 90, 120, 150, 170])
            for (const withdrawn of [false, true]) {
                await p.evaluate(({ heading, withdrawn }) => window.__pose({ actual: heading, hornOffset: 0, explode: 0, sonarWithdraw: withdrawn ? 4 : 0, unoWithdraw: withdrawn ? 5 : 0 }), { heading, withdrawn });
                await p.waitForTimeout(100);
                const result = await p.evaluate(async ({ heading, withdrawn }) => {
                    const T = window.__T, { radarLeadPose, radarSonarLeads } = await import('/src/data/radar-harness.ts'), s = window.__get(), root = s.scene.getObjectByName('radar-scanner');
                    root.updateWorldMatrix(true, true);
                    const all = [];
                    const owner = o => {
                        while (o && !o.userData.partId)
                            o = o.parent;
                        return o?.userData.partId;
                    };
                    root.traverse(o => {
                        if (o.isMesh && o.text === undefined && !o.name.endsWith('-tube')) {
                            o.geometry.computeBoundingBox();
                            all.push({ mesh: o, box: new T.Box3().setFromObject(o), id: owner(o) });
                        }
                    });
                    const ray = new T.Raycaster();
                    let segments = 0;
                    for (let i = 0; i < 4; i++) {
                        const lead = radarSonarLeads[i], wire = root.getObjectByName(lead.id + '-tube'), geometry = wire.geometry, path = geometry.userData.motionPath, pose = radarLeadPose(i, heading, withdrawn ? 4 : 0, withdrawn ? 5 : 0), a = geometry.getAttribute('position');
                        if (geometry !== window.__buffers[wire.name].geometry || a !== window.__buffers[wire.name].position || a.array !== window.__buffers[wire.name].array)
                            throw Error('Animation recreated wire geometry');
                        for (const [end, t] of [[0, 0], [1, 1]]) {
                            const count = geometry.parameters.radialSegments, centre = new T.Vector3();
                            for (let k = 0; k < count; k++)
                                centre.add(new T.Vector3().fromBufferAttribute(a, (end ? geometry.parameters.tubularSegments * (count + 1) : 0) + k));
                            centre.divideScalar(count);
                            if (centre.distanceTo(new T.Vector3(...pose.points[end ? pose.points.length - 1 : 0])) > 1e-4)
                                throw Error('Real tube end detached ' + lead.id);
                        }
                        const points = path.getPoints(240).map(p => p.applyMatrix4(wire.matrixWorld)), bounds = new T.Box3().setFromPoints(points).expandByScalar(.65 * .02), candidates = all.filter(o => o.id !== lead.id + '-sonar' && o.id !== lead.id + '-uno' && o.box.intersectsBox(bounds)).map(o => o.mesh);
                        for (const offset of [[0, 0, 0], [.64, 0, 0], [-.64, 0, 0], [0, .64, 0], [0, -.64, 0], [0, 0, .64], [0, 0, -.64]]) {
                            const v = new T.Vector3(...offset).multiplyScalar(.02);
                            for (let k = 1; k < points.length; k++) {
                                const from = points[k - 1].clone().add(v), to = points[k].clone().add(v), direction = to.clone().sub(from), length = direction.length();
                                if (length < 1e-10)
                                    continue;
                                ray.set(from, direction.normalize());
                                ray.near = 0;
                                ray.far = length;
                                const hits = ray.intersectObjects(candidates, false);
                                if (hits.length)
                                    throw Error('Wire clips ' + owner(hits[0].object) + ' ' + lead.id + ' heading ' + heading + ' withdrawn ' + withdrawn + ' segment ' + k);
                                segments++;
                            }
                        }
                    }
                    return segments;
                }, { heading, withdrawn });
                console.log('FLEX / ENDPOINT / STABLE BUFFER / SOLID CLEARANCE', heading, withdrawn, result);
            }
        for (const enabled of [true, false]) {
            await p.evaluate(enabled => window.__pose({ actual: 90, hornOffset: 0, explode: 0, servoPower: enabled }), enabled);
            await p.waitForTimeout(120);
            await p.evaluate(enabled => {
                const root = window.__get().scene.getObjectByName('radar-scanner'), lcd = root.getObjectByName('radar-supply-lcd'), button = root.getObjectByName('radar-supply-button');
                if (lcd.material.color.getHexString() !== (enabled ? 'b8d7cc' : '687785'))
                    throw Error('Actual LCD colour not following supply');
                if (button.material.color.getHexString() !== (enabled ? '865bcb' : '48536a'))
                    throw Error('Actual output button not following supply');
                const text = [];
                root.traverse(o => {
                    if (typeof o.text === 'string')
                        text.push(o.text);
                });
                if (!text.includes(enabled ? '5.00 V' : 'OFF') || text.includes(enabled ? 'OFF' : '5.00 V'))
                    throw Error('Actual voltage text incorrect');
            }, enabled);
        }
        console.log('ACTUAL SUPPLY LCD / BUTTON / VOLTAGE TEXT ON-OFF PASS');
        await p.evaluate(async () => { const { radarPowerSeating, radarPowerJumpers } = await import('/src/data/radar-power-jumpers.ts'); window.__lastPower = radarPowerSeating(1); window.__powerVersions = Object.fromEntries(radarPowerJumpers.map(j => [j.id, window.__get().scene.getObjectByName(j.id + '-tube').geometry.getAttribute('position').version])); });
        for (let step = 0; step <= 20; step++) {
            const progress = step / 20;
            await p.evaluate(progress => window.__pose({ actual: 90, hornOffset: 0, explode: 0, powerProgress: progress }), progress);
            await p.waitForTimeout(80);
            const checked = await p.evaluate(async (progress) => {
                const T = window.__T, { radarPowerJumpers, radarPowerJumperPose, radarPowerSeating } = await import('/src/data/radar-power-jumpers.ts'), s = window.__get(), root = s.scene.getObjectByName('radar-scanner');
                root.updateWorldMatrix(true, true);
                const all = [], owner = o => { while (o && !o.userData.partId)
                    o = o.parent; return o?.userData.partId; };
                root.traverse(o => { if (o.isMesh && o.text === undefined && !o.name.endsWith('-tube')) {
                    o.geometry.computeBoundingBox();
                    all.push({ mesh: o, box: new T.Box3().setFromObject(o), id: owner(o) });
                } });
                const ray = new T.Raycaster(), withdrawals = radarPowerSeating(progress);
                let traces = 0;
                for (let i = 0; i < 5; i++) {
                    const j = radarPowerJumpers[i], w = withdrawals[i], pose = radarPowerJumperPose(i, w.a, w.b), wire = root.getObjectByName(j.id + '-tube'), g = wire.geometry, a = g.getAttribute('position');
                    if (g !== window.__buffers[wire.name].geometry || a !== window.__buffers[wire.name].position || a.array !== window.__buffers[wire.name].array)
                        throw Error('Power animation recreated GPU geometry');
                    const changed = window.__lastPower[i].a !== w.a || window.__lastPower[i].b !== w.b;
                    if (a.version !== window.__powerVersions[j.id] + (changed ? 1 : 0))
                        throw Error('Unchanged power wire rewritten');
                    window.__powerVersions[j.id] = a.version;
                    for (const [end, t] of [[0, 0], [1, 1]]) {
                        const count = g.parameters.radialSegments, centre = new T.Vector3();
                        for (let k = 0; k < count; k++)
                            centre.add(new T.Vector3().fromBufferAttribute(a, (end ? g.parameters.tubularSegments * (count + 1) : 0) + k));
                        centre.divideScalar(count);
                        if (centre.distanceTo(new T.Vector3(...pose.points[end ? pose.points.length - 1 : 0])) > 1e-4)
                            throw Error('Power wire detached ' + j.id);
                    }
                    for (const end of ['a', 'b']) {
                        const plug = root.getObjectByName(j.id + '-' + end + '-body'), origin = new T.Vector3().setFromMatrixPosition(plug.matrixWorld), expected = new T.Vector3(...pose[end]).multiplyScalar(.02);
                        if (origin.distanceTo(expected) > 1e-7)
                            throw Error('Plug not following socket axis ' + j.id + end);
                        let pin;
                        plug.traverse(o => { if (o.geometry?.parameters?.height === (j[end].kind === 'banana' ? 9 : 6) && ((j[end].kind === 'banana' && o.geometry.parameters.radiusTop === 1.8) || (j[end].kind === 'male' && o.geometry.parameters.width === .64)))
                            pin = o; });
                        if (!pin)
                            throw Error('Actual male contact missing');
                        const tip = new T.Vector3(0, j[end].kind === 'banana' ? -4.5 : -3, 0).applyMatrix4(pin.matrixWorld), expectedTip = expected.clone().addScaledVector(new T.Vector3(...j[end].out), j[end].kind === 'banana' ? -.1 : -.04);
                        if (tip.distanceTo(expectedTip) > 1e-7)
                            throw Error('Actual metal contact depth incorrect');
                    }
                    const points = g.userData.motionPath.getPoints(240).map(p => p.applyMatrix4(wire.matrixWorld)), bounds = new T.Box3().setFromPoints(points).expandByScalar(.65 * .02), candidates = all.filter(o => o.box.intersectsBox(bounds)).map(o => o.mesh), first = points[0], last = points.at(-1);
                    for (const offset of [[0, 0, 0], [.64, 0, 0], [-.64, 0, 0], [0, .64, 0], [0, -.64, 0], [0, 0, .64], [0, 0, -.64]]) {
                        const v = new T.Vector3(...offset).multiplyScalar(.02);
                        for (let k = 1; k < points.length; k++) {
                            const from = points[k - 1].clone().add(v), to = points[k].clone().add(v), direction = to.clone().sub(from), length = direction.length();
                            if (length < 1e-10)
                                continue;
                            ray.set(from, direction.normalize());
                            ray.near = 0;
                            ray.far = length;
                            for (const hit of ray.intersectObjects(candidates, false)) {
                                const id = owner(hit.object);
                                if ((id === j.id + '-a' && hit.point.distanceTo(first) < .02) || (id === j.id + '-b' && hit.point.distanceTo(last) < .02))
                                    continue;
                                throw Error('Power wire clips ' + id + ' ' + j.id + ' at ' + progress + ' segment ' + k);
                            }
                            traces++;
                        }
                    }
                }
                window.__lastPower = withdrawals;
                return traces;
            }, progress);
            console.log('TEN PLUG AXES / ACTUAL METAL TIPS / WIRE ENDS / GPU BUFFERS / SOLID CLEARANCE', progress, checked);
        }
        console.log('CHASSIS OWNERS', ids.join(', '));
    }
    finally {
        await browser.close();
    }
})().then(() => process.exit(0)).catch(e => { console.error(e.stack); process.exit(1); });
