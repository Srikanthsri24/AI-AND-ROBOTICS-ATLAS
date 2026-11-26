const{chromium}=require('playwright');(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});try{const p=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5190/');await p.evaluate(async()=>{const R=await import('/node_modules/.vite/deps/react.js'),D=await import('/node_modules/.vite/deps/react-dom_client.js'),F=await import('/node_modules/.vite/deps/@react-three_fiber.js'),T=await import('/node_modules/.vite/deps/three.js'),{default:Beam}=await import('/src/modules/RailwayBeamParts.tsx'),{default:Socket}=await import('/src/modules/RailwayFemaleSocketGeometry.tsx'),{railwaySensorSocketDefinitions:defs,railwaySensorSocketPose:pose}=await import('/src/data/railway-sensor-sockets.ts'),{default:Light}=await import('/src/modules/WorkshopStudioLighting.tsx'),h=R.createElement??R.default.createElement;window.__T=T;window.__socketState={aligned:true,withdrawal:0};window.__inputs={current:{entryAligned:true,exitAligned:true}};document.querySelector('#root').style.display='none';const el=document.createElement('div');el.style.cssText='position:fixed;inset:0';document.body.append(el);function Rig({selected,select}){const refs=(R.useRef??R.default.useRef)([]);F.useFrame(()=>{for(let n=0;n<defs.length;n++){const p=pose(n,window.__socketState.aligned,window.__socketState.withdrawal),root=refs.current[n];if(root){root.position.set(...p.at);root.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...p.out));}}});return h('group',null,...defs.map((d,n)=>h('group',{key:d.id,name:d.id+'-fixture',userData:{partId:d.id},ref:r=>refs.current[n]=r,onClick:e=>{e.stopPropagation();select(d.id)}},h(Socket,{highlighted:selected===d.id}))));}function Preview(){const[selected,select]=(R.useState??R.default.useState)('');window.__selected=selected;return h(F.Canvas,{camera:{position:[0,3,5],fov:42,near:.001,far:100},onCreated:s=>window.__get=s.get},h(Light),h('ambientLight',{intensity:1.5}),h('directionalLight',{position:[-4,7,6],intensity:2.5}),h('color',{attach:'background',args:['#edf0f8']}),h('group',{scale:.01},h(Beam,{selected,select,inputs:window.__inputs}),h(Rig,{selected,select})));}(D.createRoot??D.default.createRoot)(el).render(h(Preview));});await p.waitForFunction(()=>window.__get?.().scene.getObjectByName('railway-sensor-a-emitter-vcc-a-fixture'));const ids=await p.evaluate(async()=>{const{railwaySensorSocketDefinitions:defs}=await import('/src/data/railway-sensor-sockets.ts');return defs.map(d=>d.id)});await p.evaluate(()=>{window.__socketBuffers=[];window.__get().scene.traverse(o=>{if(o.isMesh&&o.text===undefined)window.__socketBuffers.push([o,o.geometry,o.geometry.attributes.position,o.geometry.attributes.position.array])})});
for(const aligned of[true,false])for(const withdrawal of[0,1.3,3.25,6.5]){const expected=await p.evaluate(async({aligned,withdrawal})=>{window.__socketState={aligned,withdrawal};window.__inputs.current={entryAligned:aligned,exitAligned:aligned};const m=await import('/src/data/railway-sensor-sockets.ts');return m.railwaySensorSocketDefinitions.map((_,n)=>m.railwaySensorSocketPose(n,aligned,withdrawal));},{aligned,withdrawal});await p.waitForFunction(expected=>expected.every((p,n)=>{const roots=[];window.__get().scene.traverse(o=>{if(o.name.endsWith('-fixture'))roots.push(o)});return roots[n]?.position.toArray().every((v,k)=>Math.abs(v-p.at[k])<1e-9)}),expected);await p.evaluate(async({withdrawal})=>{const T=window.__T,s=window.__get(),{railwaySensorSocketDefinitions:defs}=await import('/src/data/railway-sensor-sockets.ts');s.scene.updateMatrixWorld(true);for(const d of defs){const id='railway-'+d.terminal.station+'-'+(d.terminal.receiver?'receiver':'emitter')+'-'+['vcc','ground','signal'][d.terminal.pin];let pin;s.scene.traverse(o=>{if(o.userData.partId===id)pin=o.children[0]});const root=s.scene.getObjectByName(d.id+'-fixture'),tip=pin.localToWorld(new T.Vector3(0,0,-1.5)),local=root.worldToLocal(tip.clone());if(local.distanceTo(new T.Vector3(0,3-withdrawal,0))>1e-6)throw Error('Socket does not follow actual sensor pin '+d.id);const plastic=[];root.traverse(o=>{if(o.isMesh&&(o.material?.metalness??0)<.1)plastic.push(o)});for(const[x,y]of[[0,0],[-.324,-.324],[-.324,.324],[.324,-.324],[.324,.324]]){const from=pin.localToWorld(new T.Vector3(x,y,1.51)),to=pin.localToWorld(new T.Vector3(x,y,-1.5)),v=to.clone().sub(from),ray=new T.Raycaster(from,v.clone().normalize(),0,v.length());if(ray.intersectObjects(plastic,false).length)throw Error('Sensor pin clips female socket '+d.id);}}for(const[o,g,a,array]of window.__socketBuffers)if(o.geometry!==g||g.attributes.position!==a||a.array!==array)throw Error('Socket movement rebuilt GPU buffers');},{withdrawal});console.log('TEN REAL SENSOR PINS / FEMALE OPENINGS',aligned,withdrawal);}
await p.evaluate(()=>{window.__socketState={aligned:true,withdrawal:6.5};window.__inputs.current={entryAligned:true,exitAligned:true}});await p.waitForTimeout(150);
        for (const id of ids) {
            let clicked = false;
            for (let attempt = 0; attempt < 10 && !clicked; attempt++) {
                const hit = await p.evaluate(({ id, attempt }) => { const T = window.__T, s = window.__get(), root = s.scene; root.updateWorldMatrix(true, true); let owner; root.traverse(o => { if (o.userData.partId === id)
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
await p.evaluate(()=>{const s=window.__get();s.camera.position.set(-1.78,.28,1.2);s.camera.lookAt(-1.9,.08,.8);s.camera.updateMatrixWorld();});await p.waitForTimeout(200);await p.screenshot({path:'/tmp/atlas-railway-female-sockets.png'});await p.evaluate(()=>{const T=window.__T,s=window.__get();s.scene.getObjectByName('railway-beam-hardware').visible=false;const roots=[];s.scene.traverse(o=>{if(o.name.endsWith('-fixture'))roots.push(o)});roots.forEach((r,n)=>r.visible=n===4);const c=roots[4].getWorldPosition(new T.Vector3());s.camera.position.copy(c).add(new T.Vector3(.015,.005,-.07));s.camera.lookAt(c.clone().add(new T.Vector3(0,0,.03)));s.camera.updateMatrixWorld();});await p.waitForTimeout(200);await p.screenshot({path:'/tmp/atlas-railway-female-mouth.png'});if(errors.length)throw Error(errors.join(';'));console.log('SENSOR FEMALE SOCKETS PASS');}finally{await browser.close();}})().then(()=>process.exit(0)).catch(e=>{console.error(e.stack);process.exit(1)});