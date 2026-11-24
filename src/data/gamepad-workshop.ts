/** Matches game_controller_input_tester.ino. Boolean inputs mean pressed / LOW. */
export type GamepadButtons=[boolean,boolean,boolean];
export type GamepadRow={at:number;x:number;y:number;dx:number;dy:number;neutral:boolean;buttons:GamepadButtons};
export type GamepadState={raw:GamepadButtons;stable:GamepadButtons;changedAt:[number,number,number];centerX:number;centerY:number;lastSample:number;conversions:number;rows:GamepadRow[];lines:{at:number;text:string}[]};
export function gamepadInitial():GamepadState{return {raw:[false,false,false],stable:[false,false,false],changedAt:[0,0,0],centerX:512,centerY:512,lastSample:0,conversions:0,rows:[],lines:[{at:0,text:'# Release the stick and send c to capture center.'},{at:0,text:'x,y,dx,dy,neutral,stick_click,a,b'}]};}
/** One discarded conversion, then the rounded mean of eight retained 10-bit readings. */
export function gamepadAxis(samples:number[]){if(samples.length!==9||samples.some(v=>!Number.isInteger(v)||v<0||v>1023))throw Error('An axis read requires one dummy plus eight 10-bit ADC readings.');return Math.floor((samples.slice(1).reduce((a,b)=>a+b,0)+4)/8);}
export function gamepadTick(previous:GamepadState,pressed:GamepadButtons,axes:{x:number[];y:number[]},now:number,serial=''):GamepadState{
 now=now>>>0;const s:GamepadState={...previous,raw:[...previous.raw],stable:[...previous.stable],changedAt:[...previous.changedAt],rows:[...previous.rows],lines:[...previous.lines]};let changed=false;
 for(let i=0;i<3;i++){if(pressed[i]!==s.raw[i]){s.raw[i]=pressed[i];s.changedAt[i]=now;}if(s.raw[i]!==s.stable[i]&&((now-s.changedAt[i])>>>0)>=25){s.stable[i]=s.raw[i];changed=true;}}
 const recenter=serial.includes('c');if(!changed&&!recenter&&((now-s.lastSample)>>>0)<100)return s;
 s.lastSample=now;const x=gamepadAxis(axes.x),y=gamepadAxis(axes.y);s.conversions+=18;
 if(recenter){s.centerX=x;s.centerY=y;s.lines.push({at:now,text:'# Center captured.'});}
 const dx=x-s.centerX,dy=y-s.centerY,row:GamepadRow={at:now,x,y,dx,dy,neutral:Math.abs(dx)<=55&&Math.abs(dy)<=55,buttons:[...s.stable]};s.rows.push(row);s.lines.push({at:now,text:[x,y,dx,dy,Number(row.neutral),...row.buttons.map(Number)].join(',')});return s;
}
export function gamepadCsv(state:GamepadState){return state.lines.map(l=>l.text).join('\n')+'\n';}
export type GamepadPoint=[number,number,number];
export const gamepadRest=[523,500] as const;
export function gamepadRaw(value:number,axis:0|1){const v=Math.max(-1,Math.min(1,value)),center=gamepadRest[axis];return Math.round(center+v*(v>=0?1023-center:center));}
export function gamepadNormalized(raw:number,axis:0|1){const center=gamepadRest[axis],v=Math.max(0,Math.min(1023,raw))-center;return v/(v>=0?1023-center:center);}
export function gamepadStickPoint(point:GamepadPoint,x:number,y:number):GamepadPoint{const a=-Math.max(-1,Math.min(1,y))*.32,b=-Math.max(-1,Math.min(1,x))*.32,u=Math.cos(b)*point[0]-Math.sin(b)*point[1],v=Math.sin(b)*point[0]+Math.cos(b)*point[1];return [.65+u,.91+Math.cos(a)*v-Math.sin(a)*point[2],-.15+Math.sin(a)*v+Math.cos(a)*point[2]];}
/** Inspection tool: first lift above every cap, then move behind the frame, then tilt. */
export function gamepadPanelPose(open:number){const v=Math.max(0,Math.min(1,open)),rise=Math.min(1,v/.35),slide=Math.max(0,Math.min(1,(v-.35)/.35)),tilt=Math.max(0,(v-.70)/.30);return {position:[1.4,1.10+.65*rise,-1.9*slide] as GamepadPoint,angle:tilt*1.35};}
export function gamepadPanelPoint(point:GamepadPoint,open:number):GamepadPoint{const p=gamepadPanelPose(open),c=Math.cos(p.angle),s=Math.sin(p.angle);return [p.position[0]+point[0],p.position[1]+c*point[1]-s*point[2],p.position[2]+s*point[1]+c*point[2]];}
