import test from 'node:test';
import { distinctLabs } from "../src/data/distinct-labs.ts";
import {resolveExperiment} from '../src/modules/lab-experiments.ts';
import assert from 'node:assert/strict';
import {workshopLabs,ledCurrent,acousticDistance,tmp36Reading,roverDecision} from '../src/data/workshop-labs.ts';
import {aiCurriculum,trainLine,fuseScalars,sigmoid,allowedIntent} from '../src/data/ai-curriculum.ts';
import {projectBlueprints} from '../src/data/project-blueprints.ts';
import {learningPaths,assessmentBank,practiceCertificate} from '../src/data/learning-curriculum.ts';
import {hardwareFamilies,legacyFamilyAliases} from '../src/data/hardware.ts';
import {entries} from '../src/data/atlas.ts';
import {parseCircuitJSON,evaluateCircuit} from '../src/modules/simulation.ts';
const ids=new Set(hardwareFamilies.map(f=>f.id));
test('guided labs have purpose, setup, source, model scope and connected family guides',()=>{assert.equal(workshopLabs.length,110);assert.equal(new Set(workshopLabs.map(l=>l.id)).size,workshopLabs.length);for(const l of workshopLabs){assert.equal(l.setup.length,3);for(const k of ['description','learn','model','code','language'])assert.ok(l[k].length>15,`${l.id}: ${k}`);for(const id of l.families)assert.ok(ids.has(id),id)}});
test('all lab scenarios have valid controls and a readable simulation result', () => {
  for (const lab of workshopLabs) {
    const experiment = resolveExperiment(lab.id);
    assert.ok(experiment, lab.id);
    const inputs = Object.fromEntries(experiment.controls.map(control => {
      const value = lab.preset?.[control.key] ?? control.initial;
      assert.ok(value >= control.min && value <= control.max, `${lab.id}: ${control.key}`);
      assert.ok(Math.abs((value-control.min)/control.step-Math.round((value-control.min)/control.step)) < 1e-8, `${lab.id}: ${control.key} step`);
      return [control.key, value];
    }));
    for (const tick of [0, 1, 2]) {
      const reading = experiment.read(inputs, tick, lab.flag ?? experiment.toggle?.initial ?? false);
      assert.ok(Number.isFinite(reading.sample) && reading.value && reading.detail, lab.id);
    }
  }
});
test('lab calculations use the stated circuit and measurement models',()=>{assert.ok(Math.abs(ledCurrent(5,330)-9.090909)<.00001);assert.equal(ledCurrent(1,330),0);assert.ok(Math.abs(acousticDistance(1000,20)-17.171)<.001);assert.ok(acousticDistance(1000,30)>acousticDistance(1000,20));const t=tmp36Reading(25);assert.equal(t.volts,.75);assert.ok(Math.abs(t.estimated-25)<.25);assert.match(roverDecision(false,100,20),/STOP/);assert.match(roverDecision(true,10,20),/REPLAN/);assert.match(roverDecision(true,20,20),/FORWARD/)});
const circuit={nodes:[{id:'s',kind:'Supply',x:70,y:100},{id:'r',kind:'Resistor',x:270,y:100},{id:'l',kind:'LED',x:470,y:100}],wires:[{from:'s:out',to:'r:in'},{from:'r:out',to:'l:in'},{from:'l:out',to:'s:in'}],voltage:5,resistance:330,code:'void setup() {} void loop() {}'};
test('circuit import validates structure without pretending to validate electrical operation',()=>{const parsed=parseCircuitJSON(JSON.stringify(circuit));assert.equal(parsed.ok,true);assert.equal(evaluateCircuit(parsed.circuit).ok,true);for(const c of [{...circuit,nodes:[...circuit.nodes,circuit.nodes[0]]},{...circuit,wires:[{from:'unknown:out',to:'r:in'}]},{...circuit,nodes:[{id:'x',kind:'Motor',x:20,y:20}]},{...circuit,voltage:100}])assert.equal(parseCircuitJSON(JSON.stringify(c)).ok,false);assert.equal(parseCircuitJSON('not json').ok,false);const open=parseCircuitJSON(JSON.stringify({...circuit,wires:[]}));assert.equal(open.ok,true);assert.equal(evaluateCircuit(open.circuit).ok,false)});
test('fifteen project blueprints cover distinct categories with nine complete stages and valid parts',()=>{assert.equal(projectBlueprints.length,15);assert.equal(new Set(projectBlueprints.map(p=>p.id)).size,15);assert.equal(new Set(projectBlueprints.map(p=>p.category)).size,15);for(const p of projectBlueprints){assert.equal(p.steps.length,9,p.id);assert.ok(p.steps.every(s=>s.length>30),p.id);assert.ok(p.bom.length>=2,p.id);assert.ok(p.tests.length>=4,p.id);assert.ok(p.code.length>50,p.id);assert.ok(p.system.length>=3,p.id);for(const id of p.families)assert.ok(ids.has(id),id)}});
test('AI curriculum covers 26 topics in six collections with bounded demonstrations',()=>{assert.equal(aiCurriculum.length,26);assert.equal(new Set(aiCurriculum.map(t=>t.id)).size,26);assert.equal(new Set(aiCurriculum.map(t=>t.category)).size,6);for(const t of aiCurriculum){assert.equal(t.flow.length,4,t.id);assert.ok(t.risk.length>40,t.id);for(const id of t.families)assert.ok(ids.has(id),id)}});
test('gradient descent converges on a known line and scalar fusion respects uncertainty',()=>{const points=[0,.2,.4,.6,.8,1].map(x=>({x,y:2*x+1}));const r=trainLine(points,0,0,.1,1000);assert.ok(r.losses.at(-1)<r.losses[0]);assert.ok(Math.abs(r.weight-2)<.001);assert.ok(Math.abs(r.bias-1)<.001);assert.throws(()=>trainLine([],0,0));const f=fuseScalars(5,1,7,2);assert.ok(Math.abs(f.value-5.4)<1e-9);assert.ok(Math.abs(f.sigma-Math.sqrt(.8))<1e-9);assert.equal(f.value,fuseScalars(7,2,5,1).value);assert.throws(()=>fuseScalars(5,0,7,2));assert.equal(sigmoid(0),.5);assert.ok(sigmoid(-2)<sigmoid(2));assert.equal(allowedIntent(' STOP '),'STOP');assert.match(allowedIntent('do something'),/REVIEW/)});
test('five learning paths connect valid guides to thirty explained practice questions',()=>{assert.equal(learningPaths.length,5);assert.equal(assessmentBank.length,5);assert.equal(assessmentBank.reduce((n,q)=>n+q.questions.length,0),30);for(const p of learningPaths){assert.ok(assessmentBank.some(q=>q.id===p.quiz));for(const id of p.ids)assert.equal(hardwareFamilies.find(f=>f.id===id)?.module,p.module,id)}for(const q of assessmentBank)for(const [question,options,answer,why] of q.questions){assert.ok(question.length>20);assert.ok(answer>=0&&answer<options.length);assert.ok(why.length>40)}});
test('legacy entry links and generated practice records preserve integrity',()=>{for(const entry of entries)assert.ok(ids.has(legacyFamilyAliases[entry.id]),entry.id);const svg=practiceCertificate('<Ada & team>','Example assessment',83,'2026-11-12');assert.match(svg,/&lt;Ada &amp; team&gt;/);assert.ok(!svg.includes('<Ada'));assert.match(svg,/not an accredited certification/);assert.match(svg,/83%/)});

test('all 100 added labs use different component arrangements and exercise distinct output behavior', () => {
  const layouts = new Set();
  const behavior = new Set();
  for (const lab of workshopLabs.filter(lab => lab.bench)) {
    const model = distinctLabs[lab.id];
    assert.equal(model.title, lab.title);
    const layout = model.parts.map(part => part.shape).join(' → ');
    assert.ok(!layouts.has(layout), `${lab.id}: repeated arrangement ${layout}`);
    layouts.add(layout);
    const experiment = resolveExperiment(lab.id);
    const ranges = experiment.controls.map(control => [...new Set([control.min, control.initial, control.max])]);
    const samples = ranges[0].flatMap(a => (ranges[1] ?? [model.b]).flatMap(b =>
      Array.from({length: 13}, (_, tick) => experiment.read({a, b}, tick, false).sample)));
    assert.ok(samples.every(Number.isFinite), lab.id);
    assert.ok(new Set(samples).size > 1, `${lab.id}: output never changes`);
    const signature = [model.unit, ...samples].join('|');
    assert.ok(!behavior.has(signature), `${lab.id}: repeated behavior`);
    behavior.add(signature);
  }
  assert.equal(layouts.size, 100);
});
