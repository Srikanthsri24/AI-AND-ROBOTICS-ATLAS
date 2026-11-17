// Fictional 0–100 indices. Labels describe the next simulated pass.
const calibration=[
 {heat:83,dry:76,laterFire:true},{heat:87,dry:88,laterFire:true},{heat:66,dry:82,laterFire:true},
 {heat:23,dry:31,laterFire:false},{heat:40,dry:26,laterFire:false},{heat:39,dry:45,laterFire:false},
];
export const tiles=[
 {id:'A1',heat:29,dry:31,cloud:12,laterFire:false},
 {id:'A2',heat:81,dry:87,cloud:10,laterFire:true},
 {id:'A3',heat:90,dry:83,cloud:87,laterFire:true},
 {id:'A4',heat:34,dry:24,cloud:16,laterFire:false},
 {id:'B1',heat:49,dry:41,cloud:18,laterFire:false},
 {id:'B2',heat:76,dry:76,cloud:7,laterFire:false},
 {id:'B3',heat:70,dry:82,cloud:24,laterFire:true},
 {id:'B4',heat:50,dry:52,cloud:57,laterFire:false},
 {id:'C1',heat:26,dry:31,cloud:10,laterFire:false},
 {id:'C2',heat:53,dry:53,cloud:19,laterFire:true},
 {id:'C3',heat:43,dry:29,cloud:8,laterFire:false},
 {id:'C4',heat:39,dry:34,cloud:12,laterFire:false},
];

function centroid(fire){
 const subset=calibration.filter(row=>row.laterFire===fire);
 return subset.reduce((sum,row)=>[sum[0]+row.heat/subset.length,sum[1]+row.dry/subset.length],[0,0]);
}
const event=centroid(true),background=centroid(false);

export function screen(tile,threshold=.65){
 if(tile.cloud>=50)return {score:null,state:'Cloud masked'};
 const distance=([heat,dry])=>Math.hypot(tile.heat-heat,tile.dry-dry);
 const a=distance(event),b=distance(background);
 const score=b/(a+b);
 return {score,state:score>=threshold?'Review':'Below threshold'};
}
export function evaluate(threshold){
 const rows=tiles.map(tile=>({...tile,...screen(tile,threshold)}));
 return {
  rows,
  hits:rows.filter(row=>row.state==='Review'&&row.laterFire).length,
  falseAlerts:rows.filter(row=>row.state==='Review'&&!row.laterFire).length,
  missed:rows.filter(row=>row.state==='Below threshold'&&row.laterFire).length,
  masked:rows.filter(row=>row.state==='Cloud masked').length,
 };
}
export const forestCsv=['tile,heat_index,dryness_index,cloud_percent,later_reference',
 ...tiles.map(tile=>[tile.id,tile.heat,tile.dry,tile.cloud,Number(tile.laterFire)].join(','))].join('\n')+'\n';
