import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChartNoAxesCombined } from 'lucide-react';
import { attritionCsv, evaluate, heldOut, predict } from '../data/attrition.mjs';
import source from '../data/attrition.mjs?raw';
import { attritionProject } from '../data/attrition-project';
import { download } from './state';
import '../styles/attrition-workshop.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${attritionProject.id}/${paths[index]}`;
const steps=[
 ['Prepare two inputs','Use inactive days and support tickets recorded before the fictional customer outcome. Scale them by 30 and 5 respectively in this exercise.'],
 ['Fit on training records','Fit logistic regression on 12 fictional examples. Gradient descent adjusts the two weights and intercept. Keep the eight test records separate.'],
 ['Score the held-out records','Use the same trained model to produce a risk score between zero and one for each test profile.'],
 ['Apply a threshold','Flag scores at or above the chosen threshold. Compare the flag with the recorded outcome and tally four results. Changing the threshold leaves the scores fixed.'],
];
const assets=[
 ['Training CSV rows','12 profiles','Two input features and a fictional departure label.'],
 ['Held-out CSV rows','8 profiles','Four departures and four customers who stayed.'],
 ['Logistic classifier','3 weights','Fit an intercept and one weight per input feature.'],
 ['Threshold and outcome grid','4 counts','Track flagged departures, misses, unnecessary alerts and correctly cleared profiles.'],
 ['Trial runner','1 JavaScript file','Print the outcome counts at thresholds of 25%, 50% and 75%.'],
];
const percent=(value:number)=>(value*100).toFixed(1)+'%';
function OutcomeGrid({threshold}:{threshold:number}){
 const result=evaluate(threshold);
 return <div className="ca-outcomes" aria-label="Held-out outcomes">
  {([['Departures caught',result.hits],['Departures missed',result.missed],['False alerts',result.falseAlerts],['Correctly cleared',result.clear]] as const).map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}
 </div>;
}
function AttritionDemo(){
 const [threshold,setThreshold]=useState(.5);
 const [profileId,setProfileId]=useState('E3');
 const [idle,setIdle]=useState(15);
 const [tickets,setTickets]=useState(2);
 const reference=heldOut.find(row=>row.id===profileId);
 const risk=predict({idle,tickets});
 function select(id:string){
  setProfileId(id);
  const row=heldOut.find(item=>item.id===id);
  if(row){setIdle(row.idle);setTickets(row.tickets);}
 }
 return <div className="ca-grid">
  <section className="ca-card"><h3>Score a fictional customer</h3>
   <label htmlFor="ca-profile">Customer profile</label><select id="ca-profile" value={profileId} onChange={event=>select(event.target.value)}>{heldOut.map(row=><option key={row.id} value={row.id}>Held-out {row.id}</option>)}<option value="custom">Custom profile</option></select>
   <label className="ca-range" htmlFor="ca-idle"><span>Inactive days</span><output>{idle}</output><input id="ca-idle" type="range" min={0} max={30} value={idle} onChange={event=>{setProfileId('custom');setIdle(event.target.valueAsNumber);}}/></label>
   <label className="ca-range" htmlFor="ca-tickets"><span>Support tickets</span><output>{tickets}</output><input id="ca-tickets" type="range" min={0} max={5} value={tickets} onChange={event=>{setProfileId('custom');setTickets(event.target.valueAsNumber);}}/></label>
   <div className="ca-score" role="status"><strong>{percent(risk)} risk score</strong><span>{risk>=threshold?'Flagged':'Below threshold'}{reference?` · Recorded outcome: ${reference.left?'Left':'Stayed'}`:''}</span></div>
  </section>
  <section className="ca-card" aria-label="Threshold evaluation"><h3>Evaluate the threshold</h3>
   <label className="ca-range" htmlFor="ca-threshold"><span>Flag threshold</span><output>{Math.round(threshold*100)}%</output><input id="ca-threshold" type="range" min={10} max={90} value={Math.round(threshold*100)} onChange={event=>setThreshold(event.target.valueAsNumber/100)}/></label>
   <div className="gp-steps" aria-label="Threshold presets">{[.25,.5,.75].map(value=><button key={value} type="button" aria-pressed={value===threshold} onClick={()=>setThreshold(value)}>{value*100}% threshold</button>)}</div>
   <OutcomeGrid threshold={threshold}/>
   <p>Counts come from all eight held-out profiles. Lower thresholds flag more profiles while the model keeps each score fixed.</p>
  </section>
 </div>;
}

export default function AttritionWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page ca-page">
  <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
  <header className="ca-header"><ChartNoAxesCombined size={34} aria-hidden="true"/><div><h1>{attritionProject.title}</h1><p>{attritionProject.outcome}</p></div></header>
  <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
  <section className="gp-panel ca-panel" aria-label={stages[stage]}><h2>{stages[stage]}</h2>
   {stage===0&&<div className="ca-grid"><section className="ca-card"><h3>What you’ll build</h3><p>Fit a two-feature logistic model and evaluate its decisions on fictional customers. The exercise focuses on which mistakes each threshold makes.</p>
    <ol className="gp-workflow">{steps.map(([name])=><li key={name}>{name}</li>)}</ol>
    <p><strong>Success check</strong> Lower the threshold and explain why the same scores produce fewer missed departures and more false alerts.</p>
   </section><section className="ca-card ca-cover" aria-label="Attrition preview"><h3>50% decision threshold</h3><OutcomeGrid threshold={.5}/><p>Eight fictional test customers</p></section></div>}
   {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="ca-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="ca-card">
    <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
   </article>)}</div><button type="button" className="gp-button gp-secondary" onClick={()=>download('attrition_samples.csv',attritionCsv,'text/csv')}>Download fictional CSV</button></>}
   {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{steps.map(([name],index)=><button type="button" key={name} aria-pressed={index===step} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
    <div className="ca-card"><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div><ol className="ca-flow" aria-label="Data connection map">{['Training features and labels','Fitted logistic weights','Held-out risk scores','Threshold and outcome counts'].map(item=><li key={item}>{item}</li>)}</ol></>}
   {stage===3&&<div className="ca-grid"><section className="ca-card"><h3>Run the model trial</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Browser or Node.js and a terminal.</p>
    <ol className="gp-program-steps"><li>Save both files to one folder.</li><li>Run <code>node attrition_trial.mjs</code>.</li><li>Check the three thresholds. Misses should be 0, 1 and 2. False alerts should be 2, 1 and 0.</li><li>In the demo, compare E3 at 25% and 50%. Only the decision should change.</li></ol>
    <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('attrition.mjs',source)}>Download model</button><a className="gp-button gp-secondary" href="./project-files/attrition_trial.mjs" download>Download trial runner</a></div>
   </section><section className="ca-card"><h3>Interpret the scores</h3><p>Logistic regression turns a weighted sum into a score between zero and one. The scores in this lesson come from a tiny fictional dataset. The eight outcomes illustrate threshold trade-offs without establishing reliable probabilities for real customers.</p></section></div>}
   {stage===4&&<AttritionDemo/>}
  </section>
  <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
