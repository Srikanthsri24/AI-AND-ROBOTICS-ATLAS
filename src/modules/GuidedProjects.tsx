import DirectoryProject, { directoryProjects } from './DirectoryProject';
import ProjectScenario from './ProjectScenario';
import { configureProjectSource, expandProjects, expansionDemo, type ExpansionInfo } from '../data/project-expansion';
import { demoReadings, projectStories } from '../data/project-stories';
import { projectPartPhotos } from '../data/project-part-photos';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Activity, Check, ChevronRight, Plus, ListChecks, Play, Square, Wrench } from 'lucide-react';
import { guidedProjects } from '../data/guided-projects';
import { download } from './state';
import { projectPrograms, programWalkthroughs } from '../data/project-programs';
import '../styles/guided-projects.css';

const ProjectDemo = lazy(() => import('./ProjectDemo'));
const ProjectPartView = lazy(() => import('./ProjectDemo').then(module => ({ default: module.ProjectPartView })));
const stages = ['Overview','Components','Assembly','Program & test','Finished demo'];
const routes = ['overview','components','assembly','test','demo'];
const image = (id: string) => `./images/blueprint-illustrations/${id}.webp`;
const projectArtwork = (id:string) => `./images/project-covers/${id}.webp`;
const root = '#/project-builder';
const link = (id: string, stage = 0) => `${root}/${id}/${routes[stage]}`;
const groups = ['Robotics','Robotics','Environment','Environment','Electronics','Electronics','Electronics','Mechanisms','Robotics','Computer vision'];

const expanded = expandProjects(guidedProjects);
const catalog = [
  ...guidedProjects.map((project,index)=>({project,category:groups[index],art:project.id,info:undefined})),
  ...expanded.map(({project,info})=>({project,category:info.category,art:info.template,info})),
];
const categories = [...new Set(catalog.map(item=>item.category))];
const pageSize = 12;

