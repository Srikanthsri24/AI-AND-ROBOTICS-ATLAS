import type {Build} from './guided-projects';

export const greenhouseVentModel:Build={
  id:'greenhouse-vent-model',
  title:'Greenhouse vent model',
  outcome:'Build a tabletop greenhouse with a servo-driven roof vent. Open it at 28 °C, close it at 25 °C, and verify that it holds its previous position in between.',
  parts:[
    ['Arduino Uno R3','1','Reads the air temperature on A0 and sends a servo command from D9.'],
    ['TMP36 analog temperature sensor','1','Measures the air inside the model at plant height.'],
    ['Positional micro servo','1','Rotates the lightweight roof vent around its hinge axis.'],
    ['Regulated 5 V servo supply','1','Supplies servo current independently of the USB-powered Uno.'],
    ['Card greenhouse frame and roof flap','1 set','Forms the roof opening, pivot supports and lightweight flap. Use clear packaging sheet for windows if available.'],
    ['Digital reference thermometer','1','Checks the temperature beside the TMP36.'],
    ['Breadboard and jumper wires','1 set','Joins sensor wires, servo signal and shared ground.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to Arduino IDE and Serial Monitor.'],
  ],
  assembly:[
    ['Build the greenhouse and vent frame','Build a tabletop frame with two pitched roof panels. Leave a rectangular opening on one slope. Cut a thin card flap that rests across the opening without touching the opposite roof.','The flap covers the opening and clears all frame members when lifted.',[4]],
    ['Align the servo and roof hinge','Mount the servo coaxially with the flap hinge on one end, and support the opposite end with a short dowel in a straw bearing. Confirm the flap swings freely before fitting the horn. Upload with the horn detached, then disconnect power before aligning the flap at the closed command.','The closed flap rests flat, and the open endpoint clears the opening without straining the servo.',[2,3,4]],
    ['Wire and position the temperature sensor','Disconnect USB and external power. For the TO-92 TMP36 with its flat face toward you and leads pointing down, connect left to Uno 5 V, center to A0 and right to GND. Mount it in free air away from the servo and direct radiant heat. Put the reference thermometer alongside it. Connect the servo signal to D9 and power it separately.','The signal reference is shared through GND. The Uno 5 V and external 5 V positive leads remain separate.',[0,1,2,3,5,6]],
    ['Compare warming and cooling','Upload the sketch and open Serial Monitor. Start cool, warm the air gradually past 28 °C, then cool it below 25 °C. Compare the reported temperature and the actual flap position.','At 27 °C the flap stays closed during warming and stays open during cooling.',[0,1,2,4,5,7]],
  ],
  wiring:[
    ['Uno 5 V','TMP36 supply','Sensor supply'],
    ['Uno A0','TMP36 output','Air temperature voltage'],
    ['Uno D9','Servo signal lead','Commands the flap angle'],
    ['External regulated 5 V','Servo positive lead','Dedicated motor power'],
    ['Uno GND','TMP36 ground, servo ground and external supply return','Shared reference'],
  ],
  test:'Try 24 → 27 → 29 → 27 → 24 °C. The expected sequence is closed, closed, open, open, closed. Compare readings against the thermometer once both probes settle.',
  demo:['Inspect the air sensor','Warm the greenhouse','Watch the roof open','Cool through the hold band','Confirm that the roof closes'],
};
