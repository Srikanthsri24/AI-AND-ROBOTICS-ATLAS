import {cubeSatSolarAngle,cubeSatSolarWorld} from './cubesat-solar';
import type {CubeSatPoint} from './cubesat-chassis';
export const cubeSatSolarInputs=[{side:-1,x:-24,y:113.6,z:-28},{side:1,x:-15,y:113.6,z:-28}] as const;
export function cubeSatPanelPowerPose(side:number,deployment:number){const a=cubeSatSolarAngle(side,deployment);return{at:cubeSatSolarWorld(side,deployment,[side*4.5,0,-3.8]),out:[-Math.sin(a),0,-Math.cos(a)] as CubeSatPoint,lane:[0,1,0] as CubeSatPoint};}
export const cubeSatSolarPowerParts=[
 ['cubesat-solar-regulator','Illustrative solar-input conditioner','A separate support package and contact pads sit beside the two panel-input connectors.','This represents collected power entering the spacecraft electronics. The Python mission does not model cell current, battery charge or power-based capture permission.'],
 ...cubeSatSolarInputs.flatMap(m=>{const key=m.side<0?'left':'right',name=m.side<0?'Left':'Right';return[
 [`cubesat-solar-${key}-port`,name+' panel · isolated output connector','Two separate pins pass through real insulated frame/backing holes into the open rear shroud. White pad insulators separate the front terminations from the metal frame.','This is an illustrative integrated-panel output. Detailed inter-cell circuitry and real product pin assignments are outside the mission model.'],
 [`cubesat-solar-${key}-input`,name+' panel · two-contact board input','An open two-pin connector occupies its own separate location on the upper board.','Its assigned panel harness connects here. The two panels do not silently share a physical pin or mating socket.'],
 [`cubesat-solar-${key}-lead`,name+' panel · flexible paired lead','Two individually insulated conductors follow the moving panel connector through a fixed side service route.','The panel end moves with the wing. The board end stays seated while the cables flex clear of the circuit boards, frame and other harnesses.'],
 [`cubesat-solar-${key}-panel-plug`,name+' panel · moving mating plug','Two open female cells and separate contact leaves receive the rotating panel-output pins.','The plug rotates with the panel and its cable starts at the actual strain-cap exit. It does not remain floating in its original position.'],
 [`cubesat-solar-${key}-board-plug`,name+' panel · board mating plug','A second independent two-contact plug receives this panel’s board-input pins.','The plug stays on the board during wing deployment. Its two real contact cavities match this connector’s separate pins.'],
 ];}),
];
