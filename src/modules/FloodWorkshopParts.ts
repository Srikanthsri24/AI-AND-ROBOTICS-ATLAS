import {floodBasinParts,floodSonarParts}from'../data/flood-workshop-layout';
import {floodPanelParts}from'../data/flood-panel-layout';
import {floodNeighbourhoodParts}from'../data/flood-neighbourhood';
import {floodControllerParts}from'../data/flood-controller';
import {floodUnoParts,floodWires}from'../data/flood-wiring';
import {floodPartStage}from'../data/flood-assembly';
export type FloodWorkshopPart={id:string;name:string;description:string;connection:string;stage:number};
const rows=[...floodBasinParts,...floodSonarParts,...floodPanelParts,...floodNeighbourhoodParts,...floodControllerParts,...floodUnoParts];
export const floodWorkshopParts:FloodWorkshopPart[]=[...rows.map(([id,name,description,connection])=>({id,name,description,connection,stage:floodPartStage(id)})),...floodWires().map(w=>({id:w.id,name:w.title,description:w.purpose,connection:w.connection,stage:floodPartStage(w.id)}))];
