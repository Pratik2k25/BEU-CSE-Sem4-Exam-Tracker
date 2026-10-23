import { create } from 'zustand';
import { EXAMS, SUBJECTS, TOPICS, MCQS, type Goal, type Period, type SubjectId, type TopicStatus } from '../data/content';
import { db, persistStudentState, readStudentState, removePdf, savePdf, type DiagnosticRecord, type PersonalNote, type PdfResource, type PracticeAttempt, type RevisionRecord, type StudentProfile, type StudentStateRecord, type StudySession, type StudyTask, type TopicProgressRecord, type WeeklySchedule } from '../database/db';
import { reviseFuturePlan, type PlanInputs } from '../algorithms/planner';

const SUBJECT_IDS = SUBJECTS.map(s => s.id) as SubjectId[];
function defaultAvailability(): WeeklySchedule {
  return {
    '0':{hours:4,periods:['Morning','Evening']},'1':{hours:4,periods:['Evening']},
    '2':{hours:4,periods:['Evening']},'3':{hours:4,periods:['Evening']},
    '4':{hours:4,periods:['Evening']},'5':{hours:5,periods:['Morning','Evening']},
    '6':{hours:5,periods:['Morning','Evening']}
  };
}
function defaultPreparation(): Record<SubjectId,number> {
  return {CN:25,COA:25,FLAT:25,DBMS:25,DAA:25,ETC:25};
}
function initialProfile(): StudentProfile {
  return {name:'',goal:'pass',subjectPreparation:defaultPreparation(),weeklyAvailability:defaultAvailability(),
    onboardingCompleted:false,onboardingStep:0,onboardingAnswers:{},createdAt:Date.now(),updatedAt:Date.now(),
    theme:'system',remindersEnabled:false};
}
function initialRecord(): StudentStateRecord {
  return {profile:initialProfile(),topicProgress:{},tasks:[],attempts:[],sessions:[],notes:[],bookmarks:[],
    revisions:[],pdfMetadata:[],planReason:'Complete onboarding to generate a personal study plan.'};
}
export interface ActivePractice {
  id:string; subjectId:SubjectId|'ALL'; items:import('../data/content').Question[];
  answers:Record<string,number>; index:number; startedAt:number; lastSavedAt:number;
  timed:boolean; timeLimitMinutes?:number; deadlineAt?:number; pausedRemainingMs?:number;
  status:'running'|'paused'; filters:Record<string,string|boolean>;
}
interface Store extends StudentStateRecord {
  hydrated:boolean; activePractice:ActivePractice|null; writtenDrafts:Record<string,string>;
  writtenAssessments:Record<string,'confident'|'partial'|'incorrect'>;
  focusTickAt?:number; persistenceError?:string;
  hydrate:()=>Promise<void>; updateProfile:(patch:Partial<StudentProfile>,replan?:boolean)=>void;
  setOnboardingStep:(step:number)=>void; finishOnboarding:()=>void;
  setPreparation:(subjectId:SubjectId,percent:number)=>void;
  setAvailability:(day:keyof WeeklySchedule,value:WeeklySchedule[keyof WeeklySchedule])=>void;
  setTopicFeedback:(topicId:string,status:TopicStatus,feedback?:'understood'|'partial'|'again')=>void;
  replan:(reason?:string)=>void; updateTask:(id:string,patch:Partial<StudyTask>)=>void;
  completeTask:(id:string,actualSeconds?:number)=>void; postponeTask:(id:string)=>void;
  startFocus:(taskId?:string,topicId?:string,subjectId?:SubjectId)=>void; tickFocus:()=>void;
  pauseFocus:()=>void; finishFocus:()=>void;
  setActivePractice:(practice:ActivePractice|null)=>void; addAttempt:(attempt:PracticeAttempt)=>void;
  setWrittenDraft:(questionId:string,value:string)=>void; assessWritten:(questionId:string,value:'confident'|'partial'|'incorrect')=>void;
  upsertNote:(note:PersonalNote)=>void; deleteNote:(id:string)=>void; toggleBookmark:(id:string)=>void;
  addRevision:(topicId:string,reason:string,dueAt?:string)=>void; completeRevision:(id:string,recall:'correct'|'partial'|'incorrect')=>void;
  saveDiagnostic:(diagnostic:DiagnosticRecord)=>void; addPdf:(pdf:PdfResource)=>Promise<void>; deletePdf:(id:string)=>Promise<void>;
  resetStudentData:()=>Promise<void>; replaceFromBackup:(backup:StudentStateRecord)=>Promise<void>;
}
let saveQueue:Promise<void>=Promise.resolve();
function persisted(state:Store):StudentStateRecord {
  return {profile:state.profile,topicProgress:state.topicProgress,tasks:state.tasks,attempts:state.attempts,
    sessions:state.sessions,notes:state.notes,bookmarks:state.bookmarks,revisions:state.revisions,
    pdfMetadata:state.pdfMetadata,activeSessionId:state.activeSessionId,planReason:state.planReason,
    lastPlanAt:state.lastPlanAt,focusTargetTaskId:state.focusTargetTaskId,activePractice:state.activePractice,
    writtenDrafts:state.writtenDrafts,writtenAssessments:state.writtenAssessments};
}
function persistSnapshot(state:Store) {
  const snapshot=persisted(state);
  saveQueue=saveQueue.catch(()=>undefined).then(()=>persistStudentState(snapshot)).catch(error=>{
    useStudentStore.setState({persistenceError:error instanceof Error?error.message:'Local database write failed.'});
  });
}
function normalizeRecord(input?:Partial<StudentStateRecord>):StudentStateRecord {
  const base=initialRecord();
  if(!input)return base;
  const profile={...base.profile,...input.profile,subjectPreparation:{...base.profile.subjectPreparation,...input.profile?.subjectPreparation},
    weeklyAvailability:{...base.profile.weeklyAvailability,...input.profile?.weeklyAvailability}};
  return {...base,...input,profile,topicProgress:input.topicProgress||{},tasks:input.tasks||[],attempts:input.attempts||[],
    sessions:input.sessions||[],notes:input.notes||[],bookmarks:input.bookmarks||[],revisions:input.revisions||[],
    pdfMetadata:input.pdfMetadata||[],planReason:input.planReason||base.planReason};
}
function migrateOldLocalStorage():Partial<StudentStateRecord>|undefined {
  try{
    const raw=localStorage.getItem('beu-cse-sem4-tracker-local-v1');
    if(!raw)return undefined;
    const old=JSON.parse(raw) as {prefs?:{name?:string;hours?:number;mode?:string;theme?:string};topics?:Record<string,{status?:string;updated?:string}>;notes?:{id:string;title:string;body:string;topic?:string;createdAt?:string}[];mistakes?:{id:string;title:string;body:string;topic?:string;createdAt?:string}[];bookmarks?:string[];scores?:{id:string;date:string;subject:string;correct:number;total:number;percent:number;items?:{id:string;s:SubjectId;q:string;o:string[];a:number;e?:string}[];answers?:Record<string,number>}[];};
    const base=initialRecord();
    const oldStatus:Record<string,TopicStatus>={'Not started':'not-started','Learning':'learning','Practiced':'learning','Recall passed':'review','Exam-ready':'mastered','Needs revision':'partial'};
    for(const [id,value] of Object.entries(old.topics||{})){
      if(value.status)base.topicProgress[id]={id,status:oldStatus[value.status]||'not-started',selfReportedMinutes:0,updatedAt:Date.now()};
    }
    const noteRows=[...(old.notes||[]).map(n=>({...n,pinned:false,subjectId:undefined,topicId:n.topic,createdAt:n.createdAt?Date.parse(n.createdAt):Date.now(),updatedAt:Date.now()})),
      ...(old.mistakes||[]).map(n=>({...n,pinned:false,title:'Correction: '+n.title,subjectId:undefined,topicId:n.topic,createdAt:n.createdAt?Date.parse(n.createdAt):Date.now(),updatedAt:Date.now()}))];
    base.notes=noteRows;
    base.bookmarks=(old.bookmarks||[]).filter(id=>!id.startsWith('topic:'));
    base.profile={...base.profile,name:old.prefs?.name||'',onboardingCompleted:Boolean(old.onboarded),goal:(old.prefs?.mode==='Marks-focused'?'marks':old.prefs?.mode==='Crash course'?'important':'pass') as Goal,subjectPreparation:defaultPreparation(),
      updatedAt:Date.now(),theme:old.prefs?.theme==='dark'?'dark':'system'};
    for(const exam of EXAMS) {
      const subject=exam.id;
      const legacyPref=old.prefs?.hours;
      if(typeof legacyPref==='number')base.profile.weeklyAvailability=Object.fromEntries(Object.entries(base.profile.weeklyAvailability).map(([day,av])=>[day,{...av,hours:Math.min(12,Math.max(0,legacyPref))}])) as WeeklySchedule;
      void subject;
    }
    base.planReason='Existing local tracker data was migrated where the legacy schema was compatible. Review the new study plan before following it.';
    return base;
  }catch{return undefined;}
}
function planInput(s:Store):PlanInputs {
  return {profile:s.profile,topicProgress:s.topicProgress,previousTasks:s.tasks,attempts:s.attempts,now:new Date(),horizonDays:14};
}
function updateAndPersist(set: (fn:(state:Store)=>Partial<Store>|Store)=>void,get:()=>Store,patch:Partial<Store>) {
  set(state=>({...state,...patch}));
  persistSnapshot(get());
}
function isoToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function addDays(iso:string,days:number){const [y,m,d]=iso.split('-').map(Number);const v=new Date(y,m-1,d+days,12);return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;}
export const useStudentStore=create<Store>((set,get)=>({
  ...initialRecord(),hydrated:false,activePractice:null,writtenDrafts:{},writtenAssessments:{},
  async hydrate(){
    let base=normalizeRecord(await readStudentState());
    if(!await db.kv.get('student')){
      const migrated=migrateOldLocalStorage();
      if(migrated)base=normalizeRecord(migrated);
    }
    // A session left running in another tab/browser process is resumed as paused;
    // hidden or offline time is not counted as focus time.
    let sessions=base.sessions;
    let activeSessionId=base.activeSessionId;
    if(activeSessionId){
      sessions=sessions.map(session=>session.id===activeSessionId&&session.status==='active'?{...session,status:'paused',segmentStartedAt:undefined}:session);
    }
    const savedPractice=(base as StudentStateRecord & {activePractice?:ActivePractice}).activePractice||null;
    const value={...base,sessions,activeSessionId,hydrated:true,activePractice:savedPractice,
      writtenDrafts:(base as Store).writtenDrafts||{},writtenAssessments:(base as Store).writtenAssessments||{}};
    set(value);
    if(!base.profile.onboardingCompleted&&base.profile.onboardingStep<0)set({profile:{...base.profile,onboardingStep:0}});
    if(!value.tasks.length && !value.profile.onboardingCompleted){
      // Don't invent a completed plan before the student has reviewed onboarding.
    }else if(!value.tasks.length){
      const next=reviseFuturePlan({...planInput({...get(),...value} as Store),previousTasks:[]});
      set({tasks:next.tasks,planReason:next.explanation,lastPlanAt:Date.now()});
    }
    persistSnapshot(get());
  },
  updateProfile(patch,replan=true){
    const before=get();const profile={...before.profile,...patch,updatedAt:Date.now()};
    const changedGoal=patch.goal!==undefined||patch.subjectPreparation!==undefined||patch.weeklyAvailability!==undefined;
    const next={...before,profile};
    if(replan&&changedGoal){
      const result=reviseFuturePlan(planInput(next as Store));
      next.tasks=result.tasks;next.planReason=result.explanation;next.lastPlanAt=Date.now();
    }
    updateAndPersist(set,get,next);
  },
  setOnboardingStep(step){
    const state=get();updateAndPersist(set,get,{profile:{...state.profile,onboardingStep:Math.max(0,Math.min(7,step)),updatedAt:Date.now()}});
  },
  finishOnboarding(){
    const state=get();const profile={...state.profile,onboardingCompleted:true,onboardingStep:7,updatedAt:Date.now()};
    const next={...state,profile};
    const result=reviseFuturePlan(planInput(next as Store));
    updateAndPersist(set,get,{profile,tasks:result.tasks,planReason:result.explanation,lastPlanAt:Date.now()});
  },
  setPreparation(subjectId,percent){
    const s=get(),subjectPreparation={...s.profile.subjectPreparation,[subjectId]:Math.max(0,Math.min(100,Math.round(percent)))};
    const profile={...s.profile,subjectPreparation,updatedAt:Date.now()};
    const result=reviseFuturePlan(planInput({...s,profile} as Store));
    updateAndPersist(set,get,{profile,tasks:result.tasks,planReason:result.explanation,lastPlanAt:Date.now()});
  },
  setAvailability(day,value){
    const s=get(),weeklyAvailability={...s.profile.weeklyAvailability,[day]:{hours:Math.max(0,Math.min(12,value.hours)),periods:value.periods.filter(p=>['Morning','Afternoon','Evening'].includes(p))}};
    const profile={...s.profile,weeklyAvailability,updatedAt:Date.now()};
    const result=reviseFuturePlan(planInput({...s,profile} as Store));
    updateAndPersist(set,get,{profile,tasks:result.tasks,planReason:result.explanation,lastPlanAt:Date.now()});
  },
  setTopicFeedback(topicId,status,feedback){
    const s=get(),previous=s.topicProgress[topicId],record:TopicProgressRecord={id:topicId,status,feedback,
      selfReportedMinutes:previous?.selfReportedMinutes||0,lastStudiedAt:Date.now(),updatedAt:Date.now()};
    const revisions=s.revisions.filter(r=>r.topicId!==topicId||r.completedAt);
    if(feedback!=='understood'||status==='review'||status==='partial'){
      revisions.push({id:`revision:${topicId}`,topicId,dueAt:feedback==='again'||feedback==='partial'?isoToday():addDays(isoToday(),1),intervalDays:1,reason:feedback==='again'?'Student requested another pass':feedback==='partial'?'Partially understood topic':'Scheduled spaced recall'});
    }else if(feedback==='understood'&&status==='mastered'){
      revisions.push({id:`revision:${topicId}`,topicId,dueAt:addDays(isoToday(),3),intervalDays:3,reason:'Spaced recall after confident feedback'});
    }
    const topicProgress={...s.topicProgress,[topicId]:record};
    const result=reviseFuturePlan({...planInput({...s,topicProgress} as Store),topicProgress});
    updateAndPersist(set,get,{topicProgress,revisions,tasks:result.tasks,planReason:result.explanation,lastPlanAt:Date.now()});
  },
  replan(reason){
    const s=get(),result=reviseFuturePlan(planInput(s));
    updateAndPersist(set,get,{tasks:result.tasks,planReason:reason?reason+' '+result.explanation:result.explanation,lastPlanAt:Date.now()});
  },
  updateTask(id,patch){
    const s=get();const tasks=s.tasks.map(t=>t.id===id?{...t,...patch}:t);
    const shouldPlan=patch.status==='completed'||patch.status==='missed'||patch.status==='postponed'||patch.date!==undefined;
    if(shouldPlan){
      const result=reviseFuturePlan({...planInput({...s,tasks} as Store),previousTasks:tasks});
      updateAndPersist(set,get,{tasks:result.tasks,planReason:patch.status==='completed'?'Future work updated after completing a task. '+result.explanation:result.explanation,lastPlanAt:Date.now()});
    }else updateAndPersist(set,get,{tasks});
  },
  completeTask(id,actualSeconds=0){
    const s=get(),task=s.tasks.find(t=>t.id===id);if(!task)return;
    const tasks=s.tasks.map(t=>t.id===id?{...t,status:'completed' as const,actualSeconds:Math.max(0,Math.round(actualSeconds)),completedAt:Date.now()}:t);
    const topic=s.topicProgress[task.topicId];
    const topicProgress={...s.topicProgress,[task.topicId]:{id:task.topicId,status:topic?.status==='mastered'?'mastered' as const:'learning' as const,
      selfReportedMinutes:topic?.selfReportedMinutes||0,lastStudiedAt:Date.now(),updatedAt:Date.now()}};
    const result=reviseFuturePlan({...planInput({...s,tasks,topicProgress} as Store),previousTasks:tasks,topicProgress});
    updateAndPersist(set,get,{topicProgress,tasks:result.tasks,planReason:'Future work was recalculated after task completion. '+result.explanation,lastPlanAt:Date.now()});
  },
  postponeTask(id){
    const s=get(),task=s.tasks.find(t=>t.id===id);if(!task||task.locked||task.status==='completed')return;
    const nextDate=addDays(task.date>isoToday()?task.date:isoToday(),1);
    const tasks=s.tasks.map(t=>t.id===id?{...t,date:nextDate,status:'postponed' as const}:t);
    const result=reviseFuturePlan({...planInput({...s,tasks} as Store),previousTasks:tasks});
    updateAndPersist(set,get,{tasks:result.tasks,planReason:'An unlocked task was moved forward; future capacity was rechecked. '+result.explanation,lastPlanAt:Date.now()});
  },
  startFocus(taskId,topicId,subjectId){
    const s=get();if(s.activeSessionId){
      const active=s.sessions.find(x=>x.id===s.activeSessionId);
      if(active&&active.status==='paused'){
        const sessions=s.sessions.map(x=>x.id===active.id?{...x,status:'active' as const,segmentStartedAt:Date.now()}:x);
        updateAndPersist(set,get,{sessions,focusTickAt:Date.now()});return;
      }
      return;
    }
    const task=s.tasks.find(t=>t.id===taskId);
    const id='focus-'+Date.now(),now=Date.now();
    const session:StudySession={id,taskId,topicId:topicId||task?.topicId,subjectId:subjectId||task?.subjectId||'CN',
      startedAt:now,segmentStartedAt:now,focusedSeconds:0,status:'active'};
    const sessions=[...s.sessions,session];
    updateAndPersist(set,get,{sessions,activeSessionId:id,focusTargetTaskId:taskId,focusTickAt:now});
  },
  tickFocus(){
    const s=get(),now=Date.now(),session=s.sessions.find(x=>x.id===s.activeSessionId);
    if(!session||session.status!=='active')return;
    const last=s.focusTickAt||session.segmentStartedAt||now,delta=Math.max(0,Math.min(15,Math.floor((now-last)/1000)));
    if(delta<1)return;
    const sessions=s.sessions.map(x=>x.id===session.id?{...x,focusedSeconds:x.focusedSeconds+delta}:x);
    set({sessions,focusTickAt:now});
    persistSnapshot(get());
  },
  pauseFocus(){
    const s=get(),now=Date.now(),session=s.sessions.find(x=>x.id===s.activeSessionId);
    if(!session)return;
    const last=s.focusTickAt||session.segmentStartedAt||now,delta=session.status==='active'?Math.max(0,Math.min(15,Math.floor((now-last)/1000))):0;
    const sessions=s.sessions.map(x=>x.id===session.id?{...x,focusedSeconds:x.focusedSeconds+delta,status:'paused' as const,segmentStartedAt:undefined}:x);
    updateAndPersist(set,get,{sessions,focusTickAt:undefined});
  },
  finishFocus(){
    const s=get(),now=Date.now(),session=s.sessions.find(x=>x.id===s.activeSessionId);
    if(!session)return;
    const last=s.focusTickAt||session.segmentStartedAt||now,delta=session.status==='active'?Math.max(0,Math.min(15,Math.floor((now-last)/1000))):0;
    const sessions=s.sessions.map(x=>x.id===session.id?{...x,focusedSeconds:x.focusedSeconds+delta,endedAt:now,status:'completed' as const,segmentStartedAt:undefined}:x);
    const tasks=s.focusTargetTaskId?s.tasks.map(t=>t.id===s.focusTargetTaskId&&t.status!=='completed'?{...t,status:'completed' as const,actualSeconds:(sessions.find(x=>x.id===session.id)?.focusedSeconds||0)+delta,completedAt:now}:t):s.tasks;
    const result=reviseFuturePlan({...planInput({...s,sessions,tasks} as Store),previousTasks:tasks});
    updateAndPersist(set,get,{sessions,activeSessionId:undefined,focusTargetTaskId:undefined,focusTickAt:undefined,tasks:result.tasks,planReason:'Future tasks updated after the focus session. '+result.explanation,lastPlanAt:Date.now()});
  },
  setActivePractice(practice){updateAndPersist(set,get,{activePractice:practice});},
  addAttempt(attempt){
    const s=get(),attempts=[...s.attempts.filter(a=>a.id!==attempt.id),attempt];
    const revisions=[...s.revisions];
    Object.entries(attempt.topicPerformance).forEach(([topicId,result])=>{
      if(result.incorrect>0){
        const existing=revisions.find(r=>r.topicId===topicId&&!r.completedAt);
        const record:RevisionRecord={id:existing?.id||`revision:${topicId}`,topicId,dueAt:isoToday(),intervalDays:1,reason:`Missed ${result.incorrect} MCQ(s) in the latest attempt`};
        if(existing)Object.assign(existing,record);else revisions.push(record);
      }
    });
    const next={...s,attempts,revisions};
    const plan=reviseFuturePlan(planInput(next as Store));
    updateAndPersist(set,get,{attempts,revisions,tasks:plan.tasks,planReason:'Study time was rebalanced after new MCQ results. '+plan.explanation,lastPlanAt:Date.now(),activePractice:null});
  },
  setWrittenDraft(questionId,value){
    const s=get(),writtenDrafts={...s.writtenDrafts,[questionId]:value};
    updateAndPersist(set,get,{writtenDrafts});
  },
  assessWritten(questionId,value){
    const s=get(),writtenAssessments={...s.writtenAssessments,[questionId]:value};
    if(value!=='confident'){
      const q=TOPICS.find(t=>t.id===questionId);
      if(q){
        const revisions=[...s.revisions.filter(r=>r.topicId!==questionId||r.completedAt),{id:`revision:${questionId}`,topicId:questionId,dueAt:isoToday(),intervalDays:1,reason:'Written-answer self-assessment needs revision'}];
        updateAndPersist(set,get,{writtenAssessments,revisions});return;
      }
    }
    updateAndPersist(set,get,{writtenAssessments});
  },
  upsertNote(note){
    const s=get(),notes=[...s.notes.filter(n=>n.id!==note.id),note];
    updateAndPersist(set,get,{notes});
  },
  deleteNote(id){const s=get();updateAndPersist(set,get,{notes:s.notes.filter(n=>n.id!==id)});},
  toggleBookmark(id){const s=get(),bookmarks=s.bookmarks.includes(id)?s.bookmarks.filter(x=>x!==id):[...s.bookmarks,id];updateAndPersist(set,get,{bookmarks});},
  addRevision(topicId,reason,dueAt=isoToday()){
    const s=get(),existing=s.revisions.find(r=>r.topicId===topicId&&!r.completedAt);
    const rec:RevisionRecord={id:existing?.id||`revision:${topicId}`,topicId,dueAt,intervalDays:1,reason};
    const revisions=existing?s.revisions.map(r=>r.id===existing.id?rec:r):[...s.revisions,rec];
    updateAndPersist(set,get,{revisions});
  },
  completeRevision(id,recall){
    const s=get(),record=s.revisions.find(r=>r.id===id);if(!record)return;
    const nextInterval=recall==='correct'?Math.min(21,Math.max(1,record.intervalDays*2)):1;
    const updated={...record,lastRecall:recall,intervalDays:nextInterval,dueAt:addDays(isoToday(),nextInterval),completedAt:recall==='correct'?Date.now():undefined};
    const revisions=s.revisions.map(r=>r.id===id?updated:r);
    if(recall!=='correct'){
      const previous=s.topicProgress[record.topicId];
      const topicProgress={...s.topicProgress,[record.topicId]:{id:record.topicId,status:'review' as TopicStatus,feedback:recall==='partial'?'partial' as const:'again' as const,
        selfReportedMinutes:previous?.selfReportedMinutes||0,updatedAt:Date.now()}};
      const result=reviseFuturePlan({...planInput({...s,revisions,topicProgress} as Store),revisions,topicProgress});
      updateAndPersist(set,get,{revisions,topicProgress,tasks:result.tasks,planReason:'Revision feedback changed the next study blocks. '+result.explanation,lastPlanAt:Date.now()});
    }else updateAndPersist(set,get,{revisions});
  },
  saveDiagnostic(diagnostic){
    const s=get(),profile={...s.profile,diagnostic,updatedAt:Date.now()};
    const result=reviseFuturePlan(planInput({...s,profile} as Store));
    updateAndPersist(set,get,{profile,tasks:result.tasks,planReason:'A short diagnostic was stored as a weak signal; self-reported preparation percentages were left unchanged. '+result.explanation,lastPlanAt:Date.now()});
  },
  async addPdf(pdf){
    const s=get();await savePdf(pdf);
    const {blob:_blob,...metadata}=pdf;
    const pdfMetadata=[...s.pdfMetadata.filter(p=>p.id!==pdf.id),metadata];
    updateAndPersist(set,get,{pdfMetadata});
  },
  async deletePdf(id){
    const s=get();await removePdf(id);updateAndPersist(set,get,{pdfMetadata:s.pdfMetadata.filter(p=>p.id!==id)});
  },
  async resetStudentData(){
    await db.transaction('rw',db.kv,db.profiles,db.tasks,db.attempts,db.topicProgress,db.sessions,db.notes,db.bookmarks,db.revisions,db.diagnostics,async()=>{
      await Promise.all([db.kv.clear(),db.profiles.clear(),db.tasks.clear(),db.attempts.clear(),db.topicProgress.clear(),db.sessions.clear(),db.notes.clear(),db.bookmarks.clear(),db.revisions.clear(),db.diagnostics.clear()]);
    });
    const base=initialRecord();set({...base,hydrated:true,activePractice:null,writtenDrafts:{},writtenAssessments:{}});persistSnapshot(get());
  },
  async replaceFromBackup(backup){
    const safe=normalizeRecord(backup);
    set({...safe,hydrated:true,activePractice:(backup as Store).activePractice||null,writtenDrafts:(backup as Store).writtenDrafts||{},writtenAssessments:(backup as Store).writtenAssessments||{}});
    await persistStudentState(persisted(get()));
  }
}));
export function allTopicCountBySubject(){return Object.fromEntries(SUBJECT_IDS.map(id=>[id,TOPICS.filter(t=>t.subjectId===id).length]));}

export async function flushStudentPersistence(): Promise<void> { await saveQueue; }
