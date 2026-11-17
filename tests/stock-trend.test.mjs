import {test} from 'node:test';
import assert from 'node:assert/strict';
import {days,evaluate,fitRule,stockCsv} from '../src/data/stock-trend.mjs';
test('the locked early rule loses to the baseline on the unseen later window',()=>{
 assert.equal(fitRule(),'follow');
 assert.equal(evaluate('fit').correct,7);
 assert.equal(evaluate('test').correct,2);
 assert.equal(evaluate('test').baselineCorrect,5);
 assert.equal(evaluate('test').rows[0].correct,false);
});
test('the CSV preserves ordered windows and next-day labels',()=>{
 assert.equal(stockCsv.trim().split('\n').length,17);
 assert(days.slice(0,8).every(row=>row.split==='fit'));
 assert(days.slice(8).every(row=>row.split==='test'));
 for(let i=1;i<days.length;i++) assert.equal(days[i-1].nextClose,days[i].close);
});
