import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceChair, chairCommand, maxAngle, radioTimeout, setChairLink, startChair } from '../src/data/stand-up-chair.mjs';

test('travel limits and an explicit stop prevent additional motion',()=>{
  const up=advanceChair(chairCommand(startChair(),'raise'),5000);
  assert.equal(up.angle,maxAngle);
  assert.equal(up.drive,0);
  const partway=advanceChair(chairCommand(up,'lower'),1400);
  assert(partway.angle>0&&partway.angle<maxAngle);
  const stopped=chairCommand(partway,'stop');
  assert.equal(advanceChair(stopped,2000),stopped);
  const down=advanceChair(chairCommand(stopped,'lower'),5000);
  assert.equal(down.angle,0);
  assert.equal(down.drive,0);
});

test('RF loss caps unacknowledged travel and reconnect requires a fresh command',()=>{
  const beforeLoss=advanceChair(chairCommand(startChair(),'raise'),600);
  const lost=setChairLink(beforeLoss,false);
  const elapsed=advanceChair(lost,radioTimeout+1300);
  const boundary=advanceChair(lost,radioTimeout);
  assert.equal(elapsed.angle,boundary.angle);
  assert.equal(elapsed.drive,0);
  assert.match(elapsed.notice,/timeout/);
  assert.equal(chairCommand(elapsed,'raise').drive,0);
  const restored=setChairLink(elapsed,true);
  assert.equal(advanceChair(restored,1300),restored);
  assert.equal(chairCommand(restored,'raise').drive,1);
});
