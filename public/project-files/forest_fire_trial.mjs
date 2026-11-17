import assert from 'node:assert/strict';
import {evaluate,screen,tiles} from './forest-fire.mjs';
const {rows,...counts}=evaluate(.65);
assert.deepEqual(counts,{hits:2,falseAlerts:1,missed:1,masked:2});
assert.equal(screen(tiles[2]).score,null);
assert.equal(rows.find(row=>row.id==='B2').state,'Review');
console.table(rows.map(({id,state,score,laterFire})=>({id,state,score,laterFire})));
console.log('Two hits, one false alert, one visible miss, and two masked tiles.');
