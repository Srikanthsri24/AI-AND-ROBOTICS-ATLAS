import layout from './ds3231-rtc-layout.json';
/** Pin names follow Adafruit's legacy breakout guide. The Eagle supply net is
 * named 3.3V, but the exposed VIN accepts the Uno's matching 5 V logic supply.
 * https://learn.adafruit.com/adafruit-ds3231-precision-rtc-breakout/pinouts */
const names=['VIN','GND','SCL','SDA','BAT','32K','SQW','RST'] as const;
const jobs=[
 ['RTC main supply','Connect to the Uno 5 V rail in this build. The board pull-ups use the same supply.'],
 ['Common ground','Join Uno GND, display GND and the sounder return.'],
 ['I²C clock','Connect to Uno A5/SCL and the display SCL line.'],
 ['I²C data','Connect to Uno A4/SDA and the display SDA line.'],
 ['Backup battery positive','Connected to the coin-cell positive terminal. Leave this header pin unwired in the school-bell build.'],
 ['32 kHz output','Optional clock output. This project does not use it.'],
 ['Alarm / square-wave output','Optional output. The sketch checks the calendar over I²C instead, so leave it unwired.'],
 ['RTC reset indication','Not the Uno RESET input. Leave it unwired for this project.'],
];
export const schoolBellRtcPins=layout.pads.filter(p=>p.element==='JP1').map((p,n)=>({...p,id:'school-rtc-pin-'+names[n].toLowerCase(),label:names[n],what:jobs[n][0],connection:jobs[n][1]}));
export const schoolBellRtcHeader={housingBottom:-2.54,housingTop:0,pinBottom:-8.54,pinTop:3.3} as const;
