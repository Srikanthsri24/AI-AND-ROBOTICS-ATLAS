import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { classifyPhrase } from './toshali-matcher.mjs';

const data = JSON.parse(await readFile(new URL('./toshali-exhibit.json', import.meta.url)));
for (const {phrase, expected} of data.trials) {
  const verdict = classifyPhrase(phrase, data.crafts);
  assert.equal(verdict.craftId, expected, phrase);
  console.log(`${phrase} → ${verdict.craftId ?? verdict.reason}`);
}
assert.equal(classifyPhrase('PIPILI APPLIQUÉ?', data.crafts).craftId, 'chandua');
assert.equal(classifyPhrase('ତାରକସି', data.crafts).craftId, 'tarakasi');
assert.equal(classifyPhrase('pattachitra or tarakasi', data.crafts).reason, 'ambiguous');
assert.equal(classifyPhrase('train schedule', data.crafts).reason, 'unfamiliar');
assert.equal(classifyPhrase('', data.crafts).craftId, null);
assert.equal(classifyPhrase('ପଟଟଚତର', data.crafts).craftId, null);
console.log('Craft matches, Unicode normalization and fallback checks passed.');
