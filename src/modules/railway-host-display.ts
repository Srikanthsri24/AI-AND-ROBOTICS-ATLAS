import {CanvasTexture,SRGBColorSpace} from 'three';
import {railwaySerial,type RailwayClock} from '../data/railway-workshop';
/** The model computer shows the same original serial rows as the student panel. */
export function createRailwayHostDisplay(){
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d')!,texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
 function render(s:RailwayClock,linked:boolean){
  ctx.fillStyle='#17213b';ctx.fillRect(0,0,960,540);ctx.fillStyle='#f1eaff';ctx.font='bold 27px sans-serif';ctx.fillText('ATLAS · RAILWAY CROSSING',32,42);ctx.font='18px sans-serif';ctx.fillStyle=linked?'#a2e1cc':'#c8bce1';ctx.fillText(linked?'USB serial monitor · 115200 baud':'USB link off · connect both ends and power the host',32,73);
  const cards=[['Code command',linked?`${s.command}°`:'—'],['Model arm',`${s.actualAngle.toFixed(1)}°`],['Controller',linked?s.phase.toUpperCase():'UNPOWERED']];
  cards.forEach(([label,value],n)=>{const x=32+n*306;ctx.fillStyle='#293452';ctx.fillRect(x,94,284,93);ctx.fillStyle='#c5b6e4';ctx.font='17px sans-serif';ctx.fillText(label,x+16,122);ctx.fillStyle='#f0e9ff';ctx.font='bold 29px sans-serif';ctx.fillText(value,x+16,163);});
  ctx.fillStyle='#b6a0df';ctx.font='bold 17px sans-serif';ctx.fillText('ORIGINAL SKETCH OUTPUT',32,224);ctx.fillStyle='#e5e9f4';ctx.font='20px monospace';const rows=linked?s.rows.slice(-7):[];
  if(rows.length)rows.forEach((row,n)=>ctx.fillText(railwaySerial(row),32,260+n*32));else ctx.fillText(linked?'Waiting for the first 200 ms report…':'No live serial connection.',32,260);
  ctx.fillStyle='#b9c4db';ctx.font='18px sans-serif';ctx.fillText('Compare the code command with the model arm.',32,522);texture.needsUpdate=true;
 }
 return{texture,render,dispose:()=>texture.dispose()};
}
