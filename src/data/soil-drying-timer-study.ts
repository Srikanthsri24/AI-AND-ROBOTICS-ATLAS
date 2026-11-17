import type {Build} from './guided-projects';

export const soilDryingTimerStudy:Build={
  id:'soil-drying-timer-study',
  title:'Soil drying timer study',
  outcome:'Time how long a damp sample takes to reach the calibrated dry range and use consecutive readings to confirm the result.',
  parts:[
    ['Arduino Uno R3','1','Samples the probe on a schedule and stores the confirmed drying time.'],
    ['SEN0193 capacitive soil probe','1','Measures one location at a fixed depth throughout the trial.'],
    ['Dry and damp soil samples','2 references','Establish the two calibration endpoints using the same potting mix.'],
    ['Open soil tray and probe stand','1 set','Exposes the soil to room air and holds the blade steady.'],
    ['LED and 330 Ω resistor','1 pair','Signals three consecutive readings at or below the dry limit.'],
    ['Breadboard and jumper wires','1 set','Connects the probe and LED on the dry side of the bench.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries the serial log.'],
  ],
  assembly:[
    ['Prepare a repeatable sample','Mix water evenly into a shallow tray of soil and let free water drain. Leave the surface open. Mark a central probe location away from the walls.','The tray begins damp with no standing water and has a marked probe depth.',[1,3]],
    ['Connect the sensor and dry indicator','Disconnect USB. Match the sensor markings to 5 V, GND and A0. Connect D8 through 330 Ω to the LED anode, with the cathode to GND.','The sensor and LED share ground. The Uno and breadboard stay outside the tray.',[0,1,4,5]],
    ['Calibrate and start timing','Upload the sketch and open Serial Monitor. Enter d with the probe in the dry reference and w in the damp reference. Move to the test sample. When the reading is above 35 and stable, enter b.','The serial log starts at time zero and the LED starts off.',[0,1,2,3,6]],
    ['Watch consecutive readings','Leave the probe fixed and do not add water. The sketch takes a reading each minute by default. Record when the first run of three readings at or below 35 occurs. Repeat with a fresh prepared sample when comparing conditions.','One or two low readings are insufficient. A higher reading clears the count. The third consecutive low reading stops the trial and lights the LED.',[0,1,3,4,6]],
  ],
  wiring:[
    ['Uno 5 V','Probe VCC','Sensor power'],
    ['Uno GND','Probe GND and LED cathode','Shared return'],
    ['Uno A0','Probe analog output','Relative soil reading'],
    ['Uno D8','330 Ω resistor → LED anode','Confirmed dry indication'],
  ],
  test:'Start above 35. Verify that a low reading advances the count, a higher reading resets it, and three consecutive low readings store the confirmed elapsed time.',
  demo:['Sample on a timer','First dip','Count resets','Three low readings','Confirmed drying time'],
};
