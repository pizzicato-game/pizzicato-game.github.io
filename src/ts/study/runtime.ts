import { StudySession, Progress, Assignment, ResultEnvelope, emptyProgress, getNextAssignment, markAssignmentComplete } from './types';
import { loadLocalProgress, saveLocalResult } from './offline';
import { studyApi } from './firebaseClient';

let session: StudySession | null = null;
let progress: Progress = emptyProgress();
let pending: { week: number; sessionId: string; index: number; total: number; assignment: Assignment } | null = null;
export let publishedLevels: Record<string, unknown> = {};
export function setStudySession(value: StudySession, remoteProgress?: Progress, levels: Record<string, unknown> = {}) {
  session = value;
  const account = value.account;
  progress = value.mode === 'offline' ? loadLocalProgress(account.studyId!, account.participantId!) : (remoteProgress || emptyProgress());
  publishedLevels = levels;
}
export function getStudySession() { return session; }
export function getStudyProgress() { return progress; }
export function getStudyPlan(now = new Date()) {
  if (!session) return null;
  return getNextAssignment(session.settings, progress, session.account.startDate || session.settings.startDate, now);
}
export function setPendingAssignment(week: number, sessionId: string, index: number, total: number, assignment: Assignment) {
  pending = { week, sessionId, index, total, assignment };
}
export function clearPendingAssignment() { pending = null; }
export function getPendingAssignment() { return pending; }
export async function recordLevelCompletion(result: unknown) {
  if (!session || !pending) return;
  const data: ResultEnvelope = {
    schemaVersion: 1, studyId: session.account.studyId!, participantId: session.account.participantId!,
    group: session.account.group || '', sessionId: pending.sessionId, week: pending.week,
    assignmentIndex: pending.index, levelId: pending.assignment.levelId,
    completedAt: new Date().toISOString(), result,
  };
  const nextProgress = markAssignmentComplete(progress, pending.week, pending.sessionId, pending.index, pending.total);
  // Commit the result and progression together. Failed writes must be retryable.
  if (session.mode === 'offline') await saveLocalResult(data, nextProgress);
  else await studyApi.saveResult(data, nextProgress);
  progress = nextProgress;
  pending = null;
}
