import { EXAMS, SUBJECTS, TOPICS, dateValue, daysBetween, type Goal, type Period, type SubjectId, type Topic } from '../data/content';
import type { StudentProfile, StudyTask, TopicProgressRecord } from '../database/db';

export interface PlanInputs {
  profile: StudentProfile; topicProgress: Record<string, TopicProgressRecord>;
  previousTasks: StudyTask[]; attempts: { subjectId: SubjectId|'ALL'; accuracy: number; questionIds: string[]; answers?: Record<string, number>; topicPerformance?: Record<string,{attempted:number;correct:number;incorrect:number}> }[];
  now?: Date; horizonDays?: number;
}
export interface SubjectPriority { subjectId: SubjectId; score: number; daysToExam: number; gap: number; reasons: string[] }
const goalWeights: Record<Goal,{urgency:number;gap:number;importance:number;weakness:number;pyq:number;revision:number}> = {
  pass: { urgency:1.4,gap:1.4,importance:1.2,weakness:.8,pyq:1.0,revision:.8 },
  marks:{ urgency:1.7,gap:1.2,importance:1.1,weakness:1.3,pyq:1.1,revision:1.0 },
  important:{ urgency:1.5,gap:1.0,importance:1.8,weakness:.9,pyq:1.7,revision:.7 },
  mastery:{ urgency:.9,gap:1.3,importance:1.1,weakness:1.0,pyq:.6,revision:.9 },
  revision:{ urgency:1.4,gap:.6,importance:.8,weakness:1.6,pyq:.8,revision:1.8 }
};
const importanceWeight = (value: Topic['importance']) => value === 'High' ? 1 : value === 'Medium' ? .62 : .32;
const weekdayKey = (date: Date) => String(date.getDay()) as keyof StudentProfile['weeklyAvailability'];
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function rankSubjects(input: PlanInputs): SubjectPriority[] {
  const now = input.now || new Date(), weights = goalWeights[input.profile.goal];
  const attempts = input.attempts;
  return SUBJECTS.map(subject => {
    const daysToExam = daysBetween(now, subject.exam.date);
    const prep = Math.max(0, Math.min(100, input.profile.subjectPreparation[subject.id] ?? 0));
    const gap = 1 - prep/100;
    const weaknessAttempts = attempts.filter(a => a.subjectId === subject.id);
    const weakness = weaknessAttempts.length ? Math.max(0, (100 - weaknessAttempts.slice(-5).reduce((s,a)=>s+a.accuracy,0)/Math.min(5,weaknessAttempts.length))/100) : input.profile.diagnostic?.subjectScores[subject.id]?.attempted
      ? 1-input.profile.diagnostic.subjectScores[subject.id].correct/Math.max(1,input.profile.diagnostic.subjectScores[subject.id].attempted) : .25;
    const dueRevision = Object.values(input.topicProgress).filter(p => p.status === 'review' || p.feedback === 'again').length / Math.max(1, TOPICS.filter(t=>t.subjectId===subject.id).length);
    const urgency = daysToExam < 0 ? 0 : 1/(1+daysToExam/5);
    const score = urgency*weights.urgency + gap*weights.gap + .55*weights.importance + weakness*weights.weakness + .6*weights.pyq + dueRevision*weights.revision;
    const reasons:string[]=[];
    if (daysToExam >= 0 && daysToExam <= 4) reasons.push('Exam deadline is close');
    if (gap >= .6) reasons.push('Self-reported syllabus gap is large');
    if (weakness >= .45) reasons.push('Diagnostic/practice indicates weak recall');
    if (dueRevision > 0) reasons.push('Revision is due');
    return { subjectId:subject.id,score,daysToExam,gap,reasons };
  }).filter(s=>s.daysToExam>=0).sort((a,b)=>b.score-a.score || a.daysToExam-b.daysToExam || a.subjectId.localeCompare(b.subjectId));
}
function topicScore(topic: Topic, input: PlanInputs, subjectRank: Map<SubjectId,number>, date: Date): {score:number;reason:string} {
  const w = goalWeights[input.profile.goal], progress = input.topicProgress[topic.id];
  const rank = subjectRank.get(topic.subjectId) || 0, exam = EXAMS.find(e=>e.id===topic.subjectId)!;
  const gap = 1-(input.profile.subjectPreparation[topic.subjectId] ?? 0)/100;
  const statusGap = progress?.status==='mastered' ? .1 : progress?.status==='learning' ? .75 : progress?.status==='partial' ? 1 : .9;
  const effortFactor = topic.estimatedMinutes/50;
  const due = progress?.status==='review' || progress?.feedback==='again' ? 1.4 : 0;
  const linkedQuestions = (input.attempts || []).reduce((n,a)=>n+(a.topicPerformance?.[topic.id]?.incorrect || 0),0);
  const urgency = 1/(1+Math.max(0,daysBetween(date,exam.date))/5);
  const goalBoost = input.profile.goal==='mastery' && topic.prerequisites.length ? .12 : 0;
  const score = rank*.4 + gap*w.gap + importanceWeight(topic.importance)*w.importance + linkedQuestions*.4*w.weakness + due*w.revision + urgency*w.urgency + goalBoost - effortFactor*.03;
  const reason = due ? 'A recall check or revision is due' : linkedQuestions ? 'Past practice showed errors for this topic' : urgency>.55 ? 'Scheduled early because the exam is approaching' : topic.importance==='High' ? 'High-priority syllabus topic' : 'To close remaining syllabus gaps';
  return {score,reason};
}
function taskKind(goal: Goal, topic: Topic, sequence: number, hasMcq: boolean): StudyTask['kind'] {
  if (goal==='revision') return sequence%3===0 ? 'Revision' : 'Recall';
  if (sequence%4===3) return 'Recall';
  if (sequence%3===2 && hasMcq) return 'MCQ practice';
  if (goal==='marks' && topic.importance==='High' && sequence%2===0) return 'Worked example';
  return 'Learn';
}
export function generateStudyPlan(input: PlanInputs): StudyTask[] {
  const now = input.now || new Date(), today=isoDate(now), horizon=Math.max(1,Math.min(28,input.horizonDays||14));
  const old = input.previousTasks || [];
  const keep = old.filter(t => t.status==='completed' || t.date<today || (t.locked && t.date>=today));
  const reserved = new Set(keep.filter(t=>t.locked && t.date>=today).map(t=>t.id));
  const dailyLocked = new Map<string,number>();
  keep.filter(t=>t.locked && t.date>=today && t.status!=='completed').forEach(t=>dailyLocked.set(t.date,(dailyLocked.get(t.date)||0)+t.durationMinutes));
  const ranked=rankSubjects(input), subjectRank=new Map(ranked.map((x,i)=>[x.subjectId,(ranked.length-i)/ranked.length]));
  const planned:StudyTask[]=[...keep], plannedIds=new Set(keep.map(t=>t.id));
  let sequence=0;
  for(let offset=0;offset<horizon;offset++){
    const day=new Date(now.getFullYear(),now.getMonth(),now.getDate()+offset,12), date=isoDate(day), av=input.profile.weeklyAvailability[weekdayKey(day)];
    if(!av || av.hours<=0) continue;
    let remaining=Math.max(0,Math.round(av.hours*60)-(dailyLocked.get(date)||0));
    const usedTopics=new Set<string>(keep.filter(t=>t.date===date).map(t=>t.topicId));
    const candidates=TOPICS.filter(topic=>{
      const exam=EXAMS.find(e=>e.id===topic.subjectId)!;
      return daysBetween(day,exam.date)>=0 && !usedTopics.has(topic.id) &&
       input.topicProgress[topic.id]?.status!=='mastered' &&
       !(input.topicProgress[topic.id]?.status==='review' && input.topicProgress[topic.id]?.feedback==='understood');
    }).map(topic=>({...topic,rank:topicScore(topic,input,subjectRank,day)}))
      .sort((a,b)=>b.rank.score-a.rank.score || a.id.localeCompare(b.id));
    let cursor=0;
    while(remaining>=20 && cursor<candidates.length){
      const topic=candidates[cursor++], subject=SUBJECTS.find(s=>s.id===topic.subjectId)!;
      const questions=input.attempts.some(a=>a.questionIds.some(id=>id.startsWith(topic.subjectId.toLowerCase()) || id.includes(topic.id)));
      const kind=taskKind(input.profile.goal,topic,sequence++,questions);
      const duration=Math.min(remaining,kind==='Recall'?20:Math.max(25,Math.min(topic.estimatedMinutes,50)));
      if(duration<15)break;
      const id=`${date}:${topic.id}:${kind.toLowerCase().replace(/\s+/g,'-')}`;
      if(plannedIds.has(id)||reserved.has(id))continue;
      const periods=av.periods.length?av.periods:['Evening'];
      const period=periods[(sequence-1)%periods.length];
      planned.push({id,date,subjectId:topic.subjectId,topicId:topic.id,title:topic.title,kind,durationMinutes:duration,period,priority:Math.round(topic.rank.score*100),reason:topic.rank.reason,status:'planned',locked:false,generatedAt:today});
      plannedIds.add(id);usedTopics.add(topic.id);remaining-=duration;
    }
  }
  return planned.sort((a,b)=>a.date.localeCompare(b.date)||Number(b.locked)-Number(a.locked)||b.priority-a.priority||a.id.localeCompare(b.id));
}
export function reviseFuturePlan(input: PlanInputs): {tasks: StudyTask[]; explanation: string} {
  const tasks=generateStudyPlan(input);
  const locked=input.previousTasks.filter(t=>t.locked&&t.date>=isoDate(input.now||new Date())).length;
  const explanation=locked
    ? `Future unlocked work was redistributed around ${locked} locked task(s); completed history was preserved.`
    : 'Future work was regenerated from exam deadlines, preparation gaps, topic importance, revision signals and available daily hours.';
  return {tasks,explanation};
}
export function subjectMinutes(tasks:StudyTask[], subjectId:SubjectId, date?:string):number{
  return tasks.filter(t=>t.subjectId===subjectId&&(!date||t.date===date)&&t.status!=='completed').reduce((sum,t)=>sum+t.durationMinutes,0);
}
export function dailyMinutes(tasks:StudyTask[], date:string):number{
  return tasks.filter(t=>t.date===date&&t.status!=='completed').reduce((sum,t)=>sum+t.durationMinutes,0);
}
