import type { Build } from './guided-projects';
export const lampLevels=[0,85,170,255] as const;
export const gestureWindow=650;
export type SwipeState={level:number;first:'Left'|'Right'|null;started:number;armed:boolean;clearAt:number|null;notice:string};
export const initialSwipe:SwipeState={level:0,first:null,started:0,armed:true,clearAt:null,notice:'Ready for a swipe'};
export function swipeStep(s:SwipeState,left:boolean,right:boolean,now:number):SwipeState{
  if(!s.armed){
    if(left||right)return s.clearAt===null?s:{...s,clearAt:null};
    const clearAt=s.clearAt??now;
    if(now-clearAt>=70)return {...s,armed:true,first:null,clearAt:null};
    return clearAt===s.clearAt?s:{...s,clearAt};
  }
  if(!s.first){
    if(left&&right)return {...s,armed:false,notice:'Both beams broke together · No change'};
    return left||right?{...s,first:left?'Left':'Right',started:now,notice:`${left?'Left':'Right'} beam first`}:s;
  }
  if(now-s.started>gestureWindow)return {...s,first:null,armed:false,notice:'Swipe timed out · No change'};
  if(s.first==='Left'?right:left){
    const brighter=s.first==='Left';
    return {...s,level:Math.max(0,Math.min(3,s.level+(brighter?1:-1))),first:null,armed:false,
      notice:brighter?'Left → right · Brighter':'Right → left · Dimmer'};
  }
  return s;
}
export const gestureLamp:Build={
  id:'directory-80',title:'Contactless Gesture-Controlled Study Lamp',
  outcome:'Build a USB-powered desk lamp that detects the order of two beam interruptions. Swipe left to right to brighten it and swipe back to dim it.',
  parts:[
    ['Arduino Uno R3','1','Times the two beam interruptions and applies one of four brightness settings.'],
    ['3 mm IR break-beam pair','2 pairs','Put two emitter/receiver pairs side by side to make a short swipe gate.'],
    ['Diffused white LEDs and 220 Ω resistors','3 of each','Use one resistor and one PWM output per LED. Mount the LEDs behind a translucent diffuser.'],
    ['Cardboard lamp shade and swipe gate','1 set','Make a stable small lamp housing and two parallel beam paths using stiff card.'],
    ['Breadboard and jumper wires','1 set','Routes power, receiver signals and the LED circuits.'],
    ['USB-A to USB-B data cable','1','Powers the controller and supplies diagnostics.'],
  ],
  assembly:[
    ['Set up the swipe gate','Mount the emitters on one side and their matching receivers opposite. Separate the two beams by about 4 cm across the swipe direction. Use a short, even gap and orient both pairs level. If a receiver sees the neighboring emitter, add short opaque sleeves and align again.','One hand or card can cross both paths without touching the frame.',[1,3]],
    ['Wire and align the receivers','With USB off, wire both pairs to 5 V and ground, then connect the receiver signal leads to D2 and D3. Apply power and observe each signal while passing a card through one beam at a time.','The Serial Monitor identifies the first beam on either side.',[0,1,4,5]],
    ['Build the light head','Fit three LEDs behind a paper diffuser with room for the leads and resistors. Wire each anode through 220 Ω and each cathode to ground.','Each LED has a separate PWM pin and series resistor.',[0,2,3,4]],
    ['Upload and test directions','Open Serial Monitor at 115200 baud, clear both beams and swipe left to right within 650 ms. Swipe right to left to step down.','Brightness changes by one step, then the lamp waits for both beams to clear.',[0,1,2,5]],
    ['Check gestures that should be ignored','Block only one beam, then wait. Clear both beams before the next trial. Use a broad card to cross both at once and compare the result.','An incomplete or simultaneous break leaves the level unchanged.',[0,1,2,3]],
  ],
  wiring:[
    ['Uno 5 V / GND','All emitter and receiver supply leads','Common supply'],
    ['Left receiver signal','Uno D2','Internal pull-up, LOW means beam broken'],
    ['Right receiver signal','Uno D3','Internal pull-up, LOW means beam broken'],
    ['Uno D5 / D6 / D9','Each → 220 Ω resistor → LED anode','Independent PWM outputs'],
    ['All LED cathodes','Uno GND','LED returns'],
    ['Computer USB','Uno USB-B','Power, upload and diagnostics'],
  ],
  test:'A left-to-right swipe moves from off to low, medium and high. A right-to-left swipe decreases by one. Leave one beam blocked longer than 650 ms and try blocking both together. In both cases, brightness should stay the same. Clear both beams for at least 70 ms to rearm.',
  demo:['Two-beam swipe order','Idle','Brighter','The level stays fixed','The PWM duty rises by one step'],
};
