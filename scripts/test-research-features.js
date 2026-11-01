/** Tests using built-in Node + globally available TypeScript; no Firebase credentials required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Module = require('node:module');
const ts = (() => { try { return require('typescript'); } catch { return require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript'); } })();
function loadTS(filename) {
  const full = path.resolve(__dirname, filename);
  const source = fs.readFileSync(full, 'utf8');
  const output = ts.transpileModule(source, { fileName: full, reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  assert(!output.diagnostics.some(x => x.category === ts.DiagnosticCategory.Error));
  const m = new Module(full, module); m.filename = full; m.paths = Module._nodeModulePaths(path.dirname(full));
  m._compile(output.outputText, full); return m.exports;
}
const { encryptCredentials, decryptCredentials } = require('./admin-vault');
const user = { email: 'researcher@example.edu', password: crypto.randomBytes(24).toString('base64url') };
const secret = 'this-is-a-long-unique-vault-phrase-!z2';
const vault = encryptCredentials(user, secret);
assert(!JSON.stringify(vault).includes(user.password));
assert(!JSON.stringify(vault).includes(user.email));
assert.deepEqual(decryptCredentials(vault, secret), user);
assert.throws(() => decryptCredentials(vault, secret + 'wrong'), /auth|unable|decrypt|error|Unsupported/i);
assert.throws(() => encryptCredentials(user, 'short'));
const altered = { ...vault, data: (vault.data[0] === 'A' ? 'B' : 'A') + vault.data.slice(1) };
assert.throws(() => decryptCredentials(altered, secret));
const { defaultStudySettings, validateSettings, emptyProgress, getNextAssignment, markAssignmentComplete } = loadTS('../src/ts/study/types.ts');
const settings = defaultStudySettings('Test'); settings.startDate = '2026-11-01'; settings.maxSessionsPerWeek = 1;
assert.deepEqual(validateSettings(settings), []);
settings.weeks['2'] = [
  { type: 'start', text: 'Welcome to week 2.' },
  { type: 'level', levelId: 'library:example1', bpmIndex: 1, loops: 4 },
  { type: 'break', text: 'Break time.' },
  { type: 'level', levelId: 'legacy:Trained', bpmIndex: 0, loops: 2 },
  { type: 'end', text: 'See you next time!' },
];
assert.deepEqual(validateSettings(settings), []);
let progress = emptyProgress();
for (let i = 0; i < settings.weeks['1'].length; i++) {
  const plan = getNextAssignment(settings, progress, settings.startDate, new Date('2026-11-01T12:00:00Z'));
  assert.equal(plan.index, i);
  assert.equal(plan.capped, false);
  progress = markAssignmentComplete(progress, plan.week, plan.sessionId, plan.index, plan.assignments.length);
}
assert.equal(progress.sessions['1'], 1);
assert.equal(getNextAssignment(settings, progress, settings.startDate, new Date('2026-11-01T12:00:00Z')).capped, true);
assert.equal(getNextAssignment(settings, progress, settings.startDate, new Date('2026-11-09T12:00:00Z')).week, 2);
assert(validateSettings({ ...settings, weeks: { '1': [{ type: 'end', text: 'no playable slide' }] } }).length > 0);
assert(validateSettings({ ...settings, weeks: { '1': [{ type: 'start', text: 'x'.repeat(2001) }, { levelId: 'legacy:Trained', bpmIndex: 0, loops: 1 }] } }).length > 0);
const backend = fs.readFileSync(path.resolve(__dirname, '../functions/index.js'), 'utf8');
for (const operation of ['listModerators', 'provisionAccount', 'removeAccount', 'resetModeratorPassword', 'advanceStudyStep', 'saveLevel', 'listLevels', 'getLevel', 'saveStudy', 'submitResult'])
  assert(backend.includes(`exports.${operation} = onCall(options, async req =>`), `${operation} absent`);
for (const operation of ['removeAccount', 'resetModeratorPassword', 'listModerators']) {
  const start = backend.indexOf(`exports.${operation} = onCall`);
  const segment = backend.slice(start, backend.indexOf('\nexports.', start + 10));
  assert(segment.includes('requireAdmin(operator)'), `${operation} missing admin authorization`);
}
assert(backend.includes('if (sessionId !== sid || index !== ix || !step || step.type !== stepType) return;'));
assert(backend.includes('!isLevel(assignments[expectedIndex])'));
assert(fs.readFileSync(path.resolve(__dirname, '../src/ts/study/dashboard.ts'), 'utf8').includes('createFlowBoard'));
assert(fs.readFileSync(path.resolve(__dirname, '../src/ts/scenes/studySessionScene.ts'), 'utf8').includes('advanceScreenStep'));
for (const guide of ['ADMIN_SETUP_SIMPLE.md', 'STUDY_BUILDER_GUIDE.md'])
  assert(fs.existsSync(path.resolve(__dirname, '../docs', guide)));
console.log('PASS: AES-GCM admin vault (round-trip, wrong key, tamper resistance), start/level/break/end, weekly cap, authorization guards, setup guides');
