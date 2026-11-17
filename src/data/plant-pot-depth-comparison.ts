import type {Build} from './guided-projects';

export const plantPotDepthComparison:Build={
  id:'plant-pot-depth-comparison',
  title:'Plant pot depth comparison',
  outcome:'Pour water onto one soil-filled pot and use two fixed probes to compare when the upper and lower layers first respond.',
  parts:[
    ['Arduino Uno R3','1','Reads both probes and reports the first rise at each depth.'],
    ['SEN0193 capacitive soil probe','2','Place the blades horizontally at two marked depths so each senses a separate layer.'],
    ['Deep plant pot and drainage saucer','1 set','Holds the two probe positions and catches runoff.'],
    ['Dry and damp soil samples','2 references','Calibrate each probe with the same mix as the pot.'],
    ['Graduated cylinder','1','Measures the same water dose for each trial.'],
    ['Breadboard and jumper wires','1 set','Connect both probes to the controller outside the pot.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries sample rows to Serial Monitor.'],
  ],
  assembly:[
    ['Set two fixed depths','Use a pot at least 15 cm deep with drainage holes and an adult-prepared side opening for each probe. Check the pot is stable. Mount the blades horizontally at 4 cm and 10 cm below the intended soil surface, with the connectors outside. Seal around the openings and use a saucer for runoff.','The blades sit in separate layers. Both connectors stay dry and neither blade touches the opposing wall.',[1,2]],
    ['Wire and label the channels','Unplug USB. Connect both probe supplies to 5 V and grounds to GND. Connect the upper signal to A0 and the lower signal to A1. Label both leads at the Uno.','The two channels can be identified independently and share a ground.',[0,1,5]],
    ['Calibrate and record the baseline','Before final installation, capture both probes in the dry reference with d and in the damp reference with w. Reinstall them to the marked depths, fill with evenly mixed soil, and let both readings settle. Send b before pouring.','The two channels report distinct calibration endpoints and zero rise at baseline.',[0,1,2,3,6]],
    ['Pour once and sample both layers','Measure 60 mL beforehand. Pour immediately after saving the baseline and distribute the water evenly over the top. Record any delay between capturing the baseline and pouring. Send l at regular intervals. Record when each channel first rises by 8 relative-index points. Repeat using a freshly prepared pot if you want to compare trials.','Log the time interval and the first rise for each channel, including any depth that never reaches the threshold.',[0,1,2,4,6]],
  ],
  wiring:[
    ['Uno 5 V','Both probe VCC pins','Shared sensor supply'],
    ['Uno GND','Both probe GND pins','Shared return'],
    ['Uno A0','Upper probe signal','Soil layer 4 cm below the surface'],
    ['Uno A1','Lower probe signal','Soil layer 10 cm below the surface'],
  ],
  test:'Save a stable baseline before watering. Log both depths at matched intervals. Record the first sample at least 8 points above baseline for each channel. A smaller or later rise at depth is possible, and neither response time is guaranteed.',
  demo:['One pot','Two fixed depths','Top watering','First observed response','Compare the delay'],
};
