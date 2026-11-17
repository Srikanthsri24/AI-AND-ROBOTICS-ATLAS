export const maxAngle=60;
export const radioTimeout=650;
export const speed=25;

export function startChair() {
  return {angle:0,drive:0,link:true,age:0,notice:'Seated · Waiting for a command'};
}

export function chairCommand(state,command) {
  if(command==='stop') return {...state,drive:0,notice:'Stopped · Holding position'};
  if(!state.link) return {...state,notice:'RF link unavailable · Command ignored'};
  if(command==='raise' && state.angle>=maxAngle) return {...state,drive:0,notice:'Upper limit reached · Drive off'};
  if(command==='lower' && state.angle<=0) return {...state,drive:0,notice:'Lower limit reached · Drive off'};
  if(command!=='raise' && command!=='lower') return state;
  return {...state,age:0,drive:command==='raise'?1:-1,notice:command==='raise'?'Raising seat':'Lowering seat'};
}

export function setChairLink(state,connected) {
  if(connected===state.link) return state;
  return {...state,link:connected,age:0,drive:connected?0:state.drive,
    notice:connected?'RF connected · Send a fresh command':state.drive?'RF interrupted · Waiting for timeout':'RF link unavailable · Drive off'};
}

export function advanceChair(state,elapsed) {
  if(state.drive===0||!Number.isFinite(elapsed)||elapsed<=0) return state;
  const moving=state.link?elapsed:Math.min(elapsed,Math.max(0,radioTimeout-state.age));
  const age=state.link?0:state.age+elapsed;
  const angle=Math.max(0,Math.min(maxAngle,state.angle+state.drive*speed*moving/1000));
  if(!state.link&&age>=radioTimeout) return {...state,age,angle,drive:0,notice:'RF timeout · Holding position'};
  if(angle<=0||angle>=maxAngle) return {...state,age,angle,drive:0,notice:angle<=0?'Lower limit reached · Drive off':'Upper limit reached · Drive off'};
  return {...state,age,angle};
}
