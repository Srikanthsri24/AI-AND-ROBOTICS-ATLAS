import type {Build} from './guided-projects';

export const drainageBottleExperiment:Build={
  id:'drainage-bottle-experiment',
  title:'Drainage bottle experiment',
  outcome:'Pour a measured dose into a soil-filled bottle, collect the runoff, and log the time until the soil probe first reads in the calibrated dry range.',
  parts:[
    ['Arduino Uno R3','1','Reads the soil probe and timestamps readings.'],
    ['SEN0193 capacitive soil probe','1','Measures the soil at a fixed depth above the outlet.'],
    ['Clear bottle drainage column and mesh','1 set','A prepared bottle holds the soil and a mesh screen keeps soil out of the outlet.'],
    ['Graduated cylinder','1','Measures the water dose and the runoff after collection.'],
    ['Clear basin and dry sensor stand','1 set','Catches drips below the bottle and keeps the electronics on the dry side.'],
    ['Dry and damp soil samples','2 references','Set the probe scale using the same mix as the bottle.'],
    ['Breadboard and jumper wires','1 set','Connect the probe to power, ground and A0.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries the log to Serial Monitor.'],
  ],
  assembly:[
    ['Prepare a stable drainage column','Use an adult-prepared bottle with a top opening, smooth edges and an open bottom outlet. Place mesh over the outlet to retain the soil. Secure the bottle upright over a collection basin and fill it with the same mix as the references.','A small test pour through the empty column drains freely into the basin.',[2,4]],
    ['Wire and calibrate the probe','Unplug USB. Match the sensor markings to 5 V, GND and A0. Upload the sketch. Use d and w to capture dry and damp references at the same depth. Keep the probe connector, board and breadboard off the basin.','The two reference readings differ by at least 12 ADC counts.',[0,1,5,6,7]],
    ['Add one measured dose','Install the probe at a fixed marked depth away from the bottle wall. Empty the basin. Measure 60 mL, pour it evenly onto the soil, and send b as soon as the probe has responded above the dry threshold.','The trial starts above index 35. Drainage collects in the basin without touching the electronics.',[1,2,3,4]],
    ['Log drainage and drying separately','Send l at regular intervals. Measure runoff in the graduated cylinder when dripping stops and record the amount. Keep logging soil readings until the first reading at index 35 or less. Record the interval between the last higher reading and the crossing.','The runoff volume and the first observed dry-range time are separate results.',[0,1,3,4,7]],
  ],
  wiring:[
    ['Uno 5 V','Probe VCC','Sensor supply'],
    ['Uno GND','Probe GND','Signal return'],
    ['Uno A0','Probe analog output','Soil measurement above the outlet'],
  ],
  test:'Confirm the pour increases the relative index. Measure runoff once dripping ends, then continue sampling to locate the first reading at or below 35. Report the sampling interval with the result.',
  demo:['Fixed water dose','Collect runoff','Read at equal intervals','First dry observation','Separate results'],
};
