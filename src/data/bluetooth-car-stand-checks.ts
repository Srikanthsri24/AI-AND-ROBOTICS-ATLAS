import type {BluetoothCarPose} from './bluetooth-car-motion';
import type {BluetoothWorkshopState} from './bluetooth-workshop-controller';
/** Capture a result before advancing the mutable lesson cursor. */
export function bluetoothCarStandCheck(index:number,core:BluetoothWorkshopState,pose:BluetoothCarPose){
 const names=['F','B','L','R'],signs=[[1,1],[-1,-1],[-1,1],[1,-1]];
 if(index<4)return {name:names[index]+' · both wheel directions',pass:Math.sign(pose.leftVelocity)===signs[index][0]&&Math.sign(pose.rightVelocity)===signs[index][1]&&core.moving};
 return {name:index===4?'S · outputs disable and wheels coast':'Link loss · 850 ms timeout',pass:!core.moving&&core.stopReason===(index===4?'stop command':'pulse timeout')&&pose.leftVelocity===0&&pose.rightVelocity===0};
}
