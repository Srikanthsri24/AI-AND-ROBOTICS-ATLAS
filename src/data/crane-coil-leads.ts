import {craneDriverOutput,type CranePoint as P} from './crane-layout';
export type CraneCoilPose={x:number;faceY:number};
export type CraneCubic=readonly[P,P,P,P];
const nodes=[.09501250983763744,.2816035507792589,.4580167776572274,.6178762444026438,.755404408355003,.8656312023878318,.9445750230732326,.9894009349916499];
const weights=[.1894506104550685,.1826034150449236,.16915651939500254,.14959598881657673,.12462897125553387,.09515851168249278,.06225352393864789,.027152459411754095];
export function craneCubicLength(c:CraneCubic){let sum=0;for(let n=0;n<8;n++)for(const sign of [-1,1]){const t=(1+sign*nodes[n])/2,u=1-t;let d=0;for(let axis=0;axis<3;axis++){const v=3*u*u*(c[1][axis]-c[0][axis])+6*u*t*(c[2][axis]-c[1][axis])+3*t*t*(c[3][axis]-c[2][axis]);d+=v*v;}sum+=weights[n]*Math.sqrt(d)/2;}return sum;}
export const craneCoilServiceLength=280;
export function craneCoilAnchor(side:-1|1):P{return[105+side*4,180,20];}
export function craneCoilTail(pose:CraneCoilPose,side:-1|1):P{return[pose.x+side*4,pose.faceY+24,28];}
/** Two continuous cubic spans form a slack service loop of fixed length, not a stretched cable.
 * Both clamp and magnet ends have vertical tangents. Native coordinates are millimetres. */
export function craneCoilService(pose:CraneCoilPose,side:-1|1):readonly[CraneCubic,CraneCubic]{if(!Number.isFinite(pose.x)||!Number.isFinite(pose.faceY)||pose.x< -82||pose.x>82||pose.faceY<13||pose.faceY>92)throw new RangeError('Coil pose is outside the gantry');if(side!==-1&&side!==1)throw new RangeError('Unknown coil lead');const a=craneCoilAnchor(side),d=craneCoilTail(pose,side),make=(bow:number):readonly[CraneCubic,CraneCubic]=>{const m:P=[(a[0]+d[0])/2,(a[1]+d[1])/2,24-bow];return[[a,[a[0],a[1]-14,a[2]],[m[0],m[1]+12,m[2]],m],[m,[m[0],m[1]-12,m[2]],[d[0],d[1]+18,d[2]],d]];};let low=0,high=250;for(let n=0;n<32;n++){const mid=(low+high)/2,c=make(mid),length=craneCubicLength(c[0])+craneCubicLength(c[1]);if(length<craneCoilServiceLength)low=mid;else high=mid;}return make((low+high)/2);}
/** Separate stationary runs reach actual spring-terminal contacts, then the gantry clamp. */
export function craneCoilFixed(side:-1|1,withdrawal=0):readonly P[]{if(!Number.isFinite(withdrawal)||withdrawal<0||withdrawal>12)throw new RangeError('Invalid coil terminal withdrawal');const positive=side===-1,p=craneDriverOutput(positive),offset=positive?2:-2,x=105+side*4;return[[77+withdrawal,p[1],p[2]],[82+withdrawal,22,p[2]],[92,28,-50+offset],[x,32,-15],[x,90,10],[x,160,20],craneCoilAnchor(side)];}

export function craneCoilSeating(progress:number,side:-1|1){if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Invalid coil fitting progress');const t=Math.max(0,Math.min(1,(progress-(side===-1?.25:.625))/.375));return 12*(1-t*t*(3-2*t));}
