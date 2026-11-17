import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Link2, ScanLine, Vote } from 'lucide-react';
import { appendBlock, audit, batches, choices, editFirstRecord, milestones, tokens, type Audit, type Block, type Entry } from '../data/classroom-ledger.mjs';
import source from '../data/classroom-ledger.mjs?raw';
import { ledgerProject } from '../data/classroom-ledger-project';
import { download } from './state';
import '../styles/classroom-ledger.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${ledgerProject.id}/${paths[index]}`;
const assets=[
  ['Mock ballot tokens','3 codes','Use each printed code once. The classroom demo uses fictional choices.'],
  ['Fictional produce batches','2 identifiers','Trace a carrot or bean batch through harvest, packing and delivery.'],
  ['Record rules','2 workflows','Validate ballot uniqueness and require produce checkpoints in order.'],
  ['Hashing and audit module','1 JavaScript file','Compute each SHA-256 digest and verify the previous hash link.'],
  ['Browser and local runner','2 ways to test','Run the workbench in the browser or download both JavaScript files and run the command-line trial.'],
];
const workflow=[
  ['Define two separate ledgers','Prepare a classroom ballot ledger and a produce ledger. Each starts empty with a zero previous hash for its first block.'],
  ['Validate an incoming record','Check a ballot’s token and choice. For produce, look up the batch ID and require its next checkpoint. A rejected action leaves the ledger unchanged.'],
  ['Add a block and link it','Encode the block index, previous hash, record kind, ID and value in that order. Compute SHA-256 and store the new hash beside the record.'],
  ['Audit a copy','Recompute each hash and compare its previous link with the prior stored hash. Change a value in a copy, keep its original hash, and locate the first mismatch.'],
];

function LedgerArt(){
  return <section className="ledger-card ledger-art" aria-label="Two ledger workflows">
    <div><Vote size={27}/><h3>Classroom ballot</h3><span>One token → one vote</span></div>
    <div><ScanLine size={27}/><h3>Produce batch</h3><span>Harvest → pack → deliver</span></div>
    <div><Link2 size={27}/><h3>Audit the links</h3><span>Record → hash → next block</span></div>
  </section>;
}

type Kind=Entry['kind'];
const initialStatus:Record<Kind,string>={vote:'Choose a mock ballot and record it.',produce:'Choose a batch and record its first checkpoint.'};

function LedgerDemo() {
  const [kind,setKind]=useState<Kind>('vote');
  const [chains,setChains]=useState<Record<Kind,Block[]>>({vote:[],produce:[]});
  const [copies,setCopies]=useState<Partial<Record<Kind,Block[]>>>({});
  const [audits,setAudits]=useState<Partial<Record<Kind,Audit>>>({});
  const [messages,setMessages]=useState(initialStatus);
  const [token,setToken]=useState(tokens[0]);
  const [choice,setChoice]=useState(choices[0]);
  const [batch,setBatch]=useState(batches[0]);
  const [checkpoint,setCheckpoint]=useState(milestones[0]);
  const [busy,setBusy]=useState(false);
  const running=useRef(false);
  const chain=chains[kind];
  const copy=copies[kind];
  const displayed=copy??chain;
  const result=audits[kind];
  const records=chain.filter(block=>block.entry.ref===batch).map(block=>block.entry.value);
  function message(text:string){setMessages(previous=>({...previous,[kind]:text}));}
  function setAudit(value:Audit|undefined){setAudits(previous=>({...previous,[kind]:value}));}
  async function doWork(work:()=>Promise<void>){
    if(running.current) return;
    running.current=true;setBusy(true);
    try{await work();}
    catch{message('The browser could not calculate a hash. Open the workbench on localhost or HTTPS.');}
    finally{running.current=false;setBusy(false);}
  }
  function add(){
    void doWork(async()=>{
      const entry:Entry=kind==='vote'?{kind,ref:token,value:choice}:{kind,ref:batch,value:checkpoint};
      const next=await appendBlock(chain,entry);
      if(next.ok) {
        setChains(previous=>({...previous,[kind]:next.chain}));
        setAudit(undefined);
      }
      message(next.ok?`${kind==='vote'?'Ballot':'Checkpoint'} recorded in block ${next.chain.length}`:next.reason);
    });
  }
  function verify(){
    void doWork(async()=>{
      const check=await audit(displayed);
      setAudit(check);
      message(check.ok?'Audit passed · All links and records verified':`Audit failed at block ${check.index} · ${check.reason}`);
    });
  }
  function exportRecords(){
    download(`${kind}-ledger.json`,JSON.stringify({ledger:kind,blocks:displayed},null,2),'application/json');
  }
  return <>
    <div className="gp-steps" role="group" aria-label="Ledger type">
      <button type="button" aria-pressed={kind==='vote'} disabled={busy} onClick={()=>setKind('vote')}>Classroom vote</button>
      <button type="button" aria-pressed={kind==='produce'} disabled={busy} onClick={()=>setKind('produce')}>Produce trace</button>
    </div>
    <div className="ledger-grid">
      <section className="ledger-card"><h3>{kind==='vote'?'Record a mock ballot':'Record a produce checkpoint'}</h3>
        {kind==='vote'?<div className="ledger-inputs">
          <label htmlFor="ledger-token">Vote token</label><select id="ledger-token" value={token} onChange={event=>setToken(event.target.value)}>{tokens.map(item=><option key={item}>{item}</option>)}</select>
          <label htmlFor="ledger-choice">Choice</label><select id="ledger-choice" value={choice} onChange={event=>setChoice(event.target.value)}>{choices.map(item=><option key={item}>{item}</option>)}</select>
        </div>:<div className="ledger-inputs">
          <label htmlFor="ledger-batch">Batch ID</label><select id="ledger-batch" value={batch} onChange={event=>setBatch(event.target.value)}>{batches.map(item=><option key={item}>{item}</option>)}</select>
          <label htmlFor="ledger-checkpoint">Checkpoint</label><select id="ledger-checkpoint" value={checkpoint} onChange={event=>setCheckpoint(event.target.value)}>{milestones.map(item=><option key={item}>{item}</option>)}</select>
        </div>}
        <div className="gp-steps"><button type="button" className="gp-button" onClick={add} disabled={busy||Boolean(copy)}>{kind==='vote'?'Record ballot':'Record checkpoint'}</button></div>
        <p className="ledger-status" role="status">{messages[kind]}</p>
        {kind==='vote'?<div className="ledger-tally" aria-label="Ballot tally">{choices.map(item=><div key={item}><span>{item}</span><strong>{chain.filter(block=>block.entry.value===item).length}</strong></div>)}</div>
          :<ol className="ledger-checkpoints" aria-label="Selected batch history">{milestones.map(item=><li key={item}>{records.includes(item)?<Check size={16}/>:<span aria-hidden="true">○</span>}{item}</li>)}</ol>}
        <p>{kind==='vote'?'Try the same token twice. The tally uses the saved ballots.':'Select a batch to inspect its checkpoints. For this exercise all batch details are fictional.'}</p>
      </section>
      <section className="ledger-card" aria-label="Ledger audit">
        <h3>{copy?'Edited audit copy':'Saved blocks'}</h3>
        {!displayed.length?<p>Add a record to inspect its hash and previous link.</p>:<ol className="ledger-blocks">{displayed.map(block=><li key={block.index} data-invalid={result?.index===block.index||undefined}>
          <strong>Block {block.index} · {block.entry.ref}</strong><span>{block.entry.value}</span>
          <details><summary>Inspect full hashes</summary><dl><dt>Previous</dt><dd>{block.previous}</dd><dt>Stored hash</dt><dd>{block.hash}</dd></dl></details>
        </li>)}</ol>}
        <div className="gp-steps">
          <button type="button" onClick={verify} disabled={busy||!displayed.length}>Verify chain</button>
          <button type="button" disabled={busy||!chain.length} onClick={()=>{
            setCopies(previous=>({...previous,[kind]:copy?undefined:editFirstRecord(chain)}));
            setAudit(undefined);
            message(copy?'Saved chain restored.':'Edited a copy of block 1. Run the audit to compare hashes.');
          }}>{copy?'Restore saved chain':'Edit copy of block 1'}</button>
          <button type="button" disabled={busy||!displayed.length} onClick={exportRecords}>Export JSON</button>
        </div>
      </section>
    </div>
  </>;
}

