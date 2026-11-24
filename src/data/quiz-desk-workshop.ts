/** Matches quiz_desk_response_button.ino: ties mean edges in the same loop update. */
export type QuizDeskButton={raw:boolean;stable:boolean;changedAt:number};
export type QuizDeskRound='waiting'|'armed'|'won-a'|'won-b'|'tie';
export type QuizDeskState={buttons:[QuizDeskButton,QuizDeskButton,QuizDeskButton];round:QuizDeskRound;ledA:boolean;ledB:boolean;events:{at:number;message:string}[]};
export function quizDeskInitial():QuizDeskState{return {buttons:[0,1,2].map(()=>({raw:false,stable:false,changedAt:0})) as QuizDeskState['buttons'],round:'waiting',ledA:false,ledB:false,events:[]};}
export function quizDeskTick(previous:QuizDeskState,pressed:[boolean,boolean,boolean],now:number):QuizDeskState{now=now>>>0;const edges=[false,false,false],buttons=previous.buttons.map((old,i)=>{const b={...old};if(b.raw!==pressed[i]){b.raw=pressed[i];b.changedAt=now;}if(b.raw!==b.stable&&((now-b.changedAt)>>>0)>=25){b.stable=b.raw;edges[i]=b.stable;}return b;}) as QuizDeskState['buttons'];let round=previous.round;const events=[...previous.events];const event=(message:string)=>events.push({at:now,message});
 if(edges[2]){round='waiting';event('Round cleared.');}
 else if(round==='waiting'&&buttons.every(b=>!b.raw&&!b.stable&&((now-b.changedAt)>>>0)>=25)){round='armed';event('Round armed.');}
 else if(round==='armed'&&(edges[0]||edges[1])){round=edges[0]&&edges[1]?'tie':edges[0]?'won-a':'won-b';event(round==='tie'?'Tie in this update.':round==='won-a'?'Team A first.':'Team B first.');}
 return {buttons,round,ledA:round==='won-a'||round==='tie',ledB:round==='won-b'||round==='tie',events};
}
