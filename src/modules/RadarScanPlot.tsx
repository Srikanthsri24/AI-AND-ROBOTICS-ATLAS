import {radarPlotPoint} from '../data/radar-session';
import type {RadarClock} from '../data/radar-workshop';
export default function RadarScanPlot({clock,playing=false}:{clock:RadarClock;playing?:boolean}){
 const rows=clock.rows.slice(-80),end=radarPlotPoint(playing?clock.command:clock.rows.at(-1)?.angle??clock.command,150);
 return <div className="rw-plot"><svg viewBox="0 0 360 210" role="img" aria-label={`Recent ultrasonic samples plotted by commanded bearing. ${rows.filter(r=>r.rangeCm>=0).length} valid returns in the last ${rows.length} samples.`}>
  <rect width="360" height="210" rx="12" fill="#17233e"/>
  {[50,100,150].map(r=><g key={r}><path d={`M${180-r} 180 A${r} ${r} 0 0 1 ${180+r} 180`} fill="none" stroke="#3f5275" strokeWidth=".8"/><text x="184" y={180-r+12} fill="#a5b4cf" fontSize="12">{r} cm</text></g>)}
  {[0,30,60,90,120,150,180].map(a=>{const[x,y]=radarPlotPoint(a,157);return <g key={a}><line x1="180" y1="180" x2={x} y2={y} stroke="#31415f" strokeWidth=".6"/><text x={x} y={y+4} textAnchor="middle" fill="#c9d3e6" fontSize="12">{a}°</text></g>;})}
  <line x1="180" y1="180" x2={end[0]} y2={end[1]} stroke="#a786ec" strokeWidth="1.5"/>
  {rows.map((r,n)=>{if(r.rangeCm<0)return null;const[x,y]=radarPlotPoint(r.angle,r.rangeCm);return <circle key={r.id} cx={x} cy={y} r="3.3" fill="#88ddc2" opacity={.25+.75*(n+1)/rows.length}/>;})}
  <circle cx="180" cy="180" r="4" fill="#b69af0"/><text x="180" y="201" textAnchor="middle" fill="#b9c7df" fontSize="10">Commanded bearing · recent 80 samples</text>
 </svg><p>Only valid 10–150 cm returns are plotted. The real sketch reports the <strong>commanded</strong> angle; mechanical bearing is a separate simulator readout.</p></div>;
}
