import{pickCableProtectorParts}from'./pick-rover-cable-dressing';
import{pickSplitHubParts}from'./pick-rover-split-hub';
import{pickLiftRetentionParts}from'./pick-rover-lift-retention';
import{pickGripFrameClampParts}from'./pick-gripper-frame-clamps';import{pickDriveHubParts}from'./pick-rover-drive-hub';import{pickUsbParts}from'./pick-rover-usb';import{pickChassisParts}from'./pick-rover-chassis';
import{pickBaseAnchorParts}from'./pick-rover-base-anchors';
import{pickMotorMountParts}from'./pick-rover-motor-mount';
import{pickLiftParts,pickLiftForkFastenerPart}from'./pick-rover-lift';
import{pickLiftDriveParts}from'./pick-rover-lift-drive';
import{pickGripperParts,pickGripperDriveParts}from'./pick-rover-gripper';
import{raServoParts}from'./rover-arm-servo';
import{pickElectronicsParts}from'./pick-rover-electronics';
import{pickDistributionParts}from'./pick-rover-distribution';
import{pickControlParts}from'./pick-rover-control-leads';
import{pickI2cParts}from'./pick-rover-i2c-leads';
import{pickLogicParts}from'./pick-rover-power-leads';
import{pickMotorLeadParts}from'./pick-rover-motor-leads';
import{pickWheelBatteryParts}from'./pick-rover-battery';
import{pickWheelSupplyParts}from'./pick-rover-wheel-supply-leads';
import{pickServoSupplyParts}from'./pick-rover-servo-supply';
import{pickServoSupplyLeadParts}from'./pick-rover-servo-supply-leads';
import{pickLiftCableParts}from'./pick-rover-lift-cable';
import{pickJawCableParts}from'./pick-rover-jaw-cable';
/** Includes service/cutaway descriptions; UI shortcuts only target fitted parts. */
export const pickRoverParts=[...pickCableProtectorParts,...pickSplitHubParts,...pickLiftRetentionParts,...pickGripFrameClampParts,...pickDriveHubParts,...pickUsbParts,...pickChassisParts,...pickBaseAnchorParts,...pickMotorMountParts,...pickLiftParts,pickLiftForkFastenerPart,...pickLiftDriveParts,...pickGripperParts,...pickGripperDriveParts,...raServoParts('pick-lift-servo','Lift servo'),...raServoParts('pick-grip-servo','Jaw servo'),...pickElectronicsParts,...pickDistributionParts,...pickControlParts,...pickI2cParts,...pickLogicParts,...pickMotorLeadParts,...pickWheelBatteryParts,...pickWheelSupplyParts,...pickServoSupplyParts,...pickServoSupplyLeadParts,...pickLiftCableParts,...pickJawCableParts];
export const pickRoverInspectShortcuts=[
 ['Controller','pick-uno-mcu'],['USB power','pick-usb-bank-switch'],['Wheel power','pick-wheel-battery-switch'],['Servo power','pick-servo-supply-switch'],['Lift','pick-lift-lower-links'],['Gripper','pick-grip-left-pad'],['Motor driver','pick-driver-chip'],['Servo driver','pick-pca-chip'],['Moving cable','pick-jaw-cable-ground'],['Caster','pick-rover-caster-fork'],
]as const;
