import {streetFootFastenerPose} from './street-system-fasteners';
import {streetSystemCables} from './street-system-layout';
import {streetJumperSeating} from './street-system-jumpers';
import {streetSystemParts} from './street-system-parts';
export function streetSystemAssemblyPose(id:string,progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Street assembly progress must be 0–8.');
 const p=streetSystemParts.find(p=>p.id===id);if(!p)throw new Error('Unknown street assembly part '+id);
 const wire=streetSystemCables.findIndex(w=>w.id===id);if(wire>=0){const pose=streetJumperSeating(wire,progress);return {visible:pose.visible,lift:0,seated:pose.seated};}
 if(id.endsWith('-bolts')){const lamp=Number(id.match(/lamp-(\d)/)?.[1]??1)-1,first=streetFootFastenerPose(lamp*4,progress),last=streetFootFastenerPose(lamp*4+3,progress);return {visible:first.washerVisible,lift:0,seated:last.seated};}
 if(p.stage===0)return {visible:true,lift:0,seated:true};
 const chapter=p.stage,local=progress-(chapter-1);
 let start=0,end=1;
 if(chapter===1){
  if(id.endsWith('-foot'))[start,end]=[0,.25];
  else if(id.endsWith('-post'))[start,end]=[.25,.55];
  else if(id.endsWith('-hood'))[start,end]=[.55,.8];
  else [start,end]=[.8,1];
 }else if(chapter===2){[start,end]=id.endsWith('-lens')?[0,.5]:[.5,1];
 }else if(chapter===3){[start,end]=id==='street-uno-supports'?[0,.25]:id==='street-breadboard'?[.7,1]:[.25,.7];
 }else if(chapter===4){[start,end]=id==='street-sensor-mount'?[0,.2]:(id==='street-ldr'||id.startsWith('street-sensor-')&&id.endsWith('-socket'))?[.2,.5]:id==='street-divider-resistor'?[.5,.8]:[.8,1];
 }else if(chapter===5){const n=Number(id.match(/lamp-(\d)/)?.[1]??1)-1;start=n/3;end=(n+1)/3;}
 const fraction=Math.max(0,Math.min(1,(local-start)/(end-start)));
 const smooth=fraction*fraction*(3-2*fraction);
 return {visible:local>start,lift:(1-smooth)*70,seated:fraction===1};
}

/** Slower wiring chapters leave one second for each individual plug movement. */
export const streetAssemblyDurations=[28000,3200,3000,3600,3000,10000,24000,3000] as const;
export function streetAssemblyAdvance(progress:number,elapsedMs:number){
 if(!Number.isFinite(progress)||progress<0||progress>8||!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid assembly time or position');
 let p=progress,time=elapsedMs;
 while(p<8&&time>0){const chapter=Math.floor(p),boundary=chapter===0&&p<.8?.8:chapter+1,rate=chapter===0?(p<.8?5000:120000):streetAssemblyDurations[chapter],remaining=(boundary-p)*rate;if(time>=remaining){p=boundary;time-=remaining;}else {p+=time/rate;time=0;}}
 return p;
}
export function streetAssemblyNextStop(progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Invalid assembly position');
 if(progress<.25)return .25;
 if(progress<.55)return .55;
 if(progress<.8)return .8;
 if(progress>=.8&&progress<1)return Math.min(1,.8+(Math.floor((progress-.8)*120+1e-8)+1)/120);
 if(progress>=5&&progress<7){const chapter=Math.floor(progress),ends=chapter===5?10:24;return Math.min(chapter+1,chapter+(Math.floor((progress-chapter)*ends+1e-8)+1)/ends);}
 return Math.min(8,Math.floor(progress)+1);
}
