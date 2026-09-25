export function displayDate(value, monthOnly = false) {
 if (!value) return 'Not recorded';
 const date = new Date(String(value).length === 7 ? value+'-01T12:00:00' : String(value).length === 10 ? value+'T12:00:00' : value);
 return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, monthOnly ? {month:'long',year:'numeric'} : {month:'short',day:'numeric',year:'numeric'});
}
