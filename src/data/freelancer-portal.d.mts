export type Job={id:string;title:string;team:string;skill:string;duration:string;budget:number;summary:string};
export type Proposal={jobId:string;note:string;status:'Submitted'|'Shortlisted'|'Declined'};
export const jobs:Job[];
export function filterJobs(filters?:{skill?:string;duration?:string;query?:string}):Job[];
export function submitProposal(proposals:Proposal[],jobId:string,note:string):{ok:boolean;reason:string;proposals:Proposal[]};
export function reviewProposal(proposals:Proposal[],jobId:string,status:'Shortlisted'|'Declined'):{ok:boolean;reason:string;proposals:Proposal[]};
