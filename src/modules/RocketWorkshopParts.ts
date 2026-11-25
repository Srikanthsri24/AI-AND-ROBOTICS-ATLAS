import {rocketBottleParts} from './RocketBottleParts';
import {rocketStandParts} from './RocketStandParts';
import {rocketFieldParts} from './RocketFieldParts';
export type RocketPart={id:string;name:string;description:string;connection:string;stage:number};
const stage:Record<string,number>={'stand-base':1,'base-fasteners':1,'pivot-supports':2,'pivot-bushes':2,'pivot-shaft':2,'rocket-body':4,'rocket-neck':4,'rocket-nose':5,'rocket-band':5,'rocket-cap':5,'tracking-dot':5,'datum-receiver':7};
export const rocketWorkshopParts:RocketPart[]=[...rocketFieldParts,...rocketStandParts,...rocketBottleParts].map(([id,name,description,connection])=>({id,name,description,connection,stage:stage[id]??(rocketFieldParts.some(p=>p[0]===id)?0:3)}));
