import {soapCalibrationCanFit,type SoapCalibration} from './soap-dispenser-calibration';
const unit=(n:number)=>Math.max(0,Math.min(1,n)),ease=(n:number)=>{const t=unit(n);return t*t*(3-2*t);};
export function soapLinkagePose(cursor:number){if(!Number.isFinite(cursor)||cursor<0||cursor>2)throw new RangeError('Invalid linkage fitting cursor');const horn=unit(cursor),screw=unit(cursor-1);return {hornVisible:horn>0,hornZ:25*(1-ease(horn)),screwVisible:screw>0,screwZ:18*(1-ease(screw)),screwRotation:Math.PI*4*ease(screw),complete:cursor===2};}
/** Cursor advances only while the demonstrated shaft is back at rest and its
 * independent motor source is off. Each fitting operation takes 1.2 seconds. */
export function soapLinkageAdvance(cursor:number,ms:number,calibration:SoapCalibration){soapLinkagePose(cursor);if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid linkage fitting time');if(!soapCalibrationCanFit(calibration))return cursor;const step=ms/1200;return 2-cursor<=step+1e-10?2:cursor+step;}
