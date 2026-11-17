import assert from 'node:assert/strict';
import {report,tests,predict} from './phone-cohorts.mjs';
assert.equal(predict(tests[6]).group,'50+');
assert.notEqual(predict(tests[6],true).group,'50+');
assert.equal(report(true)[2].correct,0);
assert(report(false,4).every(row=>row.correct===null));
console.table(report(false));
console.table(report(true));
console.log('Balanced, missing-group, and small-group checks passed.');
