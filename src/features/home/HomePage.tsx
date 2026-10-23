import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Flame, Play, RotateCcw, Target } from 'lucide-react';
import { EXAMS, SUBJECTS, TOPICS, daysBetween, displayDate, isArchivedSession } from '../../data/content';
import { useStudentStore } from '../../state/store';
import type { StudyTask } from '../../database/db';

function todayIso(){
 const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function greeting(name:string){
 const hour=new Date().getHours();const time=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
 return name?time+', '+name:time;
}
function pct(n:number){return Math.max(0,Math.min(100,Math.round(n)));}
function Stat({label,value,caption,icon:Icon}:{label:string;value:string;caption:string;icon:typeof Clock3}){
 return <article className="stat-card"><div className="row-between"><span className="stat-kicker">{label}</span><Icon size={17} color="var(--primary)"/></div><div className="stat-value">{value}</div><div className="stat-note">{caption}</div></article>;
}
export function HomePage(){
 const navigate=useNavigate();
 const profile=useStudentStore(s=>s.profile),tasks=useStudentStore(s=>s.tasks),topicProgress=useStudentStore(s=>s.topicProgress);
 const sessions=useStudentStore(s=>s.sessions),attempts=useStudentStore(s=>s.attempts),startFocus=useStudentStore(s=>s.startFocus);
 const dueRevisions=useStudentStore(s=>s.revisions.filter(r=>!r.completedAt&&r.dueAt<=todayIso()));
 const today=todayIso(),dayNumber=String(new Date().getDay()) as keyof typeof profile.weeklyAvailability;
 const todayTasks=tasks.filter(t=>t.date===today).sort((a,b)=>Number(b.status==='completed')-Number(a.status==='completed')||b.priority-a.priority);
 const scheduledMinutes=todayTasks.filter(t=>t.status!=='completed').reduce((sum,t)=>sum+t.durationMinutes,0);
 const completedToday=todayTasks.filter(t=>t.status==='completed').length;
 const actualSeconds=sessions.filter(s=>new Date(s.startedAt).toLocaleDateString('en-CA')===today).reduce((sum,s)=>sum+s.focusedSeconds,0);
 const minutesActual=Math.round(actualSeconds/60);
 const availableMinutes=(profile.weeklyAvailability[dayNumber]?.hours||0)*60;
 const topicDone=TOPICS.filter(t=>['learning','partial','review','mastered'].includes(topicProgress[t.id]?.status||'not-started')).length;
 const topicMastered=TOPICS.filter(t=>topicProgress[t.id]?.status==='mastered').length;
 const coverage=pct(topicDone/Math.max(1,TOPICS.length)*100);
 const upcoming=useMemo(()=>EXAMS.map(e=>({...e,days:daysBetween(new Date(),e.date)}).filter(e=>e.days>=0).sort((a,b)=>a.date.localeCompare(b.date))[0],[today]);
 const subjectCoverage=SUBJECTS.map(subject=>{
  const all=TOPICS.filter(t=>t.subjectId===subject.id),done=all.filter(t=>['learning','partial','review','mastered'].includes(topicProgress[t.id]?.status||'not-started')).length;
  return {...subject,coverage:pct(done/Math.max(1,all.length)*100)};
 });
 const activeTask=todayTasks.find(t=>t.status!=='completed'&&t.status!=='missed')||tasks.filter(t=>t.status==='planned'&&t.date>today).sort((a,b)=>a.date.localeCompare(b.date)||b.priority-a.priority)[0];
 const currentAttempt=attempts[attempts.length-1];
 const startTask=(task:StudyTask)=>{
  startFocus(task.id,task.topicId,task.subjectId);
  if(task.kind==='MCQ practice')navigate(`/practice?subject=${task.subjectId}&topic=${task.topicId}`);
  else if(task.kind==='Revision'||task.kind==='Recall')navigate(`/revision?topic=${task.topicId}`);
  else navigate(`/topics/${task.topicId}`);
 };
 const greetingText=greeting(profile.name);
 const archive=isArchivedSession();
 return <main className="page-stack">
  <section className="hero-banner"><p className="eyebrow">YOUR SEMESTER, WELL PLANNED</p><h1>{greetingText}.</h1><p>One realistic study block at a time. Your syllabus progress, practice results and notes stay on this device.</p>
   <div className="hero-actions"><button className="primary-button" onClick={()=>navigate('/planner')}>View today’s plan <ArrowRight size={16}/></button><button className="btn" onClick={()=>navigate('/subjects')}>Continue a subject</button></div>
  </section>
  {archive?<section className="banner-soft"><h2>Exam-session practice mode</h2><p>The configured 29 October–7 November 2026 exam session is over. The app won’t create replacement dates; use the syllabus, PYQs and revision tools for ongoing practice.</p></section>:upcoming&&<section className="card next-exam-card"><div className="row"><div className="subject-mark" style={{'--subject-color':upcoming.color} as React.CSSProperties}><CalendarDays size={20}/></div><div className="grow"><p className="eyebrow">NEXT EXAMINATION</p><h2>{upcoming.name}</h2><p className="muted">Course {upcoming.code} · {displayDate(upcoming.date)} · 2:00–5:00 PM</p></div></div><div className="exam-countdown"><strong>{upcoming.days===0?'Today':upcoming.days}</strong><span>{upcoming.days===0?'EXAM DAY':'DAYS LEFT'}</span></div></section>}
  <section className="stat-grid">
   <Stat label="TOPIC COVERAGE" value={coverage+'%'} caption={topicDone+' of '+TOPICS.length+' topics started or reviewed'} icon={BookOpen}/>
   <Stat label="TODAY’S FOCUS" value={Math.round(availableMinutes/60)+' h'} caption={Math.max(0,Math.round((availableMinutes-scheduledMinutes)/60))+' h capacity left after planned blocks'} icon={Clock3}/>
   <Stat label="ACTUAL STUDY" value={minutesActual>=60?Math.floor(minutesActual/60)+'h '+minutesActual%60+'m':minutesActual+'m'} caption="Counted from recorded focus sessions" icon={Flame}/>
   <Stat label="RECALL PASSED" value={topicMastered.toString()} caption={dueRevisions.length+' revision(s) due now'} icon={Target}/>
  </section>
  <section className="page-stack">
   <div className="section-heading"><div><h2>{activeTask?'Continue studying':'Today’s tasks'}</h2><p>{todayTasks.length} task(s) scheduled · {completedToday} completed</p></div><button className="text-button" onClick={()=>navigate('/planner')}>View all <ArrowRight size={14}/></button></div>
   {activeTask&&<article className="card continue-card"><div className="row-between"><span className="pill primary">NEXT UP · {activeTask.durationMinutes} MIN</span><span className="pill">{activeTask.priority} priority</span></div><div><p className="eyebrow">{SUBJECTS.find(s=>s.id===activeTask.subjectId)?.short} · {activeTask.kind}</p><h2>{activeTask.title}</h2><p className="muted">{activeTask.reason}</p></div><div className="task-actions"><button className="primary-button" onClick={()=>startTask(activeTask)}><Play size={15}/> Start block</button><button className="btn" onClick={()=>navigate('/topics/'+activeTask.topicId)}>Open topic</button></div></article>}
   {todayTasks.length?<div className="task-list">{todayTasks.slice(0,5).map(task=><article key={task.id} className="task-row"><div className="task-period">{task.period}<br/>{task.durationMinutes} min</div><div><h3>{task.title}</h3><p>{SUBJECTS.find(s=>s.id===task.subjectId)?.short} · {task.kind} · {task.status==='completed'?'Completed':task.reason}</p></div><div className="task-actions">{task.status==='completed'?<span className="pill success"><CheckCircle2 size={11}/> Done</span>:<button className="btn btn-small" onClick={()=>startTask(task)}>Start</button>}</div></article>)}</div>:<div className="card empty-state"><Clock3 size={27}/><h2>No task scheduled for today</h2><p>Your availability is zero or the configured exam session has ended. Add hours in Profile or start any subject directly.</p><button className="btn btn-secondary" onClick={()=>navigate('/planner')}>Open planner</button></div>}
  </section>
  <section className="page-stack"><div className="section-heading"><div><h2>Subject preparation</h2><p>Self-reported preparation stays separate from demonstrated topic feedback.</p></div><button className="text-button" onClick={()=>navigate('/subjects')}>All subjects <ArrowRight size={14}/></button></div>
   <div className="grid grid-2">{subjectCoverage.map(subject=><button className="card subject-card subject-home-button" key={subject.id} onClick={()=>navigate('/subjects/'+subject.id)}><div className="subject-card-top"><div className="subject-mark" style={{'--subject-color':subject.exam.color} as React.CSSProperties}>{subject.short}</div><div className="grow"><div className="subject-title">{subject.name}</div><div className="subject-code">{subject.code} · {subject.exam.date}</div></div><strong>{profile.subjectPreparation[subject.id]??0}%</strong></div><div className="progress-track"><span className="progress-fill" style={{display:'block',width:`${subjectCoverage.find(x=>x.id===subject.id)?.coverage||0}%`}}/></div><div className="row-between"><span className="muted text-xs">{subjectCoverage.find(x=>x.id===subject.id)?.coverage}% topic activity</span><span className="text-button">Open <ArrowRight size={12}/></span></div></button>)}</div>
  </section>
  <section className="grid grid-2">
   <article className="card"><div className="row-between"><div><p className="eyebrow">PRACTICE RESULTS</p><h2 style={{margin:'0 0 6px',fontSize:18}}>Latest MCQ attempt</h2></div><Target size={20} color="var(--primary)"/></div>{currentAttempt?<><div className="row" style={{alignItems:'baseline',gap:8}}><strong style={{fontSize:32,letterSpacing:'-.05em'}}>{currentAttempt.scorePercent}%</strong><span className="muted text-xs">{currentAttempt.correct}/{currentAttempt.total} correct</span></div><p className="muted text-xs">Accuracy is calculated on attempted questions; score includes skipped answers.</p></>:<p className="muted text-sm">No attempts yet. Try a 10-question set to find your weak topics.</p>}<button className="btn btn-secondary" onClick={()=>navigate('/practice')}>{currentAttempt?'Continue practising':'Start MCQ practice'} <ArrowRight size={14}/></button></article>
   <article className="card"><div className="row-between"><div><p className="eyebrow">REVISION QUEUE</p><h2 style={{margin:'0 0 6px',fontSize:18}}>Keep recall active</h2></div><RotateCcw size={20} color="var(--teal)"/></div><div className="stat-value">{dueRevisions.length}</div><p className="muted text-xs">Due revisions from incorrect answers and self-reported understanding.</p><button className="btn btn-secondary" onClick={()=>navigate('/revision')}>Review due topics <ArrowRight size={14}/></button></article>
  </section>
 </main>;
}
