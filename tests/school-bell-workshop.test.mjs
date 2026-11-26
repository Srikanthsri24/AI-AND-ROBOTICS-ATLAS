import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const cache=new Map();
async function load(url){
  if(cache.has(url.href))return cache.get(url.href);
  if(url.pathname.endsWith('.json'))return 'data:text/javascript;base64,'+Buffer.from('export default '+await readFile(url,'utf8')).toString('base64');
  let code=ts.transpileModule(await readFile(url,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)])code=code.replace(match[0],"from '"+await load(new URL(match[1]+(match[1].endsWith('.json')?'':'.ts'),url))+"'");
  const uri='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(url.href,uri);return uri;
}
const b=await import(await load(new URL('../src/data/school-bell-workshop.ts',import.meta.url)));
function run(start,commands='t'){let epoch=start,millis=0,state=b.schoolBellInitial(start),trace=[];for(let n=0;n<=2700;n++){const result=b.schoolBellLoop(state,epoch,millis,n===0?commands:'');state=result.state;if(result.adjust!==null)epoch=result.adjust;trace.push({millis,pitch:state.pitch,bells:state.bells,display:state.display});millis+=25;epoch+=.025;}return {state,trace};}
test('Monday rings once while Saturday remains silent through the same scheduled minute',()=>{const monday=run(b.schoolBellCompileEpoch,'t'),saturday=run(b.schoolBellCompileEpoch,'w');assert.equal(monday.state.bells,1);assert.equal(saturday.state.bells,0);assert.equal(monday.state.display,'08:31');assert.equal(saturday.state.display,'08:31');assert.equal(monday.state.pitch,0);assert.equal(monday.state.rows.filter(r=>r==='Scheduled bell').length,1);});
test('25 ms loop cadence produces two tones with an actual silent gap and no repeated minute trigger',()=>{const r=run(b.schoolBellCompileEpoch),start=r.trace.findIndex(t=>t.pitch===880),first=r.trace[start];assert.ok(start>0);const gap=r.trace.find(t=>t.millis>first.millis&&t.pitch===0),second=r.trace.find(t=>t.pitch===660),stop=r.trace.find(t=>t.millis>second.millis&&t.pitch===0);assert.equal(gap.millis-first.millis,200);assert.equal(second.millis-gap.millis,100);assert.equal(stop.millis-second.millis,275);});
test('startup in a scheduled minute is silent; reset commands cancel sound and RTC failure ignores commands',()=>{const epoch=Date.UTC(2026,10,16,8,30,0)/1000,s=b.schoolBellInitial(epoch);assert.equal(b.schoolBellLoop(s,epoch,25).state.bells,0);const ringing=b.schoolBellLoop({...s,lastSlot:s.lastSlot-1},epoch,100).state;assert.equal(ringing.pitch,880);const reset=b.schoolBellLoop(ringing,epoch,125,'n');assert.equal(reset.adjust,b.schoolBellCompileEpoch);assert.equal(reset.state.phase,-1);assert.equal(reset.state.pitch,0);const failed=b.schoolBellInitial(epoch,false);assert.deepEqual(b.schoolBellLoop(failed,epoch,10,'t'),{state:failed,adjust:null});});
test('tone timing crosses unsigned millis rollover',()=>{let s=b.schoolBellInitial(b.schoolBellCompileEpoch);s={...s,phase:0,pitch:880,noteStarted:0xfffffff0};assert.equal(b.schoolBellLoop(s,b.schoolBellCompileEpoch,100).state.phase,0);assert.equal(b.schoolBellLoop(s,b.schoolBellCompileEpoch,200).state.phase,1);});

test('all three daily slots ring only Monday through Friday and adjacent minutes stay quiet',()=>{for(let day=16;day<=22;day++)for(const [hour,minute] of [[8,30],[10,30],[15,0]])for(const offset of [-1,0,1]){const epoch=Date.UTC(2026,10,day,hour,minute+offset,0)/1000,state=b.schoolBellInitial(epoch-1),next=b.schoolBellLoop(state,epoch,25).state;assert.equal(next.bells,day<=20&&offset===0?1:0,JSON.stringify({day,hour,minute,offset}));}});
