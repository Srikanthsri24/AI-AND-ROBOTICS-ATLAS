export const analyticsProject = {
  id:'directory-47',
  title:'Python Apps for Computer Vision and Predictive Modeling',
  outcome:'Count bright objects in a small image and train a line to estimate a model rover’s stopping distance.',
  cover:'./images/project-covers/python-analytics.jpg',
};

const images = {
  separated: [
    '000000000000',
    '011100000000',
    '011100002200',
    '011100002200',
    '000000002200',
    '000000000000',
    '000333000000',
    '000333000000',
    '000000000000',
  ],
  touching: [
    '000000000000',
    '011100000000',
    '011111112200',
    '011100002200',
    '000000002200',
    '000000000000',
    '000333000000',
    '000333000000',
    '000000000000',
  ],
  dim: [
    '000000000000',
    '011100000000',
    '011100002200',
    '011100002200',
    '000000002200',
    '000000000000',
    '000444000000',
    '000444000000',
    '000000000000',
  ],
};
export type ImageId = keyof typeof images;
export const imageNames: Record<ImageId,string> = {separated:'Separated objects',touching:'Touching objects',dim:'Dim third object'};
const shades = [25,224,176,200,105];
export const imagePixels = (image:ImageId) => images[image].map(row=>Array.from(row,digit=>shades[Number(digit)]));

export function labelRegions(pixels:number[][], threshold:number) {
  const labels = pixels.map(row=>row.map(()=>0));
  let count = 0;
  for (let y=0;y<pixels.length;y++) for(let x=0;x<pixels[y].length;x++) {
    if(pixels[y][x]<threshold||labels[y][x])continue;
    const queue = [[y,x]];
    labels[y][x]=++count;
    for(let i=0;i<queue.length;i++){
      const [row,col]=queue[i];
      for(const [r,c] of [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]){
        if((pixels[r]?.[c]??-1)<threshold||labels[r][c])continue;
        labels[r][c]=count;
        queue.push([r,c]);
      }
    }
  }
  return {labels,count};
}

export const stops = [
  {speed:15,distance:7,split:'train'},
  {speed:20,distance:8.8,split:'train'},
  {speed:26,distance:10.8,split:'test'},
  {speed:30,distance:12.9,split:'train'},
  {speed:35,distance:15.4,split:'train'},
  {speed:42,distance:17.1,split:'test'},
  {speed:50,distance:21.4,split:'train'},
] as const;

const train = stops.filter(row=>row.split==='train');
const mean = (series:number[]) => series.reduce((sum,item)=>sum+item,0)/series.length;
const centerX=mean(train.map(row=>row.speed));
const centerY=mean(train.map(row=>row.distance));
const slope=train.reduce((sum,row)=>sum+(row.speed-centerX)*(row.distance-centerY),0)/
  train.reduce((sum,row)=>sum+(row.speed-centerX)**2,0);
const intercept=centerY-slope*centerX;
export const predict = (speed:number) => slope*speed+intercept;
export const testError = mean(stops.filter(row=>row.split==='test').map(row=>Math.abs(row.distance-predict(row.speed))));
export const trainingSpan=[train[0].speed,train[train.length-1].speed] as const;
export const toPgm=(id:ImageId)=> {
  const pixels=imagePixels(id);
  return `P2\n${pixels[0].length} ${pixels.length}\n255\n${pixels.map(row=>row.join(' ')).join('\n')}\n`;
};
export const stopsCsv='speed_cm_s,stop_cm,split\n'+stops.map(({speed,distance,split})=>`${speed},${distance},${split}`).join('\n')+'\n';
