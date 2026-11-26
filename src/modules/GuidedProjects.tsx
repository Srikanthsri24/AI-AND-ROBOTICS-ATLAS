import { recyclingVending } from '../data/recycling-vending';
import { vendingMachine } from '../data/four-slot-vending';
import { gestureLamp } from '../data/gesture-lamp';
import { smartHeadlights } from '../data/smart-headlights';
import { bleGamepad } from '../data/ble-gamepad';
import { lineFollower } from '../data/line-follower';
import { roomController } from '../data/room-controller';
import { motionPick } from '../data/motion-pick';
import { solarLawn } from '../data/solar-lawn';
import { solarTricopter } from '../data/solar-tricopter';
import { gpsGsm } from '../data/gps-gsm';
import { horizonTracker } from '../data/horizon-tracker';
import { gsmEnergy } from '../data/gsm-energy';
import { bleArm, armNames, armKeys } from '../data/ble-arm';
import { mimicHand } from '../data/mimic-hand';
import { voiceWater } from '../data/voice-water';
import { piObjectFollower } from '../data/pi-object-follower';
import { piBinMonitor } from '../data/pi-bin-monitor';
import { piFaceLock } from '../data/pi-face-lock';
import attendanceEngineSource from '../data/attendance-engine.mjs?raw';
import { forestFireProject } from '../data/forest-fire-project';
import { attritionProject } from '../data/attrition-project';
import { stockTrendProject } from '../data/stock-trend-project';
import { privateChatProject } from '../data/private-chat-project';
import { phoneCohortProject } from '../data/phone-cohort-project';
import { transitProject } from '../data/transit-project';
import { freelancerProject } from '../data/freelancer-project';
import { chairProject } from '../data/stand-up-chair-project';
import { ledgerProject } from '../data/classroom-ledger-project';
import { fruitProject } from '../data/fruit-sweetness';
import { voiceHome } from '../data/voice-home';
import { attendanceProject } from '../data/attendance-project';
import { esp32DoorCamera } from '../data/esp32-door-camera';
import { esp32SmartHome } from '../data/esp32-smart-home';
import { swarmCoordination } from '../data/swarm-coordination';
import { fingerprintStarter } from '../data/fingerprint-starter';
import { hydroponicChamber } from '../data/hydroponic-chamber';
import { shakeMonitor } from '../data/shake-monitor';
import { followerTrolley } from '../data/follower-trolley';
import { omniArm, omniExample } from '../data/omni-arm';
import { prepaidMeter } from '../data/prepaid-meter';
import { footstepRfid } from '../data/footstep-rfid';
import { underwaterIr } from '../data/underwater-ir';
import { voiceRover } from '../data/voice-rover';
import { wirelessRailSignal } from '../data/wireless-rail-signal';
import { nightPatrol } from '../data/night-patrol';
import { entranceTemperature } from '../data/entrance-temperature';
import { bellowsSimulator } from '../data/bellows-simulator';
import { selfParking } from '../data/self-parking';
import { solarTracker } from '../data/solar-tracker';
import { wearableScope } from '../data/wearable-scope';
import { fingerprintLocker } from '../data/fingerprint-locker';
import { lightInterlock } from '../data/light-interlock';
import { solarMeter } from '../data/solar-meter';
import { androidSnake, snakeCommands, snakeMotion } from '../data/android-snake';
import { tankRefill, tankLimits } from '../data/tank-refill';
import { gestureRover, gestureLimits } from '../data/gesture-rover';
import { bluetoothHome, homeCommands } from '../data/bluetooth-home';
import { toshaliProject } from '../data/toshali-project';
import { classroomLab, inventorySheet, stationCards, stations } from '../data/classroom-stations';
import { pipelineProject } from '../data/pipeline-dashboard-project';
import { schoolProject } from '../data/school-workspace-project';
import { analyticsProject } from '../data/python-analytics';
import { publishingProject } from '../data/publishing-workflow';
import { tiltCamera } from '../data/tilt-camera';
import { detectionBench, motionWindowMs } from '../data/detection-bench';
import { piPrototyping } from '../data/pi-prototyping';
import { printedEnclosure } from '../data/printed-enclosure';
import { fanInterlock } from '../data/fan-interlock';
import { gpsAlert } from '../data/gps-alert';
import { exhibitionLock } from '../data/exhibition-lock';
import { classroomAir } from '../data/classroom-air';
import { smartGreenhouse } from '../data/smart-greenhouse';
import { pickBalance } from '../data/pick-balance';
import { roverArm } from '../data/rover-arm';
import { automaticTap } from '../data/automatic-tap';
import { soapDispenser } from '../data/soap-dispenser';
import { trafficParking } from '../data/traffic-parking';
import { schoolBell } from '../data/school-bell';
import { rfidDoor } from '../data/rfid-door';
import { rainClothesline } from '../data/rain-clothesline';
import { mq2Monitor } from '../data/mq2-monitor';
import { electromagnetCrane } from '../data/electromagnet-crane';
import { electronicPiano } from '../data/electronic-piano';
import { streetLight } from '../data/street-light';
import { railwayGate } from '../data/railway-gate';
import { directoryProjects } from './DirectoryProject';
import ProjectScenario from './ProjectScenario';
import { configureProjectSource, expandProjects, expansionDemo, type ExpansionInfo } from '../data/project-expansion';
import { bluetoothCar, bluetoothCarCommands } from '../data/bluetooth-car';
import { ultrasonicRadar } from '../data/ultrasonic-radar';
import { weatherCubeSat } from '../data/weather-cubesat';
import { emergencyLighting } from '../data/emergency-lighting';
import { industrialMonitor, industrialReceiver, industrialLimits } from '../data/industrial-monitor';
import { mineSafety } from '../data/mine-safety';
import { smartWasteBin, smartBinReceiver, binLimits } from '../data/smart-waste-bin';
import { aquaclean, aquacleanReceiver } from '../data/aquaclean';
import { floodGate } from '../data/flood-gate';
import { floodWarning } from '../data/flood-warning';
import { rocketLab, rocketLabSpeed } from '../data/water-rocket';
import { bottleVacuum, vacuumTrialSheet, vacuumTrials } from '../data/bottle-vacuum';
import { lidarMicroDrone } from '../data/lidar-micro-drone';
import { solarSweeper } from '../data/solar-sweeper';
import { fireResponseRover } from '../data/fire-response-rover';
import { esp32Car } from '../data/esp32-car';
import { completedGuidedBuildIds } from '../data/completed-guided-builds';
import { demoReadings, projectStories } from '../data/project-stories';
import { projectPartPhotos } from '../data/project-part-photos';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Activity, Check, ChevronLeft, ChevronRight, Plus, ListChecks, Play, Square, Wrench, Rocket, MoveUpRight, Ruler, Radio, Bell, Monitor, Satellite, Camera, RadioTower } from 'lucide-react';
import { guidedProjects } from '../data/guided-projects';
import { download } from './state';
import { projectPrograms, programWalkthroughs } from '../data/project-programs';
import '../styles/guided-projects.css';

const ProjectDemo = lazy(() => import('./ProjectDemo'));
const RecyclingVendingDemo = lazy(() => import('./RecyclingVendingDemo'));
const VendingMachineDemo = lazy(() => import('./VendingMachineDemo'));
const GestureLampDemo = lazy(() => import('./GestureLampDemo'));
const SmartHeadlightsDemo = lazy(() => import('./SmartHeadlightsDemo'));
const BleGamepadDemo = lazy(() => import('./BleGamepadDemo'));
const LineFollowerDemo = lazy(() => import('./LineFollowerDemo'));
const RoomControllerDemo = lazy(() => import('./RoomControllerDemo'));
const MotionPickDemo = lazy(() => import('./MotionPickDemo'));
const SolarLawnDemo = lazy(() => import('./SolarLawnDemo'));
const SolarTricopterDemo = lazy(() => import('./SolarTricopterDemo'));
const GpsGsmDemo = lazy(() => import('./GpsGsmDemo'));
const HorizonTrackerDemo = lazy(() => import('./HorizonTrackerDemo'));
const GsmEnergyDemo = lazy(() => import('./GsmEnergyDemo'));
const BleArmDemo = lazy(() => import('./BleArmDemo'));
const MimicHandDemo = lazy(() => import('./MimicHandDemo'));
const DialGaugeDemo = lazy(() => import('./DialGaugeDemo'));
const DrawbridgeDemo = lazy(() => import('./DrawbridgeDemo'));
const LetterSorterDemo = lazy(() => import('./LetterSorterDemo'));
const CameraPanModelDemo = lazy(() => import('./CameraPanModelDemo'));
const WindVaneDemo = lazy(() => import('./WindVaneDemo'));
const ParkingBarrierDemo = lazy(() => import('./ParkingBarrierDemo'));
const ControllerInputDemo = lazy(() => import('./ControllerInputDemo'));
const HandheldSignalDemo = lazy(() => import('./HandheldSignalDemo'));
const DrawerIndicatorDemo = lazy(() => import('./DrawerIndicatorDemo'));
const MailboxFlagDemo = lazy(() => import('./MailboxFlagDemo'));
const ModelCrossingDemo = lazy(() => import('./ModelCrossingDemo'));
const AccessibleDeskSwitchDemo = lazy(() => import('./AccessibleDeskSwitchDemo'));
const ElevatorCallDemo = lazy(() => import('./ElevatorCallDemo'));
const ModelDoorbellDemo = lazy(() => import('./ModelDoorbellDemo'));
const QuizDeskDemo = lazy(() => import('./QuizDeskDemo'));
const LibraryHelpButtonDemo = lazy(() => import('./LibraryHelpButtonDemo'));
const WindowBoxComparisonDemo = lazy(() => import('./WindowBoxComparisonDemo'));
const SoilDryingTimerDemo = lazy(() => import('./SoilDryingTimerDemo'));
const CapillaryWateringDemo = lazy(() => import('./CapillaryWateringDemo'));
const PlantPotDepthDemo = lazy(() => import('./PlantPotDepthDemo'));
const DrainageBottleDemo = lazy(() => import('./DrainageBottleDemo'));
const MulchMoistureDemo = lazy(() => import('./MulchMoistureDemo'));
const ClaySoilCalibrationDemo = lazy(() => import('./ClaySoilCalibrationDemo'));
const SandySoilCalibrationDemo = lazy(() => import('./SandySoilCalibrationDemo'));
const SeedlingTrayMoistureDemo = lazy(() => import('./SeedlingTrayMoistureDemo'));
const BasilPotMoistureDemo = lazy(() => import('./BasilPotMoistureDemo'));
const EquipmentEnclosureDemo = lazy(() => import('./EquipmentEnclosureDemo'));
const ColdPackWarmingDemo = lazy(() => import('./ColdPackWarmingDemo'));
const VentOutletTemperatureDemo = lazy(() => import('./VentOutletTemperatureDemo'));
const SolarOvenMonitorDemo = lazy(() => import('./SolarOvenMonitorDemo'));
const AquariumTemperatureDemo = lazy(() => import('./AquariumTemperatureDemo'));
const IncubatorTemperatureDemo = lazy(() => import('./IncubatorTemperatureDemo'));
const SunlitWindowDemo = lazy(() => import('./SunlitWindowDemo'));
const SeedTrayTemperatureDemo = lazy(() => import('./SeedTrayTemperatureDemo'));
const DeskComfortDemo = lazy(() => import('./DeskComfortDemo'));
const TerrariumTemperatureDemo = lazy(() => import('./TerrariumTemperatureDemo'));
const TunnelModelDemo = lazy(() => import('./TunnelModelDemo'));
const CampingLanternDemo = lazy(() => import('./CampingLanternDemo'));
const SchoolDioramaDemo = lazy(() => import('./SchoolDioramaDemo'));
const WindowShadowDemo = lazy(() => import('./WindowShadowDemo'));
const StairModelDemo = lazy(() => import('./StairModelDemo'));
const DisplayCaseLightDemo = lazy(() => import('./DisplayCaseLightDemo'));
const GreenhouseShadeDemo = lazy(() => import('./GreenhouseShadeDemo'));
const ReadingCornerDemo = lazy(() => import('./ReadingCornerDemo'));
const WardrobeLightDemo = lazy(() => import('./WardrobeLightDemo'));
const ModelStreetlightDemo = lazy(() => import('./ModelStreetlightDemo'));
const CameraCounterDemo = lazy(() => import('./CameraCounterDemo'));
const DesktopServoDemo = lazy(() => import('./DesktopServoDemo'));
const GearReducerDemo = lazy(() => import('./GearReducerDemo'));
const PushButtonPanelDemo = lazy(() => import('./PushButtonPanelDemo'));
const MiniatureSignalDemo = lazy(() => import('./MiniatureSignalDemo'));
const NightLightDemo = lazy(() => import('./NightLightDemo'));
const RoomClimateDemo = lazy(() => import('./RoomClimateDemo'));
const SoilCalibrationDemo = lazy(() => import('./SoilCalibrationDemo'));
const TendonHandDemo = lazy(() => import('./TendonHandDemo'));
const VoiceWaterDemo = lazy(() => import('./VoiceWaterDemo'));
const PiObjectFollowerDemo = lazy(() => import('./PiObjectFollowerDemo'));
const PiBinMonitorDemo = lazy(() => import('./PiBinMonitorDemo'));
const PiFaceLockDemo = lazy(() => import('./PiFaceLockDemo'));
const ForestFireWorkshop = lazy(() => import('./ForestFireWorkshop'));
const AttritionWorkshop = lazy(() => import('./AttritionWorkshop'));
const StockTrendWorkshop = lazy(() => import('./StockTrendWorkshop'));
const PrivateChatWorkshop = lazy(() => import('./PrivateChatWorkshop'));
const PhoneCohortWorkshop = lazy(() => import('./PhoneCohortWorkshop'));
const TransitWorkshop = lazy(() => import('./TransitWorkshop'));
const FreelancerWorkshop = lazy(() => import('./FreelancerWorkshop'));
const StandUpChairWorkshop = lazy(() => import('./StandUpChairWorkshop'));
const ClassroomLedgerWorkshop = lazy(() => import('./ClassroomLedgerWorkshop'));
const FruitSweetnessWorkshop = lazy(() => import('./FruitSweetnessWorkshop'));
const VoiceHomeDemo = lazy(() => import('./VoiceHomeDemo'));
const AttendanceWorkshop = lazy(() => import('./AttendanceWorkshop'));
const Esp32DoorCameraDemo = lazy(() => import('./Esp32DoorCameraDemo'));
const Esp32SmartHomeDemo = lazy(() => import('./Esp32SmartHomeDemo'));
const SwarmCoordinationDemo = lazy(() => import('./SwarmCoordinationDemo'));
const FingerprintStarterDemo = lazy(() => import('./FingerprintStarterDemo'));
const HydroponicChamberDemo = lazy(() => import('./HydroponicChamberDemo'));
const ShakeMonitorDemo = lazy(() => import('./ShakeMonitorDemo'));
const FollowerTrolleyDemo = lazy(() => import('./FollowerTrolleyDemo'));
const OmniArmVehicleDemo = lazy(() => import('./OmniArmVehicleDemo'));
const PrepaidMeterDemo = lazy(() => import('./PrepaidMeterDemo'));
const FootstepRfidDemo = lazy(() => import('./FootstepRfidDemo'));
const UnderwaterIrDemo = lazy(() => import('./UnderwaterIrDemo'));
const VoiceRoverDemo = lazy(() => import('./VoiceRoverDemo'));
const WirelessRailSignalDemo = lazy(() => import('./WirelessRailSignalDemo'));
const NightPatrolDemo = lazy(() => import('./NightPatrolDemo'));
const EntranceTemperatureDemo = lazy(() => import('./EntranceTemperatureDemo'));
const BellowsSimulatorDemo = lazy(() => import('./BellowsSimulatorDemo'));
const SelfParkingDemo = lazy(() => import('./SelfParkingDemo'));
const SolarTrackerDemo = lazy(() => import('./SolarTrackerDemo'));
const WearableScopeDemo = lazy(() => import('./WearableScopeDemo'));
const FingerprintLockerDemo = lazy(() => import('./FingerprintLockerDemo'));
const LightInterlockDemo = lazy(() => import('./LightInterlockDemo'));
const SolarMeterDemo = lazy(() => import('./SolarMeterDemo'));
const AndroidSnakeDemo = lazy(() => import('./AndroidSnakeDemo'));
const TankRefillDemo = lazy(() => import('./TankRefillDemo'));
const GestureRoverDemo = lazy(() => import('./GestureRoverDemo'));
const BluetoothHomeDemo = lazy(() => import('./BluetoothHomeDemo'));
const ToshaliExhibitWorkshop = lazy(() => import('./ToshaliExhibitWorkshop'));
const ClassroomStationsDemo = lazy(() => import('./ClassroomStationsDemo'));
const PipelineDashboardWorkshop = lazy(() => import('./PipelineDashboardWorkshop'));
const SchoolWorkspaceWorkshop = lazy(() => import('./SchoolWorkspaceWorkshop'));
const PythonAnalyticsWorkshop = lazy(() => import('./PythonAnalyticsWorkshop'));
const PublishingWorkshop = lazy(() => import('./PublishingWorkshop'));
const TiltCameraDemo = lazy(() => import('./TiltCameraDemo'));
const DetectionBenchDemo = lazy(() => import('./DetectionBenchDemo'));
const PiClimateDemo = lazy(() => import('./PiClimateDemo'));
const PrintedEnclosureDemo = lazy(() => import('./PrintedEnclosureDemo'));
const FanInterlockDemo = lazy(() => import('./FanInterlockDemo'));
const GpsAlertDemo = lazy(() => import('./GpsAlertDemo'));
const ExhibitionLockDemo = lazy(() => import('./ExhibitionLockDemo'));
const ClassroomAirDemo = lazy(() => import('./ClassroomAirDemo'));
const GreenhouseDemo = lazy(() => import('./GreenhouseDemo'));
const PickBalanceDemo = lazy(() => import('./PickBalanceDemo'));
const RoverArmDemo = lazy(() => import('./RoverArmDemo'));
const AutomaticTapDemo = lazy(() => import('./AutomaticTapDemo'));
const SoapDispenserDemo = lazy(() => import('./SoapDispenserDemo'));
const TrafficParkingDemo = lazy(() => import('./TrafficParkingDemo'));
const SchoolBellDemo = lazy(() => import('./SchoolBellDemo'));
const RFIDDoorDemo = lazy(() => import('./RFIDDoorDemo'));
const RainClotheslineDemo = lazy(() => import('./RainClotheslineDemo'));
const MQ2MonitorDemo = lazy(() => import('./MQ2MonitorDemo'));
const ElectromagnetCraneDemo = lazy(() => import('./ElectromagnetCraneDemo'));
const ElectronicPianoDemo = lazy(() => import('./ElectronicPianoDemo'));
const StreetLightDemo = lazy(() => import('./StreetLightDemo'));
const RailwayGateDemo = lazy(() => import('./RailwayGateDemo'));
const UltrasonicRadarDemo = lazy(() => import('./UltrasonicRadarDemo'));
const WeatherCubeSatDemo = lazy(() => import('./WeatherCubeSatDemo'));
const EmergencyLightingDemo = lazy(() => import('./EmergencyLightingDemo'));
const IndustrialMonitorDemo = lazy(() => import('./IndustrialMonitorDemo'));
const MineSafetyDemo = lazy(() => import('./MineSafetyDemo'));
const SmartBinDemo = lazy(() => import('./SmartBinDemo'));
const AquacleanDemo = lazy(() => import('./AquacleanDemo'));
const FloodGateDemo = lazy(() => import('./FloodGateDemo'));
const FloodWarningDemo = lazy(() => import('./FloodWarningDemo'));
const WaterRocketDemo = lazy(() => import('./WaterRocketDemo'));
const BottleVacuumDemo = lazy(() => import('./ProjectDemo').then(module => ({default:module.BottleVacuumDemo})));
const LidarDroneDemo = lazy(() => import('./ProjectDemo').then(module => ({default:module.LidarDroneDemo})));
const SolarSweeperDemo = lazy(() => import('./ProjectDemo').then(module => ({default:module.SolarSweeperDemo})));
const BeaconRoverDemo = lazy(() => import('./ProjectDemo').then(module => ({default:module.BeaconRoverDemo})));
const BluetoothCarDemo = lazy(() => import('./ProjectDemo').then(module => ({default:module.BluetoothCarDemo})));
const ProjectPartView = lazy(() => import('./ProjectDemo').then(module => ({ default: module.ProjectPartView })));
const RoverWorkshop = lazy(() => import('./RoverWorkshop'));
const TendonHandWorkshop = lazy(() => import('./TendonHandWorkshop'));
const Esp32CarWorkshop = lazy(() => import('./Esp32CarWorkshop'));
const SolarSweeperWorkshop = lazy(() => import('./SolarSweeperWorkshop'));
const LidarWorkshop = lazy(() => import('./LidarWorkshop'));
const VacuumWorkshop = lazy(() => import('./VacuumWorkshop'));
const RocketWorkshop = lazy(() => import('./RocketWorkshop'));
const FloodWorkshop = lazy(() => import('./FloodWorkshop'));
const FloodGateWorkshop = lazy(() => import('./FloodGateWorkshop'));
const AquacleanWorkshop = lazy(() => import('./AquacleanWorkshop'));
const SmartBinWorkshop = lazy(() => import('./SmartBinWorkshop'));
const MineWorkshop = lazy(() => import('./MineWorkshop'));
const IndustrialWorkshop = lazy(() => import('./IndustrialWorkshop'));
const EmergencyWorkshop = lazy(() => import('./EmergencyWorkshop'));
const CubeSatWorkshop = lazy(() => import('./CubeSatWorkshop'));
const RadarWorkshop = lazy(() => import('./RadarWorkshop'));
const RailwayWorkshop = lazy(() => import('./RailwayWorkshop'));
const StreetSystemWorkshop = lazy(() => import('./StreetSystemWorkshop'));
const PianoWorkshop = lazy(() => import('./PianoWorkshop'));
const CraneWorkshop = lazy(() => import('./CraneWorkshop'));
const Mq2Workshop = lazy(() => import('./Mq2Workshop'));
const BeaconRoverWorkshop = lazy(() => import('./BeaconRoverWorkshop'));
const BluetoothCarWorkshop = lazy(() => import('./BluetoothCarWorkshop'));
const SoilMoistureWorkshop = lazy(() => import('./SoilMoistureWorkshop'));
const RoomClimateWorkshop = lazy(() => import('./RoomClimateWorkshop'));
const NightLightWorkshop = lazy(() => import('./NightLightWorkshop'));
const TrafficSignalWorkshop = lazy(() => import('./TrafficSignalWorkshop'));
const PushButtonWorkshop = lazy(() => import('./PushButtonWorkshop'));
const GearReducerWorkshop = lazy(() => import('./GearReducerWorkshop'));
const DesktopServoWorkshop = lazy(() => import('./DesktopServoWorkshop'));
const CameraCounterWorkshop = lazy(() => import('./CameraCounterWorkshop'));
const ModelStreetlightWorkshop = lazy(() => import('./ModelStreetlightWorkshop'));
const WardrobeLightWorkshop = lazy(() => import('./WardrobeLightWorkshop'));
const ReadingCornerWorkshop = lazy(() => import('./ReadingCornerWorkshop'));
const GreenhouseShadeWorkshop = lazy(() => import('./GreenhouseShadeWorkshop'));
const DisplayCaseWorkshop = lazy(() => import('./DisplayCaseWorkshop'));
const StairMarkerWorkshop = lazy(() => import('./StairMarkerWorkshop'));
const WindowShadowWorkshop = lazy(() => import('./WindowShadowWorkshop'));
const SchoolDioramaWorkshop = lazy(() => import('./SchoolDioramaWorkshop'));
const CampingLanternWorkshop = lazy(() => import('./CampingLanternWorkshop'));
const TunnelLightWorkshop = lazy(() => import('./TunnelLightWorkshop'));
const TerrariumWorkshop = lazy(() => import('./TerrariumWorkshop'));
const DeskComfortWorkshop = lazy(() => import('./DeskComfortWorkshop'));
const SeedTrayWorkshop = lazy(() => import('./SeedTrayWorkshop'));
const SunlitWindowWorkshop = lazy(() => import('./SunlitWindowWorkshop'));
const IncubatorWorkshop = lazy(() => import('./IncubatorWorkshop'));
const AquariumWorkshop = lazy(() => import('./AquariumWorkshop'));
const SolarOvenWorkshop = lazy(() => import('./SolarOvenWorkshop'));
const VentOutletWorkshop = lazy(() => import('./VentOutletWorkshop'));
const ColdPackWorkshop = lazy(() => import('./ColdPackWorkshop'));
const EquipmentEnclosureWorkshop = lazy(() => import('./EquipmentEnclosureWorkshop'));
const BasilMoistureWorkshop = lazy(() => import('./BasilMoistureWorkshop'));
const DrainageBottleWorkshop = lazy(() => import('./DrainageBottleWorkshop'));
const PlantPotDepthWorkshop=lazy(()=>import('./PlantPotDepthWorkshop'));
const CapillaryWateringWorkshop=lazy(()=>import('./CapillaryWateringWorkshop'));
const DrawbridgeWorkshop=lazy(()=>import('./DrawbridgeWorkshop'));
const LetterSorterWorkshop=lazy(()=>import('./LetterSorterWorkshop'));
const CameraPanWorkshop=lazy(()=>import('./CameraPanWorkshop'));
const WindVaneWorkshop=lazy(()=>import('./WindVaneWorkshop'));
const DialGaugeWorkshop=lazy(()=>import('./DialGaugeWorkshop'));
const ParkingBarrierWorkshop=lazy(()=>import('./ParkingBarrierWorkshop'));
const GamepadWorkshop=lazy(()=>import('./GamepadWorkshop'));
const PaddleWorkshop=lazy(()=>import('./PaddleWorkshop'));
const DrawerWorkshop=lazy(()=>import('./DrawerWorkshop'));
const MailboxWorkshop=lazy(()=>import('./MailboxWorkshop'));
const CrossingRequestWorkshop=lazy(()=>import('./CrossingRequestWorkshop'));
const AccessibleSwitchWorkshop=lazy(()=>import('./AccessibleSwitchWorkshop'));
const ElevatorCallWorkshop=lazy(()=>import('./ElevatorCallWorkshop'));
const DoorbellWorkshop=lazy(()=>import('./DoorbellWorkshop'));
const QuizDeskWorkshop=lazy(()=>import('./QuizDeskWorkshop'));
const LibraryHelpWorkshop=lazy(()=>import('./LibraryHelpWorkshop'));
const WindowBoxWorkshop=lazy(()=>import('./WindowBoxWorkshop'));
const SoilDryingTimerWorkshop=lazy(()=>import('./SoilDryingTimerWorkshop'));
const MulchMoistureWorkshop = lazy(() => import('./MulchMoistureWorkshop'));
const ClaySoilWorkshop = lazy(() => import('./ClaySoilWorkshop'));
const SandySoilWorkshop = lazy(() => import('./SandySoilWorkshop'));
const SeedlingMoistureWorkshop = lazy(() => import('./SeedlingMoistureWorkshop'));
const workshopProjectIds = new Set(['directory-21','directory-20','directory-19','directory-18','directory-17','directory-16','directory-15','directory-14','directory-13','directory-12','directory-11','directory-10','directory-9','directory-8','directory-7','directory-6','directory-5','directory-4','directory-3','directory-2','directory-1','rover-project','hand-project','soil-observer','home-project','ambient-light','traffic-sequencer','button-indicator','mechanism-study','desktop-arm','vision-counter','model-streetlight','wardrobe-light','reading-corner-indicator','greenhouse-shade-monitor','display-case-light','stair-model-marker','window-shadow-detector','school-diorama-night-mode','camping-model-lantern','tunnel-model-light','terrarium-temperature-flag','desk-comfort-monitor','seed-tray-temperature-flag','sunlit-window-monitor','model-incubator-temperature-alert','aquarium-model-temperature-alert','solar-oven-model-monitor','vent-outlet-temperature-indicator','cold-pack-warming-indicator','equipment-enclosure-monitor','basil-pot-moisture-flag','seedling-tray-moisture-check','sandy-soil-calibration','clay-soil-calibration','mulch-moisture-experiment','drainage-bottle-experiment','plant-pot-depth-comparison','capillary-watering-model','soil-drying-timer-study','window-box-comparison','library-help-button','quiz-desk-response-button','model-doorbell-panel','model-elevator-call-light','accessible-desk-switch','model-crossing-request','mailbox-test-flag','drawer-closed-indicator','handheld-signal-paddle','game-controller-input-tester','model-parking-barrier','cardboard-dial-gauge','mini-drawbridge-model','model-letter-sorter-flap','desktop-camera-pan-model','model-wind-vane-pointer']);
const stages = ['Overview','Components','Assembly','Program & test','Finished demo'];
const routes = ['overview','components','assembly','test','demo','workshop'];
const image = (id: string) => `./images/blueprint-illustrations/${id}.webp`;
const projectArtwork = (id:string) => `./images/project-covers/${id}.webp`;
const root = '#/project-builder';
const link = (id: string, stage = 0) => `${root}/${id}/${routes[stage]}`;
const groups = ['Robotics','Robotics','Environment','Environment','Electronics','Electronics','Electronics','Mechanisms','Robotics','Computer vision'];

const expanded = expandProjects(guidedProjects);
const catalog = [
  ...guidedProjects.map((project,index)=>({project,category:groups[index],art:project.id,info:undefined})),
  ...expanded.map(({project,info})=>({project,category:info.category,art:info.template,info})),
];
const bluetoothCover = './images/project-parts/chassis.jpg';
const recyclingVendingCover = './images/project-covers/recycling-vending.jpg';
const vendingMachineCover = './images/project-covers/four-slot-vending.jpg';
const gestureLampCover = './images/project-covers/gesture-lamp.jpg';
const smartHeadlightsCover = './images/project-covers/smart-headlights.jpg';
const bleGamepadCover = './images/project-covers/ble-gamepad.jpg';
const lineFollowerCover = './images/project-covers/line-follower.jpg';
const roomControllerCover = './images/project-covers/room-controller.jpg';
const motionPickCover = './images/project-covers/motion-pick.jpg';
const solarLawnCover = './images/project-covers/solar-lawn.jpg';
const solarTricopterCover = './images/project-covers/solar-tricopter.jpg';
const gpsGsmCover = './images/project-covers/gps-gsm-location.jpg';
const horizonTrackerCover = './images/project-covers/horizon-tracker.jpg';
const gsmEnergyCover = './images/project-covers/gsm-energy.jpg';
const bleArmCover = './images/project-covers/bluetooth-arm.jpg';
const mimicHandCover = './images/project-covers/animatronic-mimic-hand.jpg';
const dialGaugeCover = './images/project-covers/cardboard-dial-gauge.jpg';
const drawbridgeCover = './images/project-covers/mini-drawbridge-model.jpg';
const letterSorterCover = './images/project-covers/model-letter-sorter-flap.jpg';
const cameraPanModelCover = './images/project-covers/desktop-camera-pan-model.jpg';
const windVaneCover = './images/project-covers/model-wind-vane.jpg';
const modelParkingBarrierCover = './images/project-covers/model-parking-barrier.jpg';
const controllerInputCover = './images/project-covers/controller-input-tester.jpg';
const handheldSignalCover = './images/project-covers/handheld-signal-paddle.jpg';
const drawerIndicatorCover = './images/project-covers/drawer-closed-indicator.jpg';
const mailboxFlagCover = './images/project-covers/mailbox-test-flag.jpg';
const modelCrossingCover = './images/project-covers/model-crossing-request.jpg';
const accessibleDeskSwitchCover = './images/project-covers/accessible-desk-switch.jpg';
const elevatorCallCover = './images/project-covers/elevator-call-light.jpg';
const modelDoorbellCover = './images/project-covers/model-doorbell.jpg';
const quizDeskCover = './images/project-covers/quiz-desk.jpg';
const libraryHelpButtonCover = './images/project-covers/library-help-button.jpg';
const windowBoxComparisonCover = './images/project-covers/window-box-comparison.jpg';
const soilDryingTimerCover = './images/project-covers/soil-drying-timer.jpg';
const capillaryWateringCover = './images/project-covers/capillary-watering.jpg';
const plantPotDepthCover = './images/project-covers/plant-pot-depth.jpg';
const drainageBottleCover = './images/project-covers/drainage-bottle.jpg';
const mulchMoistureCover = './images/project-covers/mulch-moisture.jpg';
const claySoilCalibrationCover = './images/project-covers/clay-soil-calibration.jpg';
const sandySoilCalibrationCover = './images/project-covers/sandy-soil-calibration.jpg';
const seedlingTrayMoistureCover = './images/project-covers/seedling-tray-moisture.jpg';
const basilPotMoistureCover = './images/project-covers/basil-pot-moisture.jpg';
const equipmentEnclosureCover = './images/project-covers/equipment-enclosure.jpg';
const coldPackWarmingCover = './images/project-covers/cold-pack-warming.jpg';
const ventOutletCover = './images/project-covers/vent-outlet-temperature.jpg';
const solarOvenMonitorCover = './images/project-covers/solar-oven-monitor.jpg';
const aquariumTemperatureCover = './images/project-covers/aquarium-temperature-alert.jpg';
const incubatorTemperatureCover = './images/project-covers/incubator-temperature-alert.jpg';
const sunlitWindowCover = './images/project-covers/sunlit-window-monitor.jpg';
const seedTrayTemperatureCover = './images/project-covers/seed-tray-temperature-flag.jpg';
const deskComfortCover = './images/project-covers/desk-comfort-monitor.jpg';
const terrariumTemperatureCover = './images/project-covers/terrarium-temperature-flag.jpg';
const tunnelModelCover = './images/project-covers/tunnel-model-light.jpg';
const campingLanternCover = './images/project-covers/camping-model-lantern.jpg';
const schoolDioramaCover = './images/project-covers/school-diorama-night.jpg';
const windowShadowCover = './images/project-covers/window-shadow-bench.jpg';
const stairModelCover = './images/project-covers/stair-model-marker.jpg';
const displayCaseCover = './images/project-covers/display-case-exhibit.jpg';
const greenhouseShadeCover = './images/project-covers/greenhouse-shade-monitor.jpg';
const readingCornerCover = './images/project-covers/reading-corner-bench.jpg';
const wardrobeLightCover = './images/project-covers/wardrobe-light.jpg';
const modelStreetlightCover = './images/project-covers/model-pavement-streetlight.jpg';
const cameraCounterCover = './images/project-covers/camera-object-counter.jpg';
const desktopServoCover = './images/project-covers/desktop-servo-arm.jpg';
const gearReducerCover = './images/project-covers/hand-cranked-gear-reducer.jpg';
const pushButtonCover = './images/project-covers/push-button-status-panel.jpg';
const miniatureSignalCover = './images/project-covers/miniature-traffic-signal.jpg';
const nightLightCover = './images/project-covers/automatic-night-light.jpg';
const roomClimateCover = './images/project-covers/room-climate-bench.jpg';
const soilCalibrationCover = './images/project-covers/soil-calibration.jpg';
const tendonHandCover = './images/project-covers/tendon-hand.jpg';
const voiceWaterCover = './images/project-covers/voice-water.jpg';
const piObjectFollowerCover = './images/project-covers/pi-object-follower.jpg';
const piBinMonitorCover = './images/project-covers/pi-bin-monitor.jpg';
const piFaceLockCover = './images/project-covers/pi-face-lock.jpg';
const voiceHomeCover = './images/project-covers/voice-home.jpg';
const esp32DoorCameraCover = './images/project-covers/esp32-door-camera.jpg';
const esp32SmartHomeCover = './images/project-covers/esp32-smart-home.jpg';
const swarmCoordinationCover = './images/project-covers/swarm-coordination.jpg';
const fingerprintStarterCover = './images/project-covers/fingerprint-starter.jpg';
const hydroponicChamberCover = './images/project-covers/hydroponic-chamber.jpg';
const shakeMonitorCover = './images/project-covers/shake-monitor.jpg';
const followerTrolleyCover = './images/project-covers/follower-trolley.jpg';
const omniArmCover = './images/project-covers/omni-arm-vehicle.jpg';
const prepaidMeterCover = './images/project-covers/prepaid-meter.jpg';
const footstepRfidCover = './images/project-covers/footstep-rfid.jpg';
const underwaterIrCover = './images/project-covers/underwater-ir.jpg';
const voiceRoverCover = './images/project-covers/voice-rover.jpg';
const wirelessRailCover = './images/project-covers/wireless-rail-signal.jpg';
const nightPatrolCover = './images/project-covers/night-patrol.jpg';
const entranceTemperatureCover = './images/project-covers/entrance-temperature.jpg';
const bellowsSimulatorCover = './images/project-covers/bellows-simulator.jpg';
const selfParkingCover = './images/project-covers/self-parking.jpg';
const solarTrackerCover = './images/project-covers/solar-tracker.jpg';
const wearableScopeCover = './images/project-covers/wearable-scope.jpg';
const fingerprintLockerCover = './images/project-covers/fingerprint-locker.jpg';
const lightInterlockCover = './images/project-covers/light-interlock.jpg';
const solarMeterCover = './images/project-covers/solar-meter.jpg';
const androidSnakeCover = './images/project-covers/android-snake.jpg';
const tankRefillCover = './images/project-covers/tank-refill.jpg';
const gestureRoverCover = './images/project-covers/gesture-rover.jpg';
const bluetoothHomeCover = './images/project-covers/bluetooth-home.jpg';
const classroomLabCover = './images/project-covers/classroom-stations.jpg';
const tiltCameraCover = './images/project-covers/tilt-camera.jpg';
const detectionBenchCover = './images/project-covers/detection-bench.jpg';
const piClimateCover = './images/project-covers/pi-climate-bench.jpg';
const enclosureCover = './images/project-covers/printed-enclosure.jpg';
const fanInterlockCover = './images/project-covers/fan-interlock.png';
const gpsAlertCover = './images/project-covers/gps-alert.png';
const exhibitionLockCover = './images/project-covers/exhibition-lock.png';
const classroomAirCover = './images/project-covers/classroom-air.png';
const greenhouseCover = './images/project-covers/smart-greenhouse.png';
const pickBalanceCover = './images/project-covers/pick-balance.png';
const roverArmCover = './images/project-covers/rover-arm.png';
const automaticTapCover = './images/project-covers/automatic-tap.png';
const soapDispenserCover = './images/project-covers/soap-dispenser.png';
const trafficParkingCover = './images/project-covers/traffic-parking.png';
const schoolBellCover = './images/project-covers/school-bell.png';
const rfidCover = './images/project-covers/rfid-door.png';
const rainCover = './images/project-covers/rain-clothesline.png';
const mq2Cover = './images/project-covers/mq2-monitor.png';
const craneCover = './images/project-covers/electromagnet-crane.png';
const pianoCover = './images/project-covers/electronic-piano.png';
const streetLightCover = './images/project-covers/street-light.png';
const railwayCover = './images/project-covers/railway-gate.png';
const radarCover = './images/project-covers/ultrasonic-radar.png';
const cubeSatCover = './images/project-covers/weather-cubesat.png';
const emergencyCover = './images/project-covers/emergency-lighting.png';
const industrialCover = './images/project-covers/industrial-monitor.png';
const mineCover = './images/project-covers/mine-safety.png';
const binCover = './images/project-covers/smart-waste-bin.png';
const aquaCover = './images/project-covers/aquaclean.png';
const gateCover = './images/project-covers/automatic-flood-gate.png';
const floodCover = './images/project-covers/flood-warning.png';
const rocketCover = './images/project-covers/virtual-water-rocket.png';
const vacuumCover = './images/project-parts/pet-bottle.webp';
const droneCover = './images/project-parts/crazyflie.jpg';
const solarCover = './images/project-parts/usb-solar-panel.jpg';
const authoredDirectoryProjects = [voiceWater,piObjectFollower,piBinMonitor,piFaceLock,voiceHome,esp32DoorCamera,esp32SmartHome,swarmCoordination,bluetoothCar,esp32Car,fireResponseRover,solarSweeper,lidarMicroDrone,bottleVacuum,rocketLab,floodWarning,floodGate,aquaclean,smartWasteBin,mineSafety,industrialMonitor,emergencyLighting,weatherCubeSat,ultrasonicRadar,railwayGate,streetLight,electronicPiano,electromagnetCrane,mq2Monitor,rainClothesline,rfidDoor,schoolBell,trafficParking,soapDispenser,automaticTap,roverArm,pickBalance,smartGreenhouse,classroomAir,exhibitionLock,gpsAlert,fanInterlock,printedEnclosure,piPrototyping,detectionBench,tiltCamera,classroomLab,bluetoothHome,gestureRover,tankRefill,androidSnake,solarMeter,lightInterlock,fingerprintLocker,wearableScope,solarTracker,selfParking,fingerprintStarter,hydroponicChamber,shakeMonitor,followerTrolley,omniArm,prepaidMeter,footstepRfid,underwaterIr,voiceRover,wirelessRailSignal,nightPatrol,entranceTemperature,bellowsSimulator,mimicHand,bleArm,gsmEnergy,horizonTracker,gpsGsm,solarTricopter,solarLawn,motionPick,roomController,lineFollower,bleGamepad,smartHeadlights,gestureLamp,vendingMachine,recyclingVending];
const projectCards = [
  ...catalog.filter(({project})=>completedGuidedBuildIds.has(project.id)).map(({project,category,art,info}) => ({
    id:project.id, title:project.title, summary:project.outcome, category,
    cover:project.id==='cardboard-dial-gauge' ? dialGaugeCover : project.id==='mini-drawbridge-model' ? drawbridgeCover : project.id==='model-letter-sorter-flap' ? letterSorterCover : project.id==='desktop-camera-pan-model' ? cameraPanModelCover : project.id==='model-wind-vane-pointer' ? windVaneCover : project.id==='model-parking-barrier' ? modelParkingBarrierCover : project.id==='game-controller-input-tester' ? controllerInputCover : project.id==='handheld-signal-paddle' ? handheldSignalCover : project.id==='drawer-closed-indicator' ? drawerIndicatorCover : project.id==='mailbox-test-flag' ? mailboxFlagCover : project.id==='model-crossing-request' ? modelCrossingCover : project.id==='accessible-desk-switch' ? accessibleDeskSwitchCover : project.id==='model-elevator-call-light' ? elevatorCallCover : project.id==='model-doorbell-panel' ? modelDoorbellCover : project.id==='quiz-desk-response-button' ? quizDeskCover : project.id==='library-help-button' ? libraryHelpButtonCover : project.id==='window-box-comparison' ? windowBoxComparisonCover : project.id==='soil-drying-timer-study' ? soilDryingTimerCover : project.id==='capillary-watering-model' ? capillaryWateringCover : project.id==='plant-pot-depth-comparison' ? plantPotDepthCover : project.id==='drainage-bottle-experiment' ? drainageBottleCover : project.id==='mulch-moisture-experiment' ? mulchMoistureCover : project.id==='clay-soil-calibration' ? claySoilCalibrationCover : project.id==='sandy-soil-calibration' ? sandySoilCalibrationCover : project.id==='seedling-tray-moisture-check' ? seedlingTrayMoistureCover : project.id==='basil-pot-moisture-flag' ? basilPotMoistureCover : project.id==='equipment-enclosure-monitor' ? equipmentEnclosureCover : project.id==='cold-pack-warming-indicator' ? coldPackWarmingCover : project.id==='vent-outlet-temperature-indicator' ? ventOutletCover : project.id==='solar-oven-model-monitor' ? solarOvenMonitorCover : project.id==='aquarium-model-temperature-alert' ? aquariumTemperatureCover : project.id==='model-incubator-temperature-alert' ? incubatorTemperatureCover : project.id==='sunlit-window-monitor' ? sunlitWindowCover : project.id==='seed-tray-temperature-flag' ? seedTrayTemperatureCover : project.id==='desk-comfort-monitor' ? deskComfortCover : project.id==='terrarium-temperature-flag' ? terrariumTemperatureCover : project.id==='tunnel-model-light' ? tunnelModelCover : project.id==='camping-model-lantern' ? campingLanternCover : project.id==='school-diorama-night-mode' ? schoolDioramaCover : project.id==='window-shadow-detector' ? windowShadowCover : project.id==='stair-model-marker' ? stairModelCover : project.id==='display-case-light' ? displayCaseCover : project.id==='greenhouse-shade-monitor' ? greenhouseShadeCover : project.id==='reading-corner-indicator' ? readingCornerCover : project.id==='wardrobe-light' ? wardrobeLightCover : project.id==='model-streetlight' ? modelStreetlightCover : project.id==='vision-counter' ? cameraCounterCover : project.id==='desktop-arm' ? desktopServoCover : project.id==='mechanism-study' ? gearReducerCover : project.id==='button-indicator' ? pushButtonCover : project.id==='traffic-sequencer' ? miniatureSignalCover : project.id==='ambient-light' ? nightLightCover : project.id==='home-project' ? roomClimateCover : project.id==='soil-observer' ? soilCalibrationCover : project.id==='hand-project' ? tendonHandCover : info ? projectArtwork(project.id) : image(art), number:undefined,
  })),
  ...directoryProjects.filter(({id})=>completedGuidedBuildIds.has(id)).flatMap(({id,title,category,number}) => {
    if (id===forestFireProject.id) return {
      id,title:forestFireProject.title,summary:forestFireProject.outcome,category,cover:forestFireProject.cover,number,
    };
    if (id===attritionProject.id) return {
      id,title:attritionProject.title,summary:attritionProject.outcome,category,cover:attritionProject.cover,number,
    };
    if (id===stockTrendProject.id) return {
      id,title:stockTrendProject.title,summary:stockTrendProject.outcome,category,cover:stockTrendProject.cover,number,
    };
    if (id===privateChatProject.id) return {
      id,title:privateChatProject.title,summary:privateChatProject.outcome,category,cover:privateChatProject.cover,number,
    };
    if (id===phoneCohortProject.id) return {
      id,title:phoneCohortProject.title,summary:phoneCohortProject.outcome,category,cover:phoneCohortProject.cover,number,
    };
    if (id===transitProject.id) return {
      id,title:transitProject.title,summary:transitProject.outcome,category,cover:transitProject.cover,number,
    };
    if (id===freelancerProject.id) return {
      id,title:freelancerProject.title,summary:freelancerProject.outcome,category,cover:freelancerProject.cover,number,
    };
    if (id===chairProject.id) return {
      id,title:chairProject.title,summary:chairProject.outcome,category,cover:chairProject.cover,number,
    };
    if (id===ledgerProject.id) return {
      id,title:ledgerProject.title,summary:ledgerProject.outcome,category,cover:ledgerProject.cover,number,
    };
    if (id===fruitProject.id) return {
      id,title:fruitProject.title,summary:fruitProject.outcome,category,cover:fruitProject.cover,number,
    };
    if (id===attendanceProject.id) return {
      id,title:attendanceProject.title,summary:attendanceProject.outcome,category,cover:attendanceProject.cover,number,
    };
    if (id===toshaliProject.id) return {
      id,title:toshaliProject.title,summary:toshaliProject.outcome,category,cover:toshaliProject.cover,number,
    };
    if (id===pipelineProject.id) return {
      id,title:pipelineProject.title,summary:pipelineProject.outcome,category,cover:pipelineProject.cover,number,
    };
    if (id===schoolProject.id) return {
      id,title:schoolProject.title,summary:schoolProject.outcome,category,cover:schoolProject.cover,number,
    };
    if (id===analyticsProject.id) return {
      id,title:analyticsProject.title,summary:analyticsProject.outcome,category,cover:analyticsProject.cover,number,
    };
    if (id===publishingProject.id) return {
      id,title:publishingProject.title,summary:publishingProject.outcome,category,cover:publishingProject.cover,number,
    };
    const guide = authoredDirectoryProjects.find(project=>project.id===id);
    if (!guide) return [];
    return {id,title:id===piPrototyping.id ? piPrototyping.title : id===fanInterlock.id ? fanInterlock.title : id===printedEnclosure.id ? printedEnclosure.title : title,summary:guide.outcome,
      category,cover:id===voiceWater.id ? voiceWaterCover : id===piObjectFollower.id ? piObjectFollowerCover : id===piBinMonitor.id ? piBinMonitorCover : id===piFaceLock.id ? piFaceLockCover : id===voiceHome.id ? voiceHomeCover : id===esp32DoorCamera.id ? esp32DoorCameraCover : id===esp32SmartHome.id ? esp32SmartHomeCover : id===swarmCoordination.id ? swarmCoordinationCover : id===fingerprintStarter.id ? fingerprintStarterCover : id===hydroponicChamber.id ? hydroponicChamberCover : id===shakeMonitor.id ? shakeMonitorCover : id===followerTrolley.id ? followerTrolleyCover : id===omniArm.id ? omniArmCover : id===prepaidMeter.id ? prepaidMeterCover : id===footstepRfid.id ? footstepRfidCover : id===underwaterIr.id ? underwaterIrCover : id===voiceRover.id ? voiceRoverCover : id===wirelessRailSignal.id ? wirelessRailCover : id===nightPatrol.id ? nightPatrolCover : id===entranceTemperature.id ? entranceTemperatureCover : id===recyclingVending.id ? recyclingVendingCover : id===vendingMachine.id ? vendingMachineCover : id===gestureLamp.id ? gestureLampCover : id===smartHeadlights.id ? smartHeadlightsCover : id===bleGamepad.id ? bleGamepadCover : id===lineFollower.id ? lineFollowerCover : id===roomController.id ? roomControllerCover : id===motionPick.id ? motionPickCover : id===solarLawn.id ? solarLawnCover : id===solarTricopter.id ? solarTricopterCover : id===gpsGsm.id ? gpsGsmCover : id===horizonTracker.id ? horizonTrackerCover : id===gsmEnergy.id ? gsmEnergyCover : id===bleArm.id ? bleArmCover : id===mimicHand.id ? mimicHandCover : id===bellowsSimulator.id ? bellowsSimulatorCover : id===selfParking.id ? selfParkingCover : id===solarTracker.id ? solarTrackerCover : id===wearableScope.id ? wearableScopeCover : id===fingerprintLocker.id ? fingerprintLockerCover : id===lightInterlock.id ? lightInterlockCover : id===solarMeter.id ? solarMeterCover : id===androidSnake.id ? androidSnakeCover : id===tankRefill.id ? tankRefillCover : id===gestureRover.id ? gestureRoverCover : id===bluetoothHome.id ? bluetoothHomeCover : id===classroomLab.id ? classroomLabCover : id===tiltCamera.id ? tiltCameraCover : id===detectionBench.id ? detectionBenchCover : id===piPrototyping.id ? piClimateCover : id===printedEnclosure.id ? enclosureCover : id===fanInterlock.id ? fanInterlockCover : id===gpsAlert.id ? gpsAlertCover : id===exhibitionLock.id ? exhibitionLockCover : id===classroomAir.id ? classroomAirCover : id===smartGreenhouse.id ? greenhouseCover : id===pickBalance.id ? pickBalanceCover : id===roverArm.id ? roverArmCover : id===automaticTap.id ? automaticTapCover : id===soapDispenser.id ? soapDispenserCover : id===trafficParking.id ? trafficParkingCover : id===schoolBell.id ? schoolBellCover : id===rfidDoor.id ? rfidCover : id===rainClothesline.id ? rainCover : id===mq2Monitor.id ? mq2Cover : id===electromagnetCrane.id ? craneCover : id===electronicPiano.id ? pianoCover : id===streetLight.id ? streetLightCover : id===railwayGate.id ? railwayCover : id===ultrasonicRadar.id ? radarCover : id===weatherCubeSat.id ? cubeSatCover : id===emergencyLighting.id ? emergencyCover : id===industrialMonitor.id ? industrialCover : id===mineSafety.id ? mineCover : id===smartWasteBin.id ? binCover : id===aquaclean.id ? aquaCover : id===floodGate.id ? gateCover : id===floodWarning.id ? floodCover : id===rocketLab.id ? rocketCover : id===bottleVacuum.id ? vacuumCover : id===lidarMicroDrone.id ? droneCover : id===solarSweeper.id ? solarCover : guide ? bluetoothCover : undefined, number};
  }),
];
const categories = [...new Set(projectCards.map(item=>item.category))].sort();
const pageSize = 15;

function visiblePageNumbers(page: number, total: number) {
  if (total <= 7) return Array.from({length:total},(_,index)=>index+1);
  if (page <= 4) return [1,2,3,4,5,'end',total] as const;
  if (page >= total-3) return [1,'start',total-4,total-3,total-2,total-1,total] as const;
  return [1,'start',page-1,page,page+1,'end',total] as const;
}

export default function GuidedProjects({id, view}: {id?: string | null;view?: string | null}) {
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('');
  const [page,setPage] = useState(0);
  const results = useRef<HTMLParagraphElement>(null);
  function goToPage(nextPage: number) {
    setPage(nextPage);
    results.current?.focus({preventScroll:true});
    results.current?.scrollIntoView({block:'start'});
  }
  const item = catalog.find(entry=>entry.project.id===id);
  const search = query.trim().toLowerCase();
  const matches = projectCards.filter(entry=>(!category || entry.category===category)
    && (entry.number!==undefined && [String(entry.number),String(entry.number).padStart(2,'0')].includes(search)
      || `${entry.title} ${entry.summary} ${entry.category}`.toLowerCase().includes(search)));
  const count = matches.length;
  const totalPages = Math.ceil(count/pageSize);
  const stage = Math.max(0,(id&&workshopProjectIds.has(id)?routes:routes.slice(0,5)).indexOf(view ?? 'overview'));
  if(id && !projectCards.some(project=>project.id===id)) return <div className="gp-page">
    <a className="gp-back" href={root}><ArrowLeft size={18}/> All guided builds</a>
    <h1>Guide unavailable</h1>
    <p>Choose a published project from Guided Builds.</p>
  </div>;
  if(id===forestFireProject.id) return <Suspense fallback={<p role="status">Loading satellite tile screening…</p>}><ForestFireWorkshop stage={stage}/></Suspense>;
  if(id===attritionProject.id) return <Suspense fallback={<p role="status">Loading attrition model…</p>}><AttritionWorkshop stage={stage}/></Suspense>;
  if(id===stockTrendProject.id) return <Suspense fallback={<p role="status">Loading trend evaluation…</p>}><StockTrendWorkshop stage={stage}/></Suspense>;
  if(id===privateChatProject.id) return <Suspense fallback={<p role="status">Loading encrypted chat…</p>}><PrivateChatWorkshop stage={stage}/></Suspense>;
  if(id===phoneCohortProject.id) return <Suspense fallback={<p role="status">Loading fictional profile analysis…</p>}><PhoneCohortWorkshop stage={stage}/></Suspense>;
  if(id===transitProject.id) return <Suspense fallback={<p role="status">Loading transit planner…</p>}><TransitWorkshop stage={stage}/></Suspense>;
  if(id===freelancerProject.id) return <Suspense fallback={<p role="status">Loading freelancer portal…</p>}><FreelancerWorkshop stage={stage}/></Suspense>;
  if(id===chairProject.id) return <Suspense fallback={<p role="status">Loading stand-up chair workbench…</p>}><StandUpChairWorkshop stage={stage}/></Suspense>;
  if(id===ledgerProject.id) return <Suspense fallback={<p role="status">Loading ledger workbench…</p>}><ClassroomLedgerWorkshop stage={stage}/></Suspense>;
  if(id===fruitProject.id) return <Suspense fallback={<p role="status">Loading fruit prediction workbench…</p>}><FruitSweetnessWorkshop stage={stage}/></Suspense>;
  if(id===attendanceProject.id) return <Suspense fallback={<p role="status">Loading attendance workbench…</p>}><AttendanceWorkshop stage={stage}/></Suspense>;
  if(id===toshaliProject.id) return <Suspense fallback={<p role="status">Loading the Toshali exhibit…</p>}><ToshaliExhibitWorkshop stage={stage}/></Suspense>;
  if(id===pipelineProject.id) return <Suspense fallback={<p role="status">Loading pipeline dashboard…</p>}><PipelineDashboardWorkshop stage={stage}/></Suspense>;
  if(id===schoolProject.id) return <Suspense fallback={<p role="status">Loading school workspaces…</p>}><SchoolWorkspaceWorkshop stage={stage}/></Suspense>;
  if(id===analyticsProject.id) return <Suspense fallback={<p role="status">Loading Python workshop…</p>}><PythonAnalyticsWorkshop stage={stage}/></Suspense>;
  if(id===publishingProject.id) return <Suspense fallback={<p role="status">Loading publishing workshop…</p>}><PublishingWorkshop stage={stage}/></Suspense>;
  const guide = authoredDirectoryProjects.find(project=>project.id===id);
  if(guide) return <Build key={guide.id} project={guide} stage={stage} art={guide.id}/>;
  return item ? <Build key={item.project.id} project={item.project} stage={stage} art={item.art} expansion={item.info}/> : <div className="gp-page">
    <header className="gp-hero" style={{backgroundImage:`linear-gradient(90deg,#112039 32%,#11203931), url(${image('rover-project')})`}}>
      <span className="gp-overline">Atlas workshop</span>
      <h1>Project Builder</h1>
      <p>Choose a project, gather the parts, and follow the build from first connection to finished demo.</p>
    </header>
    <div className="gp-section-heading"><h2>Guided builds</h2><span>{projectCards.length} projects</span></div>
    <div className="gp-catalog-controls">
      <label>Search projects<input type="search" value={query} placeholder="Try soil, gears, or camera" onChange={event=>{setQuery(event.target.value);setPage(0);}}/></label>
      <label><span id="gp-category-label">Category</span><select aria-labelledby="gp-category-label" value={category} onChange={event=>{setCategory(event.target.value);setPage(0);}}><option value="">All categories</option>{categories.map(name=><option key={name}>{name}</option>)}</select></label>
    </div>
    <p className="gp-catalog-results" role="status" ref={results} tabIndex={-1}>{count ? `Showing ${page*pageSize+1}–${Math.min((page+1)*pageSize,count)} of ${count} projects` : 'No projects match these filters.'}</p>
    <div className="gp-gallery">
      {matches.slice(page*pageSize,(page+1)*pageSize).map(({id,title,category,summary,cover},index)=><a className="gp-card" key={id} href={link(id)}>
        {cover && <img src={cover} alt="" loading={index>2 ? 'lazy' : undefined}/>}
        <div><span className="gp-overline">{category}</span><h3>{title}</h3><p>{summary}</p>
          <strong>Open build <ChevronRight size={16}/></strong></div>
      </a>)}
    </div>
    {totalPages>1&&<nav className="gp-catalog-pages" aria-label="Project pages">
      <button className="gp-page-direction" type="button" aria-label="Previous page" disabled={page===0} onClick={()=>goToPage(page-1)}>
        <ChevronLeft size={18} aria-hidden="true"/><span>Previous</span>
      </button>
      <div className="gp-page-numbers">
        {visiblePageNumbers(page+1,totalPages).map(number=>typeof number==='number'
          ? <button type="button" key={number} aria-label={`Page ${number}`} aria-current={number===page+1?'page':undefined}
              onClick={()=>{if(number!==page+1)goToPage(number-1);}}>{number}</button>
          : <span aria-hidden="true" key={number}>…</span>)}
      </div>
      <label className="gp-page-compact">
        <select aria-label="Go to project page" value={page} onChange={event=>goToPage(Number(event.target.value))}>
          {Array.from({length:totalPages},(_,index)=><option key={index} value={index}>Page {index+1} of {totalPages}</option>)}
        </select>
      </label>
      <button className="gp-page-direction" type="button" aria-label="Next page" disabled={page+1===totalPages} onClick={()=>goToPage(page+1)}>
        <span>Next</span><ChevronRight size={18} aria-hidden="true"/>
      </button>
    </nav>}
  </div>;
}
type Project = (typeof guidedProjects)[number];
function VirtualAsset({index,kind}: {index:number;kind?:'mine'|'orbit'}) {
  const Icon=(kind==='orbit' ? [Satellite,Camera,RadioTower] : kind==='mine' ? [Radio,Bell,Monitor] : [Rocket,MoveUpRight,Ruler])[index];
  return <div className="gp-rocket-asset"><Icon size={42} aria-hidden="true"/></div>;
}
function PartPhotos({name,projectId}: {name:string; projectId:string}) {
  const photos = projectPartPhotos(name);
  return <div className="gp-part-photos">
    {photos.length ? photos.map(photo => <figure key={photo.path}>
      <img src={photo.path} alt={photo.label}/>
      <figcaption>{photo.label} · <a href={photo.source ?? `https://www.adafruit.com/product/${photo.product}`} target="_blank" rel="noreferrer">Photo source</a></figcaption>
    </figure>) : <figure>
      <img src={image(projectId)} alt="" />
      <figcaption>Build illustration for context. Follow the specified dimensions and fit checks for this item.</figcaption>
    </figure>}
  </div>;
}
function RecyclingVendingTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Servo, Adafruit APDS9960 Library, Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Verify each exit</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the sketch.</strong> Install Servo and Adafruit APDS9960 Library with dependencies. Select Arduino Uno. Upload with servo power off, then open Serial Monitor at 115200 baud.</li>
          <li><strong>Calibrate the sample colors.</strong> Set up the shaded white light. Try blue and green paper bands and a neutral gray sample. Compare the logged red, green, blue and clear counts. Use matte tags with strong separation.</li>
          <li><strong>Check path selection.</strong> Confirm the diverter clears all three exits unloaded. Repeat with a sample and verify that only the selected exit reports a passage.</li>
          <li><strong>Check fault handling.</strong> Use a soft test sample held before the exit detector. Wait for a fault. The controller should lock with points unchanged. Power off and clear the chute before resetting.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{recyclingVending.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read, align, release, confirm</h3>
        <p>The sensor selects a bin if blue or green is greater than 135% of the other two channels and the clear reading is in range. The input is the color tag on the sample. The selected exit confirms release before one point is added.</p>
        <a className="gp-button gp-secondary" href="./project-files/recycling_vending.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function VendingMachineTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Arduino Servo library and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Verify credit and release</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with servo power off.</strong> Install Servo, select Arduino Uno, then upload. Open Serial Monitor at 115200 baud. Send a washer through the token slot and check for one credit.</li>
          <li><strong>Check one lane at a time.</strong> Test each rocker with its horn detached before fitting. Load two cans per lane. The in-memory stock and balance start at two per lane and zero credit on reset.</li>
          <li><strong>Test an approved sale.</strong> Insert enough tokens and press a lane button. Observe one can cross the chute. The log confirms the passage and shows a smaller credit balance.</li>
          <li><strong>Test a blocked dispense.</strong> Simulate a retained can. Credit stays unchanged and further selections lock. Power down, clear the chute, reload two cans per lane and reset for a fresh run.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{vendingMachine.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow one transaction</h3>
        <p>Prices are 1, 2, 2 and 3 tokens. An eligible selection opens its gate for 650 ms. The chute must detect the can within 1.6 seconds. The token sensor counts passages through a slot sized for the classroom washers.</p>
        <a className="gp-button gp-secondary" href="./project-files/four_slot_vending.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function GestureLampTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor and an opaque test card</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Verify timing and direction</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the sketch.</strong> Select Arduino Uno and open Serial Monitor at 115200 baud. With both beams clear, the lamp starts at Level 0.</li>
          <li><strong>Swipe in each direction.</strong> Pass a card across the left beam and then the right within 650 ms. Brightness steps up once. Return in the opposite direction after both beams clear.</li>
          <li><strong>Check for ignored gestures.</strong> Interrupt one beam and wait. Then clear the gate and interrupt both together. Neither should change the lamp level.</li>
          <li><strong>Check the limits.</strong> Continue brightening until Level 3. Further brightening swipes keep it there. Step down until it switches off.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{gestureLamp.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the brightness levels</h3>
        <p>Each valid swipe moves one step through PWM values 0, 85, 170 and 255. After any gesture, the controller waits for both paths to clear for 70 ms before rearming.</p>
        <a className="gp-button gp-secondary" href="./project-files/contactless_study_lamp.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SmartHeadlightsTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor and two desk lights or a shade card</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Compare the three beam states</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and check sensors.</strong> Select Arduino Uno and open Serial Monitor at 115200 baud. Record the ambient and forward counts with each sensor shaded and illuminated.</li>
          <li><strong>Try daylight and dusk.</strong> Keep the forward hood clear. Expose the roof sensor above 420, then shade it below 320. At dusk the low beam comes on first, followed by high after the clearance delay.</li>
          <li><strong>Dip and recover.</strong> Shine a second lamp into the hood so the forward count rises above 650. Remove it to drop below 530 and confirm high stays off while the clear timer runs.</li>
          <li><strong>Check the override.</strong> Hold the override around dusk and in daylight. The low-beam pair should remain on until release. Adjust thresholds for your bench readings if needed.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{smartHeadlights.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Why it uses two thresholds</h3>
        <p>Separate thresholds for entering and leaving darkness or glare keep small brightness changes from making the model flicker. Once glare clears, high beam waits 900 ms. Another glare event or a manual dip restarts that wait.</p>
        <a className="gp-button gp-secondary" href="./project-files/automatic_model_headlights.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function BleGamepadTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Espressif ESP32 board package 2.0.17, Android Bluetooth settings</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Upload, pair and test inputs</h3>
        <ol className="gp-program-steps">
          <li><strong>Select the board.</strong> Install Espressif’s ESP32 board package version 2.0.17 using Boards Manager. Select ESP32 Dev Module. The sketch uses the package’s bundled Bluetooth library.</li>
          <li><strong>Upload and pair.</strong> Connect USB, upload and open Serial Monitor at 115200 baud. Pair Atlas Gamepad through Android Bluetooth settings. Release all buttons before testing.</li>
          <li><strong>Check the input report.</strong> Test each direction and both actions in a compatible controller tester. Check diagonals with adjacent directions, opposite-pair cancellation and neutral on release. Android games vary in the gamepad layouts they accept.</li>
          <li><strong>Check reconnect.</strong> Disconnect and reconnect from Android. Release all switches and test again. If you change the HID layout, forget the device in Android and pair it again.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{bleGamepad.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the two input fields</h3>
        <p>The first byte contains the hat position. The four cardinal directions use 0, 2, 4 and 6. Neutral is 8. The action buttons use the low two bits of the second byte, so together they produce 3.</p>
        <p>The demo uses onscreen buttons or a keyboard. Use the Android controller test to verify the physical Bluetooth link.</p>
        <a className="gp-button gp-secondary" href="./project-files/android_ble_gamepad.ino" download>Download ESP32 sketch</a>
      </section>
    </div>
  </div>;
}

function LineFollowerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor, ruler and a wheel stand</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and verify tracking</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with motors off.</strong> Select Arduino Uno. Open Serial Monitor at 115200 baud. With the sensor at its installed height, send W over a light swatch and B over a dark one.</li>
          <li><strong>Check and store contrast.</strong> The sketch requires at least 120 raw counts of separation on each channel. If it rejects the readings, adjust standoff and recapture. Reset and look for Calibration loaded.</li>
          <li><strong>Verify wheel response.</strong> Keep both wheels raised and position a line under the sensor bar. Move the line to each side. The wheel nearer the line should slow and the other should speed up.</li>
          <li><strong>Run the curve and gap trials.</strong> Put the rover on the starting line and press Start. Begin with gentle bends. Insert a tape gap and verify LINE LOST appears and both wheels stop. Reposition on visible tape to run again.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{lineFollower.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the steering calculation</h3>
        <p>The Uno scales each sensor between its two captured readings. It subtracts the left reading from the right, divides by their total including the center, then adds the correction to one wheel and subtracts it from the other.</p>
        <p>When all three readings fall below the line threshold, the driver goes into standby. The browser models an explicit finish marker for the course. The physical rover stops on tape loss or when you press Start.</p>
        <a className="gp-button gp-secondary" href="./project-files/autonomous_line_following.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function RoomControllerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit SHT31 Library, Adafruit BusIO, Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Verify the switching band</h3>
        <ol className="gp-program-steps">
          <li><strong>Install and upload.</strong> Install Adafruit SHT31 Library with BusIO. Select Arduino Uno and upload with the fan supply off. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Check both thresholds.</strong> Read the measured temperature and move the dial until the target is more than 0.5 °C below it. The fan should turn on. Raise the target to more than 0.5 °C above the reading. The fan should turn off.</li>
          <li><strong>Compare the middle.</strong> Bring the target back close to the measured temperature after each test. Inside the band the fan retains its earlier state. Use the browser trial to test exact thresholds repeatedly.</li>
          <li><strong>Try a missing sensor.</strong> With power off, unplug the SHT31 and restart. Verify that the fan stays off and the monitor reports the fault. Restore the wiring with power off.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{roomController.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the controller state</h3>
        <p>Each row gives the measured temperature, the selected target and the output. The upper and lower thresholds differ by one degree. That gap keeps small changes near the target from rapidly cycling the fan.</p>
        <a className="gp-button gp-secondary" href="./project-files/smart_room_temperature.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function MotionPickTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Arduino Servo library, wheel stand and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Test drive and gripper independently</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and calibrate.</strong> Select Arduino Uno. Upload with the drive supply off. Lay the pad level, release Enable, reset and look for READY at 115200 baud.</li>
          <li><strong>Test the stop on a stand.</strong> Hold Enable and tilt along one axis at a time. Put a broad target inside 18 cm and verify Forward stops. Keep the area behind the rover clear while you verify Reverse. Lose the front echo and verify Forward stays inhibited.</li>
          <li><strong>Check servo travel.</strong> With wheel power off, release Enable, hold Gripper mode and press Enable again. Positive pitch raises the lift and positive roll closes the jaws. Verify each direction unloaded and reduce the endpoints if either mechanism binds.</li>
          <li><strong>Transfer a block.</strong> Back away after gripping, then drive toward a clear marked station. Release Enable, switch modes, lower the block and open the jaws.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{motionPick.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>How the modes differ</h3>
        <p>Clear Forward drive requires both a valid tilted pad and an echo of at least 18 cm. Wheel drive stays disabled in gripper mode. Changing mode while holding Enable locks motion until you release it.</p>
        <a className="gp-button gp-secondary" href="./project-files/motion_pick_place.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SolarLawnTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor, tape, stopwatch and multimeter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Check the route and pause state</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload.</strong> Select Arduino Uno. Upload with the motor pack switched off and open Serial Monitor at 115200 baud.</li>
          <li><strong>Verify the light gate.</strong> Measure the divider output in shade and bright light. Adjust LIGHT_START and LIGHT_STOP to distinguish them on your panel. Keep the start threshold higher than the stop threshold.</li>
          <li><strong>Tune the route.</strong> Raise both wheels and confirm motion. With a clear bounded tray, calibrate one straight pass and a right shift. Repeat for the left shift. The onboard LED identifies a straight pass.</li>
          <li><strong>Check resuming.</strong> Cover the panel during a straight pass, then restore the light and press Start. Watch the same unfinished pass complete. At the end, reposition and reset to run again.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{solarLawn.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>What the controller remembers</h3>
        <p>Each transition is a quarter turn, a lane-width shift and a second quarter turn. A pause preserves the current stage and its elapsed drive time. The tape marks let you compare the timed route with where the model actually traveled.</p>
        <a className="gp-button gp-secondary" href="./project-files/solar_lawn_coverage.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SolarTricopterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Arduino Servo library and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Verify both bench stations</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and center.</strong> Install Servo, select Arduino Uno, and upload with servo power off. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Test the light loop.</strong> Send S. Move a lamp in front of the two sensors. If the carrier turns away, reverse the direction in the sketch and recheck unloaded. The panel should hold when both sensors are balanced or covered.</li>
          <li><strong>Test tail tilt.</strong> Send T. Turn the knob from center in each direction and confirm that only the rear pod tilts. The other station holds its last command.</li>
          <li><strong>Try the virtual camera.</strong> Switch to Tricopter station in Finished demo. Lift into hover, steer until the camera is framed, center the tail and capture.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{solarTricopter.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Use the serial readout</h3>
        <p>Read each row as mode, left count, right count, panel angle and tail tilt. Servo angles are offsets from the mechanical center.</p>
        <a className="gp-button gp-secondary" href="./project-files/solar_tricopter_bench.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function GpsGsmTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit GPS Library, Serial Monitor, compatible 2G SMS service</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Check fix freshness and delivery</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with the recipient blank.</strong> Install Adafruit GPS Library, select Arduino Mega or Mega 2560 and open Serial Monitor at 115200 baud.</li>
          <li><strong>Check the no-fix case.</strong> Press Send before the GPS acquires a fix. It should log that it blocked the request. Move the tracker to a clear-sky spot you control and wait for the log to show a fresh coordinate pair.</li>
          <li><strong>Send one test message.</strong> Set a recipient you control and upload again. After GPS and GSM are ready, press Send once and compare the receiving phone with the nearby position log.</li>
          <li><strong>Repeat with GPS unavailable.</strong> Switch off before removing the GPS lead. Reboot and press Send. The previous report stays on the phone and the tracker blocks the new request.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{gpsGsm.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>What makes a fix fresh</h3>
        <p>The sketch accepts a valid RMC position less than ten seconds old. An explicit no-fix message invalidates the position immediately. The coordinates are copied when Send is pressed, so incoming GPS data cannot change an in-flight message.</p>
        <p>The classroom demo uses fictional checkpoints. During hardware testing, send only a location you have permission to share.</p>
        <a className="gp-button gp-secondary" href="./project-files/gps_gsm_location.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function HorizonTrackerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Arduino Servo library, desk lamp and tape marks</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Compare the peak across headings</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and center.</strong> Install Servo by Arduino and select Arduino Uno. Upload with servo power off. Open Serial Monitor at 115200 baud and check the 0° startup position before fitting the carrier.</li>
          <li><strong>Collect one sweep.</strong> Place a lamp to one side and leave it stationary while the panel turns. Press Scan and watch for 13 heading,count rows. Compare the retained heading with the row that had the highest count.</li>
          <li><strong>Move the lamp and repeat.</strong> Put the lamp on the other side, then scan again. Adjust the hood or shorten the travel limits if the peak stays flat or the carrier binds. Confirm the automatic sweep begins after 25 seconds idle.</li>
          <li><strong>Check the dim fallback.</strong> Cover the hood and run a sweep. When all readings fall below the threshold, confirm that the panel returns to the prior heading. Recheck your room’s dark and bright counts before changing the threshold.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{horizonTracker.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Why it waits between readings</h3>
        <p>The servo visits −60° to +60° in 10° steps. It pauses 300 ms before averaging eight ADC samples. If the carrier is still settling, lengthen the pause in the sketch and repeat the test.</p>
        <p>If two headings tie, the controller chooses the one closer to the previous retained heading. Readings are ADC counts, which you can compare under the same lighting setup.</p>
        <a className="gp-button gp-secondary" href="./project-files/automatic_solar_sweep.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function GsmEnergyTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit INA219 and BusIO, Serial Monitor, verified SMS-capable 2G service</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Verify the meter before sending</h3>
        <ol className="gp-program-steps">
          <li><strong>Install and upload.</strong> Install Adafruit INA219 and its dependencies. Select Arduino Uno. Leave the recipient blank for the first upload and open Serial Monitor at 115200 baud.</li>
          <li><strong>Compare loads.</strong> At a nominal 5 V, expect about 0.057 W with two 220 Ω resistors in series and 0.114 W with one. For one minute at 0.114 W the total rises by about 0.0019 Wh.</li>
          <li><strong>Check network registration.</strong> Verify local 2G SMS service with the carrier for that SIM and location. Follow the breakout's registration indicator. Enter a test number you control in the sketch, then upload again.</li>
          <li><strong>Send one report.</strong> Enter uppercase M. Compare the snapshot with the nearby meter log and check the receiving phone. If there is a timeout, check delivery before trying again.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{gsmEnergy.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>How the total and message work</h3>
        <p>The Uno multiplies load-side volts by amps for watts, then integrates consecutive valid readings over time. It skips missing or stale samples and starts the energy total at zero on boot.</p>
        <p>When you enter M, the sketch freezes that snapshot and works through the modem replies while sampling continues. The browser inbox models both successful and failed sends locally.</p>
        <a className="gp-button gp-secondary" href="./project-files/gsm_energy_meter.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function BleArmTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit PWM Servo Driver Library, Bluefruit LE Connect</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> From UART commands to motion</h3>
        <ol className="gp-program-steps">
          <li><strong>Install and upload.</strong> Install Adafruit PWM Servo Driver Library and BusIO. Select Arduino Uno and its USB port. Upload with servo power off.</li>
          <li><strong>Center with horns detached.</strong> Move Bluefruit to UART/Data mode. Power the external rail with the horns clear. Connect in the mobile app, open UART Terminal and send uppercase H. Check the sketch’s pulse centers and the kit’s required supply.</li>
          <li><strong>Set limits and verify direction.</strong> With power off, fit the horns. Begin with narrow limits. Use one positive and one negative jog. Adjust the sign and limits for your mechanism while the gripper is empty. The angle commands are offsets and physical travel depends on the servo.</li>
          <li><strong>Test Hold and transfer.</strong> Send S to hold the current joint commands. Keep the supply cutoff accessible because Hold leaves the servos energized. When verified, jog the block between two marks.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{bleArm.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Phone UART commands</h3>
        <div className="gp-table"><table><thead><tr><th>Joint</th><th>Increase</th><th>Decrease</th></tr></thead>
          <tbody>{armNames.map((name,i)=><tr key={name}><td>{name}</td><td><code>{armKeys[i]}</code></td><td><code>{armKeys[i].toUpperCase()}</code></td></tr>)}</tbody>
        </table></div>
        <p><code>H</code> enables or returns to neutral. <code>S</code> discards queued movement. Line endings are ignored. Serial Monitor at 115200 baud shows accepted characters.</p>
        <a className="gp-button gp-secondary" href="./project-files/bluetooth_robotic_arm.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function MimicHandTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Arduino Servo library, USB Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Capture the glove's motion</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and center.</strong> Install Servo by Arduino. Upload to the Uno and open Serial Monitor at 115200 baud. Check each servo at its 90° rest position before attaching a tendon.</li>
          <li><strong>Capture both endpoints.</strong> With the glove open, press Calibrate. Curl all five digits comfortably and press again. If the log names an input, check that strip’s divider and placement and repeat.</li>
          <li><strong>Test one channel.</strong> Move the index finger while keeping the others still. The index tendon should pull gradually. Repeat on the other four digits before copying a point or pinch.</li>
          <li><strong>Set safe travel.</strong> Start with light tendon tension. Change the per-finger endpoint in the curled array if any linkage binds or needs the opposite pull direction. Press Calibrate again to record both glove poses from scratch.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{mimicHand.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow one channel</h3>
        <p>A1 reads the index divider. The Uno maps the reading between the two captured counts to the index servo angles, limits it to that range, and adjusts D5 in small steps. The elastic return straightens the finger when the horn releases the tendon.</p>
        <a className="gp-button gp-secondary" href="./project-files/animatronic_mimic_hand.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function DialGaugeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library, Serial Monitor and protractor</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate the pointer</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with the pointer detached.</strong> Install Servo by Arduino, select Arduino Uno and its port, and upload. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Measure the knob endpoints.</strong> Move the knob to its desired low and high stops and record A0 from the log. Enter those values as <code>adcAtZero</code> and <code>adcAtFull</code>, then upload again.</li>
          <li><strong>Align the center.</strong> Turn the knob until the log reads 50%. Disconnect power, fit the pointer at the center mark, then check the direction. Change <code>reversePointer</code> if the sweep is reversed.</li>
          <li><strong>Compare readings from both directions.</strong> Check 0%, 50% and 100%, then approach 25% and 75% from both sides. Compare the scale to the serial percentage. Aim for an error of five percentage points or less.</li>
        </ol>
      </section>
      <section className="gp-program-card"><h3>Follow the reading through the code</h3>
        <p>The sketch averages eight A0 samples, limits the calibrated fraction to the scale, and converts it to a servo command between 30° and 150°. The serial percentage comes from the knob voltage. Use the dial face to check where the shaft actually points.</p>
        <a className="gp-button gp-secondary" href="./project-files/cardboard_dial_gauge.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function DrawbridgeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library and Serial Monitor</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Check the two crossings</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload before fitting the horn.</strong> Install Servo by Arduino, select Arduino Uno and its port, then upload. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Check direction without a load.</strong> Send <code>r</code> to raise, then <code>l</code> to lower. If <code>r</code> moves the deck toward the ledge, disconnect the linkage and change <code>reverseTravel</code> before retesting.</li>
          <li><strong>Check the landing and clearance.</strong> Adjust the endpoints in small increments until the deck meets the landing without forcing it and the boat clears the raised deck. Repeat three times.</li>
          <li><strong>Test one crossing at a time.</strong> Move the paper boat through the canal after the deck rises. Lower the deck and cross it with a small paper vehicle once it is level.</li>
        </ol>
      </section>
      <section className="gp-program-card"><h3>Read the command and check the deck</h3>
        <p>The sketch advances one degree every 24 ms and reports when it reaches the target command. Check the actual deck and clearance at both endpoints.</p>
        <a className="gp-button gp-secondary" href="./project-files/mini_drawbridge_model.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function LetterSorterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library and Serial Monitor</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Test both sorting routes</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with the chute empty.</strong> Install Servo by Arduino. Choose Arduino Uno and its USB port, then upload. Open Serial Monitor at 115200 baud. The sketch starts at a 90° command.</li>
          <li><strong>Check each destination.</strong> Press A, release it, then press B. The monitor reports which bin was commanded. If the physical destinations are reversed, swap <code>angleA</code> and <code>angleB</code> and upload again.</li>
          <li><strong>Keep the last selection when both are pressed.</strong> Start with both released, then press both together for at least 35 ms. The deck should hold. Release both before selecting again.</li>
          <li><strong>Sort and count six letters.</strong> Alternate square and circle letters. Select the matching bin and wait for the flap to stop before feeding one letter. Expect three in each bin and zero misroutes.</li>
        </ol>
      </section>
      <section className="gp-program-card"><h3>Diagnose a missed sort</h3>
        <p>The log reports the destination command. Look in the bins to verify arrival. If a letter sticks, clear it with power off, smooth the deck and recheck clearance with the chute empty.</p>
        <a className="gp-button gp-secondary" href="./project-files/model_letter_sorter_flap.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function CameraPanModelTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check repeatable framing</h3>
      <ol className="gp-program-steps">
        <li><strong>Install Servo and upload.</strong> Install Servo by Arduino through Library Manager. Open Serial Monitor at 115200 baud. With the horn detached, send <code>c</code>, then disconnect power before fitting the center-aligned horn.</li>
        <li><strong>Test the travel slowly.</strong> Start with clear space around the mock-up. Send <code>l</code> for 35° and <code>r</code> for 145°. If the mount binds, narrow the endpoints before retrying.</li>
        <li><strong>Return to center.</strong> Send <code>c</code> from each side. Check that the final command is 90° and compare the physical sight line from both approaches.</li>
        <li><strong>Change direction mid-pan.</strong> Send a new target before the current move finishes. The command moves toward the new target from its current value.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Compare command and sight line</h3><p>The sketch updates the command by at most two degrees every 20 ms. Observe the physical pointer to check the actual angle. The card camera helps test framing and alignment.</p>
      <a className="gp-button gp-secondary" href="./project-files/desktop_camera_pan_model.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function WindVaneTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Wire and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate the compass marks</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Turn the shaft by hand and verify the raw readings change.</li>
        <li><strong>Set the reference.</strong> Align the pointer with N and send <code>n</code>. Rotate clockwise to E and send <code>e</code>. The sketch checks that east is within 22.5° of a quarter turn.</li>
        <li><strong>Check a full circle.</strong> Look for about 0°, 90°, 180° and 270° at the marks. Return to N and verify the wrap through 360°.</li>
        <li><strong>Test with gentle airflow.</strong> Apply air from the marked sides one at a time and wait for the pointer to settle. Recheck the pivot and magnet alignment if the reading jumps or does not follow the vane.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read direction relative to the base</h3><p>The magnet turns with the shaft. The north capture sets zero, while the east capture determines which direction increases the count. The sketch reads the sensor registers with Wire.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_wind_vane_pointer.ino" download>Download Arduino sketch</a>
      <p><a href="https://learn.adafruit.com/adafruit-as5600-magnetic-angle-sensor/pinouts" target="_blank" rel="noreferrer">AS5600 breakout pinout</a></p>
    </section></div>
  </div>;
}

function ParkingBarrierTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Verify opening and clearance</h3>
      <ol className="gp-program-steps">
        <li><strong>Install Servo and upload.</strong> Use Arduino IDE Library Manager to install Servo by Arduino. Open Serial Monitor at 115200 baud. Start without the arm attached and verify the two commanded positions.</li>
        <li><strong>Block either beam independently.</strong> With the tabletop lane clear, pass an opaque card through the approach beam, then through the under-arm beam. Either input should raise the servo command.</li>
        <li><strong>Check the delayed return.</strong> Leave either beam blocked and wait. Then clear both to start the 1.5-second delay. Interrupt the delay and verify the arm stays up until the next uninterrupted clear interval.</li>
        <li><strong>Attach the lightweight arm and test the toy car.</strong> Adjust the 15° and 95° endpoints if your model requires it. Pause at the approach until the arm is up, drive through, and check that the arm lowers after the car clears.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Trace the two inputs</h3><p>Either low reading sets the open command. The Uno starts a new clear timer whenever both inputs return high. Beam placement matters because the controller can only detect objects where the two beams cross the lane.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_parking_barrier.ino" download>Download Arduino sketch</a>
      <p><a href="https://learn.adafruit.com/ir-breakbeam-sensors/arduino" target="_blank" rel="noreferrer">Break-beam wiring reference</a></p>
    </section></div>
  </div>;
}

function ControllerInputTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test each input separately</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Release every control and send <code>c</code>. Confirm that the centered offsets are near zero and neutral is 1.</li>
        <li><strong>Sweep the axes.</strong> Move the stick left and right and watch X. Move it forward and back and watch Y. The raw values depend on the unit and its orientation.</li>
        <li><strong>Test press and release.</strong> Press the stick down and then release it. Its digital column should change independently. Repeat for A and B.</li>
        <li><strong>Hold two buttons together.</strong> Check that both columns become 1, then release them one at a time. The log should reflect both states independently.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the neutral zone</h3><p>The sketch averages raw axis samples and compares them with the captured center. Neutral is true when both offsets stay within 55 ADC counts. Each digital input settles for 25 ms before changing its reported state.</p>
      <a className="gp-button gp-secondary" href="./project-files/game_controller_input_tester.ino" download>Download Arduino sketch</a>
      <p><a href="https://www.adafruit.com/product/512" target="_blank" rel="noreferrer">Joystick breakout specifications</a></p>
    </section></div>
  </div>;
}

function HandheldSignalTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Count the flashes</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. The paddle should start dark.</li>
        <li><strong>Tap the thumb button.</strong> Count three flashes. Each lasts 240 ms and the gaps last 240 ms.</li>
        <li><strong>Test a long hold and a second tap.</strong> Keep the switch down through one burst, then test another press during a burst. Neither should extend it or add a second sequence.</li>
        <li><strong>Send a fresh burst.</strong> Release the switch. After Burst finished appears in the log, press again for three more flashes.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the timing</h3><p>The switch must settle for 25 ms. The sketch starts one burst per accepted press and uses elapsed time to alternate the lamp. The output ends after the third flash.</p>
      <a className="gp-button gp-secondary" href="./project-files/handheld_signal_paddle.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function DrawerIndicatorTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check three drawer positions</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Start with the drawer open and confirm D2 is high and the LED is off.</li>
        <li><strong>Leave the drawer ajar.</strong> Slide it close to the stop and pause before the tab reaches the roller. The input remains high.</li>
        <li><strong>Seat the drawer.</strong> Push gently until the tab presses the roller. After the contact settles for 25 ms, the log shows D2 low and the LED lights.</li>
        <li><strong>Open and repeat.</strong> Pull back until the roller releases. The LED goes out. Try several gentle close-and-open cycles and adjust the bracket if the LED lights before the drawer is seated.</li>
      </ol>
    </section><section className="gp-program-card"><h3>What the indicator measures</h3><p>The switch detects contact with the rear tab. The series resistor limits LED current. The Arduino follows the stable contact, so the light changes back as soon as the roller releases and settles.</p>
      <a className="gp-button gp-secondary" href="./project-files/drawer_closed_indicator.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function MailboxFlagTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Verify the reminder and reset</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Start with the flap open. The light should be off.</li>
        <li><strong>Close, open and close the flap.</strong> Check for Flap shut, then Flap opened. The LED stays on after you close the flap again.</li>
        <li><strong>Try resetting while open.</strong> Open the flap and press RESET. The log asks you to shut it and the LED stays on.</li>
        <li><strong>Close it and press RESET again.</strong> The indicator goes out. Opening the flap once more should light it again.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why the flag stays lit</h3><p>The roller switch reports the flap position. The sketch stores an opening event separately and waits 25 ms for contact bounce to settle. Reset clears the stored event only with a stable closed flap.</p>
      <a className="gp-button gp-secondary" href="./project-files/mailbox_test_flag.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function ModelCrossingTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Verify the crossing sequence</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload and open Serial Monitor.</strong> Use 115200 baud. Vehicle green and pedestrian WAIT should light first.</li>
        <li><strong>Request service during green.</strong> Check the queued message. Green runs for at least three seconds before a queued request starts amber.</li>
        <li><strong>Trace each timed phase.</strong> Amber lasts 1.2 s, all-stop lasts 0.8 s, WALK lasts 4 s, then red and WAIT stay on for a 1.5 s clearance before green returns.</li>
        <li><strong>Check repeated presses.</strong> Hold the switch through the sequence and try another tap during WALK. Neither should cause another round. Release and make a fresh press in green to repeat.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the two signal heads</h3><p>The Uno stores one request and advances through timed phases. Vehicle green and pedestrian WALK are cleared before the outputs are updated. The two heads show how the tabletop controller separates movement and clearance.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_crossing_request.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function AccessibleDeskSwitchTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare the two modes</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Release both switches. The log starts in Hold mode.</li>
        <li><strong>Press and release the paddle.</strong> In Hold, the light follows each press. Try different positions along the front edge and make sure the travel stops protect the roller.</li>
        <li><strong>Change to Toggle mode.</strong> Press the paddle once and release it. The light stays on. A second press turns it off. A long hold still counts as one press.</li>
        <li><strong>Change modes with the paddle down.</strong> The LED clears. Release the paddle, then press again to try the new mode.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Compare the interaction</h3><p>The broad surface changes where the user can press. Hold requires continued pressure. Toggle keeps the output until the next press. The sketch waits 25 ms for the contacts to settle.</p>
      <a className="gp-button gp-secondary" href="./project-files/accessible_desk_switch.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function ElevatorCallLightTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test the call and arrival inputs</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Move the model car away from the landing. The light should be off.</li>
        <li><strong>Tap CALL and release it.</strong> The log should report Call waiting. D8 stays high after D2 returns to its idle level.</li>
        <li><strong>Move the car to the marked floor.</strong> Watch the roller move and confirm the light turns off when D3 becomes stably low.</li>
        <li><strong>Test the arrival priority.</strong> Call while the car rests at the landing. The light stays off. Move the car away and make a fresh press to latch it again.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Follow the stored request</h3><p>Both inputs wait 25 ms for bouncing contacts to settle. The pending flag remembers a call until the landing input closes. The car is moved by hand so its position is controlled separately from the electrical state.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_elevator_call_light.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function ModelDoorbellTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check each chime phase</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud and check for Doorbell ready. The indicator should be off.</li>
        <li><strong>Tap the button.</strong> Listen for 880 Hz, a pause and 660 Hz. The LED stays on through the pause and goes out at the end.</li>
        <li><strong>Hold the button.</strong> Keep it pressed through the entire chime. The sequence should play once. Release and tap again to repeat.</li>
        <li><strong>Check a quick second tap.</strong> Press again while the chime is active. It should finish its current sequence. Then try another press after Doorbell ready appears.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Follow the timing</h3><p>The sketch waits 25 ms for the switch to settle, then plays a 180 ms high note, waits 90 ms, and plays a 300 ms low note. It checks the button throughout the sequence and accepts a fresh stable press when idle.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_doorbell_panel.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function QuizDeskTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test the result and reset</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Release all buttons and look for Round armed.</li>
        <li><strong>Test each winning order.</strong> Press A, release it, then press B. Only A stays lit. Reset and repeat with the reactions reversed.</li>
        <li><strong>Reset while a team button is held.</strong> Hold A, press and release RESET, and verify both lights remain off. Release A. Wait for Round armed, then press again to start a new result.</li>
        <li><strong>Study a tie.</strong> Use the demo’s simultaneous press control to test what happens when two stable press edges land in the same update. Both LEDs light. On hardware even a small difference can give one edge priority in time.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Watch the round state</h3><p>The sketch waits 25 ms for each switch to settle. After a result, the team inputs leave it locked until reset. Reset clears the lamps and waits until all switches are released before arming.</p>
      <a className="gp-button gp-secondary" href="./project-files/quiz_desk_response_button.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function LibraryHelpButtonTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test the request and acknowledgment</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Expect Ready and both LEDs off.</li>
        <li><strong>Hold HELP, then release.</strong> Both LEDs light while the press is held. Releasing turns off the visitor LED. The staff LED stays lit.</li>
        <li><strong>Press ACKNOWLEDGE.</strong> One new press clears the waiting light. Press it again while idle and confirm nothing changes.</li>
        <li><strong>Request again.</strong> A new HELP press lights the staff LED again. Hold it for several seconds and confirm the log shows only one request event.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Follow the two types of feedback</h3><p>The visitor LED shows the current switch state. The staff LED shows a stored request. The sketch waits 25 ms for each switch to settle. If press edges arrive in the same update, the request is kept.</p>
      <a className="gp-button gp-secondary" href="./project-files/library_help_button.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function WindowBoxComparisonTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a spreadsheet</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare paired readings across a day</h3>
      <ol className="gp-program-steps">
        <li><strong>Calibrate both probes.</strong> Open Serial Monitor at 115200 baud. Send <code>d</code> with both blades in the dry reference and <code>w</code> in the damp reference. Keep their depth and spacing consistent.</li>
        <li><strong>Start both boxes together.</strong> Install the probes and wait for stable readings. Send <code>b</code> for a header and baseline row. Both losses should begin at zero.</li>
        <li><strong>Log at the same times.</strong> Send <code>l</code> at planned intervals and note the lighting conditions. The last column subtracts the shade loss from the window loss.</li>
        <li><strong>Check repeatability.</strong> Plot loss against elapsed time. A positive difference means the window sample lost more index points. Repeat with fresh soil and the probes swapped between positions.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Compare the placements</h3><p>Window and shade positions can differ in temperature and airflow as well as light. Record those conditions alongside the serial log. The relative index reports the local sensor response against the calibration samples.</p>
      <a className="gp-button gp-secondary" href="./project-files/window_box_comparison.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SoilDryingTimerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Confirm the threshold on a timer</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload and calibrate.</strong> Open Serial Monitor at 115200 baud. Send <code>d</code> in the dry reference and <code>w</code> in the damp reference. Use <code>p</code> to preview the test tray.</li>
        <li><strong>Start with a stable damp reading.</strong> When the relative index is above 35, enter <code>b</code>. The sketch logs an initial row and samples every 60 seconds after that.</li>
        <li><strong>Check the count.</strong> Each reading at 35 or below advances the count. Any higher reading clears it. A third consecutive low reading lights the LED and prints the confirmed drying time in seconds.</li>
        <li><strong>Repeat under matched conditions.</strong> Keep sample amount, water dose, probe depth, threshold and interval fixed. Reset with <code>r</code> and recapture the reference readings for the fresh trial.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the elapsed time</h3><p>The result is the time to confirmation, which includes the wait for three scheduled samples. The first low reading can come earlier. Keep the sampling interval the same when comparing trials.</p>
      <a className="gp-button gp-secondary" href="./project-files/soil_drying_timer_study.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function CapillaryWateringTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a timer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare matched wick trials</h3>
      <ol className="gp-program-steps">
        <li><strong>Calibrate the probe.</strong> Open Serial Monitor at 115200 baud. In the dry reference, enter <code>d</code>. In the damp reference, enter <code>w</code>. Hold the blade at the same marked depth for both measurements.</li>
        <li><strong>Log the control.</strong> Leave the wick end above the water and enter <code>c</code>. The serial log starts at zero change. Enter <code>l</code> at planned intervals and record each row.</li>
        <li><strong>Repeat with contact.</strong> Prepare fresh soil and an identical wick, keep the probe depth and reservoir waterline fixed, then lower the wick into the water. Enter <code>i</code> and log at the same intervals.</li>
        <li><strong>Compare the changes.</strong> If the wetted wick raises the index near the blade, note when the rise becomes clear. If the readings stay close together, inspect the wick contact, height and sampling interval.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Trace the water path</h3><p>Water wets the cotton fibers and can move through the small spaces between them into the soil. The probe reads the effect near its blade. Wick size, lift height and soil contact influence the response.</p>
      <a className="gp-button gp-secondary" href="./project-files/capillary_watering_model.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function PlantPotDepthTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a graduated cylinder</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Find the first rise at each depth</h3>
      <ol className="gp-program-steps">
        <li><strong>Calibrate both probes.</strong> Open Serial Monitor at 115200 baud. Enter <code>d</code> in the shared dry reference and <code>w</code> in the shared damp reference. Use <code>p</code> to check that the channels respond.</li>
        <li><strong>Fix both probe positions.</strong> Install the upper and lower blades at the marked depths. Once the readings settle, enter <code>b</code>. The first CSV row reports zero rise in both layers.</li>
        <li><strong>Pour immediately after the baseline.</strong> Add the measured 60 mL, then enter <code>l</code> at equal intervals. Record any delay between capturing the baseline and pouring.</li>
        <li><strong>Compare first observations.</strong> Each channel’s first-response field is blank until that channel rises by 8 points. It then keeps the first observed time. Compare the observed times at the same sampling interval.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Understand the threshold</h3><p>The two probes have separate calibration endpoints and baselines. The threshold is an 8-point rise on the relative index. It records when a change was first observed near each blade. The interval between samples limits time resolution.</p>
      <a className="gp-button gp-secondary" href="./project-files/plant_pot_depth_comparison.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function DrainageBottleTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a graduated cylinder</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Distinguish runoff from drying</h3>
      <ol className="gp-program-steps">
        <li><strong>Capture references.</strong> Upload to Arduino Uno and open Serial Monitor at 115200 baud. Enter <code>d</code> in the dry reference and <code>w</code> in the damp reference. Use <code>p</code> to preview the reading.</li>
        <li><strong>Measure and pour 60 mL.</strong> Wait for the probe to respond and enter <code>b</code> once its index is above 35. This sets the time origin.</li>
        <li><strong>Log at regular intervals.</strong> Enter <code>l</code> to capture a row. When runoff stops, measure it separately and record its volume. Choose an interval long enough to see drying and write it down.</li>
        <li><strong>Record the first dry-range reading.</strong> At index 35 or below, the sketch prints the time of that sample and the time of the previous higher reading. Use those times as the observed crossing interval.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Interpret the two results</h3><p>The graduated cylinder measures water leaving the bottle. The probe measures the local soil condition above the outlet. The sample can remain damp after dripping stops. The threshold is a classroom comparison on a relative scale.</p>
      <a className="gp-button gp-secondary" href="./project-files/drainage_bottle_experiment.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function MulchMoistureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a spreadsheet</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Record a paired time series</h3>
      <ol className="gp-program-steps">
        <li><strong>Calibrate both probes.</strong> Open Serial Monitor at 115200 baud. Send <code>d</code> with both probes in the dry reference and <code>w</code> in the damp reference. Send <code>p</code> to preview the raw pair after a move.</li>
        <li><strong>Capture the starting point.</strong> With both probes at equal depth in their test trays, send <code>b</code>. Confirm that the CSV header and elapsed-zero row appear. Both loss columns should start at zero.</li>
        <li><strong>Keep the schedule.</strong> Send <code>l</code> at each planned interval. Copy the CSV header and rows into a spreadsheet, then plot both loss columns against elapsed seconds.</li>
        <li><strong>Repeat with positions swapped.</strong> Prepare fresh soil portions and keep the water amount fixed. Check whether the tray with lower loss stays the same when its position changes.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Compare changes from baseline</h3><p>Each probe has its own dry and damp raw reference. Loss is the starting relative index minus the current index, in points on that scale. A negative loss means the measured index rose. Record what you observe and keep the reference captures with your notes.</p>
      <a className="gp-button gp-secondary" href="./project-files/mulch_moisture_experiment.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function ClaySoilCalibrationTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test repeatability with fixed moisture</h3>
      <ol className="gp-program-steps">
        <li><strong>Set the endpoints.</strong> Upload to Arduino Uno and open Serial Monitor at 115200 baud. Send <code>d</code> in the dry sample and <code>w</code> in the evenly damp sample, waiting for each to settle.</li>
        <li><strong>Capture three snug readings.</strong> Send <code>s</code> to start a new snug set. Place the probe to the marked depth and send <code>n</code>. Remove and reseat at the same depth before each of the remaining two captures.</li>
        <li><strong>Capture three air-gap readings.</strong> Send <code>g</code> to start a new gap set. Use the same test cup and depth with a visible gap beside the blade. Capture three separate readings with <code>n</code>.</li>
        <li><strong>Compare raw ranges.</strong> For each set, the sketch subtracts its minimum from its maximum. A shift between sets indicates that placement affected the reading. The spread describes consistency across repeats.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Keep the comparison fair</h3><p>Use the same soil and depth for both repeat sets. The relative index only describes where the reading lies between your clay-rich references. Recalibrate after changing the soil or resetting the board.</p>
      <a className="gp-button gp-secondary" href="./project-files/clay_soil_calibration.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SandySoilCalibrationTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a sample log</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Capture the calibration points</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud and wait for stable readings.</li>
        <li><strong>Set the endpoints.</strong> Send <code>d</code> with the probe in the 0 mL cup and <code>w</code> in the 30 mL cup. Confirm the live index reads close to 0 and 100 at those endpoints.</li>
        <li><strong>Measure the middle dose.</strong> Wipe the blade and insert it into the 15 mL cup at the same depth. Send <code>m</code> and record its raw count, index and difference from 50.</li>
        <li><strong>Repeat and compare.</strong> Take three middle readings without changing the endpoints. If the spread is large, check the depth, packing and mixing before repeating. Send <code>r</code> when starting a new calibration.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Compare the dose and the reading</h3><p>The index gives the dry sample a 0 and the wetter sample a 100. A value of 50 means the reading is halfway between those endpoints. Equal water additions can produce unequal changes in the sensor reading. If the endpoints are less than 12 ADC counts apart, the sketch leaves the scale unset.</p>
      <a className="gp-button gp-secondary" href="./project-files/sandy_soil_calibration.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SeedlingTrayMoistureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check the two channels independently</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Verify that both EDGE and INNER report raw readings.</li>
        <li><strong>Capture the dry and damp endpoints.</strong> Put both probes at the chosen depth in the dry sample, wait for stable readings and send <code>d</code>. Repeat in the damp sample with <code>w</code>. Check the log for a reference gap of at least 12 counts on each channel.</li>
        <li><strong>Check both LEDs.</strong> The dry reference should give an index near 0 and light both LEDs. The damp reference should give an index near 100 and clear both LEDs.</li>
        <li><strong>Move the probes into the tray.</strong> Water only the cell with a dry flag. Wait for the moisture to spread. Look for a rise on that channel while its neighbor stays near its starting reading.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why scale the channels separately?</h3><p>Two probes can output different voltages in the same mix. Separate reference pairs set a 0–100 relative index for each probe. Each flag turns on at 35 or below, clears at 45 or above, and holds its previous state between those limits. After a reset, capture both references again.</p>
      <a className="gp-button gp-secondary" href="./project-files/seedling_tray_moisture_check.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function BasilPotMoistureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate before checking the pot</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Select the Uno and its port. Open Serial Monitor at 115200 baud and confirm the raw value changes between samples.</li>
        <li><strong>Measure the dry cup.</strong> Hold the probe at the chosen depth until the reading settles and send <code>d</code>. The dry reference becomes the zero point.</li>
        <li><strong>Measure the damp cup.</strong> Wipe the blade and insert it to the same depth in the damp mix. Send <code>w</code> once the reading settles. If the endpoints differ by fewer than 12 ADC counts, check the wiring, sample preparation and depth, then capture both again.</li>
        <li><strong>Test the flag and move to the pot.</strong> In the dry cup expect near 0 and an illuminated LED. In the damp cup expect near 100 and an unlit LED. In the pot the flag turns on at 30 or below and clears at 40 or above.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the relative index</h3><p>The sketch maps the two captured readings to 0 and 100, even when the raw value decreases as the mix gets wetter. This scale describes the local reading relative to your samples. Capture the references again after a reset or power cycle, and recalibrate if you switch potting mixes.</p>
      <a className="gp-button gp-secondary" href="./project-files/basil_pot_moisture_flag.ino" download>Download Arduino sketch</a>
      <p><a href="https://wiki.dfrobot.com/sen0193/" target="_blank" rel="noreferrer">SEN0193 wiring and specifications</a></p>
    </section></div>
  </div>;
}

function EquipmentEnclosureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare the case with the room</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Select the Uno and its serial port. Open Serial Monitor at 115200 baud. Each row reports case temperature, room temperature, their difference, and the LED state.</li>
        <li><strong>Check both channels in the same air.</strong> Set the probes side by side. If either disagrees with a reference after settling, enter its measured correction in the sketch.</li>
        <li><strong>Compare vent positions.</strong> Add the sealed warm bottle, close the vent, and log a reading after it settles. Open the vent and repeat. Compare the difference between case and room in both trials.</li>
        <li><strong>Verify both thresholds in the demo.</strong> Start at 24 °C room temperature with the vent closed and heat on. The LED turns on at 34 °C inside. Open the vent and watch it stay lit through 33 °C and clear at 32 °C.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why use a room probe?</h3><p>A warmer room can raise both readings. Subtracting the room reading shows how much extra heat builds up in the case. The LED uses the case temperature so it can still warn in a warm room. The two thresholds prevent rapid toggling near 34 °C.</p>
      <a className="gp-button gp-secondary" href="./project-files/equipment_enclosure_monitor.ino" download>Download Arduino sketch</a>
      <p><a href="https://www.analog.com/en/products/tmp36.html" target="_blank" rel="noreferrer">TMP36 datasheet and package details</a></p>
    </section></div>
  </div>;
}

function ColdPackWarmingTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Time a warm-air event</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Compare the probe with a reference in stable air before adding the chilled pack.</li>
        <li><strong>Start with cool air at the sensor.</strong> Place the pack in the tray and let the air reading settle below 18 °C. The warning should be off.</li>
        <li><strong>Remove the pack.</strong> At 20 °C the log should show TIMING. After three continuous seconds at or above 20 °C, the log changes to WARM and the LED turns on.</li>
        <li><strong>Replace the pack.</strong> The LED stays lit while the air cools through 19 °C and clears at 18 °C or below. Try a shorter trial and cool the probe before the warm timer finishes.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why track the time?</h3><p>A single warm reading starts the timer. Any reading below 20 °C before the three seconds finish cancels that attempt. The exercise uses a nearby air reading as its input. The browser shows this response on an accelerated clock.</p>
      <a className="gp-button gp-secondary" href="./project-files/cold_pack_warming_indicator.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function VentOutletTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare outlet and room measurements</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud and confirm both probes settle near the same reference temperature. Enter any stable corrections in <code>correctionC</code> in outlet, room order.</li>
        <li><strong>Warm the outlet area.</strong> Keep the room probe outside the stream. In the browser, use 30 °C at the outlet and 26 °C in the room. This lights the flag at both trigger limits.</li>
        <li><strong>Try uniform warmth.</strong> Warm both inputs to the same reading. The flag clears when the difference drops to 2 °C or less even if the outlet stays warm.</li>
        <li><strong>Try the other clearing condition.</strong> Re-trigger the flag, then cool the outlet to 28 °C while keeping the room cooler. The flag clears even with a large difference.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the comparison</h3><p>The sketch averages 16 samples per channel and subtracts room temperature from outlet temperature. The flag remembers its previous state between the trigger and clearing limits.</p>
      <a className="gp-button gp-secondary" href="./project-files/vent_outlet_temperature_indicator.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SolarOvenMonitorTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor, protractor and reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Record two comparable trials</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload and open Serial Monitor at 115200 baud.</strong> Compare with a reference thermometer in stable air. If there is a repeatable difference, adjust <code>correctionC</code>.</li>
        <li><strong>Choose a clear starting condition.</strong> Let the box reach room temperature before each run. Send <code>R</code> to start a new elapsed-time and peak record.</li>
        <li><strong>Change only the flap angle.</strong> Keep the light source, closed cover, probe and test duration fixed. Copy the CSV rows for an aligned run and an angled-away run.</li>
        <li><strong>Compare the temperatures and peaks.</strong> The warm LED indicates 38 °C or above. When the collector cools, the LED turns off and the peak remains until a reset.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the program output</h3><p>The sketch reports elapsed milliseconds, air temperature, peak temperature, and the warm flag once per second. The browser records a sample each time its modeled temperature changes. Compare the patterns without treating the browser timing as a physical measurement.</p>
      <a className="gp-button gp-secondary" href="./project-files/solar_oven_model_monitor.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function AquariumTemperatureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and water-rated reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare water and wall readings</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. The sketch prints the corrected dry wall temperature and flag state.</li>
        <li><strong>Let both readings settle.</strong> Compare the water-rated thermometer and the wall probe in a stable setup. If there is a repeatable settled offset, enter it as <code>settledOffsetC</code> and upload again.</li>
        <li><strong>Watch the model warm.</strong> In the demo, change the water from 24 °C to 31 °C. The simulated wall reading follows. Check that the LED comes on when the wall reaches 28 °C.</li>
        <li><strong>Then cool.</strong> The warning stays on at a wall temperature of 27 °C and clears at 26 °C or below. Compare the simulation with the physical model’s settled readings.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why the wall responds later</h3><p>Heat travels through the container wall before the outside probe warms. The browser illustrates that delay. The measured response depends on the wall material, probe contact, and room conditions.</p>
      <a className="gp-button gp-secondary" href="./project-files/aquarium_model_temperature_alert.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function IncubatorTemperatureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check the alarm and reset</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Start with the model cool and verify that the log reads READY, with both outputs off.</li>
        <li><strong>Warm through 37 °C.</strong> At the trigger, the LED lights and the piezo gives short bursts. The temperature limits are settings for this electronics exercise.</li>
        <li><strong>Acknowledge while still warm.</strong> Press and release. The sound stops and the LED stays on. Cooling the model also leaves the LED on.</li>
        <li><strong>Reset at 35 °C or below.</strong> Press again after cooling. Both outputs clear. Repeat the warming trial and verify that the alarm can sound again.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why the warning stays visible</h3><p>The sketch stores that the alarm occurred. Above the reset temperature, the button silences the piezo while the LED keeps showing the event. After the chamber cools, a new press clears that stored alarm.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_incubator_temperature_alert.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SunlitWindowTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Confirm the temperature difference</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. The log shows both readings, their difference, and the flag.</li>
        <li><strong>Check both probes in the same air.</strong> Let the sensors settle beside the thermometer. Enter steady offsets in <code>correctionC</code>, first for A0 and second for A1, then upload again.</li>
        <li><strong>Warm the sill locally.</strong> Keep the reference shaded. The flag needs at least 31 °C at the sill and at least 4 °C difference. At 31 °C versus 27 °C, expect the flag on.</li>
        <li><strong>Compare uniform warming and recovery.</strong> At 31 °C versus 29 °C the difference clears the flag. At 32 °C on both probes it also stays clear. Cool the sill to 29 °C to check the second clearing condition.</li>
      </ol>
    </section><section className="gp-program-card"><h3>What the two inputs tell you</h3><p>A warm reading on its own can come from the whole room warming. Comparing with a shaded probe adds evidence for a local difference. The model thresholds apply to this activity.</p>
      <a className="gp-button gp-secondary" href="./project-files/sunlit_window_monitor.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SeedTrayTemperatureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare the two channels</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. The sketch prints both temperatures followed by their independent D8 and D9 states.</li>
        <li><strong>Compare in the same air.</strong> Put both probes by the reference and let them settle. If one has a steady offset, enter its correction in the corresponding left or right entry of <code>correctionC</code>.</li>
        <li><strong>Warm one side at a time.</strong> Reach at least 26 °C on the left while the right remains below the trigger. Expect only D8 on. Clear the left and repeat for D9.</li>
        <li><strong>Test both together.</strong> Once both reach 26 °C, cool one side only. Its flag holds between 25 °C and 26 °C, then clears at 25 °C. The other flag should remain on.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the local difference</h3><p>Two points on the same tray can have different temperatures. The sketch averages each input and applies the limits separately, so cooling one side cannot clear the other side’s warning. The temperatures are settings for this electronics exercise.</p>
      <a className="gp-button gp-secondary" href="./project-files/seed_tray_temperature_flag.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function DeskComfortTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Verify the measured and selected values</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload for Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Put the reference probe near the TMP36 and let the two readings settle. Correct a steady offset in <code>temperatureCorrectionC</code> if needed.</li>
        <li><strong>Set the upper threshold to 27 °C.</strong> Adjust the dial until the log shows 23–26 °C as the selected band. The sketch averages 16 samples per input and rounds to whole degrees.</li>
        <li><strong>Check each zone.</strong> With that band, 22 °C lights amber, 23–26 °C lights green, and 27 °C or higher lights red. Exactly one LED should light at a time.</li>
        <li><strong>Hold the air steady and turn the dial.</strong> At 26 °C, lower the upper threshold from 27 °C to 26 °C. The LED should change from green to red while the temperature remains steady.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Two independent inputs</h3><p>A0 measures the air and A1 sets the limit. Comparing the same air reading with two different dial positions shows why the selected band and measured temperature appear separately in the display.</p>
      <a className="gp-button gp-secondary" href="./project-files/desk_comfort_monitor.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function TerrariumTemperatureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a reference thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check the two temperature thresholds</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. The sketch averages 16 analog samples and reports the measured voltage and calculated temperature.</li>
        <li><strong>Compare sensors side by side.</strong> Let the reference and TMP36 stabilize before comparing them. If you measure the Uno’s analog reference, enter it in <code>referenceVolts</code>. A remaining steady offset can go in <code>temperatureCorrectionC</code>.</li>
        <li><strong>Warm through 29 °C.</strong> Slowly warm the air in the empty model. Read the Celsius value in the log as the flag turns on.</li>
        <li><strong>Open the vent and cool.</strong> Remove the warm source. At 28 °C the flag should still be lit. The sketch clears it when the calculated reading falls to 27 °C or below.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Convert the voltage to temperature</h3><p>The TMP36 has a nominal offset of 0.500 V and a slope of 0.010 V per degree Celsius. A reading of 0.790 V therefore corresponds to about 29 °C. Use the reference thermometer for checking the physical setup. The demo uses nominal voltages.</p>
      <p><a href="https://www.analog.com/media/en/technical-documentation/data-sheets/tmp35_36_37.pdf" target="_blank" rel="noreferrer">TMP36 data sheet and pinout</a></p>
      <a className="gp-button gp-secondary" href="./project-files/terrarium_temperature_flag.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function TunnelModelTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and an opaque screen</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Time the entrance light</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Record A0 with the screen in place and then with the sensor exposed. Enter those two references and upload again.</li>
        <li><strong>Pass the screen briefly.</strong> Start above 52%. Shade the sensor for less than 700 ms. The log may show that darkness is being timed, but the lamp should stay off.</li>
        <li><strong>Leave the screen in place.</strong> Keep the reading at 42% or below. After about 700 ms the entrance lamp should turn on. Check that its own beam does not immediately brighten A0 and clear the lamp.</li>
        <li><strong>Restore the interior light.</strong> Raise the reading into the 43–51% band. The lamp holds. At 52% or above it switches off.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why the timer resets</h3><p>The sketch checks A0 throughout the wait. If the reading rises above 42% before the wait finishes, it discards that timing interval. A later shadow must meet the full 700 ms again.</p>
      <a className="gp-button gp-secondary" href="./project-files/tunnel_model_light.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function CampingLanternTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a shade card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and verify each mode</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Record raw A0 when shaded and in bright light, enter those values in the references and upload again.</li>
        <li><strong>Check Auto.</strong> The lantern starts in Auto. It should turn on at 35% or below, stay on through the middle band and turn off when light reaches 45%.</li>
        <li><strong>Check each override.</strong> With the sensor bright, press once to enter On override. The lamp stays on. Press again for Off override, then shade the sensor. The lamp stays off.</li>
        <li><strong>Return to Auto.</strong> Press once more while the sensor is shaded. The lantern should light. Hold the button on a later press and check that it advances just one mode.</li>
      </ol>
    </section><section className="gp-program-card"><h3>What happens during an override?</h3><p>The Uno still tracks ambient light while the override determines the output. A 30 ms debounce filters short contact changes. The software advances on a new press, so a hold cannot cycle the modes repeatedly.</p>
      <a className="gp-button gp-secondary" href="./project-files/camping_model_lantern.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SchoolDioramaTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a shade card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and verify the zones</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload and open Serial Monitor at 115200 baud.</strong> With the lamps out of the sensor’s light path, record the brightest and shaded A0 values. Set <code>brightReference</code> and <code>darkReference</code>, then upload again.</li>
        <li><strong>Start in daylight.</strong> Both zones should be off above 55%. Lower light to 45%. D8 should light the path and D9 should remain off.</li>
        <li><strong>Continue into night.</strong> At 28%, the classroom turns on. Both zones should remain lit as the reading rises to 37%.</li>
        <li><strong>Bring back daylight.</strong> At 38%, the classroom goes off. At 55%, the path goes off. Compare the serial lines with the two lamps.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why the zones change separately</h3><p>D8 and D9 each remember their own last state between their switch points. This lets the path stay lit while the classroom is off and prevents flicker when the light reading moves around either threshold.</p>
      <a className="gp-button gp-secondary" href="./project-files/school_diorama_night_mode.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function WindowShadowTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and an opaque card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare sudden and gradual changes</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload and establish the baseline.</strong> Select Arduino Uno and open Serial Monitor at 115200 baud. Reset with the sensor exposed. The baseline and raw A0 reading should start near each other. The baseline must reach at least 260 for detection.</li>
        <li><strong>Pass the shadow card once.</strong> Drop the raw reading by at least 180 counts. Hold the card briefly so the LED and log are easy to observe. The count should rise by one and stay there while covered.</li>
        <li><strong>Uncover and repeat.</strong> The LED clears when the reading returns within 90 counts of the baseline or goes above it. A second pass should add one event.</li>
        <li><strong>Change ambient light slowly.</strong> With the card out of the way, dim the source in small increments. Watch A0 and the baseline drift together. If a card pass is undetected, compare its actual drop with <code>triggerDrop</code>.</li>
      </ol>
    </section><section className="gp-program-card"><h3>How the baseline follows the light</h3><p>Every 50 ms, the sketch moves the baseline by one-eighth of the difference while the sensor is clear. A qualifying drop freezes the baseline until the light recovers. That lets the detector count one continuous shadow once.</p>
      <a className="gp-button gp-secondary" href="./project-files/window_shadow_detector.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function StairModelTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a shade card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Verify the three markers</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload and calibrate.</strong> Open Serial Monitor at 115200 baud. Record A0 in bright and shaded conditions. Enter those values as <code>brightReference</code> and <code>darkReference</code>, then upload again.</li>
        <li><strong>Dim to 45% or below.</strong> The bottom marker is first. The middle follows about a quarter-second later. The top follows another quarter-second later. The log should settle at three edges lit.</li>
        <li><strong>Try twilight in both directions.</strong> Bring the reading to 50% while the markers are on. They should stay lit. Reach 55% to clear all three, then return to 50%. They should stay off.</li>
        <li><strong>Repeat the sequence.</strong> Darken again. If the order is wrong, disconnect USB and compare the D8, D9 and D10 branches against the labeled edges.</li>
      </ol>
    </section><section className="gp-program-card"><h3>How elapsed time controls the edges</h3><p>The sketch remembers when a dark period begins. D8 can turn on immediately, D9 after 250 ms and D10 after 500 ms. It keeps checking A0 during the sequence, so daylight can cancel it before all three edges are lit.</p>
      <a className="gp-button gp-secondary" href="./project-files/stair_model_marker.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function DisplayCaseTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a shade card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and test lamp brightness</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Record the raw A0 value with the sensor shaded and again under bright room lighting.</li>
        <li><strong>Enter your references.</strong> Set <code>shadedReference</code> and <code>brightReference</code> to your readings, with the bright value higher, then upload again.</li>
        <li><strong>Lower the room-light reading.</strong> From a bright room, shade the sensor gradually. At 37%, expect duty 80 out of 255. At 8%, expect duty about 190. Compare the exhibit in the two states.</li>
        <li><strong>Restore the light.</strong> The lamp holds at its lowest duty through the 38–46% band and switches off at 47%. If it cycles while the room stays steady, block the lamp’s light from reaching the sensor.</li>
      </ol>
    </section><section className="gp-program-card"><h3>How PWM controls the lamp</h3><p>D9 switches the LED rapidly. The duty value controls the share of each cycle for which it is on. The serial log reports the commanded duty so students can compare it with the visible brightness.</p>
      <a className="gp-button gp-secondary" href="./project-files/display_case_light.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function GreenhouseShadeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a movable shade card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and compare light readings</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. With the shade screen retracted, record raw A0 and A1 under the same bright light. Then cover both sensors and record both shaded values.</li>
        <li><strong>Set the two calibration pairs.</strong> Enter the measured values in <code>refDark</code>, <code>refBright</code>, <code>trayDark</code>, and <code>trayBright</code>. Each bright value must exceed its dark value. Upload again.</li>
        <li><strong>Extend the screen over the tray only.</strong> Watch the tray reading fall while the reference stays steady. The LED lights below a ratio of 48%. Move the screen back little by little. The light clears at 55% or above.</li>
        <li><strong>Dim both sensors.</strong> Lower the room light without extending the screen. The two readings should fall together. Below 20% reference brightness, the sketch reports an unavailable ratio and turns the warning off.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Check the ratio by hand</h3><p>If the tray reads 28% and the exposed sensor reads 80%, the ratio is 35%. If both sensors read 40%, the ratio is 100%. The sketch compares normalized sensor signals. The model’s 48% threshold is a demonstration setting.</p>
      <a className="gp-button gp-secondary" href="./project-files/greenhouse_shade_monitor.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function ReadingCornerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor, book and shade card</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare light with the cutoff</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Record raw A0 with the page and sensor shaded, then with both exposed to the brighter reading light.</li>
        <li><strong>Calibrate the page scale.</strong> Enter those values as <code>shadedReference</code> and <code>brightReference</code>. Upload again. The two references define the 0–100% scale for your setup.</li>
        <li><strong>Test at a fixed cutoff.</strong> Adjust the dial until the log shows about 55%. Shade the sensor below the cutoff to switch the indicator on. At a 55% cutoff the LED stays on at 58% and clears at 60% or above.</li>
        <li><strong>Hold the light steady and turn the dial.</strong> Keep the sensor position and lighting fixed. Move the cutoff above the page reading, then below it by five points or more. Confirm that the LED changes while the page reading stays steady.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why measure at the page?</h3><p>A shadow can dim the page while the rest of the room looks bright. The status light takes its cue from the sensor beside the text. The five-point gap reduces repeated switching when the reading hovers around the cutoff.</p>
      <a className="gp-button gp-secondary" href="./project-files/reading_corner_indicator.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function WardrobeLightTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and continuity meter</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Upload and test the inputs</h3>
      <ol className="gp-program-steps">
        <li><strong>Verify switch alignment.</strong> With power disconnected, use continuity mode. The contact should close when the paired magnet is near it and open as the door moves away.</li>
        <li><strong>Upload and calibrate.</strong> Choose Arduino Uno and its USB port. In Serial Monitor at 115200 baud record shaded and bright A0 readings. Enter those values as <code>darkAdc</code> and <code>brightAdc</code>, then upload again.</li>
        <li><strong>Try all four combinations.</strong> Open and close the door in bright and dim light. Check the table, the shelf LED, and the Serial Monitor reading for each condition.</li>
        <li><strong>Compare the two directions through twilight.</strong> The sketch classifies readings at or below 32% as dim and readings at or above 42% as bright. Between them it keeps the previous classification.</li>
      </ol>
      <a className="gp-button gp-secondary" href="./project-files/wardrobe_light.ino" download>Download Arduino sketch</a>
    </section><section className="gp-program-card"><h3>When should the lamp turn on?</h3><p>The Uno waits 35 ms for the door contact to settle. The lamp command requires both an open door and a dim room.</p>
      <div className="gp-table"><table><caption>Expected output for stable inputs</caption><thead><tr><th scope="col">Door</th><th scope="col">Room</th><th scope="col">Lamp</th></tr></thead>
        <tbody><tr><td>Closed</td><td>Bright</td><td>Off</td></tr><tr><td>Open</td><td>Bright</td><td>Off</td></tr><tr><td>Closed</td><td>Dim</td><td>Off</td></tr><tr><td>Open</td><td>Dim</td><td>On</td></tr></tbody>
      </table></div>
    </section></div>
  </div>;
}

function ModelStreetlightTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, USB data cable and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and test the lamp</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud. Read the raw A0 field with the sensor shaded and again under normal bright lighting.</li>
        <li><strong>Enter the two reference values.</strong> Replace <code>darkAdc</code> and <code>brightAdc</code> with those readings and upload again. The bright reading must be higher. The resulting 0–100% scale is relative to those references.</li>
        <li><strong>Compare a passing shadow and dusk.</strong> From daylight, pass a card over the sensor in less than a second. The lamp should remain off. Hold the reading at 40% or below for one second to turn it on.</li>
        <li><strong>Bring back daylight.</strong> The lamp should stay on between the two thresholds. At 55% or above for one second, it should turn off.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Check for light from the lamp</h3><p>With the lamp on, watch the A0 reading. If the lamp raises the reading enough to turn itself off, reposition the sensor or add a baffle. Verify that the pavement still lights and a brief shadow still has no effect.</p>
      <a className="gp-button gp-secondary" href="./project-files/model_streetlight.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function CameraCounterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Python 3</strong></div><div><span>Tools</span><strong>OpenCV, a terminal and optional USB webcam</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Install, run, and compare</h3>
      <ol className="gp-program-steps">
        <li><strong>Install the dependency.</strong> In a Python environment, run <code>python -m pip install opencv-python</code>. Use <code>python3</code> if that is your local command.</li>
        <li><strong>Verify offline first.</strong> From the download folder, run <code>python camera_object_counter.py --self-test</code>. The program tests empty, separated, touching, and high-cutoff inputs.</li>
        <li><strong>Try the overhead webcam.</strong> Run <code>python camera_object_counter.py --camera 0</code>. Select the correct device index if needed and grant OS camera access. Keep targets in the central crop. Press Q or Escape inside a preview window to quit.</li>
        <li><strong>Change one variable at a time.</strong> Compare zero, one, and three separated disks, then join two. Observe 0, 1, 3, and 2 regions. If dim lighting hides disks, try <code>--threshold 115</code>. If dust is counted, raise <code>--minimum-area</code>.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Follow the image pipeline</h3><p>Crop the center of the frame, convert to grayscale, and apply the brightness cutoff. OpenCV groups touching pixels, including diagonal neighbors, then drops regions smaller than the minimum area. The same rule explains both the browser mask and the Python output.</p>
      <p>To test a still photo on your computer, run <code>python camera_object_counter.py --image sample.jpg</code>. The browser demo also accepts a local photo and starts with built-in scenes.</p>
      <a className="gp-button gp-secondary" href="./project-files/camera_object_counter.py" download>Download Python source</a>
    </section></div>
  </div>;
}

function DesktopServoTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library, Serial Monitor and protractor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Center and verify the sweep</h3>
      <ol className="gp-program-steps">
        <li><strong>Prepare the sketch.</strong> If the IDE cannot find <code>Servo.h</code>, install the Arduino Servo library from Library Manager. Select Arduino Uno and the USB port, then upload the sketch.</li>
        <li><strong>Center before fitting the horn.</strong> Apply servo power without the horn and send <code>C</code> at 115200 baud. With USB and servo power off, attach the horn and lightweight link as close as possible to the 90° reference.</li>
        <li><strong>Test each target unloaded.</strong> Reconnect power. Send <code>L</code> for 70° and <code>R</code> for 110°. Verify clearance and record the physical angle from the fixed scale. Stop if either move binds.</li>
        <li><strong>Run the repeatability trial.</strong> Send <code>T</code> for three alternating cycles. Record six observed landings. As a classroom acceptance check, aim for each reading within 5° of its mark. Re-center the horn or correct the scale alignment if all readings are offset.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Command and measured angle</h3><p>The sketch changes the servo command by one degree about every 18 ms and waits briefly at each trial endpoint. The serial log reports commands. Read the angle scale separately for the actual arm position. Sending <code>L</code>, <code>C</code>, or <code>R</code> during the trial stops the sequence and selects that position.</p>
      <a className="gp-button gp-secondary" href="./project-files/desktop_servo_arm.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function GearReducerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Method</span><strong>Manual mechanical test</strong></div><div><span>Tools</span><strong>Caliper, marking tape and a trial sheet</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Compare the witness marks</h3>
      <ol className="gp-program-steps">
        <li><strong>Check the shaft spacing.</strong> Start at the nominal spacing for the gear pair. The 32-pitch examples use 0.750 in (19.05 mm). Adjust the slotted support for slight free play and verify a full turn without binding.</li>
        <li><strong>Test one input turn.</strong> Align both witness marks with their start references. Turn the crank clockwise once, viewed from the front. The driven mark moves about 120° counterclockwise.</li>
        <li><strong>Test three input turns.</strong> Start at the reference again. After three full clockwise turns, the driven mark should have traveled one full turn in the opposite direction.</li>
        <li><strong>Diagnose a mismatch.</strong> If a mark drifts after repeated trials, stop and check for a slipping hub or skipped teeth. If the handle feels tight for part of a turn, check that the gears are centered and the shafts remain parallel.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Predict the result before turning</h3><p>Each full turn of the pinion advances twelve teeth. The driven gear needs thirty-six teeth to make one revolution, so its speed is one-third of the crank speed. The external teeth engage on opposite sides of the two gear centers, reversing the direction.</p>
      <p>At a steady 30 RPM on the crank, the driven shaft should turn at 10 RPM in the opposite direction.</p>
      <a className="gp-button gp-secondary" href="./project-files/gear_reducer_trial.csv" download>Download trial sheet</a>
    </section></div>
  </div>;
}

function PushButtonTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a continuity meter</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test press and release</h3>
      <ol className="gp-program-steps">
        <li><strong>Check the contacts with USB disconnected.</strong> Across the selected pair, the continuity meter should beep only when you hold the switch.</li>
        <li><strong>Upload to Arduino Uno.</strong> Select the board and port. Open Serial Monitor at 115200 baud. On reset with the switch released, expect D2 HIGH and the LED off.</li>
        <li><strong>Hold and release.</strong> While held, expect D2 LOW and the LED on. Releasing returns D2 to HIGH and extinguishes the LED.</li>
        <li><strong>Repeat three times.</strong> Each press or release should add one matching Serial Monitor line. If the LED is always on, disconnect USB and check for an accidental permanent connection between D2 and ground.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why LOW turns the LED on</h3><p>The internal pull-up gives an open switch a defined HIGH reading. Closing the switch makes a path to ground, so D2 reads LOW. The sketch waits for the reading to settle for 25 ms before updating D8 and logging a change. That prevents brief contact bounce from counting as several presses.</p>
      <a className="gp-button gp-secondary" href="./project-files/push_button_status_panel.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function MiniatureSignalTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, USB data cable and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Upload and check each phase</h3>
      <ol className="gp-program-steps">
        <li><strong>Select Arduino Uno and its port.</strong> Open the downloaded sketch, verify it, and upload it with the USB cable.</li>
        <li><strong>Start with red.</strong> Press the Uno reset button. The red lamp on D8 should light while amber and green remain off.</li>
        <li><strong>Watch a full cycle.</strong> Red lasts 3 seconds, green on D10 lasts 3 seconds, and amber on D9 lasts 1 second. The cycle then returns to red.</li>
        <li><strong>Check the output against the log.</strong> Open Serial Monitor at 115200 baud. Each printed color should match the lit lamp. If a lamp stays dark, check its polarity, series resistor and ground with USB unplugged.</li>
      </ol>
    </section><section className="gp-program-card"><h3>How the timer changes lamps</h3><p>The sketch measures elapsed time with <code>millis()</code>. When the current phase expires, it turns that output off before turning on the next one. Change an entry in <code>durationMs</code> to test a different duration, then check that the order stays the same.</p>
      <a className="gp-button gp-secondary" href="./project-files/miniature_traffic_signal.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function NightLightTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Test daylight and dusk</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Choose the board and USB port, upload the sketch, then open Serial Monitor at 115200 baud.</li>
        <li><strong>Measure the range.</strong> Record A0 in bright light and under shade. If needed, adjust <code>darkOn</code> and <code>brightOff</code> so both lie inside your measured range, with <code>darkOn</code> lower.</li>
        <li><strong>Test the dark-on point.</strong> Starting in daylight, shade the sensor. At or below 360 with the default sketch, the LED turns on.</li>
        <li><strong>Test the bright-off point.</strong> Uncover the sensor slowly. Between 360 and 460 the LED stays on. At 460 or above it switches off.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Why use two thresholds?</h3><p>The sketch averages eight A0 samples and remembers the last LED state between the two switch points. Test the same dusk reading from both directions. At that reading, the lamp should still be off if you started in daylight and still be on if you started in shade.</p>
      <a className="gp-button gp-secondary" href="./project-files/automatic_night_light.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function RoomClimateTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and a room thermometer</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Check the switch points</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to Arduino Uno.</strong> Open Serial Monitor at 115200 baud and wait for the temperature to settle.</li>
        <li><strong>Check the reference.</strong> Compare with a separate thermometer. The sketch assumes a 5 V ADC reference. If you measure a different voltage at the 5 V rail, enter it in <code>referenceVolts</code>.</li>
        <li><strong>Set and cross the threshold.</strong> Send <code>+</code> to increase or <code>-</code> to decrease the setpoint. Warm the sensor gently until the LED comes on.</li>
        <li><strong>Wait for cooldown.</strong> The warning remains active between the setpoint and one degree below it. At or below the lower point the warning clears.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Convert voltage to temperature</h3><p>The TMP36 produces about 0.500 V at 0 °C and changes by 0.010 V per degree. The code averages sixteen ADC readings before converting. Check the TO-92 package pinout before wiring. <a href="https://www.analog.com/media/en/technical-documentation/data-sheets/TMP35_36_37.pdf" target="_blank" rel="noreferrer">TMP36 data sheet</a></p>
     <a className="gp-button gp-secondary" href="./project-files/room_climate.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function SoilCalibrationTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Serial Monitor and three labeled cups</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate at the same depth</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload to the Uno.</strong> Open Serial Monitor at 115200 baud and look for the raw A0 reading.</li>
        <li><strong>Capture the references.</strong> Put the coated probe in the dry sample. Let the value settle and send <code>D</code>. Clean the blade, move to the damp sample at the same depth, then send <code>W</code>.</li>
        <li><strong>Check the test sample.</strong> Move to the third cup. Look for the relative score and compare it with the LED. Below 50% lights the indicator.</li>
        <li><strong>Try invalid calibration.</strong> Send <code>R</code>, then capture both references in the same cup. The sketch withholds the score until the references differ by at least 20 counts.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Read the result</h3><p>The sketch scales raw readings between the captured endpoints and clamps the result to 0–100. This relative scale applies only to the chosen references and insertion setup.</p>
     <a className="gp-button gp-secondary" href="./project-files/soil_calibration.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function TendonHandTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library and Serial Monitor</strong></div></div>
    <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Set and test the horn travel</h3>
      <ol className="gp-program-steps">
        <li><strong>Upload with the cord detached.</strong> Select Arduino Uno and install Servo. Open Serial Monitor at 115200 baud.</li>
        <li><strong>Check the unloaded positions.</strong> Send <code>0</code> for 80° and <code>1</code> for 105°. The horn advances one degree every 25 ms during a move.</li>
        <li><strong>Attach the cord with power off.</strong> Return to 80°, cut power and tie the cord with light slack. After restoring power, send <code>1</code> and watch both joints curl.</li>
        <li><strong>Release the tendon.</strong> Send <code>0</code>. Check that the elastic returns both hinges. Cut power and reduce travel if a link binds.</li>
      </ol>
    </section><section className="gp-program-card"><h3>Expected result</h3><p>Pulling one cord curls both hinges. Releasing it lets the elastic open them. Neither endpoint should make the servo strain.</p>
     <a className="gp-button gp-secondary" href="./project-files/tendon_hand.ino" download>Download Arduino sketch</a>
    </section></div>
  </div>;
}

function VoiceWaterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Python 3 and Arduino C++</strong></div><div><span>Tools</span><strong>Arduino IDE, Vosk, pyserial, sounddevice and a USB microphone</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Prepare and test one pulse</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with pump power off.</strong> Select the Arduino Uno and upload the sketch. With the catch cup in place, perform the dry wiring check before enabling the pump rail.</li>
          <li><strong>Set up offline speech.</strong> Install <code>vosk</code>, <code>pyserial</code> and <code>sounddevice</code> in a Python environment. Extract <code>vosk-model-small-en-us-0.15</code> from the <a href="https://alphacephei.com/vosk/models" target="_blank" rel="noreferrer">Vosk model list</a>.</li>
          <li><strong>Run the console on the Pi.</strong> Use <code>python3 voice_water_console.py --model ./vosk-model-small-en-us-0.15 --port YOUR_PORT</code> with the Uno’s serial port. Press Enter and say a phrase when the prompt says “Listening now.”</li>
          <li><strong>Verify timeout and Stop.</strong> Let one pulse finish, then repeat and press the wired Stop during flow. You can also type <code>s</code> at the console for an immediate serial stop.</li>
        </ol><div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{voiceWater.test}</p></div></div></section>
      <section className="gp-program-card"><h3>Follow the serial command</h3><p>“Water warm” sends W. “Water cold” sends C. “Water stop” sends S. The Uno ignores a second channel command while a pump is active.</p><p>Try the parser before connecting hardware with <code>python3 voice_water_console.py --phrase "water cold"</code>. Expect C.</p>
        <div className="gp-steps"><a className="gp-button gp-secondary" href="./project-files/voice_water_pumps.ino" download>Download Arduino sketch</a><a className="gp-button gp-secondary" href="./project-files/voice_water_console.py" download>Download Python console</a></div>
      </section>
    </div>
  </div>;
}

function PiObjectFollowerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Python 3 and Arduino C++</strong></div><div><span>Tools</span><strong>OpenCV, pyserial, Arduino IDE, USB camera and a wheel stand</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Preview first, then test the drive</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with motor power off.</strong> Use Arduino Uno in the IDE. Fit the stand and check that both wheels can turn freely.</li>
          <li><strong>Preview the detection.</strong> With OpenCV and pyserial installed on the Pi, run <code>python3 pi_object_follower.py --camera 0</code> from the desktop. Use a matte orange card and verify the bounding box tracks it under steady light.</li>
          <li><strong>Send commands with the rover raised.</strong> Close Serial Monitor. Add <code>--port YOUR_PORT</code> to the command, then switch on motor power. Compare the left, straight and right decisions with the wheels.</li>
          <li><strong>Test the stop rules.</strong> Bring the card close, hide it, or quit the program. Check that both wheels stop. The Uno also stops if valid drive bytes expire.</li>
        </ol><div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{piObjectFollower.test}</p></div></div></section>
      <section className="gp-program-card"><h3>Read the camera decision</h3><p>OpenCV filters orange pixels and boxes the largest matching region. A marker left or right of the center band steers the rover. A box at least 100 pixels wide triggers Hold. The width rule applies to the same marker and camera setup.</p>
        <p>Use <code>python3 -m pip install opencv-python pyserial</code> in a virtual environment if the desktop image lacks the packages.</p>
        <div className="gp-steps"><a className="gp-button gp-secondary" href="./project-files/pi_object_follower.ino" download>Download Arduino sketch</a><a className="gp-button gp-secondary" href="./project-files/pi_object_follower.py" download>Download Python tracker</a></div>
      </section>
    </div>
  </div>;
}

function PiBinMonitorTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++ and Python 3</strong></div><div><span>Tools</span><strong>Arduino IDE, Python with pyserial, a ruler and a local browser</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and verify the dashboard</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the Uno sketch.</strong> Use Serial Monitor at 115200 baud to confirm distances in millimeters. Close Serial Monitor before running the dashboard.</li>
          <li><strong>Check calibration.</strong> Measure the empty and full gaps from the sensor face. Install pyserial in a Python environment on the Pi, then run <code>python3 pi_bin_monitor.py --serial YOUR_PORT --empty 500 --full 120</code> using your serial port and measured gaps.</li>
          <li><strong>Check normal readings.</strong> Open <code>http://127.0.0.1:5056/</code> on the Pi. At the example settings a 196 mm gap represents 80% fill and displays Collect.</li>
          <li><strong>Compare a missing reading with stale data.</strong> Try a no-echo setup, then unplug the Uno and wait three seconds. Reconnect the Uno and restart the Python monitor for another test.</li>
        </ol><div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{piBinMonitor.test}</p></div></div></section>
      <section className="gp-program-card"><h3>Follow the calculation</h3><p>Subtract the current gap from the empty gap, divide by the calibrated span, and multiply by 100. The dashboard limits the result to 0–100% and flags collection at 80% or higher.</p>
        <div className="gp-steps"><a className="gp-button gp-secondary" href="./project-files/pi_bin_sensor.ino" download>Download Arduino sketch</a><a className="gp-button gp-secondary" href="./project-files/pi_bin_monitor.py" download>Download Python monitor</a></div>
      </section>
    </div>
  </div>;
}

function PiFaceLockTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta"><div><span>Language</span><strong>Arduino C++, JavaScript and Python 3</strong></div><div><span>Tools</span><strong>Arduino IDE, Servo library, Node.js 22 or later, and Python with pyserial</strong></div></div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Compare portraits and test the latch</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the Uno sketch.</strong> Use the Servo library. Check the two servo positions before connecting the horn to the latch.</li>
          <li><strong>Try the matcher on the Pi.</strong> Save the JavaScript files and Python console in one directory. Run <code>node pi_face_lock_console.mjs amara</code>. Compare its match decision with <code>mixed</code> and <code>visitor</code>.</li>
          <li><strong>Test the USB link.</strong> Install pyserial in a Python environment. Connect the Uno and close Serial Monitor. Run <code>python3 pi_face_lock_serial.py --port YOUR_PORT amara</code>, replacing <code>YOUR_PORT</code> with the Uno’s serial device.</li>
          <li><strong>Check automatic relock.</strong> Open the model door as soon as the grant is acknowledged. Hold it open and then close it. Repeat with an ambiguous portrait and verify the console sends no grant.</li>
        </ol><div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{piFaceLock.test}</p></div></div></section>
      <section className="gp-program-card"><h3>Download the files</h3><p>This bench exercise uses the same generated portraits as the attendance guide. The Pi sends a grant only when the top match passes both the distance and separation thresholds.</p>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/pi_face_lock.ino" download>Download latch sketch</a>
          <button className="gp-button gp-secondary" type="button" onClick={()=>download('attendance-engine.mjs',attendanceEngineSource)}>Download portrait matcher</button>
          <a className="gp-button gp-secondary" href="./project-files/pi_face_lock_console.mjs" download>Download decision runner</a>
          <a className="gp-button gp-secondary" href="./project-files/pi_face_lock_serial.py" download>Download serial console</a>
        </div>
      </section>
    </div>
  </div>;
}

function VoiceHomeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++ and Python 3</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, ESP32 board package, Python, USB and a microphone</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Verify serial first, then speech</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the sketch.</strong> Select ESP32 Dev Module. In Serial Monitor at 115200 baud, send <code>D</code>, <code>H</code> and <code>S</code>. Expect <code>Desk=1 Hall=0</code>, then both on, then both off. Close Serial Monitor.</li>
          <li><strong>Set up local speech.</strong> Install the dependencies with <code>python3 -m pip install vosk sounddevice pyserial</code>. Download and extract <code>vosk-model-small-en-us-0.15</code> from the <a href="https://alphacephei.com/vosk/models" target="_blank" rel="noreferrer">Vosk model list</a>.</li>
          <li><strong>Run the console.</strong> Use <code>python3 voice_home_console.py --model ./vosk-model-small-en-us-0.15 --port YOUR_PORT</code>. Replace <code>YOUR_PORT</code> with the port shown in the IDE.</li>
          <li><strong>Speak after the prompt.</strong> Press Enter, then say one full phrase when “Listening now” appears. Try “home desk on,” “home hall on,” each off command, and an unrelated phrase. Enter <code>q</code> to turn both lamps off and exit.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{voiceHome.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the three steps</h3>
        <p>The computer captures one short audio window and Vosk produces a transcript. The console checks confidence and compares the full phrase to its command list. The ESP32 acknowledges each accepted byte with the two lamp states.</p>
        <p>Try the parser without hardware using <code>python3 voice_home_console.py --phrase "home desk on"</code>. It should print <code>D</code>.</p>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/voice_home_controller.ino" download>Download Arduino sketch</a>
          <a className="gp-button gp-secondary" href="./project-files/voice_home_console.py" download>Download Python console</a>
        </div>
      </section>
    </div>
  </div>;
}

function Esp32DoorCameraTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++ and browser JavaScript</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Espressif ESP32 board package, 3.3 V UART adapter and Wi-Fi browser</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Set up and verify a capture</h3>
        <ol className="gp-program-steps">
          <li><strong>Set the board and password.</strong> Choose AI Thinker ESP32-CAM with PSRAM enabled and replace the example Wi-Fi password with a classroom key of at least eight characters. The board package includes the camera driver.</li>
          <li><strong>Upload and reboot.</strong> Ground GPIO0 before powering the camera board for upload. Afterward turn the supply off, remove the GPIO0 jumper, shut the model door and power back on.</li>
          <li><strong>Open the viewer.</strong> Set Serial Monitor to 115200 baud. Join <code>Atlas-Door-Camera</code> on a Wi-Fi device and open the HTTP address printed by the board.</li>
          <li><strong>Run two openings.</strong> Open the door, leave it open, then close and reopen it. Compare the image and counter. Reboot while open and confirm the reboot itself adds no event.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{esp32DoorCamera.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>From switch to still</h3>
        <p>The ESP32 accepts a contact change after 50 ms of stability. After an opening it waits 300 ms for the door to move clear, then takes a JPEG if the door is still open. The last successful image stays in memory until another capture or a reset.</p>
        <p>If the browser reports Camera unavailable, power off and check the ribbon latch, 5 V supply and PSRAM setting. Reposition the camera if the still misses the test parcel.</p>
        <a className="gp-button gp-secondary" href="./project-files/esp32_door_camera.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function Esp32SmartHomeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++ and browser JavaScript</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Espressif ESP32 board package, Serial Monitor and a Wi-Fi device</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Connect, calibrate and compare</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the sketch.</strong> Choose ESP32 Dev Module for the specified DevKitC V4. Replace the example Wi-Fi password with a classroom key of at least eight characters. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Join the model network.</strong> On the phone or laptop, connect to <code>Atlas-Model-Home</code>. Stay connected if prompted about internet access. Open the HTTP address printed in Serial Monitor.</li>
          <li><strong>Check the readings.</strong> Watch the dashboard in regular room light, then cover the sensor and write down both readings. If the readings miss the default thresholds, set <code>porchOnAt</code> and <code>porchOffAt</code> between the measured values, with the off threshold higher. Upload again.</li>
          <li><strong>Test both modes.</strong> Toggle each light in Manual. Select Auto for the porch, cover and uncover the sensor, then repeat after leaving the Wi-Fi network. Rejoin it and confirm the dashboard updates to the current state.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{esp32SmartHome.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow a command</h3>
        <p>The ESP32 serves the page, reads GPIO34, and switches GPIO25 and GPIO26. The page’s buttons send commands to the board and its readout refreshes once a second. Auto control runs on the ESP32 even when the page is closed.</p>
        <p>Use a classroom lamp or your hand to change the light falling on the sensor. This model uses two USB-powered LEDs.</p>
        <a className="gp-button gp-secondary" href="./project-files/esp32_smart_home.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SwarmCoordinationTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Mega 2560 board core and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Test the handoff and lost signal</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload one copy for each role.</strong> Select Arduino Mega or Mega 2560. Leave <code>robotA = true</code> for A and change it to <code>false</code> for B.</li>
          <li><strong>Check the link before enabling the motors.</strong> Reopen A’s Serial Monitor at 115200 baud. Wait for “Link ready,” then switch on the separate motor packs.</li>
          <li><strong>Watch one trial.</strong> Send <code>g</code>. A turns for 1.6 seconds, both stop for 450 ms, then B turns for 1.6 seconds. Send <code>x</code> to stop early.</li>
          <li><strong>Interrupt the orange lead.</strong> Repeat the trial and open the A TX1 to B RX1 jumper while B is turning. Leave ground connected. Reconnect, wait for “Link ready,” then send a fresh <code>g</code>.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{swarmCoordination.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow one packet</h3>
        <p>A sends a fresh sequence number every 100 ms. B reads the drive command and echoes that number back. B stops when its last command is 350 ms old. A cancels the trial after 350 ms without an acknowledgment.</p>
        <a className="gp-button gp-secondary" href="./project-files/swarm_coordination.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function FingerprintStarterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit Fingerprint Sensor Library and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Enroll and test one authorization</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with motor power off.</strong> Install the Adafruit Fingerprint Sensor Library, choose Mega 2560 and open Serial Monitor at 115200 baud.</li>
          <li><strong>Enroll locally.</strong> Send <code>e</code>, lift any finger and follow both capture prompts with the same consenting test finger. The optical module stores the template in slot 1.</li>
          <li><strong>Check denied and expired scans.</strong> Switch on the motor pack with the wheel raised. Try Start before a match, then try a different finger. Scan the enrolled finger and let five seconds pass before pressing Start.</li>
          <li><strong>Check a valid pulse.</strong> Scan again, remove the finger and press Start before the window expires. Hold through one short pulse or release early. Send <code>d</code> with motor power off to delete the test template.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{fingerprintStarter.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the start request</h3>
        <p>A successful match opens one five-second window. A fresh Start press consumes it. The controller checks communication with the reader before enabling the wheel. Once enabled, the pulse lasts at most 650 ms and ends early on release.</p>
        <a className="gp-button gp-secondary" href="./project-files/fingerprint_vehicle_starter.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function HydroponicChamberTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, RTClib, Adafruit SHT31, Adafruit NeoPixel and BusIO</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Commission each output</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with the load supply off.</strong> Install the libraries, select Uno, and open Serial Monitor at 115200 baud with Newline. Check the wet and dry readings before enabling the pump.</li>
          <li><strong>Set and check the clock.</strong> Send <code>T YYYY-MM-DD HH:MM</code> using your local date and time. Try 08:00 and 23:00 for one trial. The white strip is on from 06:00 until 22:00. Restore the current time afterward.</li>
          <li><strong>Check the water loop.</strong> Verify the reservoir can hold the return volume. Fill above the sensor and watch water return. Use the maintenance switch, then test the low-level cutoff and delayed restart with the pump kept submerged.</li>
          <li><strong>Test fan and signal loss.</strong> Gently warm the air around the probe and let it cool again. Check the two fan thresholds. To test a missing sensor, disconnect it while all power is off before restarting the board.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{hydroponicChamber.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the three control loops</h3>
        <p>The level input stops the pump immediately on a dry signal. The pump waits 1.5 seconds of safe level after a refill or maintenance pause. A missing clock turns the strip off. A missing air reading leaves the fan running.</p>
        <p>The demo strip illustrates day and night timing. For growing plants, choose lighting and nutrient practices for the crop and check the reservoir chemistry independently.</p>
        <a className="gp-button gp-secondary" href="./project-files/hydroponic_chamber.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function ShakeMonitorTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit MPU6050, Adafruit Unified Sensor, BusIO and Serial Plotter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Compare the local motion traces</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and calibrate.</strong> Install the three Adafruit libraries, select Uno and upload. Keep the plate still for the first second. Wait for the green LED.</li>
          <li><strong>Open the plot.</strong> Select Serial Plotter at 115200 baud. Identify the rolling acceleration trace and the 0.16 g threshold. Give the plate a short tap and watch the trace settle.</li>
          <li><strong>Build a sustained signal.</strong> Slide the plate back and forth. Continue until the reading stays above the threshold for 30 samples. Confirm the red light and piezo pulse together.</li>
          <li><strong>Clear the alarm and test the sensor fault.</strong> Try Reset while the trace is high, then wait one quiet second and try again. With USB disconnected, unplug the sensor and power the Uno again. Check for steady red and the fault signal in the plot.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{shakeMonitor.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read acceleration and timing</h3>
        <p>The sketch subtracts a slowly updated baseline from each axis. It combines the squared deviations across ten samples, takes their root mean square, and compares the result with the classroom threshold.</p>
        <p>The alarm requires about 0.6 seconds of high readings. Reset requires about one second below 0.06 g. The alert and fault plot channels use fixed display levels to show when those states are active. This model reports motion at its own sensor. Regional early-warning systems combine readings from multiple stations.</p>
        <a className="gp-button gp-secondary" href="./project-files/arduino_shake_monitor.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function FollowerTrolleyTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, HuskyLens Arduino library and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Train and test the camera</h3>
        <ol className="gp-program-steps">
          <li><strong>Prepare the board.</strong> Install the <a href="https://github.com/HuskyLens/HUSKYLENSArduino" target="_blank" rel="noreferrer">original HuskyLens library</a>. From the repository ZIP, place its inner HUSKYLENS folder in your Arduino libraries folder. Select Uno and upload with the wheel supply switched off.</li>
          <li><strong>Learn the patch.</strong> Select I²C in the camera’s General Settings and Color Recognition on the main screen. Aim at a single matte patch and use Learn for the first slot, ID1. Remove other similarly colored objects from the aisle.</li>
          <li><strong>Calibrate with wheels raised.</strong> Open Serial Monitor at 115200 baud. Compare the X coordinate with the centered value of 160. Target width grows as you move the same patch closer. Start with 54 and 66 pixels as the follow/resume thresholds and tune using the actual panel.</li>
          <li><strong>Check the stop conditions.</strong> Enable follow and test both side offsets. Hide the target, bring a box inside 18 cm, then remove all reflectors from the sonar field to trigger timeout. Verify both wheels stop after each test.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{followerTrolley.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Trace the control decision</h3>
        <p>The sketch asks for exactly one ID1 block. It checks forward sonar clearance and waits for two valid frames before following. Near or missing sonar readings disable the driver immediately on that cycle. The target width controls following distance and its horizontal position adjusts the wheel PWM values.</p>
        <p>If the motor driver reports a fault, check the motors and wiring first. Once the fault clears, press the follow switch to clear the latch, then press again to enable follow.</p>
        <a className="gp-button gp-secondary" href="./project-files/shopping_trolley_follower.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function OmniArmTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit Motor Shield V2 Library and Adafruit PWM Servo Driver Library</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Check the wheels and arm separately</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with both motion supplies off.</strong> In the IDE select Arduino Mega or Mega 2560. Install both driver libraries and their dependencies. Open Serial Monitor at 115200 baud and choose Newline.</li>
          <li><strong>Check each wheel on a stand.</strong> Raise the chassis and switch on the regulated 4.5 V wheel supply. Send <code>1</code>, <code>2</code>, <code>3</code>, and <code>4</code> separately. Check the correct wheel and direction. Send <code>R</code> and compare all four directions.</li>
          <li><strong>Test the arm with wheel power off.</strong> Send <code>H</code> to center unloaded horns. Fit the horns with power off. Use <code>P C U T D O H</code> one letter at a time to tune neutral pulses, direction signs and pose limits before adding a foam block.</li>
          <li><strong>Mark the floor stops.</strong> The wheel steps use fixed timing, so measure where each step lands on your floor. Keep the USB tether loose and clear. Set both docks inside the tested reach. Send <code>{omniExample}</code> after checking clearances, and try <code>!</code> separately to verify Stop.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{omniArm.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the two controllers</h3>
        <p>The wheel shield maps forward, side and turn requests to four motor directions. The servo driver interpolates arm pulse widths between poses. The queue allows up to 12 actions and rejects drive steps until the arm has stowed.</p>
        <p>Send <code>!</code> to clear the remaining program and disable the wheels. The arm holds the last commanded pose. Keep the motor and servo power switches accessible during testing.</p>
        <a className="gp-button gp-secondary" href="./project-files/omni_arm_vehicle.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function PrepaidMeterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit INA219 and BusIO, Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Verify billing and the test alarm</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload and check the monitors.</strong> Install Adafruit INA219 and BusIO with Library Manager. Select Arduino Uno for upload, then open Serial Monitor at 115200 baud. Both sensors should be online.</li>
          <li><strong>Run a prepaid cycle.</strong> Power the 5 V bench circuit and press TOP UP once. Confirm roughly equal readings near 23 mA. Watch remaining credit reach zero and the green indicator switch off.</li>
          <li><strong>Inject a mismatch.</strong> Top up again, then hold TEST LOAD for about one second. The extra current should latch red and disconnect the billed branch. Release TEST LOAD and verify red stays on.</li>
          <li><strong>Reset and check recovery.</strong> Press RESET with the test load released. The alarm clears and the billed branch resumes if credit remains. To check sensor failure, disconnect one sensor with everything off, reboot and check for a disabled billed output.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{prepaidMeter.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the meter calculation</h3>
        <p>The sketch multiplies billed milliamps by volts to get milliwatts. It uses elapsed milliseconds to convert each sample into milliwatt-hours, then subtracts that energy from credit.</p>
        <p>The two INA219 units sample every 100 ms. Four consecutive current differences above 10 mA trip the latch. Credit starts at zero each time the controller powers up.</p>
        <a className="gp-button gp-secondary" href="./project-files/prepaid_energy_meter.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function FootstepRfidTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit PN532 and BusIO, digital multimeter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Measure a charge and authorize a test</h3>
        <ol className="gp-program-steps">
          <li><strong>Check the harvest circuit.</strong> With the Uno disconnected, measure the capacitor with its clamp installed. Press and release the tile by hand. Verify the meter shows a positive voltage below 5 V.</li>
          <li><strong>Upload and enroll.</strong> Install Adafruit PN532 and BusIO using Library Manager, select Arduino Uno and upload. At 115200 baud send <code>e</code>, tap Tag A, then remove it. Enrollment is cleared at power cycle.</li>
          <li><strong>Try a refused test.</strong> Tap Tag B and press the test switch. Try Tag A with too little charge. Then let an accepted tag expire after eight seconds and press again.</li>
          <li><strong>Test the energy pulse.</strong> Press the tile until the monitor reads at least 2.45 V. Tap Tag A, then hold the test switch briefly before the window ends. Watch for the red load LED and compare the storage readings.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{footstepRfid.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the capacitor voltage</h3>
        <p>The 470 kΩ divider halves the storage voltage before the Uno reads it. The sketch doubles the ADC voltage to estimate the storage value. Compare it against your meter and adjust the 5.0 V reference in the calculation to match the Uno’s supply.</p>
        <p>A valid tag grants one test. The sketch enables D9 for 180 ms when the button is pressed and the voltage is high enough. The Uno and reader use USB power, and the load LED draws its current from the capacitor.</p>
        <a className="gp-button gp-secondary" href="./project-files/footstep_rfid_harvester.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function UnderwaterIrTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE and two serial ports at 115200 baud</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Check the optical path and send data</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload both sketches.</strong> Select Arduino Uno and check each USB port before uploading. Label the sender and the receiver.</li>
          <li><strong>Check alignment in air.</strong> Send uppercase T to the sender. Its emitter turns on for one second. Adjust the dry optical mounts until the receiver’s D13 LED turns on for that interval and goes off afterward.</li>
          <li><strong>Add water.</strong> Disconnect both USB leads before filling. Once the exterior is dry, reconnect the boards and repeat T. Keep the water path short and shield the receiver from bright overhead light if alignment is difficult.</li>
          <li><strong>Compare messages.</strong> Keep the receiver’s monitor open. Press the two send buttons in turn. Try blocking the beam first for a whole frame, then partway through a frame. Remove the card and retry.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{underwaterIr.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>How the receiver reads a pulse</h3>
        <p>120 ms marks the start. A 20 ms pulse sends 0. A 48 ms pulse sends 1. Each pulse is followed by 28 ms of darkness. The receiver checks the payload against its bitwise inverse before showing green.</p>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/underwater_ir_sender.ino" download>Download sender sketch</a>
          <a className="gp-button gp-secondary" href="./project-files/underwater_ir_receiver.ino" download>Download receiver sketch</a>
        </div>
      </section>
    </div>
  </div>;
}

function VoiceRoverTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Languages</span><strong>Arduino C++ for the rover, Python for speech</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, ESP32 board package, Python and Vosk</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Upload and run the voice console</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the controller.</strong> Select ESP32 Dev Module for the original ESP32 with Bluetooth Classic. Leave the AA pack off and GPIO27 open. Upload the controller sketch over USB.</li>
          <li><strong>Prepare speech recognition.</strong> In a Python environment, install the console dependencies with <code>python -m pip install vosk sounddevice pyserial</code>. Extract the <a href="https://alphacephei.com/vosk/models" target="_blank" rel="noreferrer">Vosk small US English model</a> to your workspace.</li>
          <li><strong>Start the console.</strong> Close Arduino Serial Monitor first. In the download folder run <code>python voice_rover_console.py --model "vosk-model-small-en-us-0.15" --port YOUR_PORT</code>. Replace YOUR_PORT with your USB serial port shown in Arduino IDE. For Bluetooth, select the paired device’s outgoing SPP serial port.</li>
          <li><strong>Speak and check the wheels.</strong> With the rover raised, press Enter and say “rover forward” after the prompt. Then test the other four phrases. Type <code>s</code> and press Enter for a direct stop. Cut motor power before adjusting wiring.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{voiceRover.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Trace the spoken phrase</h3>
        <p>Each Enter press records a short audio window. Vosk decodes it locally. The Python console only sends a byte when both spoken words match a supported phrase with enough confidence. The controller maps F, B, L, R and S to wheel directions and ends movement after 850 ms.</p>
        <p>Try the parser with motor power off using <code>python voice_rover_console.py --phrase "rover left"</code>. Expect L. Try “turn left now” and expect Unknown phrase.</p>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/voice_rover_controller.ino" download>Download ESP32 sketch</a>
          <a className="gp-button gp-secondary" href="./project-files/voice_rover_console.py" download>Download Python console</a>
        </div>
      </section>
    </div>
  </div>;
}

function WirelessRailTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Espressif ESP32 board package and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Upload and test both boards</h3>
        <ol className="gp-program-steps">
          <li><strong>Choose the boards.</strong> Install the Espressif ESP32 board package, select ESP32 Dev Module, and connect the trackside board. Use identical network names and passphrases in both sketches. Give each pair a different name if several groups share the room.</li>
          <li><strong>Upload in order.</strong> Upload the trackside sketch and open its Serial Monitor at 115200 baud. Verify red at startup and the printed address 192.168.4.1. Connect to the other USB port and upload the cab sketch.</li>
          <li><strong>Check the aspects.</strong> Watch amber yield to red as replies arrive. Tap the trackside switch and check green at both stations. Tap it again to verify red.</li>
          <li><strong>Pull trackside power.</strong> Set the lamps to green. Unplug only the trackside board. Within one second of the last accepted reply, amber should replace green at the cab. Restore power and wait for both stations to show red.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{wirelessRailSignal.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the request and reply</h3>
        <p>The cab sends a new request every 250 ms. The signal station returns the request ID and its current aspect. The cab validates the sender and request ID before refreshing its lamp. After one second without a valid reply, it displays amber.</p>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/model_rail_trackside.ino" download>Download trackside sketch</a>
          <a className="gp-button gp-secondary" href="./project-files/model_rail_cab.ino" download>Download cab sketch</a>
        </div>
      </section>
    </div>
  </div>;
}

function NightPatrolTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, EEPROM library and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Calibrate and run a patrol</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload.</strong> Leave motor power off. Select Arduino Uno and its USB port, upload, and set Serial Monitor to 115200 baud.</li>
          <li><strong>Calibrate the route.</strong> Cover all three channels with white card and send W. Use a broad swatch of the same black tape and send B. Confirm the sketch saves the calibration.</li>
          <li><strong>Check light and motion.</strong> Send L while parked to read ambient light. Aim for 320 or below with the sensor shaded, and 420 or above in bright light. Test on a wheel stand, then on the tape route.</li>
          <li><strong>Rehearse the call.</strong> Press CALL and confirm that the wheels stop. Ask the operator to press RESET once to acknowledge and a second time to resume.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{nightPatrol.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the code</h3>
        <p>Each reflectance channel uses its own saved white and black reference. The difference between the side readings varies the two wheel speeds. In the help state, the controller disables both wheels and pulses the beacon and piezo until the operator acknowledges.</p>
        <a className="gp-button gp-secondary" href="./project-files/night_patrol_rover.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function EntranceTemperatureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Servo and Adafruit MLX90614 libraries</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Upload and test the station</h3>
        <ol className="gp-program-steps">
          <li><strong>Install and upload.</strong> Install both libraries in Library Manager, select Arduino Uno and the USB port, and upload. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Try a cool object.</strong> Place a room-temperature matte target at the tray stop. Watch for the logged reading, green LED and raised barrier.</li>
          <li><strong>Compare a warm object.</strong> Clear the tray, then place the warm target at the same stop. At 30 °C or above, the red LED lights and the barrier stays closed.</li>
          <li><strong>Check a missing measurement.</strong> Disconnect the thermometer with power off. Restart and trigger the beam. Look for the unavailable message and the closed barrier.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{entranceTemperature.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the code</h3>
        <p>The sketch waits for a steady beam interruption, takes three surface temperature readings and keeps the middle value. Removing the target resets the gate and LEDs for the next test.</p>
        <a className="gp-button gp-secondary" href="./project-files/object_entrance_temperature.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function BellowsSimulatorTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor or Serial Plotter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Compare the simulated traces</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload.</strong> Select Arduino Uno and its USB port, then upload the sketch. Open Serial Plotter at 115200 baud.</li>
          <li><strong>Start a normal cycle.</strong> Set Resistance near halfway and Leak at minimum. Press Start. The white LED lights during fill, and the pressure index rises and falls.</li>
          <li><strong>Trigger high and low alarms.</strong> Increase Resistance near its maximum to trip the high-index alarm. Clear it, set Resistance near halfway and Leak near its maximum, and start again to trip the low-index alarm.</li>
          <li><strong>Check restart behavior.</strong> One press clears the red LED and leaves the controller idle. Restore the normal knob settings and press a second time to resume cycling.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{bellowsSimulator.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the plot channels</h3>
        <p>The sketch sends the synthetic index, a fill marker, and an alarm code. The alarm channel uses 80 for high and 40 for low so the two cases can be distinguished in the plot. These are arbitrary classroom codes and model units.</p>
        <p>Only LEDs and USB telemetry are driven by the physical circuit.</p>
        <a className="gp-button gp-secondary" href="./project-files/classroom_bellows_simulator.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SelfParkingTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor, ruler, tape and a stopwatch</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Tune the gap scan and reverse arcs</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload with motor power off.</strong> Select Arduino Uno and its USB port. The sketch uses built-in functions. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Check direction and clearance.</strong> Raise both wheels. With valid front and rear targets in view, start and observe both wheels drive forward. Check that moving the front target inside 16 cm stops the drive. Check that another Start press stops the run. Use the battery cutoff before changing any leads.</li>
          <li><strong>Measure the minimum gap.</strong> Run at the scan speed on the intended floor. Estimate centimeters per second from a marked 30 cm trial. Divide the minimum usable bay length by that speed and multiply by 1000 for a starting MIN_GAP_MS.</li>
          <li><strong>Tune the entry and recovery.</strong> For a wide bay, adjust FIRST_ARC_MS to enter the gap and SECOND_ARC_MS to straighten. Adjust CENTER_MS after both turns work. Compare a short bay, then repeat a wide-bay trial with a target behind the rover.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{selfParking.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>From echo to movement</h3>
        <p>The three sensors ping individually to reduce interference. The right sensor times the space between curb targets. The active travel sensor checks for at least 16 cm of clearance and stops the motors if its echo is missing.</p>
        <p>Gap length and reverse arcs depend on surface grip and battery voltage. Repeat measurements on the same floor after changing the wheels or supply.</p>
        <a className="gp-button gp-secondary" href="./project-files/automatic_self_parking.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SolarTrackerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Servo library, Adafruit SHT31 Library and Adafruit BusIO</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Tune the tracker and read the weather</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload the sketch.</strong> Install Servo and Adafruit SHT31 Library with dependencies. Select Arduino Uno and its USB port. Upload while external servo power is off.</li>
          <li><strong>Check the four inputs.</strong> Open Serial Monitor at 115200 baud. Shine a lamp straight at the cross and move it sideways, then vertically. Pan error and tilt error should change with the corresponding side. A positive pan error means the labeled right side is brighter.</li>
          <li><strong>Check movement at low travel.</strong> With room around the panel, power the servos. Confirm both axes move toward the lamp. If either moves away, turn off servo power and change its sign in the sketch before trying again.</li>
          <li><strong>Test the dark threshold.</strong> Cover the light head. When its average count drops below 140 the angles should stay fixed. The weather values continue to report. If either appears as nan, check the weather wiring and the 0x44 address.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{solarTracker.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the feedback loop</h3>
        <p>Every 50 ms the Uno subtracts the left-side average from the right-side average and the bottom average from the top average. Above 36 counts of difference it requests a two-degree move on the corresponding axis. A small deadband keeps nearly equal readings from causing repeated corrections.</p>
        <p>Read the one-second serial rows as average light, two axis errors, two servo angles, temperature in °C, and relative humidity in percent.</p>
        <a className="gp-button gp-secondary" href="./project-files/dual_axis_solar_tracker.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function WearableScopeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++ for classic Nano (ATmega328P)</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit SSD1306, Adafruit GFX, USB Mini-B data cable</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Capture a known waveform</h3>
        <ol className="gp-program-steps">
          <li><strong>Install and upload.</strong> Install Adafruit SSD1306 and its dependencies in Library Manager. Select Arduino Nano under Arduino AVR Boards and choose ATmega328P. Some older classic Nanos require ATmega328P (Old Bootloader). Open and upload the sketch.</li>
          <li><strong>Check the screen.</strong> With D9 connected to A0 through 1 kΩ, see a square trace. If the screen stays blank, open Serial Monitor at 115200 baud. The sketch checks I²C addresses 0x3C and 0x3D.</li>
          <li><strong>Count periods.</strong> At 2 ms/sample, count about 2½ periods between the first and last columns. Press TIME once. About five periods fit at 4 ms/sample.</li>
          <li><strong>Freeze a measurement.</strong> Press HOLD and compare consecutive frames. With the optional DC pot already wired, turn it while holding, then resume. The trace only moves after resuming.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{wearableScope.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read the time grid</h3>
        <p>The hardware timer switches D9 every 50 ms, so one full cycle lasts 100 ms. The screen spaces its vertical grid lines 16 samples apart. That gives 32 ms per grid division at 2 ms/sample and 64 ms at 4 ms/sample.</p>
        <p>The ADC uses the Nano’s supply as its reference. Keep A0 between GND and the actual Nano 5 V rail. Use the built-in D9 signal or the optional pot powered from that rail.</p>
        <a className="gp-button gp-secondary" href="./project-files/wearable_scope.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function FingerprintLockerTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit Fingerprint Sensor Library, Servo library and Serial Monitor</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Enroll, upload and verify</h3>
        <ol className="gp-program-steps">
          <li><strong>Enroll ID 1.</strong> Use a dedicated classroom sensor with a free ID 1. In Arduino IDE Library Manager, install Adafruit Fingerprint Sensor Library and Servo. Upload the library’s enroll example with SoftwareSerial on D2 and D3. Open Serial Monitor at 9600 baud, enter 1 and follow the prompts for two scans of the same consenting participant’s finger.</li>
          <li><strong>Upload the locker sketch.</strong> Select Arduino Uno and its port. Open the downloaded sketch and upload it. Reopen Serial Monitor at 115200 baud and check for Reader ready.</li>
          <li><strong>Compare access attempts.</strong> With the door closed, scan an unregistered finger and confirm the latch stays put. Remove it and use the enrolled finger. Try one successful scan without opening, then another where you open the door during the release window.</li>
          <li><strong>Check relock and remove the template.</strong> Close the door and confirm the tab returns. Then load the library’s delete example, use D2 and D3 and the baud rate in its setup, and remove only ID 1. Reload the locker sketch and verify that the previously enrolled finger no longer opens the door.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{fingerprintLocker.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>From match ID to latch motion</h3>
        <p>The scanner stores enrollment on the module and returns a match ID over UART. The Uno releases the latch for ID 1, then checks the door contact until it can relock. If a finger stays on the sensor, remove it before trying again.</p>
        <p>Use the cardboard model to learn how an access controller works. A real bank locker requires certified hardware and a different security design.</p>
        <a className="gp-button gp-secondary" href="./project-files/fingerprint_locker.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function LightInterlockTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Serial Monitor and multimeter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Test the cutoff before the timer</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload.</strong> Select Arduino Uno and its USB port, then upload the sketch. It uses built-in Arduino functions. Open Serial Monitor at 115200 baud.</li>
          <li><strong>Verify the switch.</strong> Lift and lower the lid. Compare OPEN and CLOSED with the lid position. While open, tap Start and confirm the LED stays off.</li>
          <li><strong>Interrupt the cycle.</strong> Close the lid, tap Start and lift the lid during the eight-second countdown. The Serial Monitor prints Cycle interrupted. Close the lid and confirm the LED remains off.</li>
          <li><strong>Check a wire fault.</strong> During another run, remove only the D2 signal jumper. The pull-up reads HIGH and the LED goes out. Restoring the jumper leaves the cycle stopped.</li>
          <li><strong>Finish a cycle.</strong> With everything connected and shut, press Start again. Allow the full eight seconds and check for Cycle complete.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{lightInterlock.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Follow the logic</h3>
        <p>Each loop checks the contact before acting on the Start button. An open contact forces D9 LOW. The timer compares the current time with the starting time so the loop can keep checking the lid while the LED is lit.</p>
        <p>Holding Start while closing the lid leaves the LED off. Release the button and press again with the lid closed.</p>
        <a className="gp-button gp-secondary" href="./project-files/visible_light_interlock.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function SolarMeterTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Adafruit INA219 and BusIO libraries, multimeter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Upload, measure and compare</h3>
        <ol className="gp-program-steps">
          <li><strong>Install the libraries.</strong> In Library Manager install Adafruit INA219 and accept the BusIO dependency. Select Arduino Uno and its USB port.</li>
          <li><strong>Upload and read.</strong> Open solar_meter.ino and upload. Open Serial Monitor at 115200 baud. If the board reports an I²C error, check the four logic wires and the default 0x40 address.</li>
          <li><strong>Record a baseline and shade trial.</strong> Fit the two-resistor chain, uncover the panel and record a stable row. Shade its face without moving the stand, then record another row.</li>
          <li><strong>Change the load.</strong> Cover the panel and add the third resistor in series. Restore the first light level and record the reading. Then cover the panel again, disconnect the load at VIN−, and repeat with the output terminal still on the sensor but with no resistor path.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{solarMeter.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read a sample line</h3>
        <p><code>12.003,6.800,15.45,105.06</code></p>
        <p>At 12 seconds the load receives 6.80 V and draws 15.45 mA. Multiplying them gives about 105 mW. The sketch uses the voltage on the load side of the shunt and prints a new row about once per second.</p>
        <p>Keep the panel angle and light fixed when comparing the two loads. Keep the load fixed when comparing light levels.</p>
        <a className="gp-button gp-secondary" href="./project-files/solar_meter.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function AndroidSnakeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Arduino Servo library, Android Bluefruit LE Connect</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Center the joints and test commands</h3>
        <ol className="gp-program-steps">
          <li><strong>Compile and upload.</strong> Install Servo by Arduino in Library Manager. Open android_snake.ino, select Arduino Uno and its USB port, then verify and upload with servo power off.</li>
          <li><strong>Center before fitting.</strong> Briefly power the bare servos to let them settle at 90°. Disconnect power, fit the horns with the four links in a straight line, and check screw and cable clearance.</li>
          <li><strong>Connect the phone.</strong> Move the Bluefruit switch to UART/Data. Connect from the Android app and open UART Terminal. Send S, then L and R to check each direction. The Uno logs commands at 115200 baud over USB.</li>
          <li><strong>Observe the wave.</strong> Send W and watch the first, middle and last joint. Send S midway through a second wave. Try a third burst and watch the automatic return to center after four seconds.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{androidSnake.test}</p></div></div>
      </section>
      <section className="gp-program-card"><h3>Android UART commands</h3>
        <div className="gp-table"><table>
          <thead><tr><th scope="col">Send</th><th scope="col">Action</th></tr></thead>
          <tbody>{snakeCommands.map(([key,label])=><tr key={key}><td><code>{key}</code></td><td>{label}</td></tr>)}</tbody>
        </table></div>
        <p>Each joint reaches up to {snakeMotion.bend}° on either side of its center. The {snakeMotion.periodMs/1000}-second wave starts at a different phase on each joint. The horn approaches each requested angle in short steps.</p>
        <a className="gp-button gp-secondary" href="./project-files/android_snake.ino" download>Download Arduino sketch</a>
        <p>The bench test observes joint motion. To correct a mirrored servo, change that joint’s sign in the sketch and verify it at low travel before rejoining the links.</p>
      </section>
    </div>
  </div>;
}

function TankRefillTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, USB data cable, measuring cup and spill tray</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Check the sensors before running water</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload.</strong> Turn off pump power. Open tank_refill.ino, select Arduino Uno and its USB port, then verify and upload. Move the sketch into a same-named folder if prompted.</li>
          <li><strong>Check each mark.</strong> Open Serial Monitor at 115200 baud. Pour water across one mark at a time and verify the corresponding wet bit. Confirm the source bit falls before its intake is exposed.</li>
          <li><strong>Measure the fill.</strong> Start with a small gap between marks. In the supervised wet test, cut power manually if the upper cutoff does not work. Once the upper sensor is verified, choose the mark spacing so a normal fill ends inside {tankLimits.runLimit} seconds.</li>
          <li><strong>Repeat the stop cases.</strong> With the motor supply off, compare the displayed pump command against the state table. In the browser demo, simulate a blocked tube or a sensor conflict.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{tankRefill.test}</p></div></div>
      </section>
      <section className="gp-program-card"><h3>Controller states</h3>
        <div className="gp-table"><table>
          <thead><tr><th scope="col">Observation</th><th scope="col">Response</th></tr></thead>
          <tbody>
            <tr><td>Below lower mark; supply wet</td><td>Pump starts after the inputs settle.</td></tr>
            <tr><td>Between marks</td><td>A running refill continues. A stopped refill waits.</td></tr>
            <tr><td>Upper mark wet or supply low</td><td>Pump stops immediately.</td></tr>
            <tr><td>Upper wet while lower dry, or run timeout</td><td>Pump stops and holds a fault. Once sensors agree and supply is wet, send R to reset.</td></tr>
          </tbody>
        </table></div>
        <a className="gp-button gp-secondary" href="./project-files/tank_refill.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function GestureRoverTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, USB data cable and a wheel stand</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Calibrate and test</h3>
        <ol className="gp-program-steps">
          <li><strong>Upload.</strong> Turn motor power off and raise the wheels. Open gesture_rover.ino, select Arduino Uno and its USB port, then verify and upload. Move the sketch into a same-named folder if prompted.</li>
          <li><strong>Set zero.</strong> Open Serial Monitor at 115200 baud. Place the pad level, release Enable and press Reset. Expect READY, near-zero pitch and roll, and STOP.</li>
          <li><strong>Compare gestures.</strong> Switch on motor power with the wheels still raised. Hold Enable and try about ±25° on one axis. Release Enable while the wheels turn.</li>
          <li><strong>Check ambiguous gestures.</strong> Keep both axes at similar angles and confirm STOP. Power off before unplugging or reseating the sensor.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{gestureRover.test}</p></div></div>
      </section>
      <section className="gp-program-card"><h3>Wheel direction reference</h3>
        <div className="gp-table"><table>
          <thead><tr><th scope="col">Dominant tilt</th><th scope="col">Left wheel</th><th scope="col">Right wheel</th></tr></thead>
          <tbody>
            <tr><td>Positive pitch</td><td>Forward</td><td>Forward</td></tr>
            <tr><td>Negative pitch</td><td>Reverse</td><td>Reverse</td></tr>
            <tr><td>Positive roll</td><td>Forward</td><td>Reverse</td></tr>
            <tr><td>Negative roll</td><td>Reverse</td><td>Forward</td></tr>
          </tbody>
        </table></div>
        <p>Motion starts at {gestureLimits.deadband}° when the leading axis exceeds the other by at least {gestureLimits.separation}°. Tilt above {gestureLimits.maximum}° disables the driver.</p>
        <a className="gp-button gp-secondary" href="./project-files/gesture_rover.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function BluetoothHomeTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, USB data cable and Bluefruit LE Connect on a phone</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Upload and test</h3>
        <ol className="gp-program-steps">
          <li>Open bluetooth_home.ino in Arduino IDE. Move it into a same-named folder if prompted. Select Arduino Uno and its USB port, then verify and upload.</li>
          <li>Open Bluefruit LE Connect, choose your breakout, connect and open its UART screen. Set the breakout switch to UART/Data.</li>
          <li>Send one listed character at a time and wait for the reply. R reports the room, P reports the porch, and 1 means on. The two flag values reflect the commanded outputs.</li>
          <li>Check the lamps alongside the reply, then disconnect and reconnect. Try ? before sending S to switch both off.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected results</strong><p>{bluetoothHome.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>UART command reference</h3>
        <div className="gp-table"><table>
          <thead><tr><th scope="col">Send</th><th scope="col">Action</th></tr></thead>
          <tbody>{homeCommands.map(([key,label])=><tr key={key}><td><code>{key}</code></td><td>{label}</td></tr>)}</tbody>
        </table></div>
        <a className="gp-button gp-secondary" href="./project-files/bluetooth_home.ino" download>Download Arduino sketch</a>
        <p>If commands arrive but replies are missing, check D3 to RXI and the CTS and RTS wires. Use an LED and resistor on each model output.</p>
      </section>
    </div>
  </div>;
}

function ClassroomStationTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Languages</span><strong>Arduino C++ and route commands</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, USB data cables, ruler and station cards</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card"><h3><ListChecks size={20}/> Prepare and run a rotation</h3>
        <ol className="gp-program-steps">
          <li><strong>Switch bench.</strong> Open classroom_switch.ino, select Arduino Uno and upload. Press and release the button. The 220 Ω series resistor stays in place for both readings.</li>
          <li><strong>Range bench.</strong> Upload classroom_range.ino to the second Uno. Open Serial Monitor at 115200 baud. Compare the 25 cm and 60 cm marks and record a few readings at each.</li>
          <li><strong>Rover bench.</strong> Set the chassis at R1 C1, facing east. Try Forward once to identify the obstacle. Then go south two cells and east three cells to reach R3 C4.</li>
          <li><strong>Paper activity.</strong> If parts are unavailable, use the browser’s paper activity or a grid and counters. Ask students to justify the result using the same evidence prompt.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected observations</strong><p>{classroomLab.test}</p></div></div>
      </section>
      <section className="gp-program-card"><h3>Station files</h3>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/classroom_switch.ino" download>Switch sketch</a>
          <a className="gp-button gp-secondary" href="./project-files/classroom_range.ino" download>Range sketch</a>
          <button type="button" className="gp-button gp-secondary" onClick={()=>download('classroom-station-cards.txt',stationCards)}>Station cards</button>
          <button type="button" className="gp-button gp-secondary" onClick={()=>download('classroom-inventory.csv',inventorySheet,'text/csv')}>Inventory CSV</button>
        </div>
        <h4>What to look for in each group</h4>
        <ul>{stations.map(station=><li key={station.name}><strong>{station.name}.</strong> {station.evidence}</li>)}</ul>
      </section>
    </div>
  </div>;
}

function TiltCameraTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Languages</span><strong>Arduino C++ and Python 3</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, Espressif ESP32 core, PySerial and USB-to-serial adapter</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Flash and run</h3>
        <ol className="gp-program-steps">
          <li><strong>Prepare Arduino IDE.</strong> Add <code>https://espressif.github.io/arduino-esp32/package_esp32_index.json</code> in Additional Boards Manager URLs, then install esp32 by Espressif Systems. Select AI Thinker ESP32-CAM and the adapter port. Camera and I²C support are included with the core.</li>
          <li><strong>Upload the sketch.</strong> Tie GPIO0 to ground before power-up or reset. Verify and upload the sketch. Move it into a same-named folder if prompted. Power off and remove the GPIO0 jumper afterward.</li>
          <li><strong>Prepare the receiver.</strong> Close Serial Monitor so Python can open the port. In a Python environment, run <code>python3 -m pip install pyserial</code>. Run <code>python3 receive_tilt_snapshots.py PORT</code> from the download folder, replacing PORT with the exact port shown in Arduino IDE.</li>
          <li><strong>Calibrate and capture.</strong> Start or reset the board with the platform level and still. Wait for READY and readings near zero, then move slowly past 20°. Wait for the receiver to report the saved file in the snapshots folder before moving again.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{tiltCamera.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>From tilt to JPEG</h3>
        <ol className="gp-program-steps">
          <li><strong>Measure.</strong> At rest the accelerometer sees gravity. The sketch uses the X and Z readings to estimate tilt around the hinge axis.</li>
          <li><strong>Decide.</strong> A simple filter smooths the angle. The 20° capture threshold and 10° reset threshold keep the camera from firing repeatedly while the platform is held.</li>
          <li><strong>Transfer.</strong> The camera supplies a small JPEG. The sketch sends it as one Base64 line at 115200 baud. The local Python receiver decodes the frame and writes a timestamped file.</li>
        </ol>
        <div className="gp-steps">
          <a className="gp-button gp-secondary" href="./project-files/tilt_snapshot.ino" download>Download ESP32 sketch</a>
          <a className="gp-button gp-secondary" href="./project-files/receive_tilt_snapshots.py" download>Download Python receiver</a>
        </div>
        <h4>If no frame arrives</h4>
        <p>Check for READY, confirm the adapter uses 3.3 V logic, and check that its port is free. If the ESP32 resets during capture, check its 5 V supply. Power down before reseating the camera ribbon or IMU leads.</p>
      </section>
    </div>
  </div>;
}

function DetectionBenchTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Arduino C++</strong></div>
      <div><span>Tools</span><strong>Arduino IDE, USB data cable, tape measure and two tags</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Set up and run</h3>
        <ol className="gp-program-steps">
          <li><strong>Install the reader library.</strong> In Arduino IDE Library Manager, install Adafruit PN532 and its Adafruit BusIO dependency.</li>
          <li><strong>Upload the sketch.</strong> Open the downloaded file, select Arduino Uno and its USB port, verify and upload. Move the sketch into a same-named folder if the IDE prompts you.</li>
          <li><strong>Read the three columns.</strong> Open Serial Monitor at 115200 baud. Each row shows radar edge count, sonar distance in centimeters and tag UID. If the reader is missing, its column shows reader unavailable.</li>
          <li><strong>Compare repeated trials.</strong> Keep the tag steady for at least two rows. For sonar, hold a flat target at the measured mark and compare the reading over several rows. For radar, record the quiet baseline before moving in its field.</li>
        </ol>
        <div className="gp-table"><table>
          <caption>Controlled trials</caption>
          <thead><tr><th>Change</th><th>Expected reading</th></tr></thead>
          <tbody>
            <tr><td>Move a target in the radar field</td><td>Edges rise above the still baseline.</td></tr>
            <tr><td>Move the sonar card from 40 cm to 80 cm</td><td>Distance increases. Removing the card gives no echo in a clear lane.</td></tr>
            <tr><td>Present A, then B, then plain card</td><td>Two distinct UIDs, followed by no tag.</td></tr>
          </tbody>
        </table></div>
        <div className="gp-check"><Check size={19}/><div><strong>Expected results</strong><p>{detectionBench.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>How the sketch reads each sensor</h3>
        <ol className="gp-program-steps">
          <li><strong>Radar.</strong> A falling-edge interrupt increments the counter even while the sketch waits for an echo or tag. The counter resets every {motionWindowMs/1000} second.</li>
          <li><strong>Sonar.</strong> The echo duration covers both the outward and return trips. The sketch divides by two when converting to distance and discards results outside 5–200 cm.</li>
          <li><strong>RFID.</strong> The PN532 returns a UID with its length. The sketch prints its bytes in hexadecimal. Leave all other cards outside the reader field while testing one tag.</li>
        </ol>
        <a className="gp-button gp-secondary" href="./project-files/detection_bench.ino" download>Download Arduino sketch</a>
      </section>
    </div>
  </div>;
}

function PiBenchTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Language</span><strong>Python 3</strong></div>
      <div><span>Tools</span><strong>Raspberry Pi OS, GPIO Zero, lgpio, smbus2 and a Terminal</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Set up and run</h3>
        <ol className="gp-program-steps">
          <li><strong>Enable I²C.</strong> On current Raspberry Pi OS, run <code>sudo raspi-config</code>. Open Interface Options, enable I²C, and reboot if prompted.</li>
          <li><strong>Install the libraries and bus tool.</strong> Run <code>sudo apt update</code> and then <code>sudo apt install python3-gpiozero python3-lgpio python3-smbus2 i2c-tools</code>. Run <code>i2cdetect -y 1</code> on this dedicated sensor bus. Expect <code>44</code> at the default sensor address.</li>
          <li><strong>Check the program without hardware.</strong> Download the script, open a terminal in that folder and run <code>python3 pi_climate_bench.py --self-test</code>. It checks the sensor checksum, conversion and CSV append using sample bytes.</li>
          <li><strong>Run the climate bench.</strong> Use <code>python3 pi_climate_bench.py --threshold 28</code>. Read the live °C and % RH values. Press the switch once, wait for the confirmation and check <code>climate_log.csv</code>. Stop with Ctrl+C.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected results</strong><p>{piPrototyping.test}</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Read, check, act, save</h3>
        <ol className="gp-program-steps">
          <li><strong>Read.</strong> The Pi requests a sample from address 0x44. The reply holds a temperature word, a humidity word and a checksum for each.</li>
          <li><strong>Check.</strong> Python verifies both checksums before converting the raw values to °C and % RH.</li>
          <li><strong>Act.</strong> A valid temperature at or above the threshold lights the GPIO27 LED. A failed read clears it and skips captures until a valid sample returns.</li>
          <li><strong>Save.</strong> GPIO17 uses an internal pull-up and switch debounce. A press saves a timestamped sample without a network connection.</li>
        </ol>
        <a className="gp-button gp-secondary" href="./project-files/pi_climate_bench.py" download>Download Python source</a>
        <h4>Check a missing reading</h4>
        <p>If address 44 is missing, shut the Pi down and disconnect USB-C power before reseating the sensor wires. Check the physical pin numbers and the breakout labels. Try a simulated fault in Finished demo.</p>
      </section>
    </div>
  </div>;
}

function EnclosureTest() {
  return <div className="gp-guide gp-program">
    <div className="gp-program-meta">
      <div><span>Languages</span><strong>OpenSCAD and Arduino C++</strong></div>
      <div><span>Tools</span><strong>OpenSCAD, slicer, FDM printer, calipers and Arduino IDE</strong></div>
    </div>
    <div className="gp-program-grid">
      <section className="gp-program-card">
        <h3><ListChecks size={20}/> Print and inspect</h3>
        <ol className="gp-program-steps">
          <li><strong>Check your measurements.</strong> Open the SCAD source and set usb_center, usb_width and usb_bottom to suit the measured plug and mounted board. Use the gauge to check the housing width.</li>
          <li><strong>Export the design.</strong> Select base, lid or gauge in the part parameter, render with F6 and export STL. For the default dimensions you can download all three meshes directly.</li>
          <li><strong>Slice at actual size.</strong> Keep units in millimeters. Start at 0.2 mm layer height and three wall lines. Place the base floor-down and the lid outer face-down. Preview every layer and verify that the vents and cable notch stay clear.</li>
          <li><strong>Test the assembled case over USB.</strong> Connect with the lid seated. Open the downloadable Blink sketch, select Arduino Uno and its USB port, then verify and upload. Move the sketch into a same-named folder if prompted.</li>
        </ol>
        <div className="gp-check"><Check size={19}/><div><strong>Expected result</strong><p>{printedEnclosure.test} The light stays on for one second, then off for one second, repeating.</p></div></div>
      </section>
      <section className="gp-program-card">
        <h3>Design and test files</h3>
        <p>Edit the CAD source for your hardware. The default meshes use an 86 × 67 × 27 mm base with an 18 mm opening.</p>
        <ul className="gp-program-steps">
          {[
            ['uno-enclosure.scad','OpenSCAD design source'],
            ['uno-gauge.stl','USB fit gauge STL'],
            ['uno-base.stl','Enclosure base STL'],
            ['uno-lid.stl','Vented lid STL'],
            ['enclosure_blink.ino','Arduino Blink sketch'],
          ].map(([filename,label]) => <li key={filename}><a href={`./project-files/${filename}`} download>{label}</a></li>)}
        </ul>
        <h4>If the fit is tight</h4>
        <p>For a tight lid, increase lid_gap and re-export the lid. For a cable that rubs the wall, adjust the notch against the dry fit and check that the mounting feet still sit flat.</p>
      </section>
    </div>
  </div>;
}

function Build({project, stage, art, expansion}: {project: Project;stage: number;art:string;expansion?:ExpansionInfo}) {
  const [step,setStep] = useState(0);
  const [assemblyPart,setAssemblyPart] = useState<number | null>(null);
  const [demoRun,setDemoRun] = useState(0);
  const [storyStep,setStoryStep] = useState<number | null>(null);
  const [playing,setPlaying] = useState(false);
  const [storyComplete,setStoryComplete] = useState(false);
  const [demoPart,setDemoPart] = useState<number>();
  const [manualInput,setManualInput] = useState(false);
  const isRecyclingVending = project.id===recyclingVending.id;
  const isVendingMachine = project.id===vendingMachine.id;
  const isGestureLamp = project.id===gestureLamp.id;
  const isSmartHeadlights = project.id===smartHeadlights.id;
  const isBleGamepad = project.id===bleGamepad.id;
  const isLineFollower = project.id===lineFollower.id;
  const isRoomController = project.id===roomController.id;
  const isMotionPick = project.id===motionPick.id;
  const isSolarLawn = project.id===solarLawn.id;
  const isSolarTricopter = project.id===solarTricopter.id;
  const isGpsGsm = project.id===gpsGsm.id;
  const isHorizonTracker = project.id===horizonTracker.id;
  const isGsmEnergy = project.id===gsmEnergy.id;
  const isBleArm = project.id===bleArm.id;
  const isMimicHand = project.id===mimicHand.id;
  const isDialGauge = project.id==='cardboard-dial-gauge';
  const isDrawbridge = project.id==='mini-drawbridge-model';
  const isLetterSorter = project.id==='model-letter-sorter-flap';
  const isCameraPanModel = project.id==='desktop-camera-pan-model';
  const isWindVane = project.id==='model-wind-vane-pointer';
  const isModelParkingBarrier = project.id==='model-parking-barrier';
  const isControllerInput = project.id==='game-controller-input-tester';
  const isHandheldSignal = project.id==='handheld-signal-paddle';
  const isDrawerIndicator = project.id==='drawer-closed-indicator';
  const isMailboxFlag = project.id==='mailbox-test-flag';
  const isModelCrossing = project.id==='model-crossing-request';
  const isAccessibleDeskSwitch = project.id==='accessible-desk-switch';
  const isElevatorCallLight = project.id==='model-elevator-call-light';
  const isModelDoorbell = project.id==='model-doorbell-panel';
  const isQuizDesk = project.id==='quiz-desk-response-button';
  const isLibraryHelpButton = project.id==='library-help-button';
  const isWindowBoxComparison = project.id==='window-box-comparison';
  const isSoilDryingTimer = project.id==='soil-drying-timer-study';
  const isCapillaryWatering = project.id==='capillary-watering-model';
  const isPlantPotDepth = project.id==='plant-pot-depth-comparison';
  const isDrainageBottle = project.id==='drainage-bottle-experiment';
  const isMulchMoisture = project.id==='mulch-moisture-experiment';
  const isClaySoilCalibration = project.id==='clay-soil-calibration';
  const isSandySoilCalibration = project.id==='sandy-soil-calibration';
  const isSeedlingTrayMoisture = project.id==='seedling-tray-moisture-check';
  const isBasilPotMoisture = project.id==='basil-pot-moisture-flag';
  const isEquipmentEnclosure = project.id==='equipment-enclosure-monitor';
  const isColdPackWarming = project.id==='cold-pack-warming-indicator';
  const isVentOutlet = project.id==='vent-outlet-temperature-indicator';
  const isSolarOvenMonitor = project.id==='solar-oven-model-monitor';
  const isAquariumTemperature = project.id==='aquarium-model-temperature-alert';
  const isIncubatorTemperature = project.id==='model-incubator-temperature-alert';
  const isSunlitWindow = project.id==='sunlit-window-monitor';
  const isSeedTrayTemperature = project.id==='seed-tray-temperature-flag';
  const isDeskComfort = project.id==='desk-comfort-monitor';
  const isTerrariumTemperature = project.id==='terrarium-temperature-flag';
  const isTunnelModel = project.id==='tunnel-model-light';
  const isCampingLantern = project.id==='camping-model-lantern';
  const isSchoolDiorama = project.id==='school-diorama-night-mode';
  const isWindowShadow = project.id==='window-shadow-detector';
  const isStairModel = project.id==='stair-model-marker';
  const isDisplayCase = project.id==='display-case-light';
  const isGreenhouseShade = project.id==='greenhouse-shade-monitor';
  const isReadingCorner = project.id==='reading-corner-indicator';
  const isWardrobeLight = project.id==='wardrobe-light';
  const isModelStreetlight = project.id==='model-streetlight';
  const isCameraCounter = project.id==='vision-counter';
  const isDesktopServo = project.id==='desktop-arm';
  const isGearReducer = project.id==='mechanism-study';
  const isPushButton = project.id==='button-indicator';
  const isMiniatureSignal = project.id==='traffic-sequencer';
  const isNightLight = project.id==='ambient-light';
  const isRoomClimate = project.id==='home-project';
  const isSoilCalibration = project.id==='soil-observer';
  const isTendonHand = project.id==='hand-project';
  const isVoiceWater = project.id===voiceWater.id;
  const isPiObjectFollower = project.id===piObjectFollower.id;
  const isPiBinMonitor = project.id===piBinMonitor.id;
  const isPiFaceLock = project.id===piFaceLock.id;
  const isVoiceHome = project.id===voiceHome.id;
  const isEsp32DoorCamera = project.id===esp32DoorCamera.id;
  const isEsp32SmartHome = project.id===esp32SmartHome.id;
  const isSwarmCoordination = project.id===swarmCoordination.id;
  const isFingerprintStarter = project.id===fingerprintStarter.id;
  const isHydroponicChamber = project.id===hydroponicChamber.id;
  const isShakeMonitor = project.id===shakeMonitor.id;
  const isFollowerTrolley = project.id===followerTrolley.id;
  const isOmniArm = project.id===omniArm.id;
  const isPrepaidMeter = project.id===prepaidMeter.id;
  const isFootstepRfid = project.id===footstepRfid.id;
  const isUnderwaterIr = project.id===underwaterIr.id;
  const isVoiceRover = project.id===voiceRover.id;
  const isWirelessRail = project.id===wirelessRailSignal.id;
  const isNightPatrol = project.id===nightPatrol.id;
  const isEntranceTemperature = project.id===entranceTemperature.id;
  const isBellowsSimulator = project.id===bellowsSimulator.id;
  const isSelfParking = project.id===selfParking.id;
  const isSolarTracker = project.id===solarTracker.id;
  const isWearableScope = project.id===wearableScope.id;
  const isFingerprintLocker = project.id===fingerprintLocker.id;
  const isLightInterlock = project.id===lightInterlock.id;
  const isSolarMeter = project.id===solarMeter.id;
  const isAndroidSnake = project.id===androidSnake.id;
  const isTankRefill = project.id===tankRefill.id;
  const isGestureRover = project.id===gestureRover.id;
  const isBluetoothHome = project.id===bluetoothHome.id;
  const isClassroomLab = project.id===classroomLab.id;
  const isTiltCamera = project.id===tiltCamera.id;
  const isDetectionBench = project.id===detectionBench.id;
  const isPiBench = project.id===piPrototyping.id;
  const isEnclosure = project.id===printedEnclosure.id;
  const isFanInterlock = project.id===fanInterlock.id;
  const isGpsAlert = project.id===gpsAlert.id;
  const isExhibitionLock = project.id===exhibitionLock.id;
  const isClassroomAir = project.id===classroomAir.id;
  const isGreenhouse = project.id===smartGreenhouse.id;
  const isPickBalance = project.id===pickBalance.id;
  const isRoverArm = project.id===roverArm.id;
  const isAutomaticTap = project.id===automaticTap.id;
  const isSoapDispenser = project.id===soapDispenser.id;
  const isTrafficParking = project.id===trafficParking.id;
  const isSchoolBell = project.id===schoolBell.id;
  const isRfidDoor = project.id===rfidDoor.id;
  const isRainClothesline = project.id===rainClothesline.id;
  const isMq2Monitor = project.id===mq2Monitor.id;
  const isElectromagnetCrane = project.id===electromagnetCrane.id;
  const isElectronicPiano = project.id===electronicPiano.id;
  const isStreetLight = project.id===streetLight.id;
  const isRailwayGate = project.id===railwayGate.id;
  const isUltrasonicRadar = project.id===ultrasonicRadar.id;
  const isCubeSat = project.id===weatherCubeSat.id;
  const isEmergencyLighting = project.id===emergencyLighting.id;
  const isIndustrialMonitor = project.id===industrialMonitor.id;
  const isMineSafety = project.id===mineSafety.id;
  const isSmartBin = project.id===smartWasteBin.id;
  const isAquaclean = project.id===aquaclean.id;
  const isFloodGate = project.id===floodGate.id;
  const isFloodWarning = project.id===floodWarning.id;
  const isRocketLab = project.id===rocketLab.id;
  const isBottleVacuum = project.id===bottleVacuum.id;
  const isLidarDrone = project.id===lidarMicroDrone.id;
  const isSolarSweeper = project.id===solarSweeper.id;
  const isBeaconRover = project.id===fireResponseRover.id;
  const isEsp32Car = project.id===esp32Car.id;
  const isRadioCar = isEsp32Car || project.id===bluetoothCar.id;
  const lesson = expansion ? expansionDemo(expansion,project) : undefined;
  const story = lesson?.story ?? projectStories[art];
  const currentBeat = storyStep===null ? undefined : story?.[storyStep];
  const reading = (lesson?.readings ?? demoReadings[art])?.[storyStep ?? (manualInput ? 3 : 0)];
  const active = storyStep===null ? manualInput : Boolean(reading?.[2]);
  useEffect(() => {
    if (stage!==4 || !playing || storyStep===null) return;
    const duration = storyStep===3
      ? art==='traffic-sequencer' ? ((expansion?.limit ?? 3)*2+1)*1000+400 : 4400
      : 3100;
    const timer = window.setTimeout(() => {
      if (storyStep===3) { setPlaying(false); setStoryComplete(true); }
      else { setDemoPart(undefined); setStoryStep(storyStep+1); }
    },duration);
    return () => window.clearTimeout(timer);
  },[stage,playing,storyStep,art,expansion]);

  useEffect(() => {
    if (stage!==4) {
      setPlaying(false);
      setStoryStep(null);
    }
  },[stage]);

  function chooseInput(value: boolean) {
    setManualInput(value);
    setStoryStep(null);
    setPlaying(false);
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (storyStep!==null && !storyComplete) {
      setPlaying(true);
      return;
    }
    setStoryComplete(false);
    setDemoRun(run=>run+1);
    setDemoPart(undefined);
    setStoryStep(0);
    setPlaying(true);
  }
  const [checked,setChecked] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      heading.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [project.id, stage]);
  const buildStages = workshopProjectIds.has(project.id) ? [...stages,'3D Workshop'] : stages;
  const assembly = project.assembly[step];
  const currentPart = assemblyPart ?? assembly[3][0];
  const [partName, partQuantity, partPurpose] = project.parts[currentPart];
  const [control, low, high, resultLow, resultHigh] = lesson?.controls ?? project.demo;
  const starter = projectPrograms[art];
  const program = expansion && starter ? {
    ...starter,
    filename: `${project.id}.${starter.filename.split('.').at(-1)}`,
    source: configureProjectSource(expansion,starter.source),
  } : starter;
  const python = program?.filename.endsWith('.py');
  const readyCount = checked.length;
  const demoMarkers = project.parts.map(([name],index)=>({name,index}));
  return <div className="gp-page gp-build">
    <a className="gp-back" href={root}><ArrowLeft size={16}/> All projects</a>
    <header className="gp-title"><h1>{project.title}</h1><p>{project.outcome}</p></header>
    <nav className="gp-stages" aria-label="Project stages">{buildStages.map((name,i)=>
      <a key={name} href={link(project.id,i)} aria-current={i===stage?'step':undefined}><span>{i+1}</span>{name}</a>)}</nav>
    <section className="gp-panel" aria-labelledby="gp-stage">
      <h2 id="gp-stage" ref={heading} tabIndex={-1}>{buildStages[stage]}</h2>
      {stage===5 && project.id==='button-indicator' && <Suspense fallback={<p role="status">Loading the push-button workshop…</p>}><PushButtonWorkshop/></Suspense>}
      {stage===5 && project.id==='mechanism-study' && <Suspense fallback={<p role="status">Loading the gear reducer workshop…</p>}><GearReducerWorkshop/></Suspense>}
      {stage===5 && project.id==='desktop-arm' && <Suspense fallback={<p role="status">Loading the desktop servo workshop…</p>}><DesktopServoWorkshop/></Suspense>}
      {stage===5 && project.id==='vision-counter' && <Suspense fallback={<p role="status">Loading the camera counter workshop…</p>}><CameraCounterWorkshop/></Suspense>}
      {stage===5 && project.id==='model-streetlight' && <Suspense fallback={<p role="status">Loading the streetlight workshop…</p>}><ModelStreetlightWorkshop/></Suspense>}
      {stage===5 && project.id==='wardrobe-light' && <Suspense fallback={<p role="status">Loading the wardrobe workshop…</p>}><WardrobeLightWorkshop/></Suspense>}
      {stage===5 && project.id==='reading-corner-indicator' && <Suspense fallback={<p role="status">Loading the reading corner workshop…</p>}><ReadingCornerWorkshop/></Suspense>}
      {stage===5 && project.id==='greenhouse-shade-monitor' && <Suspense fallback={<p role="status">Loading the greenhouse shade workshop…</p>}><GreenhouseShadeWorkshop/></Suspense>}
      {stage===5 && project.id==='display-case-light' && <Suspense fallback={<p role="status">Loading the exhibit workshop…</p>}><DisplayCaseWorkshop/></Suspense>}
      {stage===5 && project.id==='stair-model-marker' && <Suspense fallback={<p role="status">Loading the staircase workshop…</p>}><StairMarkerWorkshop/></Suspense>}
      {stage===5 && project.id==='window-shadow-detector' && <Suspense fallback={<p role="status">Loading the window workshop…</p>}><WindowShadowWorkshop/></Suspense>}
      {stage===5 && project.id==='school-diorama-night-mode' && <Suspense fallback={<p role="status">Loading the school workshop…</p>}><SchoolDioramaWorkshop/></Suspense>}
      {stage===5 && project.id==='camping-model-lantern' && <Suspense fallback={<p role="status">Loading the lantern workshop…</p>}><CampingLanternWorkshop/></Suspense>}
      {stage===5 && project.id==='tunnel-model-light' && <Suspense fallback={<p role="status">Loading the tunnel workshop…</p>}><TunnelLightWorkshop/></Suspense>}
      {stage===5 && project.id==='terrarium-temperature-flag' && <Suspense fallback={<p role="status">Loading the terrarium workshop…</p>}><TerrariumWorkshop/></Suspense>}
      {stage===5 && project.id==='desk-comfort-monitor' && <Suspense fallback={<p role="status">Loading the desk comfort workshop…</p>}><DeskComfortWorkshop/></Suspense>}
      {stage===5 && project.id==='seed-tray-temperature-flag' && <Suspense fallback={<p role="status">Loading the seed tray workshop…</p>}><SeedTrayWorkshop/></Suspense>}
      {stage===5 && project.id==='sunlit-window-monitor' && <Suspense fallback={<p role="status">Loading the sunlit window workshop…</p>}><SunlitWindowWorkshop/></Suspense>}
      {stage===5 && project.id==='model-incubator-temperature-alert' && <Suspense fallback={<p role="status">Loading the model incubator workshop…</p>}><IncubatorWorkshop/></Suspense>}
      {stage===5 && project.id==='aquarium-model-temperature-alert' && <Suspense fallback={<p role="status">Loading the aquarium workshop…</p>}><AquariumWorkshop/></Suspense>}
      {stage===5 && project.id==='solar-oven-model-monitor' && <Suspense fallback={<p role="status">Loading the solar oven workshop…</p>}><SolarOvenWorkshop/></Suspense>}
      {stage===5 && project.id==='vent-outlet-temperature-indicator' && <Suspense fallback={<p role="status">Loading the vent outlet workshop…</p>}><VentOutletWorkshop/></Suspense>}
      {stage===5 && project.id==='cold-pack-warming-indicator' && <Suspense fallback={<p role="status">Loading the cold-pack workshop…</p>}><ColdPackWorkshop/></Suspense>}
      {stage===5 && project.id==='equipment-enclosure-monitor' && <Suspense fallback={<p role="status">Loading the equipment enclosure workshop…</p>}><EquipmentEnclosureWorkshop/></Suspense>}
      {stage===5 && project.id==='basil-pot-moisture-flag' && <Suspense fallback={<p role="status">Loading the basil moisture workshop…</p>}><BasilMoistureWorkshop/></Suspense>}
      {stage===5 && project.id==='drainage-bottle-experiment' && <Suspense fallback={<p role="status">Loading the drainage column workshop…</p>}><DrainageBottleWorkshop/></Suspense>}
      {stage===5 && project.id==='plant-pot-depth-comparison' && <Suspense fallback={<p role="status">Loading the two-depth pot workshop…</p>}><PlantPotDepthWorkshop/></Suspense>}
      {stage===5 && project.id==='capillary-watering-model' && <Suspense fallback={<p role="status">Loading the passive wick workshop…</p>}><CapillaryWateringWorkshop/></Suspense>}
      {stage===5 && project.id==='model-wind-vane-pointer' && <Suspense fallback={<p role='status'>Loading the wind-vane workshop…</p>}><WindVaneWorkshop/></Suspense>}
      {stage===5 && project.id==='desktop-camera-pan-model' && <Suspense fallback={<p role='status'>Loading the camera pan workshop…</p>}><CameraPanWorkshop/></Suspense>}
      {stage===5 && project.id==='model-letter-sorter-flap' && <Suspense fallback={<p role='status'>Loading the letter sorter workshop…</p>}><LetterSorterWorkshop/></Suspense>}
      {stage===5 && project.id==='mini-drawbridge-model' && <Suspense fallback={<p role='status'>Loading the drawbridge workshop…</p>}><DrawbridgeWorkshop/></Suspense>}
      {stage===5 && project.id==='cardboard-dial-gauge' && <Suspense fallback={<p role='status'>Loading the calibrated dial workshop…</p>}><DialGaugeWorkshop/></Suspense>}
      {stage===5 && project.id==='model-parking-barrier' && <Suspense fallback={<p role='status'>Loading the two-beam barrier workshop…</p>}><ParkingBarrierWorkshop/></Suspense>}
      {stage===5 && project.id==='game-controller-input-tester' && <Suspense fallback={<p role='status'>Loading the controller input workshop…</p>}><GamepadWorkshop/></Suspense>}
      {stage===5 && project.id==='handheld-signal-paddle' && <Suspense fallback={<p role='status'>Loading the three-flash paddle workshop…</p>}><PaddleWorkshop/></Suspense>}
      {stage===5 && project.id==='drawer-closed-indicator' && <Suspense fallback={<p role='status'>Loading the drawer contact workshop…</p>}><DrawerWorkshop/></Suspense>}
      {stage===5 && project.id==='mailbox-test-flag' && <Suspense fallback={<p role='status'>Loading the mailbox reminder workshop…</p>}><MailboxWorkshop/></Suspense>}
      {stage===5 && project.id==='model-crossing-request' && <Suspense fallback={<p role='status'>Loading the crossing signal workshop…</p>}><CrossingRequestWorkshop/></Suspense>}
      {stage===5 && project.id==='accessible-desk-switch' && <Suspense fallback={<p role='status'>Loading the broad-paddle Hold / Toggle workshop…</p>}><AccessibleSwitchWorkshop/></Suspense>}
      {stage===5 && project.id==='model-elevator-call-light' && <Suspense fallback={<p role='status'>Loading the hand-operated elevator workshop…</p>}><ElevatorCallWorkshop/></Suspense>}
      {stage===5 && project.id==='model-doorbell-panel' && <Suspense fallback={<p role='status'>Loading the two-note model doorbell workshop…</p>}><DoorbellWorkshop/></Suspense>}
      {stage===5 && project.id==='quiz-desk-response-button' && <Suspense fallback={<p role='status'>Loading the three-station quiz desk workshop…</p>}><QuizDeskWorkshop/></Suspense>}
      {stage===5 && project.id==='library-help-button' && <Suspense fallback={<p role='status'>Loading the two-station library help workshop…</p>}><LibraryHelpWorkshop/></Suspense>}
      {stage===5 && project.id==='window-box-comparison' && <Suspense fallback={<p role='status'>Loading window box comparison workshop…</p>}><WindowBoxWorkshop/></Suspense>}
      {stage===5 && project.id==='soil-drying-timer-study' && <Suspense fallback={<p role="status">Loading the scheduled drying timer workshop…</p>}><SoilDryingTimerWorkshop/></Suspense>}
      {stage===5 && project.id==='mulch-moisture-experiment' && <Suspense fallback={<p role="status">Loading the mulch comparison workshop…</p>}><MulchMoistureWorkshop/></Suspense>}
      {stage===5 && project.id==='clay-soil-calibration' && <Suspense fallback={<p role="status">Loading the clay contact workshop…</p>}><ClaySoilWorkshop/></Suspense>}
      {stage===5 && project.id==='sandy-soil-calibration' && <Suspense fallback={<p role="status">Loading the sandy calibration workshop…</p>}><SandySoilWorkshop/></Suspense>}
      {stage===5 && project.id==='seedling-tray-moisture-check' && <Suspense fallback={<p role="status">Loading the seedling tray workshop…</p>}><SeedlingMoistureWorkshop/></Suspense>}
      {stage===5 && project.id==='traffic-sequencer' && <Suspense fallback={<p role="status">Loading the traffic signal workshop…</p>}><TrafficSignalWorkshop/></Suspense>}
      {stage===5 && project.id==='ambient-light' && <Suspense fallback={<p role="status">Loading the night-light workshop…</p>}><NightLightWorkshop/></Suspense>}
      {stage===5 && project.id==='home-project' && <Suspense fallback={<p role="status">Loading the room climate workshop…</p>}><RoomClimateWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-21' && <Suspense fallback={<p role="status">Loading the MQ-2 signal workshop…</p>}><Mq2Workshop/></Suspense>}
      {stage===5 && project.id==='directory-20' && <Suspense fallback={<p role="status">Loading the electromagnet crane workshop…</p>}><CraneWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-19' && <Suspense fallback={<p role="status">Loading the electronic piano workshop…</p>}><PianoWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-18' && <Suspense fallback={<p role="status">Loading the three-lamp streetlight workshop…</p>}><StreetSystemWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-17' && <Suspense fallback={<p role="status">Loading the railway crossing workshop…</p>}><RailwayWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-16' && <Suspense fallback={<p role="status">Loading the ultrasonic radar workshop…</p>}><RadarWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-15' && <Suspense fallback={<p role="status">Loading the weather imaging workshop…</p>}><CubeSatWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-14' && <Suspense fallback={<p role="status">Loading the emergency lighting workshop…</p>}><EmergencyWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-13' && <Suspense fallback={<p role="status">Loading the industrial safety control workshop…</p>}><IndustrialWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-12' && <Suspense fallback={<p role="status">Loading the mine-safety teaching workshop…</p>}><MineWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-11' && <Suspense fallback={<p role="status">Loading the smart waste-bin workshop…</p>}><SmartBinWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-10' && <Suspense fallback={<p role="status">Loading the AQUACLEAN skimmer workshop…</p>}><AquacleanWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-9' && <Suspense fallback={<p role="status">Loading the two-channel flood-gate workshop…</p>}><FloodGateWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-8' && <Suspense fallback={<p role="status">Loading the flood-warning workshop…</p>}><FloodWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-7' && <Suspense fallback={<p role="status">Loading the virtual rocket workshop…</p>}><RocketWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-6' && <Suspense fallback={<p role="status">Loading the bottle vacuum workshop…</p>}><VacuumWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-5' && <Suspense fallback={<p role="status">Loading the micro-drone ranging workshop…</p>}><LidarWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-4' && <Suspense fallback={<p role="status">Loading the solar floor sweeper workshop…</p>}><SolarSweeperWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-3' && <Suspense fallback={<p role="status">Loading the beacon-response rover workshop…</p>}><BeaconRoverWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-2' && <Suspense fallback={<p role="status">Loading the ESP32 dual-link workshop…</p>}><Esp32CarWorkshop/></Suspense>}
      {stage===5 && project.id==='directory-1' && <Suspense fallback={<p role="status">Loading the Bluetooth car workshop…</p>}><BluetoothCarWorkshop/></Suspense>}
      {stage===5 && project.id==='soil-observer' && <Suspense fallback={<p role="status">Loading the soil moisture workshop…</p>}><SoilMoistureWorkshop/></Suspense>}
      {stage===5 && project.id==='hand-project' && <Suspense fallback={<p role="status">Loading the tendon hand workshop…</p>}><TendonHandWorkshop/></Suspense>}
      {stage===5 && project.id==='rover-project' && <Suspense fallback={<p role="status">Loading the 3D rover workshop…</p>}><RoverWorkshop/></Suspense>}
      {stage===0 && <div className="gp-split">
        {isRocketLab ? <figure className="gp-rocket-overview"><img src={rocketCover} alt="Virtual launch stand, flight arc, peak and landing marker"/><figcaption>Virtual flight lab · {rocketLabSpeed} m/s fixed starting speed</figcaption></figure> : <figure><img src={isDialGauge ? dialGaugeCover : isDrawbridge ? drawbridgeCover : isLetterSorter ? letterSorterCover : isCameraPanModel ? cameraPanModelCover : isWindVane ? windVaneCover : isModelParkingBarrier ? modelParkingBarrierCover : isControllerInput ? controllerInputCover : isHandheldSignal ? handheldSignalCover : isDrawerIndicator ? drawerIndicatorCover : isMailboxFlag ? mailboxFlagCover : isModelCrossing ? modelCrossingCover : isAccessibleDeskSwitch ? accessibleDeskSwitchCover : isElevatorCallLight ? elevatorCallCover : isModelDoorbell ? modelDoorbellCover : isQuizDesk ? quizDeskCover : isLibraryHelpButton ? libraryHelpButtonCover : isWindowBoxComparison ? windowBoxComparisonCover : isSoilDryingTimer ? soilDryingTimerCover : isCapillaryWatering ? capillaryWateringCover : isPlantPotDepth ? plantPotDepthCover : isDrainageBottle ? drainageBottleCover : isMulchMoisture ? mulchMoistureCover : isClaySoilCalibration ? claySoilCalibrationCover : isSandySoilCalibration ? sandySoilCalibrationCover : isSeedlingTrayMoisture ? seedlingTrayMoistureCover : isBasilPotMoisture ? basilPotMoistureCover : isEquipmentEnclosure ? equipmentEnclosureCover : isColdPackWarming ? coldPackWarmingCover : isVentOutlet ? ventOutletCover : isSolarOvenMonitor ? solarOvenMonitorCover : isAquariumTemperature ? aquariumTemperatureCover : isIncubatorTemperature ? incubatorTemperatureCover : isSunlitWindow ? sunlitWindowCover : isSeedTrayTemperature ? seedTrayTemperatureCover : isDeskComfort ? deskComfortCover : isTerrariumTemperature ? terrariumTemperatureCover : isTunnelModel ? tunnelModelCover : isCampingLantern ? campingLanternCover : isSchoolDiorama ? schoolDioramaCover : isWindowShadow ? windowShadowCover : isStairModel ? stairModelCover : isDisplayCase ? displayCaseCover : isGreenhouseShade ? greenhouseShadeCover : isReadingCorner ? readingCornerCover : isWardrobeLight ? wardrobeLightCover : isModelStreetlight ? modelStreetlightCover : isCameraCounter ? cameraCounterCover : isDesktopServo ? desktopServoCover : isGearReducer ? gearReducerCover : isPushButton ? pushButtonCover : isMiniatureSignal ? miniatureSignalCover : isNightLight ? nightLightCover : isRoomClimate ? roomClimateCover : isSoilCalibration ? soilCalibrationCover : isTendonHand ? tendonHandCover : isVoiceWater ? voiceWaterCover : isPiObjectFollower ? piObjectFollowerCover : isPiBinMonitor ? piBinMonitorCover : isPiFaceLock ? piFaceLockCover : isVoiceHome ? voiceHomeCover : isEsp32DoorCamera ? esp32DoorCameraCover : isEsp32SmartHome ? esp32SmartHomeCover : isSwarmCoordination ? swarmCoordinationCover : isFingerprintStarter ? fingerprintStarterCover : isHydroponicChamber ? hydroponicChamberCover : isShakeMonitor ? shakeMonitorCover : isFollowerTrolley ? followerTrolleyCover : isOmniArm ? omniArmCover : isPrepaidMeter ? prepaidMeterCover : isFootstepRfid ? footstepRfidCover : isUnderwaterIr ? underwaterIrCover : isVoiceRover ? voiceRoverCover : isWirelessRail ? wirelessRailCover : isNightPatrol ? nightPatrolCover : isEntranceTemperature ? entranceTemperatureCover : isRecyclingVending ? recyclingVendingCover : isVendingMachine ? vendingMachineCover : isGestureLamp ? gestureLampCover : isSmartHeadlights ? smartHeadlightsCover : isBleGamepad ? bleGamepadCover : isLineFollower ? lineFollowerCover : isRoomController ? roomControllerCover : isMotionPick ? motionPickCover : isSolarLawn ? solarLawnCover : isSolarTricopter ? solarTricopterCover : isGpsGsm ? gpsGsmCover : isHorizonTracker ? horizonTrackerCover : isGsmEnergy ? gsmEnergyCover : isBleArm ? bleArmCover : isMimicHand ? mimicHandCover : isBellowsSimulator ? bellowsSimulatorCover : isSelfParking ? selfParkingCover : isSolarTracker ? solarTrackerCover : isWearableScope ? wearableScopeCover : isFingerprintLocker ? fingerprintLockerCover : isLightInterlock ? lightInterlockCover : isSolarMeter ? solarMeterCover : isAndroidSnake ? androidSnakeCover : isTankRefill ? tankRefillCover : isGestureRover ? gestureRoverCover : isBluetoothHome ? bluetoothHomeCover : isClassroomLab ? classroomLabCover : isTiltCamera ? tiltCameraCover : isDetectionBench ? detectionBenchCover : isPiBench ? piClimateCover : isEnclosure ? enclosureCover : isFanInterlock ? fanInterlockCover : isGpsAlert ? gpsAlertCover : isExhibitionLock ? exhibitionLockCover : isClassroomAir ? classroomAirCover : isGreenhouse ? greenhouseCover : isPickBalance ? pickBalanceCover : isRoverArm ? roverArmCover : isAutomaticTap ? automaticTapCover : isSoapDispenser ? soapDispenserCover : isTrafficParking ? trafficParkingCover : isSchoolBell ? schoolBellCover : isRfidDoor ? rfidCover : isRainClothesline ? rainCover : isMq2Monitor ? mq2Cover : isElectromagnetCrane ? craneCover : isElectronicPiano ? pianoCover : isStreetLight ? streetLightCover : isRailwayGate ? railwayCover : isUltrasonicRadar ? radarCover : isCubeSat ? cubeSatCover : isEmergencyLighting ? emergencyCover : isIndustrialMonitor ? industrialCover : isMineSafety ? mineCover : isSmartBin ? binCover : isAquaclean ? aquaCover : isFloodGate ? gateCover : isFloodWarning ? floodCover : isBottleVacuum ? vacuumCover : isLidarDrone ? droneCover : isSolarSweeper ? solarCover : (isRadioCar || isBeaconRover) ? bluetoothCover : expansion ? projectArtwork(project.id) : image(art)}
          alt={isDialGauge ? 'Cardboard dial with a servo pointer, calibration marks and wired input knob' : isDrawbridge ? 'Raised card bridge deck over a model canal with a boat and road vehicle' : isLetterSorter ? 'Card feed ramp and servo-driven deck above two catch bins' : isCameraPanModel ? 'Servo-mounted camera mock-up facing three framing targets' : isWindVane ? 'Model wind vane above a compass base, wired to an Arduino' : isModelParkingBarrier ? 'Toy car at a striped servo barrier with approach and under-arm beams' : isControllerInput ? 'Wired controller faceplate with a joystick and two action buttons' : isHandheldSignal ? 'Handheld signal paddle with a thumb button and wired diffuser lamp' : isDrawerIndicator ? 'Cutaway drawer with a sliding tray, roller switch and wired indicator' : isMailboxFlag ? 'Model mailbox with hinged flap, roller switch and wired reminder light' : isModelCrossing ? 'Tabletop crossing with vehicle and pedestrian signal masts and a request button' : isAccessibleDeskSwitch ? 'Broad hinged desk paddle wired to a mode button and lamp' : isElevatorCallLight ? 'Model elevator shaft with sliding car, roller switch and wired call light' : isModelDoorbell ? 'Model doorway with a wired doorbell, piezo sounder and indicator light' : isQuizDesk ? 'Two quiz team stations and host reset wired to an Arduino' : isLibraryHelpButton ? 'Library counter with visitor and staff switches connected to an Arduino' : isWindowBoxComparison ? 'Matched soil boxes with probes beside a sunny window and in shade' : isSoilDryingTimer ? 'Open soil tray with a fixed moisture probe and dry indicator LED' : isCapillaryWatering ? 'Raised soil cup above a reservoir with a cotton wick and moisture probe' : isPlantPotDepth ? 'Cutaway plant pot with upper and lower soil probes' : isDrainageBottle ? 'Clear drainage bottle with a soil probe, graduated cylinder and runoff basin' : isMulchMoisture ? 'Bare and wood-chip covered trays with wired soil probes' : isClaySoilCalibration ? 'Clay calibration bench with two reference cups and a cutaway test sample' : isSandySoilCalibration ? 'Sandy soil calibration bench with three sample cups, probe and graduated cylinder' : isSeedlingTrayMoisture ? 'Seedling tray with two wired moisture probes and separate LED flags' : isBasilPotMoisture ? 'Basil plant, soil reference cups and a wired moisture probe on a workbench' : isEquipmentEnclosure ? 'Clear equipment enclosure on a workbench with internal and external probes' : isColdPackWarming ? 'Tabletop cold pack and spill tray beside an air probe and glowing warm warning' : isVentOutlet ? 'Tabletop vent grille with outlet probe, room reference and glowing indicator' : isSolarOvenMonitor ? 'Tabletop solar collector with a tilted foil flap, clear cover, air probe and glowing indicator' : isAquariumTemperature ? 'Clear model tank with water reference, dry wall probe and glowing warning LED' : isIncubatorTemperature ? 'Empty model chamber with an air probe, test block, latched LED, piezo and reset button' : isSunlitWindow ? 'Windowsill with a sunlit probe, shaded reference and a glowing warm-spot indicator' : isSeedTrayTemperature ? 'Divided seed tray with paired TMP36 sensors and separate red and green flags' : isDeskComfort ? 'Study desk with a TMP36 probe, threshold dial and three colored indicator lamps' : isTerrariumTemperature ? 'Clear terrarium with a lid vent, air sensor, reference thermometer and glowing warning LED' : isTunnelModel ? 'Cutaway tabletop road tunnel with a shading screen, interior sensor and lit approach' : isCampingLantern ? 'Glowing model lantern beside a tent, a mode button and an outside light sensor' : isSchoolDiorama ? 'Model school with glowing classroom windows, a lit entrance path and an outdoor light sensor' : isWindowShadow ? 'Model window with a card casting a shadow over a sill sensor and a glowing event light' : isStairModel ? 'Tabletop staircase with three glowing step markers, a room-light sensor and an Arduino' : isDisplayCase ? 'Illuminated exhibit on a plinth inside a clear case with an external light sensor' : isGreenhouseShade ? 'Seedling tray under a sliding shade screen beside an exposed reference sensor' : isReadingCorner ? 'Open book on a reading desk beside a page sensor, cutoff dial and status LED' : isWardrobeLight ? 'Open tabletop wardrobe with illuminated shelves, a magnetic contact and an outside room-light sensor' : isModelStreetlight ? 'Model road with a single illuminated streetlight, pavement, Arduino and shielded light sensor' : isCameraCounter ? 'Overhead view of bright disks on dark card beside their threshold mask and labeled regions' : isDesktopServo ? 'Single servo sweeping a lightweight pointer over an angle scale, with Uno and a separate supply' : isGearReducer ? 'A brass pinion and larger acetal gear on parallel shafts with a hand crank' : isPushButton ? 'Arduino Uno wired to a tactile switch, series resistor and illuminated green LED on a breadboard' : isMiniatureSignal ? 'Arduino Uno and series resistors wired to a three-lamp model signal beside a painted stop line' : isNightLight ? 'Photoresistor, Arduino and model night light beside a window' : isRoomClimate ? 'Temperature bench with TMP36, Arduino, thermometer and warning LED' : isSoilCalibration ? 'Three soil cups, capacitive probe, Uno and dry indicator on a bench' : isTendonHand ? 'Two-joint card finger with a servo, nylon tendon and elastic return' : isVoiceWater ? 'Dual-reservoir tabletop dispenser with separate pump tubes and a catch cup' : isPiObjectFollower ? 'Camera rover facing an orange card on a gridded model course' : isPiBinMonitor ? 'Cutaway model bin with an overhead sonar and Raspberry Pi monitor' : isPiFaceLock ? 'Model door with a visible servo latch and two controller boards' : isVoiceHome ? 'Laptop, ESP32 board, and separate desk and hall lamps' : isEsp32DoorCamera ? 'Model doorway, camera mount, reed contact and toy parcel' : isEsp32SmartHome ? 'Cutaway model house with two lamps, an ESP32 and an outdoor light sensor' : isSwarmCoordination ? 'Two raised robot drive rigs with Arduino Mega controllers linked by UART' : isFingerprintStarter ? 'Fingerprint reader, start switch and raised model starter wheel' : isHydroponicChamber ? 'Cutaway hydroponic chamber with two plants, a reservoir and circulating water path' : isShakeMonitor ? 'Model building and accelerometer on a guided shake table with Arduino alert panel' : isFollowerTrolley ? 'Mesh basket trolley facing an orange shopper target in a model aisle' : isOmniArm ? 'Four-wheel Mecanum chassis and articulated arm between pickup and drop platforms' : isPrepaidMeter ? 'Prepaid meter bench with two current monitors and visibly separate billed and test loads' : isFootstepRfid ? 'Press tile with piezo discs, rectifier and capacitor beside a wireless tag reader' : isUnderwaterIr ? 'Two Arduino stations facing across a clear water channel with an illuminated optical path' : isVoiceRover ? 'Microphone laptop and two-wheel rover beside a marked driving area' : isWirelessRail ? 'Tabletop locomotive, signal mast and trackside wireless control board' : isNightPatrol ? 'Two-wheel rover following tape between model lamps and a help-point sign' : isEntranceTemperature ? 'Temperature sensor above a model tray with a servo barrier and two indicators' : isRecyclingVending ? 'Tagged bottle beside a reverse vending machine with three exit bins' : isVendingMachine ? 'Cutaway four-lane vending cabinet with gate servos, a token reader and a shared collection chute' : isGestureLamp ? 'Low-voltage study lamp with dual infrared gates and a swiping card' : isSmartHeadlights ? 'Model car lighting the road beside an approaching vehicle' : isBleGamepad ? 'Six-button ESP32 gamepad beside a token collection board' : isLineFollower ? 'Three-sensor rover on a curved black tape course' : isRoomController ? 'Cutaway room with temperature sensor, guarded exhaust fan and setpoint dial' : isMotionPick ? 'Tilt pad beside a wheeled rover carrying a foam block toward a marked bay' : isSolarLawn ? 'Solar-panel rover beside alternating covered and unvisited strips of lawn' : isSolarTricopter ? 'Solar tracking station beside a three-rotor camera trainer' : isGpsGsm ? 'Portable GPS and GSM electronics on a classroom test course beside a simulated phone' : isHorizonTracker ? 'Single-axis solar panel on a marked turntable beside a hooded sensor and a desk lamp' : isGsmEnergy ? 'Low-voltage energy meter with a current sensor, GSM radio and phone inbox' : isBleArm ? 'Metal six-servo arm, phone and foam-block transfer stations on a bench' : isMimicHand ? 'Five-finger sensor glove and cable-driven cardboard hand making a point gesture' : isBellowsSimulator ? 'Virtual bellows beside the Arduino controller, input knobs and LEDs' : isSelfParking ? 'Three-sonar rover parked between cardboard curb blocks on the tabletop lane' : isSolarTracker ? 'Mini solar panel on a two-axis gimbal with a cross-shaped light sensor head and weather breakout' : isWearableScope ? 'Strap-mounted Nano and OLED plotting a square wave beside the bench test source' : isFingerprintLocker ? 'Open tabletop locker beside an optical fingerprint reader, servo and Arduino' : isLightInterlock ? 'Hinged cardboard demonstration box with magnetic contact, white LED and Arduino control board' : isSolarMeter ? 'Mini solar panel wired to a current monitor, Uno and resistor load on a bench' : isAndroidSnake ? 'Four cardboard links bending through three servo joints beside an Android phone' : isTankRefill ? 'Clear supply and receiving tanks linked to a peristaltic pump' : isGestureRover ? 'Handheld tilt pad wired to a two-wheel rover on a marked test lane' : isBluetoothHome ? 'Room and porch lit beside an Arduino Uno and Bluetooth UART breakout' : isClassroomLab ? 'Classroom benches for a switch circuit, an ultrasonic trial and a rover route' : isTiltCamera ? 'Hinged camera and IMU platform aimed at tabletop blocks' : isDetectionBench ? 'Three detection lanes with a radar target, sonar range marker and classroom RFID reader' : isPiBench ? 'Raspberry Pi 5 with active cooler, wired climate sensor and breadboard with pushbutton and LED' : isEnclosure ? 'Printed Uno enclosure with lifted vented lid and USB cable' : isFanInterlock ? 'Tabletop pressure pad, alert LED and guarded low-voltage fan' : isGpsAlert ? 'GPS breakout, test button and a wired receiver' : isExhibitionLock ? 'Keypad, hinged model door and servo-driven sliding bolt' : isClassroomAir ? 'Optical particulate sensor, Arduino and two status LEDs on a bench' : isGreenhouse ? 'Greenhouse model with planter, pump, fan and Ethernet shield' : isPickBalance ? 'Gripper rover and two-wheel balancing robot on a divided workbench' : isRoverArm ? 'Two-wheel rover course beside a stationary servo arm' : isAutomaticTap ? 'Recirculating model tap with a clear tank, sensor and pump' : isSoapDispenser ? 'Servo-operated soap dispenser with a sonar sensor and catch tray' : isTrafficParking ? 'Tabletop intersection and three-space parking lot' : isSchoolBell ? 'Tabletop school bell with a wired digital clock and piezo' : isRfidDoor ? 'Classroom RFID tag near a reader and tabletop servo latch' : isRainClothesline ? 'Model clothesline retracted beneath a canopy next to a rain sensor' : isMq2Monitor ? 'Wired MQ-2 bench with sensor, Arduino and threshold LED' : isElectromagnetCrane ? 'Tabletop gantry with a suspended electromagnet lifting a steel washer' : isElectronicPiano ? 'Eight tactile keys wired to an Arduino and piezo on a breadboard' : isStreetLight ? 'Three illuminated lamps on a model street at dusk' : isRailwayGate ? 'Model train and striped crossing barrier' : isUltrasonicRadar ? 'Ultrasonic sensor scanning a tabletop target' : isCubeSat ? 'Model CubeSat passing over Earth and its ground station' : isEmergencyLighting ? 'Tabletop corridor with path lights and entrance beacon' : isIndustrialMonitor ? 'Model conveyor and bench training panel' : isMineSafety ? 'Virtual mine with two sampling stations and a local beacon' : isSmartBin ? 'Waste bin cutaway with lid sensor and Ethernet station' : isAquaclean ? 'Tabletop river skimmer with paddle, ramp and collection basket' : isFloodGate ? 'Two-chamber model spillway and its servo gate' : isFloodWarning ? 'Tabletop flood warning station and model neighborhood' : isBottleVacuum ? 'Wide-neck clear PET bottle and screw cap' : isLidarDrone ? 'Crazyflie 2.1+ micro quadcopter' : isSolarSweeper ? 'Regulated USB solar panel' : (isRadioCar || isBeaconRover) ? 'Two-wheel chassis kit with motors and caster' : `Illustrated build reference for ${project.title}`}/>
          <figcaption>{isDialGauge ? 'Dial gauge simulation with a servo pointer and analog input knob' : isDrawbridge ? 'Drawbridge simulation with a hinged road deck and two crossing routes' : isLetterSorter ? 'Letter sorter simulation with feed ramp, tilting deck and catch bins' : isCameraPanModel ? "Return from both sides to compare framing at the center target." : isWindVane ? "The shaft magnet turns with the vane, and the calibrated reading follows the arrow." : isModelParkingBarrier ? "Either beam holds the arm open. Both must clear before it lowers." : isControllerInput ? "Test both analog axes and all three switches independently." : isHandheldSignal ? "A fresh thumb press triggers three flashes through the diffuser." : isDrawerIndicator ? "The LED lights only when the rear tab reaches the roller at the stop." : isMailboxFlag ? "The reminder stays lit after the flap closes and clears on a closed-flap reset." : isModelCrossing ? "The vehicle signal turns red before the model displays WALK." : isAccessibleDeskSwitch ? "Compare how the lamp responds to the same paddle in Hold and Toggle modes." : isElevatorCallLight ? "The call light stays on until the car rolls onto the landing switch." : isModelDoorbell ? "The doorbell triggers two notes and a light that stays on through the pause." : isQuizDesk ? "The first team response stays lit until the host resets the desk." : isLibraryHelpButton ? "The visitor light follows HELP. The staff light stays on until acknowledgment." : isWindowBoxComparison ? "Compare the change from baseline at each placement." : isSoilDryingTimer ? "The fixed blade samples one location and the LED confirms three consecutive low readings." : isCapillaryWatering ? "Only the wick reaches the reservoir. The soil cup stays above the water." : isPlantPotDepth ? "Two probes in the same pot show how readings change at different depths." : isDrainageBottle ? "The basin measures runoff while the probe tracks the soil above the outlet." : isMulchMoisture ? "The two probes measure at equal depth while the covered and bare surfaces dry." : isClaySoilCalibration ? "The cutaway shows how an air gap changes probe contact at the same insertion depth." : isSandySoilCalibration ? "Use the dry and wetter cups to set the scale, then test the 15 mL sample." : isSeedlingTrayMoisture ? "Compare the edge and inner cells before watering either one." : isBasilPotMoisture ? "The dry and damp samples set the scale before the probe moves to the basil pot." : isEquipmentEnclosure ? "Open the sliding vent to release warm air while the two probes stay in place." : isColdPackWarming ? 'The probe stays in place while the pack moves in and out of the tray.' : isVentOutlet ? 'One probe sits in the outlet stream. The other measures the room outside it.' : isSolarOvenMonitor ? 'The angled flap directs light toward an absorber beneath the cover.' : isAquariumTemperature ? 'The TMP36 sits on the outside wall. The water reference is a separate measurement.' : isIncubatorTemperature ? 'The indicator and sounder sit outside the empty test chamber.' : isSunlitWindow ? 'The two probes compare local warming with the shaded air beside the sill.' : isSeedTrayTemperature ? 'Two sensors at equal heights measure separate tray locations. Each flag follows its own reading.' : isDeskComfort ? 'The dial sets the temperature band. One indicator shows where the air reading falls.' : isTerrariumTemperature ? 'The sensor and thermometer read the air inside a clear model enclosure.' : isTunnelModel ? 'A screen shades the interior sensor while the entrance lamp lights the approach.' : isCampingLantern ? 'The button changes the lantern mode while the outside sensor continues reading room light.' : isSchoolDiorama ? 'The path and classroom have separate outputs and switch at different light levels.' : isWindowShadow ? 'The movable card creates a fast drop at the sill while the Uno tracks a slower baseline.' : isStairModel ? 'Three independent outputs light the bottom, middle and top edges in order.' : isDisplayCase ? 'The lamp lights the object from above while the outside sensor reads room light.' : isGreenhouseShade ? 'The tray sensor measures beneath the screen while the reference stays exposed.' : isReadingCorner ? 'Set the cutoff with the dial and measure light beside the page.' : isWardrobeLight ? 'A magnet on the door and a sensor outside the cabinet determine whether the shelf light turns on.' : isModelStreetlight ? 'The downward lamp lights the pavement while the sensor reads ambient light away from the beam.' : isCameraCounter ? 'The mask shows which pixels pass the cutoff. A box marks each connected region large enough to count.' : isDesktopServo ? 'The fixed dial measures the link position independently of the Uno’s command.' : isGearReducer ? 'The orange and blue witness marks show how far each gear has turned.' : isPushButton ? 'The yellow lead carries the D2 input. The blue lead carries the LED current after the series resistor.' : isMiniatureSignal ? 'One resistor per colored wire limits the current through its LED.' : isNightLight ? 'The divider reports ambient light while the shade keeps the lamp from illuminating the sensor.' : isRoomClimate ? 'The monitor compares a TMP36 reading with two switch points.' : isSoilCalibration ? 'Use the same soil and probe depth in the reference cups and test cup.' : isTendonHand ? 'The tendon pulls under both hinges, while the elastic returns the finger from above.' : isVoiceWater ? 'Two independent pump paths share one catch cup. The controller enables only the selected channel.' : isPiObjectFollower ? 'The camera compares the target’s center and width with the steering thresholds.' : isPiBinMonitor ? 'As the target rises, the air gap shrinks and the fill estimate increases.' : isPiFaceLock ? 'The matching decision goes through USB to the Arduino, which drives the model door latch.' : isVoiceHome ? 'The computer sends one serial byte to the ESP32. The ESP32 controls both lighting zones.' : isEsp32DoorCamera ? 'The magnet separates from the contact as the door swings open. The camera takes one still of the staged scene.' : isEsp32SmartHome ? 'The ESP32 controls the indoor light and reads a separate outdoor light sensor for the porch' : isSwarmCoordination ? 'Two raised wheels share one drive token. The colored patch leads connect the controllers.' : isFingerprintStarter ? 'A matched fingerprint authorizes the start button for five seconds' : isHydroponicChamber ? 'The pump supplies the channel and gravity carries water back to the reservoir' : isShakeMonitor ? 'The accelerometer moves with the platform while the Arduino and alert panel stay still' : isFollowerTrolley ? 'The camera steers toward the patch while sonar checks the path ahead' : isOmniArm ? 'The vehicle parks between two docks before moving the arm' : isPrepaidMeter ? 'The upstream sensor measures both loads. The second sensor measures billed current.' : isFootstepRfid ? 'The tile charges the capacitor, and a classroom tag authorizes one load test' : isUnderwaterIr ? 'Infrared pulses cross a short water path between two dry optical heads' : isVoiceRover ? 'The laptop recognizes the phrase. The ESP32 drives the wheels for one timed pulse.' : isWirelessRail ? 'The model cab shows the last fresh signal and turns amber when updates stop' : isNightPatrol ? 'Press CALL to park the rover and signal the local operator' : isEntranceTemperature ? 'The presence beam triggers a surface temperature reading at a fixed position' : isRecyclingVending ? 'One detector per exit confirms that the sample reached its selected bin' : isVendingMachine ? 'The shared exit sensor confirms a can before the sale is counted' : isGestureLamp ? 'The lamp uses the order of the beam interruptions to choose a brightness step' : isSmartHeadlights ? 'The model dips its headlights when it detects forward glare' : isBleGamepad ? 'Four directional buttons and two action buttons send Bluetooth HID reports' : isLineFollower ? 'Calibrated reflectance readings steer the rover along the tape' : isRoomController ? 'The controller uses separate fan-on and fan-off thresholds' : isMotionPick ? 'The tilt pad controls driving and the gripper in separate modes' : isSolarLawn ? 'Alternating passes cover the lawn one strip at a time' : isSolarTricopter ? 'Two stations demonstrate light tracking and tricopter tail steering' : isGpsGsm ? 'The tracker checks the age of a GPS fix before sending its coordinates' : isHorizonTracker ? 'The panel sweeps through marked headings and returns to the strongest reading' : isGsmEnergy ? 'The current monitor measures a 5 V resistor load while the GSM module reports a snapshot' : isBleArm ? 'The phone sends discrete steps to the individual servo channels' : isMimicHand ? 'Five analog inputs map to five independently driven tendons' : isBellowsSimulator ? 'The browser animates the test chamber while the Arduino circuit simulates its signals' : isSelfParking ? 'The rover scans along the curb and reverses into a bay using two arcs' : isSolarTracker ? 'The cross-shaped shade helps four light sensors find the brighter side' : isWearableScope ? 'The OLED plots one sampled voltage per display column' : isFingerprintLocker ? 'The servo keeps the latch retracted until the door closes' : isLightInterlock ? 'The lid contact controls an eight-second visible-light demonstration' : isSolarMeter ? 'The solar panel supplies the resistor path while USB powers the meter' : isAndroidSnake ? 'Three servo shafts turn adjacent links to pass a bend from head to tail' : isTankRefill ? 'Two receiving marks control refill while a third sensor watches the supply' : isGestureRover ? 'The tilt pad sends sensor and enable signals through a short tether' : isBluetoothHome ? 'Two low-voltage lamp circuits receive separate commands from a simulated phone' : isClassroomLab ? 'Three stations arranged as one classroom rotation' : isTiltCamera ? 'The camera and IMU tilt together while the target stays on the table' : isDetectionBench ? 'One Uno reports motion edges, measured distance and the tag UID side by side' : isPiBench ? 'The I²C sensor supplies readings and the breadboard carries the LED and capture button' : isEnclosure ? 'The browser model uses the same printable base and lid as the downloads' : isFanInterlock ? 'Bench demonstration of a latched stop and manual reset' : isGpsAlert ? 'Location is shared with the USB test receiver while the alert is active' : isExhibitionLock ? 'Keypad access with an interlock at the door frame' : isClassroomAir ? 'Uno-based particle monitor with a separate practice trace' : isGreenhouse ? 'Soil probe and irrigation line beside a guarded exhaust fan' : isPickBalance ? 'Timed foam-block transfer beside a feedback-controlled balancing station' : isRoverArm ? 'Two independent bench builds share the same Arduino sketch' : isAutomaticTap ? 'Water returns through the basin while the motor and control circuit stay dry' : isSoapDispenser ? 'Sonar, servo horn and spring-loaded soap pump' : isTrafficParking ? 'Two traffic phases beside a separately controlled parking entrance' : isSchoolBell ? 'Battery-backed clock, I²C display and piezo sounder' : isRfidDoor ? 'PN532 reader, separate servo supply and model door strike' : isRainClothesline ? 'Retractable clothesline with a servo linkage and rain-sensing plate' : isMq2Monitor ? 'MQ-2 analog signal, divider and threshold indicator' : isElectromagnetCrane ? 'Hand-operated trolley, electromagnet and separate driver circuit' : isElectronicPiano ? 'One pushbutton and one Arduino input per note' : isStreetLight ? 'Model street with a light sensor and three independently wired lamps' : isRailwayGate ? 'Tabletop crossing with an approach beam and an exit beam' : isUltrasonicRadar ? 'Servo-mounted ultrasonic scanner and test target' : isCubeSat ? 'Virtual orbital imaging pass' : isEmergencyLighting ? 'Tabletop corridor and USB-powered control panel' : isIndustrialMonitor ? 'Conveyor simulation with a local status panel' : isMineSafety ? 'Classroom simulation with fictional sensor values' : isSmartBin ? 'Closed-lid measurement and local collection indicator' : isAquaclean ? 'Model river skimmer and dry electronics station' : isFloodGate ? 'Model spillway with upstream and downstream sensing' : isFloodWarning ? 'Model basin, control panel and neighborhood drill' : isBottleVacuum ? 'Example bottle shape for a two-port collection chamber' : isLidarDrone ? 'Crazyflie 2.1+ before the ranging decks are fitted' : isSolarSweeper ? 'Example panel for the cleaning motor' : (isRadioCar || isBeaconRover) ? 'Example two-wheel chassis kit' : expansion ? 'Project cover with representative hardware' : 'Build reference · illustrative hardware'}</figcaption></figure>}
        <div className="gp-guide"><h3>{(isRocketLab || isMineSafety || isCubeSat) ? 'What you’ll investigate' : 'What you’ll build'}</h3><p>{project.outcome}</p>
          {isMiniatureSignal&&<p>Mount the three LEDs, wire each to a separate output, then upload the sequencer. The model passes when exactly one lamp is lit at a time and the repeated cycle follows red for three seconds, green for three seconds and amber for one second.</p>}
          {isRecyclingVending&&<p>Build the intake, color reader and three exit paths. The build passes when tagged containers reach the correct bins, untagged samples go to Return and points change only after the corresponding detector confirms a drop.</p>}
          {isVendingMachine&&<p>Build four feed channels, wire the token and chute sensors, then try a sale and a simulated jam. The build passes when exactly one can is released and credit changes only after a confirmed passage.</p>}
          {isGestureLamp&&<p>Align two beam pairs, wire the PWM light head and compare swipes in both directions. The build passes when valid swipes change brightness by one step and incomplete or simultaneous interruptions leave it unchanged.</p>}
          {isSmartHeadlights&&<p>Build and wire the model car, then run the daylight, dusk, glare and override trials. The build passes when it dips the beam for glare and waits for clear conditions before restoring high.</p>}
          {isBleGamepad&&<p>Lay out six switches, upload the HID sketch and pair the board in Android settings. The build passes when all directions and actions register independently and their releases return to neutral.</p>}
          {isLineFollower&&<p>Mount and calibrate the array, check steering on a stand and run the course. The build passes when it corrects toward the stronger sensor reading and disables drive on a missing line.</p>}
          {isRoomController&&<p>Build the room model, connect the fan and set the target. The build passes when the fan switches at each threshold, retains its prior state between them and turns off when the sensor is unavailable.</p>}
          {isMotionPick&&<p>Assemble the rover and pad, set the level reference, then attempt a pickup and transfer. The build passes when forward clearance blocks the wheels and the gripper mode moves the lift and jaws with the drive disabled.</p>}
          {isSolarLawn&&<p>Build and calibrate the tabletop rover, then run its five-pass route. The build passes when the light sensor pauses an unfinished pass and a deliberate restart resumes it. The virtual lawn shows the resulting coverage.</p>}
          {isSolarTricopter&&<p>Set up and test both servo mechanisms, then try the virtual camera challenge. The bench build passes when the solar carrier follows the light and the tricopter tail tilts on command. The flight test runs in the browser.</p>}
          {isGpsGsm&&<p>Wire GPS and GSM on separate ports, test a blocked request, then obtain a fresh fix and send one authorized report. The build passes when only a deliberate press with a fresh position requests an SMS.</p>}
          {isHorizonTracker&&<p>Build the yaw turntable and hooded sensor, then sweep a lamp at two different headings. The build passes when the selected heading follows the stronger reading and a dim sweep preserves the previous selection.</p>}
          {isGsmEnergy&&<p>Wire the 5 V load loop, compare two resistances and request a snapshot. The build passes when the measured power predicts the increase in watt-hours and the modem reports the outcome of one SMS attempt.</p>}
          {isBleArm&&<p>Secure the arm, wire Bluetooth and the driver, then test unloaded jogs. The build passes when each command moves only the selected joint relative to its parent and the gripper can move a foam block between the marks.</p>}
          {isMimicHand&&<p>Assemble the hinged hand and glove, connect the five channels, then capture open and curled poses. The build passes when each digit moves independently and the hand can copy a point, pinch and gentle fist within its mechanical travel.</p>}
          {isPiFaceLock&&<p>Fit the model bolt and contact, connect the Pi, and compare three portrait results. A clear match opens the latch. Closing the model door starts the three-second countdown.</p>}
          {isVoiceHome&&<p>Wire the two lamps, check direct serial commands, then run the voice console. The build passes when each accepted phrase controls the intended output and unrelated speech leaves both lamps unchanged.</p>}
          {isEsp32DoorCamera&&<p>Mount the lens, fit the door contact, and connect the local dashboard. Success means one image per settled opening, a stable event count while the door stays open, and a new capture after closing and opening again.</p>}
          {isEsp32SmartHome&&<p>Wire both lights and the divider, join the board’s Wi-Fi, then test the two zones. Success means the room responds to dashboard commands while the automatic porch keeps working through a Wi-Fi disconnect.</p>}
          {isSwarmCoordination&&<p>Build and link both drive rigs, upload their roles, then run a handoff and a link-loss trial. The build passes when only one wheel turns at a time and reconnecting the link leaves both wheels stopped until you start a new trial.</p>}
          {isFingerprintStarter&&<p>Enroll one test sample, verify a denied scan, and use a fresh Start press after a match. Success means the wheel turns only during an authorized pulse and a second start requires a fresh scan.</p>}
          {isHydroponicChamber&&<p>Verify the return flow with plain water, then test daytime lighting and temperature-controlled ventilation. Success means low water stops circulation while light and fan still respond to their own inputs.</p>}
          {isShakeMonitor&&<p>Compare a tap with sustained motion and observe the rolling acceleration trace. Success means the monitor rejects the tap, latches a local shake alert during sustained motion and allows reset after one quiet second.</p>}
          {isFollowerTrolley&&<p>Train the camera on one color patch, then move it along the model aisle. Success means the trolley follows and holds a gap, and cuts motor drive when the target is lost or the forward echo is unsafe.</p>}
          {isOmniArm&&<p>Check the four wheel directions, test individual arm poses and run the dock program. The build succeeds when the chassis slides without turning and the arm delivers the foam block while the wheels stay stopped.</p>}
          {isPrepaidMeter&&<p>Top up the meter and measure how quickly the load uses its credit. The trial succeeds if the billed load cuts off at zero, four differing readings latch an alarm, and reset restores only the remaining credit after the test switch is released.</p>}
          {isFootstepRfid&&<p>Press the tile, measure the stored voltage and use the enrolled tag to enable one brief test. Success means the isolated load LED flashes from the capacitor and the measured voltage falls.</p>}
          {isUnderwaterIr&&<p>Test the path in air, then send a message through clear water. The build succeeds when the receiver decodes both messages while the beam is aligned and accepts no new frame while the beam is blocked.</p>}
          {isVoiceRover&&<p>Set up the microphone, check the serial letters and verify the directions on a wheel stand. The build succeeds when each known phrase drives the correct wheels for one short pulse and Stop immediately disables the driver.</p>}
          {isWirelessRail&&<p>Set up the model trackside and cab boards, compare their lights, and cut trackside power while the model shows green. The trial succeeds when the cab replaces the stale green with amber and returns to red after the mast restarts.</p>}
          {isNightPatrol&&<p>Calibrate the route sensor, patrol the dim classroom track, and practice responding to a local call. The drill succeeds when CALL stops the wheels and acknowledgement leaves the rover parked.</p>}
          {isEntranceTemperature&&<p>Use the tray to compare cool, warm and unavailable object readings. Watch how the result changes the tabletop barrier and indicators.</p>}
          {isBellowsSimulator&&<p>Build the controls, observe a normal fill-and-release cycle, then test a restricted path and an open leak. The simulator passes when each fault latches the alarm and clearing it returns the controller to idle. The circuit is an educational signal simulator with no connection to a person or animal.</p>}
          {isSelfParking&&<p>Set up the lane, verify all three sensor directions and tune the timed turns. The model passes when it rejects a short gap, parks in a wide gap and stops before contacting a target in its path.</p>}
          {isSolarTracker&&<p>Center the gimbal, wire the four light dividers and add weather telemetry. The build passes when each axis reduces its sensor difference and dim light stops movement while temperature and humidity continue to report.</p>}
          {isWearableScope&&<p>Wire the OLED and controls on a breadboard, compare the two time settings with the built-in signal, then mount the tested circuit. The build passes when the longer window shows roughly twice as many cycles and HOLD keeps the last frame on screen.</p>}
          {isFingerprintLocker&&<p>Fit the latch, enroll a test finger, then compare an accepted scan, a rejected scan and a timed release. The model passes when only ID 1 moves the latch and the tab stays clear until the opened door closes.</p>}
          {isLightInterlock&&<p>Build the hinged model, then test a blocked start, a lid-open cutoff and a full cycle. The build passes when the LED turns off on interruption and needs a fresh Start press after the lid closes.</p>}
          {isSolarMeter&&<p>Wire the meter, record a sunny baseline, then test shade, a second load and an open circuit. The build passes when the Uno reports V, mA and mW and you can explain why a disconnected load can show voltage but delivers almost no power.</p>}
          {isAndroidSnake&&<p>Center the horns, join the four links, then compare the three joints during one wave. The build passes when each bend follows the preceding joint and the chain returns to center on S or after the timed burst.</p>}
          {isTankRefill&&<p>Calibrate the marks, route the tubing, then compare the two switching levels. The build passes when the pump starts at low water, continues through the gap, stops at the upper mark, and stays off when the supply is low.</p>}
          {isGestureRover&&<p>Assemble the wheels and tilt pad, calibrate on a level surface, then compare pitch and roll on a stand. The build passes when each gesture produces the expected wheel directions and releasing Enable stops both wheels.</p>}
          {isBluetoothHome&&<p>Connect the phone, send a lamp command, and compare the response with both lights. The build passes when an unknown command leaves both lights unchanged and the status query reports both states after reconnecting.</p>}
          {isClassroomLab && <><p>Start each rotation with a prediction, then have students test it and explain the result. This applies NEP 2020 §4.6 through hands-on learning and assessment based on what students can demonstrate.</p>
            <p><a href="https://www.education.gov.in/sites/upload_files/mhrd/files/NEP_Final_English.pdf" target="_blank" rel="noreferrer">National Education Policy 2020, §4.6</a></p>
            <p><strong>Success criteria.</strong> Explain both LED states, record two distance readings, and complete a rover route that avoids the blocked square.</p></>}
          {isTiltCamera && <p>Mount both boards on a single axis, upload with the GPIO0 jumper, then remove it and calibrate at level. One 20° crossing saves one JPEG, and returning within 10° prepares the next shot.</p>}
          {isDetectionBench && <p>Build and wire the three stations, then change one target at a time. A still object can return an echo, a moving object can trigger radar, and a readable class tag can reveal its UID.</p>}
          {isPiBench && <p>Prepare the Pi, connect the 3.3 V sensor, and wire the LED and pushbutton. Verify that crossing the temperature threshold lights the LED and that one capture appears in the CSV with a timestamp.</p>}
          {isEnclosure && <p>Measure the board and cable, print a fit gauge, then print and assemble the case. The lid should sit flush and the USB plug should reach the board without moving it.</p>}
          {isRadioCar && <p><strong>Follow the signal.</strong> {isEsp32Car ? 'The ESP32 receives a command through the selected link, then sends speed and direction signals to the motor driver.' : 'The phone sends one letter to the Bluetooth board. The Uno decodes it, then tells the motor driver which way to spin each wheel.'}</p>}
          {isBeaconRover && <p><strong>Follow the signal.</strong> Two light sensors tell the Uno which way to turn. Once both see enough light, the Uno stops the motor driver and turns on the red alert. The flashlight represents the target for a classroom trial.</p>}
          {isSolarSweeper && <p><strong>Follow the power.</strong> The panel runs the felt disc. A switched AA pack runs the wheels, and a USB power bank runs the Uno. The Uno measures the solar rail and starts the wheels only if the brush has enough voltage under load.</p>}
          {isLidarDrone && <p><strong>Follow the measurement.</strong> The upper deck measures the wall, the lower deck watches the floor, and the radio sends telemetry to your computer. The physical test uses a stationary bench. The browser shows the corresponding flight response.</p>}
          {isBottleVacuum && <p><strong>Follow the airflow.</strong> Releasing the bulb draws air through the nozzle, into the chamber, and through the mesh. Squeezing it sends the air out through the exhaust valve. Paper stays in the bottle.</p>}
          {isRocketLab && <p>Aim low, midway, or steeply in the virtual field. The lab reports where each flight peaks and lands so you can compare a prediction with the measured result.</p>}
          {isClassroomAir && <p>The photographed parts cover the Uno air-quality build. The exact RoboGenius 20-in-1 kit inventory and activity manual still need to be confirmed.</p>}
          {isAutomaticTap && <p>Trace the water from the tank through the pump and back through the basin. Test the hand sensor, then compare full and low reservoir levels.</p>}
          {isSoapDispenser && <p>Align the sonar, set the servo travel, then compare a hand held under the nozzle with a hand that moves away and returns.</p>}
          {isTrafficParking && <p>Wire the junction signals, then connect the parking gate and fill three bays. Compare the full-lot response with the traffic sequence.</p>}
          {isSchoolBell && <p>Connect the clock and display to the same two-wire bus. Add the piezo, then compare the same scheduled time on a Monday and a Saturday.</p>}
          {isRfidDoor && <p>Assemble the latch, enroll one classroom tag, then compare an accepted scan with a rejected one. Watch how the latch behaves when an accepted tag remains in range.</p>}
          {isRainClothesline && <p>Build the slider, connect the rain plate and servo, then add one drop at a time. Check that a second drop during the dry wait keeps the paper clothes sheltered.</p>}
          {isMq2Monitor && <p>Record the clean-air baseline. Test the threshold with a dial on the bench, then compare simulated gas and perfume responses in the browser. The indicator responds to signal changes without identifying the source.</p>}
          {isElectromagnetCrane && <p>Build the gantry, wire the low-voltage driver, and compare what happens with and without coil current. The trolley travels along the crossbar by hand.</p>}
          {isElectronicPiano && <p>Follow the signal from a button to an Uno input. The sketch translates the input into a pitch and sends the matching pulses to the sounder.</p>}
          {isStreetLight && <p>Build the light-sensing divider, connect each lamp, then compare the same twilight reading on the way into darkness and on the way back into daylight.</p>}
          {isRailwayGate && <p>Align the beams, wire the servo and warning light, then move one train through the crossing. The arm should stay down until the last carriage has cleared beam B.</p>}
          {isUltrasonicRadar && <p>Build a sonar scanner that uses sound to measure distance at each angle. Plotting those pairs produces a radar-style view of the test area.</p>}
          {isCubeSat && <p>Point the camera at Earth, capture an image, then move into the contact window. The image waits onboard between capture and transmission.</p>}
          {isEmergencyLighting && <p>The room light controls the white markers in standby. Pressing Alarm turns on the whole path and starts the red beacon and piezo pulses until you reset it.</p>}
          {isIndustrialMonitor && <p>The physical panel shows local decisions with LEDs. The virtual conveyor makes the difference between acknowledging an alarm and deliberately restarting visible.</p>}
          {isMineSafety && <p>Compare conditions at two points in the tunnel. The local beacon uses current readings. The remote console identifies its last result when the network stops.</p>}
          {isSmartBin && <p>The sonar measures a distance along one line. The empty and full reference positions turn that gap into a fill estimate for a flat test load.</p>}
          {isAquaclean && <p>The paddle pushes floating scraps up the ramp. The Uno stops it at the basket limit while the Ethernet shield sends the latest readings to a nearby monitor.</p>}
          {isFloodGate && <p>Opening depends on both readings. One sensor checks when upstream needs relief. The other checks whether downstream has room for more water.</p>}
          {isFloodWarning && <p>The station signals a rising depth at two checkpoints. The route exercise takes place in a model neighborhood using a tabletop basin, LEDs and a piezo alarm.</p>}
          <h3>{isRocketLab ? 'Experiment workflow' : 'Build workflow'}</h3><ol className="gp-workflow">{project.assembly.map(([title])=><li key={title}>{title}</li>)}<li>{isRocketLab ? 'Run and compare three measured flights' : 'Verify the build and try the interactive demo'}</li></ol>
          <p><strong>Success check</strong> {project.test}</p>
          <a className="gp-button" href={link(project.id,1)}>Start with components <ArrowRight size={16}/></a>
        </div>
      </div>}
      {stage===1 && <><div className="gp-readiness"><p>{(isRocketLab || isMineSafety || isCubeSat) ? 'Review and mark each virtual asset ready before setting up a trial.' : 'Mark each part ready as you gather it.'}</p>
        <div><strong role="status">{readyCount} of {project.parts.length} ready</strong>
          <progress aria-label="Components ready" value={readyCount} max={project.parts.length}/></div></div>
        <div className="gp-parts">{project.parts.map(([name,quantity,purpose],i)=>
          <article key={name} className={checked.includes(i) ? 'selected' : undefined}>
            {(isRocketLab || isMineSafety || isCubeSat) ? <VirtualAsset index={i} kind={isCubeSat ? 'orbit' : isMineSafety ? 'mine' : undefined}/> : <PartPhotos name={name} projectId={art}/>}
            <div className="gp-preview-heading"><h3>{name}</h3><span>{quantity}</span></div>
            <p>{purpose}</p>
            <button type="button" className="gp-ready" aria-label={`${name} ready`} aria-pressed={checked.includes(i)}
              onClick={()=>setChecked(previous=>previous.includes(i)?previous.filter(n=>n!==i):[...previous,i])}>
              {checked.includes(i)?<Check size={18}/>:<Plus size={18}/>} {checked.includes(i)?'Ready':'Mark ready'}
            </button></article>)}</div>
      </>}
      {stage===2 && <>
        <nav className="gp-steps" aria-label="Assembly steps">{project.assembly.map(([name],i)=><button key={name} aria-pressed={step===i} onClick={()=>{setStep(i);setAssemblyPart(null);}}>{i+1}. {name}</button>)}</nav>
        <div className="gp-split gp-assembly-layout">
          <div className="gp-guide gp-assembly-guide"><span className="gp-overline">Step {step+1} of {project.assembly.length}</span>
            <h3><Wrench size={20}/> {assembly[0]}</h3><p>{assembly[1]}</p><h4>Inspect a part</h4>
            <ul className="gp-part-selector">{assembly[3].map(i=><li key={i}><button className="gp-part-label" aria-pressed={currentPart===i} onClick={()=>setAssemblyPart(i)}><span className="gp-part-number">{i+1}</span>{project.parts[i][0]}</button></li>)}</ul>
            <p className="gp-check"><Check size={19}/><span><strong>Before you continue</strong><br/>{assembly[2]}</span></p>
            <div className="gp-assembly-actions">
              {step>0&&<button className="gp-button gp-secondary" onClick={()=>{setStep(step-1);setAssemblyPart(null);}}><ArrowLeft size={16}/> Previous step</button>}
              {step<project.assembly.length-1
                ? <button className="gp-button" onClick={()=>{setStep(step+1);setAssemblyPart(null);}}>Next assembly step <ArrowRight size={16}/></button>
                : <a className="gp-button" href={link(project.id,3)}>Program &amp; test <ArrowRight size={16}/></a>}
            </div>
          </div>
          <section className="gp-assembly-visuals" aria-label="Selected component">
            <header className="gp-inspect-heading" aria-live="polite">
              <div><h3>{partName}</h3><p>{partPurpose}</p></div>
              <span>Qty {partQuantity}</span>
            </header>
            <figure className="gp-assembly-model">
              <figcaption><strong>3D part view</strong><span>Drag to rotate · Scroll to zoom</span></figcaption>
              <Suspense fallback={<p role="status">Loading the 3D part…</p>}>
                <ProjectPartView name={partName}/>
              </Suspense>
            </figure>
            <div className="gp-part-preview">
              <h4>2D reference</h4>
              {(isRocketLab || isMineSafety || isCubeSat) ? <VirtualAsset index={currentPart} kind={isCubeSat ? 'orbit' : isMineSafety ? 'mine' : undefined}/> : <PartPhotos name={partName} projectId={art}/>}
            </div>
          </section>
        </div>
        {project.wiring.length>0&&<div className="gp-table"><table><caption>{(isRocketLab || isMineSafety || isCubeSat) ? 'Simulation input and output map' : isEnclosure ? 'Case fit and USB connection map' : isGearReducer ? 'Mechanical connection map' : isBottleVacuum ? 'Airflow connection map' : 'Connection map · disconnect power before wiring'}</caption><thead><tr><th>From</th><th>To</th><th>Purpose</th></tr></thead><tbody>{project.wiring.map(([from,to,purpose])=><tr key={from}><td>{from}</td><td>{to}</td><td>{purpose}</td></tr>)}</tbody></table></div>}
      </>}
      {stage===3 && isRecyclingVending && <RecyclingVendingTest/>}
      {stage===3 && isVendingMachine && <VendingMachineTest/>}
      {stage===3 && isGestureLamp && <GestureLampTest/>}
      {stage===3 && isSmartHeadlights && <SmartHeadlightsTest/>}
      {stage===3 && isBleGamepad && <BleGamepadTest/>}
      {stage===3 && isLineFollower && <LineFollowerTest/>}
      {stage===3 && isRoomController && <RoomControllerTest/>}
      {stage===3 && isMotionPick && <MotionPickTest/>}
      {stage===3 && isSolarLawn && <SolarLawnTest/>}
      {stage===3 && isSolarTricopter && <SolarTricopterTest/>}
      {stage===3 && isGpsGsm && <GpsGsmTest/>}
      {stage===3 && isHorizonTracker && <HorizonTrackerTest/>}
      {stage===3 && isGsmEnergy && <GsmEnergyTest/>}
      {stage===3 && isBleArm && <BleArmTest/>}
      {stage===3 && isMimicHand && <MimicHandTest/>}
      {stage===3 && isDialGauge && <DialGaugeTest/>}
      {stage===3 && isDrawbridge && <DrawbridgeTest/>}
      {stage===3 && isLetterSorter && <LetterSorterTest/>}
      {stage===3 && isCameraPanModel && <CameraPanModelTest/>}
      {stage===3 && isWindVane && <WindVaneTest/>}
      {stage===3 && isModelParkingBarrier && <ParkingBarrierTest/>}
      {stage===3 && isControllerInput && <ControllerInputTest/>}
      {stage===3 && isHandheldSignal && <HandheldSignalTest/>}
      {stage===3 && isDrawerIndicator && <DrawerIndicatorTest/>}
      {stage===3 && isMailboxFlag && <MailboxFlagTest/>}
      {stage===3 && isModelCrossing && <ModelCrossingTest/>}
      {stage===3 && isAccessibleDeskSwitch && <AccessibleDeskSwitchTest/>}
      {stage===3 && isElevatorCallLight && <ElevatorCallLightTest/>}
      {stage===3 && isModelDoorbell && <ModelDoorbellTest/>}
      {stage===3 && isQuizDesk && <QuizDeskTest/>}
      {stage===3 && isLibraryHelpButton && <LibraryHelpButtonTest/>}
      {stage===3 && isWindowBoxComparison && <WindowBoxComparisonTest/>}
      {stage===3 && isSoilDryingTimer && <SoilDryingTimerTest/>}
      {stage===3 && isCapillaryWatering && <CapillaryWateringTest/>}
      {stage===3 && isPlantPotDepth && <PlantPotDepthTest/>}
      {stage===3 && isDrainageBottle && <DrainageBottleTest/>}
      {stage===3 && isMulchMoisture && <MulchMoistureTest/>}
      {stage===3 && isClaySoilCalibration && <ClaySoilCalibrationTest/>}
      {stage===3 && isSandySoilCalibration && <SandySoilCalibrationTest/>}
      {stage===3 && isSeedlingTrayMoisture && <SeedlingTrayMoistureTest/>}
      {stage===3 && isBasilPotMoisture && <BasilPotMoistureTest/>}
      {stage===3 && isEquipmentEnclosure && <EquipmentEnclosureTest/>}
      {stage===3 && isColdPackWarming && <ColdPackWarmingTest/>}
      {stage===3 && isVentOutlet && <VentOutletTest/>}
      {stage===3 && isSolarOvenMonitor && <SolarOvenMonitorTest/>}
      {stage===3 && isAquariumTemperature && <AquariumTemperatureTest/>}
      {stage===3 && isIncubatorTemperature && <IncubatorTemperatureTest/>}
      {stage===3 && isSunlitWindow && <SunlitWindowTest/>}
      {stage===3 && isSeedTrayTemperature && <SeedTrayTemperatureTest/>}
      {stage===3 && isDeskComfort && <DeskComfortTest/>}
      {stage===3 && isTerrariumTemperature && <TerrariumTemperatureTest/>}
      {stage===3 && isTunnelModel && <TunnelModelTest/>}
      {stage===3 && isCampingLantern && <CampingLanternTest/>}
      {stage===3 && isSchoolDiorama && <SchoolDioramaTest/>}
      {stage===3 && isWindowShadow && <WindowShadowTest/>}
      {stage===3 && isStairModel && <StairModelTest/>}
      {stage===3 && isDisplayCase && <DisplayCaseTest/>}
      {stage===3 && isGreenhouseShade && <GreenhouseShadeTest/>}
      {stage===3 && isReadingCorner && <ReadingCornerTest/>}
      {stage===3 && isWardrobeLight && <WardrobeLightTest/>}
      {stage===3 && isModelStreetlight && <ModelStreetlightTest/>}
      {stage===3 && isCameraCounter && <CameraCounterTest/>}
      {stage===3 && isDesktopServo && <DesktopServoTest/>}
      {stage===3 && isGearReducer && <GearReducerTest/>}
      {stage===3 && isPushButton && <PushButtonTest/>}
      {stage===3 && isMiniatureSignal && <MiniatureSignalTest/>}
      {stage===3 && isNightLight && <NightLightTest/>}
      {stage===3 && isRoomClimate && <RoomClimateTest/>}
      {stage===3 && isSoilCalibration && <SoilCalibrationTest/>}
      {stage===3 && isTendonHand && <TendonHandTest/>}
      {stage===3 && isVoiceWater && <VoiceWaterTest/>}
      {stage===3 && isPiObjectFollower && <PiObjectFollowerTest/>}
      {stage===3 && isPiBinMonitor && <PiBinMonitorTest/>}
      {stage===3 && isPiFaceLock && <PiFaceLockTest/>}
      {stage===3 && isVoiceHome && <VoiceHomeTest/>}
      {stage===3 && isEsp32DoorCamera && <Esp32DoorCameraTest/>}
      {stage===3 && isEsp32SmartHome && <Esp32SmartHomeTest/>}
      {stage===3 && isSwarmCoordination && <SwarmCoordinationTest/>}
      {stage===3 && isFingerprintStarter && <FingerprintStarterTest/>}
      {stage===3 && isHydroponicChamber && <HydroponicChamberTest/>}
      {stage===3 && isShakeMonitor && <ShakeMonitorTest/>}
      {stage===3 && isFollowerTrolley && <FollowerTrolleyTest/>}
      {stage===3 && isOmniArm && <OmniArmTest/>}
      {stage===3 && isPrepaidMeter && <PrepaidMeterTest/>}
      {stage===3 && isFootstepRfid && <FootstepRfidTest/>}
      {stage===3 && isUnderwaterIr && <UnderwaterIrTest/>}
      {stage===3 && isVoiceRover && <VoiceRoverTest/>}
      {stage===3 && isWirelessRail && <WirelessRailTest/>}
      {stage===3 && isNightPatrol && <NightPatrolTest/>}
      {stage===3 && isEntranceTemperature && <EntranceTemperatureTest/>}
      {stage===3 && isBellowsSimulator && <BellowsSimulatorTest/>}
      {stage===3 && isSelfParking && <SelfParkingTest/>}
      {stage===3 && isSolarTracker && <SolarTrackerTest/>}
      {stage===3 && isWearableScope && <WearableScopeTest/>}
      {stage===3 && isFingerprintLocker && <FingerprintLockerTest/>}
      {stage===3 && isLightInterlock && <LightInterlockTest/>}
      {stage===3 && isSolarMeter && <SolarMeterTest/>}
      {stage===3 && isAndroidSnake && <AndroidSnakeTest/>}
      {stage===3 && isTankRefill && <TankRefillTest/>}
      {stage===3 && isGestureRover && <GestureRoverTest/>}
      {stage===3 && isBluetoothHome && <BluetoothHomeTest/>}
      {stage===3 && isClassroomLab && <ClassroomStationTest/>}
      {stage===3 && isTiltCamera && <TiltCameraTest/>}
      {stage===3 && isDetectionBench && <DetectionBenchTest/>}
      {stage===3 && isPiBench && <PiBenchTest/>}
      {stage===3 && isEnclosure && <EnclosureTest/>}
      {stage===3 && !isDialGauge && !isDrawbridge && !isLetterSorter && !isCameraPanModel && !isWindVane && !isModelParkingBarrier && !isControllerInput && !isHandheldSignal && !isDrawerIndicator && !isMailboxFlag && !isModelCrossing && !isAccessibleDeskSwitch && !isElevatorCallLight && !isModelDoorbell && !isQuizDesk && !isLibraryHelpButton && !isWindowBoxComparison && !isSoilDryingTimer && !isCapillaryWatering && !isPlantPotDepth && !isDrainageBottle && !isMulchMoisture && !isClaySoilCalibration && !isSandySoilCalibration && !isSeedlingTrayMoisture && !isBasilPotMoisture && !isEquipmentEnclosure && !isEnclosure && !isPiBench && !isDetectionBench && !isTiltCamera && !isClassroomLab && !isBluetoothHome && !isGestureRover && !isTankRefill && !isAndroidSnake && !isSolarMeter && !isLightInterlock && !isFingerprintLocker && !isWearableScope && !isSolarTracker && !isSelfParking && !isColdPackWarming && !isVentOutlet && !isSolarOvenMonitor && !isAquariumTemperature && !isIncubatorTemperature && !isSunlitWindow && !isSeedTrayTemperature && !isDeskComfort && !isTerrariumTemperature && !isTunnelModel && !isCampingLantern && !isSchoolDiorama && !isWindowShadow && !isStairModel && !isDisplayCase && !isGreenhouseShade && !isReadingCorner && !isWardrobeLight && !isModelStreetlight && !isCameraCounter && !isDesktopServo && !isGearReducer && !isPushButton && !isMiniatureSignal && !isNightLight && !isRoomClimate && !isSoilCalibration && !isTendonHand && !isVoiceWater && !isPiObjectFollower && !isPiBinMonitor && !isPiFaceLock && !isVoiceHome && !isEsp32DoorCamera && !isEsp32SmartHome && !isSwarmCoordination && !isFingerprintStarter && !isHydroponicChamber && !isShakeMonitor && !isFollowerTrolley && !isOmniArm && !isPrepaidMeter && !isFootstepRfid && !isUnderwaterIr && !isVoiceRover && !isWirelessRail && !isNightPatrol && !isEntranceTemperature && !isBellowsSimulator && !isMimicHand && !isBleArm && !isGsmEnergy && !isHorizonTracker && !isGpsGsm && !isSolarTricopter && !isSolarLawn && !isMotionPick && !isRoomController && !isLineFollower && !isBleGamepad && !isSmartHeadlights && !isGestureLamp && !isVendingMachine && !isRecyclingVending && <div className="gp-guide gp-program">
        <div className="gp-program-meta">
          <div><span>Language</span><strong>{program ? python ? 'Python' : 'Arduino C++' : 'Mechanical build'}</strong></div>
          <div><span>Tools</span><strong>{program ? python ? ((isMineSafety || isCubeSat) ? 'Browser simulator, optional Python 3' : isRocketLab ? 'Browser flight lab, optional Python 3' : isLidarDrone ? 'Python 3, cflib, Crazyradio 2.0, matte card, tape measure' : 'Python 3, OpenCV, USB webcam') : isEsp32Car ? 'Arduino IDE, ESP32 board package, Micro USB data cable, phone' : isBeaconRover ? 'Arduino IDE, Uno R3, USB data cable, battery flashlight' : isSolarSweeper ? 'Arduino IDE, Uno R3, multimeter, USB data cable, direct sunlight' : isEmergencyLighting ? 'Arduino IDE, Uno R3, USB data cable, cardboard model' : isIndustrialMonitor ? 'Arduino IDE, Uno R3, Ethernet, Python 3, multimeter' : isSmartBin ? 'Arduino IDE, Uno R3, Ethernet, Python 3, ruler, flat cardboard target' : isAquaclean ? 'Arduino IDE, Uno R3, Ethernet, Python 3, shallow tray' : (isFloodWarning || isFloodGate) ? 'Arduino IDE, Uno R3, USB data cable, ruler, basin' : 'Arduino IDE, Uno R3, USB data cable' : isBottleVacuum ? 'Hand bulb, ruler, six dry paper scraps, tray' : 'Hand crank and rotation marks'}</strong></div>
        </div>
        <div className="gp-program-grid"><section className="gp-program-card"><h3><ListChecks size={20}/> Set up and run</h3>
        <ol className="gp-program-steps">
          <li><strong>Check the assembly.</strong> {isCubeSat ? 'Check that the camera points toward Earth and locate the contact window.' : isMineSafety ? 'Check that both stations report a separate source.' : isRocketLab ? 'Check the virtual launch origin, angle and fixed starting speed.' : isBottleVacuum ? 'Set the bottle in a tray, check the bulb arrow and confirm that both tubes fit tightly in the cap.' : 'Verify the fit and connections before applying power.'}</li>
          {program && (isCubeSat ? <>
            <li><strong>Plan a clear and cloudy frame.</strong> Use the same location for a fair comparison. Test storing the first frame outside contact.</li>
            <li><strong>Run the Python replay.</strong> Download the script and run <code>python3 {program.filename}</code>. It uses only the standard library.</li>
          </> : isMineSafety ? <>
            <li><strong>Predict each alarm.</strong> Compare the five synthetic scenarios and decide what the beacon and dashboard should display.</li>
            <li><strong>Run the Python replay.</strong> Download the script and run <code>python3 {program.filename}</code>. It uses only the standard library.</li>
          </> : isRocketLab ? <>
            <li><strong>Predict each result.</strong> Write down which of the three angles should reach the greatest height and which should travel farthest.</li>
            <li><strong>Run the Python check.</strong> Download the script and run <code>python3 {program.filename}</code>. It uses Python’s standard library.</li>
          </> : isLidarDrone ? <>
            <li><strong>Try the built-in test.</strong> Download the script and run <code>python3 {program.filename}</code>. It checks eight sample inputs without a radio.</li>
            <li><strong>Install the hardware library.</strong> In your Python environment, run <code>python3 -m pip install cflib</code>.</li>
            <li><strong>Read live range data.</strong> With propellers removed, connect the Crazyradio. Run <code>python3 {program.filename} --uri radio://0/80/2M --seconds 30</code>, replacing the example URI with the URI shown for your drone.</li>
          </> : python ? <>
            <li><strong>Install the dependency.</strong> Run <code>python3 -m pip install opencv-python</code> in your project’s Python environment.</li>
            <li><strong>Run the program.</strong> Download the script, plug in the webcam and run <code>python3 {program.filename}</code> from its folder.</li>
          </> : <>
            <li><strong>Set up the Arduino IDE.</strong> {isEsp32Car ? 'Install the esp32 board package by Espressif Systems (3.x) in Boards Manager. Open the sketch, choose ESP32 Dev Module, set Partition Scheme to Huge APP (3 MB), and select the board’s USB port.' : 'Open the downloaded sketch, select Arduino Uno and choose the board’s USB port.'}</li>
            {(isSmartBin || isIndustrialMonitor || isGreenhouse) && <li><strong>Install Ethernet.</strong> In Library Manager, install the Ethernet library by Arduino.</li>}
            {isAquaclean && <li><strong>Install Ethernet.</strong> In the Arduino IDE Library Manager, install the Ethernet library by Arduino. Leave the motor supply switched off for upload.</li>}
            {(isFloodGate || isUltrasonicRadar || isRailwayGate || isRainClothesline || isTrafficParking || isSoapDispenser || isExhibitionLock) && <li><strong>Install Servo.</strong> In the Arduino IDE Library Manager, install the Servo library by Arduino if it is missing.</li>}
            <li><strong>Verify and upload.</strong> Use Verify to compile the sketch, then Upload. Keep any separate motor or servo supply off while uploading.</li>
          </>)}
          <li><strong>{program ? 'Start the project check.' : 'Operate the mechanism.'}</strong> {program?.setup ?? (expansion ? 'Use the project check below to compare the expected result with your build.' : isBottleVacuum ? 'Squeeze slowly to vent the bulb. Place the nozzle by a scrap and release the bulb to draw air into the chamber. Use only dry paper for the trials.' : 'Turn the crank by hand with the gears unloaded.')}</li>
        </ol>
        {isRadioCar && <div className="gp-table"><table><caption>Expected wheel motion on the test stand</caption>
          <thead><tr><th>Send</th><th>Command</th><th>Expected result</th></tr></thead>
          <tbody>{bluetoothCarCommands.map(command=><tr key={command.key}><td><code>{command.key}</code></td><td>{command.label}</td><td>{command.description}</td></tr>)}</tbody>
        </table></div>}
        <div className="gp-check"><Check size={19}/><div><strong>Expected result and test procedure</strong><p>{project.test}</p></div></div>
        </section>
        {isIndustrialMonitor && <section className="gp-program-card">
          <h3>Read the remote console</h3>
          <p>Run <code>python3 {industrialReceiver.filename}</code> on the same trusted local subnet. If prompted, allow inbound UDP port {industrialLimits.port} on that network. Compare console states with the panel LEDs.</p>
          <button className="gp-button gp-secondary" type="button" onClick={()=>download(industrialReceiver.filename,industrialReceiver.source)}>Download Python receiver</button>
        </section>}
        {isSmartBin && <section className="gp-program-card">
          <h3>Read the local telemetry</h3>
          <p>Run <code>python3 {smartBinReceiver.filename}</code> on the same trusted subnet. If prompted, allow inbound UDP port {binLimits.port} on that network. Compare the receiver with the Arduino Serial Monitor, then unplug Ethernet to test the stale-data message.</p>
          <button className="gp-button gp-secondary" type="button" onClick={()=>download(smartBinReceiver.filename,smartBinReceiver.source)}>Download Python receiver</button>
        </section>}
        {isAquaclean && <section className="gp-program-card">
          <h3>Read the local telemetry</h3>
          <p>On a computer on the same subnet, run <code>python3 {aquacleanReceiver.filename}</code>. If prompted, allow inbound UDP port 4210 on that trusted local network. Compare the displayed gap and state with Serial Monitor.</p>
          <button className="gp-button gp-secondary" type="button" onClick={()=>download(aquacleanReceiver.filename,aquacleanReceiver.source)}>Download Python receiver</button>
        </section>}
        {isBottleVacuum && <section className="gp-program-card">
          <h3>Compare three trials</h3>
          <ol className="gp-program-steps">{vacuumTrials.map(({condition,expected})=><li key={condition}><strong>{condition}.</strong> {expected}</li>)}</ol>
          <p>Empty the bottle and lay out six scraps before each trial. If the cap is sealed and pickup is still weak, check the tube for kinks and confirm the bulb arrow points toward the open exhaust.</p>
          <button type="button" className="gp-button gp-secondary" onClick={()=>download('bottle_vacuum_trials.csv',vacuumTrialSheet)}>Download trial sheet</button>
        </section>}
        {program&&<section className="gp-program-card gp-code-card"><h3>How the code works</h3><ul>{(expansion ? [project.test] : programWalkthroughs[art]).map(line=><li key={line}>{line}</li>)}</ul>
          <div className="gp-source-heading"><h3>{program.filename}</h3><button className="gp-button gp-secondary" onClick={()=>download(program.filename,program.source)}>Download code</button></div>
          <pre tabIndex={0} aria-label={program.filename}><code>{program.source}</code></pre></section>}
        </div>
      </div>}
      {stage===4 && isRecyclingVending && <Suspense fallback={<p role="status">Loading the recycling vending station…</p>}><RecyclingVendingDemo/></Suspense>}
      {stage===4 && isVendingMachine && <Suspense fallback={<p role="status">Loading the four-slot vending machine…</p>}><VendingMachineDemo/></Suspense>}
      {stage===4 && isGestureLamp && <Suspense fallback={<p role="status">Loading the contactless lamp…</p>}><GestureLampDemo/></Suspense>}
      {stage===4 && isSmartHeadlights && <Suspense fallback={<p role="status">Loading the model headlight road…</p>}><SmartHeadlightsDemo/></Suspense>}
      {stage===4 && isBleGamepad && <Suspense fallback={<p role="status">Loading the gamepad workbench…</p>}><BleGamepadDemo/></Suspense>}
      {stage===4 && isLineFollower && <Suspense fallback={<p role="status">Loading the line-following course…</p>}><LineFollowerDemo/></Suspense>}
      {stage===4 && isRoomController && <Suspense fallback={<p role="status">Loading the room controller…</p>}><RoomControllerDemo/></Suspense>}
      {stage===4 && isMotionPick && <Suspense fallback={<p role="status">Loading the motion pick-and-place rover…</p>}><MotionPickDemo/></Suspense>}
      {stage===4 && isSolarLawn && <Suspense fallback={<p role="status">Loading the solar lawn workbench…</p>}><SolarLawnDemo/></Suspense>}
      {stage===4 && isSolarTricopter && <Suspense fallback={<p role="status">Loading the solar and tricopter workbench…</p>}><SolarTricopterDemo/></Suspense>}
      {stage===4 && isGpsGsm && <Suspense fallback={<p role="status">Loading the GPS and GSM tracker…</p>}><GpsGsmDemo/></Suspense>}
      {stage===4 && isHorizonTracker && <Suspense fallback={<p role="status">Loading the single-axis solar tracker…</p>}><HorizonTrackerDemo/></Suspense>}
      {stage===4 && isGsmEnergy && <Suspense fallback={<p role="status">Loading the GSM energy meter…</p>}><GsmEnergyDemo/></Suspense>}
      {stage===4 && isBleArm && <Suspense fallback={<p role="status">Loading the Bluetooth arm workbench…</p>}><BleArmDemo/></Suspense>}
      {stage===4 && isMimicHand && <Suspense fallback={<p role="status">Loading the animatronic hand…</p>}><MimicHandDemo/></Suspense>}
      {stage===4 && isDialGauge && <Suspense fallback={<p role="status">Loading the dial gauge…</p>}><DialGaugeDemo/></Suspense>}
      {stage===4 && isDrawbridge && <Suspense fallback={<p role="status">Loading the mini drawbridge…</p>}><DrawbridgeDemo/></Suspense>}
      {stage===4 && isLetterSorter && <Suspense fallback={<p role="status">Loading the letter sorter…</p>}><LetterSorterDemo/></Suspense>}
      {stage===4 && isCameraPanModel && <Suspense fallback={<p role="status">Loading the camera pan model…</p>}><CameraPanModelDemo/></Suspense>}
      {stage===4 && isWindVane && <Suspense fallback={<p role="status">Loading the wind vane…</p>}><WindVaneDemo/></Suspense>}
      {stage===4 && isModelParkingBarrier && <Suspense fallback={<p role="status">Loading the parking barrier…</p>}><ParkingBarrierDemo/></Suspense>}
      {stage===4 && isControllerInput && <Suspense fallback={<p role="status">Loading the controller tester…</p>}><ControllerInputDemo/></Suspense>}
      {stage===4 && isHandheldSignal && <Suspense fallback={<p role="status">Loading the signal paddle…</p>}><HandheldSignalDemo/></Suspense>}
      {stage===4 && isDrawerIndicator && <Suspense fallback={<p role="status">Loading the sliding drawer…</p>}><DrawerIndicatorDemo/></Suspense>}
      {stage===4 && isMailboxFlag && <Suspense fallback={<p role="status">Loading the mailbox model…</p>}><MailboxFlagDemo/></Suspense>}
      {stage===4 && isModelCrossing && <Suspense fallback={<p role="status">Loading the crossing model…</p>}><ModelCrossingDemo/></Suspense>}
      {stage===4 && isAccessibleDeskSwitch && <Suspense fallback={<p role="status">Loading the desk switch…</p>}><AccessibleDeskSwitchDemo/></Suspense>}
      {stage===4 && isElevatorCallLight && <Suspense fallback={<p role="status">Loading the lift model…</p>}><ElevatorCallDemo/></Suspense>}
      {stage===4 && isModelDoorbell && <Suspense fallback={<p role="status">Loading the doorbell panel…</p>}><ModelDoorbellDemo/></Suspense>}
      {stage===4 && isQuizDesk && <Suspense fallback={<p role="status">Loading the quiz desk…</p>}><QuizDeskDemo/></Suspense>}
      {stage===4 && isLibraryHelpButton && <Suspense fallback={<p role="status">Loading the library counter…</p>}><LibraryHelpButtonDemo/></Suspense>}
      {stage===4 && isWindowBoxComparison && <Suspense fallback={<p role="status">Loading the window box trial…</p>}><WindowBoxComparisonDemo/></Suspense>}
      {stage===4 && isSoilDryingTimer && <Suspense fallback={<p role="status">Loading the soil drying timer…</p>}><SoilDryingTimerDemo/></Suspense>}
      {stage===4 && isCapillaryWatering && <Suspense fallback={<p role="status">Loading the wick trial…</p>}><CapillaryWateringDemo/></Suspense>}
      {stage===4 && isPlantPotDepth && <Suspense fallback={<p role="status">Loading the pot depth comparison…</p>}><PlantPotDepthDemo/></Suspense>}
      {stage===4 && isDrainageBottle && <Suspense fallback={<p role="status">Loading the drainage trial…</p>}><DrainageBottleDemo/></Suspense>}
      {stage===4 && isMulchMoisture && <Suspense fallback={<p role="status">Loading the mulch moisture trial…</p>}><MulchMoistureDemo/></Suspense>}
      {stage===4 && isClaySoilCalibration && <Suspense fallback={<p role="status">Loading the clay contact trial…</p>}><ClaySoilCalibrationDemo/></Suspense>}
      {stage===4 && isSandySoilCalibration && <Suspense fallback={<p role="status">Loading the soil calibration bench…</p>}><SandySoilCalibrationDemo/></Suspense>}
      {stage===4 && isSeedlingTrayMoisture && <Suspense fallback={<p role="status">Loading the seedling tray…</p>}><SeedlingTrayMoistureDemo/></Suspense>}
      {stage===4 && isBasilPotMoisture && <Suspense fallback={<p role="status">Loading the basil pot trial…</p>}><BasilPotMoistureDemo/></Suspense>}
      {stage===4 && isEquipmentEnclosure && <Suspense fallback={<p role="status">Loading the enclosure trial…</p>}><EquipmentEnclosureDemo/></Suspense>}
      {stage===4 && isColdPackWarming && <Suspense fallback={<p role="status">Loading the cold pack trial…</p>}><ColdPackWarmingDemo/></Suspense>}
      {stage===4 && isVentOutlet && <Suspense fallback={<p role="status">Loading the vent model…</p>}><VentOutletTemperatureDemo/></Suspense>}
      {stage===4 && isSolarOvenMonitor && <Suspense fallback={<p role="status">Loading the solar collector…</p>}><SolarOvenMonitorDemo/></Suspense>}
      {stage===4 && isAquariumTemperature && <Suspense fallback={<p role="status">Loading the aquarium model…</p>}><AquariumTemperatureDemo/></Suspense>}
      {stage===4 && isIncubatorTemperature && <Suspense fallback={<p role="status">Loading the temperature alert…</p>}><IncubatorTemperatureDemo/></Suspense>}
      {stage===4 && isSunlitWindow && <Suspense fallback={<p role="status">Loading the sunlit window…</p>}><SunlitWindowDemo/></Suspense>}
      {stage===4 && isSeedTrayTemperature && <Suspense fallback={<p role="status">Loading the seed tray…</p>}><SeedTrayTemperatureDemo/></Suspense>}
      {stage===4 && isDeskComfort && <Suspense fallback={<p role="status">Loading the desk monitor…</p>}><DeskComfortDemo/></Suspense>}
      {stage===4 && isTerrariumTemperature && <Suspense fallback={<p role="status">Loading the terrarium…</p>}><TerrariumTemperatureDemo/></Suspense>}
      {stage===4 && isTunnelModel && <Suspense fallback={<p role="status">Loading the tunnel model…</p>}><TunnelModelDemo/></Suspense>}
      {stage===4 && isCampingLantern && <Suspense fallback={<p role="status">Loading the camping lantern…</p>}><CampingLanternDemo/></Suspense>}
      {stage===4 && isSchoolDiorama && <Suspense fallback={<p role="status">Loading the school diorama…</p>}><SchoolDioramaDemo/></Suspense>}
      {stage===4 && isWindowShadow && <Suspense fallback={<p role="status">Loading the window shadow detector…</p>}><WindowShadowDemo/></Suspense>}
      {stage===4 && isStairModel && <Suspense fallback={<p role="status">Loading the staircase…</p>}><StairModelDemo/></Suspense>}
      {stage===4 && isDisplayCase && <Suspense fallback={<p role="status">Loading the display case light…</p>}><DisplayCaseLightDemo/></Suspense>}
      {stage===4 && isGreenhouseShade && <Suspense fallback={<p role="status">Loading the greenhouse shade monitor…</p>}><GreenhouseShadeDemo/></Suspense>}
      {stage===4 && isReadingCorner && <Suspense fallback={<p role="status">Loading the reading corner…</p>}><ReadingCornerDemo/></Suspense>}
      {stage===4 && isWardrobeLight && <Suspense fallback={<p role="status">Loading the wardrobe light…</p>}><WardrobeLightDemo/></Suspense>}
      {stage===4 && isModelStreetlight && <Suspense fallback={<p role="status">Loading the model pavement…</p>}><ModelStreetlightDemo/></Suspense>}
      {stage===4 && isCameraCounter && <Suspense fallback={<p role="status">Loading the camera counting bench…</p>}><CameraCounterDemo/></Suspense>}
      {stage===4 && isDesktopServo && <Suspense fallback={<p role="status">Loading the servo arm…</p>}><DesktopServoDemo/></Suspense>}
      {stage===4 && isGearReducer && <Suspense fallback={<p role="status">Loading the hand-cranked gear reducer…</p>}><GearReducerDemo/></Suspense>}
      {stage===4 && isPushButton && <Suspense fallback={<p role="status">Loading the push-button panel…</p>}><PushButtonPanelDemo/></Suspense>}
      {stage===4 && isMiniatureSignal && <Suspense fallback={<p role="status">Loading the traffic signal…</p>}><MiniatureSignalDemo/></Suspense>}
      {stage===4 && isNightLight && <Suspense fallback={<p role="status">Loading the automatic night light…</p>}><NightLightDemo/></Suspense>}
      {stage===4 && isRoomClimate && <Suspense fallback={<p role="status">Loading the room climate bench…</p>}><RoomClimateDemo/></Suspense>}
      {stage===4 && isSoilCalibration && <Suspense fallback={<p role="status">Loading the soil calibration bench…</p>}><SoilCalibrationDemo/></Suspense>}
      {stage===4 && isTendonHand && <Suspense fallback={<p role="status">Loading the tendon bench…</p>}><TendonHandDemo/></Suspense>}
      {stage===4 && isVoiceWater && <Suspense fallback={<p role="status">Loading the dual-channel dispenser…</p>}><VoiceWaterDemo/></Suspense>}
      {stage===4 && isPiObjectFollower && <Suspense fallback={<p role="status">Loading the object tracking course…</p>}><PiObjectFollowerDemo/></Suspense>}
      {stage===4 && isPiBinMonitor && <Suspense fallback={<p role="status">Loading the bin measuring station…</p>}><PiBinMonitorDemo/></Suspense>}
      {stage===4 && isPiFaceLock && <Suspense fallback={<p role="status">Loading the model door latch…</p>}><PiFaceLockDemo/></Suspense>}
      {stage===4 && isVoiceHome && <Suspense fallback={<p role="status">Loading the voice-controlled lighting bench…</p>}><VoiceHomeDemo/></Suspense>}
      {stage===4 && isEsp32DoorCamera && <Suspense fallback={<p role="status">Loading the doorway camera…</p>}><Esp32DoorCameraDemo/></Suspense>}
      {stage===4 && isEsp32SmartHome && <Suspense fallback={<p role="status">Loading the model home…</p>}><Esp32SmartHomeDemo/></Suspense>}
      {stage===4 && isSwarmCoordination && <Suspense fallback={<p role="status">Loading the two-robot bench…</p>}><SwarmCoordinationDemo/></Suspense>}
      {stage===4 && isFingerprintStarter && <Suspense fallback={<p role="status">Loading the fingerprint starter bench…</p>}><FingerprintStarterDemo/></Suspense>}
      {stage===4 && isHydroponicChamber && <Suspense fallback={<p role="status">Loading the hydroponic chamber…</p>}><HydroponicChamberDemo/></Suspense>}
      {stage===4 && isShakeMonitor && <Suspense fallback={<p role="status">Loading the Arduino shake table…</p>}><ShakeMonitorDemo/></Suspense>}
      {stage===4 && isFollowerTrolley && <Suspense fallback={<p role="status">Loading the shopping trolley aisle…</p>}><FollowerTrolleyDemo/></Suspense>}
      {stage===4 && isOmniArm && <Suspense fallback={<p role="status">Loading the Mecanum transfer course…</p>}><OmniArmVehicleDemo/></Suspense>}
      {stage===4 && isPrepaidMeter && <Suspense fallback={<p role="status">Loading the prepaid meter bench…</p>}><PrepaidMeterDemo/></Suspense>}
      {stage===4 && isFootstepRfid && <Suspense fallback={<p role="status">Loading the RFID energy bench…</p>}><FootstepRfidDemo/></Suspense>}
      {stage===4 && isUnderwaterIr && <Suspense fallback={<p role="status">Loading the underwater optical bench…</p>}><UnderwaterIrDemo/></Suspense>}
      {stage===4 && isVoiceRover && <Suspense fallback={<p role="status">Loading the voice rover range…</p>}><VoiceRoverDemo/></Suspense>}
      {stage===4 && isWirelessRail && <Suspense fallback={<p role="status">Loading the wireless model railway…</p>}><WirelessRailSignalDemo/></Suspense>}
      {stage===4 && isNightPatrol && <Suspense fallback={<p role="status">Loading the night patrol route…</p>}><NightPatrolDemo/></Suspense>}
      {stage===4 && isEntranceTemperature && <Suspense fallback={<p role="status">Loading the object test station…</p>}><EntranceTemperatureDemo/></Suspense>}
      {stage===4 && isBellowsSimulator && <Suspense fallback={<p role="status">Loading the classroom bellows simulator…</p>}><BellowsSimulatorDemo/></Suspense>}
      {stage===4 && isSelfParking && <Suspense fallback={<p role="status">Loading the automatic parking lane…</p>}><SelfParkingDemo/></Suspense>}
      {stage===4 && isSolarTracker && <Suspense fallback={<p role="status">Loading the solar tracker…</p>}><SolarTrackerDemo/></Suspense>}
      {stage===4 && isWearableScope && <Suspense fallback={<p role="status">Loading the wearable oscilloscope…</p>}><WearableScopeDemo/></Suspense>}
      {stage===4 && isFingerprintLocker && <Suspense fallback={<p role="status">Loading the fingerprint locker…</p>}><FingerprintLockerDemo/></Suspense>}
      {stage===4 && isLightInterlock && <Suspense fallback={<p role="status">Loading the visible-light interlock bench…</p>}><LightInterlockDemo/></Suspense>}
      {stage===4 && isSolarMeter && <Suspense fallback={<p role="status">Loading the solar measurement bench…</p>}><SolarMeterDemo/></Suspense>}
      {stage===4 && isAndroidSnake && <Suspense fallback={<p role="status">Loading the Android snake robot…</p>}><AndroidSnakeDemo/></Suspense>}
      {stage===4 && isTankRefill && <Suspense fallback={<p role="status">Loading the two-tank refill bench…</p>}><TankRefillDemo/></Suspense>}
      {stage===4 && isGestureRover && <Suspense fallback={<p role="status">Loading the gesture rover bench…</p>}><GestureRoverDemo/></Suspense>}
      {stage===4 && isBluetoothHome && <Suspense fallback={<p role="status">Loading the Bluetooth home model…</p>}><BluetoothHomeDemo/></Suspense>}
      {stage===4 && isClassroomLab && <Suspense fallback={<p role="status">Loading the classroom stations…</p>}><ClassroomStationsDemo/></Suspense>}
      {stage===4 && isTiltCamera && <Suspense fallback={<p role="status">Loading the tilt-triggered camera…</p>}><TiltCameraDemo/></Suspense>}
      {stage===4 && isDetectionBench && <Suspense fallback={<p role="status">Loading the three detection stations…</p>}><DetectionBenchDemo/></Suspense>}
      {stage===4 && isPiBench && <Suspense fallback={<p role="status">Loading the Raspberry Pi climate bench…</p>}><PiClimateDemo/></Suspense>}
      {stage===4 && isEnclosure && <Suspense fallback={<p role="status">Loading the printed enclosure…</p>}><PrintedEnclosureDemo/></Suspense>}
      {stage===4 && isFanInterlock && <Suspense fallback={<p role="status">Loading the fan interlock bench…</p>}><FanInterlockDemo/></Suspense>}
      {stage===4 && isGpsAlert && <Suspense fallback={<p role="status">Loading the GPS alert bench…</p>}><GpsAlertDemo/></Suspense>}
      {stage===4 && isExhibitionLock && <Suspense fallback={<p role="status">Loading the keypad door…</p>}><ExhibitionLockDemo/></Suspense>}
      {stage===4 && isClassroomAir && <Suspense fallback={<p role="status">Loading the air quality bench…</p>}><ClassroomAirDemo/></Suspense>}
      {stage===4 && isGreenhouse && <Suspense fallback={<p role="status">Loading the greenhouse…</p>}><GreenhouseDemo/></Suspense>}
      {stage===4 && isPickBalance && <Suspense fallback={<p role="status">Loading the two robot experiments…</p>}><PickBalanceDemo/></Suspense>}
      {stage===4 && isRoverArm && <Suspense fallback={<p role="status">Loading both robot stations…</p>}><RoverArmDemo/></Suspense>}
      {stage===4 && isAutomaticTap && <Suspense fallback={<p role="status">Loading the recirculating tap…</p>}><AutomaticTapDemo/></Suspense>}
      {stage===4 && isSoapDispenser && <Suspense fallback={<p role="status">Loading the soap dispenser…</p>}><SoapDispenserDemo/></Suspense>}
      {stage===4 && isTrafficParking && <Suspense fallback={<p role="status">Loading the traffic and parking model…</p>}><TrafficParkingDemo/></Suspense>}
      {stage===4 && isSchoolBell && <Suspense fallback={<p role="status">Loading the school bell…</p>}><SchoolBellDemo/></Suspense>}
      {stage===4 && isRfidDoor && <Suspense fallback={<p role="status">Loading the model door latch…</p>}><RFIDDoorDemo/></Suspense>}
      {stage===4 && isRainClothesline && <Suspense fallback={<p role="status">Loading the retractable clothesline…</p>}><RainClotheslineDemo/></Suspense>}
      {stage===4 && isMq2Monitor && <Suspense fallback={<p role="status">Loading the MQ-2 bench…</p>}><MQ2MonitorDemo/></Suspense>}
      {stage===4 && isElectromagnetCrane && <Suspense fallback={<p role="status">Loading the crane…</p>}><ElectromagnetCraneDemo/></Suspense>}
      {stage===4 && isElectronicPiano && <Suspense fallback={<p role="status">Loading the electronic piano…</p>}><ElectronicPianoDemo/></Suspense>}
      {stage===4 && isStreetLight && <Suspense fallback={<p role="status">Loading the model street…</p>}><StreetLightDemo/></Suspense>}
      {stage===4 && isRailwayGate && <Suspense fallback={<p role="status">Loading the model railway…</p>}><RailwayGateDemo/></Suspense>}
      {stage===4 && isUltrasonicRadar && <Suspense fallback={<p role="status">Loading the ultrasonic scanner…</p>}>
        <UltrasonicRadarDemo/>
      </Suspense>}
      {stage===4 && isCubeSat && <Suspense fallback={<p role="status">Loading the virtual CubeSat mission…</p>}>
        <WeatherCubeSatDemo/>
      </Suspense>}
      {stage===4 && isEmergencyLighting && <Suspense fallback={<p role="status">Loading the lighting corridor…</p>}>
        <EmergencyLightingDemo/>
      </Suspense>}
      {stage===4 && isIndustrialMonitor && <Suspense fallback={<p role="status">Loading the conveyor training model…</p>}>
        <IndustrialMonitorDemo/>
      </Suspense>}
      {stage===4 && isMineSafety && <Suspense fallback={<p role="status">Loading the virtual mine…</p>}>
        <MineSafetyDemo/>
      </Suspense>}
      {stage===4 && isSmartBin && <Suspense fallback={<p role="status">Loading the waste bin cutaway…</p>}>
        <SmartBinDemo/>
      </Suspense>}
      {stage===4 && isAquaclean && <Suspense fallback={<p role="status">Loading the AQUACLEAN model…</p>}>
        <AquacleanDemo/>
      </Suspense>}
      {stage===4 && isFloodGate && <Suspense fallback={<p role="status">Loading the spillway model…</p>}>
        <FloodGateDemo/>
      </Suspense>}
      {stage===4 && isFloodWarning && <Suspense fallback={<p role="status">Loading the flood-warning model…</p>}>
        <FloodWarningDemo/>
      </Suspense>}
      {stage===4 && isRocketLab && <Suspense fallback={<p role="status">Loading the virtual flight field…</p>}>
        <WaterRocketDemo/>
      </Suspense>}
      {stage===4 && isBottleVacuum && <Suspense fallback={<p role="status">Loading the bottle vacuum cutaway…</p>}>
        <BottleVacuumDemo/>
      </Suspense>}
      {stage===4 && isLidarDrone && <Suspense fallback={<p role="status">Loading the LiDAR flight course…</p>}>
        <LidarDroneDemo/>
      </Suspense>}
      {stage===4 && isSolarSweeper && <Suspense fallback={<p role="status">Loading the sweeping course…</p>}>
        <SolarSweeperDemo/>
      </Suspense>}
      {stage===4 && isBeaconRover && <Suspense fallback={<p role="status">Loading the beacon course…</p>}>
        <BeaconRoverDemo/>
      </Suspense>}
      {stage===4 && isRadioCar && <Suspense fallback={<p role="status">Loading the 3D driving area…</p>}>
        <BluetoothCarDemo esp32={isEsp32Car}/>
      </Suspense>}
      {stage===4 && reading && story && !isDialGauge && !isDrawbridge && !isLetterSorter && !isCameraPanModel && !isWindVane && !isModelParkingBarrier && !isControllerInput && !isHandheldSignal && !isDrawerIndicator && !isMailboxFlag && !isModelCrossing && !isAccessibleDeskSwitch && !isElevatorCallLight && !isModelDoorbell && !isQuizDesk && !isLibraryHelpButton && !isWindowBoxComparison && !isSoilDryingTimer && !isCapillaryWatering && !isPlantPotDepth && !isDrainageBottle && !isMulchMoisture && !isClaySoilCalibration && !isSandySoilCalibration && !isSeedlingTrayMoisture && !isBasilPotMoisture && !isEquipmentEnclosure && !isRadioCar && !isColdPackWarming && !isVentOutlet && !isSolarOvenMonitor && !isAquariumTemperature && !isIncubatorTemperature && !isSunlitWindow && !isSeedTrayTemperature && !isDeskComfort && !isTerrariumTemperature && !isTunnelModel && !isCampingLantern && !isSchoolDiorama && !isWindowShadow && !isStairModel && !isDisplayCase && !isGreenhouseShade && !isReadingCorner && !isWardrobeLight && !isModelStreetlight && !isCameraCounter && !isDesktopServo && !isGearReducer && !isPushButton && !isMiniatureSignal && !isNightLight && !isRoomClimate && !isSoilCalibration && !isTendonHand && <>
        <div className="gp-split gp-demo">
          <div className="gp-story-stage">
            <Suspense fallback={<p>Loading the 3D scene…</p>}>
              <ProjectDemo key={demoRun} id={art} configuration={expansion} active={active} hold={storyStep!==null&&!playing}
                storyStep={storyStep} markers={demoMarkers} selected={demoPart??currentBeat?.[2]} onSelect={setDemoPart}/>
            </Suspense>
            <div className="gp-demo-result" aria-label="What changed">
              <div><span>What goes in</span><strong>{reading[0]}</strong></div>
              <ArrowRight size={22} aria-hidden="true"/>
              <div key={reading[1]} className={reading[2]?'gp-result-changed':undefined}>
                <span><Activity size={14} aria-hidden="true"/> What you see</span><strong>{reading[1]}</strong>
              </div>
            </div>
            {currentBeat && <div className="gp-story-caption" aria-live="polite">
              <span>Step {storyStep!+1} of {story.length}</span>
              <strong>{currentBeat[0]}</strong>
              <p>{currentBeat[1]}</p>
            </div>}
          </div>
          <div className="gp-guide"><h3>Try the finished build</h3>
            <button type="button" className="gp-button" onClick={togglePlayback}>
              {playing?<Square size={16}/>:<Play size={16}/>}
              {playing?'Pause demo':storyComplete&&storyStep!==null?'Replay demo':storyStep!==null?'Resume demo':'Play animated demo'}
            </button>
            <p>Watch the project work, then try the controls yourself. The glowing trail shows which parts pass a signal or move together.</p>
            <ol className="gp-story-steps" aria-label="Animation steps">
              {story.map(([label],index)=><li key={label}>
                <button type="button" aria-current={storyStep===index?'step':undefined}
                  onClick={()=>{setPlaying(false);setStoryComplete(false);setDemoPart(undefined);setStoryStep(index);}}>
                  <span>{index+1}</span>{label}
                </button>
              </li>)}
            </ol>
            <div role="group" aria-label={control}><h4>{control}</h4><div className="gp-steps"><button aria-pressed={!active} onClick={()=>chooseInput(false)}>{low}</button><button aria-pressed={active} onClick={()=>chooseInput(true)}>{high}</button></div></div>
            <p className="gp-check" role="status">{currentBeat ? (storyComplete ? 'Demo complete' : playing ? 'Animation playing' : 'Animation paused') : active?resultHigh:resultLow}</p>
            {art==='rover-project'&&<button className="gp-button gp-secondary" onClick={()=>{chooseInput(false);setDemoRun(run=>run+1);}}>Restart drive</button>}
            <h4>Identify the parts</h4>
            <ol className="gp-demo-labels">{demoMarkers.map(({index,name})=><li key={index}>
              <button className="gp-part-label" aria-pressed={demoPart===index} onClick={()=>setDemoPart(index)}><span>{index+1}</span>{name}</button>
            </li>)}</ol>
            {demoPart!==undefined&&<p className="gp-demo-description" role="status">{project.parts[demoPart][2]}</p>}
            <h4>Verify on your physical build</h4><p>{project.test}</p>
          </div>
        </div>
        {expansion&&<details className="gp-extra-experiment"><summary>Explore more input values</summary><ProjectScenario info={expansion}/></details>}
      </>}
    </section>
    <div className="gp-footer"><a className="gp-button gp-secondary" href={stage===0?root:link(project.id,stage-1)}><ArrowLeft size={16}/>{stage===0?'All projects':stages[stage-1]}</a>
      <a className="gp-button" href={stage===buildStages.length-1?root:link(project.id,stage+1)}>{stage===buildStages.length-1?'Choose another project':buildStages[stage+1]}<ArrowRight size={16}/></a></div>
  </div>;
}
