import { useState } from 'react';
import { ArrowLeft, ArrowRight, BusFront, MapPin } from 'lucide-react';
import { busSeats, comparePlan, peakMinutes, plans, stops, stopCsv } from '../data/transit-planner.mjs';
import source from '../data/transit-planner.mjs?raw';
import { transitProject } from '../data/transit-project';
import { download } from './state';
import '../styles/transit-workshop.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${transitProject.id}/${paths[index]}`;
const steps=[
 ['Define the trip and time window','Count people at five origins who want to reach the same central hub during a two-hour morning window. Each person appears once in the sample table.'],
 ['Map the two route options','Both plans serve Market. Compare the stops each plan includes with the remaining origins. Coverage is the share of demand at included stops.'],
 ['Calculate seats and wait','Multiply 30 seats by the departure count. Divide 120 minutes by the departure count for the headway. Estimate waiting time as half the headway for evenly distributed arrivals.'],
 ['Compare service trade-offs','Keep route coverage, available seats and fleet needs separate. A route can serve more origins and still leave riders without seats. Bus needs are estimated by dividing cycle time by headway and rounding up.'],
];
const assets=[
 ['Stop-demand CSV','5 rows','Sample rider counts by origin over the same two-hour period.'],
 ['Route sketches','2 plans','Show which origins each plan connects to the central hub.'],
 ['Capacity assumptions','30 seats per bus','Calculate peak-window seats and the demand above capacity.'],
 ['Departure scenarios','3–8 departures','Vary service frequency and compare expected wait and buses required.'],
 ['Planner and trial','2 JavaScript files','Reproduce the figures locally without a spreadsheet.'],
];
const positions:Record<string,[number,number]>={park:[17,24],market:[39,48],school:[61,19],clinic:[54,77],library:[80,76],hub:[85,38]};
const visualPaths={A:['park','market','school','hub'],B:['market','clinic','library','hub']};

function RouteMap({plan,select,activeStop}:{plan:'A'|'B';select?:(id:string)=>void;activeStop?:string}){
 const route=visualPaths[plan];
 return <div className="tr-map" role="group" aria-label={`Plan ${plan} route map`}>
   <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
     <polyline points={visualPaths.A.map(id=>positions[id].join(',')).join(' ')} className={plan==='A'?'tr-active':'tr-alternate'}/>
     <polyline points={visualPaths.B.map(id=>positions[id].join(',')).join(' ')} className={plan==='B'?'tr-active':'tr-alternate'}/>
   </svg>
   {stops.map(stop=>{
    const [x,y]=positions[stop.id], served=route.includes(stop.id);
    const content=<><span>{stop.name}</span><small>{stop.demand} riders</small></>;
    const style={left:x+'%',top:y+'%'};
    return select?<button key={stop.id} style={style} type="button" className="tr-stop" data-served={served} aria-pressed={activeStop===stop.id} onClick={()=>select(stop.id)}>{content}</button>
      :<span key={stop.id} style={style} className="tr-stop" data-served={served}>{content}</span>;
   })}
   <span className="tr-stop tr-hub" style={{left:'85%',top:'38%'}}><MapPin size={13}/> Central hub</span>
 </div>;
}

function TransitDemo(){
 const [plan,setPlan]=useState<'A'|'B'>('A');
 const [departures,setDepartures]=useState(4);
 const [activeStop,select]=useState('market');
 const option=plans.find(item=>item.id===plan)!;
 const stop=stops.find(item=>item.id===activeStop)!;
 const stats=comparePlan(plan,departures);
 const other=comparePlan(plan==='A'?'B':'A',departures);
 return <div className="tr-grid">
  <section className="tr-card"><h3>Choose a route</h3>
   <div className="gp-steps" role="group" aria-label="Route option">{plans.map(item=><button type="button" key={item.id} aria-pressed={item.id===plan} onClick={()=>setPlan(item.id==='A'?'A':'B')}>{item.name}</button>)}</div>
   <RouteMap plan={plan} select={select} activeStop={activeStop}/>
   <p className="tr-stop-result" role="status"><strong>{stop.name}</strong> · {stop.demand} riders · {option.route.includes(stop.id)?'Served':'Omitted'} in Plan {plan}</p>
   <label className="tr-range">Departures in two hours <output>{departures}</output><input type="range" min={3} max={8} value={departures} onChange={event=>setDepartures(event.target.valueAsNumber)}/></label>
   <div className="gp-steps"><button type="button" disabled={departures===3} onClick={()=>setDepartures(value=>value-1)}>Remove departure</button><button type="button" disabled={departures===8} onClick={()=>setDepartures(value=>value+1)}>Add departure</button></div>
  </section>
  <section className="tr-card" aria-label="Plan comparison"><h3>Compare the two plans</h3><p>Same departure count for each plan · {busSeats} seats per bus</p>
   <table className="tr-table"><thead><tr><th scope="col">Measure</th><th scope="col">Plan {plan}</th><th scope="col">Plan {plan==='A'?'B':'A'}</th></tr></thead><tbody>
    {[['Riders at served stops',stats.served,other.served],['Demand coverage',stats.coverage.toFixed(1)+'%',other.coverage.toFixed(1)+'%'],
      ['Riders at omitted stops',stats.missed,other.missed],['Peak seats',stats.seats,other.seats],
      ['Demand above seats',stats.overflow,other.overflow],['Estimated wait',stats.wait.toFixed(1)+' min',other.wait.toFixed(1)+' min'],
      ['Buses needed',stats.buses,other.buses]].map(([name,current,alternative])=><tr key={name}><th scope="row">{name}</th><td>{current}</td><td>{alternative}</td></tr>)}
   </tbody></table>
   <p className="tr-note">Plan {plan} · {option.cycle} min round trip · {stats.headway.toFixed(1)} min headway. Peak capacity assumes no one gets off before the hub. The wait estimate assumes evenly spaced departures and random arrivals. It excludes extra waiting when buses fill.</p>
  </section>
 </div>;
}

