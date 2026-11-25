import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const cache = new Map();
async function load(url) { if (cache.has(url.href))
    return cache.get(url.href); const text = await readFile(url, 'utf8'); let code = url.pathname.endsWith('.json') ? 'export default ' + text : ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText; for (const m of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])
    code = code.replace(m[0], "from '" + await load(new URL(m[1] + (m[1].endsWith('.json') ? '' : '.ts'), url)) + "'"); const uri = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64'); cache.set(url.href, uri); return uri; }
const a = await import(await load(new URL('../src/data/radar-assembly.ts', import.meta.url))), u = await import(await load(new URL('../src/data/radar-usb.ts', import.meta.url)));
test('ten radar chapters cover all actual owners and only highlight available hardware', () => { assert.equal(a.radarAssemblyChapters.length, 10); assert.deepEqual(a.radarAssemblyChapters.map(c => c.end), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); assert.equal(new Set(a.radarAssemblyParts.map(p => p.id)).size, 92); for (let tick = 0; tick <= 9000; tick++) {
    const p = tick / 1000, id = a.radarAssemblyActive(p);
    assert.ok(a.radarAssemblyParts.some(part => part.id === id));
    assert.ok(a.radarAssemblyPose(id, p).visible, id + ' unavailable at ' + p);
} for (const part of a.radarAssemblyParts) {
    const pose = a.radarAssemblyPose(part.id, 9);
    if (part.id === 'radar-assembly-supports')
        assert.equal(pose.visible, false);
    else {
        assert.equal(pose.visible, true);
        assert.deepEqual(pose.offset, [0, 0, 0]);
    }
} assert.throws(() => a.radarAssemblyPose('generic-model', 1)); assert.throws(() => a.radarAssemblyMotion(9.01)); });
test('underside screws seat on supported base before the blocks withdraw and servo lowers', () => { for (let tick = 20; tick <= 35; tick++) {
    const p = tick / 100;
    assert.equal(a.radarAssemblyPose('radar-base', p).offset[1], 30);
    assert.ok(.8 + a.radarAssemblyPose('radar-post-bolts', p).offset[1] > 0);
} for (let tick = 45; tick <= 55; tick++) {
    const p = tick / 100;
    assert.equal(a.radarAssemblyPose('radar-base', p).offset[1], 32);
    assert.ok(a.radarAssemblyPose('radar-assembly-supports', p).visible);
} assert.equal(a.radarAssemblyPose('radar-assembly-supports', .551).visible, false); for (const p of [.7, .75, .8, .85, .88])
    for (const id of ['radar-shaft', 'radar-servo-signal-tail', 'radar-servo-positive-tail', 'radar-servo-ground-tail', 'radar-servo-connector', 'radar-servo-rest'])
        assert.deepEqual(a.radarAssemblyPose(id, p).offset, a.radarAssemblyPose('radar-servo-case', p).offset); });
test('bare shaft centres inside startup before all horn and sensor fitting is unpowered', () => { const start = a.radarAssemblyMotion(2.5); assert.equal(start.actual, 30); assert.equal(start.servoPower, true); assert.equal(u.radarUsbConnected(start.usb, start.usbUno, start.usbHost), true); assert.equal(a.radarAssemblyMotion(2.6).actual, 90); assert.equal(a.radarAssemblyPose('radar-horn', 2.6).visible, false); for (let tick = 300; tick < 800; tick++) {
    const m = a.radarAssemblyMotion(tick / 100);
    assert.equal(m.actual, 90);
    assert.equal(m.servoPower, false);
    assert.equal(u.radarUsbConnected(m.usb, m.usbUno, m.usbHost), false);
} const ready = a.radarAssemblyMotion(9); assert.equal(ready.servoPower, false); assert.equal(u.radarUsbConnected(ready.usb, ready.usbUno, ready.usbHost), true); });
test('nuts approach from accessible sides before screws enter their aligned bores', () => { for (const p of [4.6, 4.65, 4.7, 4.75]) {
    const nuts = a.radarAssemblyPose('radar-bracket-nut-set', p);
    assert.equal(nuts.offset[1], 0);
    assert.ok(nuts.offset[2] > 0);
    assert.equal(a.radarAssemblyPose('radar-bracket-screw-set', p).visible, false);
} assert.deepEqual(a.radarAssemblyPose('radar-bracket-nut-set', 4.8).offset, [0, 0, 0]); for (const p of [5.5, 5.55, 5.6, 5.65]) {
    assert.ok(a.radarAssemblyPose('radar-sonar-nut-set', p).offset[2] < 0);
    assert.equal(a.radarAssemblyPose('radar-sonar-screw-set', p).visible, false);
} assert.deepEqual(a.radarAssemblyPose('radar-sonar-nut-set', 5.7).offset, [0, 0, -0]); });
test('eight sonar plugs seat individually with the correct 4 mm / 5 mm mating travels', () => { let previous = a.radarSonarSeating(0); assert.deepEqual(previous, Array.from({ length: 4 }, () => ({ sonar: 4, uno: 5 }))); for (let tick = 0; tick <= 80; tick++) {
    const current = a.radarSonarSeating(tick / 80);
    let moving = 0;
    for (let i = 0; i < 4; i++)
        for (const key of ['sonar', 'uno']) {
            assert.ok(current[i][key] <= previous[i][key]);
            if (current[i][key] > 0 && current[i][key] < (key === 'sonar' ? 4 : 5))
                moving++;
        }
    assert.ok(moving <= 1);
    previous = current;
} assert.deepEqual(previous, Array.from({ length: 4 }, () => ({ sonar: 0, uno: 0 }))); assert.throws(() => a.radarSonarSeating(-.1)); assert.throws(() => a.radarSonarSeating(NaN)); });
