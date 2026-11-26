import {createRoot} from 'react-dom/client';
import Workshop from '../../src/modules/SchoolBellWorkshop';
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Workshop/>);return()=>root.unmount();}
