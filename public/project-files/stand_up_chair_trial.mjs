import assert from 'node:assert/strict';
import { advanceChair, chairCommand, maxAngle, radioTimeout, setChairLink, startChair } from './stand-up-chair.mjs';

let chair=advanceChair(chairCommand(startChair(),'raise'),3000);
assert.equal(chair.angle,maxAngle);
assert.equal(chair.drive,0);
console.log(chair.notice);

chair=advanceChair(chairCommand(chair,'lower'),400);
chair=chairCommand(chair,'stop');
assert.equal(advanceChair(chair,1000).angle,chair.angle);
console.log(chair.notice);

chair=setChairLink(chairCommand(chair,'lower'),false);
chair=advanceChair(chair,radioTimeout+500);
assert.equal(chair.drive,0);
console.log(chair.notice);

chair=setChairLink(chair,true);
assert.equal(advanceChair(chair,1000).angle,chair.angle);
chair=advanceChair(chairCommand(chair,'lower'),3000);
assert.equal(chair.angle,0);
assert.equal(chair.drive,0);
console.log(chair.notice);
