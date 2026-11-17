import type { Build } from './guided-projects';

export const replyInterval = 250;
export const linkTimeout = 1000;
export type RailAspect = 'red' | 'green';
export type CabAspect = RailAspect | 'offline';

export const wirelessRailSignal: Build = {
  id:'directory-85',
  title:'Wireless Red Signal Alerting For Trains',
  outcome:'Build a tabletop railway signal and a wireless cab indicator with two ESP32 boards. Switch the trackside lamp between red and green, then see the cab show a separate warning when replies stop arriving.',
  parts:[
    ['ESP32-DevKitC V4 (ESP32-WROOM-32E)','2','One board hosts the trackside network and the other requests the current signal from the model cab.'],
    ['Momentary tactile start button','1','Press at the trackside panel to toggle the model signal. Release it before the next change.'],
    ['Model signal LEDs (red, green and amber)','5','Two red, two green and one amber. Mount red and green at each station and reserve amber for missing cab updates.'],
    ['220 Ω axial resistors','5','Limit LED current. Give every lamp its own resistor.'],
    ['Breadboard and jumper wires','2 sets','Use a separate breadboard for each station. The radio forms the link between them.'],
    ['USB Micro-B data cable','2','Use a data-capable cable to upload each board. Power the two stations separately for the wireless trial.'],
    ['5 V USB power bank','1','Powers the cab board and lights during the hand-pushed train trial.'],
    ['Cardboard rail bed, train and signal mast','1 set','Build a short model track with an approach marker, a lightweight hand-pushed train and a signal mast.'],
  ],
  assembly:[
    ['Build the model approach and cab','Use card for the scenery and make a stationary trackside panel. Mark a stop line and put the signal mast just beyond it. Leave room to carry the cab circuit beside the hand-pushed locomotive.','The train can be moved along the model track by hand and the cab lamps remain visible.',[7]],
    ['Wire the trackside switch and lamps','With USB disconnected, connect the button to GPIO 25 and ground. Fit the red and green mast LEDs to GPIO 26 and 27 through individual 220 Ω resistors.','Pressing the button changes which lamp is displayed after the trackside sketch is uploaded.',[0,1,2,3,4]],
    ['Build the wireless cab indicators','On the second board connect red and green to GPIO 26 and 27 and amber to GPIO 33. Label the colors STOP, CLEAR and NO UPDATE.','All three LEDs have separate resistors. Amber is visible when the trackside board is switched off.',[0,2,3,4]],
    ['Upload to each station','Upload the trackside sketch first and the cab sketch second. Use matching Wi-Fi credentials in both files and keep the boards within the same tabletop area.','The trackside monitor shows the network address and the cab changes from amber to red after the first validated reply.',[0,5,6]],
    ['Test clear, red and missing updates','Start at the model approach. Change the mast from red to green and compare the cab. Set green again if needed, then unplug only the trackside USB. Restore power and compare both displays again.','Amber replaces the previous cab light within one second of its last valid update. The trackside signal restarts on red.',[0,1,2,5,6,7]],
  ],
  wiring:[
    ['Trackside GPIO 25','Momentary switch → trackside GND','Use internal pull-up and active-low input'],
    ['Trackside GPIO 26 / 27','Each → 220 Ω → red / green LED anode','LED cathodes to trackside GND'],
    ['Cab GPIO 26 / 27 / 33','Each → 220 Ω → red / green / amber LED anode','LED cathodes to cab GND'],
    ['Trackside ESP32 access point','Cab ESP32 Wi-Fi station','Cab requests the aspect from 192.168.4.1 on UDP port 4210. Each reply echoes its request ID.'],
    ['USB source at each station','Its own ESP32 Micro-B connector','Each circuit uses its own local GND reference'],
  ],
  test:'Observe startup red at the mast and amber at the cab until a fresh red reply arrives. Toggle to green and back. With the cab showing green, disconnect the trackside USB and verify amber replaces green. Reconnect and verify that the trackside restarts red and the cab follows after reconnecting.',
  demo:['Mast and cab aspects','No update','Clear signal','Red signal alert','Cab times out after missing replies'],
};
