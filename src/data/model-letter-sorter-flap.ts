import type {Build} from './guided-projects';

export const modelLetterSorterFlap:Build={
  id:'model-letter-sorter-flap',
  title:'Model letter sorter flap',
  outcome:'Build a tabletop sorter that tips paper letters into one of two bins. Match square-marked letters to Bin A and circle-marked letters to Bin B, then compare the actual and intended counts.',
  parts:[
    ['Arduino Uno R3','1','Reads two destination buttons and sends the diverter angle to the servo.'],
    ['Positional micro servo','1','Tilts a lightweight card deck to route each letter by gravity.'],
    ['Regulated 5 V servo supply','1','Powers the servo separately from the Uno USB supply.'],
    ['Card letter chute, tilting deck and bins','1 set','Make an open-topped feed chute, a smooth tilting deck, two catch bins and six marked paper letters.'],
    ['Momentary tactile piano switches','2','Select Bin A or Bin B. Label the buttons before wiring.'],
    ['Breadboard and jumper wires','1 set','Connects the switches, servo signal and common ground.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to Arduino IDE and Serial Monitor.'],
  ],
  assembly:[
    ['Build the feed chute and catch bins','Make a short feed ramp above the pivot area. Place an open catch bin under each side edge of the deck. Mark Bin A with a square and Bin B with a circle. Cut six 30 × 40 mm paper letters, three of each mark.','Drop a letter directly into each catch bin and check that the bin contains it.',[3]],
    ['Fit the tilting deck','Make a smooth card deck about 100 mm wide by 80 mm deep. Mount the servo with its shaft pointing along the direction of the incoming chute. Center the unloaded servo at 90° with the sketch, disconnect power, then attach the horn so the deck is level at 90°. Center the feed chute above the deck with clearance throughout its tilt.','At either endpoint, the downhill edge is above its bin. A paper letter clears the feed ramp and does not catch on the deck edge.',[1,2,3]],
    ['Wire the destination buttons and servo','With power disconnected, put the switches across the breadboard center gap. Use one contact from each electrically separate side. Wire A to D2 and B to D3, with the other side of each switch connected to ground. Connect D9 to servo signal and external 5 V to servo positive. Join the grounds and keep the positive supplies separate.','Neither button is active when released. The switches show continuity only when pressed.',[0,1,2,4,5]],
    ['Verify the destinations before feeding','Upload the sketch and open Serial Monitor. Press A and B one at a time with the chute empty. If A tips toward Bin B, swap the angles in the sketch. Adjust endpoints for clearance and check the tilt is sufficient for a single letter to slide.','Run three letters to each bin. Expected tally is three in A, three in B and zero misroutes.',[0,1,3,4,6]],
  ],
  wiring:[
    ['Uno D2','Bin A pushbutton to GND','Internal pull-up, pressed reads LOW'],
    ['Uno D3','Bin B pushbutton to GND','Internal pull-up, pressed reads LOW'],
    ['Uno D9','Servo signal lead','Selects one of two angles'],
    ['External regulated 5 V','Servo positive lead','Separate motor supply'],
    ['Uno GND','Buttons, servo ground and external supply return','Shared signal reference'],
  ],
  test:'Check both endpoints with an empty deck first. Feed three marked letters per bin. Wait for the flap to settle before releasing each letter. Verify three correct arrivals in each bin, then press both buttons together and confirm the selected destination holds.',
  demo:['Inspect the feed chute','Read the letter mark','Select a bin','Release the letter','Compare the counts'],
};
