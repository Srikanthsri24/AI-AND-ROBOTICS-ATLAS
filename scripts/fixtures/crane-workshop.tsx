import {createRoot} from 'react-dom/client';
import CraneWorkshop from '../../src/modules/CraneWorkshop';
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<CraneWorkshop/>);return()=>root.unmount();}
