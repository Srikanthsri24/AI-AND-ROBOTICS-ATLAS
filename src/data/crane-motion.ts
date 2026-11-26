/** Native millimetres; hand-operated gantry, not a motorized trolley. */
export const craneDimensions=Object.freeze({baseWidth:300,baseDepth:220,baseTop:10,railY:190,travel:82,faceLow:13,faceHigh:92,magnetDiameter:20,magnetHeight:15,washerOuter:18,washerInner:6,washerThickness:1,landingY:12,sourceX:-65,trayX:65,trolleySpeed:28,hoistSpeed:18,gravity:9810});
export type CraneMotion={x:number;faceY:number;washerX:number;washerY:number;washerVX:number;washerVY:number;attached:boolean;accumulator:number;elapsed:number;pickups:number;deliveries:number;lastLanding:'source'|'tray'|'bench'|null;pendingDelivery:boolean;blocked:boolean};
export type CraneMotionInput={targetX:number;targetFaceY:number;energized:boolean|null;enabled:boolean};
export function craneMotionInitial():CraneMotion{return{x:-65,faceY:50,washerX:-65,washerY:12,washerVX:0,washerVY:0,attached:false,accumulator:0,elapsed:0,pickups:0,deliveries:0,lastLanding:'source',pendingDelivery:false,blocked:false};}
const approach=(a:number,b:number,step:number)=>a+Math.sign(b-a)*Math.min(Math.abs(b-a),step);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/** Flat washer support: base top 10, pad/floor 12, tray wall tops 16 mm. */
export function craneLandingY(x:number){if(!Number.isFinite(x))throw new RangeError('Washer position must be finite');if([42,88].some(w=>Math.abs(x-w)<10))return 16;if(Math.abs(x+65)<30||Math.abs(x-65)<33)return 12;return 10;}
/** Fixed 1 ms integration preserves pickup/drop events across rendering frame sizes.
 * Null drive is electrically indeterminate: freeze the exercise until the wiring is fixed.
 * Supply current is educational nominal current, not a simulated magnetic force law. */
export function craneMotionAdvance(previous:CraneMotion,ms:number,input:CraneMotionInput):CraneMotion{
 if(!Number.isFinite(ms)||ms<0||ms>60000)throw new RangeError('Motion interval must be 0–60000 ms');
 if(!Number.isFinite(input.targetX)||!Number.isFinite(input.targetFaceY))throw new RangeError('Gantry targets must be finite');
 if(!input.enabled||input.energized===null)return{...previous};
 const s={...previous};const total=Math.round((s.accumulator+ms)*1e9)/1e9,ticks=Math.floor(total);s.accumulator=Math.round((total-ticks)*1e9)/1e9;
 const targetX=clamp(input.targetX,-82,82),targetY=clamp(input.targetFaceY,13,92),dt=.001;
 for(let n=0;n<ticks;n++){
  s.elapsed++;const oldX=s.x;s.faceY=approach(s.faceY,targetY,18*dt);
  const wallClearance=s.attached?17.05:16.05;
  if([42,88].some(w=>Math.abs(s.x-w)<11))s.faceY=Math.max(s.faceY,wallClearance);
  let nextX=approach(s.x,targetX,28*dt);s.blocked=false;
  // Actual tray walls reach y=16. The 10 mm radius housing must clear them.
  if(s.faceY<wallClearance){for(const wall of [42,88]){const low=wall-11,high=wall+11;if(oldX<=low&&nextX>low){nextX=low;s.blocked=true;}else if(oldX>=high&&nextX<high){nextX=high;s.blocked=true;}}}
  s.x=nextX;
  // The magnet cannot penetrate a resting washer. A supported load has its top at faceY.
  if(!s.attached&&Math.abs(s.x-s.washerX)<=10&&s.washerY<=craneLandingY(s.washerX)+.001)s.faceY=Math.max(s.faceY,s.washerY+1);
  if(s.attached&&!input.energized){s.attached=false;s.washerVX=(s.x-oldX)/dt;s.washerVY=0;s.pendingDelivery=true;}
  if(s.attached){s.washerX=s.x;s.washerY=s.faceY-1;s.washerVY=0;s.washerVX=(s.x-oldX)/dt;}
  else{
   if(s.washerY>craneLandingY(s.washerX)||s.washerVY!==0){s.washerVY-=9810*dt;s.washerX+=s.washerVX*dt;s.washerY+=s.washerVY*dt;}
   const landing=craneLandingY(s.washerX);if(s.washerY<=landing){s.washerY=landing;s.washerVY=0;s.washerVX=0;const spot=Math.abs(s.washerX-65)<=19?'tray':Math.abs(s.washerX+65)<=19?'source':'bench';s.lastLanding=spot;if(s.pendingDelivery&&spot==='tray')s.deliveries++;s.pendingDelivery=false;}
   const gap=s.faceY-(s.washerY+1);
   if(input.energized&&Math.abs(s.x-s.washerX)<=3&&gap>=-.02&&gap<=.65){s.attached=true;s.washerX=s.x;s.washerY=s.faceY-1;s.washerVY=0;s.washerVX=0;s.pickups++;s.pendingDelivery=false;s.lastLanding=null;}
  }
 }
 return s;
}
