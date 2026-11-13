# VisionariesAI AI & Robotics Atlas

English-only, static React + TypeScript + Vite application. The navy/violet application shell follows the supplied dashboard reference. No application backend, API, database, sign-in or service credentials are required.

## Run locally

Use Node.js 22 or later and pnpm. From this directory:

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5190/. On this Mac, double-click `start-atlas.command` to use the installed Node runtime. Port 5190 is fixed to avoid opening a different application silently.

## Build for static hosting

```sh
pnpm build
```

Upload the contents of `dist/` to a static web host. Routes use URL hashes, so server-side route rewrites are unnecessary. Serve through HTTP/HTTPS; browser module loading does not support opening `index.html` directly through `file://`.

`pnpm start` previews the production build locally. Stop the development server first because both use port 5190. This is a static file preview, not an application backend.

## Current frontend

- Stable, fixed header and sidebar; responsive navigation drawer; persistent desktop collapse; keyboard navigation and skip link.
- Global search for collections, components, boards, projects and the humanoid lesson. Arrow keys, Enter and Escape supported; Cmd/Ctrl+K focuses search.
- Notification and profile popovers, active navigation, deep links, browser back/forward and refresh.
- Twenty electronics entries, five controller/compute boards, five sensors and robot/mechanism entries. Search/filter, detail views, references, bookmarks and board comparison.
- Twenty-five-stage technology journey and before/after comparison; future stages labeled speculative.
- Conceptual interactive 3D inspection, technical 2D diagrams, seven types of working-principle animation, and the original humanoid GLB/animated lesson.
- A circuit editor for a supported ideal series supply/resistor/red-LED model; graph validation and current-limit checks. It does not execute Arduino code or emulate arbitrary electronics.
- Three guided project templates, nine saved workflow stages, notes, BOM/code/report exports and resume.
- Learning paths, practice assessments, explanations, progress exports and local assignment planning.
- IoT telemetry simulation, deterministic grid path planner and AI data-flow demonstrations. These do not connect hardware or perform trained-model inference.
- Device-local preferences, saved topics, progress, projects, circuit and editorial notes, plus JSON backup/restore.
- English humanoid narration, subtitles, camera controls and browser WebM recording. No server-side MP4 encoder.

## Data and limitations

All user work is stored in browser localStorage. It does not synchronize across browsers or devices. Use Settings → Data & backup to export a backup. Private browsing and clearing site data can remove saved work.

The dashboard uses twenty individual high-resolution generated illustrations. The supplied reference remains the layout/branding reference and is used for some existing inner-screen category illustrations. The artwork is not evidence of exact hardware appearance. Concept geometry is illustrative and not dimensioned CAD. Hardware-specific values are limited to identified models; other entries link to source documentation. Exact variant pinouts, physical circuit validation and hardware deployment require the relevant manufacturer documentation and equipment.

This is a frontend learning application. It does not provide multi-user classrooms, cloud telemetry, real autonomous operation, licensed CAD coverage for every hardware model, or a full electrical simulator.

## Verification

```sh
pnpm test
pnpm build
```

Automated tests cover the original lesson/audio/kinematics, catalogue links and prototype content coverage, circuit calculations and invalid circuits, and path-planner correctness. Browser checks for the current header/sidebar are recorded in `docs/HEADER-SIDEBAR-QA.md`.

## Source map

- `src/components/Dashboard.tsx`: application header, sidebar, route and search behavior.
- `src/components/DashboardHome.tsx`: reference-based dashboard.
- `src/modules/`: dedicated module screens and browser-local state.
- `src/data/atlas.ts`: authored catalogue, timeline, projects and quizzes.
- `src/styles/dashboard.css`, `src/styles/modules.css`: shared visual design and responsive shell.
- `src/components/App.tsx`, `src/viewer/`: original humanoid laboratory.
- `public/`: supplied artwork, original model and narration assets. Legacy non-English recordings remain as unused source assets; the application UI and playback are English-only.

Existing historical validation/export records under `docs/` describe earlier versions. This README and the current QA report describe the static application.
