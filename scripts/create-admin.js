#!/usr/bin/env node
/** Create/grant one trusted superadmin in Firebase Authentication, using a service-account file OUTSIDE Git.
 * Usage: npm run admin:create -- researcher@example.org "/absolute/path/to/service-account.json"
 * If the account already exists, leave its password unchanged and grant the claim.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const email = process.argv[2];
const file = process.argv[3];
function fail(message) { console.error(message); process.exitCode = 1; }
async function main() {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !file) throw new Error('Usage: npm run admin:create -- researcher@example.org "/path/to/service-account.json"');
  const keyPath = path.resolve(file);
  if (!fs.existsSync(keyPath)) throw new Error('Service-account file not found.');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  if (!key.project_id || !key.private_key || !key.client_email) throw new Error('Please provide a Firebase Admin SDK service-account JSON file, not the web config.');
  const { localPath } = require('./web-config');
  if (fs.existsSync(localPath)) {
    const web = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    if (web.mode === 'online' && web.firebase?.projectId !== key.project_id)
      throw new Error('Service-account project differs from configured web project. Refusing to grant access to the wrong project.');
  }
  let admin;
  try { admin = require('../functions/node_modules/firebase-admin'); }
  catch { throw new Error('Firebase Admin SDK not installed. First run: npm install --prefix functions'); }
  const app = admin.initializeApp({ credential: admin.credential.cert(key), projectId: key.project_id }, 'pizzicato-admin-setup');
  const auth = admin.auth(app);
  let user; let password;
  try { user = await auth.getUserByEmail(email); }
  catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    password = crypto.randomBytes(24).toString('base64url');
    user = await auth.createUser({ email, password, emailVerified: false, disabled: false });
  }
  const claims = user.customClaims || {};
  await auth.setCustomUserClaims(user.uid, { ...claims, superadmin: true });
  console.log(`\nAdministrator created/verified in Firebase project: ${key.project_id}`);
  console.log(`Login email: ${email}`);
  if (password) {
    console.log(`Generated password (shown ONLY once): ${password}`);
    console.log('Copy it to a password manager. Never add it to Git, screenshots, or study documents.');
  } else console.log('Existing account kept its current password. Use Firebase Authentication to reset it if needed.');
  console.log('Open the configured Pizzicato website and sign in. Log out/in again if this account was already signed in.');
  await app.delete();
}
main().catch(error => fail(`Administrator setup failed: ${error.message}`));
