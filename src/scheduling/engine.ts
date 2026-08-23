import { Task } from '../types/task';

export type ScheduledBlock = Task & { scheduledStart: string; scheduledEnd: string; isProtected: boolean };

function minutesToDate(base: Date, minutes: number) { const d=new Date(base); d.setHours(Math.floor(minutes/60), minutes%60, 0, 0); return d; }
function priorityScore(priority: Task['priority']) { return { low:1, medium:2, high:3, critical:4 }[priority]; }

/** Deterministic scheduling layer. AI may propose tasks, but this engine owns ordering and safety rules. */
export function buildDayPlan(tasks: Task[], date = new Date()): ScheduledBlock[] {
  const fixed=tasks.filter(t=>t.kind==='fixed'&&t.startsAt).sort((a,b)=>new Date(a.startsAt!).getTime()-new Date(b.startsAt!).getTime());
  const flexible=tasks.filter(t=>t.kind!=='fixed'&&t.status!=='completed'&&t.status!=='cancelled').sort((a,b)=>priorityScore(b.priority)-priorityScore(a.priority));
  const result:ScheduledBlock[]=[]; let cursor=8*60;
  for(const task of fixed){const start=new Date(task.startsAt!);const duration=Math.max(10,task.durationMinutes??30);result.push({...task,scheduledStart:start.toISOString(),scheduledEnd:new Date(start.getTime()+duration*60000).toISOString(),isProtected:true});}
  for(const task of flexible){const duration=Math.max(10,task.durationMinutes??30);let start=minutesToDate(date,cursor);let end=new Date(start.getTime()+duration*60000);const conflict=result.find(block=>start<new Date(block.scheduledEnd)&&end>new Date(block.scheduledStart));if(conflict){cursor=Math.max(cursor+10,new Date(conflict.scheduledEnd).getHours()*60+new Date(conflict.scheduledEnd).getMinutes());start=minutesToDate(date,cursor);end=new Date(start.getTime()+duration*60000);}if(start.getHours()>=22)break;result.push({...task,scheduledStart:start.toISOString(),scheduledEnd:end.toISOString(),isProtected:task.priority==='critical'||task.kind==='self-care'});cursor+=duration+(duration>=60?15:10);if(cursor>21*60)break;}
  return result.sort((a,b)=>new Date(a.scheduledStart).getTime()-new Date(b.scheduledStart).getTime());
}

export function parseNaturalTaskText(input:string, baseDate=new Date()):Partial<Task>[] {
  const pieces=input.split(/\n|,|\band\b/gi).map(s=>s.trim()).filter(Boolean);
  return pieces.map(title=>{const lower=title.toLowerCase();const kind:Task['kind']=/(pray|salah|fajr|dhuhr|asr|maghrib|isha|appointment|meeting|class|shift)/i.test(title)?'fixed':/(rest|sleep|break|eat|breakfast|lunch|dinner|bath)/i.test(title)?'self-care':'flexible';const priority:Task['priority']=/(must|urgent|important|deadline|absolutely|critical)/i.test(title)?'high':'medium';const durationMatch=lower.match(/(\d+)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)/);const durationMinutes=durationMatch?(/hour|hr/.test(durationMatch[2])?Number(durationMatch[1])*60:Number(durationMatch[1])):kind==='self-care'?30:45;const time=extractTime(title,baseDate);return{title,kind,priority,durationMinutes,status:'inbox' as const,...(time?{startsAt:time}:{})};});
}

function extractTime(text:string,baseDate:Date){
  const match=text.match(/(?:at|by|around|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i); if(!match)return undefined;
  let hour=Number(match[1]);const minute=Number(match[2]||0);const meridiem=match[3]?.toLowerCase();const context=text.toLowerCase();
  if(meridiem==='pm'&&hour<12)hour+=12; if(meridiem==='am'&&hour===12)hour=0;
  if(!meridiem){if(/\b(morning|dawn|early)\b/.test(context)&&hour===12)hour=0;else if(/\b(morning|dawn|early)\b/.test(context))hour=hour;else if(/\b(afternoon|evening|night)\b/.test(context)&&hour<12)hour+=12;else if(hour<=6)hour+=12;}
  const d=new Date(baseDate);d.setHours(hour,minute,0,0);return d.toISOString();
}
