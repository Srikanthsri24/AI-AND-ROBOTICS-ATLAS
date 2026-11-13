import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Box3, Raycaster, Triangle, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { partSeparation } from '../src/modules/studio-separation.ts';
import { studioAssets } from '../src/data/studio-assets.ts';

function hasSelectableSurface(part, distance, targets = null, accept = () => true, sampleLimit = Infinity, allowOccluded = false) {
  const triangle = new Triangle();
  const normal = new Vector3();
  const target = new Vector3();
  const ray = new Raycaster();
  let found = false;
  let samples = 0;
  const hits = [];
  part.traverse(mesh => {
    if (found || !mesh.isMesh || samples >= sampleLimit) return;
    const positions = mesh.geometry.getAttribute('position');
    const indices = mesh.geometry.getIndex();
    const count = indices?.count ?? positions.count;
    // A triangle interior is a better aim point than the center of a hollow part.
    const stride = sampleLimit === Infinity ? 3 : 3 * Math.max(1, Math.floor(count / 24));
    for (let i = 0; i + 2 < count && samples < sampleLimit; i += stride) {
      for (const [offset, vertex] of [triangle.a, triangle.b, triangle.c].entries()) {
        vertex.fromBufferAttribute(positions, indices ? indices.getX(i + offset) : i + offset);
        vertex.applyMatrix4(mesh.matrixWorld);
      }
      if (triangle.getArea() <= 1e-10) continue;
      triangle.getNormal(normal);
      triangle.getMidpoint(target);
      ray.set(target.clone().addScaledVector(normal, distance), normal.clone().negate());
      samples++;
      hits.length = 0;
      if (targets) ray.intersectObjects(targets, false, hits);
      else ray.intersectObject(part, true, hits);
      if (allowOccluded ? hits.some(hit => accept(hit.object)) : hits.length && accept(hits[0].object)) {
        found = true;
        return;
      }
    }
  });
  return found;
}

function hasVisiblePartFromStandardViews(part, distance, targets, owners) {
  const bounds = new Box3().setFromObject(part);
  const ray = new Raycaster();
  const origin = new Vector3();
  const direction = new Vector3();
  const hits = [];
  for (const [axis, horizontal, vertical] of [['x', 'z', 'y'], ['y', 'x', 'z'], ['z', 'x', 'y']]) {
    for (const side of [-1, 1]) {
      direction.set(0, 0, 0);
      direction[axis] = -side;
      origin[axis] = (side > 0 ? bounds.max[axis] : bounds.min[axis]) + side * distance;
      for (let row = 0; row < 12; row++) for (let column = 0; column < 12; column++) {
        origin[horizontal] = bounds.min[horizontal] + (bounds.max[horizontal] - bounds.min[horizontal]) * (column + .5) / 12;
        origin[vertical] = bounds.min[vertical] + (bounds.max[vertical] - bounds.min[vertical]) * (row + .5) / 12;
        ray.set(origin, direction);
        hits.length = 0;
        ray.intersectObjects(targets, false, hits);
        if (hits.length && owners.get(hits[0].object) === part) return true;
      }
    }
  }
  return false;
}

test('every authored part is pickable in the assembled, separated or transparent model', async t => {
  let assembledHits = 0;
  let partCount = 0;
  const separatedChecks = [];
  const transparentChecks = [];
  const loader = new GLTFLoader();
  for (const [id, asset] of Object.entries(studioAssets)) {
    const file = readFileSync(new URL(`../public/${asset.src}`, import.meta.url));
    const { scene } = await loader.parseAsync(new Uint8Array(file).buffer, '');
    scene.updateMatrixWorld(true);
    const distance = new Box3().setFromObject(scene).getSize(new Vector3()).length() + 1;
    const targets = [];
    const owners = new Map();
    const parts = asset.parts.map(({node}) => {
      const part = scene.getObjectByName(node);
      assert.ok(part, `${id} has no node named ${node}`);
      part.traverse(mesh => {
        if (!mesh.isMesh) return;
        targets.push(mesh);
        owners.set(mesh, part);
      });
      return part;
    });
    let modelHits = 0;
    const obscured = [];
    for (const part of parts) {
      partCount++;
      const belongsToPart = mesh => owners.get(mesh) === part;
      const directlyReachable =
        hasSelectableSurface(part, distance, targets, belongsToPart, 20) ||
        hasSelectableSurface(part, distance, targets, belongsToPart, 240) ||
        hasVisiblePartFromStandardViews(part, distance, targets, owners);
      if (directlyReachable) {
        modelHits++;
      } else {
        obscured.push(part);
      }
    }
    assert.ok(modelHits > 0, `${id} has no sampled exterior hit`);
    assembledHits += modelHits;
    if (!obscured.length) continue;

    const bounds = new Box3().setFromObject(scene);
    const center = bounds.getCenter(new Vector3());
    const spread = bounds.getSize(new Vector3()).length() * .21;
    const shifts = parts.map((part, index) =>
      new Vector3(...partSeparation(part, center, spread, asset.parts[index].offset, index)));
    const origins = parts.map(part => part.getWorldPosition(new Vector3()));
    const pending = new Set(obscured);
    for (const amount of [.5, 1]) {
      parts.forEach((part, index) => {
        const target = origins[index].clone().addScaledVector(shifts[index], amount);
        part.position.copy(part.parent.worldToLocal(target));
      });
      scene.updateMatrixWorld(true);
      for (const part of pending) {
        if (hasSelectableSurface(part, distance * 2, targets, mesh => owners.get(mesh) === part, 240)) {
          separatedChecks.push(`${id}/${part.name}`);
          pending.delete(part);
        }
      }
    }
    for (const part of pending) {
      const reachesThroughGeometry = hasSelectableSurface(
        part, distance * 2, targets, mesh => owners.get(mesh) === part, Infinity, true);
      assert.ok(reachesThroughGeometry, `${id} / ${part.name} has no raycastable surface`);
      transparentChecks.push(`${id}/${part.name}`);
    }
  }
  t.diagnostic(`${assembledHits}/${partCount} parts received the first hit in sampled assembled views`);
  t.diagnostic(`${separatedChecks.length} more parts received the first hit in sampled separated views`);
  t.diagnostic(`Parts reachable by cycling ray hits with transparent materials: ${transparentChecks.join(", ")}`);
});
