import assert from 'node:assert/strict';
import {evaluate,predict,heldOut} from './attrition.mjs';
const low=evaluate(.25),mid=evaluate(.5),high=evaluate(.75);
assert.deepEqual([low.missed,mid.missed,high.missed],[0,1,2]);
assert.deepEqual([low.falseAlerts,mid.falseAlerts,high.falseAlerts],[2,1,0]);
assert(predict(heldOut[2])<.5);
console.table([low,mid,high].map(({rows,...totals},i)=>({threshold:[.25,.5,.75][i],...totals})));
console.log('The model is unchanged across thresholds. Lower thresholds flag more cases.');
