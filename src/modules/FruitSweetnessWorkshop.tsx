import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChartNoAxesCombined } from 'lucide-react';
import { bounds, estimate, fruitProject, fruitSteps, heldOut, meanError, metrics, model, training } from '../data/fruit-sweetness';
import '../styles/fruit-sweetness.css';

const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const paths=['overview','components','assembly','test','demo'];
const root='#/project-builder';
const link=(index:number)=>`${root}/${fruitProject.id}/${paths[index]}`;
const files='./project-files/';
const assets=[
  ['Simulated sensor station','2 readings','Send a color and firmness index per fruit. Use the controls in the finished demo.'],
  ['Labeled dataset','16 rows','Twelve samples fit the model. Four weigh its accuracy. Each row has a fictional reference °Bx value.'],
  ['Regression model','3 coefficients','An intercept and one weight per sensor. The model uses ordinary least squares.'],
  ['Flask endpoint','1 Python file','Use the same CSV on your computer. Send a JSON packet and inspect the returned estimate and range flag.'],
  ['Evaluation chart','4 held-out comparisons','Compare predicted and reference values and inspect the mean absolute error.'],
];

function Evaluation() {
  return <section className="fruit-card fruit-evaluation" aria-label="Held-out evaluation">
    <h3>Held-out evaluation</h3>
    <p className="fruit-mae"><strong>{meanError.toFixed(2)} °Bx</strong><span>Mean absolute error across four samples</span></p>
    <div className="fruit-key"><span>Reference</span><span>Estimated</span></div>
    <div className="fruit-axis" aria-hidden="true">{[0,4,8,12,16].map(value=><span key={value}>{value} °Bx</span>)}</div>
    <ul className="fruit-bars">{metrics.map(row=><li key={row.id}>
      <strong>{row.id}</strong>
      <div className="fruit-bar-pair" aria-label={`${row.id}, reference ${row.brix.toFixed(1)}, estimated ${row.predicted.toFixed(2)} degrees Brix`}>
        <div className="fruit-bar" style={{width:`${row.brix/16*100}%`}}><span>{row.brix.toFixed(1)}</span></div>
        <div className="fruit-bar" style={{width:`${row.predicted/16*100}%`}}><span>{row.predicted.toFixed(2)}</span></div>
      </div>
    </li>)}</ul>
  </section>;
}

