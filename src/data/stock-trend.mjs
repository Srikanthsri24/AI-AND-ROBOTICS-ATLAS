const positive=[11,31,14,36,19,29,13,40,33,20,37,14,28,40,12,23];
const negative=[33,12,29,15,31,15,25,16,15,27,16,30,20,12,28,16];
const close=[100,98,102,101,104,103,106,108,111,109,112,108,110,113,110,112,114];
export const days=positive.map((count,index)=>({
 day:index+1,split:index<8?'fit':'test',positive:count,negative:negative[index],
 close:close[index],nextClose:close[index+1],
}));
export function score(day){return (day.positive-day.negative)/(day.positive+day.negative);}
const outcome=day=>day.nextClose>day.close?'Up':'Down';
const signal=(day,rule)=>(score(day)>=0)===(rule==='follow')?'Up':'Down';
const accuracy=(rows,guess)=>rows.filter(day=>guess(day)===outcome(day)).length;
export function fitRule(){
 const early=days.filter(day=>day.split==='fit');
 return accuracy(early,day=>signal(day,'follow'))>=accuracy(early,day=>signal(day,'reverse'))?'follow':'reverse';
}
export function evaluate(split){
 const matching=days.filter(day=>day.split===split);
 const rule=fitRule();
 const fit=days.filter(day=>day.split==='fit');
 const baseline=accuracy(fit,()=> 'Up')>=accuracy(fit,()=> 'Down')?'Up':'Down';
 const rows=matching.map(day=>{
  const actual=outcome(day), predicted=signal(day,rule);
  return {...day,score:score(day),actual,predicted,correct:actual===predicted};
 });
 return {rows,rule,baseline,correct:accuracy(matching,day=>signal(day,rule)),baselineCorrect:accuracy(matching,()=>baseline)};
}
export const stockCsv=['day,split,positive_posts,negative_posts,close,next_close',...days.map(row=>[row.day,row.split,row.positive,row.negative,row.close,row.nextClose].join(','))].join('\n')+'\n';
