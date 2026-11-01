# Running Pizzicato on your own computer (with Firebase)

This is the same browser game as GitHub Pages, **but without publishing anything to GitHub**. Data is stored in the **same remote Firebase project**, provided both versions have the same public web configuration.

## If Firebase is not set up yet

Follow **B. Set up a new central administrator database** in [START_HERE.md](START_HERE.md). It tells you how to create a project, deploy the Firebase backend and create an administrator account.

## Every time you want to run the website

1. Open the Pizzicato folder on your computer.
2. Open a terminal in that folder (Windows: type `cmd` in File Explorer's folder address bar; Mac: Terminal, `cd ` then drag the folder into the window).
3. The first time only, type `npm install`.
4. The first time you use **this Firebase project**, type `npm run setup:web`, answer **y** and enter the web configuration from Firebase Console. This saves the settings on your computer only.
5. Type `npm run check:web`. Verify it says `online` and the correct project ID.
6. Type `npm start`.
7. Open the URL shown in the terminal (usually **http://localhost:8080**). Log in using your admin, moderator or participant account.
8. When finished, press **Ctrl+C** in the terminal.

**No GitHub deployment is needed.** Keep your internet connection active to sign in and upload results. Browser `localhost` is permitted to access the camera, but you must grant camera permission.

### Testing the release build locally (optional)

Type `npm run serve:build`, then go to **http://localhost:8080**. This builds the production website first, and serves it from the `dist` folder. It still connects to the same Firebase backend.

### What is stored where?

| Where | Contents |
| --- | --- |
| Firebase Authentication | Administrator, moderator and participant sign-in credentials (managed securely by Firebase) |
| Central Firebase Realtime Database | Studies, participant/moderator profiles, published custom level JSON, progress, and (by default) study results |
| Optional linked study database | Results of one study, if configured by a qualified administrator; all studies still use the central registry and logins |
| Your computer | Only game code, a local copy of the **public** web configuration, and temporary browser data |

Never put the **Admin SDK private-key JSON**, generated passwords or actual participant result exports in the GitHub repository.
