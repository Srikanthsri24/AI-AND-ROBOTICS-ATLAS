import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { advanceInquiry, createSession, scopeRecords, setAttendance } from './school-workspace-engine.mjs';

const data = JSON.parse(await readFile(new URL('./school-workspaces.json', import.meta.url)));
const admin = createSession(data, 'maple', 'admin');
const teacher = createSession(data, 'maple', 'teacher');
const student = createSession(data, 'maple', 'student');
const otherSchool = createSession(data, 'river', 'admin');
const originalRiver = scopeRecords(data, otherSchool);

assert.equal(scopeRecords(data, admin).learners.length, 3);
assert.equal(scopeRecords(data, teacher).learners.length, 2);
assert.equal(scopeRecords(data, student).learners.length, 1);
assert.equal(scopeRecords(data, teacher).inquiries.length, 0);
assert.throws(() => setAttendance(data, admin, 'ra-01', 'Absent'));
assert.throws(() => setAttendance(data, teacher, 'mg-03', 'Absent'));
assert.throws(() => setAttendance(data, student, 'mg-01', 'Absent'));
assert.throws(() => advanceInquiry(data, teacher, 'mq-01'));
assert.throws(() => advanceInquiry(data, admin, 'rq-01'));

const attendance = setAttendance(data, teacher, 'mg-02', 'Present');
const changed = advanceInquiry(attendance, admin, 'mq-01');
assert.equal(scopeRecords(changed, admin).learners[1].attendance, 'Present');
assert.equal(scopeRecords(changed, admin).inquiries[0].status, 'Contacted');
assert.deepEqual(scopeRecords(changed, otherSchool), originalRiver);
assert.equal(scopeRecords(data, admin).learners[1].attendance, 'Absent');
console.log('Role permissions, scoped updates and school separation passed.');
