import {CanvasTexture,SRGBColorSpace} from 'three';
import {radarPlotPoint} from '../data/radar-session';
import type {RadarClock} from '../data/radar-workshop';
/** Local display pixels come from the same real sample rows as the student chart. */
export function createRadarHostDisplay(){
 const canvas=document.createElement('canvas');canvas.width=720;canvas.height=405;const ctx=canvas.getContext('2d')!;
 const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
 function render(s:RadarClock,linked=true,playing=false){
  ctx.fillStyle='#17233e';ctx.fillRect(0,0,720,405);ctx.fillStyle='#eee6ff';ctx.font='bold 22px sans-serif';ctx.fillText('ATLAS · ULTRASONIC SCAN',28,30);ctx.font='14px sans-serif';ctx.fillStyle='#b8c6e1';ctx.fillText(linked?'USB serial · 115200 baud':'USB link disconnected',28,52);ctx.save();ctx.translate(0,35);ctx.scale(2,1.75);
  ctx.strokeStyle='#405474';ctx.lineWidth=.7;for(const r of[50,100,150]){ctx.beginPath();ctx.arc(180,180,r,Math.PI,Math.PI*2);ctx.stroke();}
  for(const a of[0,30,60,90,120,150,180]){const[x,y]=radarPlotPoint(a,150);ctx.beginPath();ctx.moveTo(180,180);ctx.lineTo(x,y);ctx.stroke();}
  const rows=s.rows.slice(-80);for(const r of rows){if(r.rangeCm<0)continue;const[x,y]=radarPlotPoint(r.angle,r.rangeCm);ctx.fillStyle='#88ddc2';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();}
  const[x,y]=radarPlotPoint(playing?s.command:s.rows.at(-1)?.angle??s.command,150);ctx.strokeStyle='#b494ef';ctx.beginPath();ctx.moveTo(180,180);ctx.lineTo(x,y);ctx.stroke();ctx.restore();
  ctx.fillStyle='#ccd6e9';ctx.font='17px monospace';const r=s.rows.at(-1);ctx.fillText(r?`angle_deg,range_cm    ${r.angle},${r.rangeCm}`:'angle_deg,range_cm    awaiting sample',28,388);texture.needsUpdate=true;
 }
 render({command:90,rows:[]} as unknown as RadarClock);return{texture,render,dispose:()=>texture.dispose()};
}
