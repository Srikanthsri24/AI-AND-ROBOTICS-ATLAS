import{tapLevelPlacement,tapLevelDimensions}from'./tap-sensors';
import type{TapPoint}from'./tap-plumbing';
export const tapLevelChannels=[{name:'out',x:-1.2,color:'#329d79'},{name:'vcc',x:0,color:'#d45b6a'},{name:'ground',x:1.2,color:'#344350'}]as const;
export type TapLevelChannel=typeof tapLevelChannels[number]['name'];
export const tapLevelPlug={center:[178,224.27,-82]as TapPoint,pitch:2.54,rear:-86,mouth:-78};
export function tapLevelPlugContact(name:TapLevelChannel):TapPoint{const i=tapLevelChannels.findIndex(c=>c.name===name);if(i<0)throw new RangeError('Unknown level connector channel');return[178+(i-1)*2.54,224.27,-78];}
export type TapCableSegment={a:TapPoint;b:TapPoint;control?:TapPoint};
const blend=(a:TapPoint,b:TapPoint,t:number):TapPoint=>a.map((v,i)=>v+(b[i]-v)*t)as unknown as TapPoint;
const distance=(a:TapPoint,b:TapPoint)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export function tapCableSegments(points:readonly TapPoint[]):TapCableSegment[]{const out:TapCableSegment[]=[];let last=points[0];for(let i=1;i<points.length-1;i++){const r=Math.min(3,distance(points[i-1],points[i])/3,distance(points[i],points[i+1])/3),a=blend(points[i],points[i-1],r/distance(points[i-1],points[i])),b=blend(points[i],points[i+1],r/distance(points[i],points[i+1]));out.push({a:last,b:a},{a,b,control:points[i]});last=b;}out.push({a:last,b:points.at(-1)!});return out;}
export function tapCableLength(segments:readonly TapCableSegment[]){let length=0;for(const s of segments){if(!s.control){length+=distance(s.a,s.b);continue;}let last=s.a;for(let i=1;i<=32;i++){const t=i/32,p=blend(blend(s.a,s.control,t),blend(s.control,s.b,t),t);length+=distance(last,p);last=p;}}return length;}
export const tapLevelExposedStub=24-tapLevelDimensions.height/2;
export const tapLevelRouteLength=tapLevelDimensions.cableLength-tapLevelExposedStub-8;
export function tapLevelFactoryRoute(name:TapLevelChannel,levelOffset=0){if(!Number.isFinite(levelOffset)||levelOffset<0||levelOffset>25)throw new RangeError('Invalid level sensor inspection offset');const i=tapLevelChannels.findIndex(c=>c.name===name);if(i<0)throw new RangeError('Unknown level connector channel');const channel=tapLevelChannels[i],start:TapPoint=[tapLevelPlacement[0]+channel.x,46,88.5+levelOffset],end:TapPoint=[tapLevelPlugContact(name)[0],224.27,tapLevelPlug.rear],side=160+i*3,low=30+i*3;
 const points=(height:number):readonly TapPoint[]=>[start,[start[0],low,start[2]],[side,low,start[2]],[side,height,-86],[end[0],height,-86],end];let lo=240,hi=340;for(let n=0;n<36;n++){const mid=(lo+hi)/2;if(tapCableLength(tapCableSegments(points(mid)))<tapLevelRouteLength)lo=mid;else hi=mid;}const route=points((lo+hi)/2);return{points:route,segments:tapCableSegments(route),height:(lo+hi)/2,length:tapCableLength(tapCableSegments(route))};
}
export const tapLevelCableParts=[
 ...tapLevelChannels.map(c=>['tap-level-cable-'+c.name,'Level cable · '+({out:'green OUT',vcc:'red VCC',ground:'black GND'}[c.name]),'This conductor remains attached to the sealed sensor and factory three-position connector. Its routed teaching geometry retains the nominal 515 mm cable envelope, including the existing exposed stub and connector.']),
 ['tap-level-plug','Level cable · three-position factory housing','Keeps the three factory contacts together. Fit separate male jumper extensions into its OUT, VCC and GND sockets; do not cut the sealed sensor leads.'],
 ...tapLevelChannels.map(c=>['tap-level-plug-'+c.name,'Level connector · '+({out:'OUT → D4',vcc:'VCC → sensor 5 V',ground:'GND → sensor return'}[c.name]),'Two contact leaves receive the square male extension pin inside the open housing. The factory cable enters from the rear and stays attached.']),
 ['tap-level-cable-guide','Level cable · dry connector support','Supports the factory connector and keeps its three cable runs separated above the dry shelf. Its feet meet the shelf; the wire channels are open.'],
]as const;
