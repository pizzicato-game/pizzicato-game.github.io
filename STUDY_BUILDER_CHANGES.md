# Pizzicato Universal 1.3.0 — visual study designer and administrator provisioning

## What was already supported (from previous ZIP)

- Firebase-based central administration database for studies, profiles, shared custom Designer levels, participant progress and default result storage.
- Firebase Authentication and privileged server-side administrator, moderator and participant roles.
- Administrator-only study/level publication, participant creation/deactivation, result exports and configurable weekly level schedules.
- Guest/local/web deployment options and support for legacy plus Level Designer levels.

## What has been added or improved

1. **PowerPoint-like visual study builder:** horizontal draggable slide thumbnails grouped into week rows, selectable/editable tiles, buttons to add/remove weeks, optional pretest/posttest, ordering via drag/drop or accessible arrow buttons; a library level selector. All edits persist only when **Save study** is pressed.
2. **Four real participant steps:** Start, Play level, Break/Resume, End/Finish, including editable screen text, per-level BPM and loop count. Existing no-type level assignments and Leiden templates still work.
3. **Server-protected progression for non-game screens:** new `advanceStudyStep` Cloud Function checks authenticated participant, current week/session/step, assigned step type and caps, then atomically advances progress. Offline mode saves the same progress locally. Gameplay results still use original `submitResult` code, now requiring a playable level step.
4. **Moderator account management:** dashboard's Manage moderator accounts page to create, list across studies, activate/deactivate, reset passwords and remove moderator logins. Server Cloud Functions require administrator privileges for all mutations; removed participant credentials retain historical study results.
5. **One-time admin credential vault:** `npm run admin:prepare -- EMAIL VAULT_PATH` creates randomized administrator credentials and an AES-256-GCM encrypted backup (scrypt KDF, separate user passphrase). `npm run admin:activate -- VAULT_PATH SERVICE_ACCOUNT_PATH` activates that login in Firebase Auth after Firebase is ready and grants a server-side superadmin custom claim. Previous `admin:create` remains supported. Plain credentials and keys are never embedded into the GitHub Pages build.
6. **Fresh researcher-friendly guides** for Firebase setup, vault usage, local browser hosting, drag-and-drop study schedules, library-level publishing, moderator/participant maintenance and CSV/JSON exports. Sample two-week visual study included.
7. **Authentication hardening:** every Cloud Function profile check verifies the Firebase user is not disabled and that the session has not been revoked.

## Files added

- `configs/visual-study-template.json`
- `docs/ADMIN_SETUP_SIMPLE.md`
- `docs/STUDY_BUILDER_GUIDE.md`
- `scripts/admin-vault.js`
- `scripts/test-research-features.js`
- `src/ts/study/flowBoard.ts`
- `STUDY_BUILDER_CHANGES.md`

## Files modified

- `.gitignore`
- `README.md`
- `docs/ADMIN_DATABASE.md`
- `docs/RESEARCH_SETUP.md`
- `docs/START_HERE.md`
- `functions/index.js`
- `package.json`
- `scripts/test-study.js`
- `src/css/study.css`
- `src/ts/scenes/studySessionScene.ts`
- `src/ts/study/dashboard.ts`
- `src/ts/study/firebaseClient.ts`
- `src/ts/study/offline.ts`
- `src/ts/study/runtime.ts`
- `src/ts/study/types.ts`

## Files removed

None. Existing media and level files retained.

## Validation performed

- `npm test` passed: bundled legacy level/media checks, Level Designer conversion, previous study/login/web-config tests and new research timeline/vault/security checks.
- `tsc --noEmit --strict --target ES2020 --module ES2015 --lib es2020,dom --skipLibCheck src/ts/study/types.ts src/ts/study/flowBoard.ts` passed.
- `node --check functions/index.js` passed.
- GitHub Pages production build, actual Firebase Authentication/Realtime Database calls, real browser drag-and-drop and webcam gameplay have **not** been exercised in this environment: npm packages were unavailable. Deploy Functions and Rules, then use a fresh test Firebase project and test all three roles before enrolling participants.

## Important limitations and security notes

- Credentials **must not** be checked by comparing password hashes or decrypting a secret shipped to the public browser. The encrypted vault is only an optional offline backup. Keep the passphrase, service-account key, and readable password outside GitHub. A public GitHub repository should not be a primary secret store.
- The central library stores Level Designer JSON in Realtime Database, not large video/audio uploads in Firebase Storage. Existing legacy audio/media stays bundled in the repository. An integrated music-track editor and Storage-based asset uploads are not included.
- Moderator accounts are scoped to a single study. No bulk invitation, audit history, formal GDPR tooling, workflow versioning/frozen study revisions, integrated email password recovery, automated full browser end-to-end tests or database backup scheduler are included.
- Active participants may experience changed ordering if an administrator edits a study while participants are playing it. Freeze live study configurations manually until versioning is implemented.
- Browser-side client validation and source-level tests **do not prove** deployed Firebase rules/Functions operate correctly. Verify these against the Emulator Suite and an actual isolated test Firebase project.
