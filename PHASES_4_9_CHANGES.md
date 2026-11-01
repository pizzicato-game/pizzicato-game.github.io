# Pizzicato universal — phases 4–9 changes

**Base:** `pizzicato-unified-levels-phases-1-3.zip` (Pizzicato-Game foundation with both level formats).

**Status:** Substantial integrated source implementation. Source-level regression checks passed; full webpack/browser/Electron/Firebase integration could not be tested without npm registry access and live credentials. **Not production-certified.**

## Implemented

- **Phase 4:** New `src/ts/study/*` modules for deployment mode, typed study configuration, saved progression, result envelopes, Firebase client, and offline data. Demo defaults to direct guest play. Login/offline requires deliberate configuration.
- **Phase 5:** Copied the four Leiden legacy playable levels and their unchanged media files (`Tryout`, `Trained`, `Untrained`, `Nosound`). The original three levels remain unchanged. Added configurable pretest, numbered weeks, posttest, per-group conditions, per-participant schedule/start-date overrides, maximum sessions, and loop/BPM assignments. Added Leiden reference settings/preset.
- **Phase 6:** Removed preexisting in-browser Firebase user/data orchestration in favor of Firebase Authentication, a protected Cloud Functions backend, administrator custom claims, restricted moderator/participant roles, and Realtime Database-deny-by-default rules. Admin optionally links a second Firebase RTDB for study result data after a server-side permissions check. Central Firebase Auth holds credentials; linked databases store results only.
- **Phase 7:** Online HTML admin/moderator dashboard: list/create/configure studies, import JSON study templates, provision moderator/participant passwords, deactivate/reactivate participants, edit groups/start dates/schedules, and download per-participant/full-study data as JSON and CSV. Moderators are read/export only and scoped to their study.
- **Phase 8:** Published, shared JSON level library with immutable IDs; validation/conversion of Level Designer exports on upload. Assigned library levels are fetched by ID through a permission-checked Cloud Function. Media files are not uploaded to Firebase Storage; dashboard editing of Designer objects is not embedded.
- **Phase 9:** Offline JSON participant packs with PBKDF2 verifier, separate offline username/password, local progression tracking, browser export, Electron per-user atomic file saving and file-backed JSON/CSV exports. Added Electron-builder commands for Windows, macOS, Linux. A single deployment config file distinguishes guest, online and offline hosts.

## Verification completed

- `npm run test:levels`: **PASS** — seven bundled legacy levels, 78 MP3 loops, 260 MP3 target files; both Designer JSON schemas and programmatic audio tests.
- `npm run test:study`: **PASS** — schedule calculations, pre-/posttest, session limits, Leiden template/assets, offline credential checks, local data serialization, database rule structure, and parsing of 55 TS files.
- `node --check functions/index.js`, `src/electron/main.js` and `preload.js`: **PASS**.
- `npm run build`, deployed Firebase emulator/live roles, full Windows/macOS executables and actual gameplay: **NOT VERIFIED**; npm registry was unreachable (`EAI_AGAIN`).

## Changed existing files (16)

- `.gitignore`
- `README.md`
- `package.json`
- `scripts/test-level-formats.js`
- `src/electron/main.js`
- `src/electron/preload.js`
- `src/electron/renderer.d.ts`
- `src/index.html`
- `src/levels/list.json`
- `src/ts/core/game.ts`
- `src/ts/managers/storageManager.ts`
- `src/ts/scenes/calibrationScene.ts`
- `src/ts/scenes/levelScene.ts`
- `src/ts/scenes/loadingScene.ts`
- `src/ts/scenes/optionsScene.ts`
- `src/ts/scenes/scoreboardScene.ts`

## Added new non-media files (19)

- `configs/leiden-conditions.json`
- `configs/leiden-study-template.json`
- `configs/research-deployment.example.ts`
- `database.rules.json`
- `docs/RESEARCH_SETUP.md`
- `firebase.json`
- `functions/index.js`
- `functions/package.json`
- `scripts/grant-admin.js`
- `scripts/test-study.js`
- `src/css/study.css`
- `src/ts/scenes/studySessionScene.ts`
- `src/ts/study/dashboard.ts`
- `src/ts/study/deployment.ts`
- `src/ts/study/firebaseClient.ts`
- `src/ts/study/offline.ts`
- `src/ts/study/results.ts`
- `src/ts/study/runtime.ts`
- `src/ts/study/types.ts`

## Added media assets

- **276 files** copied from the Leiden-Experiment repository, under the four level folders: `Tryout`, `Trained`, `Untrained`, `Nosound`.
- These include each level’s `info.json`, preview video, background image, loop MP3/OGG media, and individual note audio files. Source copies are unmodified.

## Removed files

- **None.** All files from the Phase 1–3 ZIP are retained.

## Important boundaries / follow-up

- Requires your Firebase project, Functions and Realtime Database deployment, role/bootstrap setup, and rules validation before online mode can run.
- Source supports separate Firebase RTDB URLs for result storage; authentication credentials remain in central Firebase Authentication (not in each study database).
- Leiden template intentionally does not automatically reproduce old participant-number counterbalancing/password-suffix handling; use explicit schedule/group overrides.
- Offline packs cannot be remotely revoked once distributed; local files and browser storage are not encrypted or tamper-proof.
- Recovery-queued linked-DB submissions are included in exports and partial exports are labeled; automatic redelivery is not yet implemented.
- No automatic historical-data migration, formal audit logs, large-media Firebase Storage pipeline, embedded Designer editing, or full deployment verification.
- Read `docs/RESEARCH_SETUP.md` for deployment, trust boundaries, packaging, and test requirements.
