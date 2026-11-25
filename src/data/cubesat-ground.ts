import type {CubeSatPoint} from './cubesat-chassis';
/** Native millimetres. A tabletop teaching station, not a dimensioned flight RF design. */
export const cubeSatDish={vertex:[180,55,-55] as CubeSatPoint,axis:[0,.6,-.8] as CubeSatPoint,radius:32,focalLength:18,thickness:.8};
export function cubeSatDishDepth(radius:number){return radius*radius/(4*cubeSatDish.focalLength);}
export function cubeSatDishWorld(p:CubeSatPoint):CubeSatPoint{return[180+p[0],55-.8*p[1]+.6*p[2],-55-.6*p[1]-.8*p[2]];}
export const cubeSatStationParts=[
 ['cubesat-station-base','Ground station · weighted base','A separate metal foot rests on the workbench and supports the receiving dish.','Four rubber pads isolate the base from the bench; the central mast transfers the dish load into this foot.'],
 ['cubesat-station-feet','Ground station · four rubber feet','Four separate dark pads contact the bench under the metal base.','These support the tabletop teaching station. They are not electrical contacts.'],
 ['cubesat-station-mast','Ground station · support mast','A hollow upright tube rises from the base to the dish support.','The rear saddle connects the mast to the reflector; the signal travels through the separate coaxial cable.'],
 ['cubesat-station-saddle','Ground station · rear saddle','A shaped bracket meets the back of the reflector and the top of its mast.','It carries the dish mechanically while keeping the receiving surface unobstructed.'],
 ['cubesat-station-dish','Ground station · parabolic reflector','A genuinely curved thin shell has a concave front and a separate rear surface.','Its shape illustrates concentrating an incoming radio wave toward the feed. It is not an orbital contact or link-budget solver.'],
 ['cubesat-station-rim','Ground station · reflector rim','A continuous raised rim follows the outer edge of the dish.','It stiffens the reflector and receives the three welded feed-support arms.'],
 ['cubesat-station-struts','Ground station · three feed struts','Three separate metal rods hold the feed above the reflector.','The rods run from the outer rim to the feed collar and stay clear of the curved receiving surface.'],
 ['cubesat-station-horn','Ground station · open feed horn','An open flared mouth faces the dish, narrowing into a hollow throat.','The feed represents receiving the concentrated signal near the focus before the coax carries it to the receiver.'],
 ['cubesat-station-feed-case','Ground station · feed rear housing','A separate rear cap and mounting collar hold the feed assembly.','The support rods join its collar; the cable plugs into the rear-facing coax socket.'],
 ['cubesat-station-feed-socket','Ground station · feed coax socket','A metal annulus surrounds a separate dielectric and centre contact.','The mating feed plug fits over this socket without filling the horn opening.'],
 ['cubesat-station-feed-plug','Ground station · feed mating plug','A separate coax plug has concentric metal, insulating and centre-contact layers.','Its cable exits behind the feed and routes outside the dish before descending to the receiver.'],
 ['cubesat-station-cable','Ground station · shielded receive cable','A continuous insulated cable follows the feed exit, the side service loop and receiver input.','This is the station-side RF path. The spacecraft downlink itself remains the guide’s authored 35–85° E contact window.'],
 ['cubesat-station-receiver','Ground station · receiver enclosure','A rear panel, side walls and open front bezel form the receiver case.','The screen and controls are separate components. An opaque box does not cover the display.'],
 ['cubesat-station-receiver-feet','Ground station · receiver feet','Four short rubber pads support the display enclosure.','They meet the case underside and keep the metal body above the bench.'],
 ['cubesat-station-input','Ground station · receiver RF input','A separate side-facing coax socket enters the receiver enclosure.','The cable’s second mating plug connects here; it does not terminate inside an unlabelled solid wall.'],
 ['cubesat-station-input-plug','Ground station · receiver mating plug','A second independent coax plug meets the receiver input.','Its axis faces outward from the right case wall; the strain relief joins the actual cable end.'],
 ['cubesat-station-display','Ground station · received-image screen','A separate inset screen shows the supplied downlinked image texture.','The completed mission will supply a retained frame after an accepted downlink. The screen must not silently substitute the changing live camera.'],
 ['cubesat-station-controls','Ground station · receiver controls','Three separate tactile keys sit below the display.','They represent local receiver controls. Student mission actions belong to the accessible workshop interface.'],
 ['cubesat-station-indicator','Ground station · reception indicator','A separate status lens glows during an accepted receive event.','This teaching pulse reports the mission controller’s successful downlink; dish orientation does not invent another permission rule.'],
];
