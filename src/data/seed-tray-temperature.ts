import type {Build} from './guided-projects';

export const seedTrayTemperature:Build={
  id:'seed-tray-temperature-flag',title:'Seed tray temperature flag',
  outcome:'Compare air temperatures beside two halves of a model seed tray and light a separate flag for each warm side.',
  parts:[
    ['Arduino Uno R3','1','Reads two analog sensors and drives the matching flags.'],
    ['Pair of TMP36 air sensors','2','Measures air above the left and right halves at equal heights.'],
    ['Red and green LEDs','2','Use red for the left flag and green for the right. Either color means warmth on its labeled side.'],
    ['Pair of 330 Ω resistors','2','Limits current in each LED branch.'],
    ['Seed tray and divided test base','1 set','Marks two test zones and supports sensors above dry seed cells.'],
    ['Digital reference thermometer','1','Checks both channels against the same reference.'],
    ['Breadboard and jumper wires','1 set','Connects both sensors and the two indicators.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to Serial Monitor.'],
  ],
  assembly:[
    ['Set up the two tray locations','Mark one half of a dry tray left and the other right. Mount a TMP36 just above each half at the same height, with both sensors clear of the tray walls.','The two probes measure comparable locations and neither touches the tray.',[1,4,5]],
    ['Wire both analog inputs','With USB unplugged, check the TMP36 pinout. Connect both supply pins to 5 V and both grounds to GND. Put the left output on A0 and the right output on A1.','The two analog outputs are separate. Labels match the side of the tray.',[0,1,6]],
    ['Add the two flags','Connect D8 through 330 Ω to the left red LED and D9 through another 330 Ω resistor to the right green LED. Return both cathodes to ground. Label the LEDs by side.','Each side has a separate output and resistor. Both flags can light together.',[0,2,3,6]],
    ['Compare and warm one side','Let both readings settle beside the reference thermometer. Apply warmth with a sealed warm-water bottle near one side without touching the sensor. Remove it and repeat on the other side.','Only the side that reaches 26 °C raises its flag, and cooling that side to 25 °C clears it.',[1,2,4,5,7]],
  ],
  wiring:[
    ['Uno 5 V','Supply pin on both TMP36 sensors','Sensor supply'],
    ['Uno A0','Left TMP36 output','Left air temperature'],
    ['Uno A1','Right TMP36 output','Right air temperature'],
    ['Uno GND','Both sensor grounds and both LED cathodes','Shared ground return'],
    ['Uno D8','330 Ω → left red LED anode','Left flag'],
    ['Uno D9','330 Ω → right green LED anode','Right flag'],
  ],
  test:'Warm left past 26 °C while right stays cool. Only D8 should light. Reverse the trial for D9, then warm both sides. Each flag remains on until its own temperature reaches 25 °C or lower.',
  demo:['Left and right temperature','Cool tray','Warm tray','Both flags clear','Flags identify the warm side'],
};
