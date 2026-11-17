import type { Brief } from './publishing-engine.mjs';

export const publishingProject = {
  id: 'directory-46',
  title: 'Automated AI Content Generation & Publishing Workflows',
  outcome: 'Turn a workshop brief into a draft, catch an unsupported claim, and publish an approved copy as a standalone HTML page.',
  cover: './images/project-covers/publishing-workflow.jpg',
};

export const publishingBriefs: Record<string, Brief> = {
  rover: {
    activity: 'Rover Basics', schedule: 'Thursday at 3:30 p.m.', location: 'Room 12',
    audience: 'New club members', exercise: 'test a rover on a marked course',
    instruction: 'Bring a notebook. The club supplies the equipment.',
  },
  sensors: {
    activity: 'Sensor Lab', schedule: 'Wednesday at 2:45 p.m.', location: 'Lab 4',
    audience: 'Students aged 12–15', exercise: 'compare distance readings at three marked positions',
    instruction: 'Work in pairs. Sensor kits will be provided.',
  },
  signals: {
    activity: 'Traffic Signals', schedule: 'Friday at 4:00 p.m.', location: 'Room 7',
    audience: 'First-time makers', exercise: 'sequence three LEDs on a breadboard',
    instruction: 'Bring a pencil. The club supplies the circuit parts.',
  },
};
