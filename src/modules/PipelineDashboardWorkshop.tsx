import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, Check, Clock3, Database, Download, Layers3, Play, ShieldCheck } from 'lucide-react';
import fixture from '../data/pipeline-dashboard-fixtures.json';
import { resultStatus, reviewResult, runInference, staleAfterSeconds, type PipelineResult } from '../data/pipeline-dashboard-engine.mjs';
import engineSource from '../data/pipeline-dashboard-engine.mjs?raw';
import { pipelineProject } from '../data/pipeline-dashboard-project';
import { download } from './state';
import '../styles/pipeline-dashboard.css';

const names=['Overview','Components','Assembly','Program & test','Finished demo'];
const routes=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(stage:number)=>`${root}/${pipelineProject.id}/${routes[stage]}`;
const start=Date.parse(fixture.clock);
const time=(value:number)=>new Date(value).toISOString().slice(11,19)+' UTC';
const percent=(value:number)=>`${(value*100).toFixed(1)}%`;
const assets=[
  {title:'Sample telemetry and model', filename:'pipeline-dashboard-fixtures.json', description:'Four fictional source readings, a fixed replay clock and model coefficients.', source:JSON.stringify(fixture,null,2)+'\n'},
  {title:'Inference engine', filename:'pipeline-dashboard-engine.mjs', description:'Validates readings, computes a model score and checks freshness before review.', source:engineSource},
  {title:'Verification script', filename:'check-pipeline-dashboard.mjs', description:'Checks expected labels, the freshness boundary and which results can be reviewed.'},
];
const flow=[
  {label:'Ingest', description:'Capture vibration, temperature, source and sample time.', icon:Database},
  {label:'Infer', description:'Run the fixed classifier on validated sensor values.', icon:Layers3},
  {label:'Review', description:'Compare the result with its source and freshness.', icon:ShieldCheck},
];

function AssetDownload({asset}:{asset:(typeof assets)[number]}) {
  return asset.source
    ? <button className="gp-button gp-secondary" type="button" onClick={()=>download(asset.filename,asset.source)}><Download size={16}/>Download {asset.filename}</button>
    : <a className="gp-button gp-secondary" href={`./project-files/${asset.filename}`} download><Download size={16}/>Download {asset.filename}</a>;
}

function PipelineArt() {
  return <div className="pd-art">
    <h3><Activity size={21}/>Motor telemetry pipeline</h3>
    <ol>{flow.map(({label,description,icon:Icon})=><li key={label}><Icon size={24}/><strong>{label}</strong><span>{description}</span></li>)}</ol>
  </div>;
}

