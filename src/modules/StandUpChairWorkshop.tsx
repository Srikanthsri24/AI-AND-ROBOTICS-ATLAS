import { lazy, Suspense, useState } from 'react';
import { ArrowLeft, ArrowRight, Radio } from 'lucide-react';
import { maxAngle, radioTimeout, speed } from '../data/stand-up-chair.mjs';
import source from '../data/stand-up-chair.mjs?raw';
import { chairProject } from '../data/stand-up-chair-project';
import { download } from './state';
import '../styles/stand-up-chair.css';

const StandUpChairDemo=lazy(()=>import('./StandUpChairDemo'));
const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${chairProject.id}/${paths[index]}`;
const assets=[
  ['RF command panel','3 commands','Raise, Lower and Stop are simulated remote inputs. The control panel can also interrupt the heartbeat.'],
  ['Controller model','1 state machine','A JavaScript module that can run on a Raspberry Pi with Node.js. The same module runs in the browser.'],
  ['Seat, backrest and actuator','1 interactive model','Shows how actuator movement changes the seat angle on the rider-free linkage.'],
  ['Position limit inputs','2 simulated endpoints','Lower and upper limits switch off movement at the configured ends of travel.'],
  ['Trial runner','1 JavaScript file','Checks limits, motion cancellation and RF timeout without real motors or radios.'],
];
const workflow=[
  ['Identify the linkage and endpoints','Open the finished demo at 0°. Find the front pivot and the actuator. Drag the view to see where the actuator joins the seat frame.'],
  ['Connect RF and controller in the model','Route the three remote commands to the controller’s state machine. In the simulator, an established link provides a steady heartbeat.'],
  ['Connect controller and position feedback','Use the drive state to move the geometry. The model reports seat angle and stops drive at its simulated endpoint sensors.'],
  ['Run a fault trial','Raise the seat, interrupt the link before the upper limit, and observe the timeout. Restore the link and check that the mechanism waits for a new command.'],
];

export default function StandUpChairWorkshop({stage}:{stage:number}) {
  const [ready,setReady]=useState<number[]>([]);
  const [step,setStep]=useState(0);
  return <div className="gp-page chair-page">
    <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
    <header className="chair-header"><Radio size={34} aria-hidden="true"/><div><h1>{chairProject.title}</h1><p>{chairProject.outcome}</p></div></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a href={link(index)} key={name} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
    <section className="gp-panel chair-panel" aria-label={stages[stage]}>
      <h2>{stages[stage]}</h2>
      {stage===0&&<div className="chair-grid">
        <section className="chair-card"><h3>What you’ll build</h3><p>A rider-free simulation of the control logic and moving parts. The exercise models radio loss, position limits and manual stops without connecting to a mobility device.</p>
          <ol className="gp-workflow">{workflow.map(([name])=><li key={name}>{name}</li>)}</ol>
          <p><strong>Success check</strong> Reach both limits, hold an intermediate angle with Stop, and confirm that an RF interruption disables drive until you send another command.</p>
        </section>
        <figure className="chair-cover"><img src={chairProject.cover} alt="Rider-free stand-up chair model with raised seat, actuator, and controller bench"/><figcaption>Tabletop test rig · Seat raised and actuator extended</figcaption></figure>
      </div>}
      {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="chair-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="chair-card">
        <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
      </article>)}</div></>}
      {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{workflow.map(([name],index)=><button type="button" key={name} onClick={()=>setStep(index)} aria-pressed={step===index}>{index+1}. {name}</button>)}</nav>
        <div className="chair-card"><h3>{workflow[step][0]}</h3><p>{workflow[step][1]}</p></div>
        <dl className="chair-connections" aria-label="Signal connections">
          <div><dt>RF remote → receiver</dt><dd>Raise, Lower, Stop and heartbeat</dd></div>
          <div><dt>Receiver → Pi controller</dt><dd>Decoded command and link state</dd></div>
          <div><dt>Controller → actuator</dt><dd>Extend, retract or off</dd></div>
          <div><dt>Position limits → controller</dt><dd>Seat angle feedback and end stops</dd></div>
        </dl>
      </>}
      {stage===3&&<div className="chair-grid"><section className="chair-card"><h3>Run the controller trial</h3>
        <p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> A web browser, or Node.js 22 or later on a computer or Raspberry Pi.</p>
        <ol className="gp-program-steps"><li>Save both files in the same folder.</li><li>Run <code>node stand_up_chair_trial.mjs</code>.</li><li>Compare the reported upper limit, manual stop, RF timeout and lower limit with the browser demo.</li></ol>
        <div className="gp-steps"><button className="gp-button" type="button" onClick={()=>download('stand-up-chair.mjs',source)}>Download controller model</button><a className="gp-button gp-secondary" href="./project-files/stand_up_chair_trial.mjs" download>Download trial runner</a></div>
      </section><section className="chair-card"><h3>Expected behavior</h3><p>The model runs at {speed}° per second between 0° and {maxAngle}°. Stop cancels movement. During an RF interruption, motion holds once the {radioTimeout} ms timeout expires or a limit is reached.</p><p>Reconnect and verify that the simulated actuator remains off until a new motion request. These values describe only the classroom model.</p></section></div>}
      {stage===4&&<Suspense fallback={<p role="status">Loading the chair linkage…</p>}><StandUpChairDemo/></Suspense>}
    </section>
    <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
  </div>;
}
