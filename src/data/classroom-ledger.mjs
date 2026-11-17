export const tokens=['LAB-A1','LAB-B2','LAB-C3'];
export const choices=['Garden beds','Robotics club'];
export const batches=['CARROT-24','BEAN-18'];
export const milestones=['Harvested','Packed','Delivered'];
export const genesis='0'.repeat(64);

async function fingerprint(index, previous, entry) {
  const record=JSON.stringify([index,previous,entry.kind,entry.ref,entry.value]);
  const bytes=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(record));
  return Array.from(new Uint8Array(bytes),value=>value.toString(16).padStart(2,'0')).join('');
}

function validationError(chain,entry) {
  if(chain.length&&chain[0].entry.kind!==entry.kind) return 'Use a separate ledger for this record type';
  if(entry.kind==='vote') {
    if(!tokens.includes(entry.ref)||!choices.includes(entry.value)) return 'Unknown token or choice';
    if(chain.some(block=>block.entry.ref===entry.ref)) return 'Token already used';
  } else if(entry.kind==='produce') {
    if(!batches.includes(entry.ref)) return 'Unknown batch';
    const completed=chain.filter(block=>block.entry.ref===entry.ref).length;
    if(completed>=milestones.length||milestones[completed]!==entry.value) return 'Record the next checkpoint in order';
  } else {
    return 'Unknown record type';
  }
  return '';
}

export async function audit(chain) {
  for(const [index,block] of chain.entries()) {
    const previous=chain[index-1]?.hash??genesis;
    if(block.index!==index+1||block.previous!==previous) return {ok:false,index:index+1,reason:'Previous hash or index mismatch'};
    if(await fingerprint(block.index,block.previous,block.entry)!==block.hash) return {ok:false,index:index+1,reason:'Stored hash differs from recomputed hash'};
    const invalid=validationError(chain.slice(0,index),block.entry);
    if(invalid) return {ok:false,index:index+1,reason:invalid};
  }
  return {ok:true,index:null,reason:'All links and records verified'};
}

export async function appendBlock(chain,entry) {
  const check=await audit(chain);
  if(!check.ok) return {ok:false,reason:'Restore the chain before adding a record',chain};
  const invalid=validationError(chain,entry);
  if(invalid) return {ok:false,reason:invalid,chain};
  const previous=chain.at(-1)?.hash??genesis;
  const index=chain.length+1;
  const hash=await fingerprint(index,previous,entry);
  return {ok:true,reason:'Record added',chain:[...chain,{index,previous,hash,entry:{...entry}}]};
}

export function editFirstRecord(chain) {
  if(!chain.length) return chain;
  const [first,...later]=chain;
  const value=first.entry.kind==='vote'
    ? choices.find(choice=>choice!==first.entry.value)
    : first.entry.value==='Delivered'?'Packed':'Delivered';
  return [{...first,entry:{...first.entry,value}},...later];
}
