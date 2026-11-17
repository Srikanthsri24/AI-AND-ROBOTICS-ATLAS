import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appendBlock,audit,editFirstRecord,genesis,tokens,choices,batches} from '../src/data/classroom-ledger.mjs';

test('ballots link to their predecessor and block reuse of a token',async()=>{
  const first=await appendBlock([],{kind:'vote',ref:tokens[0],value:choices[0]});
  const second=await appendBlock(first.chain,{kind:'vote',ref:tokens[1],value:choices[1]});
  assert.equal(first.chain[0].previous,genesis);
  assert.equal(second.chain[1].previous,first.chain[0].hash);
  assert.equal((await appendBlock(second.chain,{kind:'produce',ref:batches[0],value:'Harvested'})).ok,false);
  assert.equal(first.chain[0].hash.length,64);
  assert((await audit(second.chain)).ok);
  assert.equal((await appendBlock(second.chain,{kind:'vote',ref:tokens[0],value:choices[1]})).reason,'Token already used');
  const edited=editFirstRecord(second.chain);
  assert.equal((await audit(edited)).index,1);
  assert.equal((await appendBlock(edited,{kind:'vote',ref:tokens[2],value:choices[1]})).ok,false);
  assert.equal((await audit([second.chain[1],second.chain[0]])).index,1);
  assert((await audit(second.chain)).ok);
});

test('produce checkpoints follow their own batch history',async()=>{
  const batch=batches[0];
  assert.equal((await appendBlock([],{kind:'produce',ref:batch,value:'Delivered'})).ok,false);
  const harvest=await appendBlock([],{kind:'produce',ref:batch,value:'Harvested'});
  const other=await appendBlock(harvest.chain,{kind:'produce',ref:batches[1],value:'Harvested'});
  assert(other.ok);
  assert.equal((await appendBlock(other.chain,{kind:'produce',ref:batch,value:'Harvested'})).ok,false);
  const packing=await appendBlock(other.chain,{kind:'produce',ref:batch,value:'Packed'});
  assert((await audit(packing.chain)).ok);
  assert.equal((await audit(editFirstRecord(packing.chain))).ok,false);
});
