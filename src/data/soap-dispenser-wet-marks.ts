import type {SoapWetMark} from './soap-dispenser-fluid';
import {soapTargetPark,soapTargetSize} from './soap-dispenser-target';
/** Qualitative wet footprint, bounded to the receiving face; not a volume measurement. */
export function soapWetMarkPose(mark:SoapWetMark,targetTop:readonly[number,number,number]=soapTargetPark){const target=mark.receiver==='target',radius=Math.min(7,1.4+Math.sqrt(mark.packets)*.9,target?soapTargetSize[0]/2-Math.abs(mark.x):Infinity,target?(soapTargetSize[2]/2-Math.abs(mark.z))/.8:Infinity),height=Math.min(.5,.12+mark.packets*.025);return {visible:radius>.01,position:[mark.x+(target?targetTop[0]:0),(target?targetTop[1]:0)+.03+height/2,mark.z+(target?targetTop[2]:0)] as const,scale:[Math.max(0,radius),height/2,Math.max(0,radius)*.8] as const};}
