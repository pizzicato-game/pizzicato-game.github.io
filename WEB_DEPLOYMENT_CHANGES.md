> **Documentation update (November 2026):** The separate setup and use guides named below were merged into the single current guide, **[`docs/README.md`](docs/README.md)**. Older filenames are mentioned only to document historical changes.

# Change log — GitHub Pages, local Firebase website and researcher setup

Base: `pizzicato-universal-phases-1-9.zip`. This update preserves existing gameplay, level/media assets, Cloud Functions, studies, authentication rules, and offline packaging. No actual Firebase accounts, databases, service-account keys, or deploy credentials are bundled.

## Added (13 files, including this file)

| File | Purpose |
| --- | --- |
| `.github/workflows/deploy-pages.yml` | Manual GitHub Pages workflow; deploy `main` or `dev`, guest or online; run tests, build and publish `dist/` using official Pages actions. |
| `configs/web-config.example.json` | Example public Firebase Web app configuration (contains placeholders, **not** credentials). |
| `docs/START_HERE.md` | Step-by-step beginner instructions for Windows/Mac guest mode, Firebase database creation, admin setup, and local online login. |
| `docs/LOCAL_WEB_SERVER.md` | Beginner instructions for running the same Firebase-connected website on `localhost`, without deploying. |
| `docs/GITHUB_PAGES.md` | GitHub settings, repository secret, `main`/`dev` selection, publish flow, and troubleshooting. |
| `docs/ADMIN_DATABASE.md` | Dedicated guide to central Firebase setup, Firebase Auth administrator creation, moderator accounts, study settings, and custom levels. |
| `scripts/web-config.js` | Validates public browser configuration and loads it from `web-config.local.json` or `PIZZICATO_WEB_CONFIG`; fails closed for online builds with invalid config, and refuses private-key/password fields. |
| `scripts/setup-web.js` | Interactive wizard for research users; saves local public web configuration with restricted file permissions. |
| `scripts/check-web-config.js` | Checks web deployment mode/project before starting or publishing. |
| `scripts/create-admin.js` | Secure local one-time Firebase Admin SDK tool that creates or promotes a trusted admin account; generates a one-time random password for newly created accounts. It reads a service-account file outside Git. |
| `scripts/print-deploy-help.js` | Replaces the old ambiguous `npm run deploy` behavior with a pointer to the supported GitHub Actions workflow. |
| `scripts/test-web-deployment.js` | Source-level regression tests for config validation, no silent guest fallback, Pages routing, and workflow contents. |
| `WEB_DEPLOYMENT_CHANGES.md` | This file. |

## Modified (8 files)

| File | Exact change |
| --- | --- |
| `.github/workflows/main.yml` | Upgraded checkout/setup-node actions, Node 22, and added regression tests before CI build. |
| `.gitignore` | Ignore `web-config.local.json`, local `private/` and `credentials/` folders, and Firebase Admin SDK key filenames. |
| `README.md` | Updated command table and links to beginner deployment/admin documentation. |
| `docs/RESEARCH_SETUP.md` | Replaced obsolete TypeScript-editing instructions with the config wizard/Actions secret setup and new administrator CLI. Retained advanced research/offline limitations. |
| `package.json` | Added `setup:web`, `check:web`, `admin:create`, `test:web`, `start:guest`, `serve:build`; added web tests to `npm test`; changed `deploy` to help-only (previous gh-pages branch push is no longer used). |
| `src/ts/study/deployment.ts` | Replaced source-code `guest/online` switch with build-injected **public** web config. No more source edits or merge conflicts to change Firebase projects. |
| `src/ts/study/dashboard.ts` | Added an easy weekly-level assignment editor (Add/Remove buttons, week, level ID, BPM option, loops), kept advanced JSON edit view, and hid new-account entry fields from moderators. |
| `webpack/webpack.common.js` | Injects validated web config at build time using `DefinePlugin`; explicit `publicPath: 'auto'` for project-subdirectory GitHub Pages and local asset loading. |

## Removed (1 file)

- `configs/research-deployment.example.ts` — old guidance required copying/editing TypeScript for each Firebase project; replaced by the config wizard and `configs/web-config.example.json`.

## Existing central database features retained

- Firebase Auth manages administrator, moderator and participant password hashes (never store plaintext passwords in Realtime Database).
- Central Realtime Database paths `accounts/`, `studyMembers/`, `studies/`, `studyIndex/` store profiles/roles and study settings.
- `levelLibrary/` and `levelIndex/` store published custom Level Designer JSON and metadata, available across studies.
- Existing callable Cloud Functions create moderator accounts, publish custom levels, assign studies, enforce server-side permissions and export results.
- `progress/` and `results/` store participation/results by default; a study can optionally specify a separate result database. The central registry remains in the administrator Firebase project.

## Verification performed

- `npm test`: passed legacy levels (7), media references, Designer format conversion, study progression/offline tests, TypeScript transpilation checks, and web config/Pages workflow static checks.
- `npm run check:web`: passed guest and synthetic online settings; online-mode expectation correctly rejects guest configuration.
- `npm run setup:web`: successfully created a local guest config during a command-line smoke test; local config was removed before packaging.
- Node syntax checks for new scripts and existing Cloud Functions passed.
- GitHub Actions workflow structure parsed locally (not executed on GitHub).
- ZIP archive file integrity and unchanged legacy assets verified against the Phase 1–9 archive.

## Not verified / deployment requirements

The npm registry was unavailable in this environment (`EAI_AGAIN`), so **webpack production build, local browser runtime, live Firebase authentication/functions, and actual GitHub Pages deployment have not been exercised**. You must install dependencies, provision and deploy your own Firebase project, run a local administrator login/test participant session, and run the workflow on GitHub. Node 22 is used by CI; Firebase Functions require an appropriate Cloud Functions plan. Study researchers should not enroll participants until a permission/privacy review and end-to-end web test have passed.

For the simplest starting point, open **`docs/START_HERE.md`**.
