// Legacy academic source data is intentionally kept as a separately versioned static asset.
// The raw source arrays retain the wording, options, provenance, and source-page fields.
import '../../data.js';
import '../../pyq-mcqs.js';

export type SubjectId = 'CN' | 'COA' | 'FLAT' | 'DBMS' | 'DAA' | 'ETC';
export type Goal = 'pass' | 'marks' | 'important' | 'mastery' | 'revision';
export type Period = 'Morning' | 'Afternoon' | 'Evening';
export type TopicStatus = 'not-started' | 'learning' | 'partial' | 'review' | 'mastered';
export type QuestionKind = 'MCQ' | 'Short' | 'Long' | 'Unverified';
export type Provenance = 'current-pyq' | 'supplementary-pyq' | 'curated';

export interface Exam {
  id: SubjectId; name: string; code: string; date: string; color: string;
}
export interface Topic {
  id: string; subjectId: SubjectId; unitIndex: number; index: number;
  title: string; importance: 'High' | 'Medium' | 'Low';
  estimatedMinutes: number; prerequisites: string[];
}
export interface Unit {
  id: string; subjectId: SubjectId; index: number; title: string; topics: Topic[];
}
export interface Subject {
  id: SubjectId; short: string; name: string; code: string; color: string; icon: string;
  exam: Exam; units: Unit[]; topicCount: number;
}
export interface Question {
  id: string; subjectId: SubjectId; kind: QuestionKind; text: string; options?: string[];
  correctIndex?: number; explanation?: string; outline?: string[]; marks?: number;
  year?: number; semester?: number; courseCode?: string; paper?: string; sourceName?: string;
  sourcePage?: number; paperPage?: number; difficulty: 'Easy' | 'Medium' | 'Hard';
  provenance: Provenance; answerVerified: boolean; topicId?: string; importance?: 'High' | 'Medium' | 'Low';
  originalWording: boolean; tags: string[];
}

interface RawTopicUnit { name: string; topics: [string, string][] }
interface RawSubject { id: SubjectId; short: string; name: string; code: string; color?: string; units: RawTopicUnit[] }
interface RawQuestion {
  id: string; s: SubjectId; type: string; q: string; o?: string[]; a?: number;
  e?: string; outline?: string[]; marks?: number; year?: number; semester?: number;
  courseCode?: string; paper?: string; sourceName?: string; sourcePage?: number; paperPage?: number;
  sourceType?: string; verifiedSource?: boolean; answerVerified?: boolean; difficulty?: string;
  priority?: string; topicId?: string;
}
interface RawContent { subjects: RawSubject[]; exams: Exam[]; questions: RawQuestion[] }
declare global { interface Window { STUDY_DATA?: RawContent } }

const raw = window.STUDY_DATA;
if (!raw || !Array.isArray(raw.subjects) || !Array.isArray(raw.exams) || !Array.isArray(raw.questions)) {
  throw new Error('The bundled BEU academic dataset could not be loaded.');
}
export const EXAMS: Exam[] = raw.exams;
const examById = new Map(EXAMS.map(exam => [exam.id, exam]));
const icons: Record<SubjectId, string> = { CN: 'Network', COA: 'Cpu', FLAT: 'GitBranch', DBMS: 'Database', DAA: 'Workflow', ETC: 'MessagesSquare' };

export const SUBJECTS: Subject[] = raw.subjects.map((s) => {
  const units = s.units.map((u, unitIndex) => ({
    id: `${s.id}-unit-${unitIndex + 1}`,
    subjectId: s.id,
    index: unitIndex,
    title: u.name.replace(/^Unit\s+\d+\s*[·.:—-]?\s*/i, ''),
    topics: u.topics.map(([title, level], index) => ({
      id: `${s.id}-${unitIndex}-${index}`,
      subjectId: s.id,
      unitIndex,
      index,
      title,
      importance: (['High','Medium','Low'].includes(level) ? level : 'Medium') as Topic['importance'],
      estimatedMinutes: level === 'High' ? 50 : level === 'Low' ? 30 : 40,
      prerequisites: []
    }))
  }));
  return {
    id: s.id, short: s.short, name: s.name, code: s.code,
    color: s.color || '#2563eb', icon: icons[s.id], exam: examById.get(s.id)!,
    units, topicCount: units.reduce((sum, unit) => sum + unit.topics.length, 0)
  };
});
export const TOPICS: Topic[] = SUBJECTS.flatMap(subject => subject.units.flatMap(unit => unit.topics));
export const SUBJECT_BY_ID = Object.fromEntries(SUBJECTS.map(subject => [subject.id, subject])) as Record<SubjectId, Subject>;
export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(topic => [topic.id, topic])) as Record<string, Topic>;

