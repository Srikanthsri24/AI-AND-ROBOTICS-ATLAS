import type {Build} from './guided-projects';

export const mulchMoistureExperiment:Build={
  id:'mulch-moisture-experiment',
  title:'Mulch moisture experiment',
  outcome:'Track how the relative moisture changes in two equal soil trays over time. Cover one with wood chips and use the bare tray as the control.',
  parts:[
    ['Arduino Uno R3','1','Reads both probes and sends paired timestamped readings.'],
    ['SEN0193 capacitive soil probe','2','Measure the covered and bare trays at equal depth.'],
    ['Dry and damp soil samples','2 references','Calibrate each probe using the same mix as both trays.'],
    ['Matched trays and wood-chip mulch','2 trays and 1 handful','Hold equal portions of soil. Cover only one surface with an even layer of chips.'],
    ['Graduated cylinder','1','Measure equal starting water additions for the two trays.'],
    ['Breadboard and jumper wires','1 set','Connect both analog outputs and share power and ground.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to the serial log.'],
  ],
  assembly:[
    ['Match both trays','Fill two identical trays with equal portions of the same soil mix and keep each under the same light and airflow. Use equal fill depths and the same drainage arrangement.','Both trays are labeled, with separate drip collection and no water moving between them.',[3,4]],
    ['Wire both meters','Disconnect USB. Connect both probes to 5 V and GND as marked. Route the bare tray output to A0 and the covered tray output to A1. Keep the board and connectors away from drips.','The two channels are labeled at both ends and have a shared ground.',[0,1,5]],
    ['Calibrate and prepare the trial','Upload the sketch and open Serial Monitor. Place both probes in a wide dry reference at the marked depth and send d once stable. Repeat in the damp reference with w. Add equal amounts of water to both test trays and mix evenly. Insert both probes at equal depth measured from the soil surface. Add chips to just the covered tray.','Each channel has its own valid references. Starting readings are similar. If they differ substantially, recheck mixing and probe depth.',[0,1,2,3,4,6]],
    ['Log matched readings','Once both readings settle, send b to record the baseline, then send l at equal elapsed intervals without watering. Continue over a day or longer if changes are small. Repeat the trial with the trays switched left to right.','Each row pairs both readings at one time. Compare loss from each baseline and look for a repeatable difference.',[0,1,3,6]],
  ],
  wiring:[
    ['Uno 5 V','Both probe VCC pins','Shared sensor power'],
    ['Uno GND','Both probe GND pins','Shared return'],
    ['Uno A0','Bare tray probe output','Control tray'],
    ['Uno A1','Covered tray probe output','Mulched tray'],
  ],
  test:'Confirm both probes report distinct dry and damp readings. Record the baseline and paired readings at equal intervals. Compare how many relative-index points each tray lost from its own baseline.',
  demo:['Matched soil trays','Record baseline','Let time pass','Compare drying','Paired log'],
};
