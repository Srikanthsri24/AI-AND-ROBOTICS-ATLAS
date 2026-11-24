/** Active-low inputs, matching library_help_button.ino. Times use uint32 millis. */
export type LibraryHelpButtonState={raw:boolean;stable:boolean;changedAt:number};
export type LibraryHelpEvent={at:number;message:'Ready.'|'Help requested.'|'Staff acknowledged.'};
export type LibraryHelpState={help:LibraryHelpButtonState;ack:LibraryHelpButtonState;pending:boolean;visitorLed:boolean;staffLed:boolean;events:LibraryHelpEvent[]};
const released=():LibraryHelpButtonState=>({raw:false,stable:false,changedAt:0});
export function libraryHelpInitial():LibraryHelpState{return {help:released(),ack:released(),pending:false,visitorLed:false,staffLed:false,events:[{at:0,message:'Ready.'}]};}
export function libraryHelpDebounce(previous:LibraryHelpButtonState,pressed:boolean,now:number):{state:LibraryHelpButtonState;edge:boolean}{const state={...previous};now=now>>>0;if(pressed!==state.raw){state.raw=pressed;state.changedAt=now;}if(state.raw===state.stable||((now-state.changedAt)>>>0)<25)return {state,edge:false};state.stable=state.raw;return {state,edge:state.stable};}
export function libraryHelpTick(previous:LibraryHelpState,helpPressed:boolean,ackPressed:boolean,now:number):LibraryHelpState{
 const help=libraryHelpDebounce(previous.help,helpPressed,now),ack=libraryHelpDebounce(previous.ack,ackPressed,now);let pending=previous.pending;const events=[...previous.events];
 // Both inputs are always debounced, including simultaneous or ignored edges.
 if(help.edge){if(!pending)events.push({at:now>>>0,message:'Help requested.'});pending=true;}
 else if(ack.edge&&pending){pending=false;events.push({at:now>>>0,message:'Staff acknowledged.'});}
 return {help:help.state,ack:ack.state,pending,visitorLed:help.state.stable,staffLed:pending,events};
}
