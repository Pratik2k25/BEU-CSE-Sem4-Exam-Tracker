import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, FileText, Filter, Search, ShieldCheck } from 'lucide-react';
import { QUESTIONS, SUBJECTS, TOPICS, type Question, type SubjectId } from '../../data/content';
import { useStudentStore } from '../../state/store';
import type { PracticeAttempt } from '../../database/db';

type AttemptFilter='all'|'unattempted'|'attempted'|'incorrect'|'bookmarked';
type SourceFilter='all'|'current-pyq'|'supplementary-pyq'|'curated';
const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const marks=(q:Question)=>q.marks??(q.kind==='MCQ'?1:q.kind==='Short'?2:q.kind==='Long'?7:0);
const labelForSource=(q:Question)=>q.provenance==='current-pyq'?'Current 4th-semester PYQ':q.provenance==='supplementary-pyq'?'Supplementary past paper':'Curated practice';
const sourceClass=(q:Question)=>q.provenance==='current-pyq'?'success':q.provenance==='supplementary-pyq'?'warning':'';
function lastAttempt(qid:string,rows:PracticeAttempt[]){return rows.slice().reverse().find(r=>r.questionIds.includes(qid));}
function priorAnswer(q:Question,rows:PracticeAttempt[]){const r=lastAttempt(q.id,rows);return r?{attempt:r,answer:r.answers[q.id],item:r.items?.find(x=>x.id===q.id)||q}:undefined;}
function createSingleQuestionAttempt(q:Question,answer:number):PracticeAttempt{
 const correct=answer===q.correctIndex,topicKey=q.topicId||q.subjectId;
 return {id:'single-'+Date.now(),date:todayIso(),subjectId:q.subjectId,total:1,attempted:1,correct:correct?1:0,incorrect:correct?0:1,unanswered:0,accuracy:correct?100:0,scorePercent:correct?100:0,durationSeconds:0,timed:false,questionIds:[q.id],answers:{[q.id]:answer},items:[q],topicPerformance:{[topicKey]:{attempted:1,correct:correct?1:0,incorrect:correct?0:1}}};
}
function isIncorrect(q:Question,rows:PracticeAttempt[]){
 const a=priorAnswer(q,rows);return Boolean(a&&typeof a.answer==='number'&&a.item.correctIndex!==undefined&&a.answer!==a.item.correctIndex);
}
function sourceDetail(q:Question){
 if(!q.verifiedSource&&!q.originalWording)return 'Curated practice item; not represented as verbatim exam wording.';
 if(q.provenance==='supplementary-pyq')return `Supplementary past-paper question. The scanned heading shows semester ${q.semester??'not legible'} and course code ${q.courseCode||'not legible'}, which do not match the configured 4th-semester course code.`;
 return 'Source question transcribed from the supplied scanned paper. The scan does not include an official answer key; the answer shown below was independently checked.';
}
export function PyqsPage(){
 const [params]=useSearchParams(),navigate=useNavigate();
 const bookmarks=useStudentStore(s=>s.bookmarks),attempts=useStudentStore(s=>s.attempts);
 const [search,setSearch]=useState(''),[subject,setSubject]=useState(params.get('subject')||'ALL'),[year,setYear]=useState('ALL');
 const [unit,setUnit]=useState(params.get('unit')||'ALL'),[type,setType]=useState('ALL'),[priority,setPriority]=useState('ALL');
 const [attemptFilter,setAttemptFilter]=useState<AttemptFilter>('all'),[source,setSource]=useState<SourceFilter>('all'),[marksFilter,setMarksFilter]=useState('ALL');
 const [view,setView]=useState<'questions'|'papers'>('questions'),[paperFilter,setPaperFilter]=useState<string|null>(null);
 const [filterOpen,setFilterOpen]=useState(true);
 const years=[...new Set(QUESTIONS.map(q=>q.year).filter((n):n is number=>typeof n==='number'))].sort((a,b)=>b-a);
 const subjects=SUBJECTS.filter(s=>subject==='ALL'||s.id===subject);
 const unitOptions=subjects.flatMap(s=>s.units.map(u=>({subjectId:s.id,value:s.id+':'+u.index,label:s.short+' · Unit '+(u.index+1)+' '+u.title})));
 const [unitKey,setUnitKey]=useState(params.get('unit')&&params.get('subject')?params.get('subject')+':'+params.get('unit'):'ALL');
 const filtered=useMemo(()=>QUESTIONS.filter(q=>{
  if(subject!=='ALL'&&q.subjectId!==subject)return false;
  if(unitKey!=='ALL'){const [s,u]=unitKey.split(':');if(q.subjectId!==s||String(TOPICS.find(t=>t.id===q.topicId)?.unitIndex??'')!==u)return false;}
  if(unit==='ONLY-MAPPED'&&!q.topicId)return false;
  if(year!=='ALL'&&String(q.year??'UNVERIFIED')!==year)return false;
  if(type!=='ALL'&&q.kind!==type)return false;
  if(priority!=='ALL'&&q.importance!==priority)return false;
  if(marksFilter!=='ALL'&&String(marks(q))!==marksFilter)return false;
  if(source!=='all'&&q.provenance!==source)return false;
  if(search&&!q.text.toLowerCase().includes(search.toLowerCase()))return false;
  if(paperFilter&&q.sourceName+'|'+(q.paper||'')!==paperFilter)return false;
  const prior=priorAnswer(q,attempts);
  if(attemptFilter==='unattempted'&&prior)return false;
  if(attemptFilter==='attempted'&&!prior)return false;
  if(attemptFilter==='incorrect'&&!isIncorrect(q,attempts))return false;
  if(attemptFilter==='bookmarked'&&!bookmarks.includes(q.id))return false;
  return true;
 }),[subject,unitKey,unit,year,type,priority,marksFilter,source,search,paperFilter,attemptFilter,attempts,bookmarks]);
 const papers=useMemo(()=>{
  const map=new Map<string,{key:string;name:string;paper:string;subjectIds:Set<string>;years:Set<number>;count:number;pages:Set<number>;codes:Set<string>;provenance:SourceFilter}>();
  QUESTIONS.filter(q=>q.sourceName&&q.paper).forEach(q=>{
   const key=q.sourceName+'|'+q.paper;const old=map.get(key)||{key,name:q.sourceName!,paper:q.paper!,subjectIds:new Set<string>(),years:new Set<number>(),count:0,pages:new Set<number>(),codes:new Set<string>(),provenance:q.provenance};
   old.subjectIds.add(q.subjectId);if(q.year)old.years.add(q.year);if(q.sourcePage)old.pages.add(q.sourcePage);if(q.courseCode)old.codes.add(q.courseCode);old.count++;map.set(key,old);
  });
  return [...map.values()].sort((a,b)=>(Math.max(...b.years,0)-Math.max(...a.years,0))||a.name.localeCompare(b.name));
 },[]);
 const reset=()=>{setSearch('');setSubject('ALL');setYear('ALL');setUnit('ALL');setUnitKey('ALL');setType('ALL');setPriority('ALL');setAttemptFilter('all');setSource('all');setMarksFilter('ALL');setPaperFilter(null);};
 const selectedPaper=(key:string)=>{setPaperFilter(key);setView('questions');};
 const attemptCounts={mcq:QUESTIONS.filter(q=>q.kind==='MCQ').length,current:QUESTIONS.filter(q=>q.provenance==='current-pyq').length,supplementary:QUESTIONS.filter(q=>q.provenance==='supplementary-pyq').length,curated:QUESTIONS.filter(q=>q.provenance==='curated').length};
 return <main className="page-stack">
  <section className="page-heading"><div><p className="eyebrow">ACADEMIC QUESTION BANK</p><h1>PYQs & questions</h1><p className="muted">Discover questions with transparent paper, semester, course-code and answer provenance.</p></div><Link className="btn" to="/practice">MCQ practice <ArrowRight size={14}/></Link></section>
  <div className="stat-grid"><div className="stat-card"><div className="stat-kicker">INDEXED ENTRIES</div><div className="stat-value">{QUESTIONS.length}</div><div className="stat-note">MCQ, short and long-form records</div></div><div className="stat-card"><div className="stat-kicker">CURRENT-CODE PYQ</div><div className="stat-value">{attemptCounts.current}</div><div className="stat-note">Semester and course code match</div></div><div className="stat-card"><div className="stat-kicker">SUPPLEMENTARY PYQ</div><div className="stat-value">{attemptCounts.supplementary}</div><div className="stat-note">Other semester or different course code</div></div><div className="stat-card"><div className="stat-kicker">CURATED PRACTICE</div><div className="stat-value">{attemptCounts.curated}</div><div className="stat-note">Not advertised as authentic PYQs</div></div></div>
  <section className="card"><div className="row-between"><div className="field grow"><label htmlFor="pyq-search">Search wording</label><div className="row"><Search size={17} color="var(--muted)"/><input id="pyq-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search concepts, question wording or keywords"/></div></div><button className="btn" onClick={()=>setFilterOpen(v=>!v)}><Filter size={14}/>{filterOpen?'Hide filters':'Show filters'}</button></div>
   {filterOpen&&<div className="grid grid-3" style={{marginTop:14}}>
    <div className="field"><label htmlFor="pyq-subject">Subject</label><select id="pyq-subject" value={subject} onChange={e=>{setSubject(e.target.value);setUnitKey('ALL');}}><option value="ALL">All subjects</option>{SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.short} · {s.name}</option>)}</select></div>
    <div className="field"><label htmlFor="pyq-year">Source year</label><select id="pyq-year" value={year} onChange={e=>setYear(e.target.value)}><option value="ALL">All years</option><option value="UNVERIFIED">No verified year</option>{years.map(y=><option key={y} value={String(y)}>{y}</option>)}</select></div>
    <div className="field"><label htmlFor="pyq-unit">Unit</label><select id="pyq-unit" value={unitKey} onChange={e=>setUnitKey(e.target.value)}><option value="ALL">All units</option>{unitOptions.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
    <div className="field"><label htmlFor="pyq-type">Question type</label><select id="pyq-type" value={type} onChange={e=>setType(e.target.value)}><option value="ALL">All question types</option>{['MCQ','Short','Long','Unverified'].map(t=><option key={t}>{t}</option>)}</select></div>
    <div className="field"><label htmlFor="pyq-priority">Importance</label><select id="pyq-priority" value={priority} onChange={e=>setPriority(e.target.value)}><option value="ALL">All labels</option>{['High','Medium','Low'].map(x=><option key={x}>{x}</option>)}</select></div>
    <div className="field"><label htmlFor="pyq-marks">Marks</label><select id="pyq-marks" value={marksFilter} onChange={e=>setMarksFilter(e.target.value)}><option value="ALL">All mark values</option>{[1,2,3,4,5,7,14].map(x=><option key={x} value={String(x)}>{x} marks</option>)}</select></div>
    <div className="field"><label htmlFor="pyq-provenance">Provenance</label><select id="pyq-provenance" value={source} onChange={e=>setSource(e.target.value as SourceFilter)}><option value="all">All sources</option><option value="current-pyq">Current 4th-semester PYQ</option><option value="supplementary-pyq">Supplementary past paper</option><option value="curated">Curated practice (not PYQ)</option></select></div>
    <div className="field"><label htmlFor="pyq-attempt">Attempt status</label><select id="pyq-attempt" value={attemptFilter} onChange={e=>setAttemptFilter(e.target.value as AttemptFilter)}><option value="all">All</option><option value="unattempted">Not attempted</option><option value="attempted">Attempted</option><option value="incorrect">Previously incorrect</option><option value="bookmarked">Bookmarked</option></select></div>
    <div className="field"><label htmlFor="pyq-mapped">Topic mapping</label><select id="pyq-mapped" value={unit} onChange={e=>setUnit(e.target.value)}><option value="ALL">All records</option><option value="ONLY-MAPPED">Mapped to syllabus topic</option></select></div>
   </div>}
   <div className="row-between" style={{marginTop:13,flexWrap:'wrap'}}><div className="filter-row"><button className={'filter-chip '+(view==='questions'?'active':'')} onClick={()=>setView('questions')}>Individual questions</button><button className={'filter-chip '+(view==='papers'?'active':'')} onClick={()=>setView('papers')}>Original source papers ({papers.length})</button></div><div className="row"><span className="muted text-xs">{filtered.length} matched</span><button className="text-button" onClick={reset}>Clear filters</button></div></div>
  </section>
  {view==='papers'?<section className="page-stack"><div className="source-note">These are source references detected in the readable scan. The source PDFs are not redistributed in the web build; upload your own copy in Study resources to read it offline.</div>{papers.length?papers.map(p=><article className="card" key={p.key}><div className="row-between"><div><p className="eyebrow">SOURCE PAPER</p><h2 style={{fontSize:17,margin:'0 0 6px'}}>{p.paper}</h2><p className="muted text-xs">{p.name}</p></div><span className={'pill '+(p.provenance==='current-pyq'?'success':p.provenance==='supplementary-pyq'?'warning':'')}>{p.provenance==='current-pyq'?'4th-semester match':p.provenance==='supplementary-pyq'?'Supplementary':'Curated'}</span></div><div className="filter-row" style={{marginTop:10}}>{[...p.subjectIds].map(id=><span className="pill" key={id}>{id}</span>)}{[...p.years].map(y=><span className="pill" key={y}>{y}</span>)}<span className="pill">{p.count} indexed questions</span><span className="pill">PDF page(s) {[...p.pages].sort((a,b)=>a-b).join(', ')||'not indexed'}</span></div><p className="muted text-xs">Printed code(s): {[...p.codes].join(', ')||'not legible'}</p><div className="task-actions"><button className="btn btn-secondary" onClick={()=>selectedPaper(p.key)}>Browse indexed questions <ArrowRight size={14}/></button><Link className="btn" to={'/resources?source='+encodeURIComponent(p.name)}>Find/upload source PDF <FileText size={14}/></Link></div></article>):<div className="card empty-state"><FileText size={26}/><h2>No source references indexed yet</h2><p>Questions can still be browsed and practised while source extraction continues.</p></div>}</section>:
  <section className="page-stack">
   {paperFilter&&<div className="banner-soft"><div className="row-between"><div><h2>Filtered to one source paper</h2><p>{paperFilter.replace('|',' · ')}</p></div><button className="btn" onClick={()=>setPaperFilter(null)}>Clear source</button></div></div>}
   {filtered.length?filtered.map(q=>{const subject=SUBJECTS.find(s=>s.id===q.subjectId)!;const topic=TOPICS.find(t=>t.id===q.topicId);const prior=priorAnswer(q,attempts);return <article className="card question-card" key={q.id}><div className="row-between"><div className="question-meta"><span className="pill">{subject.short} · {subject.code}</span><span className={'pill '+sourceClass(q)}>{labelForSource(q)}</span>{q.year&&<span className="pill">{q.year}</span>}</div><button className="btn btn-small" onClick={()=>toggleBookmark(q.id)}><Bookmark size={12}/>{bookmarks.includes(q.id)?'Saved':'Save'}</button></div><p className="question-text">{q.text}</p><div className="question-meta">{topic&&<span className="pill">Unit {topic.unitIndex+1} · {topic.title}</span>}<span className="pill">{q.kind}</span>{marks(q)>0&&<span className="pill">{marks(q)} mark(s)</span>}<span className="pill">{q.difficulty}</span>{q.importance&&<span className={'pill '+(q.importance==='High'?'danger':q.importance==='Medium'?'warning':'')}>{q.importance} study priority</span>}{prior&&<span className={'pill '+(isIncorrect(q,attempts)?'danger':'success')}>{isIncorrect(q,attempts)?'Incorrect previously':'Attempted'}</span>}</div><div className="row-between" style={{marginTop:4}}><span className="muted text-xs">{q.paper||'No verified source paper attached'}{q.sourceName?' · '+q.sourceName:''}{q.sourcePage?' · PDF p.'+q.sourcePage:''}</span><button className="primary-button" onClick={()=>navigate('/pyqs/'+q.id)}>Open question <ArrowRight size={13}/></button></div></article>;})
    :<div className="card empty-state"><Search size={25}/><h2>No questions match those filters</h2><p>Clear a filter or switch to All subjects and All sources. Curated practice and supplementary past papers are kept separate from current-code PYQs.</p><button className="btn btn-secondary" onClick={reset}>Clear filters</button></div>}
  </section>}
 </main>;
}
export function QuestionPage(){
 const {questionId}=useParams(),navigate=useNavigate();
 const q=QUESTIONS.find(item=>item.id===questionId),subject=q?SUBJECTS.find(s=>s.id===q.subjectId):undefined,topic=q?TOPICS.find(t=>t.id===q.topicId):undefined;
 const attempts=useStudentStore(s=>s.attempts),bookmarks=useStudentStore(s=>s.bookmarks),toggleBookmark=useStudentStore(s=>s.toggleBookmark),addAttempt=useStudentStore(s=>s.addAttempt),addRevision=useStudentStore(s=>s.addRevision);
 const writtenDrafts=useStudentStore(s=>s.writtenDrafts),writtenAssessments=useStudentStore(s=>s.writtenAssessments),setWrittenDraft=useStudentStore(s=>s.setWrittenDraft),assessWritten=useStudentStore(s=>s.assessWritten);
 const [selectedAnswer,setSelectedAnswer]=useState<number|null>(null),[submitted,setSubmitted]=useState(false),[showSolution,setShowSolution]=useState(false);
 const [written,setWritten]=useState(''),[sourceHint,setSourceHint]=useState('');
 const previous=q?priorAnswer(q,attempts):undefined;
 useEffect(()=>{if(q){setWritten(writtenDrafts[q.id]||'');setSelectedAnswer(null);setSubmitted(false);setShowSolution(Boolean(writtenAssessments[q.id]));}},[q?.id]);
 useEffect(()=>{if(!q||q.kind==='MCQ'||!written)return;const timeout=window.setTimeout(()=>setWrittenDraft(q.id,written),450);return()=>window.clearTimeout(timeout);},[q?.id,q?.kind,written,setWrittenDraft]);
 if(!q||!subject)return <main className="page-stack"><section className="card empty-state"><FileText size={25}/><h1>Question not found</h1><p>Choose a question from the searchable question bank.</p><Link className="btn btn-secondary" to="/pyqs">Return to PYQs</Link></section></main>;
 const validMcq=q.kind==='MCQ'&&Boolean(q.options&&q.options.length>=2&&q.answerVerified&&Number.isInteger(q.correctIndex));
 const alreadyAttempted=Boolean(previous),showFeedback=submitted||showSolution||alreadyAttempted;
 const submittedIndex=submitted?selectedAnswer:previous?.answer;
 const assessment=writtenAssessments[q.id];
 const chooseWrittenAssessment=(value:'confident'|'partial'|'incorrect')=>{
  assessWritten(q.id,value);
  if(value!=='confident'&&topic)addRevision(topic.id,'Written answer self-assessment: '+value);
  setShowSolution(true);
 };
 const submitMcq=()=>{
  if(selectedAnswer===null||!q.options||q.correctIndex===undefined||!q.answerVerified)return;
  const result=createSingleQuestionAttempt(q,selectedAnswer);addAttempt(result);setSubmitted(true);setShowSolution(true);
 };
 return <main className="page-stack">
  <div className="page-heading"><div><Link className="text-button" to="/pyqs">← Question bank</Link><p className="eyebrow" style={{marginTop:8}}>QUESTION DETAILS · {subject.code}</p><h1>{subject.name}</h1><p className="muted">{q.paper||'No verified source paper reference'}</p></div><button className="btn" onClick={()=>toggleBookmark(q.id)}><Bookmark size={14}/>{bookmarks.includes(q.id)?'Saved':'Bookmark'}</button></div>
  <section className="card question-card"><div className="question-meta"><span className="pill">{q.kind}</span><span className={'pill '+sourceClass(q)}>{labelForSource(q)}</span>{q.year&&<span className="pill">{q.year}</span>}{marks(q)>0&&<span className="pill">{marks(q)} marks</span>}{q.difficulty&&<span className="pill">{q.difficulty}</span>}</div>
   <div className="question-text" style={{fontSize:18}}>{q.text}</div>
   <div className="question-meta">{topic&&<span className="pill">Unit {topic.unitIndex+1} · {topic.title}</span>}{q.importance&&<span className={'pill '+(q.importance==='High'?'danger':q.importance==='Medium'?'warning':'')}>{q.importance} study priority</span>}</div>
   {q.verifiedSource?<div className="source-note"><strong>Source-checked question</strong><br/>{q.sourceName||'Uploaded PYQ collection'} · Source PDF p. {q.sourcePage??'not indexed'} · Paper p. {q.paperPage??'not indexed'}<br/>{q.paper||'Paper title not fully legible'} · Code {q.courseCode||subject.code}<br/>{sourceDetail(q)}</div>:<div className="source-note">{sourceDetail(q)}</div>}
   {q.provenance==='supplementary-pyq'&&<p className="muted text-xs">This question is retained for extra subject practice but must not be treated as evidence of current 4th-semester paper recurrence.</p>}
   {validMcq&&<><div className="options-grid">{q.options?.map((option,i)=><button key={i} disabled={alreadyAttempted||submitted} className={'answer-option '+(selectedAnswer===i?'selected ':'')+(showFeedback&&i===q.correctIndex?'correct ':'')+(showFeedback&&submittedIndex===i&&i!==q.correctIndex?'incorrect':'')} onClick={()=>setSelectedAnswer(i)}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span>{option}</span></button>)}</div>
     {!showFeedback&&<button className="primary-button" disabled={selectedAnswer===null} onClick={submitMcq}>Check answer <ShieldCheck size={15}/></button>}
     {showFeedback&&<div className={'answer-feedback '+(submittedIndex===q.correctIndex?'':'is-wrong')}><strong>{submittedIndex===q.correctIndex?'Correct answer.':submittedIndex===undefined?'Correct answer:':'Your answer was not correct.'}</strong><br/>Correct option: {q.options?.[q.correctIndex??0]}<br/>{q.explanation||'No detailed explanation was included with this source record.'}</div>}
     {showFeedback&&<div className="task-actions"><button className="btn" onClick={()=>{setSelectedAnswer(null);setSubmitted(false);setShowSolution(false);}}>Try again</button>{topic&&<button className="btn" onClick={()=>addRevision(topic.id,'Incorrect or uncertain PYQ response')}>Add topic to revision</button>}<button className="btn btn-secondary" onClick={()=>navigate('/practice?subject='+q.subjectId+(q.topicId?'&topic='+q.topicId:''))}>Start a practice set</button></div>}
   </>}
   {!validMcq&&q.kind==='MCQ'&&<div className="source-note">This entry is not scored because its answer/options did not pass the answer-verification checks.</div>}
   {q.kind!=='MCQ'&&<div className="page-stack"><div className="field"><label htmlFor="written-answer">Your written answer or outline</label><textarea id="written-answer" value={written} onChange={e=>setWritten(e.target.value)} placeholder="Write your answer here or make a checklist of the response you attempted on paper."/><small>Drafts auto-save locally. This is practice material, not an automatically graded examination response.</small></div>
    <div className="task-actions"><button className="btn" onClick={()=>setShowSolution(v=>!v)}>{showSolution?'Hide model outline':'Reveal available answer structure'}</button><button className="btn btn-secondary" onClick={()=>setWrittenDraft(q.id,written)}>Save answer now</button></div>
    {showSolution&&<div className="card-soft"><h3 style={{margin:'0 0 8px'}}>Available answer structure</h3>{q.outline?.length?<ol>{q.outline.map((line,i)=><li key={i}>{line}</li>)}</ol>:<p className="muted text-sm">The scanned source does not include a verified model solution or marking rubric for this question. Use your lecture notes to fill in the required definitions, explanation, diagram/working and conclusion.</p>}<div className="source-note">No official rubric is available in the indexed source unless explicitly listed in the source paper.</div></div>}
    <div className="card-soft"><h3 style={{margin:'0 0 8px'}}>Self-assessment</h3><p className="muted text-xs">Compare your answer against your notes or lecturer’s solution. This is not independently graded.</p><div className="choice-grid"><button className={'choice-card '+(assessment==='confident'?'is-selected':'')} onClick={()=>chooseWrittenAssessment('confident')}><span>✓</span><span><strong>Correct / confident</strong><small>Key points and working are complete.</small></span></button><button className={'choice-card '+(assessment==='partial'?'is-selected':'')} onClick={()=>chooseWrittenAssessment('partial')}><span>~</span><span><strong>Partially correct</strong><small>Some points need more study.</small></span></button><button className={'choice-card '+(assessment==='incorrect'?'is-selected':'')} onClick={()=>chooseWrittenAssessment('incorrect')}><span>↻</span><span><strong>Incorrect / needs revision</strong><small>Queue this topic for another pass.</small></span></button></div></div>
   </div>}
   <div className="task-actions"><Link className="btn" to={'/resources?source='+encodeURIComponent(q.sourceName||'')}>Open / upload source PDF <FileText size={14}/></Link>{topic&&<Link className="btn btn-secondary" to={'/topics/'+topic.id}>Open topic reader <ArrowRight size={13}/></Link>}</div>
  </section>
  {q.provenance==='current-pyq'&&<div className="source-note">This paper’s labelled semester and course code match the configured CSE semester-4 subject. Its scanned content still does not supply an official answer key.</div>}
 </main>;
}