export default function PipelineDashboardWorkshop({stage}:{stage:number}) {
  const [ready,setReady]=useState<string[]>([]);
  const [scenarioId,setScenarioId]=useState(fixture.scenarios[0].id);
  const [clock,setClock]=useState(start);
  const [results,setResults]=useState<PipelineResult[]>([]);
  const [currentId,setCurrentId]=useState(0);
  const [notice,setNotice]=useState('Replay a sample to run the classifier.');
  const heading=useRef<HTMLHeadingElement>(null);
  const scenario=fixture.scenarios.find(item=>item.id===scenarioId)!;
  const current=results.find(item=>item.id===currentId);
  const status=current?resultStatus(current,clock):undefined;
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});});
    return ()=>cancelAnimationFrame(frame);
  },[stage]);

  function replay() {
    const capturedAt=clock-(start-Date.parse(scenario.reading.capturedAt));
    const result=runInference({...scenario.reading,capturedAt:new Date(capturedAt).toISOString()},fixture.model,clock,(results.at(-1)?.id??0)+1);
    setResults([...results,result]);
    setCurrentId(result.id);
    const freshness=resultStatus(result,clock);
    setNotice(result.error ?? (freshness==='Stale'?'Prediction received from a stale sample. Replay a fresh scenario before review.':'Prediction ready for review.'));
  }

  function review() {
    if(!current||status!=='Fresh') return;
    const reviewed=reviewResult(current,clock);
    setResults(results.map(result=>result.id===reviewed.id?reviewed:result));
    setNotice(`Result ${reviewed.id} reviewed.`);
  }

  return <div className="gp-page gp-build pd-page">
    <a className="gp-back" href={root}><ArrowLeft size={16}/>All projects</a>
    <header className="gp-title"><h1>{pipelineProject.title}</h1><p>{pipelineProject.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">{names.map((name,i)=><a key={name} href={link(i)} aria-current={i===stage?'step':undefined}><span>{i+1}</span>{name}</a>)}</nav>
    <section className="gp-panel" aria-labelledby="pd-stage">
      <h2 id="pd-stage" ref={heading} tabIndex={-1}>{names[stage]}</h2>
      {stage===0&&<div className="gp-split">
        <PipelineArt/>
        <div className="gp-guide">
          <h3>Trace a prediction from sensor to dashboard</h3>
          <p>Run a small classifier on sample motor readings. The dashboard keeps the raw input, model version and capture time visible beside the recommendation.</p>
          <ol><li>Replay a steady and a warm, vibrating reading.</li><li>Compare a delayed reading and a reading with a missing sensor value.</li><li>Review a fresh result and advance the clock until the same sample becomes stale.</li></ol>
          <div className="gp-check"><Check size={19}/><div><strong>Success criteria</strong><p>Fresh results can be reviewed. Delayed samples show their age and missing inputs produce an error. Every result can be traced to its source.</p></div></div>
        </div>
      </div>}
      {stage===1&&<div className="gp-guide">
        <p>{ready.length} of {assets.length} assets ready.</p>
        <div className="pd-assets">{assets.map(asset=><article key={asset.filename} className={ready.includes(asset.filename)?'pd-ready':undefined}>
          <h3>{asset.title}</h3><p>{asset.description}</p>
          <AssetDownload asset={asset}/>
          <button className="gp-button gp-secondary" type="button" aria-label={`Mark ${asset.title} ready`} aria-pressed={ready.includes(asset.filename)}
            onClick={()=>setReady(list=>list.includes(asset.filename)?list.filter(name=>name!==asset.filename):[...list,asset.filename])}>{ready.includes(asset.filename)?'Ready':'Mark ready'}</button>
        </article>)}</div>
      </div>}
      {stage===2&&<div className="gp-split">
        <div className="gp-guide">
          <h3>Connect the pipeline stages</h3>
          <ol>
            <li><strong>Choose a source.</strong> Open the JSON fixture and find the capture time, source label and two sensor fields.</li>
            <li><strong>Set the model.</strong> Use the included versioned classifier. It combines vibration and temperature into a score between 0 and 1 using a sigmoid.</li>
            <li><strong>Store the result.</strong> Keep the original reading, model ID and inference time together. Display the score and decision only for valid input.</li>
            <li><strong>Apply the review rule.</strong> Sample age comes from capture time. After {staleAfterSeconds} seconds, keep the prediction visible and mark it stale.</li>
          </ol>
        </div>
        <div className="gp-table"><table><caption>Input and output map</caption>
          <thead><tr><th scope="col">Input</th><th scope="col">Output</th></tr></thead>
          <tbody>
            <tr><td>Source, timestamp, vibration, temperature</td><td>Validated reading or input error</td></tr>
            <tr><td>Validated reading and model coefficients</td><td>Score, prediction and model ID</td></tr>
            <tr><td>Sample timestamp and replay clock</td><td>Fresh or stale result</td></tr>
            <tr><td>Fresh result and reviewer action</td><td>Review timestamp</td></tr>
          </tbody>
        </table></div>
      </div>}
      {stage===3&&<div className="gp-guide">
        <div className="gp-program-meta"><div><span>Language</span><strong>JavaScript and JSON</strong></div><div><span>Tools</span><strong>Browser, text editor and optional Node.js</strong></div></div>
        <div className="gp-program-grid">
          <section className="gp-program-card"><h3>Run four browser trials</h3>
            <ol className="gp-program-steps">
              <li>Replay Steady motor. Expect Continue observation and a fresh result.</li>
              <li>Replay Warm, vibrating motor. Expect Inspect motor and a higher score. Mark it reviewed.</li>
              <li>Advance the clock by 60 seconds. The result becomes stale while its review timestamp remains in the history.</li>
              <li>Replay Delayed reading and Missing sensor value. Expect a stale prediction for the first and an invalid input error for the second.</li>
            </ol>
          </section>
          <section className="gp-program-card"><h3>Verify the engine from the command line</h3>
            <p>Save all three downloads to one folder. Open a terminal there and run:</p>
            <pre tabIndex={0}><code>node check-pipeline-dashboard.mjs</code></pre>
            <p>The script checks both decisions and the 30-second boundary. The model coefficients were chosen for this classroom example. Its score is useful for comparing the sample readings.</p>
            <div className="pd-actions">{assets.map(asset=><AssetDownload key={asset.filename} asset={asset}/>)}</div>
          </section>
        </div>
      </div>}
      {stage===4&&<div className="pd-demo gp-guide">
        <div className="pd-top"><div><Activity size={23}/><h3>Motor triage</h3></div><span><Clock3 size={17}/>{time(clock)}</span></div>
        <div className="pd-controls">
          <label>Telemetry scenario<select value={scenarioId} onChange={event=>setScenarioId(event.target.value)}>
            {fixture.scenarios.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
          <div className="pd-actions">
            <button type="button" className="gp-button" onClick={replay}><Play size={16}/>Replay and predict</button>
            <button type="button" className="gp-button gp-secondary" onClick={()=>{setClock(value=>value+60_000);setNotice('Clock advanced by 60 seconds. Check the sample age.');}}>Advance 60 seconds</button>
            <button type="button" className="gp-button gp-secondary" onClick={()=>{setResults([]);setCurrentId(0);setClock(start);setScenarioId(fixture.scenarios[0].id);setNotice('Replay reset.');}}>Reset replay</button>
          </div>
        </div>
        <p className="pd-notice" role="status">{notice}</p>
        {current&&status&&<section className="pd-result" aria-label="Selected pipeline result">
          <div className="pd-decision">
            <div className="pd-result-heading"><h3>{current.prediction??'Input error'}</h3><span className={`pd-status pd-${status.toLowerCase()}`}>{status}</span></div>
            {typeof current.score==='number'?<>
              <label htmlFor="result-score">Inspection score <strong>{percent(current.score)}</strong></label>
              <meter id="result-score" min={0} max={1} value={current.score}>{percent(current.score)}</meter>
              <p>Inspect at {percent(fixture.model.threshold)} or higher.</p>
            </>:<p>{current.error}</p>}
            <p className="pd-review"><ShieldCheck size={17}/>{current.reviewedAt!==undefined?`Reviewed at ${time(current.reviewedAt)}`:status==='Fresh'?'Awaiting review':'Review unavailable'}</p>
            <div className="pd-actions">
              <button type="button" className="gp-button" disabled={status!=='Fresh'||current.reviewedAt!==undefined} onClick={review}>Mark reviewed</button>
              <button type="button" className="gp-button gp-secondary" onClick={()=>download(`pipeline-result-${current.id}.json`,JSON.stringify({...current,status},null,2)+'\n','application/json')}><Download size={16}/>Export result JSON</button>
            </div>
          </div>
          <section className="pd-source"><h3>Source and model</h3>
            <dl>
              <div><dt>Source</dt><dd>{current.reading.source}</dd></div>
              <div><dt>Vibration</dt><dd>{current.reading.vibration===null?'Missing':`${current.reading.vibration} mm/s`}</dd></div>
              <div><dt>Temperature</dt><dd>{current.reading.temperature===null?'Missing':`${current.reading.temperature} °C`}</dd></div>
              <div><dt>Captured</dt><dd>{time(current.observed)} · {(clock-current.observed)/1000}s old</dd></div>
              <div><dt>Model run</dt><dd>{current.modelId} · {time(current.generatedAt)}</dd></div>
            </dl>
          </section>
        </section>}
        {!!results.length&&<div className="gp-table pd-history"><table>
          <caption>Replay history</caption>
          <thead><tr><th scope="col">Result</th><th scope="col">Source</th><th scope="col">Prediction</th><th scope="col">Freshness</th><th scope="col">Review</th></tr></thead>
          <tbody>{results.slice().reverse().map(result=><tr key={result.id}>
            <td><button type="button" className="gp-button gp-secondary" aria-pressed={currentId===result.id} onClick={()=>{setCurrentId(result.id);setNotice(`Showing result ${result.id}.`);}}>Run {result.id}</button></td>
            <td>{result.reading.source}</td><td>{result.prediction??'Input error'}</td><td>{resultStatus(result,clock)}</td><td>{result.reviewedAt!==undefined?'Reviewed':resultStatus(result,clock)==='Fresh'?'Pending':'Unavailable'}</td>
          </tr>)}</tbody>
        </table></div>}
      </div>}
    </section>
    <nav className="gp-footer" aria-label="Stage navigation">
      {stage>0?<a className="gp-button gp-secondary" href={link(stage-1)}><ArrowLeft size={16}/>{names[stage-1]}</a>:<span/>}
      {stage<4&&<a className="gp-button" href={link(stage+1)}>{names[stage+1]}<ArrowRight size={16}/></a>}
    </nav>
  </div>;
}
