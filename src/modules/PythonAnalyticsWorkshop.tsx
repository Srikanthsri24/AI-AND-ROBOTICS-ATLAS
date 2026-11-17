import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, Grid3X3, TrendingUp } from 'lucide-react';
import { analyticsProject, imageNames, imagePixels, labelRegions, predict, stops, stopsCsv, testError, toPgm, trainingSpan, type ImageId } from '../data/python-analytics';
import { download } from './state';
import '../styles/python-analytics.css';

const routes=['overview','components','assembly','test','demo'];
const stages=['Overview','Components','Assembly','Program & test','Finished demo'];
const root='#/project-builder';
const href=(stage:number)=>`${root}/${analyticsProject.id}/${routes[stage]}`;
const colors=['#17334d','#8cd7e1','#efbb73','#b8a8f4','#9fd6af'];
const assetNotes = [
  {name:'Grayscale images', use:'Three ASCII PGM images with separated, touching and dim objects.'},
  {name:'Rover stopping dataset', use:'Seven example speed and stopping-distance pairs. Five train the model and two measure its error.'},
  {name:'Python source', use:'A single Python 3 program with two subcommands. It uses the standard library.'},
];

function PixelGrid({rows, processed=false, label}:{rows:number[][];processed?:boolean;label:string}) {
  return <div className="pya-pixels" role="img" aria-label={label}>
    {rows.flatMap((row,y)=>row.map((value,x)=><span key={`${y}-${x}`} style={{backgroundColor:processed ? colors[value] ?? '#dae4fc' : `rgb(${value} ${value} ${value})`}}/>))}
  </div>;
}

function FitPlot({speed}:{speed:number}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const ctx=canvas.current?.getContext('2d');
    if(!ctx)return;
    const x=(value:number)=>66+value*7.35;
    const y=(value:number)=>246-value*6.55;
    ctx.fillStyle='#172a41';ctx.fillRect(0,0,580,295);
    ctx.font='13px system-ui';
    ctx.fillStyle='#c9d9eb';
    ctx.fillText('Stopping distance (cm)',18,23);
    ctx.fillText('Start speed (cm/s)',416,280);
    ctx.strokeStyle='#809abb55';
    for(let tick=0;tick<=30;tick+=5) {
      ctx.beginPath();ctx.moveTo(x(0),y(tick));ctx.lineTo(x(65),y(tick));ctx.stroke();
      ctx.fillText(String(tick),38,y(tick)+4);
    }
    for(let tick=0;tick<=60;tick+=10)ctx.fillText(String(tick),x(tick)-7,268);
    ctx.strokeStyle='#9eb3cf';
    ctx.beginPath();ctx.moveTo(x(0),y(32));ctx.lineTo(x(0),y(0));ctx.lineTo(x(65),y(0));ctx.stroke();
    ctx.lineWidth=2.7;ctx.strokeStyle='#9ee5dd';ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(x(5),y(predict(5)));ctx.lineTo(x(65),y(predict(65)));ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x(trainingSpan[0]),y(predict(trainingSpan[0])));ctx.lineTo(x(trainingSpan[1]),y(predict(trainingSpan[1])));ctx.stroke();
    for(const row of stops) {
      ctx.fillStyle=row.split==='train'?'#9ec5ff':'#ffc984';
      if(row.split==='test')ctx.fillRect(x(row.speed)-4,y(row.distance)-4,8,8);
      else {ctx.beginPath();ctx.arc(x(row.speed),y(row.distance),4.4,0,Math.PI*2);ctx.fill();}
    }
    ctx.strokeStyle='#efe9ff90';ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(x(speed),y(0));ctx.lineTo(x(speed),y(predict(speed)));ctx.stroke();
    ctx.setLineDash([]);ctx.strokeStyle='#fff';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x(speed),y(predict(speed)),7.5,0,Math.PI*2);ctx.stroke();
  },[speed]);
  return <canvas className="pya-chart" width={580} height={295} ref={canvas} role="img"
    aria-label={`Plot of training and held-out test points, with a prediction of ${predict(speed).toFixed(2)} centimeters at ${speed} centimeters per second.`}/>;
}

function downloadImage(id:ImageId) {
  download(`${id}.pgm`,toPgm(id));
}

function DataTable({showPredictions = false}:{showPredictions?:boolean}) {
  return <div className="gp-table"><table>
    <caption>Example stopping trials</caption>
    <thead><tr><th scope="col">Speed (cm/s)</th><th scope="col">Distance (cm)</th><th scope="col">Use</th>{showPredictions&&<th scope="col">Prediction (cm)</th>}</tr></thead>
    <tbody>{stops.map(row=><tr key={row.speed}><td>{row.speed}</td><td>{row.distance}</td><td>{row.split==='train'?'Fit':'Held-out test'}</td>{showPredictions&&<td>{row.split==='test'?predict(row.speed).toFixed(2):'—'}</td>}</tr>)}</tbody>
  </table></div>;
}

