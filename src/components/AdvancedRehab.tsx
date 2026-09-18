import { Card } from "./ui";
import { ADVANCED_REHAB_DEMOS } from "../data/exposures.js";
export function AdvancedRehab({onProgress}: {onProgress:()=>void}) {
 return <Card><h2>Advanced rehab activities</h2>
  <p><strong>Balance pad:</strong> single-leg balance progresses to foam-pad balance after controlled sets and a tolerated next morning.</p>
  <p><strong>BOSU:</strong> Circuit C floor squats progress to supported BOSU squats after qualifying squat work and tolerated foam-pad balance. The plan changes one block at a time. Equipment and recorded balance still apply.</p>
  <p><strong>Forward jog:</strong> use your current Running dose. <strong>Crossovers and backward jog:</strong> use the D5 planned-movement session; a reviewed backward jog replaces a bout within its total, rather than adding another circuit. These drills do not run automatically just because the equipment is available.</p>
  <p>The scheduled impact session replaces the bike finisher. It has its own logger and next-morning response.</p>
  {Object.entries(ADVANCED_REHAB_DEMOS).map(([id,demo])=><p key={id}><a href={demo.videoUrl} target="_blank" rel="noreferrer">Short Demo · {id==="forward"?"Forward jog":demo.name} ↗</a></p>)}
  <button className="secondary-button" onClick={onProgress}>View running & movement readiness</button>
 </Card>;
}
