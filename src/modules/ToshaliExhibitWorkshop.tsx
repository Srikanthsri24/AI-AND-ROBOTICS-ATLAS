import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, Search } from 'lucide-react';
import exhibit from '../data/toshali-exhibit.json';
import { classifyPhrase, minimumLead, minimumSimilarity, type PhraseResult } from '../data/toshali-matcher.mjs';
import matcherSource from '../data/toshali-matcher.mjs?raw';
import { toshaliProject } from '../data/toshali-project';
import { download } from './state';
import '../styles/toshali-exhibit.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const routes=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(stage:number)=>`${root}/${toshaliProject.id}/${routes[stage]}`;
const photoPath=(id:string)=>`./images/toshali-crafts/${id}.jpg`;
const assets=[
  {name:'Craft cards and example phrases', description:'Three bilingual craft names, reference examples and five test phrases.', filename:'toshali-exhibit.json', source:JSON.stringify(exhibit,null,2)+'\n'},
  {name:'Phrase classifier', description:'The browser’s JavaScript matcher, including its similarity cutoff and tie rule.', filename:'toshali-matcher.mjs', source:matcherSource},
  {name:'Verification script', description:'Checks known, unfamiliar and mixed requests with Node.js.', filename:'check-toshali-exhibit.mjs'},
];
const getCraft=(id:string|null)=>exhibit.crafts.find(craft=>craft.id===id);
type Craft=typeof exhibit.crafts[number];

function AssetDownload({asset}:{asset:(typeof assets)[number]}) {
  return asset.source
    ? <button type="button" className="gp-button gp-secondary" onClick={()=>download(asset.filename,asset.source)}><Download size={16}/>Download {asset.filename}</button>
    : <a className="gp-button gp-secondary" href={`./project-files/${asset.filename}`} download><Download size={16}/>Download {asset.filename}</a>;
}

function CraftCard({craft}:{craft:Craft}) {
  return <article className="tsh-craft">
    <img src={photoPath(craft.id)} alt={craft.alt}/>
    <div className="tsh-craft-text">
      <p>{craft.place}</p>
      <h3>{craft.title} <span lang="or">{craft.odia}</span></h3>
      <p>{craft.description}</p>
      <p className="tsh-attribution">Photo resized and cropped for display. <a href={craft.photo} target="_blank" rel="noreferrer">{craft.author}</a> · <a href={craft.licenseUrl} target="_blank" rel="noreferrer">{craft.license}</a></p>
    </div>
  </article>;
}

