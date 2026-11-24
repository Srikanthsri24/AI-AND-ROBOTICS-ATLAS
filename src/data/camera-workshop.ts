export type CounterScene='empty'|'one'|'separated'|'touching';
export type CounterTarget={id:1|2|3;x:number;z:number};
export const counterWidth=240,counterHeight=160;
export const counterField={x:-.65,z:.35,width:2.6,depth:1.6,radius:.21};
export const counterScenes:Record<CounterScene,string>={empty:'Empty card',one:'One target',separated:'Three separated',touching:'Two touching'};
export const counterLayouts:Record<CounterScene,CounterTarget[]>={
 empty:[],one:[{id:1,x:-.65,z:.35}],
 separated:[{id:1,x:-1.45,z:.10},{id:2,x:-.65,z:.55},{id:3,x:.16,z:.08}],
 touching:[{id:1,x:-1.0,z:.35},{id:2,x:-.58,z:.35},{id:3,x:.16,z:.08}],
};
export type CounterRegion={id:number;area:number;minX:number;minY:number;maxX:number;maxY:number;members:number[]};
export type CounterFrame={gray:Uint8Array;mask:Uint8Array;labels:Int32Array;regions:CounterRegion[];discarded:number;scene:CounterScene;serial:number;threshold:number;minimumArea:number;light:number;glare:boolean};
export function counterPixel(x:number,z:number):[number,number]{return [Math.round((x-counterField.x+counterField.width/2)/counterField.width*(counterWidth-1)),Math.round((z-counterField.z+counterField.depth/2)/counterField.depth*(counterHeight-1))];}
export function targetGray(light:number){return Math.round(80+light*1.65);}
export function analyzeCounter(gray:Uint8Array,width:number,height:number,threshold:number,minimumArea:number){
 const mask=Uint8Array.from(gray,value=>value>threshold?1:0),labels=new Int32Array(width*height),queue=new Int32Array(width*height);const regions:CounterRegion[]=[];let nextId=0,discarded=0;
 for(let start=0;start<mask.length;start++){
  if(!mask[start]||labels[start])continue;
  const id=++nextId;let size=1;queue[0]=start;labels[start]=id;
  const region:CounterRegion={id,area:0,minX:width,minY:height,maxX:0,maxY:0,members:[]};
  for(let head=0;head<size;head++){
   const pixel=queue[head],x=pixel%width,y=Math.floor(pixel/width);region.area++;region.minX=Math.min(region.minX,x);region.maxX=Math.max(region.maxX,x);region.minY=Math.min(region.minY,y);region.maxY=Math.max(region.maxY,y);
   for(let ny=Math.max(0,y-1);ny<=Math.min(height-1,y+1);ny++)for(let nx=Math.max(0,x-1);nx<=Math.min(width-1,x+1);nx++){const neighbor=ny*width+nx;if(mask[neighbor]&&!labels[neighbor]){labels[neighbor]=id;queue[size++]=neighbor;}}
  }
  if(region.area>=minimumArea)regions.push(region);else discarded++;
 }
 regions.sort((a,b)=>a.minX-b.minX||a.minY-b.minY);return {mask,labels,regions,discarded};
}
export function captureCounter({targets,light,threshold,minimumArea,glare,scene,serial}:{targets:CounterTarget[];light:number;threshold:number;minimumArea:number;glare:boolean;scene:CounterScene;serial:number}):CounterFrame{
 const gray=new Uint8Array(counterWidth*counterHeight);
 for(let y=0;y<counterHeight;y++)for(let x=0;x<counterWidth;x++){
  const wx=counterField.x-counterField.width/2+x/(counterWidth-1)*counterField.width,wz=counterField.z-counterField.depth/2+y/(counterHeight-1)*counterField.depth;
  let tone=18+light*.15+(x/counterWidth)*5;
  for(const target of targets){const distance=Math.hypot(wx-target.x,wz-target.z);if(distance<=counterField.radius+.009){const edge=Math.max(0,Math.min(1,(counterField.radius+.009-distance)/.012));tone=Math.max(tone,tone+(targetGray(light)-tone)*edge);}}
  if(glare&&((wx+.05)/.22)**2+((wz-.92)/.10)**2<=1)tone=245;
  // Two fixed tiny bright flecks make the area filter observable in both views.
  if(Math.hypot(wx+1.60,wz-.96)<.014||Math.hypot(wx-.40,wz+.22)<.014)tone=225;
  gray[y*counterWidth+x]=Math.round(tone);
 }
 const result=analyzeCounter(gray,counterWidth,counterHeight,threshold,minimumArea);
 for(const target of targets){const [x,y]=counterPixel(target.x,target.z),id=result.labels[y*counterWidth+x];const region=result.regions.find(item=>item.id===id);if(region)region.members.push(target.id);}
 return {gray,...result,scene,serial,threshold,minimumArea,light,glare};
}
