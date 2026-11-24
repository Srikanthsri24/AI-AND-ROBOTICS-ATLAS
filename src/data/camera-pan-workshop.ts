/** Mirrors desktop_camera_pan_model.ino: the last recognized lowercase character wins, then one due step. */
export type CameraPanState={commanded:number;target:number;lastStep:number;lines:{at:number;text:string}[]};
export const cameraPanLimits={left:35,center:90,right:145,stepDegrees:2,stepMs:20} as const;
export function cameraPanInitial():CameraPanState{return {commanded:90,target:90,lastStep:0,lines:[{at:0,text:'l left, c center, r right'}]};}
export function cameraPanTick(previous:CameraPanState,text:string,now:number):CameraPanState{now=now>>>0;const s={...previous,lines:[...previous.lines]};for(const c of text){if(c==='l')s.target=35;else if(c==='c')s.target=90;else if(c==='r')s.target=145;}if(s.commanded===s.target||((now-s.lastStep)>>>0)<20)return s;s.lastStep=now;const delta=s.target-s.commanded;s.commanded+=Math.max(-2,Math.min(2,delta));if(s.commanded===s.target)s.lines.push({at:now,text:'Final servo command: '+s.commanded});return s;}
export function cameraPanYaw(command:number,offset=0){return (command-90+offset)*Math.PI/180;}
export function cameraPanTarget(command:number,radius=2.4):[number,number,number]{const a=cameraPanYaw(command);return [Math.sin(a)*radius,.14,Math.cos(a)*radius];}
/** Sight line / target lateral miss at the marked radius, separate from the logical servo command. */
export function cameraPanMiss(actual:number,target:number,offset=0,radius=2.4){return Math.sin(cameraPanYaw(actual,offset)-cameraPanYaw(target))*radius;}
