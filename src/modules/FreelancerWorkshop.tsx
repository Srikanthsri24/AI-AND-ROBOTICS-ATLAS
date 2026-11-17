import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ClipboardList, Search } from 'lucide-react';
import { filterJobs, jobs, reviewProposal, submitProposal, type Job, type Proposal } from '../data/freelancer-portal.mjs';
import source from '../data/freelancer-portal.mjs?raw';
import { freelancerProject } from '../data/freelancer-project';
import { download } from './state';
import '../styles/freelancer-workshop.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${freelancerProject.id}/${paths[index]}`;
const skills=[...new Set(jobs.map(job=>job.skill))].sort();
const durations=[...new Set(jobs.map(job=>job.duration))];
const assets=[
 ['Practice listings','4 jobs','Each fictional role has an ID, skill, start window, brief and fixed example budget.'],
 ['Search and filters','3 controls','Combine skill, availability and keywords. Show an empty state when no record matches.'],
 ['Proposal form','1 per job','Validate a short note and retain one submission for each job in a session.'],
 ['Hiring inbox','2 review outcomes','Shortlist or decline a submitted proposal. Both views read the same session state.'],
 ['JavaScript module and runner','2 files','Run the filters and proposal transitions in Node.js or use the browser exercise.'],
];
const workflow=[
 ['Define the listing records','Give each listing a unique ID. Record its title, skill, availability, summary and example budget.'],
 ['Connect the filters','Read all three controls. Keep a listing if it meets every active condition. Show an empty state and let the user clear the filters.'],
 ['Submit a proposal','Pick the job ID, validate the note, and add a Submitted record only if there is no proposal for that listing yet.'],
 ['Review the proposal','Switch to the mock hiring inbox. Choose Shortlisted or Declined for a submitted record, then verify the same status appears in the freelancer view.'],
];

function Listing({job,status,select}:{job:Job;status?:Proposal['status'];select?:(id:string)=>void}){
 return <article className="fr-listing">
   <div className="fr-team"><BriefcaseBusiness size={16}/>{job.team}</div>
   <h4>{job.title}</h4><p>{job.summary}</p>
   <div className="fr-meta"><span>{job.skill}</span><span>{job.duration}</span><strong>${job.budget} USD</strong></div>
   {select&&<button type="button" className="gp-button gp-secondary" aria-label={`View ${job.title}`} onClick={()=>select(job.id)}>View listing <ArrowRight size={16}/></button>}
   {status&&<span className="fr-proposal-state">{status}</span>}
 </article>;
}

function PortalDemo(){
 const [view,setView]=useState<'browse'|'inbox'>('browse');
 const [skill,setSkill]=useState('');
 const [duration,setDuration]=useState('');
 const [query,setQuery]=useState('');
 const [selected,select]=useState<string|null>(null);
 const [note,setNote]=useState('');
 const [proposals,setProposals]=useState<Proposal[]>([]);
 const [message,setMessage]=useState('');
 const proposalTitle=useRef<HTMLHeadingElement>(null);
 const matches=filterJobs({skill,duration,query});
 const job=jobs.find(item=>item.id===selected);
 const existing=proposals.find(proposal=>proposal.jobId===selected);
 function open(id:string){select(id);setNote('');setMessage('');proposalTitle.current?.focus();}
 function clear(){setSkill('');setDuration('');setQuery('');setMessage('');}
 function submit(event:FormEvent){event.preventDefault();if(!job)return;const result=submitProposal(proposals,job.id,note);setProposals(result.proposals);setMessage(result.reason);}
 function review(id:string,status:'Shortlisted'|'Declined'){const result=reviewProposal(proposals,id,status);setProposals(result.proposals);setMessage(result.reason);}
 return <>
   <div className="gp-steps" role="group" aria-label="Portal view">
     <button type="button" aria-pressed={view==='browse'} onClick={()=>{setView('browse');setMessage('');}}><Search size={16}/> Find work</button>
     <button type="button" aria-pressed={view==='inbox'} onClick={()=>{setView('inbox');setMessage('');}}><ClipboardList size={16}/> Hiring inbox ({proposals.length})</button>
   </div>
   <p className="fr-status" role="status">{message|| (view==='browse'?`${matches.length} matching ${matches.length===1?'job':'jobs'}`:`${proposals.length} ${proposals.length===1?'proposal':'proposals'} in this session`)}</p>
   {view==='browse'?<div className="fr-demo">
     <section className="fr-card" aria-label="Available jobs"><h3>Available jobs</h3>
       <div className="fr-filters">
         <label>Search jobs<input type="search" value={query} onChange={event=>{setQuery(event.target.value);setMessage('');}} placeholder="Try dashboard or REST"/></label>
         <label><span id="fr-skill-label">Skill</span><select aria-labelledby="fr-skill-label" value={skill} onChange={event=>{setSkill(event.target.value);setMessage('');}}><option value="">All skills</option>{skills.map(value=><option key={value}>{value}</option>)}</select></label>
         <label><span id="fr-start-label">Start window</span><select aria-labelledby="fr-start-label" value={duration} onChange={event=>{setDuration(event.target.value);setMessage('');}}><option value="">Any time</option>{durations.map(value=><option key={value}>{value}</option>)}</select></label>
       </div>
       {!matches.length?<div className="fr-empty"><p>No jobs match those filters.</p><button className="gp-button gp-secondary" type="button" onClick={clear}>Clear filters</button></div>:
       <div className="fr-results">{matches.map(item=><Listing key={item.id} job={item} status={proposals.find(proposal=>proposal.jobId===item.id)?.status} select={open}/>)}</div>}
     </section>
     <section className="fr-card" aria-label="Proposal workspace"><h3 ref={proposalTitle} tabIndex={-1}>Proposal workspace</h3>
       {!job?<p>Open a listing to review the brief and write a proposal.</p>:<>
         <h4>{job.title}</h4><p>{job.summary}</p>
         {existing?<div className="fr-existing"><strong>{existing.status}</strong><p>{existing.note}</p></div>:<form onSubmit={submit} className="fr-proposal">
           <label htmlFor="fr-note">Proposal note</label><textarea id="fr-note" value={note} maxLength={400} onChange={event=>setNote(event.target.value)} rows={4}/>
           <small>{note.length} / 400 characters · Minimum 20</small>
           <button className="gp-button" type="submit">Submit proposal</button>
         </form>}
       </>}
     </section>
   </div>:<section className="fr-card" aria-label="Hiring inbox"><h3>Hiring inbox</h3>
     {!proposals.length?<p>Submit a practice proposal before reviewing it here.</p>:<div className="fr-results">{proposals.map(proposal=><article className="fr-listing" key={proposal.jobId}>
       <h4>{jobs.find(item=>item.id===proposal.jobId)?.title}</h4><strong className="fr-proposal-state">{proposal.status}</strong><p>{proposal.note}</p>
       {proposal.status==='Submitted'&&<div className="gp-steps"><button type="button" onClick={()=>review(proposal.jobId,'Shortlisted')}>Shortlist</button><button type="button" onClick={()=>review(proposal.jobId,'Declined')}>Decline</button></div>}
     </article>)}</div>}
   </section>}
 </>;
}

