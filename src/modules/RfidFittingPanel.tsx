import {rfidWires} from '../data/rfid-wires';
import {rfidFittingTotal} from '../data/rfid-fitting';
import {rfidFittingChapter,rfidFittingInstructions} from '../data/rfid-fitting-instructions';
import '../styles/rfid-fitting.css';
type Props={cursor:number;playing:boolean;onCursor:(cursor:number)=>void;onPlay:()=>void;onSelect:(id:string)=>void};
export default function RfidFittingPanel({cursor,playing,onCursor,onPlay,onSelect}:Props){
 const complete=cursor>=rfidFittingTotal,chapter=Math.min(19,Math.floor(cursor)),instruction=rfidFittingChapter(chapter),wire=rfidWires[Math.floor(chapter/2)];
 return <section className="rfid-fitting" aria-label="RFID jumper assembly">
  <header><div><small>CONNECT THE CIRCUIT</small><h4>{complete?'Ten leads fitted. Inspect before power.':instruction.title}</h4></div><span className="rfid-fitting-count">{Math.floor(Math.min(cursor,20))} / 20 ends</span></header>
  <progress aria-label="Connector fitting progress" value={cursor} max={20}/>
  <div className="rfid-fitting-toolbar"><button className="rfid-fitting-primary" onClick={onPlay}>{playing?'Pause fitting':complete?'Replay fitting':'Animate fitting'}</button><button disabled={cursor<=0} onClick={()=>onCursor(Math.max(0,Math.ceil(cursor)-1))}>Previous end</button><button disabled={complete} onClick={()=>onCursor(Math.min(20,Math.floor(cursor)+1))}>Next end</button><button onClick={()=>onSelect(wire.id)}>Inspect this lead</button></div>
  <div className="rfid-fitting-contact"><span className="rfid-fitting-dot" style={{background:wire.color}}/><div><small>{complete?'LAST CONNECTION':instruction.action.toUpperCase()}</small><strong>{instruction.contact}</strong></div><span>{complete?'Seated':chapter%2?'End 2 of 2':'End 1 of 2'}</span></div>
  <dl className="rfid-fitting-details"><div><dt>Why this connection matters</dt><dd>{instruction.why}</dd></div><div><dt>Check it on the model</dt><dd>{instruction.check}</dd></div></dl>
  <p className="rfid-fitting-note">Fit leads with USB disconnected and the independent servo supply off. Columns 1–17 and rows A–J are marked on the breadboard. Five holes A–E share one strip; F–J share another across the centre gap.</p>
  <nav aria-label="Choose RFID connection">{rfidFittingInstructions.map((step,n)=>{const done=cursor>=(n+1)*2,active=!complete&&Math.floor(chapter/2)===n;return <button key={step.wireId} aria-current={active?'step':undefined} onClick={()=>{onCursor(n*2);onSelect(step.wireId);}}><span className={done?'rfid-fitting-badge done':'rfid-fitting-badge'}>{done?'✓':n+1}</span><span><strong>{rfidWires[n].name}</strong><small>{step.source} → {step.destination}</small></span></button>;})}</nav>
 </section>;
}