export default function TransitWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page tr-page">
  <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
  <header className="tr-header"><BusFront size={34} aria-hidden="true"/><div><h1>{transitProject.title}</h1><p>{transitProject.outcome}</p></div></header>
  <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
  <section className="gp-panel tr-panel" aria-label={stages[stage]}><h2>{stages[stage]}</h2>
   {stage===0&&<div className="tr-grid"><section className="tr-card"><h3>What you’ll build</h3>
    <p>Use synthetic riders-to-hub counts to compare two routes over a {peakMinutes}-minute morning window. Then change departures to compare how each service plan performs.</p>
    <ol className="gp-workflow">{steps.map(([name])=><li key={name}>{name}</li>)}</ol>
    <p><strong>Success check</strong> Explain which route covers more demand, and how one extra departure changes wait, capacity and fleet needs.</p>
   </section><section className="tr-card tr-art" aria-label="Route sketch preview"><h3>Morning routes to Central hub</h3><RouteMap plan="A"/><p><strong>Solid</strong> Plan A · <strong>Dashed</strong> Plan B</p></section></div>}
   {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="tr-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="tr-card">
    <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
   </article>)}</div>
   <section className="tr-card"><h3>Stop demand</h3><table className="tr-table"><thead><tr><th scope="col">Origin stop</th><th scope="col">Riders to Central hub</th></tr></thead><tbody>{stops.map(stop=><tr key={stop.id}><th scope="row">{stop.name}</th><td>{stop.demand}</td></tr>)}</tbody></table>
    <button className="gp-button gp-secondary" type="button" onClick={()=>download('transit_stops.csv',stopCsv,'text/csv')}>Download stops CSV</button></section></>}
   {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{steps.map(([name],index)=><button type="button" key={name} aria-pressed={index===step} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
    <div className="tr-card"><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div>
    <ol className="tr-flow" aria-label="Data connection map">{['Stop demand','Route membership','Departures and capacity','Coverage, wait and fleet needs'].map(name=><li key={name}>{name}</li>)}</ol></>}
   {stage===3&&<div className="tr-grid"><section className="tr-card"><h3>Run the route comparison</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Browser, or Node.js and a terminal.</p>
    <ol className="gp-program-steps"><li>Save both files in one folder.</li><li>Run <code>node transit_trial.mjs</code>.</li><li>At four departures, expect 138 riders covered in Plan A and 114 in Plan B. Plan A has 18 riders above its 120 seats.</li><li>Add a fifth departure. Plan A has enough total seats and a 12-minute estimated wait. It now needs two buses.</li></ol>
    <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('transit-planner.mjs',source)}>Download planner</button><a className="gp-button gp-secondary" href="./project-files/transit_trial.mjs" download>Download trial runner</a></div>
   </section><section className="tr-card"><h3>Read the estimates</h3><p>Count unserved origins separately from overflow at covered stops. Adding departures can lower overflow and wait, while only changing the route can add a stop to coverage.</p><p>The sample assumes consistent trips to one hub and uses scheduled cycle time. Field data would be needed to account for traffic, transfers and uneven arrivals.</p></section></div>}
   {stage===4&&<TransitDemo/>}
  </section>
  <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
