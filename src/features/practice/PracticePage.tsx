import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Clock3, FileText, Flag, Play, RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { MCQS, QUESTIONS, SUBJECTS, TOPICS, type Question, type SubjectId, type Provenance } from '../../data/content';
import { useStudentStore } from '../../state/store';
import type { ActivePractice } from '../../state/store';
import type { PracticeAttempt } from '../../database/db';

type SourceFilter='all'|'current-pyq'|'supplementary-pyq'|'curated';
type QueueFilter='all'|'incorrect'|'bookmarked'|'unanswered';
const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function shuffle<T>(list:T[]):T[]{const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function sourceLabel(provenance:Provenance){return provenance==='current-pyq'?'Current 4th-semester PYQ':provenance==='supplementary-pyq'?'Supplementary past paper':'Curated practice';}
function sourceClass(provenance:Provenance){return provenance==='current-pyq'?'success':provenance==='supplementary-pyq'?'warning':'';}
function attemptsQuestion(a:PracticeAttempt,qid:string){return a.questionIds.includes(qid);}
function lastAttempt(questionId:string,attempts:PracticeAttempt[]){
 return attempts.slice().reverse().find(a=>attemptsQuestion(a,questionId));
}
function answerIsWrong(q:Question,attempts:PracticeAttempt[]){
 const attempt=lastAttempt(q.id,attempts);if(!attempt)return false;
 const answer=attempt.answers[q.id],saved=attempt.items?.find(item=>item.id===q.id);
 return typeof answer==='number'&&saved?.correctIndex!==undefined&&answer!==saved.correctIndex;
}
function questionUnit(q:Question){const topic=TOPICS.find(t=>t.id===q.topicId);return topic?topic.unitIndex:null;}
function shuffleOptions(question:Question):Question{
 if(!question.options||question.correctIndex===undefined)return question;
 const rows=shuffle(question.options.map((text,index)=>({text,index})));
 return {...question,options:rows.map(row=>row.text),correctIndex:rows.findIndex(row=>row.index===question.correctIndex)};
}
function createAttempt(session:ActivePractice):PracticeAttempt{
 const items=session.items,answers=session.answers;
 const attempted=items.filter(q=>typeof answers[q.id]==='number');
 const correct=attempted.filter(q=>answers[q.id]===q.correctIndex).length;
 const topicPerformance:PracticeAttempt['topicPerformance']={};
 items.forEach(q=>{
  const key=q.topicId||q.subjectId;
  const result=topicPerformance[key]||{attempted:0,correct:0,incorrect:0};
  if(typeof answers[q.id]==='number'){result.attempted++;if(answers[q.id]===q.correctIndex)result.correct++;else result.incorrect++;}
  topicPerformance[key]=result;
 });
 return {id:'mcq-'+Date.now(),date:todayIso(),subjectId:session.subjectId,total:items.length,attempted:attempted.length,correct,
  incorrect:attempted.length-correct,unanswered:items.length-attempted.length,accuracy:attempted.length?Math.round(correct/attempted.length*100):0,
  scorePercent:items.length?Math.round(correct/items.length*100):0,durationSeconds:Math.max(0,Math.round((Date.now()-session.startedAt)/1000)),
  timed:session.timed,questionIds:items.map(q=>q.id),answers:{...answers},topicPerformance,items};
}
export function PracticePage(){
 const [params]=useSearchParams(),navigate=useNavigate();
 const active=useStudentStore(s=>s.activePractice),setActive=useStudentStore(s=>s.setActivePractice),attempts=useStudentStore(s=>s.attempts),bookmarks=useStudentStore(s=>s.bookmarks);
 const addAttempt=useStudentStore(s=>s.addAttempt),toggleBookmark=useStudentStore(s=>s.toggleBookmark),revisions=useStudentStore(s=>s.revisions);
 const [subject,setSubject]=useState(params.get('subject')||'ALL'),[unit,setUnit]=useState(params.get('unit')||'ALL');
 const [topic,setTopic]=useState(params.get('topic')||'ALL'),[year,setYear]=useState('ALL'),[difficulty,setDifficulty]=useState('ALL');
 const [source,setSource]=useState<SourceFilter>('all'),[queue,setQueue]=useState<QueueFilter>('all'),[count,setCount]=useState('10');
 const [timed,setTimed]=useState(false),[minutes,setMinutes]=useState(30),[shuffleAnswers,setShuffleAnswers]=useState(false),[seconds,setSeconds]=useState(0);
 const [filterSearch,setFilterSearch]=useState(''),[error,setError]=useState('');
 const finishGuard=useRef(false);
 const validBank=MCQS.filter(q=>q.answerVerified&&q.options&&Number.isInteger(q.correctIndex)&&q.correctIndex!>=0&&q.correctIndex!<q.options.length);
 const years=[...new Set(validBank.map(q=>q.year).filter((y):y is number=>typeof y==='number'))].sort((a,b)=>b-a);
 const available=useMemo(()=>validBank.filter(q=>{
  const unitIndex=questionUnit(q);
  if(subject!=='ALL'&&q.subjectId!==subject)return false;
  if(unit!=='ALL'&&String(unitIndex)!==unit)return false;
  if(topic!=='ALL'&&q.topicId!==topic)return false;
  if(year!=='ALL'&&String(q.year||'UNVERIFIED')!==year)return false;
  if(difficulty!=='ALL'&&q.difficulty!==difficulty)return false;
  if(source!=='all'&&q.provenance!==source)return false;
  if(filterSearch&&!q.text.toLowerCase().includes(filterSearch.toLowerCase()))return false;
  if(queue==='bookmarked'&&!bookmarks.includes(q.id))return false;
  if(queue==='unanswered'&&attempts.some(a=>attemptsQuestion(a,q.id)))return false;
  if(queue==='incorrect'&&!answerIsWrong(q,attempts))return false;
  return true;
 }),[validBank,subject,unit,topic,year,difficulty,source,filterSearch,queue,bookmarks,attempts]);
 const sourceCounts={current:validBank.filter(q=>q.provenance==='current-pyq').length,supplementary:validBank.filter(q=>q.provenance==='supplementary-pyq').length,curated:validBank.filter(q=>q.provenance==='curated').length};
 const unitOptions=SUBJECTS.filter(s=>subject==='ALL'||s.id===subject).flatMap(s=>s.units.map(u=>({value:String(u.index),label:s.short+' · Unit '+(u.index+1)+' — '+u.title,subjectId:s.id})));
 const topicOptions=TOPICS.filter(t=>(subject==='ALL'||t.subjectId===subject)&&(unit==='ALL'||t.unitIndex===Number(unit)));
 const activeQuestion=active?.items[active.index];
 useEffect(()=>{
  if(!active||active.status!=='running'||!active.timed||!active.deadlineAt)return;
  const tick=()=>{const remaining=Math.max(0,Math.ceil((active.deadlineAt!-Date.now())/1000));setSeconds(remaining);if(remaining===0&&!finishGuard.current){finishGuard.current=true;const attempt=createAttempt(active);addAttempt(attempt);navigate('/practice/results/'+attempt.id,{replace:true});}};
  tick();const timer=window.setInterval(tick,1000);return()=>window.clearInterval(timer);
 },[active?.id,active?.status,active?.deadlineAt,active?.timed,active?.answers,active?.index,addAttempt,navigate]);
 const start=()=>{
  setError('');
  if(!available.length){setError('No answer-checked questions match these filters. Clear a filter or include supplementary and curated practice.');return;}
  const requested=count==='ALL'?available.length:Number(count),selected=shuffle(available).slice(0,Math.min(available.length,requested));
  const items=selected.map(q=>shuffleAnswers?shuffleOptions(q):q);
  const now=Date.now();
  const session:ActivePractice={id:'session-'+now,subjectId:subject as SubjectId|'ALL',items,answers:{},index:0,startedAt:now,lastSavedAt:now,
   timed,timeLimitMinutes:timed?minutes:undefined,deadlineAt:timed?now+minutes*60_000:undefined,status:'running',
   filters:{subject,unit,topic,year,difficulty,source,queue,count,shuffleAnswers}};
  finishGuard.current=false;setActive(session);navigate('/practice/session/'+session.id);
 };
 const finalize=(force=false)=>{
  if(!active||finishGuard.current)return;
  const unanswered=active.items.filter(q=>typeof active.answers[q.id]!=='number').length;
  if(!force&&unanswered&& !window.confirm('There are '+unanswered+' unanswered question(s). Submit and reveal the correct answers?'))return;
  finishGuard.current=true;
  const attempt=createAttempt(active);addAttempt(attempt);navigate('/practice/results/'+attempt.id);
 };
 const setAnswer=(q:Question,answer:number)=>{
  if(!active)return;
  setActive({...active,answers:{...active.answers,[q.id]:answer},lastSavedAt:Date.now()});
 };
 const jump=(index:number)=>{if(active)setActive({...active,index:Math.max(0,Math.min(active.items.length-1,index)),lastSavedAt:Date.now()});};
 if(active&&active.status==='paused')return <main className="page-stack"><section className="page-heading"><div><p className="eyebrow">SAVED PRACTICE</p><h1>Resume your MCQ set</h1><p className="muted">Your answers are saved locally. The countdown is preserved.</p></div></section><section className="card"><h2>{active.items.length} questions · {active.subjectId==='ALL'?'All subjects':SUBJECTS.find(s=>s.id===active.subjectId)?.short}</h2><p className="muted text-sm">{Object.keys(active.answers).length} answered · {active.timed?'Timed':'Untimed'}</p><div className="task-actions"><button className="primary-button" onClick={()=>setActive({...active,status:'running',deadlineAt:active.timed?Date.now()+(active.pausedRemainingMs||minutes*60_000):undefined})}><Play size={15}/> Resume</button><button className="btn" onClick={()=>{setActive(null);navigate('/practice');}}>Discard set</button></div></section></main>;
 if(active&&activeQuestion&&active.status==='running')return <main className="page-stack practice-session">
  <div className="page-heading"><div><p className="eyebrow">MCQ PRACTICE SESSION</p><h1>Question {active.index+1} of {active.items.length}</h1><p className="muted">Answer changes are saved locally. You can skip and revisit before submitting.</p></div><div className="task-actions">{active.timed&&<span className={'pill '+(seconds<60?'danger':'primary')}><Clock3 size={13}/>{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</span>}<button className="btn btn-small" onClick={()=>{setActive({...active,status:'paused',pausedRemainingMs:active.deadlineAt?Math.max(0,active.deadlineAt-Date.now()):undefined,deadlineAt:undefined});navigate('/practice');}}>Save & exit</button></div></div>
  <section className="card"><div className="row-between"><div className="question-meta"><span className="pill">{SUBJECTS.find(s=>s.id===activeQuestion.subjectId)?.short}</span><span className={'pill '+sourceClass(activeQuestion.provenance)}>{sourceLabel(activeQuestion.provenance)}</span>{activeQuestion.year&&<span className="pill">{activeQuestion.year}</span>}</div><button className="btn btn-small" onClick={()=>toggleBookmark(activeQuestion.id)}><Bookmark size={13}/>{bookmarks.includes(activeQuestion.id)?'Saved':'Bookmark'}</button></div>
   <p className="question-text" style={{fontSize:17,margin:'16px 0'}}>{activeQuestion.text}</p>
   <div className="options-grid">{activeQuestion.options?.map((option,i)=><button key={i} className={'answer-option '+(active.answers[activeQuestion.id]===i?'selected':'')} aria-pressed={active.answers[activeQuestion.id]===i} onClick={()=>setAnswer(activeQuestion,i)}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span>{option}</span></button>)}</div>
   <div className="question-navigator" style={{marginTop:18}}>{active.items.map((q,i)=><button key={q.id} className={'question-number '+(i===active.index?'current ':'')+(typeof active.answers[q.id]==='number'?'answered':'')} onClick={()=>jump(i)} aria-label={'Go to question '+(i+1)}>{i+1}</button>)}</div>
   <div className="row-between" style={{marginTop:10}}><span className="muted text-xs">{Object.values(active.answers).filter(v=>typeof v==='number').length}/{active.items.length} answered</span><span className="muted text-xs">{active.items.length-Object.keys(active.answers).length} pending</span></div>
   <div className="task-actions" style={{justifyContent:'space-between',marginTop:18}}><button className="btn" onClick={()=>jump(active.index-1)} disabled={active.index===0}><ArrowLeft size={14}/> Previous</button><div className="task-actions"><button className="btn" onClick={()=>jump(active.index+1)} disabled={active.index===active.items.length-1}>Skip / Next <ArrowRight size={14}/></button><button className="primary-button" onClick={()=>finalize(false)}><Flag size={14}/> Submit set</button></div></div>
  </section>
  <p className="muted text-xs">Answers are hidden until submission. Current-course PYQs, supplementary papers and curated practice remain identified in the review.</p>
 </main>;
 return <main className="page-stack">
  <section className="page-heading"><div><p className="eyebrow">RETRIEVAL PRACTICE</p><h1>MCQ practice</h1><p className="muted">Answer-checked questions with source labels, saved attempts and topic-wise revision signals.</p></div><Link className="btn" to="/pyqs">Browse question bank <ArrowRight size={14}/></Link></section>
  <div className="stat-grid">
   <div className="stat-card"><div className="stat-kicker">SCORABLE MCQS</div><div className="stat-value">{validBank.length}</div><div className="stat-note">Entries with answer options and a checked answer</div></div>
   <div className="stat-card"><div className="stat-kicker">MATCHED BY FILTERS</div><div className="stat-value">{available.length}</div><div className="stat-note">Questions available in this practice queue</div></div>
   <div className="stat-card"><div className="stat-kicker">COMPLETED SETS</div><div className="stat-value">{attempts.filter(a=>a.questionIds.length>1).length}</div><div className="stat-note">Stored locally on this device</div></div>
   <div className="stat-card"><div className="stat-kicker">DUE REVIEWS</div><div className="stat-value">{revisions.filter(r=>!r.completedAt&&r.dueAt<=todayIso()).length}</div><div className="stat-note">Weak topics picked up from incorrect answers</div></div>
  </div>
  <section className="card"><div className="row-between"><div><p className="eyebrow">BUILD A SET</p><h2 style={{fontSize:19,margin:'0 0 5px'}}>Choose what to practise</h2></div><span className="pill primary">{available.length} matched</span></div>
   <div className="grid grid-3" style={{marginTop:14}}>
    <div className="field"><label htmlFor="practice-subject">Subject</label><select id="practice-subject" value={subject} onChange={e=>{setSubject(e.target.value);setUnit('ALL');setTopic('ALL');}}><option value="ALL">All six subjects</option>{SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.short} · {s.name}</option>)}</select></div>
    <div className="field"><label htmlFor="practice-unit">Unit</label><select id="practice-unit" value={unit} onChange={e=>{setUnit(e.target.value);setTopic('ALL');}}><option value="ALL">All units</option>{unitOptions.map(u=><option key={u.subjectId+'-'+u.value} value={u.value}>{u.label}</option>)}</select></div>
    <div className="field"><label htmlFor="practice-topic">Topic</label><select id="practice-topic" value={topic} onChange={e=>setTopic(e.target.value)}><option value="ALL">All topics</option>{topicOptions.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
    <div className="field"><label htmlFor="practice-year">Paper year</label><select id="practice-year" value={year} onChange={e=>setYear(e.target.value)}><option value="ALL">All years</option><option value="UNVERIFIED">Year not listed</option>{years.map(y=><option key={y} value={String(y)}>{y}</option>)}</select></div>
    <div className="field"><label htmlFor="practice-difficulty">Difficulty</label><select id="practice-difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="ALL">All levels</option>{['Easy','Medium','Hard'].map(x=><option key={x}>{x}</option>)}</select></div>
    <div className="field"><label htmlFor="practice-source">Provenance</label><select id="practice-source" value={source} onChange={e=>setSource(e.target.value as SourceFilter)}><option value="all">All sources</option><option value="current-pyq">Current 4th-semester, code match</option><option value="supplementary-pyq">Supplementary paper</option><option value="curated">Curated practice, not PYQ</option></select></div>
    <div className="field"><label htmlFor="practice-queue">Practice queue</label><select id="practice-queue" value={queue} onChange={e=>setQueue(e.target.value as QueueFilter)}><option value="all">All matching questions</option><option value="incorrect">Previously incorrect</option><option value="bookmarked">Bookmarked</option><option value="unanswered">Unanswered only</option></select></div>
    <div className="field"><label htmlFor="practice-count">Set size</label><select id="practice-count" value={count} onChange={e=>setCount(e.target.value)}>{[['10','10 questions'],['20','20 questions'],['30','30 questions'],['ALL','All matched questions']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    <div className="field"><label htmlFor="practice-search">Search question wording</label><input id="practice-search" value={filterSearch} onChange={e=>setFilterSearch(e.target.value)} placeholder="Search text…"/></div>
   </div>
   <div className="grid grid-2" style={{marginTop:14}}>
    <label className="choice-card"><input type="checkbox" checked={timed} onChange={e=>setTimed(e.target.checked)}/><span><strong>Timed attempt</strong><small>Optional countdown; no marks target or prediction.</small></span></label>
    <label className="choice-card"><input type="checkbox" checked={shuffleAnswers} onChange={e=>setShuffleAnswers(e.target.checked)}/><span><strong>Shuffle answer choices</strong><small>Answer keys are remapped with the options; sources retain the original order.</small></span></label>
   </div>
   {timed&&<div className="field" style={{marginTop:12,maxWidth:260}}><label htmlFor="practice-minutes">Time limit</label><select id="practice-minutes" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[10,20,30,45,60,90].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></div>}
   {error&&<p className="form-error" role="alert">{error}</p>}
   {available.length&&count!=='ALL'&&available.length<Number(count)?<p className="muted text-xs">Only {available.length} questions match this exact selection, so the set will contain all available matches.</p>:null}
   <div className="task-actions" style={{marginTop:15}}><button className="primary-button" onClick={start} disabled={!available.length}><Play size={15}/> Start randomized set</button><button className="btn" onClick={()=>{setSubject('ALL');setUnit('ALL');setTopic('ALL');setYear('ALL');setDifficulty('ALL');setSource('all');setQueue('all');setCount('10');setTimed(false);setShuffleAnswers(false);setFilterSearch('');}}>Clear filters</button></div>
  </section>
  <section className="page-stack"><div className="section-heading"><div><h2>Question source coverage</h2><p>Counted from the uploaded PYQ scans and separately curated starter items.</p></div></div>
   <div className="grid grid-3">{SUBJECTS.map(s=>{const items=validBank.filter(q=>q.subjectId===s.id),current=items.filter(q=>q.provenance==='current-pyq').length,supplementary=items.filter(q=>q.provenance==='supplementary-pyq').length,curated=items.filter(q=>q.provenance==='curated').length;return <article className="card" key={s.id}><div className="row-between"><div className="subject-title">{s.short} · {s.name}</div><span className="pill primary">{items.length}</span></div><div className="mini-coverage"><div className="row-between"><span>Current 4th-semester</span><strong>{current}</strong></div><div className="row-between"><span>Supplementary paper</span><strong>{supplementary}</strong></div><div className="row-between"><span>Curated practice</span><strong>{curated}</strong></div></div>{current===0&&<p className="source-note" style={{marginTop:10}}>No code-matched 4th-semester MCQs were confidently identified for this subject in the indexed scans. The other questions remain separately labelled.</p>}</article>;})}</div>
   <div className="source-note">The uploaded scans do not include an official answer key. Scored items have been independently checked against standard subject knowledge; questions with ambiguous wording/options are excluded from automatic scoring. Paper provenance is retained on each question.</div>
  </section>
  <section className="page-stack"><div className="section-heading"><div><h2>Recent attempts</h2><p>Attempts persist locally. Weak topics feed the revision queue.</p></div><Link className="text-button" to="/progress">See progress <ArrowRight size={14}/></Link></div>
   {attempts.length?attempts.slice().reverse().slice(0,6).map(a=><article className="card row-between" key={a.id}><div><strong>{a.subjectId==='ALL'?'All subjects':SUBJECTS.find(s=>s.id===a.subjectId)?.short}</strong><p className="muted text-xs">{a.date} · {a.correct}/{a.total} correct · {a.unanswered} skipped</p></div><div className="row"><strong style={{fontSize:23}}>{a.scorePercent}%</strong><Link className="btn btn-small" to={'/practice/results/'+a.id}>Review</Link></div></article>):<div className="card empty-state"><Trophy size={27}/><h2>Nothing saved yet</h2><p>Finish your first practice set and your score, accuracy and topic performance will appear here.</p></div>}
  </section>
 </main>;
}
export function PracticeResultPage(){
 const {attemptId}=useParams(),navigate=useNavigate(),attempts=useStudentStore(s=>s.attempts),toggleBookmark=useStudentStore(s=>s.toggleBookmark),bookmarks=useStudentStore(s=>s.bookmarks),addRevision=useStudentStore(s=>s.addRevision);
 const attempt=attempts.find(a=>a.id===attemptId);
 if(!attempt)return <main className="page-stack"><section className="card empty-state"><FileText size={26}/><h1>Attempt not found</h1><p>This result is no longer present in this browser’s saved history.</p><button className="btn btn-secondary" onClick={()=>navigate('/practice')}>Back to practice</button></section></main>;
 const items=attempt.items||QUESTIONS.filter(q=>attempt.questionIds.includes(q.id));
 const topicRows=Object.entries(attempt.topicPerformance).map(([id,p])=>({topic:TOPICS.find(t=>t.id===id),id,...p})).filter(row=>row.topic).sort((a,b)=>a.correct/Math.max(1,a.attempted)-b.correct/Math.max(1,b.attempted));
 return <main className="page-stack"><div className="page-heading"><div><p className="eyebrow">SAVED PRACTICE RESULT</p><h1>Attempt review</h1><p className="muted">{attempt.date} · {attempt.timed?'Timed':'Untimed'} · {Math.round(attempt.durationSeconds/60)} minutes</p></div><button className="btn" onClick={()=>navigate('/practice')}>New practice <ArrowRight size={14}/></button></div>
  <div className="stat-grid"><div className="stat-card"><div className="stat-kicker">SCORE</div><div className="stat-value">{attempt.scorePercent}%</div><div className="stat-note">{attempt.correct}/{attempt.total} correct, including skips in denominator</div></div><div className="stat-card"><div className="stat-kicker">ACCURACY</div><div className="stat-value">{attempt.accuracy}%</div><div className="stat-note">Correct among answered questions</div></div><div className="stat-card"><div className="stat-kicker">ATTEMPTED</div><div className="stat-value">{attempt.attempted}</div><div className="stat-note">{attempt.incorrect} incorrect</div></div><div className="stat-card"><div className="stat-kicker">UNANSWERED</div><div className="stat-value">{attempt.unanswered}</div><div className="stat-note">Skipped or not reached</div></div></div>
  <section className="card"><div className="row-between"><div><h2 style={{margin:'0 0 5px',fontSize:19}}>Topic-wise performance</h2><p className="muted text-xs">Incorrect answers are available for targeted re-practice.</p></div><RotateCcw size={21} color="var(--primary)"/></div>
   {topicRows.length?<div className="card-list" style={{marginTop:14}}>{topicRows.map(r=><div className="row-between" key={r.id}><div className="grow"><strong>{r.topic?.title}</strong><p className="muted text-xs">{r.correct}/{r.attempted} correct · {r.incorrect} wrong</p></div><div className="row"><span className="pill">{r.attempted?Math.round(r.correct/r.attempted*100)+'%':'—'}</span><button className="btn btn-small" onClick={()=>addRevision(r.id,'Weak MCQ performance')}>Revise</button></div></div>)}</div>:<p className="muted text-sm">Topic breakdown is not available for questions without a reliable topic mapping.</p>}
  </section>
  <div className="section-heading"><div><h2>Answer review</h2><p>Correct answers are taken from this attempt’s saved option order.</p></div></div>
  {items.map((q,i)=>{const ans=attempt.answers[q.id],answered=typeof ans==='number',correct=answered&&ans===q.correctIndex;return <article className="card question-card" key={q.id}><div className="row-between"><div className="question-meta"><span className="pill">Q{i+1}</span><span className={'pill '+sourceClass(q.provenance)}>{sourceLabel(q.provenance)}</span>{q.year&&<span className="pill">{q.year}</span>}</div><span className={'pill '+(!answered?'warning':correct?'success':'danger')}>{!answered?'Skipped':correct?'Correct':'Incorrect'}</span></div><p className="question-text">{q.text}</p><div className="muted text-xs">{q.options?.map((o,j)=><div key={j} style={{margin:'4px 0'}}>{String.fromCharCode(65+j)}. {o} {j===q.correctIndex?'· Correct answer':''} {j===ans?'· Your answer':''}</div>)}</div><div className={'answer-feedback '+(!correct?'is-wrong':'')}><strong>Correct answer: {q.options?.[q.correctIndex||0]}</strong><br/>{q.explanation||'No additional explanation is available in the supplied source.'}</div><div className="task-actions"><button className="btn btn-small" onClick={()=>toggleBookmark(q.id)}><Bookmark size={12}/>{bookmarks.includes(q.id)?'Saved':'Bookmark'}</button>{q.topicId&&<button className="btn btn-small" onClick={()=>addRevision(q.topicId!,'Answer review from practice attempt')}>Add topic to revision</button>}</div></article>;})}
 </main>;
}
