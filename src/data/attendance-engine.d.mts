export type Person = {id:string; name:string; shape:number[]};
export type Sample = Person & {offset:number; brightness:number};
export type Candidate = {id:string; name:string; distance:number};
export type Match = {status:'unknown'|'review'|'match'; candidates:Candidate[]};

export const imageWidth:number;
export const imageHeight:number;
export const matchLimit:number;
export const minimumMargin:number;
export const roster:Person[];
export const faceSamples:Sample[];
export function renderFace(shape:number[],offset?:number,brightness?:number):Uint8Array;
export function describeFace(pixels:Uint8Array):number[]|null;
export function matchFace(pixels:Uint8Array,enrolled?:Person[],limit?:number):Match;
export function runSample(sampleId:string,enrolled?:Person[],limit?:number):Match;
