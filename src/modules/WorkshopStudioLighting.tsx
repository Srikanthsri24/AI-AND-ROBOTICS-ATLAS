import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {PMREMGenerator} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
/** Local procedural soft-box reflections; no remote HDRI / image request is needed. */
export default function WorkshopStudioLighting(){const {gl,scene}=useThree();useEffect(()=>{const previous=scene.environment,intensity=scene.environmentIntensity,generator=new PMREMGenerator(gl),room=new RoomEnvironment(),target=generator.fromScene(room,.04);scene.environment=target.texture;scene.environmentIntensity=.55;room.dispose();generator.dispose();return()=>{if(scene.environment===target.texture){scene.environment=previous;scene.environmentIntensity=intensity;}target.dispose();};},[gl,scene]);return null;}
