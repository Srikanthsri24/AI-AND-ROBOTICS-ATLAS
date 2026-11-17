import assert from 'node:assert/strict';
import test from 'node:test';
import { generateDraft, publishHtml, reviewProblems, unsupportedClaim } from '../src/data/publishing-engine.mjs';

const brief = {
  activity: 'Rover Basics', schedule: 'Thursday', location: 'Room 12',
  audience: 'New members', exercise: 'test a rover', instruction: 'Bring a notebook.',
};
const allChecks = { facts: true, audience: true, privacy: true };

test('generated text tracks the source facts and the chosen tone', () => {
  const friendly = generateDraft(brief, 'friendly', false);
  const formal = generateDraft(brief, 'formal', false);
  assert.notEqual(friendly.heading, formal.heading);
  for (const draft of [friendly, formal]) {
    assert.match(draft.body, /Thursday.*Room 12/);
    assert.match(draft.body, /New members will test a rover/);
    assert.doesNotMatch(draft.body, /master robotics/);
  }
});

test('publication rejects incomplete review and the planted claim', () => {
  const draft = generateDraft(brief, 'friendly');
  assert.throws(() => publishHtml(draft, allChecks), /unsupported promise/);
  const revised = { ...draft, body: draft.body.replace(unsupportedClaim, '') };
  assert.throws(() => publishHtml(revised, { facts: true, audience: true }), /all three review checks/);
  assert.deepEqual(reviewProblems(revised, allChecks), []);
  assert.match(publishHtml(revised, allChecks), /<h1>Come try Rover Basics<\/h1>/);
});

test('published HTML displays draft text without executing it', () => {
  const page = publishHtml({ heading: 'A & B', body: '<script>alert(1)</script>\n\nRoom 12.' }, allChecks);
  assert.match(page, /<title>A &amp; B<\/title>/);
  assert.match(page, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(page, /<script>/);
  assert.match(page, /<p>Room 12\.<\/p>/);
});
