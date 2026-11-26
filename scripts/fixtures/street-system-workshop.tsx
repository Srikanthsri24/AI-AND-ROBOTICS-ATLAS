import {createRoot} from 'react-dom/client';
import Workshop from '../../src/modules/StreetSystemWorkshop';
export function mount(el:HTMLElement){createRoot(el).render(<Workshop/>);}
