/** Slow illustrative paper motion for the classroom sorter, not measured material behaviour. */
export type SorterPoint=[number,number,number];
export type SorterBin='A'|'B';
export const sorterDimensions={pivot:[1,1.5,0] as SorterPoint,deckHalfWidth:1.05,paperHalfWidth:.315,paperHalfDepth:.42,paperSurface:.072,gravity:4,friction:.22,binFloor:.22,stackSpacing:.008,settleSeconds:.40};
export function sorterDeckPoint(point:SorterPoint,angle:number):SorterPoint{const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [1+c*point[0]-s*point[1],1.5+s*point[0]+c*point[1],point[2]];}
export function sorterSlide(angle:number,stack=0){
 if(!Number.isFinite(angle)||Math.abs(angle)>45||!Number.isInteger(stack)||stack<0||stack>5)throw new Error('Use a supported deck angle and a stack of zero to five letters.');
 const theta=angle*Math.PI/180,direction=angle<0?1:-1,acceleration=Math.max(0,sorterDimensions.gravity*(Math.sin(Math.abs(theta))-sorterDimensions.friction*Math.cos(theta))),destination:SorterBin=direction<0?'A':'B',floor=sorterDimensions.binFloor+.002+stack*sorterDimensions.stackSpacing;
 if(acceleration===0)return {theta,direction,acceleration,destination:null,contactTime:Infinity,finishTime:Infinity,floor,lastExit:Infinity};
 const leadExit=Math.sqrt(2*(sorterDimensions.deckHalfWidth-sorterDimensions.paperHalfWidth)/acceleration),lastExit=Math.sqrt(2*(sorterDimensions.deckHalfWidth+sorterDimensions.paperHalfWidth)/acceleration),exitY=1.5+direction*sorterDimensions.deckHalfWidth*Math.sin(theta)+sorterDimensions.paperSurface*Math.cos(theta),downSpeed=Math.sin(Math.abs(theta))*acceleration*leadExit;
 const contactTime=leadExit+(-downSpeed+Math.sqrt(downSpeed*downSpeed+2*sorterDimensions.gravity*(exitY-floor)))/sorterDimensions.gravity;
 return {theta,direction,acceleration,destination,contactTime,finishTime:contactTime+sorterDimensions.settleSeconds,floor,lastExit};
}
function freePoint(time:number,x:number,z:number,p:ReturnType<typeof sorterSlide>):SorterPoint{
 const d=sorterDimensions,s=.5*p.acceleration*time*time,along=s+p.direction*x;
 if(p.acceleration===0||along<=d.deckHalfWidth)return sorterDeckPoint([x+p.direction*s,d.paperSurface,z],p.theta*180/Math.PI);
 const exited=Math.sqrt(2*(d.deckHalfWidth-p.direction*x)/p.acceleration),dt=time-exited,velocity=p.acceleration*exited,edge=sorterDeckPoint([p.direction*d.deckHalfWidth,d.paperSurface,z],p.theta*180/Math.PI);
 return [edge[0]+p.direction*Math.cos(p.theta)*velocity*dt,edge[1]+p.direction*Math.sin(p.theta)*velocity*dt-.5*d.gravity*dt*dt,z];
}
export function sorterSheetPoint(time:number,angle:number,x:number,z:number,stack=0):SorterPoint{
 if(!Number.isFinite(time)||time<0||Math.abs(x)>sorterDimensions.paperHalfWidth+1e-9||Math.abs(z)>sorterDimensions.paperHalfDepth+1e-9)throw new Error('Use a valid sheet coordinate and elapsed time.');
 const p=sorterSlide(angle,stack);if(time<=p.contactTime)return freePoint(time,x,z,p);
 const blend=Math.min(1,(time-p.contactTime)/sorterDimensions.settleSeconds),smooth=blend*blend*(3-2*blend),start=freePoint(p.contactTime,x,z,p),target:SorterPoint=[(p.destination==='A'?-.6:2.6)+x,p.floor,z];
 return start.map((v,i)=>v+(target[i]-v)*smooth) as SorterPoint;
}
/** An exact column at the deck edge prevents a bent triangle from cutting across the solid lip. */
export function sorterSheetColumns(time:number,angle:number){const p=sorterSlide(angle),half=sorterDimensions.paperHalfWidth,edge=p.direction*(sorterDimensions.deckHalfWidth-.5*p.acceleration*time*time),columns=Array.from({length:17},(_,i)=>-half+i*2*half/16);columns.push(Math.max(-half,Math.min(half,edge)));return columns.sort((a,b)=>a-b);}
export function sorterLetterPhase(time:number,angle:number,stack=0){const p=sorterSlide(angle,stack);if(p.acceleration===0)return 'stationary';if(time>=p.finishTime)return 'landed';if(time>=p.contactTime)return 'settling';if(time>=p.lastExit)return 'falling';if(.5*p.acceleration*time*time+sorterDimensions.paperHalfWidth>sorterDimensions.deckHalfWidth)return 'leaving edge';return 'sliding';}
export function sorterBinContains(bin:SorterBin,point:SorterPoint){const center=bin==='A'?-.6:2.6;return point[0]>center-.74&&point[0]<center+.74&&point[2]>-.74&&point[2]<.74;}
/** Carry the light deck in from the front, underneath the already-installed chute. */
export function sorterFitPose(progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>1)throw new Error('Fit progress must be between zero and one.');
 const e=(from:number,to:number)=>{const t=Math.max(0,Math.min(1,(progress-from)/(to-from)));return t*t*(3-2*t);};
 const deck:SorterPoint=[2.65-1.65*e(.4,.55),.195+3.055*e(.25,.4)-1.75*e(.6,.75),2.05*(1-e(.8,1))];
 const horn:SorterPoint=[-.4+1.4*e(.2,.35),.19+3.31*e(0,.2)-2*e(.35,.5),2.2*(1-e(.2,.35))-.9*e(.5,.6)];
 return {deck,horn,hornRotationX:-Math.PI/2*(1-e(.2,.35))};
}
