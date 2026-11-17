import type { Build } from './guided-projects';

export const lightLimits={dark:320,day:420,glare:650,clear:530,rearmMs:900};
export type BeamState={dark:boolean;glare:boolean;elapsed:number;mode:'Off'|'Low'|'High'};
export const daytimeBeam:BeamState={dark:false,glare:false,elapsed:0,mode:'Off'};
export function headlightStep(previous:BeamState,ambient:number,front:number,manual:boolean,dt:number):BeamState{
  const {dark,day,glare,clear,rearmMs}=lightLimits;
  const isDark=ambient<=dark||ambient<day&&previous.dark;
  const hasGlare=front>=glare||front>clear&&previous.glare;
  const elapsed=isDark&&!hasGlare&&!manual?Math.min(rearmMs,previous.elapsed+dt):0;
  const mode=manual?'Low':!isDark?'Off':hasGlare||elapsed<rearmMs?'Low':'High';
  return {dark:isDark,glare:hasGlare,elapsed,mode};
}
export const smartHeadlights:Build={
  id:'directory-79',title:'Smart Vehicle Headlight Auto Switching',
  outcome:'Build a low-voltage model car that selects headlights using two light sensors. Watch it turn the beams off in daylight, dip for an oncoming light and return to high beam after the road clears.',
  parts:[
    ['Arduino Uno R3','1','Reads ambient and forward brightness and switches the four model LEDs.'],
    ['Pair of CdS photoresistors','2','Use one over the roof for ambient light and one in a forward-facing opaque hood.'],
    ['10 kΩ divider resistors','2','Make one voltage divider per photoresistor.'],
    ['Diffused white LEDs and 220 Ω resistors','4 of each','Use two labeled pairs for low and high beams, each LED with its own resistor and output.'],
    ['Momentary tactile start button','1','Hold to force the low-beam pair in any lighting condition.'],
    ['Cardboard model car and sensor hood','1 set','Make a light tabletop car body and an opaque hood. Keep the forward sensor out of the model LEDs’ direct light.'],
    ['Breadboard and jumper wires','1 set','Connects the two dividers, override button and LED circuits.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries readings to Serial Monitor.'],
  ],
  assembly:[
    ['Make the model road and car','Build a stationary model from card. Mark two LED positions per beam and fit one upward sensor and one forward sensor in an opaque hood.','You can illuminate either sensor with a desk lamp without directly shining into the other.',[1,3,5]],
    ['Wire both sensor dividers','With USB unplugged, connect each CdS element to 5 V and its own input. Add a 10 kΩ resistor from each input to ground.','Stronger illumination makes that input’s count rise.',[0,1,2,6]],
    ['Connect low and high beams','Connect each white LED to its own output through its own 220 Ω resistor. Put the low pair at D5/D6, high pair at D9/D10 and the override switch at D2.','All cathodes return to ground and every LED has a series resistor.',[0,3,4,6]],
    ['Check independent light readings','Upload and open Serial Monitor. Shade the roof sensor and then shine a lamp toward the hood. Log dark and light counts for both inputs before altering thresholds.','The two channels respond independently. The headlamps do not trigger their own forward sensor.',[0,1,3,7]],
    ['Run the beam sequence','Start in light, shade the roof, then flash the hood with a second lamp. Remove the second light, observe the recovery delay and test the override.','Glare switches high to low immediately. High returns after the forward reading stays clear for around 900 ms.',[0,1,3,4]],
  ],
  wiring:[
    ['CdS roof divider junction','Uno A0','CdS to 5 V, 10 kΩ to GND'],
    ['CdS forward divider junction','Uno A1','CdS to 5 V, 10 kΩ to GND'],
    ['Uno D5 and D6','Each → 220 Ω → low LED anode','One resistor per pin'],
    ['Uno D9 and D10','Each → 220 Ω → high LED anode','One resistor per pin'],
    ['All LED cathodes','Uno GND','Return paths'],
    ['Uno D2','Override switch → GND','Active-low manual dip'],
    ['Computer USB','Uno USB-B','Power, upload and diagnostics'],
  ],
  test:'Under bright ambient light, the beams stay off. Shade the roof and wait for high beam. Shine into the forward hood and confirm low beam. Remove the glare and verify the delay before high returns. Hold Override and confirm it forces low beam even in daylight.',
  demo:['Ambient and oncoming light','Daylight','High beam','Both pairs are off','Headlight mode follows the sensor readings'],
};
