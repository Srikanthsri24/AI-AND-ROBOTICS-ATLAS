import {memo,type RefObject} from 'react';
import {RailwayJumperHarness} from './RailwayControlJumpers';
import {railwaySensorFeeds,railwaySensorFeedPose} from '../data/railway-sensor-feeds';
import type {RailwayWithdrawal} from '../data/railway-control-jumpers';
function RailwaySensorFeeds(props:{selected?:string;select?:(id:string)=>void;withdrawals?:readonly RailwayWithdrawal[];motion?:RefObject<readonly RailwayWithdrawal[]>}){return <RailwayJumperHarness {...props} cables={railwaySensorFeeds} pose={railwaySensorFeedPose} groupName="railway-sensor-feeds"/>;}
export default memo(RailwaySensorFeeds);
