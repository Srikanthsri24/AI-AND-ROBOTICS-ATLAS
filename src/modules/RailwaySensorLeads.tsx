import {memo,useMemo,type RefObject} from 'react';
import {RailwayJumperHarness} from './RailwayControlJumpers';
import {railwaySensorLeads,railwaySensorLeadPose} from '../data/railway-sensor-leads';
import {railwaySensorSocketDefinitions} from '../data/railway-sensor-sockets';
import type {RailwayWithdrawal} from '../data/railway-control-jumpers';
import type {RailwayInputs} from '../data/railway-workshop';
function RailwaySensorLeads(props:{selected?:string;select?:(id:string)=>void;withdrawals?:readonly RailwayWithdrawal[];motion?:RefObject<readonly RailwayWithdrawal[]>;inputs:RefObject<Pick<RailwayInputs,'entryAligned'|'exitAligned'>>}){const pose=useMemo(()=>(n:number,a=0,b=0)=>railwaySensorLeadPose(n,a,b,railwaySensorSocketDefinitions[n].terminal.station==='a'?props.inputs.current.entryAligned:props.inputs.current.exitAligned),[props.inputs]);return <RailwayJumperHarness {...props} cables={railwaySensorLeads} pose={pose} groupName="railway-sensor-leads"/>;}
export default memo(RailwaySensorLeads);
