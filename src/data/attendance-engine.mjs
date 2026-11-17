export const imageWidth = 72;
export const imageHeight = 88;
export const matchLimit = .19;
export const minimumMargin = .036;

export const roster = [
  {id:'A01', name:'Amara', shape:[27,34,13,23,9,7]},
  {id:'A02', name:'Basil', shape:[23,35,19,28,6,13]},
  {id:'A03', name:'Cleo', shape:[30,29,15,31,12,3]},
];

export const faceSamples = [
  {id:'amara', name:'Amara · offset and dimmer', shape:[27,34,13,23,9,7], offset:2, brightness:-18},
  {id:'basil', name:'Basil · offset and brighter', shape:[23,35,19,28,6,13], offset:-2, brightness:14},
  {id:'cleo', name:'Cleo · slightly different expression', shape:[30,29,15,30,12,4], offset:1, brightness:8},
  {id:'mixed', name:'Ambiguous portrait', shape:[25,34.5,16,25.5,7.5,10], offset:0, brightness:0},
  {id:'visitor', name:'Unenrolled visitor', shape:[19,25,22,36,16,17], offset:0, brightness:0},
];

export function renderFace(shape, offset = 0, brightness = 0) {
  const [faceWidth,faceHeight,eyeSpace,eyeY,noseLength,mouthWidth] = shape;
  const pixels = new Uint8Array(imageWidth * imageHeight);
  function inside(x,y,cx,cy,rx,ry) {
    return ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1;
  }
  for (let y=0;y<imageHeight;y++) {
    for (let column=0;column<imageWidth;column++) {
      const x=column-offset;
      const cx=36;
      let tone=43;
      if (inside(x,y,cx,43,faceWidth,faceHeight)) {
        tone=185 + Math.round((cx-x)*.61);
        if (inside(x,y,cx,21,faceWidth*.85,13) && y<=eyeY-6) tone=78;
        if ([-1,1].some(side=>inside(x,y,cx+side*eyeSpace,eyeY+8,4.6,3.8))) tone=56;
        if (inside(x,y,cx,eyeY+16,2.8,noseLength*.57)) tone=122;
        if (inside(x,y,cx,eyeY+31,mouthWidth,2.8)) tone=80;
      }
      pixels[y*imageWidth+column]=Math.max(0,Math.min(255,tone+brightness));
    }
  }
  return pixels;
}

export function describeFace(pixels) {
  if (pixels.length!==imageWidth*imageHeight) throw new Error('Expected a 72 × 88 grayscale portrait.');
  const floor=pixels[0];
  let minX=imageWidth,maxX=-1,minY=imageHeight,maxY=-1;
  for(let y=0;y<imageHeight;y++) for(let x=0;x<imageWidth;x++) {
    if(pixels[y*imageWidth+x]-floor<25) continue;
    minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  if(maxX<minX) return null;
  const width=maxX-minX+1,height=maxY-minY+1;
  const features=[width/imageWidth,height/imageHeight];
  for(let row=0;row<16;row++) for(let column=0;column<16;column++) {
    const x0=minX+Math.floor(column*width/16), x1=minX+Math.floor((column+1)*width/16);
    const y0=minY+Math.floor(row*height/16), y1=minY+Math.floor((row+1)*height/16);
    let total=0,count=0;
    for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) { total+=pixels[y*imageWidth+x]-floor;count++; }
    features.push(count?total/(count*160):0);
  }
  return features;
}

export function matchFace(pixels, enrolled=roster, limit=matchLimit) {
  const probe=describeFace(pixels);
  if (!probe||enrolled.length===0) return {status:'unknown',candidates:[]};
  const candidates=enrolled.map(person=>{
    const reference=describeFace(renderFace(person.shape));
    const error=probe.slice(2).reduce((sum,value,index)=>sum+(value-reference[index+2])**2,0);
    const sizeError=((probe[0]-reference[0])**2+(probe[1]-reference[1])**2)*.45;
    return {id:person.id,name:person.name,distance:Math.sqrt(error/256+sizeError)};
  }).sort((a,b)=>a.distance-b.distance);
  const [best,next]=candidates;
  const status=best.distance>limit?'unknown':next&&next.distance-best.distance<minimumMargin?'review':'match';
  return {status,candidates};
}

export function runSample(sampleId, enrolled=roster, limit=matchLimit) {
  const sample=faceSamples.find(item=>item.id===sampleId);
  if (!sample) throw new Error('Unknown sample ID');
  return matchFace(renderFace(sample.shape,sample.offset,sample.brightness),enrolled,limit);
}
