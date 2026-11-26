import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Panel from '../../src/modules/RfidFittingPanel';
function App(){const[cursor,setCursor]=useState(0),[playing,setPlaying]=useState(false),[selected,setSelected]=useState('');useEffect(()=>{if(!playing)return;const id=setInterval(()=>setCursor(c=>{if(c>=20){setPlaying(false);return 20;}return Math.min(20,c+.1);}),50);return()=>clearInterval(id);},[playing]);return <main style={{maxWidth:940,margin:'24px auto',fontFamily:'Arial,sans-serif',padding:12}}><Panel cursor={cursor} playing={playing} onCursor={c=>{setPlaying(false);setCursor(c);}} onPlay={()=>{if(cursor>=20)setCursor(0);setPlaying(p=>!p);}} onSelect={setSelected}/><output data-selection>{selected}</output></main>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<App/>);return()=>root.unmount();}
