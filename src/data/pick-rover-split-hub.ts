import{Shape,Vector2}from'three';
/** Open half of an annular profile: its bore is an open contour rather than a
 * touching hole, so each half can move radially around an installed shaft. */
export function pickHubHalf(inner:readonly Vector2[],side:1|-1){
 const points=inner.filter((p,i)=>i===0||p.distanceTo(inner[i-1])>1e-8).map(p=>p.clone());if(points[0].distanceTo(points.at(-1)!)<1e-8)points.pop();const clipped:Vector2[]=[];
 for(let i=0;i<points.length;i++){const p=points[(i+points.length-1)%points.length],q=points[i],a=p.x*side>=-1e-10,b=q.x*side>=-1e-10;if(a!==b){const t=p.x/(p.x-q.x);clipped.push(new Vector2(0,p.y+(q.y-p.y)*t));}if(b)clipped.push(q);}
 const cut=clipped.map((p,i)=>({p,i})).filter(({p})=>Math.abs(p.x)<1e-8),top=cut.reduce((a,b)=>a.p.y>b.p.y?a:b).i,bottom=cut.reduce((a,b)=>a.p.y<b.p.y?a:b).i;
 const walk=(direction:number)=>{const out=[clipped[top]];let i=top;for(let n=0;n<clipped.length;n++){i=(i+direction+clipped.length)%clipped.length;out.push(clipped[i]);if(i===bottom)return out;}throw Error('Invalid half-hub profile');};const a=walk(1),b=walk(-1),bore=a.length>b.length?a:b,s=new Shape();
 for(let n=0;n<=96;n++){const t=n*Math.PI/96,x=side*5.5*Math.sin(t),y=5.5*Math.cos(t);n?s.lineTo(x,y):s.moveTo(0,y);}for(const p of [...bore].reverse())s.lineTo(p.x,p.y);s.closePath();return s;
}
export const pickSplitHubParts=[
 ...[0,1].map(i=>({id:'pick-lift-hub-half-'+i,label:'Lift adapter · half '+(i?'B':'A'),description:'This split metal half has an open servo-spline profile at the rear and an open D profile at the front. The two halves close radially around the aligned outputs without passing through the fixed tower. The bored ears accept two cross-bolts. The axle rings remain fitted.'})),
 ...[0,1].flatMap(i=>[{id:'pick-lift-hub-bolt-'+i,label:'Lift adapter · cross-bolt '+(i+1),description:'This bolt passes through both real ear bores after the two adapter halves meet. Its head seats on the outer ear. Fit its separate retaining nut from the other side; do not use the bolt to force misaligned spline or D profiles together.'},{id:'pick-lift-hub-nut-'+i,label:'Lift adapter · retaining nut '+(i+1),description:'The hollow hex nut seats on the opposite ear around the cross-bolt shank. Together the two bolts/nuts retain the split adapter halves. Fine threads, tightening preload and physical load capacity are not simulated.'}]),
];