export default function ClassroomLedgerWorkshop({stage}:{stage:number}) {
  const [ready,setReady]=useState<number[]>([]);
  const [step,setStep]=useState(0);
  return <div className="gp-page ledger-page">
    <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
    <header className="ledger-header"><Link2 size={36} aria-hidden="true"/><div><h1>{ledgerProject.title}</h1><p>{ledgerProject.outcome}</p></div></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a href={link(index)} key={name} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
    <section className="gp-panel ledger-panel" aria-label={stages[stage]}>
      <h2>{stages[stage]}</h2>
      {stage===0&&<div className="ledger-grid"><section className="ledger-card"><h3>What you’ll build</h3><p>Try two uses for a hash-linked record. A classroom tally rejects repeated tokens, and a produce ledger shows a batch’s checkpoints.</p>
        <ol className="gp-workflow">{workflow.map(([name])=><li key={name}>{name}</li>)}</ol>
        <p><strong>Success check</strong> Block one repeat vote, trace one batch to delivery, and locate a changed record by verifying an edited copy.</p>
      </section><LedgerArt/></div>}
      {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="ledger-assets">{assets.map(([name,qty,detail],index)=><article className="ledger-card" key={name}>
        <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
      </article>)}</div></>}
      {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{workflow.map(([name],index)=><button type="button" key={name} onClick={()=>setStep(index)} aria-pressed={step===index}>{index+1}. {name}</button>)}</nav>
        <div className="ledger-card"><h3>{workflow[step][0]}</h3><p>{workflow[step][1]}</p></div>
        <ol className="ledger-flow" aria-label="Data connection map">{['Ballot token or batch ID','Record validation','SHA-256 block and previous link','Tally, trace or audit'].map(name=><li key={name}>{name}</li>)}</ol>
      </>}
      {stage===3&&<div className="ledger-grid"><section className="ledger-card"><h3>Run the local JavaScript trial</h3>
        <p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Node.js 22 or later and a terminal.</p>
        <ol className="gp-program-steps"><li>Save both files in the same folder and run <code>node classroom_ledger_trial.mjs</code>.</li><li>Expect three accepted ballots, a rejected duplicate and three produce checkpoints.</li><li>The runner verifies both saved chains, then verifies an edited copy of each and reports the failure at block 1.</li></ol>
        <div className="gp-steps"><button className="gp-button" type="button" onClick={()=>download('classroom-ledger.mjs',source)}>Download ledger engine</button><a className="gp-button gp-secondary" href="./project-files/classroom_ledger_trial.mjs" download>Download trial runner</a></div>
      </section><section className="ledger-card"><h3>Interpret the audit</h3><p>Changing a field while keeping its recorded hash makes verification fail. Someone with write access to every block could recalculate all hashes, so the final hash is useful as independent evidence only if a trusted party saved it separately.</p>
        <p>This classroom exercise keeps one local copy per ledger. Real elections require ballot secrecy, independent verification and procedures for recounts. Organic certification depends on independent evidence about the produce.</p>
      </section></div>}
      {stage===4&&<LedgerDemo/>}
    </section>
    <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
  </div>;
}
