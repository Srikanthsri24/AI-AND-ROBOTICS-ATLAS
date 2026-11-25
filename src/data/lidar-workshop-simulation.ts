import {lidarHostEvent,lidarHostInitial,lidarHostTiming,type LidarHost} from './lidar-workshop-controller';
import {lidarCardAtMark,lidarFrontRay} from './lidar-workshop-optics';
import {lidarHardwareReference} from './lidar-workshop-layout';
export type LidarWorkshopMode='bench'|'virtual';
export type LidarWorkshopEnvironment={mode:LidarWorkshopMode;powered:boolean;radio:boolean;packets:boolean;invalidReturn:boolean;cardDistance:number;cardX:number;cardYaw:number};
export type LidarWorkshopState={mode:LidarWorkshopMode;clock:number;nextSampleAt:number;host:LidarHost|null;z:number;y:number;propellerAngle:number};
/** Virtual mode is a separate illustrative forward controller, not a capability of the supplied Python logger or a flight-physics prediction. */
export const lidarVirtualMotion={speedMmPerSecond:80,heightMm:150,rotorRadiansPerSecond:60,integrationMs:10};
export function lidarWorkshopInitial(mode:LidarWorkshopMode='bench'):LidarWorkshopState{return {mode,clock:0,nextSampleAt:100,host:null,z:0,y:mode==='bench'?lidarHardwareReference.authored.benchRootY:lidarVirtualMotion.heightMm,propellerAngle:0};}
export function lidarWorkshopReading(state:LidarWorkshopState,env:LidarWorkshopEnvironment){const card={...lidarCardAtMark(env.cardDistance),x:env.cardX,yaw:env.cardYaw},ray=lidarFrontRay({x:0,y:state.y,z:state.z,yaw:0},card);return {...ray,distance:env.invalidReturn?null:ray.distance};}
export function lidarWorkshopCommand(state:LidarWorkshopState,env:LidarWorkshopEnvironment,command:'start'|'pause'|'resume'|'stop'):LidarWorkshopState{
 if(env.mode!==state.mode)throw Error('Reset the workshop before changing bench / virtual mode.');
 if(command==='start'){if(!env.powered||!env.radio)throw Error('Connect the assembled drone power and computer radio before starting the logger.');if(state.host?.running)return state;return {...state,host:lidarHostInitial(state.clock),nextSampleAt:state.clock+100};}
 if(!state.host)return state;return {...state,host:lidarHostEvent(state.host,state.clock,{kind:command})};
}
export function lidarWorkshopAdvance(previous:LidarWorkshopState,env:LidarWorkshopEnvironment,ms:number):LidarWorkshopState{
 if(!Number.isFinite(ms)||ms<0)throw Error('Elapsed time must be finite and non-negative.');if(previous.mode!==env.mode)throw Error('Reset the workshop before changing bench / virtual mode.');
 let s={...previous};const end=s.clock+ms;
 while(s.clock<end){const next=Math.min(end,s.clock+lidarVirtualMotion.integrationMs,s.host?.running?s.nextSampleAt:Infinity),dt=next-s.clock,h=s.host,last=h?.rows.at(-1),live=!!(env.powered&&env.radio&&h?.running&&!h.paused&&h.advancing&&last&&last.reason==='sample'&&s.clock-last.at<=lidarHostTiming.freshMs);
  if(s.mode==='virtual'&&live)s.z-=lidarVirtualMotion.speedMmPerSecond*dt/1000;
  if(s.mode==='virtual'&&env.powered&&h?.running)s.propellerAngle=(s.propellerAngle+lidarVirtualMotion.rotorRadiansPerSecond*dt/1000)%(Math.PI*2);
  s.clock=next;
  if(s.host?.running){if(s.clock>=s.nextSampleAt){if(env.powered&&env.radio&&env.packets)s.host=lidarHostEvent(s.host,s.clock,{kind:'sample',distance:lidarWorkshopReading(s,env).distance});s.nextSampleAt+=lidarHostTiming.sampleMs;}s.host=lidarHostEvent(s.host,s.clock,{kind:'tick'});}
 }
 return s;
}
