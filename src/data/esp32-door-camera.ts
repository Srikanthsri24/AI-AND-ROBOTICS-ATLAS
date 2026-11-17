import type { Build } from './guided-projects';

export const esp32DoorCamera: Build = {
  id:'directory-97', title:'ESP32-CAM-Based Smart Security and Surveillance System',
  outcome:'Build a model doorway camera. A magnetic contact detects the door opening, then the ESP32-CAM records one still image of the staged doorway and shows it in a local browser.',
  parts:[
    ['AI Thinker ESP32-CAM with OV2640','1','Captures a JPEG from the ribbon-mounted camera and serves it over the board’s own Wi-Fi network.'],
    ['Magnetic door contact switch','1 set','Use the reed switch that closes when its matching magnet is beside it. Moving the magnet away opens the circuit.'],
    ['FTDI Friend USB-to-serial adapter','1','Uploads the sketch and displays the dashboard address. Keep the UART logic at 3.3 V.'],
    ['Regulated 5 V supply and adapter','1 set','Use an isolated regulated 5 V supply rated for at least 1 A to power the camera board.'],
    ['Breadboard and jumper wires','1 set','Connect the contact, shared ground and temporary upload lead.'],
    ['Cardboard locker and keeper','1 set','Use the card stock to make a hinged doorway and an empty backdrop. Place a toy parcel behind the door as the test subject.'],
  ],
  assembly:[
    ['Build the doorway and aim the lens','With power off, seat and latch the OV2640 ribbon. Mount the board on a rigid support and aim it at the staged doorway so the parcel is visible when the door opens.','The frame contains only the tabletop scene, and the parcel is visible through the open doorway.',[0,5]],
    ['Fit the reed switch and magnet','Fix the wired switch to the stationary frame and the magnet to the swinging door. Connect the contact between GPIO13 and GND. Keep the microSD slot empty because GPIO13 is used by the contact.','A shut door aligns the magnet with the switch. Opening the door pulls them apart without flexing the wires.',[0,1,4,5]],
    ['Connect power and the uploader','Cross the 3.3 V UART wires, leave FTDI VCC disconnected, and join the grounds. Feed the board’s 5 V input from the separate regulated supply. Ground GPIO0 for the upload only.','The adapter and supply share a ground with the board. The supply powers the board at the 5 V pin.',[0,2,3,4]],
    ['Start with the door closed','After uploading, cut power and remove the GPIO0 jumper. Close the model door before restarting. Read the local HTTP address in the Serial Monitor and join the board’s Wi-Fi.','The dashboard reports Closed and shows zero captured events.',[0,1,2]],
    ['Trigger, review and rearm','Open the door and wait for the latest still. Hold the door open, then close and reopen it. Compare the event counter and the latest image.','The counter advances once per opening, and the latest frame shows the doorway after it opened.',[0,1,5]],
  ],
  wiring:[
    ['OV2640 flex cable','ESP32-CAM ribbon socket','Seat and latch with power disconnected.'],
    ['GPIO13','One reed-switch lead','Internal pull-up. Do not use the microSD slot.'],
    ['Other reed-switch lead','ESP32-CAM GND','Closed door reads LOW. Open door reads HIGH.'],
    ['FTDI TXD / RXD','ESP32-CAM U0R / U0T','Cross serial lines. Use 3.3 V logic.'],
    ['FTDI ground and 5 V supply negative','ESP32-CAM GND','Common reference for programming and power.'],
    ['5 V supply positive','ESP32-CAM 5 V','Leave FTDI VCC disconnected.'],
    ['GPIO0','GND for upload only','Remove the jumper with power off before restarting.'],
  ],
  test:'Start with the door shut. Open it, check that the counter increments once, and confirm the latest image shows the parcel. Hold the door open for five seconds and check that the count stays fixed. Close and reopen it for a second event. Start another trial while the door is already open and check that the camera waits for a close-and-open cycle.',
  demo:['Model doorway camera','Closed and armed','Door opens','One snapshot','Close to rearm'],
};