export default function FreelancerWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page fr-page">
   <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
   <header className="fr-header"><BriefcaseBusiness size={34} aria-hidden="true"/><div><h1>{freelancerProject.title}</h1><p>{freelancerProject.outcome}</p></div></header>
   <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
   <section className="gp-panel fr-panel" aria-label={stages[stage]}>
     <h2>{stages[stage]}</h2>
     {stage===0&&<div className="fr-grid"><section className="fr-card"><h3>What you’ll build</h3><p>A local marketplace prototype with four fictional jobs and a mock hiring inbox. The browser keeps proposals for the current demo session.</p>
       <ol className="gp-workflow">{workflow.map(([name])=><li key={name}>{name}</li>)}</ol>
       <p><strong>Success check</strong> Find the matching Python job, clear an empty search, submit one proposal and see its review outcome from both sides.</p>
     </section><section className="fr-card fr-cover" aria-label="Practice listing preview"><Listing job={jobs[0]}/><Listing job={jobs[1]}/><a className="gp-button" href={link(4)}>Open portal demo <ArrowRight size={16}/></a></section></div>}
     {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="fr-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="fr-card">
       <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
     </article>)}</div></>}
     {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{workflow.map(([name],index)=><button type="button" key={name} onClick={()=>setStep(index)} aria-pressed={step===index}>{index+1}. {name}</button>)}</nav>
       <div className="fr-card"><h3>{workflow[step][0]}</h3><p>{workflow[step][1]}</p></div>
       <ol className="fr-flow" aria-label="Data connection map">{['Seed job records','Listing filters and selection','Proposal linked by job ID','Inbox decision and shared status'].map(name=><li key={name}>{name}</li>)}</ol>
     </>}
     {stage===3&&<div className="fr-grid"><section className="fr-card"><h3>Run the local checks</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Browser or Node.js and a terminal.</p>
       <ol className="gp-program-steps"><li>Download both JavaScript files into the same folder.</li><li>Run <code>node freelancer_trial.mjs</code>.</li><li>Expect one matching Python listing for This week and an empty result for Accessibility next month.</li><li>The runner submits a proposal, blocks a duplicate and verifies the shortlist transition.</li></ol>
       <div className="gp-steps"><button className="gp-button" type="button" onClick={()=>download('freelancer-portal.mjs',source)}>Download portal logic</button><a className="gp-button gp-secondary" href="./project-files/freelancer_trial.mjs" download>Download test runner</a></div>
     </section><section className="fr-card"><h3>Verify both views</h3><p>Enter a brief note and check that the form requests at least 20 characters. Submit a valid note. In the hiring inbox, shortlist or decline it. Return to Find work and check the listing and proposal status.</p><p>The prototype stores fictional listings and session-only proposals. A real hiring product would need authentication, role permissions and durable storage.</p></section></div>}
     {stage===4&&<PortalDemo/>}
   </section>
   <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
