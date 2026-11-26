import {createRoot} from 'react-dom/client';
import Workshop from '../../src/modules/RfidWorkshop';
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<main style={{maxWidth:1200,margin:'auto',padding:20}}><Workshop/></main>);return()=>root.unmount();}
