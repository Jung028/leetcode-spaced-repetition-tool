// flashcards-page/FlashcardsView.tsx
import { useEffect, useMemo, useState } from "react";
import type { FlashcardDeck } from "./flashcard-parser";
import type { FlashcardsClient } from "./flashcards-client";
import { groupDecksBySubject } from "./flashcards-grouping";
import FlashcardsSidebar from "./FlashcardsSidebar";
import FlashcardsDeckUploader from "./FlashcardsDeckUploader";
import FlashcardsCard from "./FlashcardsCard";
import "../notes/notes.css";

export default function FlashcardsView({ client }: { client: FlashcardsClient }) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | null>(null);
  const [selectedExamSlug, setSelectedExamSlug] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const load = async () => {
    try {
      setDecks(await client.listDecks());
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => groupDecksBySubject(decks), [decks]);
  const selectedDeck =
    decks.find((d) => d.subjectSlug === selectedSubjectSlug && d.examSlug === selectedExamSlug) ?? null;
  const selectedSubjectLabel = groups.find((g) => g.subjectSlug === selectedSubjectSlug)?.subject;

  const selectDeck = (subjectSlug: string, examSlug: string) => {
    setSelectedSubjectSlug(subjectSlug);
    setSelectedExamSlug(examSlug);
    setCardIndex(0);
    setFlipped(false);
  };

  const handleSave = async () => {
    const markdown = uploadText.trim();
    if (!markdown) return;
    setBusy(true);
    try {
      const deck = await client.saveDeck(markdown);
      setUploadText("");
      setStatus(null);
      await load();
      selectDeck(deck.subjectSlug, deck.examSlug);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const goPrev = () => {
    if (!selectedDeck) return;
    setCardIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
  };

  const goNext = () => {
    if (!selectedDeck) return;
    setCardIndex((i) => Math.min(selectedDeck.cards.length - 1, i + 1));
    setFlipped(false);
  };

  return (
    <div className="flashcards-view">
      <FlashcardsSidebar
        groups={groups}
        selectedSubjectSlug={selectedSubjectSlug}
        selectedExamSlug={selectedExamSlug}
        onSelectDeck={selectDeck}
      />
      <div className="flashcards-content">
        {status && <p className="notes-status">{status}</p>}
        <FlashcardsDeckUploader value={uploadText} onChange={setUploadText} onSave={handleSave} busy={busy} />
        {selectedDeck ? (
          <>
            <h2 className="flashcards-deck-title">
              {selectedSubjectLabel} · Exam {selectedDeck.exam}
            </h2>
            <FlashcardsCard
              deck={selectedDeck}
              cardIndex={cardIndex}
              flipped={flipped}
              onFlip={() => setFlipped((v) => !v)}
              onPrev={goPrev}
              onNext={goNext}
            />
          </>
        ) : (
          <p className="flashcards-empty">Pick a subject and exam on the left, or paste a new deck above.</p>
        )}
      </div>
    </div>
  );
}
