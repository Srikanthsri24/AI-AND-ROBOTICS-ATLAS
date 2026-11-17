const make=(rows,prefix)=>rows.map(([idle,tickets,left],i)=>({id:prefix+(i+1),idle,tickets,left:Boolean(left)}));
export const training=make([[1,0,0],[3,1,0],[7,0,0],[10,2,0],[13,1,0],[15,3,1],[17,4,1],[20,2,1],[25,3,1],[30,5,1],[8,5,1],[21,0,0]],'T');
export const heldOut=make([[3,1,0],[7,4,0],[15,2,1],[19,1,0],[22,3,1],[28,1,1],[6,5,1],[12,0,0]],'E');
const inputs=({idle,tickets})=>[1,idle/30,tickets/5];
const sigmoid=value=>1/(1+Math.exp(-value));
const score=(weights,profile)=>sigmoid(inputs(profile).reduce((sum,value,i)=>sum+value*weights[i],0));

export function fit(){
 const weights=[0,0,0];
 for(let step=0;step<1500;step++){
  const delta=[0,0,0];
  for(const profile of training){
   const error=score(weights,profile)-Number(profile.left);
   inputs(profile).forEach((value,i)=>{delta[i]+=error*value;});
  }
  delta.forEach((value,i)=>{weights[i]-=.48*(value/training.length+(i?weights[i]*.014:0));});
 }
 return weights;
}

const model=fit();
export function predict(profile){return score(model,profile);}
export function evaluate(threshold){
 const rows=heldOut.map(profile=>{
  const risk=predict(profile);
  return {...profile,risk,flag:risk>=threshold};
 });
 return {rows,hits:rows.filter(row=>row.flag&&row.left).length,
         missed:rows.filter(row=>!row.flag&&row.left).length,
         falseAlerts:rows.filter(row=>row.flag&&!row.left).length,
         clear:rows.filter(row=>!row.flag&&!row.left).length};
}
export const attritionCsv=['id,split,inactive_days,support_tickets,left',
 ...training.map(row=>[row.id,'train',row.idle,row.tickets,Number(row.left)].join(',')),
 ...heldOut.map(row=>[row.id,'test',row.idle,row.tickets,Number(row.left)].join(','))].join('\n')+'\n';
