import {test} from 'node:test';
import assert from 'node:assert/strict';
import {predict,report,tests,training} from '../src/data/phone-cohorts.mjs';
test('removing the older training group exposes a gap in the held-out report',()=>{
 assert.equal(predict(tests[6]).group,'50+');
 assert.equal(report(false)[2].correct,3);
 assert.equal(report(true)[2].correct,0);
 assert(tests.every(row=>training.every(item=>item.id!==row.id)));
});
test('minimum cohort sizes suppress counts below the configured floor',()=>{
 assert(report(false,4).every(row=>row.correct===null));
 assert(report(false,3).every(row=>Number.isInteger(row.correct)));
});
