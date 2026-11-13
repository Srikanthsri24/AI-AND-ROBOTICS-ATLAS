import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {hardwareFamilies,hardwareGroups,hardwareModules,familyVisual,matchesFamily} from '../src/data/hardware.ts';
test('all five requested lists have complete, consecutively numbered family coverage',()=>{const expected={2:40,3:30,4:50,5:60,6:60};assert.equal(hardwareFamilies.length,240);assert.equal(new Set(hardwareFamilies.map(f=>f.id)).size,240);for(const [module,count] of Object.entries(expected)){const rows=hardwareFamilies.filter(f=>f.module===+module);assert.equal(rows.length,count);assert.deepEqual(rows.map(f=>f.number),Array.from({length:count},(_,i)=>i+1));assert.equal(hardwareGroups(+module).reduce((n,g)=>n+g.count,0),count)}});
test('each family has authored purpose, three setup steps, use cases, selection and a meaningful 2D flow',()=>{for(const f of hardwareFamilies){for(const key of ['title','variants','summary','why','choose','mistake'])assert.ok(f[key]?.trim().length>0,`${f.id}: ${key}`);assert.equal(f.steps.length,3,f.id);assert.equal(f.useCases.length,3,f.id);assert.equal(f.flow.length,3,f.id);for(const step of f.steps)assert.ok(step.trim().length>10,`${f.id}: ${step}`);assert.equal(new Set(f.flow).size,3,f.id)}});
test('every collection and module hero has local high-resolution artwork and saved provenance',()=>{const manifest=JSON.parse(readFileSync(new URL('../design-assets/hardware/manifest.json',import.meta.url)));const art=new Set([...hardwareFamilies.map(f=>f.group),...Object.values(hardwareModules).map(m=>m.art)]);assert.equal(art.size,42);for(const name of art){assert.ok(manifest.some(m=>m.id===name),name);for(const width of [640,1280])assert.ok(existsSync(new URL(`../public/images/hardware/${name}-${width}.jpg`,import.meta.url)),name)}});
test('key distinctions avoid treating unlike hardware as interchangeable',()=>{assert.match(hardwareFamilies.find(f=>f.id==='boards-02').mistake,/H2.*no Wi-Fi/);assert.match(hardwareFamilies.find(f=>f.id==='components-30').mistake,/not necessarily a charger/);assert.match(hardwareFamilies.find(f=>f.id==='sensors-04').mistake,/not a direct CO₂/);assert.match(hardwareFamilies.find(f=>f.id==='robots-07').mistake,/not automatically safe/);assert.match(hardwareFamilies.find(f=>f.id==='anatomy-57').mistake,/degrees of freedom/) });

test('model search resolves shorthand variants inside their named family',()=>{for(const [query,id] of [['ESP32-C5','boards-02'],['Nano ESP32','boards-01'],['VL53L5CX','sensors-10'],['Stewart','robots-10'],['Bowden','anatomy-14']])assert.ok(matchesFamily(hardwareFamilies.find(f=>f.id===id),query),query)});

import {modelProfile} from '../src/data/hardware-models.ts';
test('all 240 family guides resolve a valid 3D construction profile',()=>{for(const f of hardwareFamilies){const p=modelProfile(f);assert.ok(p.kind,f.id);assert.equal(p.parts.length,3,f.id);assert.equal(new Set(p.parts).size,3,f.id);assert.match(p.construction,/not exact product CAD/)}assert.equal(modelProfile(hardwareFamilies.find(f=>f.id==='sensors-08')).kind,'ultrasonic');assert.equal(modelProfile(hardwareFamilies.find(f=>f.id==='robots-10')).kind,'delta');assert.equal(modelProfile(hardwareFamilies.find(f=>f.id==='robots-25')).kind,'fixedwing');assert.equal(modelProfile(hardwareFamilies.find(f=>f.id==='anatomy-14')).kind,'hand')});

