# Publishing Pizzicato to GitHub Pages (from `main` or `dev`)

The repository contains a GitHub Actions workflow called **Deploy GitHub Pages**. It builds and publishes a static website. Firebase Authentication, Realtime Database and callable Cloud Functions remain hosted on **Firebase**; GitHub Pages hosts **only the browser game**.

## One-time setup (technical maintainer)

1. Put this repository on GitHub. Make sure the `.github/workflows/deploy-pages.yml` file exists on **`main`**. If you want to publish `dev`, create a `dev` branch containing this workflow too.
2. In GitHub, open **Settings > Pages > Build and deployment > Source** and choose **GitHub Actions** (not "Deploy from a branch").
3. If you want an **online research** website, first follow [START_HERE.md](START_HERE.md), section **B**, to set up Firebase Authentication, Realtime Database, deploy Cloud Functions and create an administrator. You can test it locally first (section C).
4. In your local repo folder, run `npm run setup:web`, choose **y** and supply the Firebase Web app configuration. Check the resulting `web-config.local.json`: it must have `"mode": "online"`, `"allowGuest": false` and the correct Firebase web settings. **This is a PUBLIC web-app configuration**, not the Admin SDK private key.
5. On GitHub open **Settings > Secrets and variables > Actions > New repository secret**. Name it **`PIZZICATO_WEB_CONFIG`** and paste the **entire JSON contents** of `web-config.local.json` as the secret value. The workflow will inject these *public* values at build time. **Never** paste service-account JSON, user passwords, or database exports into this secret.
6. In Firebase Console > **Authentication > Settings > Authorized domains**, add the GitHub Pages host (e.g. `yourname.github.io`) if it isn't listed. Do not include `https://` or a path. Also ensure `localhost` is authorized for local testing where required. GitHub Pages uses HTTPS, which permits browser camera access when the user grants it.
7. In GitHub **Settings > Actions > General**, allow GitHub Actions to run. If your organization restricts deployments, an administrator may need to enable Pages and Actions deployment permissions.

For a **guest-only demo**, skip steps 3–6. You do not need Firebase or the repository secret.

## Deploy `main` or `dev` (repeat whenever needed)

1. On GitHub open your repository and choose the **Actions** tab.
2. Choose **Deploy GitHub Pages** in the left-hand list.
3. Click **Run workflow**.
4. Under **Use workflow from**, choose **`main`** for the stable release or **`dev`** for testing changes.
5. Under **What should visitors see?**, select **guest** for a demo without login, or **online** to require Firebase login.
6. Click the green **Run workflow** button, then open that workflow run and check that the build, tests and deploy finish successfully.
7. Open **Settings > Pages** and click the published website URL, usually `https://YOUR-USER.github.io/YOUR-REPO/`. Use the full URL including the repository name for a project site.

**Only ONE branch is published at a time.** Deploying `dev` replaces the current Pages website; deploying `main` restores it. These instructions do **not** create two simultaneous URLs. If you need permanent demo and research addresses, use two separate GitHub repositories (for example, the main repository and your research fork), each with its own Pages setup and Firebase configuration.

## Important differences from a local website

- **Same game and database:** in online mode, the GitHub Pages build and local development server both call the Firebase project specified in their configuration. The Firebase project ID must match. Each GitHub repository/fork has its **own** `PIZZICATO_WEB_CONFIG` secret and can point to a different research database.
- **No backend on GitHub Pages:** never attempt to deploy `functions/` or Admin SDK keys to GitHub Pages. Run `firebase deploy --only functions,database --project YOUR-PROJECT-ID` separately whenever backend code/rules change.
- **No private secrets in the browser:** Firebase web `apiKey` is expected to be visible in web assets. Access is protected by Firebase Auth, custom claims, Cloud Functions and restrictive database rules, *not* by hiding a web API key.
- **Browser camera requirements:** HTTPS is provided by Pages; camera permissions remain required. Test hand tracking, audio, level loading and Firebase login in the deployed browser before research use.
- **Build process:** static assets are generated in `dist/` with relative URLs, so project pages under `/repository-name/` work. `.nojekyll` is included by the deployment workflow. The `npm run deploy` command prints a pointer to these instructions rather than pushing an unmanaged `gh-pages` branch.
- **Branch safety:** if `online` is chosen but the repository secret is missing/invalid, the workflow **fails** rather than silently publishing a guest/demo site.

## Updating the research fork

1. Merge or sync new gameplay commits from the upstream `main` branch into the fork.
2. Keep the fork's own `PIZZICATO_WEB_CONFIG` secret pointed at its **research** Firebase project. This does not need edits to any TypeScript source file.
3. Deploy the desired branch from the fork's Actions tab.
4. Confirm the login screen appears and perform a dummy participant test. Do not collect real participant data before validating permissions, exports, and consent procedures.

## Troubleshooting

- **No Run workflow button:** the workflow must first exist on the default branch, normally `main`. Push the workflow file to `main` and reopen Actions.
- **Build fails, missing Firebase config:** verify the repository secret is named exactly `PIZZICATO_WEB_CONFIG` and contains valid JSON, select `online`, and rerun.
- **Game assets 404:** use the complete Pages URL ending in `/REPO/`, not the domain root. Check that `dist/assets`, `dist/levels`, `dist/models` were included in the upload.
- **Login fails on Pages but not locally:** compare the Firebase project IDs, authorized domains, and whether the Functions backend was deployed to that project.
- **Camera blocked:** use HTTPS Pages URL, grant camera permission, and test a supported browser.
- **Page doesn't change after deployment:** hard-refresh and check the latest Actions run; GitHub Pages can cache assets briefly. Test in a private browser window if needed.