export default function ToshaliExhibitWorkshop({stage}:{stage:number}) {
  const [ready,setReady]=useState<string[]>([]);
  const [phrase,setPhrase]=useState('');
  const [result,setResult]=useState<PhraseResult|null>(null);
  const [submitted,setSubmitted]=useState('');
  const [feedback,setFeedback]=useState<{reason:string;craftId:string|null;rating:string}[]>([]);
  const [rated,setRated]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const selected=result?getCraft(result.craftId):undefined;
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});});
    return ()=>cancelAnimationFrame(frame);
  },[stage]);

  function testPhrase(value:string) {
    if(!value.trim())return;
    setSubmitted(value.trim());
    setResult(classifyPhrase(value,exhibit.crafts));
    setRated(false);
  }

  return <div className="gp-page gp-build tsh-page">
    <a className="gp-back" href={root}><ArrowLeft size={16}/>All projects</a>
    <header className="gp-title"><h1>{toshaliProject.title}</h1><p>{toshaliProject.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((name,i)=><a key={name} href={link(i)} aria-current={i===stage?'step':undefined}><span>{i+1}</span>{name}</a>)}</nav>
    <section className="gp-panel" aria-labelledby="tsh-stage">
      <h2 id="tsh-stage" ref={heading} tabIndex={-1}>{stages[stage]}</h2>
      {stage===0&&<div className="gp-split">
        <CraftCard craft={exhibit.crafts[0]}/>
        <div className="gp-guide">
          <h3>A craft guide for an exhibition table</h3>
          <p>Toshali Mela showcases handicrafts and handlooms. This classroom prototype lets a visitor type or choose a short craft phrase and open the matching exhibition card.</p>
          <ol><li>Prepare three craft cards and sample phrases in Odia and English.</li><li>Compare the visitor’s words with the example phrases.</li><li>Show the matching card or ask the visitor to try a more specific phrase.</li></ol>
          <div className="gp-check"><Check size={19}/><div><strong>Success criteria</strong><p>Each sample craft phrase opens the right card. A mixed request or an unrelated phrase returns a retry message, and the visitor can see the match scores.</p></div></div>
          <p><a href="https://sidac.odisha.gov.in/en/pages/tncm" target="_blank" rel="noreferrer">Toshali National Crafts Mela</a> · <a href="https://odishatourism.gov.in/en/arts-crafts-handloom" target="_blank" rel="noreferrer">Odisha Tourism craft reference</a></p>
        </div>
      </div>}
      {stage===1&&<div className="gp-guide">
        <p>{ready.length} of {assets.length} assets ready.</p>
        <div className="tsh-assets">{assets.map(asset=><article key={asset.filename} className={ready.includes(asset.filename)?'tsh-ready':undefined}>
          <h3>{asset.name}</h3><p>{asset.description}</p><AssetDownload asset={asset}/>
          <button type="button" className="gp-button gp-secondary" aria-label={`Mark ${asset.name} ready`} aria-pressed={ready.includes(asset.filename)}
            onClick={()=>setReady(list=>list.includes(asset.filename)?list.filter(name=>name!==asset.filename):[...list,asset.filename])}>{ready.includes(asset.filename)?'Ready':'Mark ready'}</button>
        </article>)}</div>
        <div className="tsh-gallery">{exhibit.crafts.map(craft=><CraftCard key={craft.id} craft={craft}/>)}</div>
      </div>}
      {stage===2&&<div className="gp-split">
        <div className="gp-guide">
          <h3>Set up the visitor station</h3>
          <ol>
            <li><strong>Open the demo.</strong> Load the page on the exhibition computer. Try the example buttons to check that photos and Odia text display locally.</li>
            <li><strong>Prepare the phrases.</strong> Open the JSON and group each example under its craft ID. Keep test phrases in the trials list so you can repeat the same checks after an edit.</li>
            <li><strong>Connect input to output.</strong> The matcher breaks the phrase into words and scores each craft by its strongest matching example. The card uses the returned craft ID.</li>
            <li><strong>Practice a retry.</strong> Give two craft names together, then ask the visitor to choose one. Use the match scores to explain why the first request was ambiguous.</li>
          </ol>
        </div>
        <div className="gp-table"><table>
          <caption>Exhibit input and output</caption>
          <thead><tr><th scope="col">Input</th><th scope="col">Expected response</th></tr></thead>
          <tbody>{exhibit.trials.map(trial=><tr key={trial.label}>
            <td><span dir="auto">{trial.phrase}</span></td><td>{getCraft(trial.expected)?.title??'Ask visitor to try again'}</td>
          </tr>)}</tbody>
        </table></div>
      </div>}
      {stage===3&&<div className="gp-guide">
        <div className="gp-program-meta"><div><span>Language</span><strong>JavaScript and JSON</strong></div><div><span>Tools</span><strong>Browser, text editor and optional Node.js</strong></div></div>
        <div className="gp-program-grid">
          <section className="gp-program-card"><h3>Test the visitor flow</h3>
            <ol className="gp-program-steps">
              <li>Try each of the three craft examples. Compare the displayed craft and its Odia name.</li>
              <li>Try the mixed request and the train schedule. The first is ambiguous and the second is unfamiliar.</li>
              <li>Change the case or add punctuation to an English example. The matcher keeps the same result.</li>
              <li>Mark a result helpful or needs improvement, then export the session feedback.</li>
            </ol>
          </section>
          <section className="gp-program-card"><h3>Check the phrase classifier</h3>
            <p>Save all three downloads in one folder. Open a terminal in that folder and run:</p>
            <pre tabIndex={0}><code>node check-toshali-exhibit.mjs</code></pre>
            <p>The matcher requires a similarity of at least {minimumSimilarity*100}% and a lead of at least {minimumLead*100} percentage points. These scores measure word overlap.</p>
            <div className="tsh-actions">{assets.map(asset=><AssetDownload key={asset.filename} asset={asset}/>)}</div>
          </section>
        </div>
      </div>}
      {stage===4&&<div className="tsh-workspace gp-guide">
        <aside className="tsh-controls">
          <h3>Ask the craft guide</h3>
          <form onSubmit={event=>{event.preventDefault();testPhrase(phrase);}}>
            <label htmlFor="tsh-phrase">Craft phrase</label>
            <input id="tsh-phrase" value={phrase} maxLength={120} onChange={event=>setPhrase(event.target.value)} placeholder="Try pattachitra or ପଟ୍ଟଚିତ୍ର"/>
            <button type="submit" className="gp-button" disabled={!phrase.trim()}><Search size={16}/>Find craft</button>
          </form>
          <h4>Try an example</h4>
          <div className="tsh-actions">{exhibit.trials.map(trial=><button key={trial.label} type="button" className="gp-button gp-secondary"
            onClick={()=>{setPhrase(trial.phrase);testPhrase(trial.phrase);}}>{trial.label}</button>)}</div>
        </aside>
        <section className="tsh-result" aria-label="Craft match result">
          <p className="tsh-notice" role="status">{selected?`Match found. ${selected.title}.`:result?.reason==='ambiguous'?'More than one craft matched. Try one craft name at a time.':result?'Phrase not recognized. Try a craft name from the examples.':'Choose an example or type a craft name.'}</p>
          {selected&&<CraftCard craft={selected}/>}
          {result&&<>
            <div className="tsh-scores">
              <h3>Word-match scores</h3>
              <p>Phrase tested <q dir="auto">{submitted}</q></p>
              {result.ranks.map(rank=><div key={rank.id}>
                <label htmlFor={`tsh-score-${rank.id}`}>{getCraft(rank.id)?.title} <strong>{Math.round(rank.score*100)}%</strong></label>
                <meter id={`tsh-score-${rank.id}`} min={0} max={1} value={rank.score}/>
                {rank.example&&<small>Closest example <q dir="auto">{rank.example}</q></small>}
              </div>)}
            </div>
            <div className="tsh-actions">
              {['Helpful','Needs improvement'].map(rating=><button type="button" key={rating} className="gp-button gp-secondary" disabled={rated}
                onClick={()=>{setFeedback(list=>[...list,{reason:result.reason,craftId:result.craftId,rating}]);setRated(true);}}>{rating}</button>)}
              {feedback.length>0&&<button type="button" className="gp-button gp-secondary" onClick={()=>
                download('toshali-feedback.json',JSON.stringify(feedback,null,2)+'\n','application/json')}><Download size={16}/>Export feedback ({feedback.length})</button>}
            </div>
          </>}
        </section>
      </div>}
    </section>
    <nav className="gp-footer" aria-label="Stage navigation">
      {stage>0?<a className="gp-button gp-secondary" href={link(stage-1)}><ArrowLeft size={16}/>{stages[stage-1]}</a>:<span/>}
      {stage<4&&<a className="gp-button" href={link(stage+1)}>{stages[stage+1]}<ArrowRight size={16}/></a>}
    </nav>
  </div>;
}
