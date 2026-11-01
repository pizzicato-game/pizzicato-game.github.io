# Create an administrator database and your first administrator login

**Start with the simpler [ADMIN_SETUP_SIMPLE.md](ADMIN_SETUP_SIMPLE.md)** if you are a researcher setting up Pizzicato for the first time. It also describes the optional encrypted credential backup.

This is for the **lead researcher or IT assistant**, once per research Firebase project. After setup, routine study management happens in the website dashboard; researchers do not need to use a coding editor.

## Step 1 — Create the Firebase project

1. Visit https://console.firebase.google.com, sign in, choose **Add project** and name it.
2. In **Build > Authentication > Sign-in method**, enable **Email/Password**.
3. In **Build > Realtime Database**, click **Create Database**. Create the **default** database in **locked mode**. Its URL will look similar to `https://YOUR-PROJECT-default-rtdb.europe-west1.firebasedatabase.app`.
4. Open the gear icon > **Project settings > General > Your apps**. Click **Web (`</>`)** and register a Web app. Keep the Firebase **Config** visible.
5. Make sure your institution permits the billing plan needed for **Cloud Functions** (usually Blaze) and set billing alerts.

## Step 2 — Install and connect Pizzicato

1. Unzip the Pizzicato repository and open a terminal in its main folder (see [START_HERE.md](START_HERE.md) for Windows/Mac instructions).
2. Run these commands one by one:

   ```sh
   npm install
   npm install --prefix functions
   npm install -g firebase-tools
   firebase login
   ```

3. Deploy the server and database rules with:

   ```sh
   firebase deploy --only functions,database --project YOUR-PROJECT-ID
   ```

   Replace `YOUR-PROJECT-ID` with your actual Project ID. This is the **central administrator database** used by all studies. Repeat this deployment whenever the `functions/` code or `database.rules.json` changes.

## Step 3 — Generate an administrator login

1. In Firebase Console open **Project settings > Service accounts** and choose **Generate new private key**. Save the downloaded Admin SDK JSON file **outside the Pizzicato folder** and do not give it to moderators or participants.
2. Open a terminal in the Pizzicato folder and run:

   ```sh
   npm run admin:create -- lead.researcher@university.example "/absolute/path/to/private-key.json"
   ```

3. Enter your actual email address and your file path. The script creates an administrator login and shows a **random password once**, unless the account already exists. Copy it to a password manager.
4. To give one additional trusted lead researcher full administrator privileges, run the same command with their email address. Never distribute the private key to ordinary moderators.
5. For password resets, use Firebase Console > Authentication. To disable an administrator, revoke their `superadmin` claim and/or disable their Firebase Auth account; do not just remove a database profile.

## Step 4 — Point the website at the new database

1. Run `npm run setup:web` in the Pizzicato folder. Answer **y** to connect Firebase.
2. Enter the public `apiKey`, `authDomain`, `projectId`, `appId` from the Web app Config, and the `databaseURL` from the Realtime Database page.
3. Run `npm run check:web`; it must display your correct Firebase Project ID and `online`.
4. Run `npm start` and sign in with the administrator email and password created in step 3. The website opens in a browser, normally http://localhost:8080.
5. For GitHub Pages hosting, use [GITHUB_PAGES.md](GITHUB_PAGES.md) and configure the same Firebase Web app settings in the GitHub Actions secret.

## Step 5 — Use the dashboard

1. Choose **Create new study**. Give the study a unique ID, use **Add level to week** to choose a level and week, and save its settings. It is stored in the **central Realtime Database**.
2. Open **Participants / results** for a study. Choose **Add participant** or **Add moderator**. Moderators can see participants/results for their study, but cannot change the study or create new accounts.
3. Choose **Shared level library** to upload a new Level Designer JSON. The custom level is saved in the same central Realtime Database and can be referenced from any study using `library:LEVEL_ID`.
4. When a study completes, use **Export full study** or a participant's **Download data** button to download results.

## What is actually stored in the database?

| Firebase location | Content |
| --- | --- |
| `studies/` and `studyIndex/` | Study settings, schedules and optional linked-results database references |
| `accounts/` and `studyMembers/` | Moderator and participant usernames, roles, study membership, and active status (no passwords) |
| `levelLibrary/` and `levelIndex/` | Custom uploaded Level Designer JSON levels and level metadata |
| `progress/` and `results/` | Session progression and results, by default |
| Firebase **Authentication** (separate service) | Login accounts and password hashes; **no readable passwords in the database** |

The **central database is the project's default Realtime Database**. Studies share it but are isolated by server-side permission checks. If your protocol requires a separate Firebase result database for one study, an experienced administrator can enter its URL in the study settings **after granting the Cloud Functions service account permission to write there**. This optional feature changes only the destination for results, not the location of administrator records or level library.

**Security:** Do not publish database exports, Admin SDK keys, real participant names or passwords to GitHub. The browser's public Firebase config is not a service-account credential. Test roles and consent/retention rules before enrolling participants. See [RESEARCH_SETUP.md](RESEARCH_SETUP.md) for research limitations.
