export const stops=[
 {id:'park',name:'Parkside',demand:25},
 {id:'market',name:'Market',demand:62},
 {id:'school',name:'School',demand:51},
 {id:'clinic',name:'Clinic',demand:34},
 {id:'library',name:'Library',demand:18},
];
export const plans=[
 {id:'A',name:'Plan A · Main corridor',route:['park','market','school'],cycle:28},
 {id:'B',name:'Plan B · Clinic connection',route:['market','clinic','library'],cycle:33},
];
export const peakMinutes=120;
export const busSeats=30;

export function comparePlan(planId,departures) {
 const plan=plans.find(item=>item.id===planId);
 if(!plan||!Number.isInteger(departures)||departures<3||departures>8) throw new RangeError('Choose a plan and 3–8 departures.');
 const served=stops.filter(stop=>plan.route.includes(stop.id)).reduce((sum,stop)=>sum+stop.demand,0);
 const demand=stops.reduce((sum,stop)=>sum+stop.demand,0);
 const seats=busSeats*departures;
 const headway=peakMinutes/departures;
 return {
   served,missed:demand-served,coverage:100*served/demand,seats,
   overflow:Math.max(0,served-seats),headway,wait:headway/2,
   buses:Math.ceil(plan.cycle/headway),
 };
}

export const stopCsv=['id,stop,riders_to_hub',...stops.map(stop=>[stop.id,stop.name,stop.demand].join(','))].join('\n')+'\n';
