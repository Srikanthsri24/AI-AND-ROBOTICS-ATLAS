// Native browser verification of the unified radar USB / host / finite target foundation.
// Requires local Vite on 5190, Playwright and Chrome. Run with node scripts/inspect-radar-usb-target.cjs.
const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
    try {
        const p = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        await p.goto('http://127.0.0.1:5190/');
        await p.evaluate(async () => { const R = await import('/node_modules/.vite/deps/react.js'), D = await import('/node_modules/.vite/deps/react-dom_client.js'), F = await import('/node_modules/.vite/deps/@react-three_fiber.js'), T = await import('/node_modules/.vite/deps/three.js'), { default: Parts } = await import('/src/modules/RadarWorkshopPrototype.tsx'), { default: Lighting } = await import('/src/modules/WorkshopStudioLighting.tsx'), h = R.createElement ?? R.default.createElement; window.__T = T; document.querySelector('#root').style.display = 'none'; const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0'; document.body.append(el); function Preview() { const [selected, select] = (R.useState ?? R.default.useState)(''); const [pose, setPose] = (R.useState ?? R.default.useState)({ actual: 90, hornOffset: 0, explode: 0 }); window.__pose = setPose; window.__selected = selected; return h(F.Canvas, { shadows: true, camera: { position: [3.4, 3.5, 4.5], fov: 42, near: .001 }, onCreated: s => window.__get = s.get }, h(Lighting), h('ambientLight', { intensity: 1.5 }), h('directionalLight', { position: [-4, 7, 6], intensity: 2.5 }), h('color', { attach: 'background', args: ['#edf0f8'] }), h('group', { name: 'radar-scanner', scale: .02 }, h(Parts, { selected, select, ...pose }))); } (D.createRoot ?? D.default.createRoot)(el).render(h(Preview)); });
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
            if (ids.length !== 91 || new Set(ids).size !== 91)
                throw Error('Expected 91 unique connected owners, got ' + ids.length);
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
            const camera = window.__get().camera, bounds = new T.Box3().setFromObject(root), centre = bounds.getCenter(new T.Vector3()), direction = new T.Vector3(1, .65, .06).normalize();
            camera.position.copy(centre).add(direction);
            camera.lookAt(centre);
            camera.updateMatrixWorld();
            const right = new T.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), up = new T.Vector3(0, 1, 0).applyQuaternion(camera.quaternion), tan = Math.tan(camera.fov * Math.PI / 360);
            let distance = 0;
            for (const x of [bounds.min.x, bounds.max.x])
                for (const y of [bounds.min.y, bounds.max.y])
                    for (const z of [bounds.min.z, bounds.max.z]) {
                        const p = new T.Vector3(x, y, z).sub(centre), depth = p.dot(direction);
                        distance = Math.max(distance, depth + Math.abs(p.dot(right)) / (tan * camera.aspect), depth + Math.abs(p.dot(up)) / tan);
                    }
            camera.position.copy(centre).addScaledVector(direction, distance * 1.12);
            camera.lookAt(centre);
            camera.updateMatrixWorld();
            return ids;
        });
        console.log('91 OWNERS / TWO BASE-POST-EAR BORES / FOUR SENSOR-STRAP BORES / OPEN REAR PASS');
        await p.evaluate(async (ids) => { const { radarWorkshopParts } = await import('/src/data/radar-workshop-parts.ts'); if (JSON.stringify(ids.slice().sort()) !== JSON.stringify(radarWorkshopParts.map(p => p.id).sort()))
            throw Error('Rendered owner/explanation catalogue mismatch'); }, ids);
        console.log('ALL 91 ACTUAL OWNERS MATCH EXPLANATION CATALOGUE');
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
        await p.screenshot({ path: '/tmp/atlas-radar-usb.png' });
        for (const id of ids.filter(id => /^radar-(computer|usb|target)/.test(id))) {
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
                    for (const dir of [[1, 0, 0], [-1, 0, 0], [1, .1, 0], [-1, .1, 0], [1, 0, .1], [-1, 0, .1], [1, 1, 2], [-1, 1, 2], [1, 2, -2], [-1, 2, -2], [1, .05, 1], [-1, .05, 1], [0, 3, 0], [0, -.3, 1], [0, .1, -1], [1, .15, -2], [-1, .15, -2]]) {
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
        if (stable !== 13)
            throw Error('Thirteen wire buffers required');
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
                const all = [], owner = o => {
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
                        plug.traverse(o => {
                            if (o.geometry?.parameters?.height === (j[end].kind === 'banana' ? 9 : 6) && ((j[end].kind === 'banana' && o.geometry.parameters.radiusTop === 1.8) || (j[end].kind === 'male' && o.geometry.parameters.width === .64)))
                                pin = o;
                        });
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
        await p.evaluate(() => { const root = window.__get().scene.getObjectByName('radar-scanner'), g = root.getObjectByName('radar-usb-cable-tube').geometry; window.__usbBuffers = { geometry: g, position: g.getAttribute('position'), array: g.getAttribute('position').array }; });
        for (const u of [0, 3, 6, 9, 12])
            for (const h of [0, 3, 6, 9, 12]) {
                await p.evaluate(({ u, h }) => window.__pose({ actual: 90, hornOffset: 0, usbUno: u, usbHost: h, usb: true }), { u, h });
                await p.waitForTimeout(80);
                const count = await p.evaluate(async ({ u, h }) => {
                    const T = window.__T, { radarUsbPose } = await import('/src/data/radar-usb.ts'), root = window.__get().scene.getObjectByName('radar-scanner');
                    root.updateWorldMatrix(true, true);
                    const pose = radarUsbPose(u, h), wire = root.getObjectByName('radar-usb-cable-tube'), g = wire.geometry, a = g.getAttribute('position');
                    if (g !== window.__usbBuffers.geometry || a !== window.__usbBuffers.position || a.array !== window.__usbBuffers.array)
                        throw Error('USB motion replaced GPU buffers');
                    for (const [end, body] of [['uno', 'radar-usb-b-body'], ['host', 'radar-usb-a-body']])
                        if (new T.Vector3().setFromMatrixPosition(root.getObjectByName(body).matrixWorld).distanceTo(new T.Vector3(...pose[end]).multiplyScalar(.02)) > 1e-7)
                            throw Error('USB plug left socket axis');
                    for (const end of [0, 1]) {
                        const n = g.parameters.radialSegments, centre = new T.Vector3();
                        for (let k = 0; k < n; k++)
                            centre.add(new T.Vector3().fromBufferAttribute(a, (end ? g.parameters.tubularSegments * (n + 1) : 0) + k));
                        centre.divideScalar(n);
                        if (centre.distanceTo(new T.Vector3(...pose.points[end ? pose.points.length - 1 : 0])) > 1e-4)
                            throw Error('USB cable detached from boot');
                    }
                    const text = root.getObjectByName('radar-computer-usb-status').text;
                    if (text !== (u === 0 && h === 0 ? 'USB CONNECTED' : 'USB DISCONNECTED'))
                        throw Error('Host screen status does not match mating');
                    let emitting = false;
                    root.traverse(o => { let parent = o; while (parent && !parent.userData.partId)
                        parent = parent.parent; if (parent?.userData.partId === 'radar-uno-leds' && o.material?.emissive?.getHex() > 0 && o.material?.emissiveIntensity > .5)
                        emitting = true; });
                    if (emitting !== (u === 0 && h === 0))
                        throw Error('Actual Uno ON LED not gated by both USB plugs');
                    const owner = o => { while (o && !o.userData.partId)
                        o = o.parent; return o?.userData.partId; }, all = [];
                    root.traverse(o => { if (o.isMesh && o.text === undefined && !o.name.endsWith('-tube'))
                        all.push({ mesh: o, id: owner(o), box: new T.Box3().setFromObject(o) }); });
                    const points = g.userData.motionPath.getPoints(200).map(p => p.applyMatrix4(wire.matrixWorld)), bounds = new T.Box3().setFromPoints(points).expandByScalar(.03), candidates = all.filter(o => o.box.intersectsBox(bounds)).map(o => o.mesh), ray = new T.Raycaster();
                    let traces = 0;
                    for (const offset of [[0, 0, 0], [1.49, 0, 0], [-1.49, 0, 0], [0, 1.49, 0], [0, -1.49, 0], [0, 0, 1.49], [0, 0, -1.49]]) {
                        const v = new T.Vector3(...offset).multiplyScalar(.02);
                        for (let k = 1; k < points.length; k++) {
                            const from = points[k - 1].clone().add(v), to = points[k].clone().add(v), direction = to.clone().sub(from), length = direction.length();
                            ray.set(from, direction.normalize());
                            ray.near = 0;
                            ray.far = length;
                            for (const hit of ray.intersectObjects(candidates, false)) {
                                const id = owner(hit.object);
                                if ((id === 'radar-usb-b-grip' && hit.point.distanceTo(points[0]) < .06) || (id === 'radar-usb-a-grip' && hit.point.distanceTo(points.at(-1)) < .06))
                                    continue;
                                throw Error('USB jacket clips ' + id + ' at ' + u + '/' + h + ' segment ' + k);
                            }
                            traces++;
                        }
                    }
                    return traces;
                }, { u, h });
                console.log('USB AXES / JACKET ENDS / BUFFER IDENTITY / ACTUAL SCREEN AND UNO LED / SOLID CLEARANCE', u, h, count);
            }
        await p.evaluate(() => window.__pose({ actual: 90, hornOffset: 0, usbUno: 0, usbHost: 0, usb: false }));
        await p.waitForTimeout(80);
        await p.evaluate(() => { const root = window.__get().scene.getObjectByName('radar-scanner'); if (root.getObjectByName('radar-computer-usb-status').text !== 'USB HOST OFF')
            throw Error('Mated but host-off status incorrect'); let emitting = false; root.traverse(o => { let p = o; while (p && !p.userData.partId)
            p = p.parent; if (p?.userData.partId === 'radar-uno-leds' && o.material?.emissive?.getHex() > 0 && o.material?.emissiveIntensity > .5)
            emitting = true; }); if (emitting)
            throw Error('Host-off state powers actual Uno LED'); });
        console.log('MATED BUT HOST-OFF LOGIC GATE PASS');
        await p.evaluate(() => { const T = window.__T, root = window.__get().scene.getObjectByName('radar-scanner'); root.updateWorldMatrix(true, true); const owner = o => { while (o && !o.userData.partId)
            o = o.parent; return o?.userData.partId; }, all = []; root.traverse(o => { if (o.isMesh && o.text === undefined)
            all.push(o); }); const ray = new T.Raycaster(); for (const [kind, out, targets] of [['b', -1, ['radar-uno-usb']], ['a', 1, ['radar-computer-base', 'radar-computer-usb-port']]]) {
            const shield = all.find(o => owner(o) === 'radar-usb-' + kind + '-shield'), a = shield.geometry.getAttribute('position'), seen = new Set();
            for (let i = 0; i < a.count; i++) {
                const point = new T.Vector3().fromBufferAttribute(a, i).applyMatrix4(shield.matrixWorld), key = point.toArray().map(n => n.toFixed(7)).join('/');
                if (seen.has(key))
                    continue;
                seen.add(key);
                ray.set(point.clone().add(new T.Vector3(out * .24, 0, 0)), new T.Vector3(-out, 0, 0));
                ray.near = 0;
                ray.far = .24;
                if (ray.intersectObjects(all.filter(o => targets.includes(owner(o))), false).length)
                    throw Error('Actual USB ' + kind + ' shield insertion clips receptacle');
            }
        } });
        console.log('BOTH ACTUAL HOLLOW SHIELDS SWEEP INTO RECEPTACLES WITHOUT CLIPPING');
        for (const angle of [30, 90, 150])
            for (const yaw of [-45, 0, 45, 90])
                for (const distance of [200, 400, 1600])
                    for (const delta of [-10, 0, 10]) {
                        const target = { targetPresent: true, targetAngle: angle, targetYaw: yaw, targetDistanceMm: distance };
                        await p.evaluate(({ target, angle, delta }) => window.__pose({ actual: angle, hornOffset: delta, target }), { target, angle, delta });
                        await p.waitForTimeout(40);
                        await p.evaluate(async ({ target, angle, delta }) => { const T = window.__T, { radarDefaults, radarEcho, radarRotate } = await import('/src/data/radar-workshop.ts'), root = window.__get().scene.getObjectByName('radar-scanner'); root.updateWorldMatrix(true, true); const groups = {}; root.traverse(o => { if (o.userData.partId)
                            groups[o.userData.partId] = o; }); const meshes = []; groups['radar-target-card'].traverse(o => { if (o.isMesh && o.text === undefined)
                            meshes.push(o); }); const tx = groups['radar-sonar-transmitter'].children[0], origin = tx.localToWorld(new T.Vector3(0, 0, 13.2)), direction = new T.Vector3(0, 0, 1).transformDirection(tx.matrixWorld), expected = radarRotate(-13, 13.2, angle + delta); if (origin.distanceTo(new T.Vector3(expected[0] * .02, 68 * .02, expected[1] * .02)) > 1e-7)
                            throw Error('Actual transmitter mouth does not match echo origin'); const ray = new T.Raycaster(origin, direction, 0, 100), hits = ray.intersectObjects(meshes, false).filter(h => h.face?.normal.z < -.9), echo = radarEcho({ ...radarDefaults, ...target, usb: true }, angle + delta); if (!!echo.hit !== !!hits.length)
                            throw Error('Finite rendered face / echo hit mismatch ' + JSON.stringify({ target, delta, echo, hit: hits[0]?.point })); if (echo.hit) {
                            const expectedPoint = new T.Vector3(echo.hit[0] * .02, 68 * .02, echo.hit[1] * .02);
                            if (hits[0].point.distanceTo(expectedPoint) > 1e-7)
                                throw Error('Measured echo not on actual rendered front face');
                        } const card = meshes.find(o => o.geometry.parameters?.depth === 2); if (card.geometry.parameters.width !== 120 || card.geometry.parameters.height !== 160)
                            throw Error('Finite card dimensions changed'); const stand = []; groups['radar-target-stand'].traverse(o => { if (o.isMesh)
                            stand.push(o); }); if (ray.intersectObjects(stand, false).length)
                            throw Error('Target holder enters acoustic axis'); }, { target, angle, delta });
                    }
        console.log('108 FINITE TARGET POSES / REAL TRANSMITTER MOUTH / ACTUAL FRONT-FACE INTERSECTIONS / CLEAR STAND PASS');
        await p.evaluate(() => window.__pose({ actual: 90, hornOffset: 0, target: { targetPresent: false, targetAngle: 90, targetYaw: 0, targetDistanceMm: 400 } }));
        await p.waitForTimeout(80);
        await p.evaluate(() => { const r = window.__get().scene.getObjectByName('radar-finite-target'); if (r.visible)
            throw Error('Removed target still visible'); let count = 0; r.traverse(o => { if (!o.isMesh)
            return; for (let p = o; p; p = p.parent)
            if (!p.visible)
                return; count++; }); if (count)
            throw Error('Target removal leaves visible mesh'); });
        console.log('ACTUAL TARGET REMOVAL PASS');
        console.log('CHASSIS OWNERS', ids.join(', '));
    }
    finally {
        await browser.close();
    }
})().then(() => process.exit(0)).catch(e => { console.error(e.stack); process.exit(1); });
