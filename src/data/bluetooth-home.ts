import type { Build } from './guided-projects';

export const homeCommands = [
  ['1','Room on'], ['0','Room off'], ['P','Porch on'], ['p','Porch off'],
  ['S','All off'], ['?','Read status'], ['X','Unknown command'],
] as const;
export type HomeCommand = typeof homeCommands[number][0];

export function homeResponse(command:HomeCommand, room:boolean, porch:boolean) {
  if (command==='X') return {room,porch,reply:'ERR'};
  const nextRoom = command==='1' ? true : command==='0'||command==='S' ? false : room;
  const nextPorch = command==='P' ? true : command==='p'||command==='S' ? false : porch;
  return {room:nextRoom,porch:nextPorch,reply:`R${Number(nextRoom)} P${Number(nextPorch)}`};
}

export const bluetoothHome:Build = {
  id:'directory-52',
  title:'Smart Home Automation Using Arduino and Bluetooth',
  outcome:'Control room and porch LEDs over a local Bluetooth link, then read the output states back on the phone.',
  parts:[
    ['Arduino Uno R3','1','Decodes single-character commands and reports the room and porch output states. Bring a USB data cable.'],
    ['Bluefruit LE UART Friend','1','Bridges the phone’s BLE UART connection to the Uno’s serial pins. Use this breakout in UART/Data mode.'],
    ['Diffused white LEDs and 220 Ω resistors','2 each','One LED per area and one resistor in series with each LED.'],
    ['Breadboard and jumper wires','1 set','Connects the power, serial signals and two LED circuits.'],
  ],
  assembly:[
    ['Build the two lighting zones','Make a room and porch from folded card. Position one LED in each area. Mark room and porch on the breadboard so students can track the two circuits. Place the Uno outside the model for access.','The two LEDs are visible separately and their leads cannot touch.',[0,2,3]],
    ['Wire each lamp','With USB disconnected, wire Uno D6 through one 220 Ω resistor to the room LED anode. Repeat on D7 for the porch. Return both cathodes to ground.','Each LED has its own resistor. D6 and D7 remain separate.',[0,2,3]],
    ['Connect the BLE breakout','Set the Bluefruit switch to UART/Data. Match the power, cross the serial lines, and connect both flow-control pins using the map. Keep the radio antenna beyond the cardboard wall edge.','The radio and Uno share ground. TXO goes to the Uno’s receive pin, D2.',[0,1,3]],
    ['Connect the phone and compare commands','Upload the sketch and open UART in Bluefruit Connect. Send one character at a time and wait for a reply. Try 1, P, 0, S and ?. Compare the model lights with the returned room and porch flags.','Room and porch respond independently. The phone shows their current states after each valid command.',[0,1,2]],
  ],
  wiring:[
    ['Uno 5 V / GND','Bluefruit VIN / GND','USB-powered model and common reference'],
    ['Bluefruit TXO','Uno D2','Receive BLE command at 9600 baud'],
    ['Uno D3','Bluefruit RXI','Send the response through the breakout’s level-shifted input'],
    ['Uno D4','Bluefruit CTS','Pause incoming characters during a reply'],
    ['Bluefruit RTS','Uno D5','Wait for radio to accept outgoing characters'],
    ['Uno D6','220 Ω → room LED anode; cathode → GND','Room lamp output'],
    ['Uno D7','220 Ω → porch LED anode; cathode → GND','Porch lamp output'],
  ],
  test:'At boot both lamps are off. Send 1, P and 0 and expect R1 P0, R1 P1 and R0 P1. Send X and expect ERR with the porch unchanged. Disconnect and reconnect, then send ? to check which lights stayed on. Send S to turn both off.',
  demo:['UART command','Off','On','LED goes dark','LED illuminates the model room'],
};
