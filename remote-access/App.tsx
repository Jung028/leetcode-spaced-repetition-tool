// notes/App.tsx
import { createLocalClient } from "./notes/local-client";
import { createFlashcardsLocalClient } from "./flashcards-page/flashcards-local-client";
import { WeeklyPlanView } from "../shared/weekly-plan/WeeklyPlanView";
import { TRAINING_PLAN } from "../training/plan";
import StudyTabs from "./StudyTabs";

const notesClient = createLocalClient();
const flashcardsClient = createFlashcardsLocalClient();

export default function NotesApp() {
  return (
    <>
      <details className="notes-training">
        <summary>This week's training</summary>
        <WeeklyPlanView plan={TRAINING_PLAN} cardsOnly />
      </details>

      <StudyTabs notesClient={notesClient} flashcardsClient={flashcardsClient} />
    </>
  );
}
