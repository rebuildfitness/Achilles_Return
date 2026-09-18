export function RehabProgression({rows=[]}: {rows?: any[]}) {
 if(!rows.length) return null;
 const labels:Record<string,string>={ADVANCE:"Advancing",HOLD:"Holding",QUEUED:"Ready for later review",REGRESS:"Reduced",MAINTAIN:"Maintaining",REPLACED:"Conditioning replaced"};
 return <details className="detail-section rehab-progression"><summary>Rehab progression — what changed?</summary><p>Changes use saved work and responses. Future previews do not count as completed evidence.</p>{rows.map(row=><div key={row.originId}><h3>{row.block}: {labels[row.action] || row.action}</h3><p>{row.prescription}</p><p>{row.reason}</p>{row.sourceSessionId && <small>Based on a saved session. Matrix {row.matrixVersion}.</small>}</div>)}</details>;
}
