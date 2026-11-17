import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resultStatus, reviewResult, runInference } from './pipeline-dashboard-engine.mjs';

const fixture = JSON.parse(await readFile(new URL('./pipeline-dashboard-fixtures.json', import.meta.url)));
const now = Date.parse(fixture.clock);
const [steady, warm, delayed, missing] = fixture.scenarios
  .map((scenario, i) => runInference(scenario.reading, fixture.model, now, i + 1));

assert.equal(steady.prediction, 'Continue observation');
assert.equal(warm.prediction, 'Inspect motor');
assert.ok(warm.score > steady.score);
assert.equal(resultStatus(warm, now), 'Fresh');
assert.equal(resultStatus(warm, now + 28_000), 'Fresh');
assert.equal(resultStatus(warm, now + 29_000), 'Stale');
assert.equal(resultStatus(delayed, now), 'Stale');
assert.equal(resultStatus(missing, now), 'Invalid');
assert.equal(missing.prediction, undefined);
assert.equal(reviewResult(warm, now).reviewedAt, now);
assert.equal(warm.reviewedAt, undefined);
assert.throws(() => reviewResult(delayed, now), /fresh/);
assert.throws(() => reviewResult(missing, now), /fresh/);
console.log('Prediction, invalid input, freshness boundary and review checks passed.');
