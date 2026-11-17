import csv from '../../public/project-files/fruit_samples.csv?raw';

export const fruitProject = {
  id:'directory-100',
  title:'IoT Fruit Sweetness Prediction System (ML & Flask)',
  outcome:'Train a regression model on simulated fruit sensor readings, estimate sweetness, and compare the results on a separate test set.',
  cover:'./images/project-covers/fruit-sweetness.jpg',
};

type Reading = {color:number; firmness:number};
export type Fruit = Reading & {id:string; split:'train'|'test'; brix:number};

export const fruits:Fruit[] = csv.trim().split(/\r?\n/).slice(1).map(line=>{
  const [id,split,color,firmness,brix]=line.split(',');
  if(split!=='train' && split!=='test') throw new Error('Invalid fruit split');
  return {id,split,color:Number(color),firmness:Number(firmness),brix:Number(brix)};
});
export const training = fruits.filter(row=>row.split==='train');
export const heldOut = fruits.filter(row=>row.split==='test');

export function fit(rows:Fruit[]) {
  const means=rows.reduce((sum,row)=>({
    color:sum.color+row.color/rows.length,
    firmness:sum.firmness+row.firmness/rows.length,
    brix:sum.brix+row.brix/rows.length,
  }),{color:0,firmness:0,brix:0});
  let cc=0,ff=0,cf=0,cy=0,fy=0;
  for(const row of rows){
    const c=row.color-means.color,f=row.firmness-means.firmness,y=row.brix-means.brix;
    cc+=c*c;ff+=f*f;cf+=c*f;cy+=c*y;fy+=f*y;
  }
  const determinant=cc*ff-cf*cf;
  if(determinant<=1e-9) throw new Error('Training needs independent variation in both sensor readings.');
  const color=(cy*ff-fy*cf)/determinant;
  const firmness=(fy*cc-cy*cf)/determinant;
  return {intercept:means.brix-color*means.color-firmness*means.firmness,color,firmness};
}

export const model = fit(training);
export const bounds = {
  color:[Math.min(...training.map(row=>row.color)),Math.max(...training.map(row=>row.color))],
  firmness:[Math.min(...training.map(row=>row.firmness)),Math.max(...training.map(row=>row.firmness))],
};

export function estimate({color,firmness}:Reading) {
  const outside=color<bounds.color[0]||color>bounds.color[1]||firmness<bounds.firmness[0]||firmness>bounds.firmness[1];
  return {predicted:model.intercept+model.color*color+model.firmness*firmness,outside};
}

export const metrics = heldOut.map(row=>{
  const {predicted}=estimate(row);
  return {...row,predicted,error:Math.abs(row.brix-predicted)};
});
export const meanError = metrics.reduce((sum,row)=>sum+row.error,0)/metrics.length;

export const fruitSteps = [
  ['Collect a sensor packet','The example station sends a color index and a firmness index, each on a 0–100 scale. The built-in browser station simulates the two readings.'],
  ['Split the labeled samples','Use the 12 training rows to fit the model. The four held-out rows carry reference °Bx labels and are reserved for evaluation.'],
  ['Fit and serve the estimate','Fit an intercept and one coefficient per sensor. Flask accepts a JSON packet at POST /predict and returns the predicted °Bx and a range flag.'],
  ['Check test error and domain','Compare each held-out reference with its prediction and average the absolute differences. An input outside either training range calls for review.'],
];
