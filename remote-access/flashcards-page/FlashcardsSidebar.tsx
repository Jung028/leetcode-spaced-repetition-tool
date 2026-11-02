// flashcards-page/FlashcardsSidebar.tsx
import type { SubjectGroup } from "./flashcards-grouping";

export default function FlashcardsSidebar({
  groups,
  selectedSubjectSlug,
  selectedExamSlug,
  onSelectDeck,
}: {
  groups: SubjectGroup[];
  selectedSubjectSlug: string | null;
  selectedExamSlug: string | null;
  onSelectDeck: (subjectSlug: string, examSlug: string) => void;
}) {
  return (
    <nav className="flashcards-sidebar" aria-label="Decks">
      <h2 className="flashcards-sidebar-heading">Decks</h2>
      {groups.map((group) => {
        const numberedExams = group.decks.filter((deck) => /^\d+$/.test(deck.exam)).length;
        const otherDecks = group.decks.length - numberedExams;
        return (
          <details key={group.subjectSlug} className="flashcards-subject" open={group.subjectSlug === selectedSubjectSlug}>
            <summary className="flashcards-subject-heading">
              <span>{group.subject}</span>
              <span className="flashcards-subject-count">
                {numberedExams} exams{otherDecks > 0 ? ` · ${otherDecks} extra` : ""}
              </span>
            </summary>
            <ul className="flashcards-deck-list">
              {group.decks.map((deck) => (
                <li key={deck.examSlug}>
                  <button
                    type="button"
                    className={
                      group.subjectSlug === selectedSubjectSlug && deck.examSlug === selectedExamSlug
                        ? "flashcards-deck-item flashcards-deck-item-active"
                        : "flashcards-deck-item"
                    }
                    onClick={() => onSelectDeck(group.subjectSlug, deck.examSlug)}
                  >
                    <span>Exam {deck.exam}</span>
                    <span className="flashcards-deck-count">{deck.cards.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      {groups.length === 0 && <p className="flashcards-empty">No decks yet — paste one below</p>}
    </nav>
  );
}
