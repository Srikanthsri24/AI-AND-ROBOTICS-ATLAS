import type { Build } from './guided-projects';

export const porchOnAt = 1200;
export const porchOffAt = 1600;

export const esp32SmartHome: Build = {
  id:'directory-96', title:'IoT-Based Smart Home Automation Using ESP32',
  outcome:'Build a two-zone model home. Use the ESP32’s local Wi-Fi dashboard to control the room light and switch the porch between manual control and an automatic night light.',
  parts:[
    ['ESP32-DevKitC V4 (ESP32-WROOM-32E)','1','Hosts the Wi-Fi network and dashboard. Reads the light sensor and switches both LED outputs.'],
    ['Diffused white LEDs and 220 Ω resistors','2 each','One light per zone. Each LED needs its own current-limiting resistor.'],
    ['Photoresistor','1','Changes resistance with the light outside the house. Mount it where neither model lamp shines directly on it.'],
    ['10 kΩ divider resistor','1','Pairs with the photoresistor so GPIO34 can read a voltage that rises in brighter light.'],
    ['Breadboard and jumper wires','1 set','Keeps the power, sensor, and lighting connections accessible during tests.'],
    ['USB Micro-B data cable','1','Supplies power, uploads the program, and carries Serial Monitor messages.'],
    ['Cardboard room shell and vent guard','1 set','Use the card stock to make a room and open porch. Keep a removable front panel to reach the lamps.'],
  ],
  assembly:[
    ['Make the model house','Build a room and porch from card stock. Position the two LEDs so each illuminates a separate area. Put the sensor outside the porch lamp’s direct light.','Both zones are visible, and the sensor can be covered by hand without covering either lamp.',[1,2,6]],
    ['Connect both lamps','Unplug USB. Connect GPIO25 through one 220 Ω resistor to the room LED anode. Repeat on GPIO26 for the porch LED. Connect the two cathodes to ground.','Each lamp has its own resistor and its own GPIO. The short leg and flat side identify the cathode on the specified LED.',[0,1,4]],
    ['Build the light divider','Connect the photoresistor between 3V3 and GPIO34. Connect the 10 kΩ resistor between GPIO34 and GND. Keep the sensor leads clear of the lamp wiring.','The divider junction is the only signal going into GPIO34, and it uses the board’s 3.3 V rail.',[0,2,3,4]],
    ['Power and connect','Plug in the USB cable, upload the sketch, and find the dashboard address in Serial Monitor. Join the ESP32 Wi-Fi network from another device.','The dashboard opens and shows the live raw light reading.',[0,5]],
    ['Compare manual and automatic control','Toggle both lamps in manual mode. Select Auto for the porch. Cover the sensor until the light turns on and uncover it until the light turns off.','The room still follows the dashboard while the porch follows the sensor in Auto.',[0,1,2,3]],
  ],
  wiring:[
    ['GPIO25','220 Ω resistor → room LED anode','Room lamp follows the dashboard switch.'],
    ['GPIO26','220 Ω resistor → porch LED anode','Porch lamp follows the chosen mode.'],
    ['Both LED cathodes','ESP32 GND','Common return.'],
    ['ESP32 3V3','Photoresistor lead 1','Supplies the divider.'],
    ['GPIO34','Photoresistor lead 2 and one end of 10 kΩ','ADC1 input. Brighter light raises the reading.'],
    ['Other end of 10 kΩ','ESP32 GND','Completes the divider.'],
    ['Computer USB','DevKitC Micro-B','Use USB as the board’s power source.'],
  ],
  test:'Toggle each light independently in Manual. Set the porch to Auto and cover and uncover the sensor. Check that the porch holds its last state between the two thresholds. Disconnect the phone from model Wi-Fi and confirm the automatic porch still follows the sensor. Rejoin Wi-Fi and check the dashboard shows the actual current state.',
  demo:['Local Wi-Fi dashboard','Room lamp','Porch lamp','Light sensor','Manual and automatic control'],
};
