# Research setup and deployment

## Contents / current status

This repository includes the original Phaser/Electron Pizzicato game, unified JSON/legacy level support, Leiden experiment media, and a *configurable study platform*. **It is a development implementation, not a research-production certified system.** Actual Firebase projects, authentication users, live storage rules, build dependencies, and participant testing must be configured and validated by the study administrators. No production backend or Windows/Mac release has been created for you.

## 1. Local demo (default)

From the repo root, run `npm install`, then `npm test`, then `npm start` (or `npm run build`). Without `web-config.local.json`, the browser build defaults to guest mode; `npm run start:guest` always forces guest mode. This launches the regular game automatically. The level picker includes the three classic levels plus four Leiden legacy levels; OPEN A LEVEL remains available for Designer JSON. Guest mode does not contact Firebase.

## 2. Configure the online research fork

1. Create your **own** Firebase project with Email/Password Authentication, Firebase Realtime Database and Cloud Functions enabled. Confirm your project billing and relevant regional settings. For a separate research host, use a separate project from your public demo project.
2. Follow [START_HERE.md](START_HERE.md) steps B–C. Run `npm run setup:web` to save the public Firebase web app settings in an untracked `web-config.local.json`, then `npm run check:web`. Do **not** edit `deployment.ts`. Do not paste service-account private keys into browser configuration.
3. Install dependencies with `npm install` (root) and `npm install --prefix functions` (Cloud Functions). Install Firebase CLI separately and run `firebase login`, `firebase use <your-project-id>` from the root, then `firebase deploy --only functions,database`. The supplied `database.rules.json` denies all client writes and unrelated reads. If another project hosts the participant-data database, apply restrictive rules to it as well.
4. On a trusted administrator machine, after installing Functions dependencies, download a Firebase Admin SDK service account private-key file to a location **outside Git** and run `npm run admin:create -- admin@example.edu "/absolute/path/to/private-key.json"`. This securely creates the Firebase Auth user (or grants access to an existing one) and assigns the `superadmin` claim. Save the generated password securely; only the creator sees it once. For existing administrators using Application Default Credentials, the advanced `scripts/grant-admin.js` remains available. Grant claims only to trusted study owners.
5. Run `npm start` after `npm run setup:web`; sign in with the Firebase administrator **email** and password. Create a study, select dates, week assignments, groups, condition settings, then enable the study and create participant/moderator credentials. The dashboard creates accounts via a privileged Cloud Function. Passwords are never stored in the study database.
6. If a study needs a separate Firebase RTDB, add its root `https://...firebasedatabase.app/` URL when saving that study. The Functions project's service account **must be granted database access to that other project**, and the destination must have its own secure rules/backup policy. The server tests its ability to write before accepting the connection. Firebase Authentication and the central study registry remain in the **central project**: only study result records go to the linked destination.
7. Configure the schedule: `legacy:<folder name>` selects bundled audio/video levels (including Leiden levels), `library:<id>` uses the central published Designer JSON library, and `uploaded:<id>` is only for a device-local offline pack. Each assignment defines `bpmIndex` and `loops`; optional `configOverride` can change gameplay conditions for that assignment. `weeks['0']` is pretest (played before training); numbered weeks advance on UTC calendar-week boundaries from the participant's start; `weeks['-1']` is posttest after the last scheduled training week. Pre/post allow a single session; training is limited by `maxSessionsPerWeek`.
8. On the dashboard, upload Designer JSON to the library; each level ID is immutable so **publish revisions with new IDs**. Admins can create studies and users, set participant groups/start dates/schedule overrides, disable accounts, and export results. Moderators can only view participants/studies and export data for their assigned study. A moderator is currently associated with a single study.

**Important:** Do not attempt a real study without testing administrator/moderator/participant permissions and Firebase rules (ideally with the Firebase Emulator Suite), collecting a full participant session, testing network interruptions, documenting consent/retention, and arranging database backups. A live cloud deployment has not been exercised here.

## 3. Create offline study packs

