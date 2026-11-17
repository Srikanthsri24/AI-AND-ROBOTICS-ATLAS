import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChartLine } from 'lucide-react';
import { evaluate, stockCsv, type CompareDay } from '../data/stock-trend.mjs';
import source from '../data/stock-trend.mjs?raw';
import { stockTrendProject } from '../data/stock-trend-project';
import { download } from './state';
import '../styles/stock-trend.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${stockTrendProject.id}/${paths[index]}`;
const steps=[
 ['Align posts and prices','Use each day’s positive and negative post counts and closing price. The following close supplies the up/down label only after the prediction has been made.'],
 ['Split by time','Fit a rule from days 1–8. By the close of day 9, the day 8 outcome is known. Evaluate forecasts made from day 9 onwards using the frozen rule.'],
 ['Build a baseline','Choose a constant Up or Down prediction using the more common early outcome. Compare the baseline and sentiment rule on exactly the same later days.'],
 ['Inspect missed predictions','Read the later day’s signal, predicted direction and actual direction. Record a miss where sentiment and next-day price direction disagree.'],
];
const assets=[
 ['Fictional post counts','16 days','Daily totals already labeled as positive or negative.'],
 ['Closing prices','17 fictional values','Current and following closes are paired on each prediction row.'],
 ['Sentiment rule','2 candidates','Choose whether to follow or reverse the sign of the early sentiment score.'],
 ['Direction baseline','1 constant rule','Use the early majority direction for every prediction.'],
 ['JavaScript trial kit','2 files','Same sample data and calculations used by the browser.'],
];

function ScoreStrip({early,later}:{early:number;later:number}){
 return <div className="st-summary"><div><span>Early fit</span><strong>{early} / 8</strong></div><div><span>Later evaluation</span><strong>{later} / 8</strong></div></div>;
}
function DayChart({rows,selected,select}:{rows:CompareDay[];selected?:number;select?:(day:number)=>void}){
 return <div role="group" aria-label="Daily sentiment and prediction chart" className="st-chart">
  {rows.map(row=>{
   const content=<><span className="st-axis" aria-hidden="true"><i data-negative={row.score<0} style={{height:Math.abs(row.score)*46+'%'}}/></span><strong>{row.day}</strong><small>{row.correct?'Hit':'Miss'}</small></>;
   return select?<button type="button" key={row.day} aria-pressed={row.day===selected} onClick={()=>select(row.day)} aria-label={`Day ${row.day} ${row.correct?'correct':'missed'}`}>{content}</button>:<span className="st-chart-day" key={row.day}>{content}</span>;
  })}
 </div>;
}
function TrendDemo(){
 const [split,setSplit]=useState<'fit'|'test'>('fit');
 const [selected,select]=useState(1);
 const result=evaluate(split);
 const row=result.rows.find(item=>item.day===selected)??result.rows[0];
 return <div className="st-grid">
  <section className="st-card"><h3>Compare the two time windows</h3>
   <div className="gp-steps" role="group" aria-label="Evaluation window">
    <button type="button" aria-pressed={split==='fit'} onClick={()=>{setSplit('fit');select(1);}}>Early fit · days 1–8</button>
    <button type="button" aria-pressed={split==='test'} onClick={()=>{setSplit('test');select(9);}}>Later test · days 9–16</button>
   </div>
   <div className="st-summary" aria-label="Accuracy comparison"><div><span>Sentiment rule</span><strong>{result.correct} / 8</strong></div><div><span>Always {result.baseline.toLowerCase()} baseline</span><strong>{result.baselineCorrect} / 8</strong></div></div>
   <p>Bars show signed sentiment. Select a day to inspect the forecast.</p>
   <DayChart rows={result.rows} selected={selected} select={select}/>
  </section>
  <section className="st-card" aria-label="Selected day analysis"><h3>Day {row.day} · {row.correct?'Correct':'Missed prediction'}</h3>
   <dl className="st-day">
    <div><dt>Positive / negative posts</dt><dd>{row.positive} / {row.negative}</dd></div>
    <div><dt>Sentiment score</dt><dd>{row.score.toFixed(2)}</dd></div>
    <div><dt>Prediction</dt><dd>{row.predicted}</dd></div>
    <div><dt>Actual next-day direction</dt><dd>{row.actual}</dd></div>
    <div><dt>Fictional closing prices</dt><dd>{row.close} → {row.nextClose}</dd></div>
   </dl>
   <p role="status" className="st-status">{row.correct?'The rule matched the next-day direction.':'The rule missed the next-day direction.'}</p>
   <p>The fitted rule follows the sign of sentiment. Its strong early score does not carry over to the later sample.</p>
  </section>
 </div>;
}
export default function StockTrendWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page st-page">
  <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
  <header className="st-header"><ChartLine size={34} aria-hidden="true"/><div><h1>{stockTrendProject.title}</h1><p>{stockTrendProject.outcome}</p></div></header>
  <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
  <section className="gp-panel st-panel" aria-label={stages[stage]}><h2>{stages[stage]}</h2>
   {stage===0&&<div className="st-grid"><section className="st-card"><h3>What you’ll build</h3><p>Use a fictional time series to learn how chronological evaluation can expose a prediction rule that looked good during fitting.</p>
    <ol className="gp-workflow">{steps.map(([name])=><li key={name}>{name}</li>)}</ol>
    <p><strong>Success check</strong> Compare the fixed rule and baseline on later data, then identify a missed forecast.</p>
   </section><section className="st-card st-cover" aria-label="Sentiment experiment preview"><h3>One rule across two periods</h3><ScoreStrip early={evaluate('fit').correct} later={evaluate('test').correct}/><DayChart rows={evaluate('test').rows}/><p>Later predictions · Days 9–16</p></section></div>}
   {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="st-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="st-card">
    <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
   </article>)}</div><button type="button" className="gp-button gp-secondary" onClick={()=>download('stock_trend_samples.csv',stockCsv,'text/csv')}>Download fictional CSV</button></>}
   {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{steps.map(([name],index)=><button type="button" key={name} aria-pressed={index===step} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
    <div className="st-card"><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div><ol className="st-flow" aria-label="Data connection map">{['Day’s post counts','Signed sentiment score','Direction forecast','Next-day close and evaluation'].map(item=><li key={item}>{item}</li>)}</ol></>}
   {stage===3&&<div className="st-grid"><section className="st-card"><h3>Run the chronological trial</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Browser or Node.js and a terminal.</p>
    <ol className="gp-program-steps"><li>Save both scripts in the same folder.</li><li>Run <code>node stock_trend_trial.mjs</code>.</li><li>Expect 7 of 8 correct early and 2 of 8 correct later, versus 5 of 8 for the later baseline.</li><li>Inspect day 9. The positive score predicted Up, but the following close fell.</li></ol>
    <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('stock-trend.mjs',source)}>Download trend model</button><a className="gp-button gp-secondary" href="./project-files/stock_trend_trial.mjs" download>Download trial runner</a></div>
   </section><section className="st-card"><h3>Read the score</h3><p>Subtract negative posts from positive posts, then divide by their combined count. Fit the direction rule only on early outcomes and leave it fixed for later evaluation.</p><p>The data and prices here are invented for a lesson on evaluation.</p></section></div>}
   {stage===4&&<TrendDemo/>}
  </section>
  <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
