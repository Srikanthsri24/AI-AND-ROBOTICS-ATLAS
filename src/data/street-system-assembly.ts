import {streetSystemParts} from './street-system-parts';
export function streetSystemAssemblyPose(id:string,progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>8)throw new RangeError('Street assembly progress must be 0–8.');
 const p=streetSystemParts.find(p=>p.id===id);if(!p)throw new Error('Unknown street assembly part '+id);
 if(p.stage===0)return {visible:true,lift:0,seated:true};
 const chapter=p.stage,local=progress-(chapter-1),fraction=Math.max(0,Math.min(1,local));
 const smooth=fraction*fraction*(3-2*fraction);
 return {visible:local>0,lift:(1-smooth)*70,seated:fraction===1};
}
