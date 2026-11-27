import{useMemo}from'react';
import{tapStemmaLeads,tapStemmaLeadPose}from'../data/tap-stemma-leads';
import{TapJumper}from'./TapDryJumpers';
function Lead({id,phase,plugPhase,selected,choose}:{id:string;phase:number;plugPhase:number;selected:string;choose:(id:string)=>void}){const w=tapStemmaLeads.find(w=>w.id===id)!,pose=useMemo(()=>tapStemmaLeadPose(id,phase,plugPhase),[id,phase,plugPhase]);return <TapJumper wire={w} pose={pose} selected={selected} choose={choose}/>;}
export default function TapStemmaLeads({selected,choose,plugPhase=1,fitting={}}:{selected:string;choose:(id:string)=>void;plugPhase?:number;fitting?:Readonly<Record<string,number>>}){return <group name="tap-stemma-leads">{tapStemmaLeads.map(w=><Lead key={w.id} id={w.id} phase={fitting[w.id]??1} {...{selected,choose,plugPhase}}/>)}</group>;}
