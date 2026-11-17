import { useState } from 'react';
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';
import { cohortCsv, predict, report, tests, training } from '../data/phone-cohorts.mjs';
import source from '../data/phone-cohorts.mjs?raw';
import { phoneCohortProject } from '../data/phone-cohort-project';
import { download } from './state';
import '../styles/phone-cohort.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${phoneCohortProject.id}/${paths[index]}`;
const steps=[
 ['Define the fictional inputs','Give each invented profile a media index and a call index from 0 to 100. The generator assigns an age-band label for the exercise.'],
 ['Separate training and evaluation','Use nine labeled profiles as reference points and keep nine different profiles for evaluation. Each evaluation group has three examples.'],
 ['Compare the nearest reference','Compute Euclidean distance from the sample’s two inputs to the available training profiles. The nearest reference supplies the predicted band.'],
 ['Audit group results','Compare correct predictions per group with and without the 50+ training examples. Raise the minimum group size from three to four and verify that all three result cells are withheld.'],
];
const assets=[
 ['Training profiles','9 rows','Reference points across three fictional age bands.'],
 ['Held-out profiles','9 rows','Separate records for testing and group comparisons.'],
 ['Two usage features','0–100 indices','Synthetic media and call activity values.'],
 ['Nearest-reference classifier','1 JavaScript file','Calculates distance and summarizes group accuracy.'],
 ['Group reporting rule','2 thresholds','Show results only when the group meets the selected minimum count.'],
];

function Results({skewed,minimum}:{skewed:boolean;minimum:number}){
 const rows=report(skewed,minimum);
 return <section className="pc-card pc-results" aria-label="Evaluation by age band">
  <h3>Held-out group results</h3>
  <table><thead><tr><th scope="col">Fictional band</th><th scope="col">Profiles</th><th scope="col">Correct</th></tr></thead><tbody>
   {rows.map(row=><tr key={row.group}><th scope="row">{row.group}</th><td>{row.count}</td><td>{row.correct===null?'Withheld':<><span>{row.correct} of {row.count}</span><meter min={0} max={row.count} value={row.correct} aria-label={`${row.group} correct predictions`}/></>}</td></tr>)}
  </tbody></table><p>Accuracy figures are calculated from the fictional holdout set. Withheld cells fall below the selected minimum group size.</p>
 </section>;
}
function CohortDemo(){
 const [skewed,setSkewed]=useState(false);
 const [minimum,setMinimum]=useState(3);
 const [selected,setSelected]=useState(tests[6].id);
 const [scored,setScored]=useState(false);
 const profile=tests.find(row=>row.id===selected)!;
 const result=scored?predict(profile,skewed):null;
 return <div className="pc-grid">
  <section className="pc-card"><h3>Test a fictional profile</h3><p>Select a training set, then classify a held-out sample. The group report evaluates all nine samples under the same setting.</p>
   <div className="gp-steps" role="group" aria-label="Training set">
    <button type="button" aria-pressed={!skewed} onClick={()=>{setSkewed(false);setScored(false);}}>Balanced training</button>
    <button type="button" aria-pressed={skewed} onClick={()=>{setSkewed(true);setScored(false);}}>Remove 50+ references</button>
   </div>
   <label htmlFor="pc-profile">Held-out example</label>
   <select id="pc-profile" value={selected} onChange={event=>{setSelected(event.target.value);setScored(false);}}>{tests.map(row=><option key={row.id} value={row.id}>{row.id} · band {row.group}</option>)}</select>
   <div className="pc-inputs"><span>Media index <strong>{profile.media}</strong></span><span>Call index <strong>{profile.calls}</strong></span></div>
   <button className="gp-button" type="button" onClick={()=>setScored(true)}>Classify profile</button>
   <p className="pc-status" role="status">{result?`Predicted ${result.group} · Reference ${profile.group} · ${result.group===profile.group?'Correct':'Misclassified'}`:'Ready to classify the selected profile.'}</p>
   {result&&<p>Closest training profile {result.id} · Distance {result.distance.toFixed(1)}</p>}
   <label htmlFor="pc-minimum">Minimum profiles for group reporting</label>
   <select id="pc-minimum" value={minimum} onChange={event=>setMinimum(Number(event.target.value))}><option value="3">3 profiles</option><option value="4">4 profiles</option></select>
  </section>
  <Results skewed={skewed} minimum={minimum}/>
 </div>;
}
export default function PhoneCohortWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page pc-page">
  <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
  <header className="pc-header"><Smartphone size={34} aria-hidden="true"/><div><h1>{phoneCohortProject.title}</h1><p>{phoneCohortProject.outcome}</p></div></header>
  <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
  <section className="gp-panel pc-panel" aria-label={stages[stage]}><h2>{stages[stage]}</h2>
   {stage===0&&<div className="pc-grid"><section className="pc-card"><h3>What you’ll build</h3><p>A toy classifier for fictional phone usage profiles. Compare predictions with the labels built into the example dataset, then study how missing examples change the group results.</p>
    <ol className="gp-workflow">{steps.map(([name])=><li key={name}>{name}</li>)}</ol>
    <p><strong>Success check</strong> Show a 50+ example changing prediction when its group is removed. Withhold aggregate results when the minimum group size exceeds the available sample count.</p>
   </section><Results skewed={false} minimum={3}/></div>}
   {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="pc-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="pc-card">
    <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
   </article>)}</div><section className="pc-card"><h3>Example training profiles</h3>
    <table><thead><tr><th scope="col">ID</th><th scope="col">Band</th><th scope="col">Media</th><th scope="col">Calls</th></tr></thead><tbody>{training.map(row=><tr key={row.id}><th scope="row">{row.id}</th><td>{row.group}</td><td>{row.media}</td><td>{row.calls}</td></tr>)}</tbody></table>
    <button className="gp-button gp-secondary" type="button" onClick={()=>download('phone_cohorts.csv',cohortCsv,'text/csv')}>Download synthetic CSV</button></section></>}
   {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{steps.map(([name],index)=><button type="button" key={name} aria-pressed={index===step} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
    <div className="pc-card"><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div><ol className="pc-flow" aria-label="Data connection map">{['Fictional training and test profiles','Nearest-reference classification','Correct counts by test band','Minimum group-size rule'].map(item=><li key={item}>{item}</li>)}</ol></>}
   {stage===3&&<div className="pc-grid"><section className="pc-card"><h3>Run the local trial</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Browser or Node.js and a terminal.</p>
    <ol className="gp-program-steps"><li>Save both files in one folder.</li><li>Run <code>node phone_cohort_trial.mjs</code>.</li><li>Expect 3 of 3 correct for the 50+ group with its references included and 0 of 3 after they are removed.</li><li>With a threshold of four, expect all three correctness counts to be withheld.</li></ol>
    <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('phone-cohorts.mjs',source)}>Download classifier</button><a className="gp-button gp-secondary" href="./project-files/phone_cohort_trial.mjs" download>Download trial runner</a></div>
   </section><section className="pc-card"><h3>Interpret the result</h3><p>The example relationships were chosen by the dataset author. The exercise uses only generated profiles and measures accuracy only on its fictional holdout set.</p><p>Withholding a small group’s score is an example reporting rule. An aggregate reporting threshold alone does not make a real dataset anonymous.</p></section></div>}
   {stage===4&&<CohortDemo/>}
  </section>
  <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
