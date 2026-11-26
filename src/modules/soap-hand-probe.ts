import {Raycaster,Vector3,Matrix3,type Object3D} from 'three';
/** Ideal vertical-axis teaching probes, not an acoustic-pattern simulation.
 * Geometry is in the workshop's world scale: 100 mm per scene unit. */
export function soapHandProbe(hand:Object3D){hand.updateWorldMatrix(true,true);const ray=new Raycaster(),cast=(x:number,z:number)=>{ray.set(new Vector3(x*.01,2.5,z*.01),new Vector3(0,-1,0));return ray.intersectObject(hand,true)[0]??null;},tx=cast(22,105),rx=cast(48,105),surface=cast(0,45),distanceCm=tx&&rx?(2.5-(tx.point.y+rx.point.y)/2)*10:25;
 const receiver=surface?{point:surface.point.clone().multiplyScalar(100).toArray(),local:hand.worldToLocal(surface.point.clone()).toArray(),normal:(surface.face?surface.face.normal.clone().applyMatrix3(new Matrix3().getNormalMatrix(surface.object.matrixWorld)).normalize():new Vector3(0,1,0)).toArray()}:null;
 return {distanceCm,echoPresent:!!tx===!!rx,axes:[tx?.point.y??null,rx?.point.y??null],receiver};}
