import type {Build} from './guided-projects';

export const quizDeskResponseButton:Build={
  id:'quiz-desk-response-button',
  title:'Quiz desk response button',
  outcome:'Lock in the first team response, keep its indicator lit, and let the host reset the desk for the next question.',
  parts:[
    ['Arduino Uno R3','1','Debounces the inputs and locks the result for each round.'],
    ['Momentary tactile button','3','Use one button per team and a third for the host.'],
    ['LED and 330 Ω resistor','2 pairs','Show which team responded first. Both light if both press edges are detected in the same update.'],
    ['Quiz desk and team panels','1 set','Keeps the two stations distinct and puts reset within the host’s reach.'],
    ['Breadboard and jumper wires','1 set','Connects the three switches and the two indicators.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects Serial Monitor.'],
  ],
  assembly:[
    ['Mark the stations','Set the switches at three places on a card desk. Label the team switches A and B and the host switch RESET. Place one LED at each team station.','Each player can find their own switch and indicator. Reset is separate.',[1,2,3]],
    ['Connect the three switches','With USB disconnected, check which pair of terminals closes on each press. Connect Team A to D2, Team B to D3, and RESET to D4. Connect the other switched terminal of each to GND.','Each released input reads high and a press connects it to ground.',[0,1,4]],
    ['Add the result indicators','Connect D8 through 330 Ω to the Team A LED anode and D9 through another 330 Ω to the Team B LED anode. Connect both cathodes to GND.','Each LED has its own series resistor and all returns share ground.',[0,2,4]],
    ['Test several rounds','Upload the sketch. Press A first, then B, and confirm only A remains lit. Reset and reverse the order. Hold one team button across reset and release it before beginning the next round.','The first result remains locked. Holding a button through reset cannot win the new round.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno D2','Team A button → GND','Active-low team input'],
    ['Uno D3','Team B button → GND','Active-low team input'],
    ['Uno D4','Host reset button → GND','Active-low reset input'],
    ['Uno D8','330 Ω → Team A LED anode','Team A result'],
    ['Uno D9','330 Ω → Team B LED anode','Team B result'],
    ['Uno GND','All switch returns and LED cathodes','Shared return'],
  ],
  test:'Try both winning orders, then hold a team button while pressing reset. The desk waits for both team buttons to release before arming. The same-update tie rule can be tested in the demo.',
  demo:['Arm round','First press wins','Later press ignored','Host reset','Release to arm'],
};
