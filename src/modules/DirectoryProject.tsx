import { DirectoryDemoVisual, MaterialVisual, referenceFor } from './DirectoryVisuals';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw } from 'lucide-react';
import { directoryGuides } from '../data/directory-guides';
import rows from '../data/visionaries-project-list.json';

export type DirectoryEntry = typeof rows[number];
export const directoryProjects = rows.map(entry=>({...entry,id:`directory-${entry.number}`}));

const related: Record<number,[string,string]> = {
  16:['rover-project','Ultrasonic sensing in a rover'],
  18:['model-streetlight','Model streetlight'],
  25:['model-road-junction','Model road junction'],
  35:['rover-project','Obstacle-avoiding robotic car'],
  37:['soil-observer','Soil moisture detector'],
  44:['rover-project','Ultrasonic sensing in a rover'],
  47:['vision-counter','Camera object counter'],
  61:['parking-bay-stop-test','Parking bay stop test'],
  63:['hand-project','Tendon-driven robotic hand'],
  64:['desktop-arm','Desktop servo arm'],
  76:['home-project','Room climate monitor'],
  79:['ambient-light','Automatic night light'],
  93:['soil-observer','Soil moisture detector'],
  105:['vision-counter','Camera object counter'],
};

const stages = [
  ['overview','Overview'], ['components','Components'], ['assembly','Assembly'],
  ['test','Program & test'], ['demo','Finished demo'],
] as const;

export default function DirectoryProject({entry,view}: {entry:DirectoryEntry; view?:string|null}) {
  const guide=directoryGuides[entry.number];
  const relatedBuild=related[entry.number];
  const stage=Math.max(0,stages.findIndex(([id])=>id===view));
  const [ready,setReady]=useState<string[]>([]);
  const [part,setPart]=useState(0);
  const [scenario,setScenario]=useState(0);
  const [phase,setPhase]=useState<number|null>(null);
  const sample=guide.scenarios[scenario];
  const link=(index:number)=>`#/project-builder/directory-${entry.number}/${stages[index][0]}`;
  useEffect(()=>{
    if(stage!==4 || phase===null || phase>=2) return;
    const timer=window.setTimeout(()=>setPhase(phase+1),1150);
    return ()=>window.clearTimeout(timer);
  },[phase,stage]);
  return <article className="gp-page gp-build">
    <a className="gp-back" href="#/project-builder?collection=directory"><ArrowLeft size={16}/> Project directory</a>
    <div className="gp-title">
      <p className="gp-overline">Project {String(entry.number).padStart(2,'0')} · {entry.category}</p>
      <h1>{entry.title}</h1>
      <p>{guide.goal}.</p>
    </div>
    <nav className="gp-stages" aria-label="Project stages">{stages.map(([id,label],index)=>
      <a key={id} href={link(index)} aria-current={stage===index?'step':undefined} onClick={()=>setPhase(null)}><span>{index+1}</span>{label}</a>)}</nav>
    <section className="gp-panel gp-guide">
      {stage===0&&<>
        <h2>What you’ll make</h2>
        <p>{guide.setup}</p>
        <h3>What to look for</h3>
        <p>Compare two cases. When the input is “{guide.scenarios[0].input},” look for “{guide.scenarios[0].result}.” Then change the input and see how the result changes.</p>
        {relatedBuild&&<p><a className="gp-button gp-secondary" href={`#/project-builder/${relatedBuild[0]}/overview`}>{relatedBuild[1]} <ArrowRight size={16}/></a></p>}
      </>}
      {stage===1&&<>
        <h2>Materials and tools</h2>
        <p role="status">{ready.length} of {guide.materials.length} ready</p>
        <div className="gp-parts">{guide.materials.map(material=><article key={material} className={ready.includes(material)?'selected':undefined}>
          <MaterialVisual material={material}/><h3>{material}</h3><button className="gp-ready" aria-pressed={ready.includes(material)} onClick={()=>setReady(previous=>previous.includes(material)?previous.filter(item=>item!==material):[...previous,material])}>
            {ready.includes(material)?<><Check size={16}/> Ready</>:'Mark ready'}
          </button>
        </article>)}</div>
      </>}
      {stage===2&&<>
        <h2>Set up the project</h2>
        <div className="gp-split"><div><ol className="gp-workflow">
          <li>Gather the materials and prepare a place to record both results.</li>
          <li>{guide.setup}</li>
          <li>Label the input and output. Set up the first case, “{guide.scenarios[0].input},” before changing anything.</li>
        </ol>
        <h3>Inspect a component</h3>
        <div className="gp-steps">{guide.materials.map((material,index)=><button key={material} aria-pressed={index===part} onClick={()=>setPart(index)}>{material}</button>)}</div>
        </div><div className="gp-part-preview">
          <h3>{guide.materials[part]}</h3>
          {referenceFor(guide.materials[part])&&<p>Rotate the representative part to inspect it.</p>}
          <MaterialVisual material={guide.materials[part]} showModel/>
        </div></div>
      </>}
      {stage===3&&<>
        <h2>Program the rule and test it</h2>
        <p>Use these rules in a classroom model or as a starting point for code. Predict the outcome before running each case.</p>
        <pre><code>{guide.scenarios.map(item=>`WHEN ${item.input}
  EXPECT ${item.result}`).join('\n\n')}</code></pre>
        <h3>Check your result</h3><ol>{guide.scenarios.map(item=><li key={item.input}>Try <strong>{item.input}</strong>. Expected result is <strong>{item.result}</strong>.</li>)}</ol>
        <p>Record what happened. If it differs from the expectation, change one part of your setup and repeat the test.</p>
      </>}
      {stage===4&&<>
        <h2>Walk through the result</h2>
        <p>Choose a case and play the sequence to follow it from input to output.</p>
        <div className="gp-steps" role="group" aria-label="Demo case">{guide.scenarios.map((item,index)=>
          <button key={item.input} aria-pressed={index===scenario} onClick={()=>{setScenario(index);setPhase(null);}}>{item.input}</button>)}</div>
        <DirectoryDemoVisual number={entry.number} scenario={scenario} phase={phase} input={sample.input} result={sample.result}/>
        <div className="gp-directory-flow" aria-live="polite">
          {['Input','Project checks the input','Expected output'].map((label,index)=><div key={label} data-current={phase===index} data-seen={phase!==null&&phase>=index}>
            <span>{label}</span><strong>{phase!==null&&phase>=index?[sample.input,guide.goal,sample.result][index]:'Waiting'}</strong>
          </div>)}
        </div>
        <button className="gp-button" disabled={phase!==null&&phase<2} onClick={()=>setPhase(0)}>
          {phase===2?<RotateCcw size={16}/>:<Play size={16}/>} {phase===2?'Replay demo':phase===null?'Play demo':'Playing demo'}
        </button>
      </>}
    </section>
    <div className="gp-footer">
      <a className="gp-button gp-secondary" href={stage===0?'#/project-builder?collection=directory':link(stage-1)}><ArrowLeft size={16}/>{stage===0?'Project directory':stages[stage-1][1]}</a>
      <a className="gp-button" href={stage===4?'#/project-builder?collection=directory':link(stage+1)}>{stage===4?'Choose another project':stages[stage+1][1]}<ArrowRight size={16}/></a>
    </div>
  </article>;
}
