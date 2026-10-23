import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Bookmark, BookOpen, ChevronRight, Clock3, FileText, Play, Sparkles } from 'lucide-react';
import { SUBJECTS, TOPICS, QUESTIONS, type SubjectId } from '../../data/content';
import { useStudentStore } from '../../state/store';
import { dateValue, daysBetween } from '../../data/content';

type ListFilter='All'|'Important'|'Weak'|'In Progress'|'Completed';
const filters:ListFilter[]=['All','Important','Weak','In Progress','Completed'];
function localCount(subjectId:SubjectId,progress:Record<string,{status:string}>){
 const topics=TOPICS.filter(t=>t.subjectId===subjectId);
 const started=topics.filter(t=>progress[t.id]&&progress[t.id].status!=='not-started').length;
 const mastered=topics.filter(t=>progress[t.id]?.status==='mastered').length;
 return {total:topics.length,started,mastered,coverage:Math.round(started/Math.max(1,topics.length)*100)};
}
export function SubjectsPage(){
 const [search,setSearch]=useState(''),[filter,setFilter]=useState<ListFilter>('All');
 const navigate=useNavigate(),profile=useStudentStore(s=>s.profile),progress=useStudentStore(s=>s.topicProgress),attempts=useStudentStore(s=>s.attempts);
 const subjectRows=SUBJECTS.map(subject=>{
  const count=localCount(subject.id,progress);
  const weak=attempts.filter(a=>a.subjectId===subject.id&&a.accuracy<70).length>0||TOPICS.some(t=>t.subjectId===subject.id&&['partial','review'].includes(progress[t.id]?.status||''));
  const important=TOPICS.some(t=>t.subjectId===subject.id&&t.importance==='High'&&progress[t.id]?.status!=='mastered');
  const inProgress=count.started>0&&count.mastered<count.total,completed=count.mastered===count.total;
  return {...subject,...count,weak,important,inProgress,completed};
 }).filter(s=>{
  const q=search.toLowerCase();
  const matches=!q||s.name.toLowerCase().includes(q)||s.code.includes(q)||s.short.toLowerCase().includes(q);
  const filterMatch=filter==='All'||(filter==='Important'&&s.important)||(filter==='Weak'&&s.weak)||(filter==='In Progress'&&s.inProgress)||(filter==='Completed'&&s.completed);
  return matches&&filterMatch;
 });
 const totalTopics=TOPICS.length,done=TOPICS.filter(t=>progress[t.id]&&progress[t.id].status!=='not-started').length;
 return <main className="page-stack">
  <section className="page-heading"><div><p className="eyebrow">SYLLABUS WORKSPACE</p><h1>My subjects</h1><p className="muted">Six theory papers · six dedicated units per subject.</p></div><span className="pill primary">{done}/{totalTopics} topics started</span></section>
  <section className="banner-soft"><div className="row-between"><div><p className="eyebrow">SEMESTER 4 · CSE</p><h2>Build coverage one topic at a time</h2><p>Topic status reflects your feedback—not simply opening a page or spending time.</p></div><div className="stat-value">{Math.round(done/Math.max(1,totalTopics)*100)}%</div></div><div className="progress-track"><span className="progress-fill" style={{display:'block',width:`${done/Math.max(1,totalTopics)*100}%`}}/></div></section>
  <div className="field"><label htmlFor="subject-search">Search subjects</label><input id="subject-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or course code…"/></div>
  <div className="filter-row" role="group" aria-label="Filter subjects">{filters.map(value=><button key={value} className={'filter-chip '+(filter===value?'active':'')} onClick={()=>setFilter(value)}>{value}</button>)}</div>
  {subjectRows.length?<div className="grid grid-3">{subjectRows.map(subject=><article className="card subject-card" key={subject.id}><div className="subject-card-top"><div className="subject-mark" style={{'--subject-color':subject.exam.color} as React.CSSProperties}>{subject.short}</div><div className="grow"><div className="subject-title">{subject.name}</div><div className="subject-code">Course code {subject.code}</div></div></div><div className="subject-meta"><span className="pill">{subject.units.length} units</span><span className="pill">{subject.total} topics</span>{subject.important&&<span className="pill warning">Important remaining</span>}{subject.weak&&<span className="pill danger">Weakness signal</span>}</div><div><div className="row-between"><span className="stat-kicker">Topic activity</span><strong>{subject.coverage}%</strong></div><div className="progress-track"><span className="progress-fill" style={{display:'block',width:`${subject.coverage}%`}}/></div></div><div className="row-between"><span className="muted text-xs">Exam: {subject.exam.date}</span><span className="muted text-xs">Self-estimate: {profile.subjectPreparation[subject.id]}%</span></div><button className="btn btn-secondary btn-full" onClick={()=>navigate('/subjects/'+subject.id)}>Continue learning <ArrowRight size={14}/></button></article>)}</div>:<div className="card empty-state"><BookOpen size={26}/><h2>No subject matches</h2><p>Try a different search or select All.</p></div>}
 </main>;
}
export function SubjectDetailPage(){
 const {subjectId}=useParams(),navigate=useNavigate();
 const subject=SUBJECTS.find(s=>s.id===subjectId),progress=useStudentStore(s=>s.topicProgress),profile=useStudentStore(s=>s.profile),tasks=useStudentStore(s=>s.tasks);
 if(!subject)return <main className="page-stack"><h1>Subject not found</h1><Link to="/subjects">Return to subjects</Link></main>;
 const topics=TOPICS.filter(t=>t.subjectId===subject.id),started=topics.filter(t=>progress[t.id]&&progress[t.id].status!=='not-started').length,mastered=topics.filter(t=>progress[t.id]?.status==='mastered').length;
 const nextTask=tasks.find(t=>t.subjectId===subject.id&&t.status==='planned');
 const days=daysBetween(new Date(),subject.exam.date);
 return <main className="page-stack">
  <div className="page-heading"><div><Link className="text-button" to="/subjects">← All subjects</Link><p className="eyebrow" style={{marginTop:8}}>COURSE {subject.code}</p><h1>{subject.name}</h1><p className="muted">{days>=0?days+' days until examination':'Configured exam date has passed'} · {subject.units.length} units</p></div><button className="btn" onClick={()=>navigate('/pyqs?subject='+subject.id)}>Related PYQs <ArrowRight size={14}/></button></div>
  <section className="hero-banner"><p className="eyebrow">{subject.short} · SUBJECT DASHBOARD</p><h1 style={{fontSize:30}}>{started} of {topics.length} topics started</h1><p>Your self-reported preparation is {profile.subjectPreparation[subject.id]}%. Topic feedback and recall results are tracked separately.</p><div className="hero-actions"><button className="primary-button" onClick={()=>navigate(nextTask?'/topics/'+nextTask.topicId:'/subjects/'+subject.id+'/units/'+subject.units[0].id)}><Play size={15}/> {nextTask?'Continue planned topic':'Start first unit'}</button><button className="btn" onClick={()=>navigate('/practice?subject='+subject.id)}>Practice this subject</button></div></section>
  <div className="stat-grid"><div className="stat-card"><div className="stat-kicker">TOPIC ACTIVITY</div><div className="stat-value">{Math.round(started/Math.max(1,topics.length)*100)}%</div><div className="stat-note">Topics started or reviewed</div></div><div className="stat-card"><div className="stat-kicker">RECALL PASSED</div><div className="stat-value">{mastered}</div><div className="stat-note">Topics with confident feedback</div></div><div className="stat-card"><div className="stat-kicker">SELF-ESTIMATE</div><div className="stat-value">{profile.subjectPreparation[subject.id]}%</div><div className="stat-note">Your own preparation estimate</div></div><div className="stat-card"><div className="stat-kicker">EXAM DATE</div><div className="stat-value" style={{fontSize:22}}>{new Date(subject.exam.date+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div><div className="stat-note">2:00–5:00 PM · {subject.code}</div></div></div>
  <div className="section-heading"><div><h2>Units</h2><p>Dedicated unit pages show every topic and related questions.</p></div></div>
  <div className="unit-grid">{subject.units.map(unit=>{const count=unit.topics.filter(t=>progress[t.id]&&progress[t.id].status!=='not-started').length;const high=unit.topics.filter(t=>t.importance==='High').length;return <button className="card unit-card" key={unit.id} onClick={()=>navigate(`/subjects/${subject.id}/units/${unit.id}`)}><div className="row-between"><span className="pill primary">UNIT {unit.index+1}</span><span className="muted text-xs">{count}/{unit.topics.length}</span></div><h3>{unit.title}</h3><p>{unit.topics.length} topics · {high} high study priority</p><div className="progress-track"><span className="progress-fill" style={{display:'block',width:`${count/Math.max(1,unit.topics.length)*100}%`}}/></div><span className="text-button">Open unit <ChevronRight size={13}/></span></button>;})}</div>
 </main>;
}
export function UnitPage(){
 const {subjectId,unitId}=useParams(),navigate=useNavigate(),progress=useStudentStore(s=>s.topicProgress),profile=useStudentStore(s=>s.profile);
 const subject=SUBJECTS.find(s=>s.id===subjectId),unit=subject?.units.find(u=>u.id===unitId);
 if(!subject||!unit)return <main className="page-stack"><h1>Unit not found</h1><Link to="/subjects">Return to subjects</Link></main>;
 return <main className="page-stack"><div className="page-heading"><div><Link className="text-button" to={'/subjects/'+subject.id}>← {subject.short}</Link><p className="eyebrow" style={{marginTop:8}}>UNIT {unit.index+1} · COURSE {subject.code}</p><h1>{unit.title}</h1><p className="muted">{unit.topics.length} syllabus topics · Subject preparation estimate {profile.subjectPreparation[subject.id]}%</p></div><button className="btn" onClick={()=>navigate('/pyqs?subject='+subject.id+'&unit='+unit.index)}>Find related questions <ArrowRight size={14}/></button></div>
  <section className="card"><div className="row-between"><div><h2 style={{margin:'0 0 4px'}}>Unit progress</h2><p className="muted text-xs">A status is recorded only after you give feedback.</p></div><strong>{unit.topics.filter(t=>progress[t.id]&&progress[t.id].status!=='not-started').length}/{unit.topics.length}</strong></div><div className="progress-track" style={{marginTop:12}}><span className="progress-fill" style={{display:'block',width:`${unit.topics.filter(t=>progress[t.id]&&progress[t.id].status!=='not-started').length/Math.max(1,unit.topics.length)*100}%`}}/></div></section>
  <div className="topic-list">{unit.topics.map(topic=>{const status=progress[topic.id]?.status||'not-started',qs=getQuestionsForTopic(topic.id);return <article className="topic-row" key={topic.id}><span className={'priority-dot '+topic.importance.toLowerCase()}/><div className="grow" role="button" tabIndex={0} onClick={()=>navigate('/topics/'+topic.id)} onKeyDown={e=>{if(e.key==='Enter')navigate('/topics/'+topic.id);}}><h3>{topic.title}</h3><p>{topic.importance} study priority · {topic.estimatedMinutes} minute starter block · {qs.length} linked questions</p></div><div className="topic-actions"><span className="pill">{status.replace('-',' ')}</span><button className="btn btn-small" onClick={()=>navigate('/topics/'+topic.id)}>Study <ArrowRight size={12}/></button></div></article>;})}</div>
 </main>;
}
export function TopicPage(){
 const {topicId}=useParams(),navigate=useNavigate();
 const topic=TOPICS.find(t=>t.id===topicId),progress=useStudentStore(s=>s.topicProgress),setFeedback=useStudentStore(s=>s.setTopicFeedback),bookmarks=useStudentStore(s=>s.bookmarks),toggleBookmark=useStudentStore(s=>s.toggleBookmark);
 const questions=useMemo(()=>topic?QUESTIONS.filter(q=>q.subjectId===topic.subjectId&&q.topicId===topic.id):[],[topic?.id,topic?.subjectId]);
 const startFocus=useStudentStore(s=>s.startFocus),activeSessionId=useStudentStore(s=>s.activeSessionId),sessions=useStudentStore(s=>s.sessions);
 const notes=useStudentStore(s=>s.notes);
 if(!topic)return <main className="page-stack"><h1>Topic not found</h1><Link to="/subjects">Return to subjects</Link></main>;
 const subject=SUBJECTS.find(s=>s.id===topic.subjectId)!,unit=subject.units[topic.unitIndex],status=progress[topic.id]?.status||'not-started',feedback=progress[topic.id]?.feedback;
 const saved=bookmarks.includes(topic.id),activeSession=sessions.find(s=>s.id===activeSessionId);
 const noteCount=notes.filter(n=>n.topicId===topic.id).length;
 const chooseFeedback=(value:'understood'|'partial'|'again')=>{
  setFeedback(topic.id,value==='understood'?'mastered':value==='partial'?'partial':'review',value);
 };
 return <main className="page-stack">
  <div className="page-heading"><div><Link className="text-button" to={'/subjects/'+subject.id}>← {subject.short}</Link><p className="eyebrow" style={{marginTop:8}}>UNIT {topic.unitIndex+1} · {subject.code}</p><h1>{topic.title}</h1><p className="muted">{subject.name} · {unit.title}</p></div><div className="task-actions"><button className="btn" onClick={()=>toggleBookmark(topic.id)}><Bookmark size={15}/>{saved?'Saved':'Save topic'}</button><button className="btn" onClick={()=>navigate('/notes?topic='+topic.id)}>Personal notes ({noteCount})</button></div></div>
  <section className="card"><div className="row-between"><div><p className="eyebrow">LEARNING STATUS</p><h2 style={{fontSize:20,margin:'0 0 6px'}}>{status==='mastered'?'Recall passed':status==='review'?'Need to study again':status==='partial'?'Partially understood':status==='learning'?'In progress':'Not started'}</h2><p className="muted text-xs">Importance labels are study guidance, not official BEU marks weighting.</p></div><div className="topic-meta"><span className={'pill '+(topic.importance==='High'?'danger':topic.importance==='Medium'?'warning':'')}>{topic.importance} priority</span><span className="pill"><Clock3 size={11}/> {topic.estimatedMinutes} min starter block</span></div></div>
   <div className="task-actions" style={{marginTop:12}}><button className="primary-button" onClick={()=>activeSession?.topicId===topic.id?navigate('/planner'):startFocus(undefined,topic.id,topic.subjectId)}><Play size={14}/>{activeSession?.topicId===topic.id?'Focus session active':'Start focus timer'}</button><button className="btn" onClick={()=>navigate('/practice?subject='+topic.subjectId+'&topic='+topic.id)}>Practise related MCQs</button><button className="btn" onClick={()=>navigate('/resources?subject='+topic.subjectId+'&topic='+topic.id)}>Attach PDF reference</button></div>
  </section>
  <section className="card"><p className="eyebrow">TOPIC READER</p><h2 style={{fontSize:19,margin:'0 0 9px'}}>Study guide</h2><p className="muted">The supplied syllabus identifies this as a topic; the source PDF does not include a complete textbook-style note for every topic. Use the guide below as a learning checklist, not as a verbatim university model answer.</p>
   <div className="topic-reading-block"><h3>1. Establish the concept</h3><p>Write the formal definition of <strong>{topic.title}</strong> in your own words. List every important term and symbol and make sure you can explain each without looking at notes.</p></div>
   <div className="topic-reading-block"><h3>2. Build a worked example</h3><p>For a technical or numerical topic, solve one small example with each step labelled. For a theory topic, draw the structure or comparison table and explain how each part contributes to the whole.</p></div>
   <div className="topic-reading-block"><h3>3. Prepare an exam response</h3><ul><li>Start with a direct definition or purpose.</li><li>Show a labelled diagram, algorithm, equations or key distinctions where the question requires them.</li><li>Explain operation or reasoning in ordered steps.</li><li>Close with an example, application, complexity or limitation as applicable.</li></ul></div>
   <div className="topic-reading-block"><h3>4. Test recall before rereading</h3><p>Close your notes and reproduce the definition, diagram or solution from memory. Check your omissions against the syllabus and then try a related question without prompts.</p></div>
  </section>
  <section className="card"><div className="row-between"><div><p className="eyebrow">YOUR UNDERSTANDING</p><h2 style={{fontSize:19,margin:'0 0 6px'}}>How well did this session go?</h2><p className="muted text-xs">This is self-reported feedback. Mastery and exam readiness need repeated recall.</p></div><Sparkles size={22} color="var(--primary)"/></div>
   <div className="choice-grid" style={{marginTop:12}}><button className={'choice-card '+(feedback==='understood'?'is-selected':'')} onClick={()=>chooseFeedback('understood')}><span className="welcome-icon mini">✓</span><span><strong>Understood well</strong><small>I can explain or work through it without notes.</small></span></button><button className={'choice-card '+(feedback==='partial'?'is-selected':'')} onClick={()=>chooseFeedback('partial')}><span className="welcome-icon mini">~</span><span><strong>Partially understood</strong><small>I need one more example or focused review.</small></span></button><button className={'choice-card '+(feedback==='again'?'is-selected':'')} onClick={()=>chooseFeedback('again')}><span className="welcome-icon mini">↻</span><span><strong>Need to study again</strong><small>Put this topic into the revision queue now.</small></span></button></div>
   {feedback&&<p className="answer-feedback" style={{marginTop:12}}>{feedback==='understood'?'Confident recall recorded. A later spaced recall is scheduled.':feedback==='partial'?'Partial understanding recorded. The planner will prioritize another revision.':'Revision requested. The topic has been added to the due queue.'}</p>}
  </section>
  <section className="page-stack"><div className="section-heading"><div><h2>Related question-bank entries</h2><p>Only questions mapped to this topic are shown here.</p></div><button className="text-button" onClick={()=>navigate('/pyqs?subject='+subject.id)}>Browse all PYQs</button></div>
   {questions.length?questions.slice(0,8).map(q=><article className="card" key={q.id}><div className="question-meta"><span className="pill">{q.kind}</span><span className={'pill '+(q.provenance==='current-pyq'?'success':q.provenance==='supplementary-pyq'?'warning':'')}>{q.provenance==='current-pyq'?'4th-semester PYQ':q.provenance==='supplementary-pyq'?'Supplementary paper':'Curated practice'}</span>{q.year&&<span className="pill">{q.year}</span>}</div><p className="question-text" style={{margin:'10px 0'}}>{q.text}</p><button className="btn btn-small" onClick={()=>navigate('/pyqs/'+q.id)}>Open question <ArrowRight size={12}/></button></article>):<div className="card empty-state"><FileText size={24}/><h2>No direct question mapping yet</h2><p>The source scans contain questions for this subject, but not every one has a verified topic mapping. Browse by subject and unit instead.</p><button className="btn btn-secondary" onClick={()=>navigate('/pyqs?subject='+subject.id)}>Browse {subject.short} bank</button></div>}
  </section>
 </main>;
}
