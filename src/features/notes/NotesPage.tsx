import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookMarked, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { SUBJECTS, TOPICS, type SubjectId } from '../../data/content';
import { useStudentStore } from '../../state/store';
import type { PersonalNote } from '../../database/db';

const emptyDraft=()=>({title:'',body:'',subjectId:'' as SubjectId|'',topicId:'',pinned:false});
export function NotesPage(){
 const [params]=useSearchParams(),notes=useStudentStore(s=>s.notes),upsert=useStudentStore(s=>s.upsertNote),remove=useStudentStore(s=>s.deleteNote);
 const [search,setSearch]=useState(''),[editing,setEditing]=useState<string|null>(null),[draft,setDraft]=useState(emptyDraft()),[error,setError]=useState('');
 const suggestedTopic=params.get('topic')||'';
 const filtered=useMemo(()=>notes.filter(n=>!search||(n.title+' '+n.body).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updatedAt-a.updatedAt),[notes,search]);
 const begin=(id?:string)=>{
  const n=notes.find(item=>item.id===id);
  setEditing(id||'new');setError('');
  setDraft(n?{title:n.title,body:n.body,subjectId:n.subjectId||'',topicId:n.topicId||'',pinned:n.pinned}:{...emptyDraft(),topicId:suggestedTopic,subjectId:TOPICS.find(t=>t.id===suggestedTopic)?.subjectId||''});
 };
 const save=()=>{
  if(draft.title.trim().length<2||draft.body.trim().length<2){setError('Add a title and note content before saving.');return;}
  const now=Date.now(),old=notes.find(n=>n.id===editing);
  const note:PersonalNote={id:old?.id||(globalThis.crypto?.randomUUID?.()||'note-'+now),title:draft.title.trim(),body:draft.body.trim(),
    subjectId:draft.subjectId||undefined,topicId:draft.topicId||undefined,pinned:draft.pinned,createdAt:old?.createdAt||now,updatedAt:now};
  upsert(note);setEditing(null);setDraft(emptyDraft());setError('');
 };
 return <main className="page-stack">
  <section className="page-heading"><div><p className="eyebrow">PRIVATE STUDY MATERIAL</p><h1>Personal notes</h1><p className="muted">Notes stay in your browser’s IndexedDB. They are not uploaded to a server.</p></div><button className="primary-button" onClick={()=>begin()}><Plus size={15}/> New note</button></section>
  {editing&&<section className="card"><div className="row-between"><div><p className="eyebrow">{editing==='new'?'CREATE NOTE':'EDIT NOTE'}</p><h2 style={{fontSize:19,margin:0}}>{editing==='new'?'Capture a study idea':'Update your note'}</h2></div><button className="icon-button" onClick={()=>setEditing(null)} aria-label="Close note editor"><X size={17}/></button></div>
   <div className="form-grid" style={{marginTop:14}}><div className="field"><label htmlFor="note-title">Title</label><input id="note-title" value={draft.title} maxLength={180} onChange={e=>setDraft(d=>({...d,title:e.target.value}))} placeholder="e.g. Cache mapping comparison"/></div>
    <div className="grid grid-2"><div className="field"><label htmlFor="note-subject">Subject</label><select id="note-subject" value={draft.subjectId} onChange={e=>setDraft(d=>({...d,subjectId:e.target.value as SubjectId|''}))}><option value="">No subject</option>{SUBJECTS.map(s=><option key={s.id} value={s.id}>{s.short} · {s.name}</option>)}</select></div><div className="field"><label htmlFor="note-topic">Topic</label><select id="note-topic" value={draft.topicId} onChange={e=>setDraft(d=>({...d,topicId:e.target.value}))}><option value="">No topic link</option>{TOPICS.filter(t=>!draft.subjectId||t.subjectId===draft.subjectId).map(t=><option key={t.id} value={t.id}>{SUBJECTS.find(s=>s.id===t.subjectId)?.short} · U{t.unitIndex+1} · {t.title}</option>)}</select></div></div>
    <div className="field"><label htmlFor="note-body">Note content</label><textarea id="note-body" value={draft.body} onChange={e=>setDraft(d=>({...d,body:e.target.value}))} maxLength={20000} placeholder="Write definitions, formulas, a correction, or your own exam-ready outline."/><small>{draft.body.length}/20000 characters · Rendered as plain text for safety.</small></div>
    <label className="choice-card"><input type="checkbox" checked={draft.pinned} onChange={e=>setDraft(d=>({...d,pinned:e.target.checked}))}/><span><strong>Pin this note</strong><small>Keep it at the top of the notes list.</small></span></label>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <div className="task-actions"><button className="primary-button" onClick={save}>Save note</button><button className="btn" onClick={()=>setEditing(null)}>Cancel</button></div>
   </div>
  </section>}
  <section className="card"><div className="field"><label htmlFor="note-search">Search personal notes</label><div className="row"><Search size={16} color="var(--muted)"/><input id="note-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or note content"/></div></div></section>
  {filtered.length?<div className="grid grid-2">{filtered.map(note=><article className="card note-card" key={note.id}><div className="row-between"><div className="question-meta">{note.pinned&&<span className="pill primary"><BookMarked size={11}/> Pinned</span>}{note.subjectId&&<span className="pill">{SUBJECTS.find(s=>s.id===note.subjectId)?.short}</span>}{note.topicId&&<span className="pill">Topic linked</span>}</div><div className="task-actions"><button className="icon-button" onClick={()=>begin(note.id)} aria-label="Edit note"><Pencil size={14}/></button><button className="icon-button" onClick={()=>{if(window.confirm('Delete this personal note?'))remove(note.id);}} aria-label="Delete note"><Trash2 size={14}/></button></div></div><h2 style={{fontSize:17,margin:'12px 0 5px'}}>{note.title}</h2><p className="muted text-xs">{new Date(note.updatedAt).toLocaleString('en-IN')}</p><p className="note-preview">{note.body}</p>{note.topicId&&<Link className="text-button" to={'/topics/'+note.topicId}>Open linked topic →</Link>}</article>)}</div>:<div className="card empty-state"><BookMarked size={26}/><h2>{search?'No matching notes':'Your notes start here'}</h2><p>{search?'Try another search term.':'Create a private note for a formula, definition, worked-example reminder or mistake correction.'}</p><button className="btn btn-secondary" onClick={()=>begin()}>Create note</button></div>}
 </main>;
}