export default function GuidedProjects({id, view}: {id?: string | null;view?: string | null}) {
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('');
  const [page,setPage] = useState(0);
  const directorySelected = new URLSearchParams(location.hash.split('?')[1]).get('collection')==='directory';
  const [collection,setCollection] = useState(directorySelected?'directory':'guided');
  const directoryEntry=directoryProjects.find(entry=>entry.id===id);
  const directory=collection==='directory';
  const directoryCategories=[...new Set(directoryProjects.map(entry=>entry.category))];
  const item = catalog.find(entry=>entry.project.id===id);
  const matches = catalog.filter(entry=>(!category || entry.category===category)
    && `${entry.project.title} ${entry.project.outcome} ${entry.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const directoryMatches=directoryProjects.filter(entry=>(!category||category===entry.category)
    && `${entry.number} ${String(entry.number).padStart(2,'0')} ${entry.title} ${entry.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const count=directory?directoryMatches.length:matches.length;
  useEffect(()=>{
    if(!directorySelected) return;
    setCollection('directory');setCategory('');setPage(0);setQuery('');
  },[directorySelected]);
  if(directoryEntry) return <DirectoryProject key={directoryEntry.id} entry={directoryEntry} view={view}/>;
  const stage = Math.max(0,routes.indexOf(view ?? 'overview'));
  return item ? <Build key={item.project.id} project={item.project} stage={stage} art={item.art} expansion={item.info}/> : <div className="gp-page">
    <header className="gp-hero" style={{backgroundImage:`linear-gradient(90deg,#112039 32%,#11203931), url(${image('rover-project')})`}}>
      <span className="gp-overline">Atlas workshop</span>
      <h1>Project Builder</h1>
      <p>Choose a project, gather the parts, and follow the build from first connection to finished demo.</p>
    </header>
    <div className="gp-section-heading"><h2>Choose a project</h2><span>{catalog.length+directoryProjects.length} entries</span></div>
    <div className="gp-steps" role="group" aria-label="Project collection">
      {[['guided',`Guided builds (${catalog.length})`],['directory',`VisionariesAI project directory (${directoryProjects.length})`]].map(([key,label])=>
        <button key={key} aria-pressed={collection===key} onClick={()=>{setCollection(key);setCategory('');setPage(0);setQuery('');}}>{label}</button>)}
    </div>
    <div className="gp-catalog-controls">
      <label>Search projects<input type="search" value={query} placeholder="Try soil, gears, or camera" onChange={event=>{setQuery(event.target.value);setPage(0);}}/></label>
      <label>Category<select value={category} onChange={event=>{setCategory(event.target.value);setPage(0);}}><option value="">All categories</option>{(directory?directoryCategories:categories).map(name=><option key={name}>{name}</option>)}</select></label>
    </div>
    <p role="status">{count? `Showing ${page*pageSize+1}–${Math.min((page+1)*pageSize,count)} of ${count} projects` : 'No projects match these filters.'}</p>
    <div className="gp-gallery">
      {directory ? directoryMatches.slice(page*pageSize,(page+1)*pageSize).map(entry=><a className="gp-card" key={entry.id} href={link(entry.id)}>
        <div><span className="gp-overline">Project {String(entry.number).padStart(2,'0')}</span><h3>{entry.title}</h3><p>{entry.category}</p><strong>Open project <ChevronRight size={16}/></strong></div>
      </a>) : matches.slice(page*pageSize,(page+1)*pageSize).map(({project:item,category,art,info},index)=><a className="gp-card" key={item.id} href={link(item.id)}>
        <img src={info?projectArtwork(item.id):image(art)} alt="" loading={index>2?'lazy':undefined}/>
        <div><span className="gp-overline">{category}</span><h3>{item.title}</h3><p>{item.outcome}</p>
          {info&&<small>Guided 3D demo</small>}<strong>Open build <ChevronRight size={16}/></strong></div>
      </a>)}
    </div>
    {count>pageSize&&<nav className="gp-catalog-pages" aria-label="Project pages">
      <button className="gp-button gp-secondary" disabled={page===0} onClick={()=>setPage(page-1)}>Previous page</button>
      <span>Page {page+1} of {Math.ceil(count/pageSize)}</span>
      <button className="gp-button gp-secondary" disabled={(page+1)*pageSize>=count} onClick={()=>setPage(page+1)}>Next page</button>
    </nav>}
  </div>;
}
type Project = (typeof guidedProjects)[number];
function PartPhotos({name,projectId}: {name:string; projectId:string}) {
  const photos = projectPartPhotos(name);
  return <div className="gp-part-photos">
    {photos.length ? photos.map(photo => <figure key={photo.path}>
      <img src={photo.path} alt={photo.label}/>
      <figcaption>{photo.label} · <a href={`https://www.adafruit.com/product/${photo.product}`} target="_blank" rel="noreferrer">Photo source</a></figcaption>
    </figure>) : <figure>
      <img src={image(projectId)} alt="" />
      <figcaption>Build illustration for context. Follow the specified dimensions and fit checks for this item.</figcaption>
    </figure>}
  </div>;
}
function Build({project, stage, art, expansion}: {project: Project;stage: number;art:string;expansion?:ExpansionInfo}) {
  const [step,setStep] = useState(0);
  const [assemblyPart,setAssemblyPart] = useState<number | null>(null);
  const [demoRun,setDemoRun] = useState(0);
  const [storyStep,setStoryStep] = useState<number | null>(null);
  const [playing,setPlaying] = useState(false);
  const [storyComplete,setStoryComplete] = useState(false);
  const [demoPart,setDemoPart] = useState<number>();
  const [manualInput,setManualInput] = useState(false);
  const lesson = expansion ? expansionDemo(expansion,project) : undefined;
  const story = lesson?.story ?? projectStories[art];
  const currentBeat = storyStep===null ? undefined : story[storyStep];
  const reading = (lesson?.readings ?? demoReadings[art])[storyStep ?? (manualInput ? 3 : 0)];
  const active = storyStep===null ? manualInput : Boolean(reading[2]);
  useEffect(() => {
    if (stage!==4 || !playing || storyStep===null) return;
    const duration = storyStep===3
      ? art==='traffic-sequencer' ? ((expansion?.limit ?? 3)*2+1)*1000+400 : 4400
      : 3100;
    const timer = window.setTimeout(() => {
      if (storyStep===3) { setPlaying(false); setStoryComplete(true); }
      else { setDemoPart(undefined); setStoryStep(storyStep+1); }
    },duration);
    return () => window.clearTimeout(timer);
  },[stage,playing,storyStep,art,expansion]);

  useEffect(() => {
    if (stage!==4) {
      setPlaying(false);
      setStoryStep(null);
    }
  },[stage]);

  function chooseInput(value: boolean) {
    setManualInput(value);
    setStoryStep(null);
    setPlaying(false);
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (storyStep!==null && !storyComplete) {
      setPlaying(true);
      return;
    }
    setStoryComplete(false);
    setDemoRun(run=>run+1);
    setDemoPart(undefined);
    setStoryStep(0);
    setPlaying(true);
  }
  const [checked,setChecked] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      heading.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [project.id, stage]);
  const assembly = project.assembly[step];
  const currentPart = assemblyPart ?? assembly[3][0];
  const [partName, partQuantity, partPurpose] = project.parts[currentPart];
  const [control, low, high, resultLow, resultHigh] = lesson?.controls ?? project.demo;
  const starter = projectPrograms[art];
  const program = expansion && starter ? {
    ...starter,
    filename: `${project.id}.${starter.filename.split('.').at(-1)}`,
    source: configureProjectSource(expansion,starter.source),
  } : starter;
  const python = program?.filename.endsWith('.py');
  const readyCount = checked.length;
  const demoMarkers = project.parts.map(([name],index)=>({name,index}));
  return <div className="gp-page gp-build">
    <a className="gp-back" href={root}><ArrowLeft size={16}/> All projects</a>
    <header className="gp-title"><h1>{project.title}</h1><p>{project.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((name,i)=>
      <a key={name} href={link(project.id,i)} aria-current={i===stage?'step':undefined}><span>{i+1}</span>{name}</a>)}</nav>
    <section className="gp-panel" aria-labelledby="gp-stage">
      <h2 id="gp-stage" ref={heading} tabIndex={-1}>{stages[stage]}</h2>
      {stage===0 && <div className="gp-split">
        <figure><img src={expansion?projectArtwork(project.id):image(art)} alt={`Illustrated build reference for ${project.title}`}/><figcaption>{expansion?'Project cover with representative hardware':'Build reference · illustrative hardware'}</figcaption></figure>
        <div className="gp-guide"><h3>What you’ll build</h3><p>{project.outcome}</p>
          <h3>Build workflow</h3><ol className="gp-workflow">{project.assembly.map(([title])=><li key={title}>{title}</li>)}<li>Verify the build and try the interactive demo</li></ol>
          <p><strong>Success check</strong> {project.test}</p>
          <a className="gp-button" href={link(project.id,1)}>Start with components <ArrowRight size={16}/></a>
        </div>
      </div>}
      {stage===1 && <><div className="gp-readiness"><p>Mark each part ready as you gather it.</p>
        <div><strong role="status">{readyCount} of {project.parts.length} ready</strong>
          <progress aria-label="Components ready" value={readyCount} max={project.parts.length}/></div></div>
        <div className="gp-parts">{project.parts.map(([name,quantity,purpose],i)=>
          <article key={name} className={checked.includes(i) ? 'selected' : undefined}>
            <PartPhotos name={name} projectId={art}/>
            <div className="gp-preview-heading"><h3>{name}</h3><span>{quantity}</span></div>
            <p>{purpose}</p>
            <button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={checked.includes(i)}
              onClick={()=>setChecked(previous=>previous.includes(i)?previous.filter(n=>n!==i):[...previous,i])}>
              {checked.includes(i)?<Check size={18}/>:<Plus size={18}/>} {checked.includes(i)?'Ready':'Mark ready'}
            </button></article>)}</div>
      </>}
      {stage===2 && <>
        <nav className="gp-steps" aria-label="Assembly steps">{project.assembly.map(([name],i)=><button key={name} aria-pressed={step===i} onClick={()=>{setStep(i);setAssemblyPart(null);}}>{i+1}. {name}</button>)}</nav>
        <div className="gp-split gp-assembly-layout">
          <div className="gp-guide gp-assembly-guide"><span className="gp-overline">Step {step+1} of {project.assembly.length}</span>
            <h3><Wrench size={20}/> {assembly[0]}</h3><p>{assembly[1]}</p><h4>Inspect a part</h4>
            <ul className="gp-part-selector">{assembly[3].map(i=><li key={i}><button className="gp-part-label" aria-pressed={currentPart===i} onClick={()=>setAssemblyPart(i)}><span className="gp-part-number">{i+1}</span>{project.parts[i][0]}</button></li>)}</ul>
            <p className="gp-check"><Check size={19}/><span><strong>Before you continue</strong><br/>{assembly[2]}</span></p>
            <div className="gp-assembly-actions">
              {step>0&&<button className="gp-button gp-secondary" onClick={()=>{setStep(step-1);setAssemblyPart(null);}}><ArrowLeft size={16}/> Previous step</button>}
              {step<project.assembly.length-1
                ? <button className="gp-button" onClick={()=>{setStep(step+1);setAssemblyPart(null);}}>Next assembly step <ArrowRight size={16}/></button>
                : <a className="gp-button" href={link(project.id,3)}>Program &amp; test <ArrowRight size={16}/></a>}
            </div>
          </div>
          <section className="gp-assembly-visuals" aria-label="Selected component">
            <header className="gp-inspect-heading" aria-live="polite">
              <div><h3>{partName}</h3><p>{partPurpose}</p></div>
              <span>Qty {partQuantity}</span>
            </header>
            <figure className="gp-assembly-model">
              <figcaption><strong>3D part view</strong><span>Drag to rotate · Scroll to zoom</span></figcaption>
              <Suspense fallback={<p role="status">Loading the 3D part…</p>}>
                <ProjectPartView name={partName}/>
              </Suspense>
            </figure>
            <div className="gp-part-preview">
              <h4>2D reference</h4>
              <PartPhotos name={partName} projectId={art}/>
            </div>
          </section>
        </div>
        {project.wiring.length>0&&<div className="gp-table"><table><caption>Connection map · disconnect power before wiring</caption><thead><tr><th>From</th><th>To</th><th>Purpose</th></tr></thead><tbody>{project.wiring.map(([from,to,purpose])=><tr key={from}><td>{from}</td><td>{to}</td><td>{purpose}</td></tr>)}</tbody></table></div>}
      </>}
      {stage===3 && <div className="gp-guide gp-program">
        <div className="gp-program-meta">
          <div><span>Language</span><strong>{program ? python ? 'Python' : 'Arduino C++' : 'Mechanical build'}</strong></div>
          <div><span>Tools</span><strong>{program ? python ? 'Python 3, OpenCV, USB webcam' : 'Arduino IDE, Uno R3, USB data cable' : 'Hand crank and rotation marks'}</strong></div>
        </div>
        <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Set up and run</h3>
        <ol className="gp-program-steps">
          <li><strong>Check the assembly.</strong> Verify the fit and connections before applying power.</li>
          {program && (python ? <>
            <li><strong>Install the dependency.</strong> Run <code>python3 -m pip install opencv-python</code> in your project’s Python environment.</li>
            <li><strong>Run the program.</strong> Download the script, plug in the webcam and run <code>python3 {program.filename}</code> from its folder.</li>
          </> : <>
            <li><strong>Set up the Arduino IDE.</strong> Open the downloaded sketch, select Arduino Uno and choose the board’s USB port.</li>
            <li><strong>Verify and upload.</strong> Use Verify to compile the sketch, then Upload. Keep any separate motor or servo supply off while uploading.</li>
          </>)}
          <li><strong>{program ? 'Start the project check.' : 'Operate the mechanism.'}</strong> {program?.setup ?? (expansion ? 'Use the project check below to compare the expected result with your build.' : 'Turn the crank by hand with the gears unloaded.')}</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result and test procedure</strong><p>{project.test}</p></div></div>
        </section>
        {program&&<section className="gp-program-card gp-code-card"><h3>How the code works</h3><ul>{(expansion ? [project.test] : programWalkthroughs[art]).map(line=><li key={line}>{line}</li>)}</ul>
          <div className="gp-source-heading"><h3>{program.filename}</h3><button className="gp-button gp-secondary" onClick={()=>download(program.filename,program.source)}>Download code</button></div>
          <pre tabIndex={0} aria-label={program.filename}><code>{program.source}</code></pre></section>}
        </div>
      </div>}
      {stage===4 && <>
        <div className="gp-split gp-demo">
          <div className="gp-story-stage">
            <Suspense fallback={<p>Loading the 3D scene…</p>}>
              <ProjectDemo key={demoRun} id={art} configuration={expansion} active={active} hold={storyStep!==null&&!playing}
                storyStep={storyStep} markers={demoMarkers} selected={demoPart??currentBeat?.[2]} onSelect={setDemoPart}/>
            </Suspense>
            <div className="gp-demo-result" aria-label="What changed">
              <div><span>What goes in</span><strong>{reading[0]}</strong></div>
              <ArrowRight size={22} aria-hidden="true"/>
              <div key={reading[1]} className={reading[2]?'gp-result-changed':undefined}>
                <span><Activity size={14} aria-hidden="true"/> What you see</span><strong>{reading[1]}</strong>
              </div>
            </div>
            {currentBeat && <div className="gp-story-caption" aria-live="polite">
              <span>Step {storyStep!+1} of {story.length}</span>
              <strong>{currentBeat[0]}</strong>
              <p>{currentBeat[1]}</p>
            </div>}
          </div>
          <div className="gp-guide"><h3>Try the finished build</h3>
            <button type="button" className="gp-button" onClick={togglePlayback}>
              {playing?<Square size={16}/>:<Play size={16}/>}
              {playing?'Pause demo':storyComplete&&storyStep!==null?'Replay demo':storyStep!==null?'Resume demo':'Play animated demo'}
            </button>
            <p>Watch the project work, then try the controls yourself. The glowing trail shows which parts pass a signal or move together.</p>
            <ol className="gp-story-steps" aria-label="Animation steps">
              {story.map(([label],index)=><li key={label}>
                <button type="button" aria-current={storyStep===index?'step':undefined}
                  onClick={()=>{setPlaying(false);setStoryComplete(false);setDemoPart(undefined);setStoryStep(index);}}>
                  <span>{index+1}</span>{label}
                </button>
              </li>)}
            </ol>
            <div role="group" aria-label={control}><h4>{control}</h4><div className="gp-steps"><button aria-pressed={!active} onClick={()=>chooseInput(false)}>{low}</button><button aria-pressed={active} onClick={()=>chooseInput(true)}>{high}</button></div></div>
            <p className="gp-check" role="status">{currentBeat ? (storyComplete ? 'Demo complete' : playing ? 'Animation playing' : 'Animation paused') : active?resultHigh:resultLow}</p>
            {art==='rover-project'&&<button className="gp-button gp-secondary" onClick={()=>{chooseInput(false);setDemoRun(run=>run+1);}}>Restart drive</button>}
            <h4>Identify the parts</h4>
            <ol className="gp-demo-labels">{demoMarkers.map(({index,name})=><li key={index}>
              <button className="gp-part-label" aria-pressed={demoPart===index} onClick={()=>setDemoPart(index)}><span>{index+1}</span>{name}</button>
            </li>)}</ol>
            {demoPart!==undefined&&<p className="gp-demo-description" role="status">{project.parts[demoPart][2]}</p>}
            <h4>Verify on your physical build</h4><p>{project.test}</p>
          </div>
        </div>
        {expansion&&<details className="gp-extra-experiment"><summary>Explore more input values</summary><ProjectScenario info={expansion}/></details>}
      </>}
    </section>
    <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(project.id,stage-1)}><ArrowLeft size={16}/>{stage===0?'All projects':stages[stage-1]}</a>
      <a className="gp-button" href={stage===4?root:link(project.id,stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
  </div>;
}
