import type { Build } from './guided-projects';

export const faceLockDelay=3000;
export const piFaceLock:Build={
  id:'directory-103',title:'Face Recognition Door Lock System Using Raspberry Pi',
  outcome:'Use a Raspberry Pi to compare generated portraits. A clear match sends one serial grant to an Arduino-controlled latch on a cardboard model doorway.',
  parts:[
    ['Raspberry Pi 5','1','Runs the local image matcher and sends the decision over USB. Use an existing Pi with Raspberry Pi OS and its normal cooling and boot storage.'],
    ['27 W USB-C power supply','1','Powers the Raspberry Pi separately from the model servo.'],
    ['Arduino Uno R3','1','Receives the grant and turns the latch servo. Reads the door contact before relocking.'],
    ['Positional micro servo','1','Retracts a lightweight sliding bolt on the model frame.'],
    ['Magnetic door contact switch','1 set','Indicates stable closure. Fit the magnet to the moving panel.'],
    ['Regulated 5 V servo supply','1','Servo supply with ground shared with the Uno.'],
    ['Breadboard and jumper wires','1 set','Connects the contact, servo signal, and ground.'],
    ['USB-A to USB-B data cable','1','Connects the Raspberry Pi to the Arduino for serial commands.'],
    ['Cardboard locker and keeper','1 set','Use light card for the door and cardboard frame. Add a short lightweight slider and servo link.'],
  ],
  assembly:[
    ['Fit the model latch','Build an exposed countertop model. On the fixed frame, install a sliding bolt and short horn link. Fit a strike to the model door. Test by hand with power off.','The bolt travels freely and meets the strike only when the model door is shut.',[3,8]],
    ['Fit the contact and servo','Mount the reed switch on the frame and the magnet on the door. Wire the contacts and servo according to the map. Leave the horn disconnected while checking the two programmed angles.','Closing the door reads LOW and the separate servo rail shares the Uno ground.',[2,3,4,5,6]],
    ['Link the Pi and Arduino','Upload the latch sketch to the Uno. Connect the board to the Pi with the USB cable. Start with the cardboard door closed.','The Uno extends the bolt after the model door has been closed for three seconds.',[0,1,2,7]],
    ['Compare visitor samples','Run the downloadable Pi matcher through its three sample cases. Review the candidate distances before comparing the latch state.','Only a clear match retracts the bolt. Ambiguous and unknown portraits leave it locked.',[0,2,3]],
    ['Check the closure timer','After a valid scan, open the door and hold it open past three seconds. Close it and wait for relock.','The bolt stays retracted while the door is open and extends after three continuous seconds closed.',[2,3,4,8]],
  ],
  wiring:[
    ['Raspberry Pi USB-A','Arduino Uno USB-B','Decision byte and serial reply at 115200 baud.'],
    ['Uno D9','Servo signal','Latch motion.'],
    ['Separate 5 V supply + / −','Servo power / ground','Join servo supply negative to Uno GND.'],
    ['Uno D4','Magnetic contact → GND','LOW when the door is closed. Select a contact that closes near its magnet.'],
    ['Pi USB-C power supply','Pi power input','Independent power for the Pi.'],
  ],
  test:'Begin closed. Confirm the known portrait retracts the bolt, then hold the door open longer than three seconds. Close the door and wait three seconds. Compare ambiguous and unknown samples with the bolt locked. Reboot with the model door open and confirm it waits for stable closure before extending.',
  demo:['Generated portrait','Match distance','Serial grant','Latch retracts','Closed-door relock'],
};
