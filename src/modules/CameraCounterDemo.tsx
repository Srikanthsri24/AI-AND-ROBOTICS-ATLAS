import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

const width=320, height=210, displayedRegions=12;
type Scene='empty'|'one'|'separated'|'touching';
type Region={area:number;minX:number;minY:number;maxX:number;maxY:number};
const scenes:Record<Scene,string>={empty:'Empty card',one:'One target',separated:'Three separated',touching:'Two touching'};
const sceneCenters:Record<Scene,[number,number][]>={
  empty:[],one:[[160,107]],separated:[[75,95],[149,119],[236,89]],touching:[[88,108],[124,108],[236,89]],
};

function paintSample(ctx:CanvasRenderingContext2D,scene:Scene,dim:boolean) {
  const field=ctx.createLinearGradient(0,0,width,height);
  field.addColorStop(0,dim?'#222932':'#3b4756');
  field.addColorStop(1,'#161c25');
  ctx.fillStyle=field;
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle=dim?'#101721':'#1c242e';
  ctx.fillRect(16,15,288,180);
  ctx.strokeStyle='#596777';
  ctx.strokeRect(16.5,15.5,287,179);
  for(const [x,y] of sceneCenters[scene]){
    ctx.beginPath();ctx.arc(x+2,y+4,25,0,Math.PI*2);
    ctx.fillStyle='#0d141c';ctx.fill();
  }
  for(const [x,y] of sceneCenters[scene]){
    ctx.beginPath();ctx.arc(x,y,23,0,Math.PI*2);
    const fill=ctx.createRadialGradient(x-6,y-8,3,x,y,25);
    fill.addColorStop(0,dim?'#898a7c':'#fbf8d7');
    fill.addColorStop(1,dim?'#6b726c':'#d4dbc0');
    ctx.fillStyle=fill;ctx.fill();
  }
  ctx.fillStyle='#d4d8c4';
  ctx.fillRect(275,163,3,3);ctx.fillRect(48,53,2,2);
  ctx.fillStyle='#81909c';ctx.font='10px system-ui';
  ctx.fillText('COUNTING FIELD',32,34);
}

function analyze(frame:ImageData,threshold:number,minimumArea:number) {
  const mask=new Uint8Array(width*height);
  for(let i=0;i<mask.length;i++){
    const pixel=i*4;
    const gray=Math.round(.299*frame.data[pixel]+.587*frame.data[pixel+1]+.114*frame.data[pixel+2]);
    mask[i]=gray>threshold?1:0;
  }
  const visited=new Uint8Array(mask.length);
  const queue=new Int32Array(mask.length);
  const regions:Region[]=[];
  let discarded=0;
  for(let start=0;start<mask.length;start++){
    if(!mask[start]||visited[start])continue;
    let length=1;
    queue[0]=start;
    visited[start]=1;
    const region:Region={area:0,minX:width,minY:height,maxX:0,maxY:0};
    for(let head=0;head<length;head++){
      const pixel=queue[head];
      const x=pixel%width,y=Math.floor(pixel/width);
      region.area++;
      region.minX=Math.min(region.minX,x);
      region.maxX=Math.max(region.maxX,x);
      region.minY=Math.min(region.minY,y);
      region.maxY=Math.max(region.maxY,y);
      for(let ny=Math.max(0,y-1);ny<=Math.min(height-1,y+1);ny++){
        for(let nx=Math.max(0,x-1);nx<=Math.min(width-1,x+1);nx++){
          const next=ny*width+nx;
          if(mask[next]&&!visited[next]){
            visited[next]=1;
            queue[length++]=next;
          }
        }
      }
    }
    if(region.area>=minimumArea)regions.push(region);
    else discarded++;
  }
  regions.sort((a,b)=>a.minX-b.minX || a.minY-b.minY);
  const picture=new ImageData(width,height);
  for(let i=0;i<mask.length;i++){
    const tone=mask[i]?238:19;
    const offset=i*4;
    picture.data[offset]=picture.data[offset+1]=picture.data[offset+2]=tone;
    picture.data[offset+3]=255;
  }
  return {picture,regions,discarded};
}

