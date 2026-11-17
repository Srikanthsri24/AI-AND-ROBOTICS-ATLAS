export type MotorReading = {source:string; capturedAt:string; vibration:number|null; temperature:number|null};
export type MotorModel = {id:string; bias:number; vibrationWeight:number; temperatureWeight:number; baselineTemperature:number; threshold:number};
export type PipelineResult = {
  id:number; reading:MotorReading; modelId:string; observed:number; generatedAt:number;
  score?:number; prediction?:string; error?:string; reviewedAt?:number;
};
export const staleAfterSeconds: number;
export function runInference(reading:MotorReading, model:MotorModel, now:number, id:number):PipelineResult;
export function resultStatus(result:PipelineResult, now:number):'Invalid'|'Stale'|'Fresh';
export function reviewResult(result:PipelineResult, now:number):PipelineResult;
