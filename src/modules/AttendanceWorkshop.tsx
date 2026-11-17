import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, ScanFace } from 'lucide-react';
import { faceSamples, imageHeight, imageWidth, matchLimit, minimumMargin, renderFace, roster, runSample, type Match, type Person, type Sample } from '../data/attendance-engine.mjs';
import source from '../data/attendance-engine.mjs?raw';
import { attendanceProject } from '../data/attendance-project';
import { download } from './state';
import '../styles/attendance-workshop.css';

const root = '#/project-builder';
const stages = ['Overview','Components','Assembly','Program & test','Finished demo'];
const routes = ['overview','components','assembly','test','demo'];
const link = (index:number) => `${root}/${attendanceProject.id}/${routes[index]}`;
const workflow = [
  ['Enroll reference portraits','Store one reference image per fictional student. Keep the roster ID separate from the image features.'],
  ['Prepare the incoming image','Read grayscale pixels, crop the portrait using its plain background, and sample 256 image cells. Subtract the background tone so a uniform brightness shift has less effect.'],
  ['Compare candidates','Calculate each reference’s distance from the incoming descriptor. Smaller distances indicate more similar portraits. Send very close candidates to review.'],
  ['Record and check attendance','Write a row only for a clear match. Use the student ID as the key so a repeat scan in the same session leaves the row count fixed.'],
];
const assets = [
  ['Reference roster','3 portraits','Set the fictional identities and their enrollment images.'],
  ['Probe images','5 portraits','Try shifted, brighter, dimmer, ambiguous, and unenrolled examples.'],
  ['Matcher module','1 JavaScript file','Generates the images, describes their pixels, scores candidates, and applies the decision thresholds.'],
  ['Session log','1 CSV export','Record each accepted student ID once per session.'],
  ['Runtime','Browser or Node.js','Use the browser for the workbench and Node.js for repeatable command-line trials.'],
];

function Portrait({person,variant=false}:{person:Person|Sample;variant?:boolean}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const context=canvas.current?.getContext('2d');
    if(!context) return;
    const pixels=renderFace(person.shape,'offset' in person?person.offset:0,'brightness' in person?person.brightness:0);
    const bitmap=context.createImageData(imageWidth,imageHeight);
    for(let i=0;i<pixels.length;i++){
      const gray=pixels[i], index=i*4;
      bitmap.data[index]=gray;
      bitmap.data[index+1]=Math.min(255,gray+10);
      bitmap.data[index+2]=Math.min(255,gray+21);
      bitmap.data[index+3]=255;
    }
    context.putImageData(bitmap,0,0);
  },[person]);
  return <canvas className={variant?'att-portrait att-probe':'att-portrait'} ref={canvas} width={imageWidth} height={imageHeight} role="img" aria-label={`Generated portrait of ${person.name}`}/>;
}

function References({enrolled=roster.map(person=>person.id)}:{enrolled?:string[]}) {
  return <div className="att-references" aria-label="Reference roster">{roster.map(person=><figure key={person.id}>
    <Portrait person={person}/><figcaption><strong>{person.name}</strong><span>{person.id} · {enrolled.includes(person.id)?'Enrolled':'Excluded'}</span></figcaption>
  </figure>)}</div>;
}

function AttendanceDemo() {
  const [sampleId,setSampleId] = useState(faceSamples[0].id);
  const [enrolled,setEnrolled] = useState(roster.map(person=>person.id));
  const [limit,setLimit] = useState(matchLimit);
  const [run,setRun] = useState<Match|null>(null);
  const [log,setLog] = useState<Person[]>([]);
  const [status,setStatus] = useState('Choose a portrait and run a match.');
  const sample = faceSamples.find(item=>item.id===sampleId) ?? faceSamples[0];
  function configure(message='Settings changed. Run the match again.') { setRun(null);setStatus(message); }
  function toggle(id:string) {
    setEnrolled(previous=>previous.includes(id)?previous.filter(value=>value!==id):[...previous,id]);
    configure();
  }
  function scan() {
    const result=runSample(sampleId,roster.filter(person=>enrolled.includes(person.id)),limit);
    setRun(result);
    if(result.status==='unknown') { setStatus('Unknown portrait · Attendance unchanged'); return; }
    if(result.status==='review') { setStatus('Needs review · Two candidates are too close'); return; }
    const person=roster.find(item=>item.id===result.candidates[0].id);
    if(!person) return;
    if(log.some(item=>item.id===person.id)) { setStatus(`${person.name} is already present · Duplicate skipped`); return; }
    setLog([...log,person]);
    setStatus(`${person.name} matched · Attendance recorded`);
  }
  function exportLog() {
    download('attendance-session.csv',['student_id,name,status',...log.map(person=>`${person.id},${person.name},Present`)].join('\n')+'\n');
  }
  return <div className="att-demo">
    <section className="att-card">
      <h3>Scan station</h3>
      <div className="att-station"><Portrait person={sample} variant/><div>
        <label htmlFor="att-sample">Incoming portrait</label>
        <select id="att-sample" value={sampleId} onChange={event=>{setSampleId(event.target.value);configure('Portrait selected. Run the match.');}}>
          {faceSamples.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}
        </select>
        <label htmlFor="att-limit">Maximum match distance <output>{limit.toFixed(2)}</output></label>
        <input id="att-limit" type="range" min=".02" max=".34" step=".01" value={limit} onChange={event=>{setLimit(event.target.valueAsNumber);configure();}}/>
        <button className="gp-button" type="button" onClick={scan}><ScanFace size={18}/> Run match</button>
      </div></div>
      <p className="att-status" role="status">{status}</p>
      <h4>Candidate distances</h4>
      {run?.candidates.length?<ol className="att-scores">{run.candidates.map(candidate=><li key={candidate.id}>
        <span>{candidate.name}</span><meter min={0} max={.5} value={candidate.distance}/><strong>{candidate.distance.toFixed(3)}</strong>
      </li>)}</ol>:<p>{run?'No enrolled reference portraits.':'Run a match to compare scores.'}</p>}
    </section>
    <div className="att-side">
      <section className="att-card"><h3>Reference roster</h3><References enrolled={enrolled}/>
        <div className="gp-steps" aria-label="Reference enrollment">{roster.map(person=><button type="button" key={person.id}
          aria-pressed={enrolled.includes(person.id)} onClick={()=>toggle(person.id)}>{person.name}</button>)}</div>
      </section>
      <section className="att-card"><h3>Session log <small>{log.length} present</small></h3>
        {log.length?<ul className="att-log">{log.map(person=><li key={person.id}><Check size={16}/><strong>{person.name}</strong><span>{person.id} · Present</span></li>)}</ul>:<p>No attendance recorded.</p>}
        <div className="gp-steps"><button type="button" disabled={!log.length} onClick={exportLog}>Export CSV</button>
          <button type="button" onClick={()=>{setLog([]);configure('New session. Attendance log cleared.');}}>Reset session</button></div>
      </section>
    </div>
  </div>;
}