function normalizeKind(type: string): QuestionKind {
  if (type === 'MCQ' || type === 'Short' || type === 'Long' || type === 'Unverified') return type;
  return 'Unverified';
}
function getProvenance(q: RawQuestion): Provenance {
  if (!q.verifiedSource) return 'curated';
  const subject = SUBJECTS.find(s => s.id === q.s);
  const codeTokens = String(q.courseCode || '').split(/[\/;,\s]+/).filter(Boolean);
  return Number(q.semester) === 4 && Boolean(subject && codeTokens.includes(subject.code))
    ? 'current-pyq' : 'supplementary-pyq';
}
function classifyDifficulty(q: RawQuestion): Question['difficulty'] {
  if (q.difficulty === 'Easy' || q.difficulty === 'Medium' || q.difficulty === 'Hard') return q.difficulty;
  if (q.priority === 'High') return 'Medium';
  return q.type === 'Long' ? 'Hard' : 'Medium';
}
function inferTopic(q: RawQuestion): string | undefined {
  if (q.topicId && TOPIC_BY_ID[q.topicId]) return q.topicId;
  const text = q.q.toLowerCase();
  const candidates = TOPICS.filter(topic => topic.subjectId === q.s);
  return candidates.find(topic => topic.title.split(/[,:;\s(]/)[0].length > 4 && text.includes(topic.title.split(/[,:;\s(]/)[0].toLowerCase()))?.id;
}
export const QUESTIONS: Question[] = raw.questions.map(q => {
  const kind = normalizeKind(q.type);
  const options = q.o?.slice();
  const correctIndex = q.a;
  const shapeValid = kind === 'MCQ' && Boolean(options && options.length >= 2 && Number.isInteger(correctIndex) && correctIndex! >= 0 && correctIndex! < options.length);
  return {
    id: q.id, subjectId: q.s, kind, text: q.q, options, correctIndex,
    explanation: q.e, outline: q.outline, marks: q.marks,
    year: q.year, semester: q.semester, courseCode: q.courseCode, paper: q.paper,
    sourceName: q.sourceName, sourcePage: q.sourcePage, paperPage: q.paperPage,
    difficulty: classifyDifficulty(q), provenance: getProvenance(q),
    answerVerified: Boolean(shapeValid && q.answerVerified !== false && q.type !== 'Unverified'),
    topicId: inferTopic(q), importance: (q.priority === 'High' || q.priority === 'Medium' || q.priority === 'Low' ? q.priority : undefined),
    originalWording: Boolean(q.verifiedSource), tags: []
  };
});
export const MCQS = QUESTIONS.filter(q => q.kind === 'MCQ' && q.answerVerified && q.options && Number.isInteger(q.correctIndex));
export const DIAGNOSTIC_QUESTIONS: Question[] = SUBJECTS.flatMap(subject =>
  MCQS.filter(q => q.subjectId === subject.id).slice(0, 2)
);
export function getTopic(id: string): Topic | undefined { return TOPIC_BY_ID[id]; }
export function getQuestionsForTopic(topicId: string): Question[] { return QUESTIONS.filter(q => q.topicId === topicId); }
export function isArchivedSession(now = new Date()): boolean {
  return EXAMS.every(exam => dateValue(exam.date).getTime() < startOfDay(now).getTime());
}
export function dateValue(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}
export function startOfDay(date = new Date()): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
export function daysBetween(from: Date, toIsoDate: string): number {
  return Math.round((startOfDay(dateValue(toIsoDate)).getTime() - startOfDay(from).getTime()) / 86_400_000);
}
export function displayDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateValue(isoDate));
}
export function subjectProvenanceCount(subjectId: SubjectId) {
  const items = MCQS.filter(q => q.subjectId === subjectId);
  return {
    current: items.filter(q => q.provenance === 'current-pyq').length,
    supplementary: items.filter(q => q.provenance === 'supplementary-pyq').length,
    curated: items.filter(q => q.provenance === 'curated').length
  };
}
