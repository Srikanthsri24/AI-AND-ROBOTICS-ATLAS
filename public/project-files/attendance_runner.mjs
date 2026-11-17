import { faceSamples, matchLimit, runSample } from './attendance-engine.mjs';

const id = process.argv[2] || 'cleo';
const limit = process.argv[3] === undefined ? matchLimit : Number(process.argv[3]);
if (!faceSamples.some(sample => sample.id === id) || !Number.isFinite(limit) || limit < 0 || limit > 1) {
  console.error('Usage: node attendance_runner.mjs <amara|basil|cleo|mixed|visitor> [distance limit 0..1]');
  process.exitCode = 1;
} else {
  const result = runSample(id, undefined, limit);
  console.log(JSON.stringify({ sample:id, limit, ...result }, null, 2));
}
