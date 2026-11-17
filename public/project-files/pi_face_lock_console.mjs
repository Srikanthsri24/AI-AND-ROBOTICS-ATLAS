import { runSample, faceSamples } from './attendance-engine.mjs';

const sample = process.argv[2] ?? 'amara';
if (!faceSamples.some(item=>item.id===sample)) {
  console.error('Choose amara, basil, cleo, mixed, or visitor.');
  process.exitCode=1;
} else {
  const result=runSample(sample);
  console.log(JSON.stringify({sample,decision:result.status,candidates:result.candidates}));
  // The host serial console uses this decision to gate a single grant byte.
  if(result.status!=='match') process.exitCode=2;
}
