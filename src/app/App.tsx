import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStudentStore } from '../state/store';
import { AppShell } from '../components/AppShell';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { HomePage } from '../features/home/HomePage';
import { SubjectsPage, SubjectDetailPage, UnitPage, TopicPage } from '../features/subjects/SubjectsPage';
import { PyqsPage, QuestionPage } from '../features/pyqs/PyqsPage';
import { PracticePage, PracticeResultPage } from '../features/practice/PracticePage';
import { PlannerPage } from '../features/planner/PlannerPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { NotesPage } from '../features/notes/NotesPage';
import { ResourcesPage } from '../features/resources/ResourcesPage';
import { RevisionPage } from '../features/revision/RevisionPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { HelpPage } from '../features/misc/HelpPage';
import { EXAMS, SUBJECTS, TOPICS } from '../data/content';

function SetupGuard({ children }: { children: React.ReactNode }) {
  const ready = useStudentStore(state => state.hydrated);
  const complete = useStudentStore(state => state.profile.onboardingCompleted);
  const location = useLocation();
  if (!ready) return <div className="app-loading"><img src="./assets/logo.svg" alt="" /><span>Opening your study desk…</span></div>;
  if (!complete) return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  return children;
}
function ExamListPage() {
  return <main className="page-stack"><section className="page-heading"><div><p className="eyebrow">ACADEMIC CALENDAR</p><h1>Exam schedule</h1><p className="muted">Dates are taken from the exam routine you supplied.</p></div></section>
    <div className="card-list">{EXAMS.map(exam=><article className="card exam-card" key={exam.id}><div className="subject-mark" style={{'--subject-color':exam.color} as React.CSSProperties}>{exam.id}</div><div className="grow"><strong>{exam.name}</strong><p className="muted">Code {exam.code} · 2:00–5:00 PM</p></div><time>{new Date(exam.date+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</time></article>)}</div>
  </main>;
}
function SavedPage(){const bookmarks=useStudentStore(s=>s.bookmarks);return <main className="page-stack"><section className="page-heading"><div><p className="eyebrow">SAVED MATERIAL</p><h1>Bookmarks</h1></div></section><section className="card"><p className="muted">Saved IDs</p>{bookmarks.length?bookmarks.map(id=><div className="list-row" key={id}><span>{id}</span></div>):<p>You haven’t saved any questions or topics yet.</p>}</section></main>;}
export default function App(){
 const ready=useStudentStore(s=>s.hydrated);
 return <Routes>
  <Route path="/onboarding" element={ready?<OnboardingPage/>:<div className="app-loading">Opening your study desk…</div>} />
  <Route element={<SetupGuard><AppShell/></SetupGuard>}>
   <Route path="/" element={<HomePage/>}/>
   <Route path="/subjects" element={<SubjectsPage/>}/>
   <Route path="/subjects/:subjectId" element={<SubjectDetailPage/>}/>
   <Route path="/subjects/:subjectId/units/:unitId" element={<UnitPage/>}/>
   <Route path="/topics/:topicId" element={<TopicPage/>}/>
   <Route path="/pyqs" element={<PyqsPage/>}/>
   <Route path="/pyqs/:questionId" element={<QuestionPage/>}/>
   <Route path="/practice" element={<PracticePage/>}/>
   <Route path="/practice/session/:sessionId" element={<PracticePage/>}/>
   <Route path="/practice/results/:attemptId" element={<PracticeResultPage/>}/>
   <Route path="/planner" element={<PlannerPage/>}/>
   <Route path="/profile" element={<ProfilePage/>}/>
   <Route path="/settings" element={<Navigate to="/profile" replace/>}/>
   <Route path="/notes" element={<NotesPage/>}/>
   <Route path="/resources" element={<ResourcesPage/>}/>
   <Route path="/revision" element={<RevisionPage/>}/>
   <Route path="/progress" element={<ProgressPage/>}/>
   <Route path="/exams" element={<ExamListPage/>}/>
   <Route path="/saved" element={<SavedPage/>}/>
   <Route path="/help" element={<HelpPage/>}/>
   <Route path="*" element={<Navigate to="/" replace/>}/>
  </Route>
 </Routes>;
}
