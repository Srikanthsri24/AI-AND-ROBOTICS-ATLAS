/** Arduino map uses integer truncation toward zero, including negative products. */
export function displayRaw(room:number){return Math.ceil(180+Math.max(0,Math.min(100,room))*6.4);}
export function displayRelative(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.trunc((raw-dark)*100/(bright-dark))));}
export function displayNextLit(previous:boolean,ambient:number|null){if(ambient===null)return false;if(ambient<=37)return true;if(ambient>=47)return false;return previous;}
export function displayDuty(lit:boolean,ambient:number|null){if(!lit||ambient===null)return 0;return 220+Math.trunc(Math.min(ambient,37)*-140/37);}
/** Educational slow-motion PWM: 255 ticks per cycle, not the Uno's actual PWM frequency. */
export function displayPulse(duty:number,tick:number){return duty>0&&((Math.floor(tick)%255+255)%255)<Math.max(0,Math.min(255,duty));}
