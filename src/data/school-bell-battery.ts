/** CR1220 nominal size: Panasonic 12.5 × 2.0 mm. Holder XY follows the
 * Adafruit B1 footprint; stamped-metal depth and spring shape are authored.
 * https://energy.panasonic.com/ap/business/products/lithium/coin-cr-standard/models/CR1220
 * https://learn.adafruit.com/adafruit-ds3231-precision-rtc-breakout/assembly */
export const schoolBellBatteryGeometry={radius:6.25,thickness:2,centre:[11.43,-1.9,-10.668] as const,travel:18,clipBottom:-3.15,clipTop:-2.95};
export function schoolBellBatteryCentre(insertion:number):readonly[number,number,number]{const d=schoolBellBatteryGeometry,t=Math.max(0,Math.min(1,insertion));return [d.centre[0],d.centre[1],d.centre[2]-(1-t)*d.travel];}
export const schoolBellBatteryParts=[
 {id:'school-rtc-battery-clip',label:'Positive retaining clip',what:'The stamped metal clip holds the coin cell and contacts its positive case.',connection:'Its two solder feet join the RTC backup-positive net. Insert the cell from the open side, with its + face visible. The clip does not charge the cell.'},
 {id:'school-rtc-battery-negative',label:'Negative battery contact',what:'A spring contact touches the smaller negative face toward the circuit board.',connection:'Connects the negative face of the CR1220 to RTC ground. The insulating seal around the cell separates this face from the positive case.'},
 {id:'school-rtc-battery',label:'CR1220 · 3 V backup cell',what:'Keeps the RTC calendar running when the Uno USB supply is disconnected.',connection:'Positive face points away from the board, into the retaining clip. This cell backs up the RTC only: it does not power the Uno, display or sounder.'},
] as const;
