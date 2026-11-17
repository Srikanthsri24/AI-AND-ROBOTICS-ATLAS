import { esp32Car } from './esp32-car';
import type { Build } from './guided-projects';

export const voicePulse = 850;
export const voiceCommands = [
  {word:'forward',letter:'F',left:1,right:1},
  {word:'reverse',letter:'B',left:-1,right:-1},
  {word:'left',letter:'L',left:-1,right:1},
  {word:'right',letter:'R',left:1,right:-1},
  {word:'stop',letter:'S',left:0,right:0},
] as const;
export type VoiceCommand = typeof voiceCommands[number];
export const voiceStop = voiceCommands[4];
export function resolveVoiceCommand(text:string){
  const words=text.trim().toLowerCase().replace(/[.!?]+$/,'').split(/\s+/);
  if(words.length!==2||words[0]!=='rover')return undefined;
  return voiceCommands.find(({word})=>word===words[1]);
}

export const voiceRover: Build = {
  id:'directory-86',
  title:'Voice Controlled Robotic Vehicle',
  outcome:'Build a rover that takes five spoken instructions from a computer microphone. Follow one command from the spoken phrase to a serial letter and the two wheel directions. Each movement expires automatically.',
  parts:[
    ['ESP32-DevKitC V4 (ESP32-WROOM-32E)','1','Receives one letter over USB serial or Bluetooth Classic, drives the motor pins and times the pulse.'],
    ...esp32Car.parts.slice(1),
    ['USB Micro-B data cable','1','Connect the computer to the controller for firmware upload and for the wired voice trial.'],
    ['Computer with microphone','1','Runs the local Vosk recognizer and sends one serial byte for each accepted command. A headset microphone also works.'],
  ],
  assembly:[
    ['Assemble the drivetrain','Fit two geared motors on opposite sides, put the caster at the rear, and label the left and right leads. Leave enough space to reach the motor battery switch.','Turn each wheel by hand and check it clears the frame and all wires.',[3,4,5]],
    ['Fit the ESP32 and wire the driver','Mount the ESP32 with its antenna clear of the battery and metal. Connect logic power, the speed pins and direction pins. Fit the standby pull-down before connecting motor power.','When the ESP32 is off or booting, the pull-down holds the TB6612FNG in standby.',[0,1,2,6]],
    ['Wire the two power paths','With both supplies off, connect each motor to its own output channel. Connect the switched 4×AA pack to VM and common ground. Choose USB for the initial wheel-stand test.','The controller and motors use separate positive rails. All low-voltage module grounds share the same reference.',[0,2,3,5,7,8]],
    ['Connect the microphone and select the link','Start with GPIO27 open for the USB bench test. For a wireless trial, power off, fit a jumper from GPIO27 to ground, and pair the computer with Atlas-Voice-Rover. Choose the outgoing Bluetooth serial port in the Python program.','The microphone is selected on the computer. It sends letters through only the selected controller link.',[0,6,7,8,9]],
    ['Check each spoken command on a stand','Upload with motor power off. Lift both wheels before enabling the AA pack. Say rover forward, rover reverse, rover left, rover right and rover stop. Leave a short pause between complete phrases.','Each accepted phrase maps to one letter. The wheels stop after 850 ms, on Stop, or on an invalid serial byte.',[0,2,3,5,9]],
  ],
  wiring:esp32Car.wiring.map(([from,to,note])=>from==='GPIO27'
    ?[from,'Open for USB serial / GND for Bluetooth Classic SPP','Read once at boot. Power off first.']
    :[from,to,note]),
  test:'On a stand, check both wheel directions for all five commands. Say an unrelated phrase and verify that it does not start the rover. Try Stop during Forward and check that the driver cuts off. Send one Forward, disconnect the link and verify that the wheels stop no later than the end of the 850 ms pulse.',
  demo:['Speech transcript','Waiting for a phrase','Command accepted','Standby','Pulse expires automatically'],
};
