import type {Build} from './guided-projects';

export const mailboxTestFlag:Build={
  id:'mailbox-test-flag',
  title:'Mailbox test flag',
  outcome:'Detect a model mailbox flap opening and keep a reminder lit after it closes, until the reset button is pressed.',
  parts:[
    ['Arduino Uno R3','1','Debounces the switches and remembers a flap opening.'],
    ['Roller-lever microswitch','1','The closed flap depresses its roller and closes COM to NO.'],
    ['Momentary tactile button','1','Clears the reminder when the flap is shut.'],
    ['LED and 330 Ω resistor','1 pair','Shows that the flap was opened since the last reset.'],
    ['Card mailbox and hinged flap','1 set','Holds the roller at the flap edge and gives a visible opening to test.'],
    ['Breadboard and jumper wires','1 set','Routes both switches and the lamp to the Uno.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects Serial Monitor.'],
  ],
  assembly:[
    ['Build the mailbox flap','Make a tabletop card box with a hinged front flap. Place the roller so the flap presses it only when fully shut. Add a stop to limit the travel.','The flap opens without dragging wires, and shuts far enough to click the switch.',[1,4]],
    ['Wire the flap and reset inputs','Disconnect USB. Wire COM to GND and NO to D2 on the roller switch. Connect the reset button between D3 and GND.','D2 is low with the flap shut and high when it opens. D3 goes low only while pressed.',[0,1,2,5]],
    ['Add the reminder lamp','Connect D8 through the 330 Ω resistor to the LED anode and its cathode to GND. Mount it where you can see it with the flap closed.','Both inputs and the LED use a shared ground.',[0,3,4,5]],
    ['Test opening, closing and reset','Upload with the flap shut. Open it, then shut it again. The lamp stays lit. Press reset while shut. Repeat with the flap open and confirm reset is ignored until you shut it and press again.','Opening after a stable closure sets the flag. The circuit tracks flap openings, so an empty opening also sets it.',[0,1,2,3,4,6]],
  ],
  wiring:[
    ['Uno D2','Microswitch NO; COM → GND','Closed flap pulls input low'],
    ['Uno D3','Reset switch → GND','Active-low reset'],
    ['Uno D8','330 Ω → LED anode','Stored reminder'],
    ['Uno GND','Switch returns and LED cathode','Shared return'],
  ],
  test:'Power up with the flap open and verify the lamp stays off. Close it to arm the detector. Open and close it again, then clear the reminder with reset while the flap is shut.',
  demo:['Close to arm','Open flap','Reminder lights','Close flap','Reset while closed'],
};
