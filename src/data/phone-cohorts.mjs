export const groups=['18–29','30–49','50+'];
const rows=[
 [[92,11],[79,19],[85,15]],
 [[47,31],[55,35],[50,39]],
 [[23,54],[29,48],[17,59]],
];
const heldOut=[
 [[81,14],[88,20],[63,28]],
 [[41,40],[57,29],[44,36]],
 [[21,51],[31,44],[25,57]],
];
function profiles(table,prefix){
 return table.flatMap((entries,index)=>entries.map(([media,calls],sample)=>({
  id:prefix+(index*3+sample+1),group:groups[index],media,calls,
 })));
}
export const training=profiles(rows,'T');
export const tests=profiles(heldOut,'E');
export function predict(profile,skewed=false){
 const pool=skewed?training.filter(row=>row.group!=='50+'):training;
 return pool.reduce((best,example)=>{
  const distance=Math.hypot(example.media-profile.media,example.calls-profile.calls);
  return !best||distance<best.distance?{group:example.group,id:example.id,distance}:best;
 },null);
}
export function report(skewed=false,minimum=3){
 return groups.map(group=>{
  const examples=tests.filter(row=>row.group===group);
  const count=examples.length;
  const included=count>=minimum;
  return {group,count,correct:included?examples.filter(row=>predict(row,skewed).group===group).length:null};
 });
}
export const cohortCsv=['id,split,fictional_age_band,media_index,call_index',
 ...training.map(row=>[row.id,'train',row.group,row.media,row.calls].join(',')),
 ...tests.map(row=>[row.id,'test',row.group,row.media,row.calls].join(','))].join('\n')+'\n';
