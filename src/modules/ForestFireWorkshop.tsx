import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Satellite } from 'lucide-react';
import { evaluate, forestCsv, tiles } from '../data/forest-fire.mjs';
import source from '../data/forest-fire.mjs?raw';
import { forestFireProject } from '../data/forest-fire-project';
import { download } from './state';
import '../styles/forest-fire-workshop.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${forestFireProject.id}/${paths[index]}`;
const steps=[
 ['Align the early image and tile table','Each grid cell has a heat index, a vegetation dryness index, and a cloud percentage. The false-color preview and the table use the same tile IDs.'],
 ['Fit two reference points','Average the heat and dryness of six separately labeled calibration samples, grouped by whether the later sample had a fire marker.'],
 ['Mask clouds and review candidates','Withhold the score when cloud cover reaches 50%. For visible tiles, compare distances to each reference point. Flag scores at or above the selected cutoff.'],
 ['Reveal the later reference','Compare screened tiles with a separate fictional outcome. Count a false alert or a visible miss. Keep masked tiles outside the visible error counts.'],
];
const assets=[
 ['Synthetic early imagery','12 tiles','Switch between a terrain view and a thermal palette. Both show the same example grid.'],
 ['Calibration samples','6 rows','Use three earlier examples per class to fit the heat and dryness reference points.'],
 ['Cloud mask','50% cutoff','Exclude cells when the synthetic cloud fraction reaches the cutoff.'],
 ['Later reference','12 labels','Reveal fictional fire markers after scoring the early scene.'],
 ['Screening module and runner','2 JavaScript files','Reproduce the tile scores and evaluation counts locally.'],
];
type Layer='Terrain'|'Thermal';
function Raster({layer}:{layer:Layer}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const ctx=canvas.current?.getContext('2d');
  if(!ctx)return;
  const width=400,height=240,img=ctx.createImageData(width,height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const tile=tiles[Math.floor(y/80)*4+Math.floor(x/100)];
   const terrain=(Math.sin(x*.035+y*.063)+Math.cos(y*.071-x*.021)+Math.sin(x*.089-y*.017))/3;
   const grain=((x*113+y*193+(x*y)%241)%97)/97;
   const river=Math.abs(x-(75+y*.55+Math.sin(y*.044)*20))<3+grain*5;
   const cloud=tile.cloud>=50 && terrain+grain*.6>-.28;
   const t=tile.heat/100;
   const color=cloud?[199+grain*42,210+grain*35,219+grain*33]:layer==='Thermal'
    ?[44+t*183+terrain*19,44+t*81+grain*31,91-t*39+terrain*22]
    :river?[52+grain*17,104+grain*22,123+grain*24]:[39+tile.dry*.29+terrain*27+grain*23,83+terrain*47+grain*25,62+terrain*27+grain*18];
   const index=(y*width+x)*4;
   img.data[index]=color[0];img.data[index+1]=color[1];img.data[index+2]=color[2];img.data[index+3]=255;
  }
  ctx.putImageData(img,0,0);
 },[layer]);
 return <canvas ref={canvas} width={400} height={240} role="img" aria-label={`Synthetic ${layer.toLowerCase()} satellite raster`}/>;
}
function FireMap({layer,threshold,active,onSelect,reveal=false}:{layer:Layer;threshold:number;active?:string;onSelect?:(id:string)=>void;reveal?:boolean}){
 const rows=evaluate(threshold).rows;
 return <div className="ff-map"><Raster layer={layer}/>
  <div className="ff-tiles" aria-label="Satellite tiles">{rows.map(row=>{
   const content=<><span>{row.id}</span><small>{row.state==='Cloud masked'?'Cloud':reveal&&row.laterFire?'Later fire':row.state==='Review'?'Review':''}</small></>;
   return onSelect?<button key={row.id} type="button" aria-label={`Tile ${row.id}`} aria-pressed={row.id===active} data-state={row.state} onClick={()=>onSelect(row.id)}>{content}</button>:
    <div key={row.id} data-state={row.state}>{content}</div>;
  })}</div>
 </div>;
}
function FireDemo(){
 const [selected,select]=useState('A2');
 const [threshold,setThreshold]=useState(.65);
 const [layer,setLayer]=useState<Layer>('Terrain');
 const [later,setLater]=useState(false);
 const report=evaluate(threshold);
 const row=report.rows.find(item=>item.id===selected)!;
 return <div className="ff-grid">
  <section className="ff-card"><h3>Inspect the early pass</h3>
   <div className="gp-steps" role="group" aria-label="Image layers">{(['Terrain','Thermal'] as const).map(name=><button type="button" key={name} aria-pressed={name===layer} onClick={()=>setLayer(name)}>{name}</button>)}</div>
   <FireMap {...{layer,threshold}} active={selected} onSelect={select} reveal={later}/>
   <label className="ff-range" htmlFor="ff-limit"><span>Review threshold</span><output>{Math.round(threshold*100)}%</output><input id="ff-limit" type="range" min={40} max={95} value={Math.round(threshold*100)} onChange={event=>setThreshold(event.target.valueAsNumber/100)}/></label>
   <button className="gp-button gp-secondary" type="button" onClick={()=>setLater(!later)}>{later?'Hide later reference':'Reveal later reference'}</button>
  </section>
  <section className="ff-card" aria-label="Selected tile details"><h3>Tile {row.id}</h3>
   <dl className="ff-values"><div><dt>Heat index</dt><dd>{row.cloud>=50?'Unavailable':row.heat}</dd></div><div><dt>Dryness index</dt><dd>{row.cloud>=50?'Unavailable':row.dry}</dd></div><div><dt>Cloud cover</dt><dd>{row.cloud}%</dd></div><div><dt>Review score</dt><dd>{row.score===null?'Withheld':Math.round(row.score*100)+'%'}</dd></div></dl>
   <p className="ff-status" role="status">{row.state}{row.score===null?' · Insufficient visibility':''}</p>
   {later&&<><p><strong>Later reference</strong> {row.laterFire?'Fire marker present':'No fire marker'}</p>
    <dl className="ff-values" aria-label="Visible screening results"><div><dt>Hits</dt><dd>{report.hits}</dd></div><div><dt>False alerts</dt><dd>{report.falseAlerts}</dd></div><div><dt>Visible misses</dt><dd>{report.missed}</dd></div><div><dt>Masked</dt><dd>{report.masked}</dd></div></dl></>}
   <p>The review score is a similarity measure between generated reference points. The later labels are kept separate from scoring.</p>
  </section>
 </div>;
}
export default function ForestFireWorkshop({stage}:{stage:number}){
 const [ready,setReady]=useState<number[]>([]);
 const [step,setStep]=useState(0);
 return <div className="gp-page ff-page">
  <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
  <header className="ff-header"><Satellite size={34} aria-hidden="true"/><div><h1>{forestFireProject.title}</h1><p>{forestFireProject.outcome}</p></div></header>
  <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
  <section className="gp-panel ff-panel" aria-label={stages[stage]}><h2>{stages[stage]}</h2>
   {stage===0&&<div className="ff-grid"><section className="ff-card"><h3>What you’ll build</h3><p>Screen a fictional landscape from an early pass, then check the review flags against a later observation.</p>
    <ol className="gp-workflow">{steps.map(([name])=><li key={name}>{name}</li>)}</ol>
    <p><strong>Success check</strong> Find a clear hit, a false alert, a visible miss, and a masked tile.</p>
   </section><section className="ff-card ff-cover" aria-label="Forest screening preview"><h3>Synthetic satellite scene</h3><FireMap layer="Terrain" threshold={.65}/></section></div>}
   {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="ff-assets">{assets.map(([name,qty,detail],index)=><article key={name} className="ff-card">
    <h3>{name}</h3><strong>{qty}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(item=>item!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
   </article>)}</div><button type="button" className="gp-button gp-secondary" onClick={()=>download('forest_fire_tiles.csv',forestCsv,'text/csv')}>Download synthetic CSV</button></>}
   {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{steps.map(([name],index)=><button type="button" key={name} aria-pressed={index===step} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
    <div className="ff-card"><h3>{steps[step][0]}</h3><p>{steps[step][1]}</p></div><ol className="ff-flow" aria-label="Data connection map">{['Early tile features','Cloud mask','Review score and threshold','Independent later labels'].map(item=><li key={item}>{item}</li>)}</ol></>}
   {stage===3&&<div className="ff-grid"><section className="ff-card"><h3>Run the screening trial</h3><p><strong>Language</strong> JavaScript ES modules. <strong>Tools</strong> Browser or Node.js and a terminal.</p>
    <ol className="gp-program-steps"><li>Save both files in one folder.</li><li>Run <code>node forest_fire_trial.mjs</code>.</li><li>At 65%, expect two hits, one false alert, one visible miss, and two masked tiles.</li><li>Inspect A3. Its score is withheld even though the later reference shows a fire marker.</li></ol>
    <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>download('forest-fire.mjs',source)}>Download screening module</button><a className="gp-button gp-secondary" href="./project-files/forest_fire_trial.mjs" download>Download trial runner</a></div>
   </section><section className="ff-card"><h3>Interpret the map</h3><p>Look for both uncertainty and false alerts. Warm, dry conditions can produce a review flag even when the later scene shows no fire marker. This exercise is based entirely on simulated imagery and observations.</p></section></div>}
   {stage===4&&<FireDemo/>}
  </section>
  <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
 </div>;
}
