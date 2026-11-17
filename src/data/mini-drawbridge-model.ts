import type {Build} from './guided-projects';

export const miniDrawbridgeModel:Build={
  id:'mini-drawbridge-model',
  title:'Mini drawbridge model',
  outcome:'Make a lightweight road deck pivot above a model canal. Verify that a paper boat can pass when the deck is raised and a small paper vehicle can cross when it is lowered.',
  parts:[
    ['Arduino Uno R3','1','Reads raise and lower commands from Serial Monitor and moves the servo in small steps.'],
    ['Positional micro servo','1','Turns a horn fixed to one side of the deck along its hinge axis.'],
    ['Regulated 5 V servo supply','1','Powers the servo separately from the USB-powered Uno.'],
    ['Card bridge deck, hinge supports and canal','1 set','Make the deck, two banks, a landing ledge and a paper boat. Use a lightweight dowel and straw for the passive hinge bearing.'],
    ['Breadboard and jumper wires','1 set','Provides a shared ground and connects the servo signal.'],
    ['USB-A to USB-B data cable','1','Uploads the sketch and carries commands from Serial Monitor.'],
  ],
  assembly:[
    ['Lay out the canal and approaches','On a firm base, mark a canal about 85 mm wide. Build two raised card approaches at the same height. Cut a deck about 95 × 55 mm. Add a narrow landing ledge on the opposite bank so the free end can meet it. Fold a small paper boat for the dry canal.','A level deck spans the gap and the boat fits between the banks.',[3]],
    ['Align the drive and passive hinge','Mount the servo just outside one edge of the approach, with its shaft across the road. On the opposite edge, use a short dowel in a straw bearing aligned with that shaft. Fix the passive hinge to the deck and check that it moves freely with the servo horn detached.','The deck swings without twisting or scraping the banks.',[1,3]],
    ['Connect signal and shared ground','Disconnect USB and external power. Connect D9 to the signal lead, external regulated 5 V to servo positive, and link the servo supply return to servo ground and Uno GND. Keep the two positive rails separate.','Check the ground connection and servo lead order before powering the circuit.',[0,1,2,4]],
    ['Fit the drive horn and calibrate','Upload the sketch with the horn off. Send l to select the lowered endpoint. Disconnect power before fitting the horn so the deck is just touching the ledge. Reconnect and test with the deck empty. If the deck tries to move below the ledge, stop and correct the mounting or reverse the direction with the sketch setting.','The deck rests level without pressing against the stop. At the raised endpoint there is space for the paper boat.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno D9','Servo signal lead','Position command'],
    ['External regulated 5 V','Servo positive lead','Dedicated servo supply'],
    ['Uno GND','Servo ground and supply return','Shared signal reference'],
  ],
  test:'Run three raise and lower cycles with an empty deck. Pass the paper boat only when the deck is raised and roll a paper vehicle across only when it is level. Check for scraping, servo buzzing against the landing, and clearance above the boat.',
  demo:['Inspect the hinge','Raise the deck','Send the boat through','Lower the deck','Cross the roadway'],
};
