/** Authored millimetre-scale teaching geometry, not flight-qualified CubeSat CAD. */
export type CubeSatPoint=[number,number,number];
export const cubeSatRails=[{x:-46,z:-46,rotation:0},{x:-46,z:46,rotation:Math.PI/2},{x:46,z:46,rotation:Math.PI},{x:46,z:-46,rotation:Math.PI*1.5}] as const;
export const cubeSatSolarMounts=[-1,1].map(side=>({side,x:side*45,z:35,axisX:side*52}));
export const cubeSatAntennaMounts=[-7,7].map(x=>({x,z:-45}));
export const cubeSatDeckMounts=[-43,43].flatMap(x=>[-43,43].map(z=>({x,z})));
export const cubeSatScrewAxes=[[-48.25,-48.25],[-48.25,48.25],[48.25,48.25],[48.25,-48.25]] as const;
export const cubeSatChassisParts=[
 ['cubesat-bench','Spacecraft inspection bench','A dry tabletop supports the spacecraft assembly before switching to the virtual imaging-pass view.','The bench is a teaching aid, not a deployed spacecraft component.'],
 ['cubesat-stand','Open service cradle','A hollow support tube and single cross-shaped cradle contact the lower frame at four edges.','The cradle holds the bus for assembly. The spacecraft leaves this stand in the mission view; the stand does not travel around Earth.'],
 ...cubeSatRails.map((_,i)=>[`cubesat-rail-${i+1}`,`Bus corner rail ${i+1}`,'An L-shaped metal rail leaves the bus interior open and contains a real axial fastener bore.','The upper and lower frame holes align with this bore. This member supports the camera and electronics model; it is not a radio antenna.']),
 ['cubesat-bottom-frame','Lower open bus frame','A thin open frame seats on the service cradle and joins the four corner rails.','Four corner bores share the rail axes; four additional holes retain the payload deck. Two outer bores retain the solar-hinge ears, leaving the centre open.'],
 ['cubesat-top-frame','Upper open bus frame','The second open frame closes the rail assembly without filling its central inspection aperture.','Fit the payload stack before closing this frame. Two small holes retain the antenna foot; the separate central bore clears its feed-through. The solar-hinge ears use their own outer mounting bores.'],
 ['cubesat-bottom-fasteners','Four lower retaining screws','Four individual metal shafts pass through the lower frame and into the corner bores.','These retain the rails mechanically. The onboard buffer and radio link are separate mission functions.'],
 ['cubesat-top-fasteners','Four upper retaining screws','The upper screw shafts share the same physical axes as the rail bores and frame holes.','Remove the upper fasteners before lifting the top frame for an unpowered inspection. This is virtual classroom assembly, not launch-hardware instruction.'],
];
