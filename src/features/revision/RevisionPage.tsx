import { useMemo, useState } from 'react';
import { Check, Clock3, RotateCcw } from 'lucide-react';
import { SUBJECTS, TOPICS } from '../../data/content';
import { useStudentStore } from '../../state/store';
import { PageHeader, Pill, EmptyState, ProgressBar, localIsoDay } from '../shared';

export function RevisionPage(){
 const state=useStudentStore(),complete=state.completeRevision,add=state.addRevision;
 const [tab,setTab]=useState<'due'|'weak'|'history'>('due');
 const today=localIsoDay();
 const due=useMemo(()=>state.revisions.filter(r=>!r.completedAt&&r.dueAt<=today).sort((a,b)=>a.dueAt.localeCompare(b.dueAt)),[state.revisions,today]);
 const weak=useMemo(()=>Object.values(state.topicProgress).filter(p=>p.status==='review'||p.status==='partial'||p.feedback==='again'||p.feedback==='partial'),[state.topicProgress]);
 const history=state.revisions.filter(r=>r.completedAt).sort((a,b)=>(b.completedAt||0)-(a.completedAt||0));
 const dueTopics=new Set(due.map(r=>r.topicId));
 const createWeak=()=>weak.forEach(p=>{if(!dueTopics.has(p.id))add(p.id,'Weak topic from learning feedback',today);});
 return <main className="page-stack"><PageHeader eyebrow="ACTIVE RECALL" title="Revision hub" description="Review what is due, return to weak topics and record how well you recalled them." action={<button className="btn btn-secondary" onClick={createWeak}><RotateCcw size={15}/> Queue weak topics</button>}/>
  <div className="filter-row"><button className={'filter-chip '+(tab==='due'?'active':'')} onClick={()=>setTab('due')}>Due today ({due.length})</button><button className={'filter-chip '+(tab==='weak'?'active':'')} onClick={()=>setTab('weak')}>Weak topics ({weak.length})</button><button className={'filter-chip '+(tab==='history'?'active':'')} onClick={()=>setTab('history')}>History ({history.length})</button></div>
  <section className="card"><div className="section-heading"><div><h2>{tab==='due'?'Revision due now':tab==='weak'?'Topics needing another pass':'Completed revision history'}</h2><p>{tab==='due'?'Due dates are based on your recorded recall feedback.':'Recall schedules are simple configurable heuristics, not predictions of memory retention.'}</p></div></div>
  {tab==='due'&&due.length===0?<EmptyState title="No revisions due" description="Incorrect MCQs and topics marked partially understood or needing another pass will appear here."/>:null}
  {tab==='weak'&&weak.length===0?<EmptyState title="No weak topics marked" description="Mark a topic as partially understood or needing revision after studying it."/>:null}
  {tab==='history'&&history.length===0?<EmptyState title="No revision history yet" description="After reviewing a topic, record whether recall felt correct, partial or incorrect."/>:null}
  <div className="card-list">{(tab==='due'?due:tab==='history'?history:weak.map(p=>({id:'revision:'+p.id,topicId:p.id,dueAt:today,intervalDays:1,reason:'Topic marked weak',completedAt:undefined}))).map(r=>{const topic=TOPICS.find(t=>t.id===r.topicId),s=topic&&SUBJECTS.find(x=>x.id===topic.subjectId);return <article className="card-soft" key={r.id}><div className="row-between wrap"><div><div className="row"><span className="subject-mark">{s?.short||'Topic'}</span><div><h3>{topic?.title||'Syllabus topic'}</h3><p className="muted">{s?.name||'Subject not found'} · {topic?'Unit '+(topic.unitIndex+1):'Topic'} · {r.reason}</p></div></div></div><Pill tone={r.completedAt?'success':r.dueAt<=today?'warning':'default'}>{r.completedAt?'Reviewed':r.dueAt<=today?'Due':'Upcoming'}</Pill></div><ProgressBar value={r.completedAt?100:0} label="Recorded review"/><div className="task-actions"><button className="btn btn-small" onClick={()=>topic&&useStudentStore.getState().toggleBookmark(topic.id)}>Save topic</button>{topic&&<a className="btn btn-small" href={'#/topics/'+topic.id}>Open topic</a>}{!r.completedAt&&<><button className="btn btn-small btn-primary" onClick={()=>complete(r.id,'correct')}><Check size={13}/> Recalled well</button><button className="btn btn-small" onClick={()=>complete(r.id,'partial')}>Partially recalled</button><button className="btn btn-small btn-quiet" onClick={()=>complete(r.id,'incorrect')}>Need another pass</button></>}</div></article>;})}</div>
  </section>
  <section className="card-soft row"><Clock3 size={21}/><div><strong>How the review interval works</strong><p className="muted">Correct recall lengthens the next interval; partial or incorrect recall brings the topic back sooner. This is deliberately transparent and adjustable—not an assertion of scientifically precise retention.</p></div></section>
 </main>;
}
