import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Download, FileText, Send, WandSparkles } from 'lucide-react';
import { generateDraft, publishHtml, reviewChecks, reviewProblems, unsupportedClaim, type Brief, type Checks, type Draft, type Tone } from '../data/publishing-engine.mjs';
import engineSource from '../data/publishing-engine.mjs?raw';
import { publishingBriefs, publishingProject } from '../data/publishing-workflow';
import { download } from './state';
import '../styles/publishing-workshop.css';

const stages = ['Overview', 'Components', 'Assembly', 'Program & test', 'Finished demo'];
const routes = ['overview', 'components', 'assembly', 'test', 'demo'];
const projectRoot = '#/project-builder';
const link = (index:number) => `${projectRoot}/${publishingProject.id}/${routes[index]}`;
const assets = [
  {name:'Source brief', purpose:'Ground the draft in six facts about a fictional classroom workshop.', file:'workshop-brief.json'},
  {name:'Draft generator', purpose:'Run the same local JavaScript used in the browser. A setting can insert one known unsupported claim for review.', file:'publishing-engine.mjs'},
  {name:'Prompt template', purpose:'Use the selected brief and tone to write instructions a text model can follow.', file:'workshop-prompt.txt'},
  {name:'Editorial checklist', purpose:'Verify the facts, check the audience and confirm there are no personal details before approval.', file:'editorial-checklist.json'},
  {name:'Command-line runner', purpose:'Generate and publish from JSON on a computer with Node.js. A browser is enough for the on-screen exercise.', file:'publishing_runner.mjs'},
];

function BriefCard({brief}:{brief:Brief}) {
  return <section className="pub-brief" aria-label="Source brief">
    <div className="pub-section-label"><FileText size={18}/> Source brief</div>
    <h3>{brief.activity}</h3>
    <dl>
      <div><dt>When</dt><dd>{brief.schedule}</dd></div>
      <div><dt>Where</dt><dd>{brief.location}</dd></div>
      <div><dt>Audience</dt><dd>{brief.audience}</dd></div>
      <div><dt>Exercise</dt><dd>{brief.exercise}</dd></div>
      <div><dt>Instructions</dt><dd>{brief.instruction}</dd></div>
    </dl>
  </section>;
}

function WorkflowArt() {
  return <div className="pub-art" aria-label="Draft, review and publish workflow">
    <div className="pub-art-grid">
      <div className="pub-art-card">
        <FileText size={28}/><strong>Draft</strong><span>Rover Basics workshop</span>
        <i/><i/><i/>
      </div>
      <ArrowRight size={22} className="pub-art-arrow"/>
      <div className="pub-art-card pub-art-middle">
        <ClipboardCheck size={28}/><strong>Review</strong><span>Verify the source brief</span>
        <small><Check size={14}/> Facts</small><small><Check size={14}/> Audience</small><small><Check size={14}/> Privacy</small>
      </div>
      <ArrowRight size={22} className="pub-art-arrow"/>
      <div className="pub-art-card">
        <Send size={27}/><strong>Publish</strong><span>Approved workshop page</span>
        <small><Download size={14}/> Local HTML</small>
      </div>
    </div>
  </div>;
}

