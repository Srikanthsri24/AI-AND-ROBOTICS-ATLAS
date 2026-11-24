/** Adafruit Bluefruit UART Friend: Data = two flashes, CMD = three, then a three-second pause.
 * Flash on / between-flash times are illustrative; the documented count and pause are retained.
 * Sources: learn.adafruit.com/introducing-the-adafruit-bluefruit-le-uart-friend/data-mode
 * and /command-mode-1.
 */
export function bluefruitModeIndicator(powered:boolean,uart:boolean,milliseconds:number):boolean{if(!powered||!Number.isFinite(milliseconds)||milliseconds<0)return false;const flashes=uart?2:3,on=.12,stride=.24,end=(flashes-1)*stride+on,t=(milliseconds/1000)%(end+3);return t<end&&t%stride<on;}