export default function AttendanceWorkshop({stage}:{stage:number}) {
  const [ready,setReady] = useState<number[]>([]);
  const [setup,setSetup] = useState(0);
  return <div className="gp-page att-page">
    <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
    <header className="att-header"><ScanFace size={36} aria-hidden="true"/><div><h1>{attendanceProject.title}</h1><p>{attendanceProject.outcome}</p></div></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((title,index)=><a href={link(index)} key={title} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{title}</a>)}</nav>
    <section className="gp-panel att-panel" aria-label={stages[stage]}>
      <h2>{stages[stage]}</h2>
      {stage===0&&<div className="att-demo"><section className="att-card"><h3>What you’ll build</h3><p>{attendanceProject.outcome} The lesson uses generated grayscale portraits on a plain background and keeps the attendance session in the browser.</p>
        <ol className="gp-workflow">{workflow.map(([title])=><li key={title}>{title}</li>)}</ol>
        <p><strong>Success check</strong> Confirm one clear match, one duplicate, one ambiguous decision and one unknown visitor.</p></section><section className="att-card"><h3>Fictional reference images</h3><References/></section></div>}
      {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="att-assets">{assets.map(([name,quantity,detail],index)=><article className="att-card" key={name}><h3>{name}</h3><strong>{quantity}</strong><p>{detail}</p>
        <button type="button" className="gp-ready" aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(value=>value!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}<span className="att-sr"> {name}</span></button></article>)}</div></>}
      {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{workflow.map(([title],index)=><button type="button" key={title} aria-pressed={index===setup} onClick={()=>setSetup(index)}>{index+1}. {title}</button>)}</nav><div className="att-card"><h3>{workflow[setup][0]}</h3><p>{workflow[setup][1]}</p></div>
        <ol className="att-flow" aria-label="Data connection map">{['Roster and input image','Normalized pixel descriptor','Ranked candidate distances','Attendance log or review'].map(title=><li key={title}>{title}</li>)}</ol></>}
      {stage===3&&<div className="att-demo"><section className="att-card"><h3>Run the same matcher locally</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Node.js and a terminal, or the finished demo in your browser.</p>
        <ol className="gp-program-steps"><li>Download both files into the same folder.</li><li>Run <code>node attendance_runner.mjs cleo</code>. Expect a clear match despite the changed expression.</li><li>Run <code>node attendance_runner.mjs mixed</code> and <code>node attendance_runner.mjs visitor</code>. Expect review and unknown, respectively.</li><li>Run <code>node attendance_runner.mjs cleo 0.02</code>. The stricter threshold rejects the altered image.</li></ol>
        <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('attendance-engine.mjs',source)}><Download size={16}/> Download matcher</button><a className="gp-button gp-secondary" href="./project-files/attendance_runner.mjs" download>Download runner</a></div>
      </section><section className="att-card"><h3>Interpret the decision</h3><p>The matcher computes a distance from the crop size and grayscale grid. Its default maximum distance is {matchLimit}. If the two closest distances differ by less than {minimumMargin}, it asks for review.</p><p>This controlled exercise assumes an aligned synthetic portrait against a plain background. Real classroom images introduce pose, lighting, occlusion, and consent requirements that this exercise does not address.</p></section></div>}
      {stage===4&&<AttendanceDemo/>}
    </section>
    <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a>
      <a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
  </div>;
}
