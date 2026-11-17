import assert from 'node:assert/strict';
import { filterJobs, submitProposal, reviewProposal } from './freelancer-portal.mjs';

assert.deepEqual(filterJobs({skill:'Python',duration:'This week'}).map(job=>job.id),['api']);
assert.equal(filterJobs({skill:'Accessibility',duration:'Next month'}).length,0);
const note='I can document the endpoints and provide testable JSON examples.';
const submitted=submitProposal([],'api',note);
assert(submitted.ok);
assert(!submitProposal(submitted.proposals,'api',note).ok);
const reviewed=reviewProposal(submitted.proposals,'api','Shortlisted');
assert(reviewed.ok);
assert.equal(reviewed.proposals[0].status,'Shortlisted');
assert(!reviewProposal(reviewed.proposals,'api','Declined').ok);
console.log('Filters, empty results, proposal validation, duplicate prevention and shortlist passed.');
