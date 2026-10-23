import Dexie, { type Table } from 'dexie';
import type { Goal, Period, SubjectId, TopicStatus } from '../data/content';

export interface KvRow { key: string; value: unknown; updatedAt: number }
export interface StudyTask {
  id: string; date: string; subjectId: SubjectId; topicId: string; title: string;
  kind: 'Learn' | 'MCQ practice' | 'Recall' | 'Revision' | 'Worked example';
  durationMinutes: number; period: Period; priority: number; reason: string;
  status: 'planned' | 'active' | 'completed' | 'missed' | 'postponed';
  locked: boolean; generatedAt: string; actualSeconds?: number; completedAt?: number;
  sourceQuestionIds?: string[];
}
export interface TopicProgressRecord {
  id: string; status: TopicStatus; feedback?: 'understood' | 'partial' | 'again';
  selfReportedMinutes: number; lastStudiedAt?: number; updatedAt: number;
}
export interface PracticeAttempt {
  id: string; date: string; subjectId: SubjectId | 'ALL'; total: number;
  attempted: number; correct: number; incorrect: number; unanswered: number;
  accuracy: number; scorePercent: number; durationSeconds: number; timed: boolean;
  questionIds: string[]; answers: Record<string, number>; topicPerformance: Record<string, { attempted: number; correct: number; incorrect: number }>;
}
export interface StudySession {
  id: string; taskId?: string; topicId?: string; subjectId: SubjectId;
  startedAt: number; endedAt?: number; focusedSeconds: number; status: 'active' | 'paused' | 'completed';
}
export interface PersonalNote {
  id: string; title: string; body: string; subjectId?: SubjectId; topicId?: string;
  pinned: boolean; createdAt: number; updatedAt: number;
}
export interface PdfResource {
  id: string; title: string; fileName: string; size: number; mimeType: string;
  subjectId?: SubjectId; topicId?: string; createdAt: number; blob: Blob;
}
export interface RevisionRecord { id: string; topicId: string; dueAt: string; intervalDays: number; reason: string; lastRecall?: 'correct' | 'partial' | 'incorrect'; completedAt?: number }
export interface DiagnosticRecord {
  id: string; completedAt: number; score: number; total: number; subjectScores: Record<SubjectId, { correct: number; attempted: number }>;
  answers: Record<string, number>;
}

export interface WeeklyAvailability { hours: number; periods: Period[] }
export type WeeklySchedule = Record<'0'|'1'|'2'|'3'|'4'|'5'|'6', WeeklyAvailability>;
export interface StudentProfile {
  name: string; goal: Goal; subjectPreparation: Record<SubjectId, number>;
  weeklyAvailability: WeeklySchedule; diagnostic?: DiagnosticRecord;
  onboardingCompleted: boolean; onboardingStep: number; onboardingAnswers: Record<string, number>;
  createdAt: number; updatedAt: number; theme: 'light'|'dark'|'system'; remindersEnabled: boolean;
}
export interface StudentStateRecord {
  profile: StudentProfile; topicProgress: Record<string, TopicProgressRecord>;
  tasks: StudyTask[]; attempts: PracticeAttempt[]; sessions: StudySession[];
  notes: PersonalNote[]; bookmarks: string[]; revisions: RevisionRecord[];
  pdfMetadata: Omit<PdfResource,'blob'>[]; activeSessionId?: string;
  planReason: string; lastPlanAt?: number; focusTargetTaskId?: string;
}
class StudyDatabase extends Dexie {
  kv!: Table<KvRow, string>;
  profiles!: Table<StudentProfile & { id: string }, string>;
  tasks!: Table<StudyTask, string>;
  attempts!: Table<PracticeAttempt, string>;
  topicProgress!: Table<TopicProgressRecord, string>;
  sessions!: Table<StudySession, string>;
  notes!: Table<PersonalNote, string>;
  pdfs!: Table<PdfResource, string>;
  bookmarks!: Table<{ id: string; createdAt: number }, string>;
  revisions!: Table<RevisionRecord, string>;
  diagnostics!: Table<DiagnosticRecord, string>;
  constructor() {
    super('beu-exam-prep-local');
    this.version(1).stores({ kv: '&key' });
    this.version(2).stores({
      kv: '&key', profiles: '&id', tasks: '&id,date,subjectId,status,locked',
      attempts: '&id,date,subjectId', topicProgress: '&id,status,updatedAt',
      sessions: '&id,subjectId,status,startedAt', notes: '&id,subjectId,topicId,updatedAt',
      pdfs: '&id,subjectId,topicId,createdAt', bookmarks: '&id,createdAt',
      revisions: '&id,topicId,dueAt,completedAt', diagnostics: '&id,completedAt'
    }).upgrade(async transaction => {
      const legacy = await transaction.table('kv').get('student');
      if (legacy && typeof legacy.value === 'object') {
        await transaction.table('kv').put({ key: 'student', value: legacy.value, updatedAt: Date.now() });
      }
    });
  }
}
export const db = new StudyDatabase();
export async function persistStudentState(state: StudentStateRecord): Promise<void> {
  await db.transaction('rw', db.kv, db.profiles, db.tasks, db.attempts, db.topicProgress, db.sessions, db.notes, db.bookmarks, db.revisions, async () => {
    await db.kv.put({ key: 'student', value: state, updatedAt: Date.now() });
    await Promise.all([db.profiles.clear(),db.tasks.clear(),db.attempts.clear(),db.topicProgress.clear(),db.sessions.clear(),db.notes.clear(),db.bookmarks.clear(),db.revisions.clear()]);
    await db.profiles.put({ ...state.profile, id: 'student' });
    if (state.tasks.length) await db.tasks.bulkPut(state.tasks);
    if (state.attempts.length) await db.attempts.bulkPut(state.attempts);
    const topicRows = Object.values(state.topicProgress);
    if (topicRows.length) await db.topicProgress.bulkPut(topicRows);
    if (state.sessions.length) await db.sessions.bulkPut(state.sessions);
    if (state.notes.length) await db.notes.bulkPut(state.notes);
    if (state.bookmarks.length) await db.bookmarks.bulkPut(state.bookmarks.map(id => ({ id, createdAt: Date.now() })));
    if (state.revisions.length) await db.revisions.bulkPut(state.revisions);
  });
}
export async function readStudentState(): Promise<StudentStateRecord | undefined> {
  const record = await db.kv.get('student');
  return record?.value as StudentStateRecord | undefined;
}
export async function savePdf(resource: PdfResource): Promise<void> { await db.pdfs.put(resource); }
export async function removePdf(id: string): Promise<void> { await db.pdfs.delete(id); }
export async function readPdf(id: string): Promise<PdfResource | undefined> { return db.pdfs.get(id); }
export async function listPdfs(): Promise<Omit<PdfResource,'blob'>[]> {
  return (await db.pdfs.toArray()).map(({ blob: _blob, ...rest }) => rest);
}