function SampleTable() {
  const [split,setSplit]=useState<'train'|'test'>('train');
  const rows=split==='train'?training:heldOut;
  return <section className="fruit-card">
    <h3>Inspect the dataset</h3>
    <div className="gp-steps" role="group" aria-label="Dataset split">
      <button type="button" aria-pressed={split==='train'} onClick={()=>setSplit('train')}>Training · 12</button>
      <button type="button" aria-pressed={split==='test'} onClick={()=>setSplit('test')}>Held out · 4</button>
    </div>
    <div className="fruit-table-wrap"><table className="fruit-table"><caption>{split==='train'?'Training rows':'Held-out rows'}</caption>
      <thead><tr><th scope="col">Fruit</th><th scope="col">Color</th><th scope="col">Firmness</th><th scope="col">Reference °Bx</th></tr></thead>
      <tbody>{rows.map(row=><tr key={row.id}><th scope="row">{row.id}</th><td>{row.color}</td><td>{row.firmness}</td><td>{row.brix.toFixed(1)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

function FruitDemo() {
  const [color,setColor]=useState(55);
  const [firmness,setFirmness]=useState(51);
  const [sampleId,setSampleId]=useState('F14');
  const [reading,setReading]=useState<ReturnType<typeof estimate>|null>(null);
  const sample=heldOut.find(row=>row.id===sampleId);
  function choose(id:string) {
    setSampleId(id);setReading(null);
    const row=heldOut.find(item=>item.id===id);
    if(row){ setColor(row.color);setFirmness(row.firmness); }
    if(id==='outside'){ setColor(97);setFirmness(14); }
  }
  return <div className="fruit-grid">
    <section className="fruit-card">
      <h3>Send a sensor packet</h3>
      <label className="fruit-field" htmlFor="fruit-sample">Load a reading</label>
      <select id="fruit-sample" value={sampleId} onChange={event=>choose(event.target.value)}>
        {heldOut.map(row=><option key={row.id} value={row.id}>Held-out fruit {row.id}</option>)}
        <option value="outside">Outside training range</option><option value="custom">Custom reading</option>
      </select>
      <label className="fruit-slider" htmlFor="fruit-color"><span>Color index</span><output>{color}</output>
        <input id="fruit-color" type="range" min="0" max="100" value={color} onChange={event=>{setColor(event.target.valueAsNumber);setSampleId('custom');setReading(null);}}/>
      </label>
      <label className="fruit-slider" htmlFor="fruit-firmness"><span>Firmness index</span><output>{firmness}</output>
        <input id="fruit-firmness" type="range" min="0" max="100" value={firmness} onChange={event=>{setFirmness(event.target.valueAsNumber);setSampleId('custom');setReading(null);}}/>
      </label>
      <pre aria-label="Outgoing JSON packet"><code>{JSON.stringify({color,firmness},null,2)}</code></pre>
      <button className="gp-button" type="button" onClick={()=>setReading(estimate({color,firmness}))}>Send packet</button>
      <div className="fruit-result" role="status">
        {reading?<><strong>{reading.predicted.toFixed(2)} °Bx</strong><p>{reading.outside?'Outside training range · Review this estimate':'Inside both training ranges'}</p>
          {sample&&<p>Reference {sample.brix.toFixed(1)} °Bx · Absolute error {Math.abs(sample.brix-reading.predicted).toFixed(2)} °Bx</p>}</>:<p>Send the packet to calculate an estimate.</p>}
      </div>
      <p className="fruit-small">Training color {bounds.color.join('–')} · firmness {bounds.firmness.join('–')}. The range check flags extrapolation along either input.</p>
    </section>
    <Evaluation/>
  </div>;
}

export default function FruitSweetnessWorkshop({stage}:{stage:number}) {
  const [ready,setReady]=useState<number[]>([]);
  const [step,setStep]=useState(0);
  return <div className="gp-page fruit-page">
    <a href={root} className="gp-back"><ArrowLeft size={18}/> All guided builds</a>
    <header className="fruit-header"><ChartNoAxesCombined size={34} aria-hidden="true"/><div><h1>{fruitProject.title}</h1><p>{fruitProject.outcome}</p></div></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((name,index)=><a key={name} href={link(index)} aria-current={stage===index?'step':undefined}><span aria-hidden="true">{index+1}</span>{name}</a>)}</nav>
    <section className="gp-panel fruit-panel" aria-label={stages[stage]}>
      <h2>{stages[stage]}</h2>
      {stage===0&&<div className="fruit-grid"><section className="fruit-card"><h3>What you’ll build</h3>
        <p>A tabletop IoT data exercise that predicts fictional reference °Bx from two simulated inputs. The browser runs the full exercise. A downloadable Flask version receives the same sensor packets locally.</p>
        <ol className="gp-workflow">{fruitSteps.map(([name])=><li key={name}>{name}</li>)}</ol>
        <p><strong>Success check</strong> Predict a held-out sample, check its error, and send a reading outside the fitted ranges to trigger a review flag.</p>
      </section><Evaluation/></div>}
      {stage===1&&<><p role="status">{ready.length} of {assets.length} assets ready</p><div className="fruit-assets">{assets.map(([name,quantity,detail],index)=><article className="fruit-card" key={name}>
        <h3>{name}</h3><strong>{quantity}</strong><p>{detail}</p><button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={ready.includes(index)} onClick={()=>setReady(previous=>previous.includes(index)?previous.filter(id=>id!==index):[...previous,index])}>{ready.includes(index)?'Ready':'Mark ready'}</button>
      </article>)}</div><SampleTable/></>}
      {stage===2&&<><nav className="gp-steps" aria-label="Setup steps">{fruitSteps.map(([name],index)=><button type="button" key={name} aria-pressed={step===index} onClick={()=>setStep(index)}>{index+1}. {name}</button>)}</nav>
        <div className="fruit-card"><h3>{fruitSteps[step][0]}</h3><p>{fruitSteps[step][1]}</p></div>
        <ol className="fruit-flow" aria-label="Data connection map">{['Color and firmness sensor packet','Train-only coefficient fit','Flask JSON response','Held-out error or range review'].map(name=><li key={name}>{name}</li>)}</ol>
      </>}
      {stage===3&&<div className="fruit-grid"><section className="fruit-card"><h3>Run the local Python version</h3><p><strong>Language</strong> Python 3 and JSON. <strong>Tools</strong> Flask and a terminal.</p>
        <ol className="gp-program-steps"><li>Save the Python file and CSV in the same folder.</li><li>Install Flask with <code>python3 -m pip install "Flask&gt;=3.1,&lt;4"</code>.</li>
          <li>Start the service with <code>python3 fruit_sweetness.py</code>. Open <code>http://127.0.0.1:5055/</code> to see the test error.</li>
          <li>Send a fruit packet. The response for this input should be about {estimate({color:55,firmness:51}).predicted.toFixed(2)} °Bx with a false range flag.</li></ol>
        <pre><code>{`curl -H 'Content-Type: application/json' \\
  -d '{"color":55,"firmness":51}' \\
  http://127.0.0.1:5055/predict`}</code></pre>
        <div className="gp-steps"><a className="gp-button" href={files+'fruit_sweetness.py'} download>Download Flask app</a><a className="gp-button gp-secondary" href={files+'fruit_samples.csv'} download>Download sample CSV</a></div>
      </section><section className="fruit-card"><h3>Verify the model</h3>
        <p>Estimated °Bx = {model.intercept.toFixed(3)} + {model.color.toFixed(4)} × color − {Math.abs(model.firmness).toFixed(4)} × firmness.</p>
        <ul className="gp-program-steps"><li>Send color 97 and firmness 14. Check that the range flag is true.</li><li>Send a reading below 0 or above 100. The endpoint should return HTTP 400.</li><li>Check that the four held-out errors average {meanError.toFixed(2)} °Bx.</li></ul>
        <p>The data is synthetic. Real fruit requires reference readings and validation across varieties, lighting, and handling conditions.</p>
      </section></div>}
      {stage===4&&<FruitDemo/>}
    </section>
    <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(stage-1)}><ArrowLeft size={16}/>{stage===0?'All guided builds':stages[stage-1]}</a><a className="gp-button" href={stage===4?root:link(stage+1)}>{stage===4?'Choose another project':stages[stage+1]}<ArrowRight size={16}/></a></div>
  </div>;
}
