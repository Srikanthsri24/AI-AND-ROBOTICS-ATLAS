/** Mirrors model_letter_sorter_flap.ino: debounce the combined selection, then require a full release. */
export type SorterChoice='None'|'A'|'B'|'Both';
export type LetterSorterState={observed:SorterChoice;accepted:SorterChoice;changedAt:number;armed:boolean;command:number;lines:{at:number;text:string}[]};
export function letterSorterInitial():LetterSorterState{return {observed:'None',accepted:'None',changedAt:0,armed:true,command:90,lines:[{at:0,text:'Deck centered. Press A or B, then wait for the deck to settle.'}]};}
export function letterSorterTick(previous:LetterSorterState,a:boolean,b:boolean,now:number):LetterSorterState{
 now=now>>>0;const s:LetterSorterState={...previous,lines:[...previous.lines]},reading:SorterChoice=a&&b?'Both':a?'A':b?'B':'None';
 if(reading!==s.observed){s.observed=reading;s.changedAt=now;}
 if(s.observed===s.accepted||((now-s.changedAt)>>>0)<35)return s;
 s.accepted=s.observed;if(s.accepted==='None'){s.armed=true;return s;}if(!s.armed)return s;s.armed=false;
 if(s.accepted==='Both'){s.lines.push({at:now,text:'Both pressed. Holding destination.'});return s;}
 const routeA=s.accepted==='A';s.command=routeA?50:130;s.lines.push({at:now,text:routeA?'Command: Bin A':'Command: Bin B'});return s;
}
