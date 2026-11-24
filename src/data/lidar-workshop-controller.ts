import {proximityDecision} from './lidar-micro-drone';
/** Host-side model of micro_drone_proximity.py. This prints decisions; it sends no flight commands. */
export const lidarHostTiming={freshMs:450,sampleMs:100};
export type LidarHostSample={distance:number|null;receivedAt:number};
export type LidarHostRow={at:number;distance:number|null;advance:boolean;reason:'sample'|'invalid'|'stale'|'timeout'};
export type LidarHost={clock:number;running:boolean;paused:boolean;advancing:boolean;nextWaitAt:number;queue:LidarHostSample|null;received:number;dropped:number;rows:LidarHostRow[];reason:LidarHostRow['reason']|'waiting'|'stopped'};
export type LidarHostEvent={kind:'sample';distance:number|null}|{kind:'tick'|'pause'|'resume'|'stop'};
export const lidarHostInitial=(now=0):LidarHost=>({clock:now,running:true,paused:false,advancing:false,nextWaitAt:now+450,queue:null,received:0,dropped:0,rows:[],reason:'waiting'});
export function lidarHostEvent(previous:LidarHost,now:number,event:LidarHostEvent):LidarHost{
 if(!Number.isFinite(now)||now<previous.clock)throw Error('Host events must use finite, monotonic receipt times.');
 const s={...previous,clock:now};if(!s.running)return s;
 const print=(at:number,distance:number|null,reason:LidarHostRow['reason'])=>{s.advancing=proximityDecision(distance,s.advancing);s.reason=reason;s.rows=[...s.rows,{at,distance,advance:s.advancing,reason}].slice(-48);s.nextWaitAt=at+450;};
 const consume=()=>{const p=s.queue;if(!p)return;s.queue=null;const stale=now-p.receivedAt>450,valid=p.distance!==null&&Number.isFinite(p.distance)&&p.distance>0&&p.distance<8000;print(now,stale?null:p.distance,stale?'stale':valid?'sample':'invalid');};
 // A same-time sample is delivered before a waiting queue times out in this authored event ordering.
 if(!s.paused){while(event.kind==='sample'?s.nextWaitAt<now:s.nextWaitAt<=now)print(s.nextWaitAt,null,'timeout');}
 if(event.kind==='stop'){s.running=false;s.advancing=false;s.queue=null;s.reason='stopped';return s;}
 if(event.kind==='pause'){s.paused=true;return s;}
 if(event.kind==='resume'){
  const wasPaused=s.paused;s.paused=false;
  if(s.queue)consume();else if(wasPaused&&s.nextWaitAt<=now)print(now,null,'timeout');
  return s;
 }
 if(event.kind==='sample'){
  s.received++;if(s.queue)s.dropped++;s.queue={distance:event.distance,receivedAt:now};if(!s.paused)consume();
 }
 return s;
}
