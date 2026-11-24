/** Mirrors handheld_signal_paddle.ino. true means active-low thumb press. */
export type PaddleState={raw:boolean;stable:boolean;changedAt:number;active:boolean;burstStarted:number;outputOn:boolean;events:{at:number;message:string}[]};
export function paddleInitial():PaddleState{return {raw:false,stable:false,changedAt:0,active:false,burstStarted:0,outputOn:false,events:[{at:0,message:'Ready.'}]};}
export function paddleTick(previous:PaddleState,pressed:boolean,now:number):PaddleState{
 now=now>>>0;const s={...previous,events:[...previous.events]};if(s.raw!==pressed){s.raw=pressed;s.changedAt=now;}
 if(s.raw!==s.stable&&((now-s.changedAt)>>>0)>=25){s.stable=s.raw;if(s.stable&&!s.active){s.active=true;s.burstStarted=now;s.events.push({at:now,message:'Burst started.'});}}
 const elapsed=(now-s.burstStarted)>>>0;if(s.active&&elapsed>=1200){s.active=false;s.events.push({at:now,message:'Burst finished.'});}
 s.outputOn=s.active&&elapsed%480<240;return s;
}
export type PaddlePoint=[number,number,number];
/** Lift clear of the display cradle before translating or tilting the handheld part. */
export function paddlePose(lift:number){const v=Math.max(0,Math.min(1,lift)),rise=Math.min(1,v/.55),tilt=Math.max(0,(v-.55)/.45);return {position:[1.5+.25*tilt,.38+.5*rise,-.1*tilt] as PaddlePoint,rotation:[-.12*tilt,.18*tilt,-.10*tilt] as PaddlePoint};}
export function paddlePoint(point:PaddlePoint,lift:number):PaddlePoint{const p=paddlePose(lift),[rx,ry,rz]=p.rotation,[x,y,z]=point,a=Math.cos(rz)*x-Math.sin(rz)*y,b=Math.sin(rz)*x+Math.cos(rz)*y,c=Math.cos(ry)*a+Math.sin(ry)*z,d=-Math.sin(ry)*a+Math.cos(ry)*z;return [p.position[0]+c,p.position[1]+Math.cos(rx)*b-Math.sin(rx)*d,p.position[2]+Math.sin(rx)*b+Math.cos(rx)*d];}
export function paddlePaperPoint(point:PaddlePoint,open:number):PaddlePoint{const angle=-1.55*Math.max(0,Math.min(1,open));return [-.41+Math.cos(angle)*point[0]+Math.sin(angle)*point[2],1.95+point[1],.074-Math.sin(angle)*point[0]+Math.cos(angle)*point[2]];}
/** Illustrative illumination: axial LED ray must fall inside the hinged paper circle. */
export function paddlePaperFlux(open:number){const a=1.55*Math.max(0,Math.min(1,open)),c=Math.cos(a);if(c<=0||.41*(1/c-1)>.395)return 0;return c/(1+8*.41*Math.tan(a))**2;}
