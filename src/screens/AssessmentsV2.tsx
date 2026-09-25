import { useEffect, useState } from "react";
import { TestsScreen } from "./TestsScreen";
import { BaselineWizard } from "./SimpleBaseline";
import {
  loadProgram,
  loadSessions,
  completeBaseline,
  saveCheckpoint,
} from "../persistence/repository";
export default function AssessmentsV2() {
  const [program, setProgram] = useState<any>(null),
    [sessions, setSessions] = useState<any[]>([]),
    [edit, setEdit] = useState(false),
    [error, setError] = useState("");
  async function refresh() {
    const [p, s] = await Promise.all([loadProgram(), loadSessions()]);
    setProgram(p);
    setSessions(s);
  }
  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
  }, []);
  if (!program) return <p role="status">{error || "Loading assessments…"}</p>;
  return (
    <section>
      <p>
        Assessments inform guidance. They do not prevent you from building,
        starting or saving a workout.
      </p>
      {edit ? (
        <BaselineWizard
          draft={program.draft}
          previous={program.assessment}
          checkpoints={program.checkpoints}
          sessions={sessions}
          onBack={() => setEdit(false)}
          onComplete={async (v) => {
            await completeBaseline(v);
            await refresh();
            setEdit(false);
          }}
        />
      ) : (
        <TestsScreen
          {...program}
          sessions={sessions}
          onBaseline={() => setEdit(true)}
          onCheckpoint={async (v) => {
            await saveCheckpoint(v);
            await refresh();
          }}
        />
      )}
    </section>
  );
}