export default function CameraCounterDemo() {
  const [scene,setScene]=useState<Scene>('separated');
  const [threshold,setThreshold]=useState(150);
  const [minimumArea,setMinimumArea]=useState(80);
  const [dim,setDim]=useState(false);
  const [result,setResult]=useState({regions:[] as Region[],discarded:0});
  const [selection,select]=useState<number|null>(null);
  const [photo,setPhoto]=useState<HTMLImageElement|null>(null);
  const [feedback,setFeedback]=useState('');
  const uploadVersion=useRef(0);
  const source=useRef<HTMLCanvasElement>(null);
  const mask=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const ctx=source.current?.getContext('2d',{willReadFrequently:true});
    const output=mask.current?.getContext('2d');
    if(!ctx||!output)return;
    if(photo){
      const scale=Math.min(width/photo.naturalWidth,height/photo.naturalHeight);
      const w=photo.naturalWidth*scale,h=photo.naturalHeight*scale;
      ctx.fillStyle='#10161d';ctx.fillRect(0,0,width,height);
      ctx.drawImage(photo,(width-w)/2,(height-h)/2,w,h);
    } else paintSample(ctx,scene,dim);
    const {picture,regions,discarded}=analyze(ctx.getImageData(0,0,width,height),threshold,minimumArea);
    output.putImageData(picture,0,0);
    output.font='bold 11px system-ui';
    regions.slice(0,displayedRegions).forEach(({minX,minY,maxX,maxY},i)=>{
      output.strokeStyle=selection===i?'#ffc76b':'#19bf9c';
      output.lineWidth=selection===i?2:1;
      output.strokeRect(minX-1,minY-1,maxX-minX+3,maxY-minY+3);
      const labelX=Math.max(0,Math.min(width-18,minX-1)),labelY=Math.max(0,minY-15);
      output.fillStyle=output.strokeStyle;
      output.fillRect(labelX,labelY,18,14);
      output.fillStyle='#132030';
      output.fillText(String(i+1),labelX+4,labelY+11);
    });
    setResult({regions,discarded});
  },[scene,threshold,minimumArea,dim,photo,selection]);

  function choose(next:Scene){
    uploadVersion.current++;
    setPhoto(null);setFeedback('');setScene(next);select(null);
  }
  async function load(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    const version=++uploadVersion.current;
    setFeedback('');
    if(file.size>12*1024*1024){setFeedback('Choose a photo under 12 MB.');return;}
    const url=URL.createObjectURL(file);
    try {
      const image=new Image();
      image.src=url;
      await image.decode();
      if(version===uploadVersion.current){setPhoto(image);select(null);setFeedback('Local photo loaded.');}
    } catch {
      if(version===uploadVersion.current)setFeedback('This file could not be opened as a photo.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const inspected=selection===null?null:result.regions[selection];
  return <div className="gp-camera-counter">
    <div className="gp-camera-frames" role="region" aria-label="Camera frame and counted mask">
      <figure><figcaption><strong>Input frame</strong><span>{photo?'Local photo':scenes[scene]}</span></figcaption><canvas ref={source} width={width} height={height} role="img" aria-label="Camera input frame"/></figure>
      <figure><figcaption><strong>Binary mask</strong><span>Numbered boxes show counted regions</span></figcaption><canvas ref={mask} width={width} height={height} role="img" aria-label="Threshold mask with numbered region boxes"/></figure>
    </div>
    <div className="gp-camera-controls gp-guide">
      <div><h3>Choose a counting scene</h3><div className="gp-steps">
        {(Object.keys(scenes) as Scene[]).map(key=><button key={key} type="button" aria-pressed={scene===key&&!photo} onClick={()=>choose(key)}>{scenes[key]}</button>)}
      </div><label className="gp-camera-file">Load a local photo<input type="file" accept="image/*" onChange={load}/></label>
      <p className="gp-camera-file-note">{feedback||'Processing stays in this browser.'}</p></div>
      <div><h3>Adjust the detector</h3>
        <label className="gp-home-light">Grayscale threshold <output>{threshold}</output><input aria-label="Grayscale threshold" type="range" min="0" max="255" value={threshold} onChange={event=>{setThreshold(event.target.valueAsNumber);select(null);}}/></label>
        <label className="gp-home-light">Minimum area in pixels <output>{minimumArea}</output><input aria-label="Minimum area in pixels" type="range" min="1" max="5000" value={minimumArea} onChange={event=>{setMinimumArea(event.target.valueAsNumber);select(null);}}/></label>
        <label className="gp-camera-check"><input type="checkbox" disabled={photo!==null} checked={dim} onChange={event=>{setDim(event.target.checked);select(null);}}/> Dim the sample light</label>
        <button className="gp-button gp-secondary" type="button" onClick={()=>{choose('separated');setThreshold(150);setMinimumArea(80);setDim(false);}}>Reset detector</button>
      </div>
      <div><h3>Read the result</h3><p role="status"><strong>{result.regions.length} {result.regions.length===1?'region':'regions'} counted</strong> · {result.discarded} below minimum area</p>
        <p>Pixels brighter than the cutoff turn white. Touching white pixels form one region. The area filter rejects small flecks.</p>
        {!!result.regions.length&&<div className="gp-steps" aria-label="Counted regions">{result.regions.slice(0,displayedRegions).map((_,i)=><button key={i} type="button" aria-pressed={selection===i} onClick={()=>select(i)}>Region {i+1}</button>)}</div>}
        {result.regions.length>displayedRegions&&<p>Boxes show the first {displayedRegions} regions from left to right.</p>}
        {inspected&&<p className="gp-demo-description">Region {(selection??0)+1} covers {inspected.area.toLocaleString()} foreground pixels.</p>}
      </div>
    </div>
  </div>;
}
