const labels = {
 change: 'Symptoms compared with usual', functionChange: 'Walking or daily function worse?', repeatedWorsening: 'Repeated worsening across sessions?', redFlags: 'Concerning symptoms', notes: 'Your notes',
 surgeryDate: 'Surgery date', repairSide: 'Repaired side', restrictions: 'Current restrictions', complications: 'Complications reported', clearance: 'Clinician clearance recorded', noRestrictions: 'No current clinician restrictions',
 pain: 'Achilles pain', stiffness: 'Morning stiffness', swelling: 'Extra swelling', previousResponse: 'Response to previous workout', recovery: 'Recovery', unusualSymptoms: 'Unusual symptoms'
};
const values = {change:{baseline:'Back to usual baseline',meaningful:'Meaningful increase',substantial:'Large deterioration',medical:'Concerning acute symptoms'},swelling:{normal:'No extra swelling'},quality:{good:'Good control',reduced:'Reduced control'},symptoms:{none:'None / usual baseline',increased:'Increased'},overallDifficulty:{right:'About right','too-hard':'Too hard'},immediateAchillesResponse:{good:'Good',mild:'Mild symptoms',worse:'Worse than expected'}};
export const statusLabel = status => ({TOLERATED:'Session tolerated',PENDING_NEXT_DAY_RESPONSE:'Awaiting next-morning response',BORDERLINE:'Response needs attention',NOT_TOLERATED:'Session not tolerated',MEDICAL_FLAG:'Medical review needed'}[status] || 'Status not recorded');
export const readinessLabel = status => ({GREEN:'Ready to train',YELLOW_1:'Modified training — mild symptoms',YELLOW_2:'Modified training — moderate symptoms',YELLOW_3:'Recovery-focused training',RED:'Safety hold'}[status] || 'Not recorded');
const words = value => String(value).replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_',' ').replaceAll('-',' ');
export function displayValue(key,value) {
 if (value == null || value === '') return 'Not recorded';
 if (Array.isArray(value)) return value.length ? value.map(v=>displayValue(key,v)).join(', ') : 'None reported';
 if (typeof value === 'object') return readableDetails(value).map(([k,v])=>`${k}: ${v}`).join('; ');
 if (key === 'notes' || key === 'restrictions' || key === 'surgeryDate') return String(value);
 const result = values[key]?.[value] || words(value);
 return result.charAt(0).toUpperCase()+result.slice(1);
}
export function readableDetails(record) {
 if (!record || typeof record !== 'object' || Array.isArray(record)) return [];
 return Object.entries(record).map(([key,value]) => [labels[key] || words(key),displayValue(key,value)]);
}
export function responseLines(response) {
 if (!response || typeof response !== 'object' || Array.isArray(response)) return ['Next-morning response not recorded. Same-day completion does not establish tolerance.'];
 const entries = ['change','functionChange','repeatedWorsening'].map(key=>[labels[key],displayValue(key,response[key])]);
 for (const key of ['redFlags','notes']) if (response[key] !== undefined) entries.push([labels[key],displayValue(key,response[key])]);
 return entries.map(([label,value])=>`${label}: ${value}`);
}