export default function PythonAnalyticsWorkshop({stage}:{stage:number}) {
  const [ready,setReady]=useState<string[]>([]);
  const [mode,setMode]=useState<'vision'|'model'>('vision');
  const [image,setImage]=useState<ImageId>('separated');
  const [threshold,setThreshold]=useState(140);
  const [speed,setSpeed]=useState(35);
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});});
    return ()=>cancelAnimationFrame(frame);
  },[stage]);
  const pixels=imagePixels(image);
  const regions=labelRegions(pixels,threshold);
  const outside=speed<trainingSpan[0]||speed>trainingSpan[1];
  const defaultImage=imagePixels('separated');

  return <div className="gp-page gp-build pya-page">
    <a href={root} className="gp-back"><ArrowLeft size={16}/>All projects</a>
    <header className="gp-title"><h1>{analyticsProject.title}</h1><p>{analyticsProject.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">{stages.map((name,i)=><a key={name} href={href(i)} aria-current={stage===i?'step':undefined}><span>{i+1}</span>{name}</a>)}</nav>
    <section className="gp-panel" aria-labelledby="pya-stage">
      <h2 ref={heading} id="pya-stage" tabIndex={-1}>{stages[stage]}</h2>
      {stage===0&&<div className="gp-split">
        <div className="pya-art">
          <div><strong><Grid3X3 size={18}/> Vision</strong><PixelGrid rows={labelRegions(defaultImage,140).labels} processed label="Three color-coded pixel regions"/></div>
          <div><strong><TrendingUp size={18}/> Prediction</strong><FitPlot speed={35}/></div>
        </div>
        <div className="gp-guide">
          <h3>Two questions for the computer</h3>
          <p>Given an image, how many bright regions can you find? Given earlier rover trials, how far might the rover roll before stopping at a new speed?</p>
          <ol>
            <li>Set the brightness cutoff and compare the count before and after two objects touch.</li>
            <li>Fit a line using the training rows, then measure its error on rows that were held back.</li>
            <li>Run both exercises in Python and compare the results with the browser demo.</li>
          </ol>
          <div className="gp-check"><Check size={19}/><div><strong>Success criteria</strong><p>At a cutoff of 140, the separated objects give three regions and the touching sample gives two. At 35 cm/s, the rover model predicts {predict(35).toFixed(2)} cm and reports {testError.toFixed(2)} cm of held-out mean absolute error.</p></div></div>
        </div>
      </div>}
      {stage===1&&<div className="gp-guide">
        <p>{ready.length} of {assetNotes.length} assets ready.</p>
        <div className="pya-assets">{assetNotes.map(({name,use},i)=><article key={name} className={ready.includes(name)?'pya-ready':undefined}>
          <h3>{name}</h3><p>{use}</p>
          <div className="pya-actions">
            {i===0?Object.entries(imageNames).map(([id,label])=><button type="button" key={id} className="gp-button gp-secondary" onClick={()=>downloadImage(id as ImageId)}>{label} PGM</button>):
              i===1?<button type="button" className="gp-button gp-secondary" onClick={()=>download('stopping-trials.csv',stopsCsv,'text/csv')}>Download trial CSV</button>:
              <a className="gp-button gp-secondary" href="./project-files/vision_and_prediction.py" download>Download Python program</a>}
          </div>
          <button type="button" className="gp-button gp-secondary" aria-pressed={ready.includes(name)} aria-label={`Mark ${name} ready`} onClick={()=>
            setReady(list=>list.includes(name)?list.filter(value=>value!==name):[...list,name])}>{ready.includes(name)?'Ready':'Mark ready'}</button>
        </article>)}</div>
      </div>}
      {stage===2&&<>
        <div className="gp-split">
          <div className="gp-guide">
            <h3>Prepare inputs</h3>
            <ol>
              <li><strong>Get the files.</strong> Download the Python program, the three PGM images and the CSV into the same folder.</li>
              <li><strong>Inspect the image.</strong> Open a PGM file in a text editor. After the dimensions and max value, each row lists one line of grayscale pixels from 0 to 255.</li>
              <li><strong>Inspect the trial split.</strong> Keep the two test rows separate until after the model is fitted. The table is a fictional classroom dataset.</li>
            </ol>
            <div className="pya-setup-diagram" aria-label="Vision pipeline">
              <div>Grayscale grid</div><ArrowRight size={17}/><div>Brightness cutoff</div><ArrowRight size={17}/><div>Connected regions</div>
            </div>
            <div className="pya-setup-diagram" aria-label="Prediction pipeline">
              <div>Five training pairs</div><ArrowRight size={17}/><div>Fit a line</div><ArrowRight size={17}/><div>Check two held-out pairs</div>
            </div>
          </div>
          <DataTable/>
        </div>
      </>}
      {stage===3&&<div className="gp-guide">
        <div className="gp-program-meta"><div><span>Language</span><strong>Python 3</strong></div><div><span>Tools</span><strong>Terminal, text editor and the downloaded files</strong></div></div>
        <div className="gp-program-grid">
          <section className="gp-program-card">
            <h3>Count regions</h3>
            <p>From the download folder, run these commands. Use <code>py</code> in place of <code>python3</code> if that is your Windows launcher.</p>
            <pre tabIndex={0}><code>{'python3 vision_and_prediction.py vision separated.pgm --threshold 140\npython3 vision_and_prediction.py vision touching.pgm --threshold 140\npython3 vision_and_prediction.py vision dim.pgm --threshold 100'}</code></pre>
            <p>Expect counts of 3, 2 and 3. In the printed label grid, a period represents background. Each number identifies one region.</p>
          </section>
          <section className="gp-program-card">
            <h3>Fit and check the model</h3>
            <pre tabIndex={0}><code>{'python3 vision_and_prediction.py predict stopping-trials.csv --speed 35\npython3 vision_and_prediction.py predict stopping-trials.csv --speed 60'}</code></pre>
            <p>Expect {predict(35).toFixed(2)} cm at 35 cm/s and {testError.toFixed(2)} cm mean absolute error on the two test rows. At 60 cm/s, expect an outside-range message. The line continues past 50 cm/s without any training examples there.</p>
            <a className="gp-button gp-secondary" href="./project-files/vision_and_prediction.py" download><Download size={16}/>Python source</a>
          </section>
        </div>
      </div>}
      {stage===4&&<div className="gp-guide">
        <div className="pya-actions pya-switch" role="group" aria-label="Choose exercise">
          <button className={`gp-button ${mode==='vision'?'':'gp-secondary'}`} type="button" aria-pressed={mode==='vision'} onClick={()=>setMode('vision')}><Grid3X3 size={17}/>Count image regions</button>
          <button className={`gp-button ${mode==='model'?'':'gp-secondary'}`} type="button" aria-pressed={mode==='model'} onClick={()=>setMode('model')}><TrendingUp size={17}/>Predict stopping distance</button>
        </div>
        {mode==='vision'?<div className="pya-workspace">
          <div className="pya-image-pair">
            <figure><figcaption>Grayscale input</figcaption><PixelGrid rows={pixels} label={`${imageNames[image]} input grid`}/></figure>
            <figure><figcaption>Connected regions</figcaption><PixelGrid rows={regions.labels} processed label={`${regions.count} colored regions after applying cutoff ${threshold}`}/></figure>
          </div>
          <div className="pya-controls">
            <h3>Find the bright objects</h3>
            <label>Sample image<select value={image} onChange={event=>setImage(event.target.value as ImageId)}>
              {Object.entries(imageNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}
            </select></label>
            <label htmlFor="pya-threshold">Brightness cutoff <output>{threshold}</output></label>
            <input id="pya-threshold" type="range" min={45} max={230} value={threshold} onChange={event=>setThreshold(Number(event.target.value))}/>
            <p className="pya-result" role="status"><strong>{regions.count}</strong> connected {regions.count===1?'region':'regions'}</p>
            <p>Pixels at or above the cutoff belong to the foreground. The program groups neighbors that share a side. Try a cutoff of 100 on the dim sample and compare it with 140.</p>
            <button type="button" className="gp-button gp-secondary" onClick={()=>downloadImage(image)}><Download size={16}/>Download this PGM</button>
          </div>
        </div>:<div className="pya-workspace">
          <div>
            <FitPlot speed={speed}/>
            <ul className="pya-legend">
              <li><span className="pya-train"/> Training pair</li><li><span className="pya-test"/> Held-out pair</li><li><span className="pya-fit"/> Fitted line</li><li><span className="pya-prediction"/> Your prediction</li>
            </ul>
            <details><summary>Compare the held-out predictions</summary><DataTable showPredictions/></details>
          </div>
          <div className="pya-controls">
            <h3>Estimate how far the rover rolls</h3>
            <label htmlFor="pya-speed">Start speed <output>{speed} cm/s</output></label>
            <input id="pya-speed" type="range" min={5} max={65} value={speed} onChange={event=>setSpeed(Number(event.target.value))}/>
            <p className="pya-result" role="status"><strong>{predict(speed).toFixed(2)} cm</strong> predicted stopping distance</p>
            <p>Mean absolute error on the two held-out rows is <strong>{testError.toFixed(2)} cm</strong>.</p>
            <p className={outside?'pya-warning':undefined}>{outside?'Outside the training range. This estimate extends the line beyond the speeds used to fit it.':'The speed is within the training range of 15–50 cm/s.'}</p>
            <button type="button" className="gp-button gp-secondary" onClick={()=>download('stopping-trials.csv',stopsCsv,'text/csv')}><Download size={16}/>Download trial CSV</button>
          </div>
        </div>}
      </div>}
    </section>
    <nav className="gp-footer" aria-label="Stage navigation">
      {stage>0?<a className="gp-button gp-secondary" href={href(stage-1)}><ArrowLeft size={16}/>{stages[stage-1]}</a>:<span/>}
      {stage<4&&<a className="gp-button" href={href(stage+1)}>{stages[stage+1]}<ArrowRight size={16}/></a>}
    </nav>
  </div>;
}
