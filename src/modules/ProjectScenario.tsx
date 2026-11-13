import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ExpansionInfo } from '../data/project-expansion';

export function scenarioRange(info: ExpansionInfo): [number,number] {
  switch(info.kind) {
    case 'switch': return [0,1];
    case 'angle': return [75,info.limit];
    case 'distance': return [0,Math.max(50,info.limit+15)];
    case 'ratio': return [0,120];
    case 'vision': return [100,255];
    case 'timer': return [0,info.limit*2+1];
    default: return [0,100];
  }
}

export default function ProjectScenario({info}: {info:ExpansionInfo}) {
  const {kind,limit,input,output}=info;
  const [min,max]=scenarioRange(info);
  const [value,setValue]=useState(kind==='switch' ? 0 : Math.round((min+max)/2));
  const [touching,setTouching]=useState(false);
  const [lampOn,setLampOn]=useState(false);
  function changeValue(next:number) {
    setValue(next);
    if(info.template==='ambient-light') setLampOn(previous=>next<limit || (next<=limit+5 && previous));
  }
  let result:string;
  let detail:string;
  let active=false;
  switch(kind) {
    case 'low': case 'high':
      active=info.template==='ambient-light'?lampOn:kind==='low'?value<limit:value>limit;
      result=active?'On':'Off';
      detail=info.template==='ambient-light' ? `Below ${limit}% the lamp turns on. Above ${limit+5}% it turns off. Between those values it keeps its last state.` : `The LED turns on when the reading is ${kind==='low'?'below':'above'} ${limit}.`;
      break;
    case 'switch':
      active=value===1;
      result=active?'On':'Off';
      detail=active?'The pressed switch connects the input to ground.':'The pull-up keeps the released input high.';
      break;
    case 'angle':
      result=`${value}°`;
      detail='The servo turns the arm to the selected position.';
      break;
    case 'distance':
      active=value>0&&value>=limit;
      result=active?'Drive':'Stop';
      detail=value===0?'No echo was received. The rover stops.':`The rover stops when the distance is below ${limit} cm.`;
      break;
    case 'ratio':
      result=`${(value/limit).toFixed(1)} RPM`;
      detail=`Divide the input speed by ${limit}. The driven gear turns in the opposite direction.`;
      break;
    case 'vision': {
      const count=[150,185,220].filter(level=>level>value).length;
      const merged=touching&&value<150?1:0;
      result=String(count-merged);
      detail='Only targets brighter than the cutoff count. Two touching bright targets count as one region.';
      break;
    }
    case 'timer': {
      const time=value%(limit*2+1);
      result=time<limit?'Red':time<2*limit?'Green':'Amber';
      detail=`Red and green each last ${limit} seconds. Amber lasts one second.`;
      break;
    }
  }
  return <div className="gp-scenario">
    <section className="gp-guide gp-part-preview"><h3>Try the project</h3>
      <p>Change the input and compare what the build does.</p>
      <label className="gp-scenario-control">{input}<output>{kind==='switch'?(value?'Pressed':'Released'):value}</output>
        <input type="range" min={min} max={max} value={value} onChange={event=>changeValue(Number(event.target.value))}/>
      </label>
      {kind==='vision'&&<label><input type="checkbox" checked={touching} onChange={event=>setTouching(event.target.checked)}/> Join the first two targets</label>}
      <div className="gp-scenario-actions"><button onClick={()=>changeValue(min)}>Try minimum</button><button onClick={()=>changeValue(max)}>Try maximum</button></div>
    </section>
    <section className="gp-guide gp-scenario-output" aria-live="polite">
      <span>{output}</span><strong>{result}</strong><p>{detail}</p>
      {['low','high','switch'].includes(kind)&&<div className="gp-scenario-led" data-lit={active} aria-hidden="true"/>}
      {kind==='angle'&&<div className="gp-scenario-arm" aria-hidden="true"><i style={{transform:`rotate(${75-value}deg)`}}/></div>}
      {kind==='distance'&&<div className="gp-scenario-road" aria-hidden="true"><span style={{left:`${value/max*70}%`}}>▉</span><b data-lit={active}>●</b></div>}
      {kind==='timer'&&<div className="gp-scenario-lamps" aria-label={`${result} is lit`}>{['Red','Amber','Green'].map(color=><i key={color} data-lit={result===color} style={{backgroundColor:color==='Amber'?'#ffbf39':color.toLowerCase()}}/>)}</div>}
      {kind==='vision'&&<div className="gp-scenario-targets" data-touching={touching} aria-hidden="true">{[150,185,220].map(level=><i key={level} data-lit={level>value}/>)}</div>}
      {kind==='ratio'&&<div className="gp-scenario-gears" aria-hidden="true"><i style={{animationDuration:`${value?60/value:1}s`,animationPlayState:value?'running':'paused'}}>⚙</i><ArrowRight/><i style={{animationDuration:`${value?60*limit/value:1}s`,animationPlayState:value?'running':'paused'}}>⚙</i></div>}
    </section>
  </div>;
}
