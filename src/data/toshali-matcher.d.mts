export type ReferenceCraft = { id:string; examples:string[] };
export type PhraseResult = { craftId:string|null; reason:'match'|'ambiguous'|'unfamiliar'; ranks:{id:string;score:number;example:string}[] };
export const minimumSimilarity: number;
export const minimumLead: number;
export function classifyPhrase(phrase:string, crafts:ReferenceCraft[]):PhraseResult;
