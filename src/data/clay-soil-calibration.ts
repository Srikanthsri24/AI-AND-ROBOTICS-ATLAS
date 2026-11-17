import type {Build} from './guided-projects';

export const claySoilCalibration:Build={
  id:'clay-soil-calibration',
  title:'Clay soil calibration',
  outcome:'Calibrate a probe with two samples of the same clay-rich mix, then compare repeated readings with snug contact and an air gap.',
  parts:[
    ['Arduino Uno R3','1','Averages the analog samples and reports the index and repeat spread.'],
    ['SEN0193 capacitive soil probe','1','Reads the material around the blade. Use a fixed insertion depth.'],
    ['Clay-rich soil and identical sample cups','3 portions','Prepare dry and damp references plus a separate test sample.'],
    ['Breadboard and jumper wires','1 set','Connect the probe to the Uno on the dry side of the bench.'],
    ['USB-A to USB-B data cable','1','Powers the Arduino and carries the serial readings.'],
  ],
  assembly:[
    ['Prepare the references and test sample','Use three equal portions of the same clay-rich soil. Break up large clumps. Leave one portion air-dry, moisten the second evenly, and use a moderately damp third portion for all contact tests. Keep the electronics above the soil line.','Both references and the test sample can accept the blade without forcing it.',[1,2]],
    ['Wire the probe and set the scale','Unplug USB and connect VCC to 5 V, GND to GND, and the analog output to A0. Upload the sketch. Choose an insertion line below the electronics. Capture the air-dry reference with d and the evenly damp reference with w after each reading settles.','The raw readings at the two endpoints differ by at least 12 counts.',[0,1,2,3,4]],
    ['Record three snug placements','Use the test sample. Make a narrow slot and gently press soil against both sides of the blade. Use the same depth for each placement. Send s to start the snug set and n after each of three separate insertions.','The monitor prints the minimum, maximum and spread for the snug set.',[0,1,2]],
    ['Repeat with a visible gap','In the same test cup, widen the slot slightly so there is room for air beside the blade. Keep the depth fixed and add no water. Send g, then record three separate placements with n. Compare both ranges.','You can identify a shift or change in repeatability while the water in the test cup stays the same.',[0,1,2,4]],
  ],
  wiring:[
    ['Uno 5 V','Probe VCC','Sensor power'],
    ['Uno GND','Probe GND','Shared reference'],
    ['Uno A0','Probe analog output','Raw reading in ADC counts'],
  ],
  test:'Capture both references and take three snug readings and three readings with an air gap at the same depth. Compare the readings and their spreads without adding water between sets.',
  demo:['Clay sample','Snug placement','Air gap','Compare repeats','Measurement spread'],
};
