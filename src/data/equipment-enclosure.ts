import type {Build} from './guided-projects';

export const equipmentEnclosure:Build={
  id:'equipment-enclosure-monitor',
  title:'Equipment enclosure monitor',
  outcome:'Measure how much warmer the air gets inside a model equipment case, then test whether opening its vent clears a temperature warning.',
  parts:[
    ['Arduino Uno R3','1','Reads both temperatures and drives the warning LED.'],
    ['Pair of TMP36 air sensors','2','Measure case air and room air at the same time.'],
    ['LED and 330 Ω resistor','1 pair','Show when the case air reaches the warning temperature.'],
    ['Clear terrarium and movable vent','1 set','Use a clear tabletop case with an adjustable air gap at the top.'],
    ['Breadboard and jumper wires','1 set','Connect both probes and the warning LED outside the case.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries readings back to the computer.'],
  ],
  assembly:[
    ['Set up the pilot case','Use a small clear container and a lid that can leave a gap. Route both probe leads through an existing opening without pinching them. Keep the Uno and breadboard outside.','The vent can open while both probes stay fixed.',[0,1,3,4]],
    ['Wire and compare the probes','Unplug USB. Check the TO-92 TMP36 pinout for both sensors. Connect their supplies to 5 V and grounds to GND. Wire the inside probe output to A0 and the room probe output to A1. Before mounting them, compare both readings side by side.','The probes give similar readings at the same temperature. Check wiring and apply a measured offset if needed.',[0,1,4]],
    ['Mount the probes and wire the flag','Suspend the A0 probe in the middle of the case air. Place the A1 probe outside at the same height, away from the exhaust. Run D8 through 330 Ω to the LED anode and connect the cathode to GND.','Both probes sample air away from walls and the LED shares the Uno ground.',[0,1,2,3,4]],
    ['Compare vent positions','Upload the sketch. With an adult, place a sealed bottle of warm tap water in the case as a heat source. Keep the bottle away from the probe and electronics. Record the case and room readings with the vent closed, then open it and record again after the readings settle.','Compare the inside-minus-room difference for both vent positions. Use the interactive demo to repeat the trial and observe both warning thresholds.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno 5 V','Both TMP36 supply pins','Shared power'],
    ['Uno GND','Both TMP36 ground pins and LED cathode','Shared return'],
    ['Uno A0','Inside TMP36 output','Case air temperature'],
    ['Uno A1','Outside TMP36 output','Room reference'],
    ['Uno D8','330 Ω resistor → LED anode','High-temperature warning'],
  ],
  test:'Confirm that the room and case readings start close together. Watch the inside-minus-room difference as the case warms. The LED turns on at 34 °C inside and clears at 32 °C or below.',
  demo:['Case air','Vent closed','Vent open','Below warning threshold','Case temperature warning'],
};
