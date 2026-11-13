export type Vec3=[number,number,number];
export interface LabelEvent{start:number;end:number;components:string[]}
export interface AnimationEvent{start:number;duration:number;cue:string}
export interface CameraKeyframe{time:number;target:Vec3;position:{landscape:Vec3;portrait:Vec3}}
export interface NarrationSegment{start:number;duration:number;text:Record<'english'|'telugu'|'hindi',string>;audio:Record<'english'|'telugu'|'hindi',string>}
export interface SceneDefinition{id:number;title:string;subtitle:string;start:number;duration:number;objectives:string[];focus:string[];segments:NarrationSegment[];labelEvents:LabelEvent[];animationEvents:AnimationEvent[];cameraKeyframes:CameraKeyframe[]}
