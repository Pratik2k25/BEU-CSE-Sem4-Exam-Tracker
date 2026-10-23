import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, GraduationCap, Sparkles } from 'lucide-react';
import { DIAGNOSTIC_QUESTIONS, EXAMS, SUBJECTS, displayDate, daysBetween, type Goal, type Period, type SubjectId } from '../../data/content';
import { generateStudyPlan, rankSubjects } from '../../algorithms/planner';
import { useStudentStore } from '../../state/store';

const steps=[{title:'Welcome',hint:'Make this study desk yours'},{title:'Your exam session',hint:'Confirm the six theory papers'},{title:'Preparation estimate',hint:'Your starting point, not a mastery score'},{title:'Optional diagnostic',hint:'A short recall check'},{title:'Primary goal',hint:'Choose one direction'},{title:'Weekly availability',hint:'Plan around your real time'},{title:'Preparation analysis',hint:'See how your inputs affect the plan'},{title:'Your first plan',hint:'Review before starting'}];
const goals:{id:Goal;title:string;description:string;icon:string}[]=[
 {id:'pass',title:'Pass my exams',description:'Foundations first, broad essential coverage, approachable PYQs and exam readiness.',icon:'✓'},
 {id:'marks',title:'Score high marks',description:'Comprehensive coverage, numericals, detailed answers and challenging practice.',icon:'↗'},
 {id:'important',title:'Important topics + PYQs',description:'Prioritize high-value syllabus topics and verified past-paper evidence.',icon:'✦'},
 {id:'mastery',title:'Concept mastery',description:'Build understanding, worked examples, prerequisites and active recall.',icon:'◎'},
 {id:'revision',title:'Revision',description:'Revisit covered material, weaknesses, mistakes and spaced recall.',icon:'↻'}
];
const days=[{id:'1',label:'Monday'},{id:'2',label:'Tuesday'},{id:'3',label:'Wednesday'},{id:'4',label:'Thursday'},{id:'5',label:'Friday'},{id:'6',label:'Saturday'},{id:'0',label:'Sunday'}] as const;
const periods:Period[]=['Morning','Afternoon','Evening'];
export function OnboardingPage(){
 const navigate=useNavigate(),[search]=useSearchParams();
 const editing=search.get('edit')==='1';
 const hydrated=useStudentStore(s=>s.hydrated),profile=useStudentStore(s=>s.profile);
 const updateProfile=useStudentStore(s=>s.updateProfile),setStep=useStudentStore(s=>s.setOnboardingStep);
 const setPreparation=useStudentStore(s=>s.setPreparation),setAvailability=useStudentStore(s=>s.setAvailability);
 const saveDiagnostic=useStudentStore(s=>s.saveDiagnostic),finishOnboarding=useStudentStore(s=>s.finishOnboarding);
 const topicProgress=useStudentStore(s=>s.topicProgress),tasks=useStudentStore(s=>s.tasks),attempts=useStudentStore(s=>s.attempts);
 const [step,setLocalStep]=useState(profile.onboardingStep||0),[name,setName]=useState(profile.name);
 const [diagnosticIndex,setDiagnosticIndex]=useState(0),[diagnosticAnswers,setDiagnosticAnswers]=useState<Record<string,number>>(profile.onboardingAnswers||{});
 const [diagnosticStarted,setDiagnosticStarted]=useState(false),[diagnosticError,setDiagnosticError]=useState('');
 const [hoursView,setHoursView]=useState(false);
 useEffect(()=>{setName(profile.name);setLocalStep(profile.onboardingStep||0);setDiagnosticAnswers(profile.onboardingAnswers||{});},[profile.name,profile.onboardingStep,profile.onboardingAnswers]);
 useEffect(()=>{if(hydrated&&profile.onboardingCompleted&&!editing)navigate('/',{replace:true});},[hydrated,profile.onboardingCompleted,editing,navigate]);
 useEffect(()=>{setStep(step);},[step,setStep]);
 const nextExam=useMemo(()=>SUBJECTS.map(s=>s.exam).filter(e=>daysBetween(new Date(),e.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))[0],[step]);
 const weeklyHours=Object.values(profile.weeklyAvailability).reduce((sum,day)=>sum+day.hours,0);
 const priorities=useMemo(()=>rankSubjects({profile,topicProgress,previousTasks:tasks,attempts}),[profile,topicProgress,tasks,attempts]);
 const preview=useMemo(()=>generateStudyPlan({profile,topicProgress,previousTasks:tasks,attempts,horizonDays:7}),[profile,topicProgress,tasks,attempts]);
 const previewToday=preview.filter(t=>t.date===new Date().toLocaleDateString('en-CA')).slice(0,5);
 const actualToday=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;};
 if(!hydrated)return <div className="app-loading">Preparing your onboarding…</div>;
 if(profile.onboardingCompleted&&!editing)return <Navigate to="/" replace/>;
 const goStep=(target:number)=>{setLocalStep(Math.max(0,Math.min(7,target)));setStep(target);window.scrollTo({top:0,behavior:'smooth'});};
 const saveName=()=>{
  if(name.trim().length<2){setDiagnosticError('Enter at least two characters for your display name.');return false;}
  updateProfile({name:name.trim()},false);setDiagnosticError('');return true;
 };
 const startDiagnostic=()=>{setDiagnosticStarted(true);setDiagnosticIndex(0);setDiagnosticError('');};
 const submitDiagnostic=()=>{
  const questions=DIAGNOSTIC_QUESTIONS;const answers=diagnosticAnswers;
  const subjectScores=Object.fromEntries(SUBJECTS.map(s=>{
   const qs=questions.filter(q=>q.subjectId===s.id),correct=qs.filter(q=>answers[q.id]===q.correctIndex).length;
   return [s.id,{correct,attempted:qs.filter(q=>typeof answers[q.id]==='number').length}];
  })) as Record<SubjectId,{correct:number;attempted:number}>;
  const attempted=questions.filter(q=>typeof answers[q.id]==='number'),correct=attempted.filter(q=>answers[q.id]===q.correctIndex).length;
  if(attempted.length<questions.length){setDiagnosticError('Answer all diagnostic questions, or choose Skip diagnostic.');return;}
  saveDiagnostic({id:'diagnostic-'+Date.now(),completedAt:Date.now(),score:correct,total:questions.length,subjectScores,answers:{...answers}});
  updateProfile({onboardingAnswers:{...answers}},false);
  setDiagnosticStarted(false);setDiagnosticError('');goStep(4);
 };
 const continueForward=()=>{
  if(step===0){if(!saveName())return;goStep(1);return;}
  if(step===1){goStep(2);return;}
  if(step===2){goStep(3);return;}
  if(step===3){if(diagnosticStarted){submitDiagnostic();return;}goStep(4);return;}
  if(step===4){goStep(5);return;}
  if(step===5){goStep(6);return;}
  if(step===6){goStep(7);return;}
  finishOnboarding();navigate(editing?'/profile':'/',{replace:true});
 };
 const skipDiagnostic=()=>{setDiagnosticStarted(false);setDiagnosticError('');goStep(4);};
 const title=steps[step];
 const banner=<div className="onboarding-stepper"><div className="stepper-progress"><span style={{width:`${((step+1)/8)*100}%`}}/></div><div className="row-between"><span className="muted text-xs">STEP {step+1} OF 8</span><span className="muted text-xs">{Math.round((step+1)/8*100)}% complete</span></div><h1>{title.title}</h1><p className="muted">{title.hint}</p></div>;
 return <div className="onboarding-wrap">
  <header className="onboarding-header"><img src="./assets/logo.svg" alt="" width="42" height="42"/><div><strong>BEU Exam Prep</strong><small>{editing?'Update your plan':'Personal exam preparation'}</small></div><span className="onboarding-private">No account needed</span></header>
  <div className="onboarding-container">
   {banner}
   <section className="card onboarding-card">
    {step===0&&<div className="onboard-welcome">
      <div className="welcome-icon"><GraduationCap size={34}/></div><p className="eyebrow">BUILT FOR YOUR SEMESTER</p><h2>{editing?'Adjust your study plan':'Let’s make the remaining days count.'}</h2>
      <p className="muted">BEU Exam Prep connects your syllabus, paper dates, practice mistakes and available study hours into a realistic plan. Your information stays on this device.</p>
      <div className="field"><label htmlFor="student-name">What should we call you?</label><input id="student-name" autoComplete="name" value={name} maxLength={60} onChange={e=>{setName(e.target.value);setDiagnosticError('');}} placeholder="Enter your display name" autoFocus/><small>This is only a display name. No email, phone number or account is required.</small></div>
      {diagnosticError&&<p className="form-error" role="alert">{diagnosticError}</p>}
    </div>}
    {step===1&&<div className="onboard-section"><div className="welcome-icon"><CalendarDays size={30}/></div><h2>BEU B.Tech CSE · Semester 4</h2><p className="muted">The schedule below is read from the exam routine you supplied. Examination time: 2:00 PM–5:00 PM.</p>
      {!nextExam&&<div className="source-note">The configured October–November 2026 examination session has passed. This app will use syllabus and practice mode and will not create substitute exam dates.</div>}
      <div className="table-wrap"><table><thead><tr><th>Date</th><th>Subject</th><th>Code</th><th>Time</th></tr></thead><tbody>{EXAMS.map(e=><tr key={e.id}><td>{displayDate(e.date)}</td><td>{e.name}</td><td>{e.code}</td><td>2–5 PM</td></tr>)}</tbody></table></div>
      <p className="muted text-xs">Dates are stored in the academic configuration. Confirm later official notices before relying on them.</p>
    </div>}
    {step===2&&<div className="onboard-section"><h2>How much of each subject have you prepared?</h2><p className="muted">Estimate the portion of the syllabus you have already studied. This is self-reported preparation—not a verified mastery score.</p>
      <div className="prep-sliders">{SUBJECTS.map(s=><div className="prep-slider" key={s.id}><div className="row-between"><div><strong>{s.short}</strong><p>{s.name}</p></div><output>{profile.subjectPreparation[s.id]??0}%</output></div><input aria-label={s.name+' preparation percentage'} type="range" min="0" max="100" step="5" value={profile.subjectPreparation[s.id]??0} onChange={e=>setPreparation(s.id,Number(e.target.value) )}/><div className="range-labels"><span>Not started</span><span>Fully studied</span></div></div>)}</div>
    </div>}
    {step===3&&!diagnosticStarted&&<div className="onboard-section"><div className="welcome-icon"><Sparkles size={30}/></div><h2>Optional 12-question recall check</h2><p className="muted">Two answer-checked questions per subject give the planner a weak starting signal. The diagnostic never overwrites your subject preparation estimates.</p>
      <div className="grid grid-2"><div className="card-soft"><strong>About 4–6 minutes</strong><p className="muted text-xs">12 multiple-choice questions, 2 per subject.</p></div><div className="card-soft"><strong>Used as a small signal</strong><p className="muted text-xs">It is not a comprehensive mastery measurement or an exam prediction.</p></div></div>
      {profile.diagnostic&&<div className="source-note">Previous diagnostic: {profile.diagnostic.score}/{profile.diagnostic.total}. Retaking it will save a new result without changing your preparation percentages.</div>}
      <div className="task-actions"><button className="primary-button" onClick={startDiagnostic}>Start diagnostic <ArrowRight size={16}/></button><button className="btn" onClick={skipDiagnostic}>Skip diagnostic</button></div>
      <small className="muted">If skipped, the plan will rely more heavily on your own preparation estimates and practice history.</small>
    </div>}
    {step===3&&diagnosticStarted&&<div className="onboard-section"><div className="row-between"><span className="pill primary">DIAGNOSTIC · {diagnosticIndex+1}/{DIAGNOSTIC_QUESTIONS.length}</span><span className="muted text-xs">{DIAGNOSTIC_QUESTIONS.filter(q=>typeof diagnosticAnswers[q.id]==='number').length} answered</span></div>
      <div className="progress-track"><span className="progress-fill" style={{display:'block',width:`${(diagnosticIndex+1)/DIAGNOSTIC_QUESTIONS.length*100}%`}}/></div>
      {DIAGNOSTIC_QUESTIONS[diagnosticIndex]&&<div className="question-card" style={{marginTop:18}}><div className="question-meta"><span className="pill">{SUBJECTS.find(s=>s.id===DIAGNOSTIC_QUESTIONS[diagnosticIndex].subjectId)?.short}</span><span className="pill">Diagnostic practice</span></div><div className="question-text">{DIAGNOSTIC_QUESTIONS[diagnosticIndex].text}</div><div className="options-grid">{DIAGNOSTIC_QUESTIONS[diagnosticIndex].options?.map((option,i)=><button key={option} className={'answer-option '+(diagnosticAnswers[DIAGNOSTIC_QUESTIONS[diagnosticIndex].id]===i?'selected':'')} onClick={()=>{const q=DIAGNOSTIC_QUESTIONS[diagnosticIndex];const next={...diagnosticAnswers,[q.id]:i};setDiagnosticAnswers(next);updateProfile({onboardingAnswers:next},false);setDiagnosticError('');}}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span>{option}</span></button>)}</div></div>}
      {diagnosticError&&<p className="form-error" role="alert">{diagnosticError}</p>}
      <div className="task-actions"><button className="btn" disabled={diagnosticIndex===0} onClick={()=>setDiagnosticIndex(i=>Math.max(0,i-1))}><ArrowLeft size={15}/> Previous</button>{diagnosticIndex<DIAGNOSTIC_QUESTIONS.length-1?<button className="primary-button" onClick={()=>setDiagnosticIndex(i=>i+1)}>Next <ArrowRight size={15}/></button>:<button className="primary-button" onClick={submitDiagnostic}>Submit diagnostic <Check size={15}/></button>}</div>
      <button className="text-button" onClick={skipDiagnostic}>Skip and continue setup</button>
    </div>}
    {step===4&&<div className="onboard-section"><h2>What is your single primary goal?</h2><p className="muted">Pick one. The planner changes how it balances deadlines, coverage, important topics, weakness and revision.</p><div className="choice-grid">{goals.map(goal=><button key={goal.id} className={'choice-card '+(profile.goal===goal.id?'is-selected':'')} onClick={()=>updateProfile({goal:goal.id},false)} aria-pressed={profile.goal===goal.id}><span className="welcome-icon mini">{goal.icon}</span><span><strong>{goal.title}</strong><small>{goal.description}</small></span><span className="choice-check">{profile.goal===goal.id&&<Check size={16}/>}</span></button>)}</div></div>}
    {step===5&&<div className="onboard-section"><h2>Plan for the time you really have</h2><p className="muted">Choose focused study hours per day. Breaks are not counted as study time. Pick one or more time periods that normally suit you.</p>
      <div className="week-grid">{days.map(day=>{const availability=profile.weeklyAvailability[day.id];return <div className="week-day" key={day.id}><div className="week-day-head"><strong>{day.label}</strong><span className="pill">{availability.hours} h</span></div><div className="field"><label htmlFor={'hours-'+day.id}>Focused study hours</label><select id={'hours-'+day.id} value={availability.hours} onChange={e=>setAvailability(day.id,{...availability,hours:Number(e.target.value)})}>{Array.from({length:13},(_,i)=><option key={i} value={i}>{i} {i===1?'hour':'hours'}</option>)}</select></div><div className="period-picks">{periods.map(period=><label className="period-pick" key={period}><input type="checkbox" checked={availability.periods.includes(period)} onChange={e=>{const next=e.target.checked?[...availability.periods,period]:availability.periods.filter(p=>p!==period);setAvailability(day.id,{...availability,periods:periods.filter(p=>next.includes(p))});}}/>{period}</label>)}</div></div>;})}</div>
      <div className="banner-soft"><h2>{weeklyHours} focused hours each week</h2><p>Sessions use flexible morning, afternoon or evening blocks by default. You can edit or lock individual tasks later.</p></div>
    </div>}
    {step===6&&<div className="onboard-section"><div className="welcome-icon"><Sparkles size={30}/></div><h2>How the planner has ranked your subjects</h2><p className="muted">The current plan is calculated now from deadlines, your preparation estimates, your goal, daily capacity, topic importance and any diagnostic or practice weaknesses. The score is a planning heuristic, not a prediction of marks.</p>
      <div className="grid grid-2">{priorities.map((p,index)=>{const subject=SUBJECTS.find(s=>s.id===p.subjectId)!;return <div className="card-soft" key={p.subjectId}><div className="row-between"><strong>{index+1}. {subject.short}</strong><span className="pill primary">{Math.round(p.score*100)/100} priority</span></div><p className="muted text-xs">{subject.name}</p><div className="progress-track"><span className="progress-fill" style={{display:'block',width:`${Math.round(100*p.gap)}%`}}/></div><p className="muted text-xs">{p.gap*100|0}% estimated gap · {p.daysToExam} days until paper</p><small>{p.reasons.join(' · ')||'Steady preparation based on current inputs'}</small></div>;})}</div>
      <div className="banner-soft"><h2>{weeklyHours} hours of weekly capacity</h2><p>Only available hours are scheduled. Completed tasks and locked sessions are retained when future work is recalculated.</p></div>
    </div>}
    {step===7&&<div className="onboard-section"><div className="welcome-icon"><Check size={30}/></div><h2>{profile.name?profile.name+', your first plan is ready.':'Your first plan is ready.'}</h2><p className="muted">Review the first study blocks below. Starting saves your onboarding settings and generates the next two weeks within your availability and exam deadlines.</p>
      <div className="grid grid-2"><div className="card-soft"><p className="eyebrow">PRIMARY GOAL</p><strong>{goals.find(g=>g.id===profile.goal)?.title}</strong><p className="muted text-xs">{weeklyHours} focused hours per week</p></div><div className="card-soft"><p className="eyebrow">NEXT EXAM</p><strong>{nextExam?.name||'Practice & revision mode'}</strong><p className="muted text-xs">{nextExam?displayDate(nextExam.date)+' · '+Math.max(0,daysBetween(new Date(),nextExam.date))+' days remaining':'No future exam in the configured session.'}</p></div></div>
      <div className="section-heading"><div><h2>First-day blocks</h2><p>From your actual availability and syllabus status.</p></div></div>
      {preview.filter(t=>t.date===actualToday()).length? <div className="task-list">{preview.filter(t=>t.date===actualToday()).slice(0,6).map(t=><div className="task-row" key={t.id}><div className="task-period">{t.period}<br/>{t.durationMinutes} min</div><div><h3>{t.title}</h3><p>{SUBJECTS.find(s=>s.id===t.subjectId)?.short} · {t.kind} · {t.reason}</p></div><span className="pill">{t.priority} pts</span></div>)}</div>:<div className="empty-state"><Clock3 size={24}/><h2>Today’s availability is zero</h2><p>Your settings will be saved. You can choose another day or add hours in Profile to generate future sessions.</p></div>}
      <div className="banner-soft"><h2>How recommendations work</h2><p>Deadlines increase urgency. Lower preparation estimates increase coverage gap. Goal choice changes factor weights. Incorrect MCQs and “study again” feedback create revision tasks. No AI API or account is needed.</p></div>
    </div>}
    <div className="onboarding-actions">
      <button className="btn" onClick={()=>step===0?(editing?navigate('/profile'):undefined):goStep(step-1)} disabled={step===0&&!editing}><ArrowLeft size={15}/> {step===0?'Cancel':'Back'}</button>
      <span className="muted text-xs">{step+1} / 8</span>
      <button className="primary-button" onClick={continueForward}>{step===7?(editing?'Save and return to Profile':'Start My Preparation'):'Continue'} <ArrowRight size={16}/></button>
    </div>
   </section>
   <p className="onboarding-privacy">No login, no external upload. Your study data is stored locally in this browser. Export backups in Profile.</p>
  </div>
 </div>;
}
