import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, CircleHelp, FileText, Target } from 'lucide-react';
import { SUBJECT_BY_ID, type Subject, type SubjectId, type Question, type Topic } from '../data/content';

export function PageHeader({eyebrow,title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}) {
 return <section className="page-heading"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p className="muted">{description}</p>}</div>{action&&<div>{action}</div>}</section>;
}
export function Pill({children,tone='default'}:{children:ReactNode;tone?:'default'|'success'|'warning'|'danger'|'info'}) {
 return <span className={'pill '+(tone==='success'?'success':tone==='warning'?'warning':tone==='danger'?'danger':tone==='info'?'primary':'')}>{children}</span>;
}
export function ProgressBar({value,label}:{value:number;label?:string}) {
 const safe=Math.max(0,Math.min(100,Math.round(value)));
 return <div className="progress-wrap">{label&&<div className="row-between"><span className="muted">{label}</span><strong>{safe}%</strong></div>}<div className="progress-track" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} aria-label={label||'Progress'}><div className="progress-fill" style={{width:safe+'%'}}/></div></div>;
}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}) {
 return <section className="empty-state"><CircleHelp size={27}/><h2>{title}</h2><p>{description}</p>{action}</section>;
}
export function Metric({label,value,note,icon}:{label:string;value:string|number;note?:string;icon?:ReactNode}) {
 return <article className="stat-card"><div className="row-between"><span className="stat-kicker">{label}</span>{icon&&<span className="subtle">{icon}</span>}</div><div className="stat-value">{value}</div>{note&&<div className="stat-note">{note}</div>}</article>;
}
export function SubjectMark({subject,compact=false}:{subject:Subject|SubjectId;compact?:boolean}) {
 const s=typeof subject==='string'?SUBJECT_BY_ID[subject]:subject;
 return <span className="subject-mark" style={{'--subject-color':s.color} as React.CSSProperties} aria-label={s.short}>{compact?s.short:s.short}</span>;
}
export function subjectProgress(subjectId:SubjectId,progress:Record<string,{status:string}>) {
 const s=SUBJECT_BY_ID[subjectId];
 const count=s.units.reduce((n,u)=>n+u.topics.filter(t=>['read','practised','revision-ready','mastered'].includes(progress[t.id]?.status||'')).length,0);
 return s.topicCount?Math.round(count/s.topicCount*100):0;
}
export function getTopicForQuestion(q:Question):Topic|undefined {
 if(!q.topicId)return undefined;
 return SUBJECT_BY_ID[q.subjectId].units.flatMap(u=>u.topics).find(t=>t.id===q.topicId);
}
export function SourceBadge({question}:{question:Question}) {
 if(question.provenance==='current-pyq')return <Pill tone="success">Current-code PYQ</Pill>;
 if(question.provenance==='supplementary-pyq')return <Pill tone="warning">Supplementary paper</Pill>;
 return <Pill tone="info">Curated practice</Pill>;
}
export function QuestionSummary({question,compact=false}:{question:Question;compact?:boolean}) {
 const topic=getTopicForQuestion(question);
 return <article className="card question-card">
  <div className="row-between wrap"><div className="question-meta"><SubjectMark subject={question.subjectId} compact/><span>{question.year||'Year unverified'}</span>{question.marks&&<span>{question.marks} marks</span>}</div><SourceBadge question={question}/></div>
  <h3 className="question-text">{question.text}</h3>
  <div className="question-meta">{topic&&<span>{topic.title}</span>}<span>{question.difficulty}</span>{question.answerVerified?<span>Answer checked</span>:<span>Unscored</span>}</div>
  {!compact&&question.options&&<p className="muted">{question.options.length} options · {question.kind==='MCQ'?'Multiple choice':'Practice question'}</p>}
  <div className="row-between wrap"><span className="muted source-note">{question.paper||'Syllabus-aligned question'}{question.sourcePage?' · PDF page '+question.sourcePage:''}</span><Link className="btn btn-small" to={'/pyqs/'+question.id}>Open question <ArrowRight size={14}/></Link></div>
 </article>;
}
export function QuickLinks() {
 return <div className="grid grid-2"><Link className="card-soft" to="/subjects"><BookOpen size={19}/><strong>Continue a subject</strong></Link><Link className="card-soft" to="/pyqs"><FileText size={19}/><strong>Practise PYQs</strong></Link><Link className="card-soft" to="/practice"><Target size={19}/><strong>Start MCQ practice</strong></Link><Link className="card-soft" to="/help"><CircleHelp size={19}/><strong>Help & privacy</strong></Link></div>;
}
export function formatHours(minutes:number):string {
 const h=Math.floor(Math.max(0,minutes)/60),m=Math.max(0,minutes)%60;
 return h?(m?h+'h '+m+'m':h+'h'):m+'m';
}
export function localIsoDay(date=new Date()):string {
 return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
