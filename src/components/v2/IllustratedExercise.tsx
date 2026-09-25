import type { ReactNode } from "react";
import { ExerciseIllustration } from "../ExerciseIllustration";
import { display } from "../../domain/v2/composition.js";

/** Presentation only: exact canonical lookup, never inferred from names or phases. */
export function IllustratedExercise({ definition, children }: {
  definition: any; children: ReactNode;
}) {
  return <ExerciseIllustration key={definition.id} exerciseId={definition.id}
    name={display(definition.name) || definition.id} compact>
    {children}
  </ExerciseIllustration>;
}
