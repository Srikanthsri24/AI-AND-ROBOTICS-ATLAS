import type { Build } from './guided-projects';

export const fillMs=1200;
export const cycleMs=3000;
export const bellowsTrials=[
  {name:'Normal',resistance:50,leak:0},
  {name:'Restricted path',resistance:95,leak:0},
  {name:'Open leak',resistance:50,leak:85},
] as const;
export function bellowsReading(elapsed:number,resistance:number,leak:number){
  const peak=25+Math.round(.6*resistance)-Math.round(.35*leak);
  const phase=elapsed%cycleMs;
  const charge=phase<fillMs?phase/fillMs:1-(phase-fillMs)/(cycleMs-fillMs);
  return {peak,level:Math.max(0,Math.round(peak*charge)),expansion:charge*(1-leak/115)*(1-resistance/200),filling:phase<fillMs};
}
export const bellowsSimulator:Build={
  id:'directory-62',title:'DIY Arduino Ventilator · Classroom Bellows Simulator',
  outcome:'Build a USB-powered Arduino simulator that shows a fill-and-release cycle. Change resistance and leak inputs to trigger alarms, then reset the controller and test again.',
  parts:[
    ['Arduino Uno R3','1','Calculates a simulated pressure index and reports cycle state over USB.'],
    ['10 kΩ rotary test potentiometers','2','The Resistance and Leak knobs set model inputs from 0 to 100. They do not measure airflow.'],
    ['Red and white LEDs with 220 Ω resistors','1 of each','White indicates filling. Red indicates a latched alarm. Fit a separate 220 Ω resistor in series with each LED.'],
    ['Momentary tactile start button','1','Alternates between starting, stopping and clearing an alarm, depending on the current state.'],
    ['Breadboard and jumper wires','1 set','Joins low-voltage inputs, LEDs and ground.'],
    ['USB-A to USB-B data cable','1','Powers the simulator and connects to Serial Monitor or Serial Plotter.'],
  ],
  assembly:[
    ['Label the controller bench','Place the Uno beside a breadboard. Label the two knobs Resistance and Leak. Mark the white LED Fill and the red LED Alarm.','Labels stay visible while turning the knobs.',[0,1,2,4]],
    ['Wire the model inputs','Disconnect USB. Put each pot’s outer terminals at 5 V and GND. Connect Resistance wiper to A0 and Leak wiper to A1.','Both inputs share ground and are independent.',[0,1,4]],
    ['Connect the indicators','Wire the white LED through a 220 Ω resistor to D5 and the red LED through a separate 220 Ω resistor to D6. Both cathodes return to ground.','Each LED has its own resistor and follows the correct polarity.',[0,2,4]],
    ['Fit Start and connect USB','Wire the tactile switch across D2 and ground. Upload the sketch and check the three named channels at 115200 baud.','Both LEDs start off. Start begins a synthetic waveform.',[0,3,4,5]],
    ['Compare three cases','Start with resistance near 50 and leak near 0. Then test resistance near 95 with low leak. Clear the alarm and test resistance near 50 with leak near 85.','The normal case cycles. Both abnormal cases latch the red light and halt the trace.',[0,1,2,3]],
  ],
  wiring:[
    ['Uno 5 V / GND','Both potentiometer outer terminals','Model input reference and ground'],
    ['Resistance and Leak wipers','Uno A0 and A1','Simulated restriction and leakage'],
    ['Uno D5','220 Ω resistor → white LED anode','Fill indicator'],
    ['Uno D6','220 Ω resistor → red LED anode','Alarm indicator'],
    ['Both LED cathodes','Uno GND','Return path'],
    ['Uno D2','Start switch → GND','Internal pull-up'],
    ['Computer USB','Uno USB-B','Power, upload and telemetry'],
  ],
  test:'The normal trial produces a repeating trace. A restricted path rises above 74 model units during fill. A large leak ends the fill below 33. Either alarm turns off the fill LED and remains on until cleared. Clearing returns to idle, and a second press starts a fresh trial.',
  demo:['Resistance and leak settings','Alarm','Filling','White fill LED is off and red alarm is on','The simulated bellows expands'],
};
