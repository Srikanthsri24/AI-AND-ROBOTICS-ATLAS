import type { Build } from './guided-projects';

export const tracker={periodMs:50,dark:140,deadband:36,step:2,yawLimit:45,tiltLimit:35};
export type Pose={yaw:number;tilt:number};
export const trackerWeather=[
  {name:'Clear',brightness:86,temp:27,humidity:44},
  {name:'Overcast',brightness:36,temp:21,humidity:69},
  {name:'Dim',brightness:8,temp:18,humidity:82},
] as const;

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function trackerReadings(pose:Pose,sun:Pose,brightness:number){
  const base=brightness*9;
  const yaw=clamp((sun.yaw-pose.yaw)*brightness*.085,-base*.62,base*.62);
  const tilt=clamp((sun.tilt-pose.tilt)*brightness*.085,-base*.62,base*.62);
  const values=[base-yaw+tilt,base+yaw+tilt,base-yaw-tilt,base+yaw-tilt].map(n=>clamp(Math.round(n),0,1023));
  const [tl,tr,bl,br]=values;
  return {values,level:Math.floor((tl+tr+bl+br)/4),yawError:Math.trunc((tr+br-tl-bl)/2),tiltError:Math.trunc((tl+tr-bl-br)/2)};
}
export function trackSun(pose:Pose,sun:Pose,brightness:number):Pose{
  const {level,yawError,tiltError}=trackerReadings(pose,sun,brightness);
  if(level<tracker.dark)return pose;
  const move=(angle:number,error:number,limit:number)=>Math.abs(error)>tracker.deadband
    ?clamp(angle+Math.sign(error)*tracker.step,-limit,limit):angle;
  const yaw=move(pose.yaw,yawError,tracker.yawLimit),tilt=move(pose.tilt,tiltError,tracker.tiltLimit);
  return yaw===pose.yaw&&tilt===pose.tilt?pose:{yaw,tilt};
}

export const solarTracker:Build={
  id:'directory-60',title:'Dual-Axis Solar Tracker with Weather Sensor',
  outcome:'Build a classroom tracker that turns and tilts a mini panel toward a lamp. Compare four light readings while a separate weather sensor reports temperature and relative humidity.',
  parts:[
    ['Arduino Uno R3','1','Compares the four light readings, commands both servos and reports weather readings over USB.'],
    ['Mini pan-tilt kit with two servos','1 set','Adafruit 1967 or a comparable two-axis bracket. The base servo pans horizontally and the upper servo tilts the panel.'],
    ['Voltaic P123 mini solar panel','1','Use the lightweight ETFE panel as the target surface. Insulate its output connector. The Uno and servos use separate power supplies.'],
    ['Four CdS sensors and 10 kΩ resistors','4 of each','Make four voltage dividers. Each sensor sits in a different quadrant of the shade cross.'],
    ['Adafruit SHT31-D breakout','1','Measures surrounding air temperature and relative humidity over I²C. Mount it on the fixed base away from the lamp and servo heat.'],
    ['External regulated arm servo supply','1 set','Provide 5 V with enough current for both servos at stall. Feed them through rated terminals and share ground with the Uno.'],
    ['Cardboard sensor shade and backing','1 set','Cut two slotted card strips for the four-quadrant shade. Use a backing plate to center the panel on the tilt axis.'],
    ['Breadboard and jumper wires','1 set','Holds the dividers and weather sensor wiring. Keep slack in wires that cross a pivot.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries logs to the Arduino IDE.'],
  ],
  assembly:[
    ['Center both servo horns','Wire the four dividers on the breadboard as shown in the map, then upload the sketch without mounting the panel. Switch on the Uno, then the separate servo supply. Cover the light sensors during centering so the sketch holds both axes at 90°. Turn off power and attach the brackets at their midpoint.','Both axes have clearance in either direction. Begin with smaller software limits if the kit needs them.',[0,1,5]],
    ['Mount and balance the small panel','Attach the lightweight backing to the upper carrier. Center the panel’s mass over the tilt pivot and keep it secure through the planned travel. Support the base firmly on the bench.','The panel moves without hitting the base or pulling on its wires.',[1,2,6]],
    ['Build the four-quadrant light head','Center a 2 cm high cross of card at the top of the panel. Put one photoresistor in each quadrant, at the same distance from the cross. Mark TL, TR, BL and BR as seen facing the panel from the lamp side.','Moving the lamp to either side shades the opposite side of the cross.',[2,3,6,7]],
    ['Wire the dividers and weather board','Put each photoresistor from 5 V to its analog input and a separate 10 kΩ resistor from the same input to GND. Connect the weather module to A4 and A5. Run the servo power through its rated distribution terminals.','Brighter light increases the divider reading. The weather board stays on the fixed base.',[0,3,4,5,7,8]],
    ['Test one axis at a time','Begin with the lamp straight ahead. Move it sideways first, then up or down. If an axis turns away from the illuminated side, switch that axis sign in the sketch and retest before increasing travel.','A steady lamp brings the sensor differences down. Cover the sensor head and verify that motion stops.',[0,1,2,3,4]],
  ],
  wiring:[
    ['Uno A0, A1, A2, A3','TL, TR, BL, BR divider junctions','Each CdS cell connects to 5 V and each 10 kΩ resistor to ground'],
    ['Uno A4 / A5','SHT31 SDA / SCL','I²C at default address 0x44'],
    ['Uno 5 V / GND','SHT31 VIN / GND','Logic supply and reference'],
    ['Uno D9 / D10','Pan / tilt servo signal','Keep the leads away from pivot pinch points'],
    ['External regulated 5 V','Servo V+ and return terminals','Keep separate from Uno 5 V rail'],
    ['External negative','Uno GND','Common signal reference'],
    ['Computer USB','Uno USB','Power, upload and serial log'],
  ],
  test:'Move a desk lamp horizontally, then vertically. The corresponding axis should reduce the difference between opposite light-sensor pairs. When the head is covered, the servos hold their last angles. Check that temperature and humidity appear in the serial log even when tracking is paused in darkness.',
  demo:['Four light readings','Dim hold','Tracking','Position stays fixed','Both axes respond to the brighter side'],
};
