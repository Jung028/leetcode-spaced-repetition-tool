// notes/App.tsx
import NotesView from "./NotesView";
import { createLocalClient } from "./local-client";
import { WeeklyPlanView } from "../shared/weekly-plan/WeeklyPlanView";
import { TRAINING_PLAN } from "../training/plan";

const client = createLocalClient();

export default function NotesApp() {
  return (
    <>
      <details className="notes-training">
        <summary>This week's training</summary>
        <WeeklyPlanView plan={TRAINING_PLAN} cardsOnly />
      </details>
      <NotesView client={client} />
    </>
  );
}