In the **online administrator dashboard**, select a participant and choose **Create offline pack**. Use a strong separate local password (minimum 12 characters). The browser downloads `offline-<study>-<participant>.pizzicato-study.json` containing that participant's pseudonymous account, study settings, assigned library-level data, and a PBKDF2 verifier (not the plaintext password). Transfer the pack and password through separate trusted channels. For a standalone application, save `web-config.local.json` with `{ "mode": "offline", "allowGuest": false, "firebase": null }` before building the executable. The participant imports the pack once and enters their username/password. An offline pack is an independent copy; revoking the online account does not revoke already distributed packs. Do not use packs as tamper-proof identity or anti-cheat protection.

Electron automatically saves each completed assignment to:

- Windows: the Electron `app.getPath('userData')/studies/<studyId>/<participantId>/` folder, typically inside `%APPDATA%/Pizzicato`.
- macOS: the Electron `app.getPath('userData')/studies/<studyId>/<participantId>/` folder, typically inside `~/Library/Application Support/Pizzicato`.

The file name is `<sessionId>_<assignmentIndex>.json` and its structure is the **same `ResultEnvelope`** submitted online. The participant can also choose **EXPORT RESULTS** on the study session screen to download JSON and CSV in a browser or Electron. In a browser-only offline session, data persists in that browser's localStorage until exported, but it is quota-limited and can be cleared by the user. For larger research sessions, prefer the Electron executable.

## 4. Build executable packages

`npm run build:win` runs electron-builder Windows packaging, `npm run build:mac` builds DMG/ZIP (normally on a Mac), and `npm run build:linux` builds AppImage. The pre-existing `npm run build:exe` Windows workflow remains. No Windows or Mac binaries were built in this container. A Mac build may require Apple signing/notarization for comfortable distribution; Windows may require signing too. Independently test camera permission and audio playback on each operating system.

## 5. Fork synchronization

Keep the same `src/ts` code on `main` and in your research fork. `web-config.local.json` is untracked and is for local builds; the GitHub Pages workflow uses each repository’s `PIZZICATO_WEB_CONFIG` Actions secret. Thus merges from upstream should not change which Firebase project the fork deploys to. To update, merge upstream `main`, rerun `npm test` and redeploy as explained in [GITHUB_PAGES.md](GITHUB_PAGES.md). Never put Cloud Functions secrets, credential JSON, historical participant data, or offline packs into Git.

## 6. Critical limitations before clinical / real study usage

- This environment cannot download npm packages. `npm test` source-level tests have been run; **full webpack, Electron executable and Firebase emulator/live integration have not**. Build against your Firebase SDK version and run a participant pilot before merging.
- Pizzicato's original webcam/hand tracking depends on camera/device permissions and may fail in some browser/Electron environments; test each target OS.
- The Leiden template recreates the main **shape** (Tryout, pretest, weeks 1–3, three training repetitions per session, posttest, four audio conditions) but **does not automatically reproduce the original alternating participant-number counterbalancing or password suffix behavior**. The new system uses schedule overrides instead. This is a deliberate change; check the published study protocol before using it for comparisons.
- Offline results cannot be authenticated by the server, and an imported pack can be altered by someone with filesystem access. Treat participant-submitted offline results as untrusted research artifacts and use organizational controls for handling. The browser mode stores records unencrypted in localStorage; Electron stores pseudonymous data unencrypted under the user's profile. Add at-rest encryption/consent controls if your ethics review requires them.
- Recovery-queue results are retained centrally if a linked database write fails after progression commits. Dashboard export merges queued results. **If the linked destination is unavailable, the export is explicitly flagged as partial.** An automated queue reconciliation worker, cross-database transactional delivery, and automated backup/restore have not been built.
- The central level library stores small generated `TrackData` JSON documents in Realtime Database, **not uploaded MP4/audio media in Cloud Storage**. Large media should be served via a separate signed-storage pipeline in a future iteration. The browser Level Designer itself is not embedded in the dashboard; use the separate Designer and upload its JSON.
- No automatic migration of historical Leiden Firebase records or historical participants is included. Preserve old data and verify schemas before writing any migration code.
- Moderator account association is single-study and the dashboard JSON schedule editor is an early administrative UI; detailed input validation, accessibility, audit logs, session revocation, backup/retention policies, large-study pagination, and formal permission tests are still required.
