import test from 'node:test';
import assert from 'node:assert/strict';
import {responseLines,statusLabel,readableDetails} from '../src/data/responsePresentation.js';
import {coachingReport} from '../src/data/coachingReport.js';
test('Next-morning review preserves notes and translates stored answers without raw JSON',()=>{
 const response={change:'baseline',functionChange:'no',repeatedWorsening:'no',notes:'My Achilles feels better than usual. '};
 const before=JSON.stringify(response);
 const lines=responseLines(response).join('\n');
 assert.match(lines,/Symptoms compared with usual: Back to usual baseline/);
 assert.match(lines,/Walking or daily function worse\?: No/);
 assert.match(lines,/Repeated worsening across sessions\?: No/);
 assert.ok(lines.includes(response.notes));assert.equal(JSON.stringify(response),before);
 const report=coachingReport({id:'1',date:'2026-09-15',status:'TOLERATED',nextDayResponse:response,coachingContext:{clinical:{repairSide:'left'},checkIn:{pain:'none'}}});
 assert.match(report,/Next-morning review: Session tolerated/);
 assert.doesNotMatch(report,/TOLERATED|functionChange|repeatedWorsening|"change"|\{"/);
 assert.match(report,/Repaired side: Left/);
});
test('Missing answers stay unknown and concerning statuses do not become reassuring copy',()=>{
 assert.match(responseLines({})[0],/Not recorded/);
 assert.match(responseLines(undefined)[0],/not recorded/);
 assert.equal(statusLabel('MEDICAL_FLAG'),'Medical review needed');
 assert.equal(statusLabel('NOT_TOLERATED'),'Session not tolerated');
 assert.equal(statusLabel('BORDERLINE'),'Response needs attention');
 assert.equal(statusLabel('unknown'),'Status not recorded');
 assert.equal(readableDetails({unusualSymptoms:[]})[0][1],'None reported');
});
