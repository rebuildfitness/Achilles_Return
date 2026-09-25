// Test-only bundle, served exclusively by the disposable browser QA harness.
import * as database from "../src/db.js";
import * as repository from "../src/persistence/v2Repository.js";
import { persistedFixtures } from "../tests/fixtures/v2/persisted.mjs";
window.v2Test = { ...database, ...repository, persistedFixtures };
