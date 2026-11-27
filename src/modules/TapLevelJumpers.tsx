import{useMemo}from'react';
import{tapLevelJumpers,tapLevelJumperPose}from'../data/tap-level-jumpers';
import{TapJumper}from'./TapDryJumpers';
function Wire({id,phase,selected,choose}:{id:string;phase:readonly[number,number];selected:string;choose:(id:string)=>void}){const w=tapLevelJumpers.find(w=>w.id===id)!,pose=useMemo(()=>tapLevelJumperPose(id,phase[0],phase[1]),[id,phase[0],phase[1]]);return <TapJumper wire={w} pose={pose} selected={selected} choose={choose}/>;}
export default function TapLevelJumpers({selected,choose,fitting={}}:{selected:string;choose:(id:string)=>void;fitting?:Readonly<Record<string,readonly[number,number]>>}){return <group name="tap-level-extensions">{tapLevelJumpers.map(w=><Wire key={w.id} id={w.id} phase={fitting[w.id]??[1,1]} {...{selected,choose}}/>)}</group>;}
