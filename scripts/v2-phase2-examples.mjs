// Disposable synthetic IndexedDB only. Never reads browser or personal data.
import 'fake-indexeddb/auto';
import { writeFile } from 'node:fs/promises';
import { put, exportAll, closeDb } from '../src/db.js';
import { atomicV2, materializeLegacy } from '../src/persistence/v2Repository.js';
import { persistedFixtures } from '../tests/fixtures/v2/persisted.mjs';
import { legacy } from '../tests/fixtures/v2/records.mjs';
const records = persistedFixtures();
await atomicV2(Object.entries(records).map(([store, record]) => ({ store, record, expectedRevision: null })));
await put('sessions', legacy.normal);
await materializeLegacy(legacy.normal);
await writeFile('artifacts/v2-phase2-record-examples.json', JSON.stringify(records, null, 2));
await writeFile('artifacts/v2-phase2-backup-example.json', JSON.stringify(await exportAll(), null, 2));
closeDb();
console.log('Wrote synthetic V2 records and mixed V1/V2 backup examples.');

