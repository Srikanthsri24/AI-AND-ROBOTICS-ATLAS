import type {LidarHostRow} from './lidar-workshop-controller';
export const lidarCalibrationSequence=[{mm:750,advance:true},{mm:350,advance:false},{mm:450,advance:false},{mm:550,advance:true}] as const;
export type LidarCalibrationRecord={mm:number;advance:boolean;at:number};
/** Record actual fresh logger output after a target change. Expected values alone can never complete an observation. */
export function lidarCalibrationCapture(records:LidarCalibrationRecord[],input:{row?:LidarHostRow;now:number;changedAt:number;running:boolean;paused:boolean;bench:boolean;centred:boolean}){
 const expected=lidarCalibrationSequence[records.length],row=input.row;if(!expected)return {records,error:'All four ordered observations are already recorded.'};
 if(!input.bench||!input.running||input.paused||!input.centred)return {records,error:'Use the running bench logger with the card centred and the consumer active.'};
 if(!row||row.reason!=='sample'||row.at<=input.changedAt||row.at<=(records.at(-1)?.at??-1)||input.now-row.at>150)return {records,error:'Wait for a fresh distance sample after moving the card.'};
 if(row.distance!==expected.mm||row.advance!==expected.advance)return {records,error:`Next observe ${expected.mm/10} cm with ${expected.advance?'ADVANCE':'HOLD'}. Follow the four marks in order to test hysteresis.`};
 return {records:[...records,{mm:row.distance,advance:row.advance,at:row.at}],error:null};
}
