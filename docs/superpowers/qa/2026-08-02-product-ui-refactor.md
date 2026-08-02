# God's Plan Product UI Refactor QA

## Scope

Final local verification of the shared visual system, Today page, Course Reader, Library, Calendar presentation, mobile navigation, Cue interaction, and audio behavior.

## Accepted visual states

- Desktop Today: `output/playwright/ui-audit-2026-08-02/final-today-desktop.png`
- Desktop Course Reader: `output/playwright/ui-audit-2026-08-02/final-reader-desktop.png`
- Mobile Today at 390px: `output/playwright/ui-audit-2026-08-02/final-today-mobile.png`

## Verification

- `npm run test:run`: 18/18 tests passed.
- `npm run lint`: TypeScript check passed.
- `npm run test:e2e`: 16/16 tests passed.
- `NEXT_PUBLIC_BASE_PATH=/godsplan npm run build`: production build passed.
- Mobile viewport checks: 390px layout has no horizontal overflow; bottom navigation remains visible.
- Cue keyboard check: focused first blank responds to Enter and reveals `three`.
- Audio regression checks: mode switching, loop mode, segment playback, and active subtitle state passed.

## Known limitations

- The native browser audio control keeps platform-specific visual differences.
- The current UI still uses the existing text-based import control; a richer import flow is outside this refactor.
- Visual acceptance covers the main populated Today and Reader states; rare server-error states remain covered by inline feedback rather than screenshots.
