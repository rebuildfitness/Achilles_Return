import {readFile,writeFile} from 'node:fs/promises';
import {MOVEMENT_EXERCISES} from '../src/data/movementRoutines.js';
const prior=JSON.parse(await readFile(new URL('../artifacts/illustration-reviews.json',import.meta.url),'utf8'));
const holds=new Set(['diaphragmatic-breathing-with-brace','seated-thoracic-extension-over-chair-back','half-kneeling-hip-flexor-stretch','90-90-breathing','seated-pallof-hold','supported-single-leg-stance','diaphragmatic-breathing','figure-four-glute-stretch']);
const queue=MOVEMENT_EXERCISES.filter(e=>!prior.some(r=>r.id===e.id)).map((e,i)=>({id:e.id,title:e.name,gender:i%2?'woman':'man',motionFormat:holds.has(e.id)?'setup_hold':'start_end',position:e.position,bodyRegion:e.bodyArea,panelDescription:e.setup,mechanics:e.setup}));
await writeFile(new URL('../artifacts/illustration-queue.json',import.meta.url),JSON.stringify(queue,null,2));
console.log(JSON.stringify(queue));
