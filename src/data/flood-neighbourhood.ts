import type{FloodPoint}from'./flood-workshop-layout';
/** A dry tabletop route, deliberately separate from sensor depth / public forecasts. */
export const floodNeighbourhood={at:[310,1,0] as FloodPoint,width:260,length:220,highY:33,platform:{at:[65,16.5,-60] as FloodPoint,size:[100,33,90] as FloodPoint},rampRun:80,rampRise:32,route:[[-75,1,86],[-30,1,92],[25,1,65],[25,33,-15],[65,33,-28]] as FloodPoint[],duration:12};
export function floodDrillPose(progress:number):FloodPoint{
 if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Drill progress must be 0–1.');
 const route=floodNeighbourhood.route,lengths=route.slice(1).map((p,i)=>Math.hypot(...p.map((v,k)=>v-route[i][k]))),total=lengths.reduce((a,b)=>a+b,0);let remaining=progress*total;
 for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=Math.min(1,remaining/lengths[i]);return route[i].map((v,k)=>v+(route[i+1][k]-v)*t) as FloodPoint;}remaining-=lengths[i];}return [...route.at(-1)!];
}
export const floodNeighbourhoodParts=[
 ['flood-map','Dry model neighbourhood','A physical teaching card represents homes and a marked route. It stays beside the basin and does not get flooded by the experiment.','The station’s warning is used as the prompt for a supervised model drill.'],
 ['flood-home','Low-ground model home','The starting location helps students discuss why an early warning is useful.','The violet route leads around the home and up the ramp, rather than through the water basin.'],
 ['flood-high-ground','Raised shelter platform and ramp','A visible ramp connects the low card to a raised platform. Its height is a teaching illustration, not a real flood-protection specification.','The route stays on the ramp as it climbs 32 mm to the model shelter.'],
 ['flood-shelter','Model high-ground shelter','Marks the end of the tabletop practice route. A door, windows and shelter sign distinguish it from the starting home.','The figure stops in front of its entrance at the end of the drill.'],
 ['flood-route','Marked practice route','The violet strip makes the full route visible before the model figure moves.','Connects the home’s outside starting point to the ramp and shelter entrance.'],
 ['flood-person','Moving tabletop figure','A model person follows the marked dry route when the practice drill is played. The figure represents an explanation, not an autonomous rescue system.','Its feet follow the actual card and ramp levels; water sensing and alarm timing remain a separate circuit.'],
] as const;
