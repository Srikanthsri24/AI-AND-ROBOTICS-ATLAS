import type {Build} from './guided-projects';

export const coldPackWarming:Build={
  id:'cold-pack-warming-indicator',title:'Cold pack warming indicator',
  outcome:'Monitor the air beside a reusable cold pack and light a warning when the air remains warm for three seconds.',
  parts:[
    ['Arduino Uno R3','1','Times warm air readings and drives the warning.'],
    ['TMP36 analog temperature sensor','1','Measures the air beside the pack from a dry stand.'],
    ['LED and 330 Ω resistor','1 pair','Shows the warning after sustained warming.'],
    ['Reusable cold pack and spill tray','1 set','A sealed pack cools the model air while the tray catches condensation.'],
    ['Digital reference thermometer','1','Checks the sensor in stable air.'],
    ['Breadboard and jumper wires','1 set','Connects the sensor and flag on the dry side.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to Arduino IDE and Serial Monitor.'],
  ],
  assembly:[
    ['Prepare a dry sensor stand','Set a sealed, chilled cold pack in a shallow tray. Put the probe beside it with an air gap. Keep the probe and wires out of any condensation.','Removing or replacing the pack does not move the probe.',[1,3]],
    ['Connect the temperature input','With USB disconnected, check the TMP36 pinout. Connect power to 5 V, output to A0, and ground to GND. Compare the sensor and a reference in the same dry air.','A0 reads the local air temperature, and all electronics are outside the spill tray.',[0,1,4,5]],
    ['Wire the warming warning','Connect D8 through the 330 Ω resistor to the LED anode. Connect its cathode to ground.','The warning LED has a current-limiting resistor and a shared ground.',[0,2,5]],
    ['Remove and replace the pack','Upload the sketch. In a room warmer than 20 °C, let the chilled pack lower the air near the probe. Remove it and watch the log. Put it back and wait for cooling, or compare both transitions in the demo.','A brief crossing does not light the LED. Continued warmth lights it, and cooling to 18 °C clears it.',[0,1,2,3,6]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply','Sensor power'],
    ['Uno A0','TMP36 output','Air reading beside the pack'],
    ['Uno GND','TMP36 ground and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Sustained warming warning'],
  ],
  test:'Start cool. Remove the pack and let the sensed air reach 20 °C. After three uninterrupted seconds at or above 20 °C, the warning lights. Replace the pack. The warning clears at 18 °C or below.',
  demo:['Air by the pack','Pack in tray','Pack removed','Air cool','Warm warning after a delay'],
};
