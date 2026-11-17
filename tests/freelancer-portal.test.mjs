import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterJobs,submitProposal,reviewProposal} from '../src/data/freelancer-portal.mjs';

test('combined listing filters handle trimmed queries and empty results',()=>{
 assert.deepEqual(filterJobs({query:'  REST  ',skill:'Python',duration:'This week'}).map(job=>job.id),['api']);
 assert.deepEqual(filterJobs({skill:'JavaScript',duration:'Next month'}),[]);
});

test('proposal and reviewer transitions preserve one submission per job',()=>{
 const note='I would build the dashboard and check keyboard navigation.';
 assert(!submitProposal([],'missing',note).ok);
 assert(!submitProposal([],'dashboard','brief').ok);
 const result=submitProposal([],'dashboard',note);
 assert(result.ok);
 assert(!submitProposal(result.proposals,'dashboard',note).ok);
 const decision=reviewProposal(result.proposals,'dashboard','Declined');
 assert.equal(decision.proposals[0].status,'Declined');
 assert.equal(result.proposals[0].status,'Submitted');
 assert(!reviewProposal(decision.proposals,'dashboard','Shortlisted').ok);
});