test('every hardware family displays a distinct local image', () => {
  const families = hardwareFamilies;
  const sources = new Set();
  const images = new Set();
  const originals = new Set();

  for (const family of families) {
    const { src, alt, photo, generated } = familyVisual(family);
    assert.ok(alt, family.id);
    if (family.module === 5 || family.module === 6) {
      assert.equal(generated, true, family.id);
    } else {
      assert.ok(photo?.credit && photo.source, family.id);
      assert.ok(!originals.has(photo.source), family.id);
      originals.add(photo.source);
    }
    assert.ok(!sources.has(src), family.id);
    sources.add(src);
    const bytes = readFileSync(new URL(`../public/${src}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', family.id);
    const content = bytes.toString('base64');
    assert.ok(!images.has(content), family.id);
    images.add(content);
  }
});

import { imageHotspots } from '../src/data/image-hotspots.ts';

test('every hardware image has at least three independently placed, explained parts with highlight regions', () => {
  assert.deepEqual(Object.keys(imageHotspots).sort(), hardwareFamilies.map(({ id }) => id).sort());
  for (const { id } of hardwareFamilies) {
    const parts = imageHotspots[id];
    assert.ok(parts.length >= 3, id);
    assert.equal(new Set(parts.map(part => part.name)).size, parts.length, id);
    assert.equal(new Set(parts.map(({ x, y }) => `${x},${y}`)).size, parts.length, id);
    for (const { x, y, region, name, function: purpose, connection } of parts) {
      assert.ok(x > 0 && x < 100 && y > 0 && y < 100, `${id}: ${name}`);
      assert.ok(name.trim() && purpose.trim() && connection.trim(), `${id}: ${name}`);
      if (typeof region[0] === 'number') {
        const [width, height, angle, shape] = region;
        assert.ok(width > 0 && width <= 100 && height > 0 && height <= 100 && Number.isFinite(angle), `${id}: ${name}`);
        assert.ok(shape === 'box' || shape === 'oval', `${id}: ${name}`);
      } else {
        assert.ok(region.length >= 3 && region.every(pair => pair.every(n => n >= 0 && n <= 100)), `${id}: ${name}`);
      }
      assert.notEqual(purpose, connection, `${id}: ${name}`);
    }
  }
});

import { studioParts } from '../src/data/studio-parts.ts';

test('every 3D guide exposes distinct geometry IDs with purpose and connection explanations', () => {
  for (const family of hardwareFamilies) {
    const parts = studioParts(family, modelProfile(family).kind);
    assert.ok(parts.length >= 3, family.id);
    assert.equal(new Set(parts.map(({ id }) => id)).size, parts.length, family.id);
    assert.equal(new Set(parts.map(({ part }) => part.name)).size, parts.length, family.id);
    for (const { part } of parts) {
      assert.ok(part.name && part.purpose && part.connection, family.id);
      assert.notEqual(part.purpose, part.connection, family.id);
      assert.doesNotMatch(part.name, /^(Structural assembly|Functional mechanism|Connection interface)$/);
    }
  }
  const forFamily = id => {
    const family = hardwareFamilies.find(f => f.id === id);
    return studioParts(family, modelProfile(family).kind).map(({ part }) => part.name);
  };
  assert.ok(forFamily('boards-01').includes('USB receptacle'));
  assert.ok(!forFamily('boards-01').includes('LED matrix'));
  assert.ok(forFamily('boards-04').includes('LED matrix'));
  assert.ok(forFamily('sensors-08').includes('Second acoustic transducer'));
  assert.ok(forFamily('anatomy-58').includes('Wrist pivot'));
});

import { studioAssets } from '../src/data/studio-assets.ts';

test('every hardware family has a unique dedicated 3D asset with selectable mesh groups', () => {
  assert.equal(hardwareFamilies.length, 240);
  assert.deepEqual(Object.keys(studioAssets).sort(), hardwareFamilies.map(family => family.id).sort());
  const seen = new Set();
  const meshes = new Set();
  for (const [id, asset] of Object.entries(studioAssets)) {
    const family = hardwareFamilies.find(f => f.id === id);
    assert.ok(family, id);
    assert.equal(asset.reference, familyVisual(family).src);
    assert.ok(!seen.has(asset.src), asset.src);
    seen.add(asset.src);
    const file = readFileSync(new URL(`../public/${asset.src}`, import.meta.url));
    assert.equal(file.toString('ascii', 0, 4), 'glTF');
    const binaryChunk = file.subarray(28 + file.readUInt32LE(12));
    const digest = createHash('sha256').update(binaryChunk).digest('hex');
    assert.ok(!meshes.has(digest), `Reused mesh content: ${id}`);
    meshes.add(digest);
    const gltf = JSON.parse(file.toString('utf8', 20, 20 + file.readUInt32LE(12)));
    const nodeNames = new Set(asset.parts.map(part => part.node));
    assert.equal(nodeNames.size, asset.parts.length);
    const visit = (index, owner) => {
      const node = gltf.nodes[index];
      if (nodeNames.has(node.name)) {
        assert.equal(owner, undefined, `${id} has nested part bindings at ${node.name}`);
        owner = node.name;
      }
      if (node.mesh !== undefined) assert.ok(owner, `${id} contains an unbound mesh at node ${index}`);
      for (const child of node.children ?? []) visit(child, owner);
    };
    for (const root of gltf.scenes[gltf.scene ?? 0].nodes) visit(root, undefined);
    for (const { node, name, purpose, connection } of asset.parts) {
      const binding = gltf.nodes.find(candidate => candidate.name === node);
      const containsMesh = candidate => candidate?.mesh !== undefined
        || candidate?.children?.some(index => containsMesh(gltf.nodes[index]));
      assert.ok(containsMesh(binding), node);
      assert.ok(name && purpose && connection, node);
    }
  }
});
