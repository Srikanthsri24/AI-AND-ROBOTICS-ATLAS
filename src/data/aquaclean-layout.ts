/** Authored tabletop dimensions in mm; not manufacturing CAD. */
export const aquaPhysical={trayLength:500,trayWidth:180,floorY:8,rimY:105,waterY:28,paddle:{x:-35,y:70,radius:45,width:90,shaftZ:130},ramp:{slope:.5,radialClearance:3,endX:135,width:100},basket:{left:135,right:215,width:100,height:55}} as const;
const a=Math.atan(aquaPhysical.ramp.slope),r=aquaPhysical.paddle.radius+aquaPhysical.ramp.radialClearance;
export const aquaRampStart={x:aquaPhysical.paddle.x+r*Math.sin(a),y:aquaPhysical.paddle.y-r*Math.cos(a)};
export const aquaRampEnd={x:aquaPhysical.ramp.endX,y:aquaRampStart.y+(aquaPhysical.ramp.endX-aquaRampStart.x)*aquaPhysical.ramp.slope};
export const aquaRampLength=Math.hypot(aquaRampEnd.x-aquaRampStart.x,aquaRampEnd.y-aquaRampStart.y);
export const aquaBasketFloor=aquaRampEnd.y;
export const aquaMechanicalParts=[
 ['aqua-tray','Clear river tray','Contains the shallow tabletop water and floating foam chips.','The ramp and basket return drained water to this tray.'],
 ['aqua-water','Shallow model water','Shows the collection surface. Flow speed is an authored visual illustration.','Flexible paddle tips dip below the illustrated waterline; the motor stays dry.'],
 ['aqua-ramp','Collection ramp','Guides lifted lightweight foam chips towards the basket. Its surface is tangent to the checked paddle envelope with 3 mm clearance.','The upper edge meets the basket inlet. Six-millimetre model chips bridge the illustrated pickup clearance.'],
 ['aqua-ramp-rails','Ramp side guides','Keep model scraps within the ramp width.','Stand outside the paddle blade width and continue to the basket inlet.'],
 ['aqua-basket','Draining mesh basket','Holds collected model litter while leaving visible drainage openings.','Its inlet aligns with the ramp; the open mesh floor drains into the tray below.'],
 ['aqua-basket-legs','Basket support legs','Keep the collection floor aligned with the top of the ramp.','Stand on the tray floor, outside the open drainage area.'],
 ['aqua-paddle-hub','Paddle shaft and hub','Transfers geared motor rotation to four lightweight flexible strips.','The hub shaft passes through the two dry side bearings.'],
 ['aqua-paddle-strips','Four skimming strips','Dip into the shallow surface and sweep scraps towards the ramp.','Their checked circular envelope clears the rigid ramp and side guides.'],
 ['aqua-paddle-support','Dry bearing supports','Hold the shaft above the water on both sides of the tray.','Bearing centres align with the shaft axis; the motor mounts outside the wet tray.'],
] as const;

export const aquaMotorLayout={axis:[-35,70] as const,paddleEndZ:130,couplerStartZ:118,couplerEndZ:134,motorShaftStartZ:130,caseFrontZ:134,caseBackZ:156,mountX:[-73,-43] as const,mountZ:160,bracketTopY:56};
export const aquaMotorParts=[
 ['aqua-drive-case','Yellow geared-motor housing','An authored educational gearmotor housing illustrates the reduction unit, with a real opening for its output shaft. This is not manufacturer CAD.','Its output axis aligns with the paddle shaft through the stepped coupling.'],
 ['aqua-drive-can','DC motor can and end cap','The small brushed motor supplies motion through the gearbox. The illustrated can dimensions are authored.','Two external terminals will connect to the TB6612 A outputs, powered by the separate AA pack.'],
 ['aqua-drive-shaft','Geared output shaft','Carries the reduced-speed drive out of the housing.','Its 3 mm shaft seats inside the smaller coupling bore.'],
 ['aqua-drive-coupler','Stepped shaft coupling','Joins the 5 mm paddle shaft to the 3 mm geared output with separately sized real bores.','The paddle and motor shafts meet at the coupling step; two radial set screws secure them.'],
 ['aqua-drive-screws','Coupling set screws','Illustrated radial screws clamp each of the two shaft diameters.','Rotate with the coupling. Turn both sources off before adjustment.'],
 ['aqua-drive-bracket','Dry motor mounting stand','Holds the gearbox outside the water tray and aligns its output with both paddle bearings.','Two bolts seat through the mounting ears into its matching bracket holes.'],
 ['aqua-drive-bolts','Gearbox mounting bolts','Secure both housing ears on the dry mounting shelf.','Pass through the two real matching ear / shelf holes.'],
] as const;
