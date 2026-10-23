import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, CalendarDays, Check, ChevronRight, Home, FileText, UserRound, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { SUBJECTS, displayDate, daysBetween, isArchivedSession } from '../data/content';
import { useStudentStore } from '../state/store';
import { flushStudentPersistence } from '../state/store';
import type { Goal, SubjectId } from '../data/content';

const navItems=[
 {to:'/',label:'Home',icon:Home,match:(p:string)=>p==='/'},
 {to:'/subjects',label:'Subjects',icon:BookOpen,match:(p:string)=>p.startsWith('/subjects')||p.startsWith('/topics')},
 {to:'/pyqs',label:'PYQs',icon:FileText,match:(p:string)=>p.startsWith('/pyqs')},
 {to:'/planner',label:'Planner',icon:CalendarDays,match:(p:string)=>p==='/planner'||p==='/exams'},
 {to:'/profile',label:'Profile',icon:UserRound,match:(p:string)=>['/profile','/settings','/notes','/resources','/revision','/progress','/saved','/help'].some(x=>p===x)}
];
const routeTitle:Record<string,string>={'/':'Your study desk','/subjects':'My subjects','/pyqs':'Previous-year questions','/planner':'Your plan','/profile':'Student profile','/notes':'Personal notes','/resources':'Study resources','/revision':'Revision hub','/progress':'Your progress','/exams':'Exam schedule','/saved':'Saved materials','/help':'Help & privacy'};
const goalLabel:Record<Goal,string>={pass:'Pass my exams',marks:'Score high marks',important:'Important topics + PYQs',mastery:'Concept mastery',revision:'Revision'};
export function AppShell(){
 const location=useLocation(),navigate=useNavigate();
 const profile=useStudentStore(s=>s.profile),tasks=useStudentStore(s=>s.tasks),revisions=useStudentStore(s=>s.revisions);
 const activePractice=useStudentStore(s=>s.activePractice),sessions=useStudentStore(s=>s.sessions),activeSessionId=useStudentStore(s=>s.activeSessionId);
 const persistenceError=useStudentStore(s=>s.persistenceError);
 const updateAvailableRef=useRef(false),updateFn=useRef<((reloadPage?:boolean)=>Promise<void>)|null>(null),updateStarted=useRef(false);
 const [updateAvailable,setUpdateAvailable]=useState(false),[updateStatus,setUpdateStatus]=useState('Checking for updates'),[offline,setOffline]=useState(!navigator.onLine),[showReminders,setShowReminders]=useState(false);
 const [systemDark,setSystemDark]=useState(window.matchMedia?.('(prefers-color-scheme: dark)').matches||false);
 const activeFocus=sessions.find(s=>s.id===activeSessionId);
 const unsafe=Boolean((activePractice&&activePractice.status==='running')||(activeFocus&&activeFocus.status==='active'));
 useEffect(()=>{
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');
  if(!media)return;
  const change=()=>setSystemDark(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);
 },[]);
 useEffect(()=>{
  document.documentElement.dataset.theme=profile.theme==='system'?(systemDark?'dark':'light'):profile.theme;
 },[profile.theme,systemDark]);
 useEffect(()=>{
  const online=()=>setOffline(false),offlineEvent=()=>setOffline(true);
  window.addEventListener('online',online);window.addEventListener('offline',offlineEvent);
  return()=>{window.removeEventListener('online',online);window.removeEventListener('offline',offlineEvent);};
 },[]);
 useEffect(()=>{
  updateFn.current=registerSW({
   immediate:true,
   onNeedRefresh:()=>{updateAvailableRef.current=true;setUpdateAvailable(true);setUpdateStatus('New release downloaded and ready');},
   onOfflineReady:()=>setUpdateStatus('Offline study is ready'),
   onRegisteredSW:()=>setUpdateStatus('Update checks enabled'),
   onRegisterError:()=>setUpdateStatus('Update check failed; the installed version remains available')
  });
  const onVisible=()=>{if(document.visibilityState==='visible'&&navigator.onLine){setUpdateStatus('Checking for updates');void updateFn.current?.(false);}};
  const interval=window.setInterval(()=>{if(document.visibilityState==='visible'&&navigator.onLine)void updateFn.current?.(false);},30*60*1000);
  document.addEventListener('visibilitychange',onVisible);
  return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',onVisible);};
 },[]);
 useEffect(()=>{
  if(!updateAvailable||unsafe||updateStarted.current||!navigator.onLine)return;
  updateStarted.current=true;setUpdateStatus('Saving progress before updating…');
  void flushStudentPersistence().then(()=>updateFn.current?.(true)).catch(()=>{updateStarted.current=false;setUpdateStatus('Update is waiting; local saving needs attention');});
 },[updateAvailable,unsafe]);
 useEffect(()=>{
  const onHidden=()=>{if(document.visibilityState==='hidden'){
   const store=useStudentStore.getState();
   if(store.activeSessionId)store.pauseFocus();
  }};
  document.addEventListener('visibilitychange',onHidden);
  return()=>document.removeEventListener('visibilitychange',onHidden);
 },[]);
 const nextExam=useMemo(()=>{
  const upcoming=SUBJECTS.map(s=>s.exam).filter(e=>daysBetween(new Date(),e.date)>=0).sort((a,b)=>a.date.localeCompare(b.date));
  return upcoming[0];
 },[]);
 const nowTask=tasks.find(t=>t.status==='active')||tasks.filter(t=>t.status==='planned'&&t.date>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.date.localeCompare(b.date)||b.priority-a.priority)[0];
 const dueRevisions=revisions.filter(r=>!r.completedAt&&r.dueAt<=new Date().toISOString().slice(0,10));
 const missed=tasks.filter(t=>t.status==='missed');
 const upcomingDays=nextExam?daysBetween(new Date(),nextExam.date):null;
 const hideNav=location.pathname==='/onboarding'||location.pathname.startsWith('/topics/')||location.pathname.startsWith('/practice/session')||Boolean(activePractice&&activePractice.status==='running');
 const pageTitle=routeTitle[location.pathname]|| (location.pathname.startsWith('/subjects/')?'Subject learning':location.pathname.startsWith('/pyqs/')?'Question details':location.pathname.startsWith('/practice/results/')?'Practice results':'BEU Exam Prep');
 return <div className="app-frame">
  <header className="app-header">
   <NavLink to="/" className="brand" aria-label="BEU Exam Prep home"><img src="./assets/logo.svg" width="40" height="40" alt=""/><span><strong>BEU Exam Prep</strong><small>CSE · Semester 4</small></span></NavLink>
   <div className="header-actions"><span className={'connectivity '+(offline?'is-offline':'')} title={offline?'Offline':'Online'}>{offline?<WifiOff size={16}/>:<Wifi size={16}/>}<span>{offline?'Offline':'Online'}</span></span>
    <button className="icon-button" type="button" aria-label="Open reminders" onClick={()=>setShowReminders(x=>!x)}><Bell size={19}/>{(dueRevisions.length+missed.length)>0&&<i className="notification-dot"/>}</button>
   </div>
  </header>
  {showReminders&&<div className="reminder-popover card" role="dialog" aria-label="Study reminders"><div className="reminder-head"><div><p className="eyebrow">REMINDERS</p><h2>Your next steps</h2></div><button className="icon-button" onClick={()=>setShowReminders(false)} aria-label="Close reminders"><X size={18}/></button></div>
    {nextExam?<div className="reminder-row"><CalendarDays size={18}/><div><strong>{nextExam.name}</strong><p>{displayDate(nextExam.date)} · {upcomingDays===0?'Exam day':upcomingDays+' days left'}</p></div></div>:<p className="muted">The configured exam session has ended. You’re in revision/practice mode.</p>}
    <div className="reminder-row"><Check size={18}/><div><strong>{dueRevisions.length} revision(s) due</strong><p>Incorrect and partially recalled topics are queued first.</p></div><button className="text-button" onClick={()=>{setShowReminders(false);navigate('/revision')}}>Open</button></div>
    {missed.length>0&&<div className="reminder-row"><CalendarDays size={18}/><div><strong>{missed.length} missed task(s)</strong><p>Reconcile them in Planner.</p></div><button className="text-button" onClick={()=>{setShowReminders(false);navigate('/planner')}}>Review</button></div>}
    <button className="btn btn-secondary btn-full" onClick={()=>{setShowReminders(false);navigate('/profile')}}>Reminder preferences</button>
  </div>}
  {offline&&<div className="status-strip"><WifiOff size={15}/> Offline mode · cached built-in material and local progress remain available. New updates cannot be checked now.</div>}
  {persistenceError&&<div className="status-strip is-warning">Local save error: {persistenceError}. Export a backup and check device storage.</div>}
  {updateAvailable&&<div className="status-strip update-strip"><RefreshCw size={16}/><span>{unsafe?'An update is ready and will wait until your active work is saved.':'A new release is ready.'}</span>{!unsafe&&<button className="text-button" onClick={()=>{void flushStudentPersistence().then(()=>updateFn.current?.(true));}}>Update now</button>}</div>}
  <main id="main-content" className={'app-main '+(hideNav?'is-immersive':'')} tabIndex={-1}>
   <div className="desktop-page-title"><span>{pageTitle}</span>{profile.name&&<small>{profile.name} · {goalLabel[profile.goal]}</small>}</div>
   <Outlet/>
  </main>
  {!hideNav&&<nav className="floating-nav" aria-label="Primary navigation">
   {navItems.map(item=>{const Icon=item.icon,active=item.match(location.pathname);return <NavLink key={item.to} to={item.to} end={item.to==='/'} aria-current={active?'page':undefined} className={'nav-item '+(active?'active':'')}>
    <Icon size={21} strokeWidth={active?2.4:2}/><span>{item.label}</span>
   </NavLink>;})}
  </nav>}
  <footer className={'app-footer '+(hideNav?'immersive-footer':'')}>Private by design · Study data stays on this device · v{__APP_VERSION__}</footer>
 </div>;
}
