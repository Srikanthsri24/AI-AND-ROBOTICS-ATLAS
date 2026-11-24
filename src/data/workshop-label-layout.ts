export type LabelRect={x:number;y:number;width:number;height:number};
export function layoutWorkshopLabel(anchor:{x:number;y:number},canvas:{width:number;height:number},label:{width:number;height:number},obstacles:LabelRect[],margin=8,gap=12){
 const maxX=Math.max(margin,canvas.width-margin-label.width),maxY=Math.max(margin,canvas.height-margin-label.height),clampX=(n:number)=>Math.max(margin,Math.min(maxX,n)),clampY=(n:number)=>Math.max(margin,Math.min(maxY,n));
 const preferredX=clampX(anchor.x-label.width/2),preferredY=clampY(anchor.y-gap-label.height);
 const xs=[preferredX,margin,maxX,...obstacles.flatMap(o=>[clampX(o.x-margin-label.width),clampX(o.x+o.width+margin)])];
 const ys=[preferredY,clampY(anchor.y+gap),margin,maxY,...obstacles.flatMap(o=>[clampY(o.y-margin-label.height),clampY(o.y+o.height+margin)])];
 let best={x:preferredX,y:preferredY},score=Infinity;
 for(const x of xs)for(const y of ys){let overlap=0;for(const o of obstacles){const w=Math.max(0,Math.min(x+label.width,o.x+o.width+margin)-Math.max(x,o.x-margin)),h=Math.max(0,Math.min(y+label.height,o.y+o.height+margin)-Math.max(y,o.y-margin));overlap+=w*h;}
 const below=y>anchor.y,edgeY=below?y:y+label.height,contains=anchor.x>=x&&anchor.x<=x+label.width&&anchor.y>=y&&anchor.y<=y+label.height;
 const cost=overlap*1e7+(contains?1e9:0)+(x-preferredX)**2*.25+(edgeY-anchor.y-(below?gap:-gap))**2+(below?400:0);
 if(cost<score){score=cost;best={x,y};}}
 const edge=best.y>anchor.y?'top':'bottom',start={x:best.x+label.width/2,y:edge==='top'?best.y:best.y+label.height},dx=anchor.x-start.x,dy=anchor.y-start.y;
 return {...best,edge,length:Math.hypot(dx,dy),rotation:-Math.atan2(dx,dy),start};
}
