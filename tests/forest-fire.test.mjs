import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,screen,tiles} from '../src/data/forest-fire.mjs';
test('clouds withhold hot observations and stay out of visible miss counts',()=>{
 const {rows,...counts}=evaluate(.65);
 assert.deepEqual(counts,{hits:2,falseAlerts:1,missed:1,masked:2});
 assert.equal(screen(tiles[2]).score,null);
 assert.equal(rows.find(row=>row.id==='A3').state,'Cloud masked');
});
test('threshold changes alerts without using later outcomes as inputs',()=>{
 assert.deepEqual(screen({...tiles[1],laterFire:false}),screen(tiles[1]));
 assert(evaluate(.9).missed>evaluate(.65).missed);
 assert.equal(evaluate(.9).masked,evaluate(.65).masked);
});
