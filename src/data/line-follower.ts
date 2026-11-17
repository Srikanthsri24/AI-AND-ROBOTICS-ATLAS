import type { Build } from './guided-projects';
export const lineBaseSpeed=92;
export const lineGain=74;
export const lineThreshold=.22;

export const lineFollower:Build={
  id:'directory-77',title:'Autonomous Line-Following Robot',
  outcome:'Build a rover that uses three downward-facing reflectance sensors to follow black tape. Calibrate it on light and dark surfaces, then see how it steers through a bend and stops when the line is lost.',
  parts:[
    ['Arduino Uno R3','1','Stores per-channel reference readings and commands the wheels.'],
    ['Pololu QTR-MD-03A analog reflectance array','1','Reads three points across the track. Choose the analog A variant and mount it about 5 mm above the surface.'],
    ['TB6612FNG breakout','1','Drives the left and right wheel motors independently.'],
    ['6 V geared DC motors and wheels','2','Select matching motors within the motor driver rating.'],
    ['Chassis and caster','1 set','Provides space for an insulated forward sensor mount and both power sources.'],
    ['Switched 4×AA holder','1','Powers the wheel driver and provides an accessible cutoff.'],
    ['Momentary tactile start button','1','Starts or stops tracking. Press again after repositioning on the line if the signal is lost.'],
    ['Breadboard and jumper wires','1 set','Connects the three analog signals and the driver. Secure leads away from the wheels.'],
    ['5 V USB power bank','1','Supplies the Uno for short untethered runs. Bring a USB data cable for calibration.'],
    ['Matte track card and black tape','1 set','Build a smooth black line on light card, plus broad light and dark swatches that cover all three sensors for calibration.'],
  ],
  assembly:[
    ['Make a high-contrast test track','Lay matte black tape about 15 mm wide on flat, matte light card. Begin with a straight lead-in and gentle curves. Prepare larger white and black swatches for the whole sensor array.','The three sensors can see light–dark contrast without glare or sharp background markings.',[1,9]],
    ['Mount the three-sensor array','Fit the array just ahead of the axle. Aim its three channels down across the track and set the gap near 5 mm. Identify left and right as seen looking forward from the rover.','The sensor bar stays parallel to the floor across the full width.',[1,3,4]],
    ['Wire the driver and calibration controls','Disconnect the batteries and USB before wiring. Use one ground reference for the motor pack, driver and Uno. Connect the array outputs to A0–A2 in physical left-to-right order.','With motor power off, the Uno can read all three channels.',[0,1,2,5,6,7,8]],
    ['Capture light and dark references','Upload the sketch with motor power off. Place every sensor over the light swatch and send W at 115200 baud. Then place every sensor over the dark swatch and send B.','The log confirms that all three contrasts passed and stores the calibration in EEPROM.',[0,1,6,9]],
    ['Check steering and line loss','With both wheels raised, place the line under each side in turn. Verify the wheel nearer the line slows. Then run on the tray, remove a short section of tape and confirm the rover stops. Reposition and press Start to resume.','Both wheels drive on a centered line. Losing the line disables drive until a fresh Start press.',[0,1,2,3,4,6,8,9]],
  ],
  wiring:[
    ['Uno 5 V / GND','QTR VCC / GND and driver VCC / GND','Logic supply and shared ground'],
    ['QTR left / center / right OUT','Uno A0 / A1 / A2','Confirm physical order on the mounted array'],
    ['Uno D2','Start switch → GND','Active-low input'],
    ['Uno D3 / D5','Driver PWMA / PWMB','Left and right speed'],
    ['Uno D4 / D7 and D8 / D11','Driver AIN1 / AIN2 and BIN1 / BIN2','Wheel direction'],
    ['Uno D12','Driver STBY','Disables drive on lost line'],
    ['Driver A / B outputs','Left / right motor lead pairs','Check physical polarity on a wheel stand'],
    ['AA pack positive / negative','Driver VM / common ground','Separate switched wheel power'],
    ['USB power bank','Uno USB','Controller power for the track trial'],
  ],
  test:'Capture both swatches and confirm calibration survives a restart. Run on a gentle curve and verify the slower wheel is toward the stronger side reading. Remove a segment of tape and confirm the motor driver goes into standby. Place the array back on a visible line and press Start to resume.',
  demo:['Three analog channels','Line lost','Following','Drive stops','Wheel speeds change with line position'],
};

export type LinePose={x:number;z:number;heading:number};
export const lineStart:LinePose={x:-2.41,z:0,heading:0};
export const trackEnd=2.35;
export const trackZ=(x:number,curve:boolean)=>curve?.36*Math.sin((x+.75)*1.45)*Math.min(1,Math.max(0,(x+2.15)*1.3)):0;
export const trackGap=(x:number)=>x>.43&&x<.95;
export function lineSamples(pose:LinePose,curve:boolean,gap:boolean){
  return [-.135,0,.135].map(offset=>{
    const x=pose.x+.39*Math.cos(pose.heading)-offset*Math.sin(pose.heading);
    const z=pose.z+.39*Math.sin(pose.heading)+offset*Math.cos(pose.heading);
    return gap&&trackGap(x)?0:Math.exp(-((z-trackZ(x,curve))**2)/.0104);
  });
}
export function lineStep(pose:LinePose,curve:boolean,gap:boolean){
  const samples=lineSamples(pose,curve,gap);
  if(Math.max(...samples)<lineThreshold)return {pose,state:'lost' as const,wheels:[0,0]};
  const [left,center,right]=samples;
  const correction=lineGain*(right-left)/(left+center+right);
  const angle=pose.heading+correction*.00147;
  const x=Math.min(trackEnd,pose.x+.032*Math.cos(angle));
  const z=pose.z+.032*Math.sin(angle);
  return {pose:{x,z,heading:angle},state:x>=trackEnd?'complete' as const:'running' as const,
    wheels:x>=trackEnd?[0,0]:[Math.round(lineBaseSpeed+correction),Math.round(lineBaseSpeed-correction)]};
}
