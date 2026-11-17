import type { Build } from './guided-projects';

export const shakeLimits={sampleMs:20,window:10,threshold:.16,quietThreshold:.06,sustain:30,quiet:50} as const;
export type Acceleration=[number,number,number];
export type ShakeState={baseline:Acceleration;window:number[];rms:number;high:number;quiet:number;latched:boolean};
export const initialShake:ShakeState={baseline:[0,0,1],window:[],rms:0,high:0,quiet:0,latched:false};
export function shakeSample(state:ShakeState,sample:Acceleration):ShakeState{
  const baseline=state.baseline.map((value,i)=>value+.035*(sample[i]-value)) as Acceleration;
  const window=[...state.window.slice(-(shakeLimits.window-1)),sample.reduce((sum,value,i)=>sum+(value-baseline[i])**2,0)];
  const rms=Math.sqrt(window.reduce((sum,value)=>sum+value,0)/shakeLimits.window);
  const high=rms>=shakeLimits.threshold?Math.min(shakeLimits.sustain,state.high+1):0;
  const quiet=rms<shakeLimits.quietThreshold?Math.min(shakeLimits.quiet,state.quiet+1):0;
  return {baseline,window,rms,high,quiet,latched:state.latched||high>=shakeLimits.sustain};
}

export const shakeMonitor:Build={
  id:'directory-92',
  title:'Earthquake Monitor with Alerting using Arduino',
  outcome:'Build a local shaking monitor with a moving model platform. Compare a single tap and sustained shaking on the live trace, then test how the alarm stays latched until the platform is quiet.',
  parts:[
    ['Arduino Uno R3','1','Samples acceleration 50 times per second, calculates recent motion and drives the status lights and piezo.'],
    ['Adafruit MPU6050 breakout','1','Measures three acceleration axes. Use the Adafruit breakout with its onboard regulator and level shifting.'],
    ['Green and red LEDs with 220 Ω resistors','1 set','Green indicates monitoring. Red flashes for a latched shake alert and glows steadily for a sensor fault.'],
    ['Passive piezo sounder','1','Beeps in time with the red LED during a local shake alert.'],
    ['220 Ω piezo series resistor','1','Connects the piezo load to D9. Fit a separate resistor for each LED.'],
    ['Momentary tactile start button','1','Acknowledges an alert after the platform has been quiet for one second.'],
    ['Breadboard and jumper wires','1 set','Connects the sensor and front-panel outputs. Leave a loose cable loop for the moving platform.'],
    ['Card shake platform and model building','1 set','Build a hand-slid plate guided by straight rails and cushioned end stops. Tape down a small lightweight building and mount the sensor rigidly to the plate.'],
    ['USB-A to USB-B data cable','1','Powers the monitor and streams the trace to Arduino Serial Plotter.'],
  ],
  assembly:[
    ['Build the hand-operated table','Tape two straight card guides to a rigid base. Fit a light plate between the guides, with soft stops at both ends. Secure a small card building on top.','The plate slides freely in one direction, and the building stays attached. The Uno rests on the stationary base.',[0,7]],
    ['Mount and wire the accelerometer','Use insulated standoffs or firm double-sided mounting tape to secure the sensor flat on the moving plate. Connect the four I²C wires with USB unplugged. Add strain relief and a gentle cable loop.','The sensor moves with the plate. The cable clears the guides and does not pull on any pins.',[0,1,6,7,8]],
    ['Wire the local alert panel','Connect green and red through separate resistors, the piezo through the third resistor, and the reset switch from D2 to ground.','LED cathodes and piezo negative lead share circuit ground. A reset press pulls D2 low.',[0,2,3,4,5,6]],
    ['Capture the quiet reference','Upload with the plate still. Leave it at rest for a second while the sketch averages its three acceleration axes. Open Serial Plotter at 115200 baud.','Green turns on and the motion trace approaches zero after calibration.',[0,1,2,8]],
    ['Compare a tap and sustained motion','Give the plate one short tap. Then slide it back and forth gently until a sustained trace crosses the threshold long enough to trip. Stop, wait for quiet, and press Reset.','A brief tap does not latch the alarm. Sustained motion can latch it. Moving the plate prevents reset until it becomes quiet again.',[1,2,3,5,7]],
  ],
  wiring:[
    ['Uno 5 V / GND','Adafruit MPU6050 VIN / GND','Use the specified Adafruit board for 5 V wiring.'],
    ['Uno A4 / A5','MPU6050 SDA / SCL','Default 0x68 with AD0 left low'],
    ['Uno D5 / D6','Each → 220 Ω → green / red LED anode','Cathodes to GND'],
    ['Uno D9','220 Ω → piezo positive','Piezo negative to GND'],
    ['Uno D2','Reset switch → GND','Active low with internal pull-up'],
    ['Computer USB','Uno USB-B','Power, upload and Serial Plotter trace at 115200 baud'],
  ],
  test:'Start with the table still and wait for green. Compare the brief tap with a longer back-and-forth motion. Check that the red LED and piezo activate only after sustained motion reaches the threshold. Attempt a reset while shaking, then stop and wait for a full second of quiet before resetting. This classroom monitor measures shaking at the sensor.',
  demo:['Rolling acceleration in g','Monitoring','Local shake alert','Alert stays latched','Reset requires one quiet second'],
};
