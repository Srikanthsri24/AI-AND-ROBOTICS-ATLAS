/** Illustrative mechanics in scene units, not a measured motor RPM / stopping-distance model. */
export type BluetoothCarPose={x:number;z:number;yaw:number;leftAngle:number;rightAngle:number;leftVelocity:number;rightVelocity:number;casterAngle:number;casterRoll:number};
export const bluetoothCarWheelRadius=.65,bluetoothCarTrack=3.8;
export function bluetoothCarPose():BluetoothCarPose{return {x:0,z:0,yaw:0,leftAngle:0,rightAngle:0,leftVelocity:0,rightVelocity:0,casterAngle:0,casterRoll:0};}
export function bluetoothCarMotion(p:BluetoothCarPose,dt:number,drive:{left:-1|0|1;right:-1|0|1;enabled:boolean;motorPower:boolean;onStand:boolean;leftReversed?:boolean;rightReversed?:boolean;pwmLeft?:number;pwmRight?:number;speedScale?:number}):BluetoothCarPose{
 if(!Number.isFinite(dt)||dt<=0)return {...p};
 // Substep longer frames so a slow browser does not jump through the scene.
 const count=Math.ceil(Math.min(dt,1)/.01),h=Math.min(dt,1)/count,out={...p,casterAngle:p.casterAngle??0,casterRoll:p.casterRoll??0};
 const scale=drive.speedScale??1,pwm=(n:number|undefined)=>Math.max(0,Math.min(255,n??110))/110;
 const active=drive.enabled&&drive.motorPower,targetLeft=active?drive.left*(drive.leftReversed?-1:1)*4*scale*pwm(drive.pwmLeft):0,targetRight=active?drive.right*(drive.rightReversed?-1:1)*4*scale*pwm(drive.pwmRight):0;
 for(let i=0;i<count;i++){
  const leftOld=out.leftVelocity,rightOld=out.rightVelocity,rate=active?12:4,a=Math.exp(-rate*h);
  out.leftVelocity=targetLeft+(leftOld-targetLeft)*a;out.rightVelocity=targetRight+(rightOld-targetRight)*a;
  if(!active&&Math.abs(out.leftVelocity)<.005)out.leftVelocity=0;if(!active&&Math.abs(out.rightVelocity)<.005)out.rightVelocity=0;
  const left=(leftOld+out.leftVelocity)/2,right=(rightOld+out.rightVelocity)/2;
  out.leftAngle-=left*h;out.rightAngle-=right*h;
  if(!drive.onStand){const v=(left+right)/2*bluetoothCarWheelRadius,w=(right-left)*bluetoothCarWheelRadius/bluetoothCarTrack,mid=out.yaw+w*h/2;out.x-=v*Math.sin(mid)*h;out.z-=v*Math.cos(mid)*h;out.yaw+=w*h;
   // The rear caster is passive: it follows floor motion and stays still on the stand.
   const lateral=w*1.52;
   if(Math.hypot(v,lateral)>.005){const target=Math.atan2(-lateral,v),difference=Math.atan2(Math.sin(target-out.casterAngle),Math.cos(target-out.casterAngle));out.casterAngle+=difference*(1-Math.exp(-8*h));}
   out.casterRoll-=(v*Math.cos(out.casterAngle)-lateral*Math.sin(out.casterAngle))/.20*h;
  }
 }
 return out;
}
