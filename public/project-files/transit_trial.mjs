import assert from 'node:assert/strict';
import { comparePlan } from './transit-planner.mjs';

const corridor=comparePlan('A',4);
const clinic=comparePlan('B',4);
const extra=comparePlan('A',5);
assert.equal(corridor.served,138);
assert.equal(clinic.served,114);
assert.equal(corridor.overflow,18);
assert.equal(extra.overflow,0);
assert.equal(extra.wait,12);
assert.equal(extra.buses,2);
console.table({corridor,clinic,extra});
