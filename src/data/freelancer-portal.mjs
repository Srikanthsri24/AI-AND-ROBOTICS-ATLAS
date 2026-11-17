export const jobs=[
 {id:'dashboard',title:'Build a field data dashboard',team:'Orchard Labs',skill:'JavaScript',duration:'This week',budget:420,summary:'Build a responsive dashboard from a supplied CSV and add two accessible charts.'},
 {id:'sensors',title:'Clean an IoT sensor dataset',team:'Signal Workshop',skill:'Python',duration:'Next month',budget:360,summary:'Normalize timestamps, flag missing readings, and export a reproducible dataset.'},
 {id:'keyboard',title:'Run a keyboard accessibility audit',team:'Northstar Studio',skill:'Accessibility',duration:'This week',budget:280,summary:'Test the onboarding flow with a keyboard and report each issue with reproduction steps.'},
 {id:'api',title:'Document a mock REST API',team:'Harbor Tools',skill:'Python',duration:'This week',budget:320,summary:'Add request examples, a response reference, and error cases to the local practice API.'},
];

export function filterJobs({skill='',duration='',query=''}={}) {
 const text=query.trim().toLowerCase();
 return jobs.filter(job=>(!skill||job.skill===skill)&&(!duration||job.duration===duration)&&
   [job.title,job.team,job.summary,job.skill].join(' ').toLowerCase().includes(text));
}

export function submitProposal(proposals,jobId,note) {
 const message=note.trim();
 if(!jobs.some(job=>job.id===jobId))return {ok:false,reason:'Choose an existing listing.',proposals};
 if(proposals.some(proposal=>proposal.jobId===jobId))return {ok:false,reason:'A proposal already exists for this job.',proposals};
 if(message.length<20||message.length>400)return {ok:false,reason:'Write a proposal between 20 and 400 characters.',proposals};
 return {ok:true,reason:'Proposal submitted.',proposals:[...proposals,{jobId,note:message,status:'Submitted'}]};
}

export function reviewProposal(proposals,jobId,status) {
 if(!['Shortlisted','Declined'].includes(status))return {ok:false,reason:'Choose a valid review outcome.',proposals};
 const proposal=proposals.find(item=>item.jobId===jobId);
 if(!proposal||proposal.status!=='Submitted')return {ok:false,reason:'Only a submitted proposal can be reviewed.',proposals};
 return {ok:true,reason:'Proposal '+status.toLowerCase()+'.',proposals:proposals.map(item=>item.jobId===jobId?{...item,status}:item)};
}
