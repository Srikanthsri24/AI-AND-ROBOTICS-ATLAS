# Header and sidebar verification

Date: 2026-11-11. Scope: the static English-only application chrome.

## Design

Compared in the in-app browser at the reference dimensions of 1672 × 940. Preserved the navy sidebar/header, violet active state, cyan line icons, supplied brand mark, rounded search field and consistent module spacing. Removed class and language selectors. Header controls stay fixed and popovers overlay content without shifting the dashboard.

Responsive browser check: 390 × 844. The brand condenses to its mark, search remains available, notifications/profile remain accessible, and navigation becomes a modal-style drawer. Document width measured 390 pixels: no horizontal page overflow.

## Verified interactions

- All 15 sidebar destinations open their corresponding screen with exactly one active item.
- Header logo opens the dashboard.
- Desktop collapse changes main content margin to zero and removes hidden navigation from the focus order. The preference survives refresh.
- Mobile drawer opens, locks background scrolling, focuses navigation, closes after selection, and restores the main screen. Backdrop and Escape close it; focus loops within navigation while open.
- Global search includes entries, modules, guided/saved projects and the humanoid lesson. Arrow/Enter navigation opens an exact result; Escape/clear dismiss search; Cmd/Ctrl+K focuses it.
- Notification popover opens without shifting content and provides a working lesson action. Opening it clears the unread indicator locally.
- Profile popover shows the local learner and working progress/projects/saved/settings destinations.
- Hash routes preserve collections/entry links on refresh, and browser back/forward update the selected navigation.
- No class/language selector or backend connection appears in the header.

## Automated checks

TypeScript build and 14 frontend tests pass. Tests cover original lesson integrity, kinematics, narration assets, supported circuit validation, path planning and catalogue links. There is no application backend in the current implementation.

## Scope boundary

This QA record verifies the header/sidebar milestone. It does not certify every item in the original platform brief as production-complete. Technical viewers and simulations retain their displayed limitations.