export default function PublishingWorkshop({stage}:{stage:number}) {
  const [briefKey,setBriefKey]=useState('rover');
  const [tone,setTone]=useState<Tone>('friendly');
  const [practiceClaim,setPracticeClaim]=useState(true);
  const [ready,setReady]=useState<string[]>([]);
  const [draft,setDraft]=useState<Draft|null>(null);
  const [checks,setChecks]=useState<Checks>({});
  const [approved,setApproved]=useState(false);
  const [published,setPublished]=useState<{draft:Draft;html:string}|null>(null);
  const [notice,setNotice]=useState('Choose a brief and generate the first draft.');
  const heading=useRef<HTMLHeadingElement>(null);
  const brief=publishingBriefs[briefKey];
  const promptText = [
    `Write a ${tone==='friendly'?'friendly invitation':'formal notice'} for a robotics workshop.`,
    'Use only the facts in the brief. If a fact is missing, ask the editor to supply it. Return a headline and a short body.',
    '',
    `Activity: ${brief.activity}`,
    `When: ${brief.schedule}`,
    `Where: ${brief.location}`,
    `Audience: ${brief.audience}`,
    `Exercise: ${brief.exercise}`,
    `Instructions: ${brief.instruction}`,
  ].join('\n');
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      window.scrollTo({top:0,behavior:'instant'});
      heading.current?.focus({preventScroll:true});
    });
    return ()=>cancelAnimationFrame(frame);
  },[stage]);

  function invalidateReview() {
    setChecks({});
    setApproved(false);
    setPublished(null);
  }

  function clearDraft() {
    setDraft(null);
    invalidateReview();
    setNotice('Generation settings changed. Generate a draft to start a new review.');
  }

  function createDraft() {
    setDraft(generateDraft(brief,tone,practiceClaim));
    invalidateReview();
    setNotice('Draft generated. Compare it with the source brief before approving.');
  }

  function editDraft(next:Draft) {
    const wasReviewed=approved||Object.values(checks).some(Boolean);
    setDraft(next);
    if(wasReviewed) {
      invalidateReview();
      setNotice('Draft revised. Review and approve this version again.');
    }
  }

  function approve() {
    if(!draft)return;
    const problems=reviewProblems(draft,checks);
    setApproved(problems.length===0);
    setNotice(problems.length ? problems.join(' ') : 'Draft approved. Publish a local preview when ready.');
  }

  function publish() {
    if(!draft||!approved)return;
    setPublished({draft,html:publishHtml(draft,checks)});
    setNotice('Local page published. Preview or download the approved HTML.');
  }

  function markReady(name:string) {
    setReady(current=>current.includes(name)?current.filter(item=>item!==name):[...current,name]);
  }

  function downloadAsset(filename:string) {
    if(filename==='workshop-brief.json') {
      download(filename,JSON.stringify({brief,tone,practiceClaim},null,2)+'\n','application/json');
    } else if(filename==='workshop-prompt.txt') {
      download(filename,promptText+'\n');
    } else if(filename==='publishing-engine.mjs') {
      download(filename,engineSource,'text/javascript');
    } else {
      download(filename,JSON.stringify(Object.fromEntries(reviewChecks.map(({id})=>[id,false])),null,2)+'\n','application/json');
    }
  }

  const settings=<div className="pub-settings">
    <label>Workshop brief
      <select value={briefKey} onChange={event=>{setBriefKey(event.target.value);clearDraft();}}>
        {Object.entries(publishingBriefs).map(([key,value])=><option key={key} value={key}>{value.activity}</option>)}
      </select>
    </label>
    <label>Writing tone
      <select value={tone} onChange={event=>{setTone(event.target.value as Tone);clearDraft();}}>
        <option value="friendly">Friendly invitation</option>
        <option value="formal">Formal notice</option>
      </select>
    </label>
    <label className="pub-check"><input type="checkbox" checked={practiceClaim} onChange={event=>{setPracticeClaim(event.target.checked);clearDraft();}}/> Include a practice claim to review</label>
  </div>;

  return <div className="gp-page gp-build pub-page">
    <a href={projectRoot} className="gp-back"><ArrowLeft size={16}/>All projects</a>
    <header className="gp-title"><h1>{publishingProject.title}</h1><p>{publishingProject.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">
      {stages.map((name,i)=><a key={name} href={link(i)} aria-current={stage===i?'step':undefined}><span>{i+1}</span>{name}</a>)}
    </nav>
    <section className="gp-panel" aria-labelledby="pub-stage">
      <h2 id="pub-stage" tabIndex={-1} ref={heading}>{stages[stage]}</h2>
      {stage===0&&<div className="gp-split">
        <WorkflowArt/>
        <div className="gp-guide">
          <h3>Publish a reviewed workshop notice</h3>
          <p>Choose a fictional workshop, generate a draft, then compare every claim with the source brief. The local generator uses templates to simulate the draft an AI tool might produce.</p>
          <ol>
            <li>Choose an audience and tone.</li>
            <li>Review the draft against the brief and revise unsupported claims.</li>
            <li>Approve the reviewed version and open the exported page in a browser.</li>
          </ol>
          <div className="gp-check"><Check size={19}/><div><strong>Success criteria</strong><p>The page shows the correct event facts, uses suitable wording and opens on its own. Editing the draft after approval requires a new review.</p></div></div>
        </div>
      </div>}
      {stage===1&&<div className="gp-guide">
        <p>Review each software asset and mark it ready. {ready.length} of {assets.length} ready.</p>
        <div className="pub-assets">
          {assets.map(asset=><article key={asset.name} className={ready.includes(asset.name)?'is-ready':undefined}>
            <FileText size={21}/><h3>{asset.name}</h3><p>{asset.purpose}</p>
            <div className="pub-actions">
              {asset.file==='publishing_runner.mjs'
                ? <a className="gp-button gp-secondary" href="./project-files/publishing_runner.mjs" download>Download runner</a>
                : <button type="button" className="gp-button gp-secondary" onClick={()=>downloadAsset(asset.file)}>Download {asset.name.toLowerCase()}</button>}
              <button type="button" className="pub-ready" aria-label={`Mark ${asset.name} ready`} aria-pressed={ready.includes(asset.name)} onClick={()=>markReady(asset.name)}>
                {ready.includes(asset.name)?<><Check size={16}/> Ready</>:'Mark ready'}
              </button>
            </div>
          </article>)}
        </div>
      </div>}
      {stage===2&&<div className="gp-split">
        <div className="gp-guide">
          <h3>Configure the workshop</h3>
          {settings}
          <details className="pub-prompt">
            <summary>Inspect the generated prompt</summary>
            <pre tabIndex={0}><code>{promptText}</code></pre>
            <button type="button" className="gp-button gp-secondary" onClick={()=>downloadAsset('workshop-prompt.txt')}>Download prompt</button>
          </details>
          <ol>
            <li><strong>Choose the source brief.</strong> Review the time, location and planned activity before drafting.</li>
            <li><strong>Assign roles.</strong> The writer revises the draft. The reviewer compares it to the source and completes the checks.</li>
            <li><strong>Set the output.</strong> Prepare an HTML file that opens locally. Use the finished demo to try the setup you chose here.</li>
          </ol>
        </div>
        <BriefCard brief={brief}/>
        <div className="gp-table pub-stage-table">
          <table>
            <caption>Workflow connections</caption>
            <thead><tr><th>Input</th><th>Action</th><th>Output</th></tr></thead>
            <tbody>
              <tr><td>Workshop brief and tone</td><td>Generate an invitation or notice</td><td>Editable draft</td></tr>
              <tr><td>Draft and source brief</td><td>Compare, revise and check facts</td><td>Reviewed draft</td></tr>
              <tr><td>Approved draft</td><td>Render the approved text as HTML</td><td>Local preview and downloadable page</td></tr>
            </tbody>
          </table>
        </div>
      </div>}
      {stage===3&&<div className="gp-guide pub-program">
        <div className="gp-program-meta">
          <div><span>Language</span><strong>JavaScript, JSON and HTML</strong></div>
          <div><span>Tools</span><strong>Browser, text editor and optional Node.js</strong></div>
        </div>
        <div className="gp-program-grid">
          <section className="gp-program-card">
            <h3>Run the browser checks</h3>
            <ol className="gp-program-steps">
              <li>Generate a draft with the practice claim enabled.</li>
              <li>Attempt approval. Expect the unsupported claim or incomplete review to block publication.</li>
              <li>Remove the unsupported claim, complete the three checks and approve. Publish and open the downloaded HTML in a browser.</li>
              <li>Change the headline. Expect the approval and previous preview to clear.</li>
            <li>To review output from a text model you already have, use the prompt from Assembly. Generate a starting draft in the demo and replace its headline and body with that output. Apply the same checks before export.</li>
            </ol>
          </section>
          <section className="gp-program-card">
            <h3>Run the same engine in Node.js</h3>
            <p>Put the engine, runner and source brief downloads in one folder. In that folder run:</p>
            <pre tabIndex={0}><code>{'node publishing_runner.mjs draft workshop-brief.json draft.json'}</code></pre>
            <p>Open <code>draft.json</code>. Revise the text and set the <code>facts</code>, <code>audience</code> and <code>privacy</code> checks to <code>true</code> after reviewing. Then run:</p>
            <pre tabIndex={0}><code>{'node publishing_runner.mjs publish draft.json workshop-notice.html'}</code></pre>
            <p>Expect an error until the checks pass. A successful run writes the approved page.</p>
            <div className="pub-actions">
              <button type="button" className="gp-button gp-secondary" onClick={()=>downloadAsset('publishing-engine.mjs')}>Download JavaScript engine</button>
              <a className="gp-button gp-secondary" href="./project-files/publishing_runner.mjs" download>Download runner</a>
              <button type="button" className="gp-button gp-secondary" onClick={()=>downloadAsset('workshop-brief.json')}>Download brief JSON</button>
            </div>
          </section>
        </div>
      </div>}
      {stage===4&&<div className="pub-workspace">
        <aside className="pub-sidebar gp-guide">
          {settings}
          <button type="button" className="gp-button" onClick={createDraft}><WandSparkles size={17}/> Generate draft</button>
          <BriefCard brief={brief}/>
        </aside>
        <div className="pub-editor">
          <ol className="pub-progress" aria-label="Publication progress">
            <li aria-current={!draft?'step':undefined}><FileText size={17}/>Draft</li>
            <li aria-current={draft&&!approved?'step':undefined}><ClipboardCheck size={17}/>Review</li>
            <li aria-current={approved?'step':undefined}><Send size={16}/>{published?'Published':'Publish'}</li>
          </ol>
          <p role="status" className="pub-notice">{notice}</p>
          {draft&&<>
            <div className="pub-fields">
              <label>Draft headline<input value={draft.heading} maxLength={160} onChange={event=>editDraft({...draft,heading:event.target.value})}/></label>
              <label>Draft body<textarea rows={8} value={draft.body} maxLength={2400} onChange={event=>editDraft({...draft,body:event.target.value})}/></label>
              {draft.body.includes(unsupportedClaim)&&<div className="pub-claim">
                <p>Compare this claim with the brief: <q>{unsupportedClaim}</q></p>
                <button type="button" className="gp-button gp-secondary" onClick={()=>editDraft({...draft,body:draft.body.replace(unsupportedClaim,'').trim()})}>Remove practice claim</button>
              </div>}
            </div>
            <fieldset className="pub-review">
              <legend>Review this version</legend>
              {reviewChecks.map(({id,label})=><label key={id} className="pub-check"><input type="checkbox" checked={Boolean(checks[id])} onChange={event=>{
                setChecks(current=>({...current,[id]:event.target.checked}));
                setApproved(false);
                setPublished(null);
                if(approved) setNotice('Review changed. Approve the current draft before publishing.');
              }}/>{label}</label>)}
            </fieldset>
            <div className="pub-actions">
              <button type="button" className="gp-button gp-secondary" onClick={approve} disabled={approved}><ClipboardCheck size={17}/>{approved?'Approved':'Approve draft'}</button>
              <button type="button" className="gp-button" onClick={publish} disabled={!approved||published!==null}><Send size={16}/>Publish local preview</button>
            </div>
          </>}
          {published&&<section className="pub-preview" aria-label="Published preview">
            <div className="pub-section-label"><Check size={18}/> Published preview</div>
            <h3>{published.draft.heading.trim()}</h3>
            {published.draft.body.trim().split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}
            <button type="button" className="gp-button gp-secondary" onClick={()=>download('workshop-notice.html',published.html,'text/html')}><Download size={17}/>Download approved HTML</button>
          </section>}
        </div>
      </div>}
    </section>
    <nav className="gp-footer" aria-label="Stage navigation">
      {stage>0?<a className="gp-button gp-secondary" href={link(stage-1)}><ArrowLeft size={16}/>{stages[stage-1]}</a>:<span/>}
      {stage<4&&<a className="gp-button" href={link(stage+1)}>{stages[stage+1]}<ArrowRight size={16}/></a>}
    </nav>
  </div>;
}
