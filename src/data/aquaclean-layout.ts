/** Authored tabletop dimensions in mm; not manufacturing CAD. */
export const aquaPhysical={trayLength:500,trayWidth:180,floorY:8,rimY:105,waterY:28,paddle:{x:-35,y:145,radius:120,width:90,shaftZ:130},ramp:{slope:-.07,radialClearance:3,endX:135,width:100},basket:{left:135,right:215,width:100,height:100}} as const;
export const aquaRampStart={x:87,y:120};
export const aquaRampEnd={x:aquaPhysical.ramp.endX,y:aquaRampStart.y+(aquaPhysical.ramp.endX-aquaRampStart.x)*aquaPhysical.ramp.slope};
export const aquaRampLength=Math.hypot(aquaRampEnd.x-aquaRampStart.x,aquaRampEnd.y-aquaRampStart.y);
export const aquaBasketFloor=30;
export const aquaFollowerBase=aquaBasketFloor+.7;
export const aquaMechanicalParts=[
 ['aqua-tray','Clear river tray','Contains the shallow tabletop water and floating foam chips.','The ramp and basket return drained water to this tray.'],
 ['aqua-water','Shallow model water','Shows the collection surface. Flow speed is an authored visual illustration.','Flexible paddle tips dip below the illustrated waterline; the motor stays dry.'],
 ['aqua-ramp','Collection ramp','Guides lifted lightweight foam chips towards the basket. Its short descending surface stays outside the checked paddle envelope.','The upper edge meets the basket inlet. The paddle lifts model chips to the raised inlet; gravity carries them down the ramp.'],
 ['aqua-ramp-supports','Ramp support legs','Hold the descending ramp above the basket floor.','Four feet stand on the tray floor outside the rotating blade width.'],
 ['aqua-ramp-rails','Ramp side guides','Keep model scraps within the ramp width.','Stand outside the paddle blade width and continue to the basket inlet.'],
 ['aqua-basket','Draining mesh basket','Holds collected model litter while leaving visible drainage openings.','The ramp feeds above the full target height; the lower mesh floor drains into the tray below.'],
 ['aqua-basket-legs','Basket support legs','Keep the collection floor aligned with the top of the ramp.','Stand on the tray floor, outside the open drainage area.'],
 ['aqua-paddle-hub','Paddle shaft and hub','Transfers geared motor rotation to four lightweight flexible strips.','The hub shaft passes through the two dry side bearings.'],
 ['aqua-paddle-strips','Four skimming strips','Dip into the shallow surface and sweep scraps towards the ramp.','Their checked circular envelope clears the rigid ramp and side guides.'],
 ['aqua-paddle-support','Dry bearing supports','Hold the shaft above the water on both sides of the tray.','Bearing centres align with the shaft axis; the motor mounts outside the wet tray.'],
] as const;

export const aquaMotorLayout={axis:[-35,145] as const,paddleEndZ:130,couplerStartZ:118,couplerEndZ:134,motorShaftStartZ:130,caseFrontZ:134,caseBackZ:156,mountX:[-73,-43] as const,mountZ:160,bracketTopY:131};
export const aquaMotorParts=[
 ['aqua-drive-case','Yellow geared-motor housing','An authored educational gearmotor housing illustrates the reduction unit, with a real opening for its output shaft. This is not manufacturer CAD.','Its output axis aligns with the paddle shaft through the stepped coupling.'],
 ['aqua-drive-can','DC motor can and end cap','The small brushed motor supplies motion through the gearbox. The illustrated can dimensions are authored.','Two external terminals will connect to the TB6612 A outputs, powered by the separate AA pack.'],
 ['aqua-drive-shaft','Geared output shaft','Carries the reduced-speed drive out of the housing.','Its 3 mm shaft seats inside the smaller coupling bore.'],
 ['aqua-drive-coupler','Stepped shaft coupling','Joins the 5 mm paddle shaft to the 3 mm geared output with separately sized real bores.','The paddle and motor shafts meet at the coupling step; two radial set screws secure them.'],
 ['aqua-drive-screws','Coupling set screws','Illustrated radial screws clamp each of the two shaft diameters.','Rotate with the coupling. Turn both sources off before adjustment.'],
 ['aqua-drive-bracket','Dry motor mounting stand','Holds the gearbox outside the water tray and aligns its output with both paddle bearings.','Two bolts seat through the mounting ears into its matching bracket holes.'],
 ['aqua-drive-bolts','Gearbox mounting bolts','Secure both housing ears on the dry mounting shelf.','Pass through the two real matching ear / shelf holes.'],
] as const;

export const aquaSensorLayout={x:187,frontY:aquaFollowerBase+200,boardY:aquaFollowerBase+214,postX:230,postZ:-120,guideX:212,guideZ:56,guideHeight:165,cardWidth:44,cardLength:78} as const;
/** Target top is the echo datum. Normal collection uses 100–200 mm gaps;
 * closer positions represent a manually raised dry test card, not basket volume.
 */
export function aquaFollowerPose(gapMm:number){if(!Number.isFinite(gapMm)||gapMm<50||gapMm>200)throw Error('Follower fixture accepts gaps 50–200 mm.');return{x:aquaSensorLayout.x,y:aquaSensorLayout.frontY-gapMm,z:0,heightMm:200-gapMm,dryTest:gapMm<100};}
export const aquaSensorParts=[
 ['aqua-sensor-stand','Dry basket sensor stand','Holds the module over a target near the back of the basket, clear of the incoming ramp.','A weighted dry foot, upright and two cantilever arms support the drilled mounting plate.'],
 ['aqua-sensor-mount','Insulated sensor mounting plate','Four drilled holes and insulating sleeves align with the actual board holes.','The screws secure the board without bonding its circuitry to the stand.'],
 ['aqua-follower-card','Flat basket follower card','Provides the ideal ultrasonic reflecting surface above the collected model litter.','Its upper face is 200 mm below the sensor datum when empty, and 115 mm below it at the full threshold.'],
 ['aqua-follower-guides','Follower guide rails','Keep the lightweight card level while model scraps raise it. Motion and echoes are illustrative.','The two rails sit outside the basket mesh, away from the inlet. A lower mounting crossbar joins each to the basket frame.'],
 ['aqua-follower-caps','Removable guide-rail caps','Retain the follower sleeves after they have been lowered over the bare rods.','Fit the caps last; the sleeves cannot pass over the wider caps.'],
 ['aqua-follower-carrier','Follower sliding carriers','Two bored sleeves slide along the guide rails and carry the flat card.','The arms grip the card edges outside the central echo area and move with the target. Their raised position clears the mesh floor.'],
] as const;
