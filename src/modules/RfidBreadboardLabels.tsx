import {memo} from 'react';
import {Text} from '@react-three/drei';
import {rfidBreadboardLabels} from '../data/rfid-breadboard-labels';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function RfidBreadboardLabels(){return <group name="rfid-breadboard-coordinates">{rfidBreadboardLabels.map(label=><Text key={label.kind+label.text} name={'rfid-board-'+label.kind+'-'+label.text} position={[...label.position]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={label.kind==='row'?1.3:1.25} color="#3c4255" depthOffset={-2} raycast={()=>null}>{label.text}</Text>)}</group>;}
export default memo(RfidBreadboardLabels);
