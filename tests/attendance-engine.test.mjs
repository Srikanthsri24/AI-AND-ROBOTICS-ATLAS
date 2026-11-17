import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeFace, imageHeight, imageWidth, renderFace, roster, runSample } from '../src/data/attendance-engine.mjs';

test('cropping and background normalization preserve shifted and relit portraits', () => {
  for (const person of roster) {
    assert.deepEqual(describeFace(renderFace(person.shape,2,-16)),describeFace(renderFace(person.shape)));
  }
  assert.equal(describeFace(new Uint8Array(imageWidth*imageHeight)),null);
});

test('known, ambiguous and unknown portraits follow the match and margin rules', () => {
  assert.equal(runSample('amara').candidates[0].id,'A01');
  assert.equal(runSample('basil').candidates[0].id,'A02');
  assert.equal(runSample('cleo').status,'match');
  assert.equal(runSample('mixed').status,'review');
  assert.equal(runSample('visitor').status,'unknown');
  assert.equal(runSample('cleo',roster,.02).status,'unknown');
  assert.equal(runSample('amara',roster.slice(1)).status,'unknown');
  assert.deepEqual(runSample('amara',[]),{status:'unknown',candidates:[]});
});
