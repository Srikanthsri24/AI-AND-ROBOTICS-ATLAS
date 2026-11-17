import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,fit,predict,heldOut,training} from '../src/data/attrition.mjs';
test('logistic training converges and excludes all held-out profiles',()=>{
 const [intercept,idle,tickets]=fit();
 assert(intercept<0&&idle>0&&tickets>0);
 assert(training.every(row=>heldOut.every(testRow=>testRow.id!==row.id)));
 assert(predict({idle:20,tickets:4})>predict({idle:5,tickets:1}));
});
test('threshold changes decisions and preserves scores',()=>{
 const low=evaluate(.25),high=evaluate(.75);
 assert.deepEqual(low.rows.map(row=>row.risk),high.rows.map(row=>row.risk));
 assert.deepEqual([low.hits,low.missed,low.falseAlerts,low.clear],[4,0,2,2]);
 assert.deepEqual([high.hits,high.missed,high.falseAlerts,high.clear],[2,2,0,4]);
});
