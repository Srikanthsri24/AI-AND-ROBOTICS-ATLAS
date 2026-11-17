import type { Build } from './guided-projects';

export const homeVoiceCommands = [
  {phrase:'home desk on',byte:'D'},
  {phrase:'home desk off',byte:'d'},
  {phrase:'home hall on',byte:'H'},
  {phrase:'home hall off',byte:'h'},
  {phrase:'home all off',byte:'S'},
] as const;
export const homeVoiceSamples = [...homeVoiceCommands.map(({phrase})=>phrase),'open the window'];
export type HomeVoiceByte = typeof homeVoiceCommands[number]['byte'];
export function resolveHomeVoice(input:string) {
  const phrase=input.trim().toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
  return homeVoiceCommands.find(command=>command.phrase===phrase);
}

export const voiceHome: Build = {
  id:'directory-99', title:'Voice-Controlled Home Automation Using ESP32',
  outcome:'Build two model lighting zones. Speak into a computer microphone, follow the recognized phrase to one USB serial byte, then check the ESP32 response and lamp state.',
  parts:[
    ['ESP32-DevKitC V4 (ESP32-WROOM-32E)','1','Decodes serial bytes, switches the two LED outputs, and replies with their current states.'],
    ['Diffused white LEDs and 220 Ω resistors','2 each','Represent a desk lamp and a hall lamp. Each LED needs its own resistor.'],
    ['Breadboard and jumper wires','1 set','Connect the two LED circuits to the ESP32. Label the Desk and Hall wires before testing.'],
    ['USB Micro-B data cable','1','Powers and programs the ESP32 and carries commands from the computer.'],
    ['Computer with microphone','1','Runs a local Vosk recognizer and the push-to-talk Python console. A headset microphone also works.'],
    ['Cardboard room shell and vent guard','1 set','Use the card stock to make a room divider and two stands for the model lamps.'],
  ],
  assembly:[
    ['Build two model lighting zones','Make a desk and hallway on a card base. Set one LED by the desk and one by the hallway. Label the zones so you can verify which lamp received the command.','The model shows two distinct pools of light.',[1,5]],
    ['Wire the desk and hall LEDs','Disconnect USB. Wire GPIO25 through a 220 Ω resistor to the desk LED, then GPIO26 through a separate resistor to the hall LED. Connect both cathodes to GND.','The ESP32 has a separate output and resistor for each LED.',[0,1,2]],
    ['Connect USB and test direct commands','Upload the sketch, open Serial Monitor at 115200 baud, and send D, H and S. Check that the reply shows the desk and hall states. Close Serial Monitor before you open the Python console.','D lights the desk, H lights the hall, and S switches both off.',[0,3,4]],
    ['Prepare the local microphone','Install the Python dependencies, extract the Vosk English model, and run the console with the USB port and model folder. Press Enter before speaking.','The console shows the recognized phrase and the ESP32 reply.',[0,3,4]],
    ['Verify an unrelated phrase','Turn the desk on, then say “open the window.” Check that the phrase sends no byte and leaves the desk on. Finish with “home all off.”','An unsupported phrase leaves both outputs unchanged. The all-off phrase gives a reply with both zones off.',[0,1,4]],
  ],
  wiring:[
    ['ESP32 GPIO25','220 Ω resistor → Desk LED anode','D turns it on. Lowercase d turns it off.'],
    ['ESP32 GPIO26','220 Ω resistor → Hall LED anode','H turns it on. Lowercase h turns it off.'],
    ['Both LED cathodes','ESP32 GND','Shared return for the two low-voltage circuits.'],
    ['Computer USB','ESP32 Micro-B','Serial commands and reply at 115200 baud.'],
    ['Computer microphone','Local Python/Vosk console','One push-to-talk sample. The console sends a byte only if the complete phrase matches.'],
  ],
  test:'Speak each of the five supported phrases and compare the console transcript, serial reply and the two lamps. Say an unrelated phrase while one lamp is on. Confirm the lamp holds its state. Quit the console and check that both lamps switch off.',
  demo:['Microphone input','Exact phrase match','USB serial','Desk and hall outputs','Board acknowledgment'],
};
