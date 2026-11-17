import type { Build } from './guided-projects';

export const scopePeriods=[2,4] as const;
export type ScopePeriod=typeof scopePeriods[number];
export const scopeSamples=128;
export const scopeSignals=[
  {name:'10 Hz square',frequency:10,shape:'square'},
  {name:'20 Hz sine',frequency:20,shape:'sine'},
  {name:'Adjustable DC',frequency:0,shape:'dc'},
] as const;
export type ScopeSignal=typeof scopeSignals[number];
export function sampleScope(source:ScopeSignal,period:ScopePeriod,volts:number,elapsed:number){
  return Array.from({length:scopeSamples},(_,i)=>{
    const phase=((elapsed+i*period)*source.frequency/1000)%1;
    const level=source.shape==='dc'?volts:source.shape==='sine'?2.5+2*Math.sin(2*Math.PI*phase):phase<.5?5:0;
    return Math.round(level*1023/5)*5/1023;
  });
}

export const wearableScope:Build={
  id:'directory-59',title:'Arduino Nano Wearable Oscilloscope',
  outcome:'Build a strap-mounted Arduino Nano and OLED that plots low-speed signals. Capture a 10 Hz square wave, change the time window and freeze the display to count cycles.',
  parts:[
    ['Classic Arduino Nano (5 V ATmega328P)','1','Generates a 10 Hz square wave on D9 and samples low-voltage signals on A0. Use the classic Nano with Mini-B USB.'],
    ['Adafruit 128×64 SSD1306 OLED','1','Displays 128 samples on a grid. Use the 5 V-ready PID 326 breakout in its I²C configuration.'],
    ['Momentary tactile start button','2','Label one TIME and the other HOLD. Both switch to ground when pressed.'],
    ['1 kΩ input series resistor','1','Connects the built-in test signal to the A0 input. Use the same resistor in series with the test potentiometer wiper.'],
    ['10 kΩ rotary test potentiometers','1','Optional bench source for an adjustable DC input derived from the same Nano supply.'],
    ['Insulated cardboard wrist mount','1','Use stiff card, a soft removable strap and insulated spacers. Make an access slot for USB and route leads away from the wrist.'],
    ['Breadboard and jumper wires','1 set','Prove the circuit on the breadboard before securing insulated links on the removable wrist mount.'],
    ['USB Mini-B data cable','1','Connects a computer for programming or a 5 V USB power bank for a short untethered demonstration.'],
    ['5 V USB power bank','1 optional','Use a bank that stays on with low-current devices. Keep it on the bench or in a pocket with a removable cable.'],
  ],
  assembly:[
    ['Set up the display on the bench','Seat the Nano on a breadboard. With USB unplugged, connect the OLED to 5 V and GND, SDA to A4 and SCL to A5. Use an insulated four-wire harness.','The display is wired for I²C and every connection matches the pin label.',[0,1,6]],
    ['Wire the two controls','Connect one side of TIME to D2 and one side of HOLD to D3. Connect the opposite side of each switch to ground. Use a meter to verify the contacts are open until pressed.','Both buttons switch their own pin to ground.',[0,2,6]],
    ['Connect the built-in signal','Put the 1 kΩ resistor between D9 and A0. Leave the optional potentiometer disconnected for the first test. Plug in USB and upload the sketch.','The trace oscillates between near zero and the USB-powered Nano supply.',[0,3,6,7]],
    ['Try the DC source','Unplug USB. Disconnect D9 from the resistor. Connect the potentiometer ends to Nano 5 V and GND. Connect its wiper to the series resistor leading to A0. Reconnect USB and turn the knob.','The flat trace moves vertically as the DC level changes.',[0,3,4,6]],
    ['Mount the watch','Disconnect power. Secure the display, Nano and buttons on insulated spacers. Hold the base on the soft strap so no pins or leads touch skin. Secure the USB cable with slack and a removable connection.','Both buttons are reachable and the completed module powers up properly on the bench before wearing.',[0,1,2,5,7,8]],
  ],
  wiring:[
    ['Nano 5 V / GND','OLED VIN / GND','Power for the 5 V-ready module'],
    ['Nano A4 / A5','OLED SDA / SCL','I²C data and clock'],
    ['Nano D2 / D3','TIME / HOLD switches','Other side of each switch goes to GND'],
    ['Nano D9','1 kΩ resistor → A0','Internal 10 Hz test input'],
    ['Optional pot wiper','1 kΩ resistor → A0, with D9 disconnected','Alternate DC source'],
    ['Nano 5 V / GND','Optional pot outer pins','Sets the safe DC adjustment range'],
    ['Computer or USB bank','Nano Mini-B USB','5 V USB power'],
  ],
  test:'At 2 ms/sample the 10 Hz square wave shows about 2½ periods across the screen. At 4 ms/sample it shows about five. Press HOLD to freeze the last completed frame, then press it again to resume. With the optional potentiometer, its position moves a flat trace up or down.',
  demo:['Low-frequency test signal','Hold','Live','The trace is frozen','A new trace appears as the source changes'],
};
