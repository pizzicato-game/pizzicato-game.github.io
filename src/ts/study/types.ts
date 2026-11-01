/** Study records deliberately contain no passwords or personal identifiers beyond assigned pseudonyms. */
export interface Assignment {
  levelId: string; // "legacy:Cheerful Bliss", "library:<id>" or "uploaded:<id>"
  bpmIndex: number;
  loops: number;
  configOverride?: Record<string, unknown>;
}
export interface StudySettings {
  title: string;
  description: string;
  introText: string;
  startDate: string; // YYYY-MM-DD, shared study start unless participant overrides it
  maxSessionsPerWeek: number;
  weeks: Record<string, Assignment[]>; // keys "0" = pretest, "1" ... or "-1" = posttest
  defaultConfig?: Record<string, unknown>;
  groupConfigs?: Record<string, Record<string, unknown>>;
  enabled: boolean;
}
export interface StudySummary {
  id: string;
  title: string;
  enabled: boolean;
  databaseURL?: string; // server-side destination; never treated as a client auth URL
}
export interface Account {
  uid: string;
  username: string;
  role: 'admin' | 'moderator' | 'participant';
  studyId?: string;
  participantId?: string;
  group?: string;
  startDate?: string;
  weeksOverride?: Record<string, Assignment[]>;
  active: boolean;
}
export interface StudySession {
  account: Account;
  settings: StudySettings;
  mode: 'online' | 'offline';
}
export interface ResultEnvelope {
  schemaVersion: 1;
  studyId: string;
  participantId: string;
  group: string;
  sessionId: string;
  week: number;
  assignmentIndex: number;
  levelId: string;
  completedAt: string;
  result: unknown;
}
export interface Progress {
  completed: Record<string, string[]>; // week -> array of completed assignment keys (session:index)
  sessions: Record<string, number>; // week -> session count (only when last assignment completed)
  activeSession: Record<string, string>; // week -> current session identifier
}
export interface PublishedLevel { id: string; name: string; data?: unknown; updatedAt?: string }
export function defaultStudySettings(title = 'New study'): StudySettings {
  return {
    title, description: '', introText: 'Welcome to the study.',
    startDate: new Date().toISOString().slice(0, 10),
    maxSessionsPerWeek: 3, enabled: false,
    weeks: { '1': [{ levelId: 'legacy:Cheerful Bliss', bpmIndex: 0, loops: 3 }] },
  };
}
export function validateSettings(value: StudySettings): string[] {
  const issues: string[] = [];
  if (!value || typeof value.title !== 'string' || !value.title.trim()) issues.push('Study title is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value?.startDate || '') || Number.isNaN(Date.parse(value.startDate))) issues.push('Invalid start date');
  if (!Number.isInteger(value?.maxSessionsPerWeek) || value.maxSessionsPerWeek < 1 || value.maxSessionsPerWeek > 50) issues.push('Sessions per week must be between 1 and 50');
  if (!value?.weeks || typeof value.weeks !== 'object') issues.push('At least one week is required');
  else Object.entries(value.weeks).forEach(([week, assignments]) => {
    if (!/^-?\d+$/.test(week) || !Array.isArray(assignments)) { issues.push(`Invalid week ${week}`); return; }
    assignments.forEach((assignment, i) => {
      if (typeof assignment.levelId !== 'string' || !/^(legacy|library|uploaded):[\w .-]+$/.test(assignment.levelId)) issues.push(`${week}/${i}: invalid levelId`);
      if (!Number.isInteger(assignment.bpmIndex) || assignment.bpmIndex < 0 || assignment.bpmIndex > 8) issues.push(`${week}/${i}: invalid bpmIndex`);
      if (!Number.isInteger(assignment.loops) || assignment.loops < 1 || assignment.loops > 100) issues.push(`${week}/${i}: invalid loops`);
    });
  });
  if (value?.groupConfigs && (typeof value.groupConfigs !== 'object' || Array.isArray(value.groupConfigs) ||
    Object.values(value.groupConfigs).some(g => !g || typeof g !== 'object' || Array.isArray(g)))) issues.push('Invalid group configurations');
  return issues;
}
export function calculateStudyWeek(startDate: string, now = new Date()): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  if (Number.isNaN(start.valueOf())) throw new Error('Invalid study start date');
  // UTC calendar days, not daylight-saving-sensitive milliseconds of local midnights.
  const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(1, Math.floor((day - start.getTime()) / 604800000) + 1);
}
export function emptyProgress(): Progress { return { completed: {}, sessions: {}, activeSession: {} }; }
export function getNextAssignment(settings: StudySettings, progress: Progress, startDate: string, now = new Date()) {
  const current = calculateStudyWeek(startDate, now);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const beforeStart = today < Date.parse(`${startDate}T00:00:00Z`);
  const lastWeek = Math.max(1, ...Object.keys(settings.weeks).map(Number).filter(n => n > 0));
  const week = settings.weeks['0'] && !(progress.sessions['0'] || 0) ? 0 :
    current > lastWeek && settings.weeks['-1'] ? -1 : current;
  const assignments = settings.weeks[String(week)] || [];
  const sessionNo = (progress.sessions[String(week)] || 0) + 1;
  const sessionId = progress.activeSession[String(week)] || `${week}-${sessionNo}`;
  const done = progress.completed[String(week)] || [];
  const index = assignments.findIndex((_, i) => !done.includes(`${sessionId}:${i}`));
  return { week, assignments, sessionId, index, complete: assignments.length > 0 && index === -1,
    capped: (beforeStart && week !== 0) || (progress.sessions[String(week)] || 0) >= (week <= 0 ? 1 : settings.maxSessionsPerWeek), beforeStart };
}
export function markAssignmentComplete(progress: Progress, week: number, sessionId: string, index: number, total: number): Progress {
  const next: Progress = JSON.parse(JSON.stringify(progress));
  const key = String(week);
  const list = next.completed[key] || [];
  const entry = `${sessionId}:${index}`;
  if (!list.includes(entry)) list.push(entry);
  next.completed[key] = list;
  if (Array.from({ length: total }, (_, i) => `${sessionId}:${i}`).every(x => list.includes(x))) {
    if (next.activeSession[key] === sessionId || !next.activeSession[key]) {
      next.sessions[key] = (next.sessions[key] || 0) + 1;
      delete next.activeSession[key];
    }
  } else next.activeSession[key] = sessionId;
  return next;
}
