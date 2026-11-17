import assert from 'node:assert/strict';
import { appendBlock, audit, editFirstRecord, choices, tokens, batches, milestones } from './classroom-ledger.mjs';

let ballots=[];
for (const [index,token] of tokens.entries()) {
  const ballot=await appendBlock(ballots,{kind:'vote',ref:token,value:choices[index%2]});
  assert(ballot.ok);
  ballots=ballot.chain;
}
const duplicate=await appendBlock(ballots,{kind:'vote',ref:tokens[0],value:choices[1]});
assert.equal(duplicate.reason,'Token already used');

let produce=[];
for (const value of milestones) {
  const event=await appendBlock(produce,{kind:'produce',ref:batches[0],value});
  assert(event.ok);
  produce=event.chain;
}
assert((await audit(ballots)).ok);
assert((await audit(produce)).ok);
assert.equal((await audit(editFirstRecord(ballots))).index,1);
assert.equal((await audit(editFirstRecord(produce))).index,1);
console.log('Three ballots and three produce checkpoints verified. Duplicate blocked. Both edited copies fail at block 1.');
