import{BufferGeometry,Float32BufferAttribute}from'three';
type P=[number,number,number];
/** Open axial sleeve with one positive-Y radial set-screw bore. Native mm.
 * Boundary rows include both bore tangencies; the radial wall joins the inner
 * and outer cylindrical surfaces rather than covering a solid body with a dot.
 */
export function aquaCouplingGeometry(inner:number,start:number,end:number,holeZ:number){
 const outer=5,bore=.85,positions:number[]=[],triangle=(a:P,b:P,c:P)=>positions.push(...a,...b,...c),quad=(a:P,b:P,c:P,d:P)=>{triangle(a,b,c);triangle(a,c,d);},point=(r:number,t:number,z:number):P=>[r*Math.cos(t),r*Math.sin(t),z];
 const rows=[start,end,holeZ-bore,holeZ+bore,...Array.from({length:41},(_,n)=>holeZ-bore+2*bore*n/40),...Array.from({length:33},(_,n)=>start+(end-start)*n/32)].filter(z=>z>=start&&z<=end).sort((a,b)=>a-b).filter((z,i,a)=>!i||Math.abs(z-a[i-1])>1e-8);
 for(const r of[outer,inner])for(let j=0;j<rows.length-1;j++)for(const side of[0,1]){
  const edge=(z:number)=>{const d=z-holeZ,x=Math.abs(d)<bore?Math.sqrt(Math.max(0,bore*bore-d*d)):0;return Math.acos(x/r);},range=(z:number):[number,number]=>side===0?[0,edge(z)]:[Math.PI-edge(z),Math.PI*2],a=range(rows[j]),b=range(rows[j+1]);
  for(let k=0;k<96;k++){const t=k/96,u=(k+1)/96,p=point(r,a[0]+(a[1]-a[0])*t,rows[j]),q=point(r,a[0]+(a[1]-a[0])*u,rows[j]),v=point(r,b[0]+(b[1]-b[0])*u,rows[j+1]),w=point(r,b[0]+(b[1]-b[0])*t,rows[j+1]);if(r===outer)quad(p,q,v,w);else quad(w,v,q,p);}
 }
 for(const z of[start,end])for(let k=0;k<128;k++){const t=k*Math.PI*2/128,u=(k+1)*Math.PI*2/128,p=point(inner,t,z),q=point(outer,t,z),v=point(outer,u,z),w=point(inner,u,z);if(z===end)quad(p,q,v,w);else quad(w,v,q,p);}
 for(let k=0;k<128;k++){const at=(n:number,r:number):P=>{const t=n*Math.PI*2/128,x=bore*Math.cos(t);return[x,Math.sqrt(r*r-x*x),holeZ+bore*Math.sin(t)];};quad(at(k,inner),at(k+1,inner),at(k+1,outer),at(k,outer));}
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}
