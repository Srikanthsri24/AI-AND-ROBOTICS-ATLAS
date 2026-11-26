const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
const p=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5190/');
await p.evaluate(async()=>{const R=await import('/node_modules/.vite/deps/react.js'),D=await import('/node_modules/.vite/deps/react-dom_client.js'),F=await import('/node_modules/.vite/deps/@react-three_fiber.js'),T=await import('/node_modules/.vite/deps/three.js'),{default:Parts}=await import('/src/modules/RailwayTrackParts.tsx'),{default:Beam}=await import('/src/modules/RailwayBeamParts.tsx'),{default:Barrier}=await import('/src/modules/RailwayBarrierParts.tsx'),{default:Electrical}=await import('/src/modules/RailwayElectricalParts.tsx'),{default:Uno}=await import('/src/modules/RailwayUnoParts.tsx'),{default:Supply}=await import('/src/modules/RailwaySupplyParts.tsx'),{default:Jumpers}=await import('/src/modules/RailwayControlJumpers.tsx'),{default:Feeds}=await import('/src/modules/RailwaySensorFeeds.tsx'),{default:Leads}=await import('/src/modules/RailwaySensorLeads.tsx'),{default:Usb}=await import('/src/modules/RailwayUsbParts.tsx'),{default:Light}=await import('/src/modules/WorkshopStudioLighting.tsx'),{railwayInitial}=await import('/src/data/railway-workshop.ts'),h=R.createElement??R.default.createElement;window.__T=T;window.__clock={current:railwayInitial()};window.__inputs={current:{entryAligned:true,exitAligned:true}};window.__wiring={current:Array.from({length:6},()=>({a:0,b:0}))};window.__leads={current:Array.from({length:10},()=>({a:0,b:0}))};window.__usb={current:{usb:false,usbUno:0,usbHost:0}};window.__pose=v=>{window.__usb.current={usb:v.usb,usbUno:v.usbUno,usbHost:v.usbHost}};window.__feeds={current:Array.from({length:2},()=>({a:0,b:0}))};document.querySelector('#root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);function Link(){F.useFrame(()=>{const m=window.__usb.current;window.__clock.current.powered=m.usb&&m.usbUno===0&&m.usbHost===0},-3);return null;}function Preview(){const[selected,select]=(R.useState??R.default.useState)('');window.__selected=selected;return h(F.Canvas,{shadows:true,camera:{position:[5,7,10],fov:42,near:.001,far:100},onCreated:s=>window.__get=s.get},h(Light),h('ambientLight',{intensity:1.5}),h('directionalLight',{position:[-4,7,6],intensity:2.5}),h('color',{attach:'background',args:['#edf0f8']}),h('group',{scale:.01,name:'railway-rig'},h(Link),h(Parts,{selected,select,clock:window.__clock}),h(Beam,{selected,select,inputs:window.__inputs}),h(Barrier,{selected,select,clock:window.__clock}),h(Electrical,{selected,select,clock:window.__clock}),h(Uno,{selected,select,clock:window.__clock}),h(Supply,{selected,select,inputs:window.__inputs}),h(Jumpers,{selected,select,motion:window.__wiring}),h(Feeds,{selected,select,motion:window.__feeds}),h(Leads,{selected,select,motion:window.__leads,inputs:window.__inputs}),h(Usb,{selected,select,motion:window.__usb})));}(D.createRoot??D.default.createRoot)(el).render(h(Preview));});
await p.waitForFunction(()=>window.__get?.().scene.getObjectByName('railway-train'));await p.waitForTimeout(150);
const ids=await p.evaluate(async()=>{const{railwayTrackParts}=await import('/src/data/railway-track-layout.ts'),{railwayBeamParts}=await import('/src/data/railway-beam-layout.ts'),{railwayBarrierParts}=await import('/src/data/railway-barrier-layout.ts'),{railwayElectricalParts}=await import('/src/data/railway-electrical-layout.ts'),{railwayUnoParts,railwaySupplyParts}=await import('/src/data/railway-power-layout.ts'),{railwayControlJumperParts}=await import('/src/data/railway-control-jumpers.ts'),{railwaySensorFeedParts}=await import('/src/data/railway-sensor-feeds.ts'),{railwaySensorLeadParts}=await import('/src/data/railway-sensor-leads.ts'),{railwayUsbParts}=await import('/src/data/railway-usb.ts'),actual=[];window.__get().scene.traverse(o=>{if(o.userData.partId)actual.push(o.userData.partId)});if(actual.length!==175||new Set(actual).size!==175||actual.some(id=>![...railwayTrackParts,...railwayBeamParts,...railwayBarrierParts,...railwayElectricalParts,...railwayUnoParts,...railwaySupplyParts,...railwayControlJumperParts,...railwaySensorFeedParts,...railwaySensorLeadParts,...railwayUsbParts.map(([id])=>({id}))].some(p=>p.id===id)))throw Error('Actual 175 owner catalogue mismatch');return actual;});
const buffers=await p.evaluate(()=>{window.__buffers=[];window.__get().scene.traverse(o=>{if(o.isMesh&&o.text===undefined)window.__buffers.push([o,o.geometry,o.geometry.attributes.position,o.geometry.attributes.position.array]);});return window.__buffers.length;});

        await p.evaluate(() => { const root = window.__get().scene.getObjectByName('railway-rig'), g = root.getObjectByName('railway-usb-cable-tube').geometry; window.__usbBuffers = { geometry: g, position: g.getAttribute('position'), array: g.getAttribute('position').array }; });
        for (const u of [0, 6, 12])
            for (const h of [0, 6, 12]) {
                await p.evaluate(({ u, h }) => window.__pose({ actual: 90, hornOffset: 0, usbUno: u, usbHost: h, usb: true }), { u, h });
                await p.waitForTimeout(80);
                const count = await p.evaluate(async ({ u, h }) => {
                    const T = window.__T, { railwayUsbPose } = await import('/src/data/railway-usb.ts'), root = window.__get().scene.getObjectByName('railway-rig');
                    root.updateWorldMatrix(true, true);
                    const pose = railwayUsbPose(u, h), wire = root.getObjectByName('railway-usb-cable-tube'), g = wire.geometry, a = g.getAttribute('position');
                    if (g !== window.__usbBuffers.geometry || a !== window.__usbBuffers.position || a.array !== window.__usbBuffers.array)
                        throw Error('USB motion replaced GPU buffers');
                    for (const [end, body] of [['uno', 'railway-usb-b-body'], ['host', 'railway-usb-a-body']])
                        if (new T.Vector3().setFromMatrixPosition(root.getObjectByName(body).matrixWorld).distanceTo(new T.Vector3(...pose[end]).multiplyScalar(.01)) > 1e-7)
                            throw Error('USB plug left socket axis');
                    for (const end of [0, 1]) {
                        const n = g.parameters.radialSegments, centre = new T.Vector3();
                        for (let k = 0; k < n; k++)
                            centre.add(new T.Vector3().fromBufferAttribute(a, (end ? g.parameters.tubularSegments * (n + 1) : 0) + k));
                        centre.divideScalar(n);
                        if (centre.distanceTo(new T.Vector3(...pose.points[end ? pose.points.length - 1 : 0])) > 1e-4)
                            throw Error('USB cable detached from boot');
                    }
                    const text = root.getObjectByName('railway-computer-usb-status').text;
                    if (text !== (u === 0 && h === 0 ? 'USB CONNECTED' : 'USB DISCONNECTED'))
                        throw Error('Host screen status does not match mating');
                    let emitting = false;
                    root.traverse(o => { let parent = o; while (parent && !parent.userData.partId)
                        parent = parent.parent; if (parent?.userData.partId === 'railway-uno-leds' && o.material?.emissive?.getHex() > 0 && o.material?.emissiveIntensity > .5)
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
                        const v = new T.Vector3(...offset).multiplyScalar(.01);
                        for (let k = 1; k < points.length; k++) {
                            const from = points[k - 1].clone().add(v), to = points[k].clone().add(v), direction = to.clone().sub(from), length = direction.length();
                            ray.set(from, direction.normalize());
                            ray.near = 0;
                            ray.far = length;
                            for (const hit of ray.intersectObjects(candidates, false)) {
                                const id = owner(hit.object);
                                if ((id === 'railway-usb-b-grip' && hit.point.distanceTo(points[0]) < .03) || (id === 'railway-usb-a-grip' && hit.point.distanceTo(points.at(-1)) < .03))
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
        await p.evaluate(() => { const root = window.__get().scene.getObjectByName('railway-rig'); if (root.getObjectByName('railway-computer-usb-status').text !== 'USB HOST OFF')
            throw Error('Mated but host-off status incorrect'); let emitting = false; root.traverse(o => { let p = o; while (p && !p.userData.partId)
            p = p.parent; if (p?.userData.partId === 'railway-uno-leds' && o.material?.emissive?.getHex() > 0 && o.material?.emissiveIntensity > .5)
            emitting = true; }); if (emitting)
            throw Error('Host-off state powers actual Uno LED'); });
        console.log('MATED BUT HOST-OFF LOGIC GATE PASS');
        await p.evaluate(() => { const T = window.__T, root = window.__get().scene.getObjectByName('railway-rig'); root.updateWorldMatrix(true, true); const owner = o => { while (o && !o.userData.partId)
            o = o.parent; return o?.userData.partId; }, all = []; root.traverse(o => { if (o.isMesh && o.text === undefined)
            all.push(o); }); const ray = new T.Raycaster(); for (const [kind, out, targets] of [['b', -1, ['railway-uno-usb']], ['a', 1, ['railway-computer-base', 'railway-computer-usb-port']]]) {
            const shield = all.find(o => owner(o) === 'railway-usb-' + kind + '-shield'), a = shield.geometry.getAttribute('position'), seen = new Set();
            for (let i = 0; i < a.count; i++) {
                const point = new T.Vector3().fromBufferAttribute(a, i).applyMatrix4(shield.matrixWorld), key = point.toArray().map(n => n.toFixed(7)).join('/');
                if (seen.has(key))
                    continue;
                seen.add(key);
                ray.set(point.clone().add(new T.Vector3(out * .12, 0, 0)), new T.Vector3(-out, 0, 0));
                ray.near = 0;
                ray.far = .12;
                if (ray.intersectObjects(all.filter(o => targets.includes(owner(o))), false).length)
                    throw Error('Actual USB ' + kind + ' shield insertion clips receptacle');
            }
        } });
        console.log('BOTH ACTUAL HOLLOW SHIELDS SWEEP INTO RECEPTACLES WITHOUT CLIPPING');
await p.evaluate(()=>window.__pose({usb:false,usbUno:12,usbHost:12}));await p.waitForFunction(()=>window.__get().scene.getObjectByName('railway-usb-a-body').position.x===402);
        for (const id of ids.filter(id=>id.startsWith('railway-usb-')||id.startsWith('railway-computer-')||id==='railway-host-platform')) {
            let clicked = false;
            for (let attempt = 0; attempt < 10 && !clicked; attempt++) {
                const hit = await p.evaluate(({ id, attempt }) => { const T = window.__T, s = window.__get(), root = s.scene; root.updateWorldMatrix(true, true); let owner; root.traverse(o => { if (o.userData.partId === id)
                    owner = o; }); const meshes = [], all = []; owner.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry?.attributes.position && o.text === undefined)
                    meshes.push(o); }); root.traverse(o => { if (o.isMesh && o.geometry?.attributes.position && o.text === undefined)
                    all.push(o); }); const box = new T.Box3().setFromObject(owner), centre = box.getCenter(new T.Vector3()), span = box.getSize(new T.Vector3()).length(), ray = new T.Raycaster(); let seen = 0; for (const dir of [[0, 0, 1], [1, 1, 2], [-1, 1, 2], [1, 2, -2], [-1, 2, -2], [1, .05, 1], [-1, .05, 1], [0, 3, 0], [0, -.3, 1], [0, .1, -1], [1, .15, -2], [-1, .15, -2]]) {
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
await p.evaluate(()=>{const s=window.__get();s.camera.position.set(4.5,3.5,5.5);s.camera.lookAt(2.8,.3,2);s.camera.updateMatrixWorld();});await p.waitForTimeout(150);await p.screenshot({path:'/tmp/atlas-railway-usb.png'});if(errors.length)throw Error(errors.join(';'));console.log('RAILWAY USB PASS',buffers);}finally{await browser.close();}})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack);process.exit(1)});