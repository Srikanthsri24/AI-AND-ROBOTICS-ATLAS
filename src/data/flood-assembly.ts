import type{FloodPoint}from'./flood-workshop-layout';
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function floodPartStage(id:string){
 if(id==='flood-water')return 6;
 if(id.startsWith('sonar-')||['flood-stand','flood-mounts','flood-mount-screws'].includes(id))return 1;
 if(id==='flood-usb-cable')return 5;
 if(id.startsWith('uno-')||['flood-controller-feet','flood-breadboard','flood-usb-host','wire-ground-bridge','wire-uno-ground'].includes(id)||id.startsWith('wire-sonar-'))return 2;
 if(id.includes('piezo')||['wire-D9','wire-return-3'].includes(id))return 4;
 if(['flood-green','flood-amber','flood-red'].some(p=>id.startsWith(p))||/^wire-D[567]$/.test(id)||/^wire-return-[012]$/.test(id))return 3;
 return 0;
}
export type FloodAssemblyPose={visible:boolean;settled:boolean;offset:FloodPoint};
/** Native-mm handling poses. Seat the downward sensor from below its support
 * plate, then drop its screws through the actual clear bores from above.
 */
export function floodAssemblyPose(id:string,progress:number):FloodAssemblyPose{
 if(!Number.isFinite(progress)||progress<0||progress>7)throw Error('Assembly position must be 0–7.');
 const stage=floodPartStage(id);if(stage===0||progress>=stage)return {visible:true,settled:true,offset:[0,0,0]};
 if(stage===1){
  if(id==='flood-stand'){const t=ease(progress/.3);return {visible:progress>0,settled:progress>=.3,offset:[0,120*(1-t),0]};}
  if(id==='flood-mount-screws'){const t=ease((progress-.85)/.15);return {visible:progress>.85,settled:progress>=1,offset:[0,40*(1-t),0]};}
  const slide=ease((progress-.3)/.3),rise=ease((progress-.6)/.2);return {visible:progress>.3,settled:progress>=.8,offset:[0,-30*(1-rise),60*(1-slide)]};
 }
 const start=stage-1,t=ease(progress-start),wire=id.startsWith('wire-'),height=wire?25:stage===5?0:45;
 return {visible:progress>start,settled:progress>=stage,offset:[stage===5?-35*(1-t):0,height*(1-t),0]};
}
