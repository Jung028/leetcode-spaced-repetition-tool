// flashcards-page/FlashcardsCard.tsx
import type { FlashcardDeck } from "./flashcard-parser";

export default function FlashcardsCard({
  deck,
  cardIndex,
  flipped,
  onFlip,
  onPrev,
  onNext,
}: {
  deck: FlashcardDeck;
  cardIndex: number;
  flipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const card = deck.cards[cardIndex]!;
  const stem =
    card.part !== null ? deck.cards.find((c) => c.number === card.number && c.part === null) : undefined;

  return (
    <div className="flashcards-card-wrap">
      {stem && (
        <p className="flashcards-card-stem">
          <span className="flashcards-card-stem-label">Q{stem.number}</span> {stem.question}
        </p>
      )}
      <button type="button" className="flashcards-card" onClick={onFlip}>
        <span className="flashcards-card-label">{`Q${card.number}${card.part ? card.part.toUpperCase() : ""}`}</span>
        <p className="flashcards-card-text">{flipped ? card.answer : card.question}</p>
        <span className="flashcards-card-hint">{flipped ? "Tap to see the question" : "Tap to reveal the answer"}</span>
      </button>
      <div className="flashcards-card-nav">
        <button type="button" disabled={cardIndex === 0} onClick={onPrev}>
          Prev
        </button>
        <span className="flashcards-card-progress">
          Card {cardIndex + 1} of {deck.cards.length}
        </span>
        <button type="button" disabled={cardIndex === deck.cards.length - 1} onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
