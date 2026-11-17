import {test} from 'node:test';
import assert from 'node:assert/strict';
import {comparePlan} from '../src/data/transit-planner.mjs';

test('each route covers its own stops and retains missed demand',()=>{
 const a=comparePlan('A',4),b=comparePlan('B',4);
 assert.equal(a.served,138);
 assert.equal(b.served,114);
 assert.equal(a.served+a.missed,b.served+b.missed);
 assert.equal(a.overflow,18);
 assert.equal(b.overflow,0);
});

test('adding a departure trades lower wait and overflow for additional buses',()=>{
 const before=comparePlan('A',4),after=comparePlan('A',5);
 assert.equal(after.served,before.served);
 assert.equal(after.wait,12);
 assert.equal(after.overflow,0);
 assert.equal(before.buses,1);
 assert.equal(after.buses,2);
 assert.throws(()=>comparePlan('A',0),RangeError);
});
