import { SessionEditor } from "./SessionEditor";
import { getAll } from "../db.js";
import { movementRecords } from "../data/movement.js";
import { useEffect, useState } from "react";
import { coachingReport } from "../data/coachingReport.js";
import type { Session } from "../types";
export function CoachingReview({ session, sessions }: {session: Session; sessions: Session[]}) {
 const [movement,setMovement]=useState<any[]|null>(null);
 useEffect(()=>{let active=true;getAll('settings').then(rows=>{if(active)setMovement(movementRecords(rows).filter(r=>r.status==='saved'));}).catch(()=>{});return()=>{active=false;};},[session]);
 const report = coachingReport(session,sessions,movement); const [message,setMessage] = useState('');
 function download() { const url=URL.createObjectURL(new Blob([report],{type:'text/markdown;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download=`achilles-coaching-${session.date}-${session.id.slice(0,8)}.md`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); setMessage('Report download requested.'); }
 async function copy() { try { await navigator.clipboard.writeText(report); setMessage('Coaching report copied.'); } catch { setMessage('Copy is unavailable. Select the report text below or download it.'); } }
 async function share() { try { await navigator.share({title:'Achilles Return coaching review',text:report}); setMessage('Share completed.'); } catch(e) { setMessage(e instanceof Error && e.name==='AbortError' ? 'Share cancelled.' : 'Sharing is unavailable. Use Copy or Download.'); } }
 return <><SessionEditor session={session}/><details className="coaching-review"><summary>AI coaching review</summary><p>Review before sharing. This includes your workout and rehabilitation information. Copy or attach it to your chosen AI conversation; nothing is sent automatically.</p><div className="exercise-actions"><button className="text-button" onClick={copy}>Copy coaching report</button><button className="text-button" onClick={download}>Download Markdown</button>{typeof navigator.share==='function' && <button className="text-button" onClick={share}>Share report</button>}</div><p role="status">{message}</p><label>Coaching report<textarea aria-label="Coaching report" readOnly rows={12} value={report} /></label></details></>;
}
