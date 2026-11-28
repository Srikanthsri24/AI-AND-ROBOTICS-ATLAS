const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
/** Power-isolated service sequence after both bare outputs have returned to A.
 * Support the frame by hand while its two clamps are removed. */
export const pickJawFittingPhases=[
 {until:.15,title:'Release the two frame clamps',instruction:'Keep USB, servo and wheel sources OFF. Support the jaw-servo frame. Raise each pressure screw, then slide both forked clamps clear of the fixed feet.'},
 {until:.35,title:'Raise the supported servo frame',instruction:'Lift the servo, bracket and ear fasteners together by 24 mm. Keep the rack guides and pinion still. Let the attached cable pay out its service bow; do not pull its CH1 plug.'},
 {until:.5,title:'Bring the hub into the open space',instruction:'With the frame supported, bring the compact hub sideways above the pinion. The splined socket faces upward toward the servo; the small screw passage faces down.'},
 {until:.6,title:'Seat the hub on the pinion',instruction:'Lower the hub straight onto the pinion’s annular face. Keep its axis aligned with the pinion bore. Do not turn the calibrated servo shaft.'},
 {until:.8,title:'Lower the spline into the hub',instruction:'Lower the complete frame straight down. Align the indexed servo spline with the hub socket without forcing it. The output face seats on the hub’s internal shoulder.'},
 {until:.9,title:'Secure the frame again',instruction:'Slide both forked clamps over the fixed guide/frame feet with their screw tips raised. Lower the pressure screws only after the clamps are seated.'},
 {until:1,title:'Fit the axial retaining screw',instruction:'Insert the retaining screw from beneath the pinion through its bore and the hub’s small passage into the output. Its head seats against the pinion. Keep every source OFF; powered testing comes later.'},
]as const;
export function pickJawFittingPose(progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Invalid jaw coupling fitting position');
 const phase=(a:number,b:number)=>ease((progress-a)/(b-a));
 const released=phase(.03,.15)*(1-phase(.8,.87));
 const screwRaised=phase(0,.03)*(1-phase(.87,.9));
 return{frameLift:24*phase(.15,.35)*(1-phase(.6,.8)),clampX:15*released,clampScrewLift:.8*screwRaised,hubVisible:progress>=.35,hubOffset:[60*(1-phase(.35,.5)),15.6*(1-phase(.5,.6)),0]as const,retainerVisible:progress>=.9,retainerOffset:-14.5*(1-phase(.9,1)),phase:Math.min(pickJawFittingPhases.length-1,pickJawFittingPhases.findIndex(p=>progress<=p.until))};
}
