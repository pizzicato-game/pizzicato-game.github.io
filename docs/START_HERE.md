# Pizzicato research: start here

**You do not need to edit game code.** Follow these instructions on a Windows PC or Mac. You will need internet access for the Firebase (online) version.

## Which instructions do I need?

- **I only want to try the game on this computer:** follow **A** below.
- **I want to run a study with login and a database:** follow **B** once, then **C** whenever you want to run it.
- **I want to put the game online on GitHub Pages:** send [GITHUB_PAGES.md](GITHUB_PAGES.md) to the technical maintainer.

## A. Try the game locally without a database (guest)

1. Install **Node.js LTS** from https://nodejs.org and restart your terminal.
2. Download and unzip this Pizzicato repository, or clone it from GitHub.
3. Open a terminal **inside the unzipped Pizzicato folder** (the folder containing `package.json`). On Windows: open the folder in File Explorer, type `cmd` in the address bar, press Enter. On Mac: open Terminal and enter `cd `, drag the folder into Terminal, press Return.
4. Type `npm install` and press Enter. This one-time download needs internet access.
5. Type `npm run start:guest` and press Enter.
6. The game opens in your browser. If not, visit the address the terminal shows (usually http://localhost:8080). Allow webcam access when prompted.
7. To stop, return to the terminal and press **Ctrl+C**.

This guest mode has **no Firebase login or remote result saving**.

## B. Set up a new central administrator database (one-time setup)

The **central administrator database** holds study settings, participant/moderator profiles, study membership, level-library JSON and progress. **Firebase Authentication** holds login identities and password hashes. **Passwords are not written into the Realtime Database**. You do not need a separate database for every study.

1. Go to https://console.firebase.google.com and choose **Add project**. Give it a name, such as `pizzicato-research-test`.
2. Inside that project, open **Build > Authentication > Sign-in method**. Enable **Email/Password**.
3. Open **Build > Realtime Database > Create Database**. Choose a region and use the **default** database. If prompted for security mode, select **locked mode**. Copy its URL (starts with `https://` and ends in `firebaseio.com` or `firebasedatabase.app`).
4. In **Project settings (gear) > General > Your apps**, add a **Web app** (`</>`). Give it a nickname. In its **SDK setup and configuration**, choose **Config**. Keep this screen open; you need the public `apiKey`, `authDomain`, `projectId` and `appId`.
5. Check the project's billing plan. Deploying Cloud Functions generally requires **Blaze (pay-as-you-go)**. Set a budget alert and obtain institutional approval before enabling billing. Firebase usage may incur charges.
6. In your Pizzicato folder run `npm install --prefix functions` (in addition to `npm install` from section A). Then install the Firebase CLI with `npm install -g firebase-tools`.
7. Run `firebase login` and sign in to the Google account that owns your Firebase project.
8. Run `firebase deploy --only functions,database --project YOUR-PROJECT-ID` (replace `YOUR-PROJECT-ID` with the Firebase project ID). This deploys the protected server operations and database access rules. **Do not skip this step:** logging in on the website cannot work without the functions.
9. Download a **Firebase Admin SDK private key** using **Project settings > Service accounts > Generate new private key**. Save the JSON file **outside the Pizzicato repository** in a secure location accessible only to the trusted project owner. **Never upload, email, or commit it to GitHub.**
10. Create your first administrator account. In a terminal in the Pizzicato folder, run:

   ```sh
   npm run admin:create -- your.name@university.example "/full/path/to/downloaded-private-key.json"
   ```

   Replace the email with your actual administrator email and the path with the location of your downloaded file. On Windows the path might be `"C:\\Users\\YourName\\Downloads\\project-firebase-adminsdk-123.json"`; on Mac it might be `"/Users/YourName/Downloads/project-firebase-adminsdk-123.json"`.

11. The command creates the account, grants administrator access, and displays a **new random password once**. Save it in a password manager. If the account already existed, it keeps the existing password. You can run the command again with a second trusted administrator email (e.g., the head researcher).
12. Store and secure the private key according to your institution's policy. It is **not used** when people play the game or visit GitHub Pages.

## C. Run the research website locally (connects to your online database)

1. Open a terminal in the Pizzicato folder (see A, step 3).
2. Run `npm run setup:web`.
3. Answer `y` to **Use Firebase?** and paste the five values requested. Take four from **Project settings > General > Your apps > Web app > Config** and the `databaseURL` from **Build > Realtime Database**. **Do not** paste the Admin SDK private key or your password.
4. Run `npm run check:web` to confirm it says **online** and shows the correct Firebase project ID.
5. Run `npm start`. The website opens in your browser (typically http://localhost:8080).
6. Log in with the administrator **email and generated password**. You should see the research dashboard. Click **Create new study** to set up a study, or **Shared level library** to upload custom Level Designer JSON. Open a study's **Participants / results** page to add moderators and participants.
7. To stop the local website, press **Ctrl+C** in the terminal. Your study settings, users and published levels stay in Firebase.

**Important:** `npm start` runs the *web page on your computer* but still connects to the **real online Firebase database**, not a local dummy copy. Local and GitHub Pages websites can access the same study when both use the same Firebase project configuration. **Do not use live participant data for initial testing.**

To switch to another Firebase project later, run `npm run setup:web` again with the new project's web settings, deploy its functions/rules, and create its own administrator account.

## D. Make a study and invite people

1. Sign in as administrator. Click **Create new study**, enter a study ID (letters/numbers/dashes), a title and a start date. In **Weekly levels (easy editor)** enter a week and level ID, then click **Add level to week**; remove unwanted default assignments using **Remove**. Click **Save study**. Enable the study when ready.
2. Under **Participants / results**, enter a new username and password of **at least 12 characters** and click **Add participant** or **Add moderator**. Give their username and password privately; these are stored as Firebase Auth accounts, *not as readable passwords in the database*.
3. To add a custom level, click **Shared level library**, choose a **Level Designer JSON** file, enter a unique ID, and click **Publish JSON level**. Assign it in a study using `library:LEVEL_ID` (e.g. `library:piano_practice_1`).
4. The same dashboard lets you download JSON/CSV results. Moderators can view their assigned study and export data, but cannot create users or change studies.
5. Keep identifying details separate from participant pseudonyms, and check your institution's consent, retention and access-control requirements before collecting real data.

## If something does not work

- **`npm` is not recognized:** install Node.js LTS, close and reopen the terminal.
- **Page opens in guest mode:** run `npm run check:web`; if needed, run `npm run setup:web` again, then restart `npm start`.
- **Login works but no dashboard / `functions/not-found`:** deploy Cloud Functions to the same project selected in the web configuration (step B8).
- **No permission / database error:** make sure the Realtime Database is the project's **default** instance and deploy `database.rules.json` through step B8; the administrator must have the custom `superadmin` claim (step B10).
- **Webcam not found:** use Chrome/Edge on `localhost` or HTTPS, allow camera permissions, and ensure another app isn't using the camera.
- **Forgot password:** an authorized researcher can reset the user's password in Firebase Console > Authentication. Re-create administrator claims only from a trusted administrator machine.
- **After changing configuration:** stop the server (**Ctrl+C**) and restart `npm start`.

For developer-specific information and deployment limits, see [GITHUB_PAGES.md](GITHUB_PAGES.md), [LOCAL_WEB_SERVER.md](LOCAL_WEB_SERVER.md), and [RESEARCH_SETUP.md](RESEARCH_SETUP.md).
