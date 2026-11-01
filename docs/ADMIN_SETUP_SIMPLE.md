# First-time setup: administrator login and central Firebase database

For the lead researcher. Do these steps **once for each new Firebase project**. An IT assistant can help with the installation and Firebase deployment. You do not need to edit code.

## 1. Get the software ready

1. Install **Node.js LTS** from <https://nodejs.org>.
2. Unzip Pizzicato. Open the folder containing `package.json`.
3. **Windows:** type `cmd` into File Explorer's address bar and press Enter. **Mac:** open Terminal, type `cd `, drag the Pizzicato folder into Terminal and press Return.
4. Type `npm install` and press Enter. Then type `npm install --prefix functions`.

## 2. Optional: choose the login before creating Firebase

If you want to create your administrator username/password now and activate it later, type:

```sh
npm run admin:prepare -- lead.researcher@university.edu "/safe/folder/admin-vault.json"
```

- Replace the email and folder with your own. The folder must already exist. Windows example: `"C:\\Users\\Researcher\\Documents\\admin-vault.json"`.
- The command asks for a **separate encryption passphrase** (at least 20 characters) and displays the randomly generated **login password once**.
- Write down **three separate things** in a password manager: the login email, login password, and encryption passphrase. Keep the passphrase separate from the encrypted file.
- The encrypted vault file is an *optional backup*. You can store it securely; it must **not** be served as a website asset. A strong, unique passphrase is essential. Avoid committing it to public GitHub, even encrypted, unless your institutional security policy explicitly allows that.
- If you prefer, **skip this step** and use the shorter `admin:create` command in step 5.

**Important:** Pizzicato never verifies an administrator password from a file committed to GitHub. A public webpage cannot safely contain that verifier or its decryption key. Actual login verification happens in Firebase Authentication.

## 3. Create the central Firebase project

1. Open <https://console.firebase.google.com> and click **Create/Add project**.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Realtime Database**, create the **default** database in **locked mode**. Copy the database URL.
4. In **Project settings → General → Your apps**, add a **Web** app and copy its public configuration. **Do not copy service-account keys into web configuration.**
5. Check whether Firebase asks for billing/Blaze to deploy Cloud Functions. Obtain institutional authorization and set budget alerts.

The **central database** will contain study settings, moderator and participant profiles, assigned schedules, custom JSON levels, and progress/results. Firebase **Authentication** keeps password credentials separately.

## 4. Deploy the secure server

In your Pizzicato terminal, type each command:

```sh
npm install -g firebase-tools
firebase login
firebase deploy --only functions,database --project YOUR-PROJECT-ID
```

Replace `YOUR-PROJECT-ID` with the ID shown in Firebase Project settings (not the display name). This creates the protected server functions and database rules.

## 5. Activate your administrator login

1. In Firebase Project settings, open **Service accounts → Generate new private key**.
2. Save the downloaded JSON file **outside** the Pizzicato folder. Never share it with moderators or upload it to GitHub.
3. **If you created the encrypted vault in step 2**, type:

   ```sh
   npm run admin:activate -- "/safe/folder/admin-vault.json" "/safe/folder/service-account.json"
   ```

   Enter the encryption passphrase when asked. The administrator is created in Firebase using the original email/password.

4. **If you skipped step 2**, instead type:

   ```sh
   npm run admin:create -- lead.researcher@university.edu "/safe/folder/service-account.json"
   ```

   This creates an administrator and displays a new random password once.

5. Save the username and password in a password manager and give them directly to authorized lead researchers. **Do not give them the private key.** To create a second administrator, use `admin:create` with another trusted email.

## 6. Connect the local dashboard

1. Type `npm run setup:web`.
2. Choose **online/Firebase** and enter the web configuration from step 3, including the database URL.
3. Type `npm run check:web` to check the project name and mode.
4. Type `npm start` and open the browser address shown (usually <http://localhost:8080>).
5. Sign in with your administrator email and password. Choose **Shared level library**, **Create new study**, or **Manage moderator accounts**.
6. When finished, press **Ctrl+C** in Terminal/Command Prompt to stop the local web server. **Firebase data remains saved online.**

Use [STUDY_BUILDER_GUIDE.md](STUDY_BUILDER_GUIDE.md) for the next steps. To publish on GitHub Pages, the technical maintainer can follow [GITHUB_PAGES.md](GITHUB_PAGES.md).

## Keep safe

- Never upload a service-account JSON, plain-text passwords, or an encryption passphrase to GitHub.
- The Firebase *web config* is allowed in the public browser bundle; it provides no administrator privileges by itself.
- Anyone with an administrator login can manage studies, moderators and participants. Disable accounts immediately if lost/compromised.
- Before a real study, have the institutional privacy/security owner review research consent, access, retention, testing, and recovery procedures.
