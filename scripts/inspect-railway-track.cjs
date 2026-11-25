const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{
const p=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5190/');
await p.evaluate(async()=>{const R=await import('/node_modules/.vite/deps/react.js'),D=await import('/node_modules/.vite/deps/react-dom_client.js'),F=await import('/node_modules/.vite/deps/@react-three_fiber.js'),T=await import('/node_modules/.vite/deps/three.js'),{default:Parts}=await import('/src/modules/RailwayTrackParts.tsx'),{default:Light}=await import('/src/modules/WorkshopStudioLighting.tsx'),{railwayInitial}=await import('/src/data/railway-workshop.ts'),h=R.createElement??R.default.createElement;window.__T=T;window.__clock={current:railwayInitial()};document.querySelector('#root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);function Preview(){const[selected,select]=(R.useState??R.default.useState)('');window.__selected=selected;return h(F.Canvas,{shadows:true,camera:{position:[5,7,10],fov:42,near:.001,far:100},onCreated:s=>window.__get=s.get},h(Light),h('ambientLight',{intensity:1.5}),h('directionalLight',{position:[-4,7,6],intensity:2.5}),h('color',{attach:'background',args:['#edf0f8']}),h('group',{scale:.01},h(Parts,{selected,select,clock:window.__clock})));}(D.createRoot??D.default.createRoot)(el).render(h(Preview));});
await p.waitForFunction(()=>window.__get?.().scene.getObjectByName('railway-train'));await p.waitForTimeout(150);
const ids=await p.evaluate(async()=>{const{railwayTrackParts}=await import('/src/data/railway-track-layout.ts'),actual=[];window.__get().scene.traverse(o=>{if(o.userData.partId)actual.push(o.userData.partId)});if(actual.length!==27||new Set(actual).size!==27||actual.some(id=>!railwayTrackParts.some(p=>p.id===id)))throw Error('Actual 27 owner catalogue mismatch');return actual;});
const buffers=await p.evaluate(()=>{window.__buffers=[];window.__get().scene.traverse(o=>{if(o.isMesh&&o.text===undefined)window.__buffers.push([o,o.geometry,o.geometry.attributes.position,o.geometry.attributes.position.array]);});return window.__buffers.length;});
for(const nose of[-300,-190.001,-190,-189.999,-100,-80,-70,-60,0,49.999,50,50.001,189.999,190,190.001,300,310,320,429.999,430,430.001,600]){await p.evaluate(nose=>window.__clock.current.trainNose=nose,nose);await p.waitForTimeout(70);await p.evaluate(async nose=>{const T=window.__T,s=window.__get(),{railwayBeamBlocked}=await import('/src/data/railway-workshop.ts'),train=s.scene.getObjectByName('railway-train'),bodies=[];s.scene.updateMatrixWorld(true);train.traverse(o=>{if(o.isMesh){let p=o;while(p&&!p.userData.partId)p=p.parent;if(['railway-front-body','railway-rear-body','railway-coupler'].includes(p?.userData.partId))bodies.push(o);}});for(const x of[-190,190]){const ray=new T.Raycaster(new T.Vector3(x*.01,.24,-.48),new T.Vector3(0,0,1),0,.96),hit=ray.intersectObjects(bodies,false)[0];if(!!hit!==railwayBeamBlocked(nose,x))throw Error('Actual body/beam mismatch '+JSON.stringify({nose,x,hit:!!hit}));}if(Math.abs(train.position.x-nose)>1e-9)throw Error('Train pose mismatch');s.scene.traverse(o=>{if(o.userData.partId?.startsWith('railway-wheel-')&&Math.abs(o.parent.rotation.z+(nose+300)/6)>1e-9)throw Error('Wheel roll does not follow travel');});for(const[o,g,a,array]of window.__buffers)if(o.geometry!==g||g.attributes.position!==a||a.array!==array)throw Error('Movement rebuilt GPU geometry');},nose);console.log('ACTUAL TRAIN / TWO FINITE BEAMS',nose);}
await p.evaluate(()=>window.__clock.current.trainNose=0);await p.waitForTimeout(120);await p.screenshot({path:'/tmp/atlas-railway-track.png'});
        for (const id of ids) {
            let clicked = false;
            for (let attempt = 0; attempt < 10 && !clicked; attempt++) {
                const hit = await p.evaluate(({ id, attempt }) => { const T = window.__T, s = window.__get(), root = s.scene.getObjectByName('railway-track-mm'); root.updateWorldMatrix(true, true); let owner; root.traverse(o => { if (o.userData.partId === id)
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
await p.evaluate(()=>{const T=window.__T,s=window.__get();s.camera.position.set(-.3,1.6,2.7);s.camera.lookAt(-1.2,.25,0);s.camera.updateMatrixWorld();});await p.waitForTimeout(100);await p.screenshot({path:'/tmp/atlas-railway-train.png'});if(errors.length)throw Error(errors.join(';'));console.log('RAILWAY TRAIN GEOMETRY / ACTUAL CLICKS PASS',buffers);}finally{await browser.close();}})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack);process.exit(1)});