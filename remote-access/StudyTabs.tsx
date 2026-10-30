// StudyTabs.tsx
import { useState } from "react";
import type { NotesClient } from "./notes/notes-client";
import type { FlashcardsClient } from "./flashcards-page/flashcards-client";
import NotesView from "./notes/NotesView";
import FlashcardsView from "./flashcards-page/FlashcardsView";

type Tab = "notes" | "flashcards";

export default function StudyTabs({
  notesClient,
  flashcardsClient,
}: {
  notesClient: NotesClient;
  flashcardsClient: FlashcardsClient;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  return (
    <>
      <nav className="notes-tabs" aria-label="Study sections">
        <button type="button" className={activeTab === "notes" ? "active" : ""} onClick={() => setActiveTab("notes")}>
          Notes
        </button>
        <button
          type="button"
          className={activeTab === "flashcards" ? "active" : ""}
          onClick={() => setActiveTab("flashcards")}
        >
          Flashcards
        </button>
      </nav>
      <main>{activeTab === "notes" ? <NotesView client={notesClient} /> : <FlashcardsView client={flashcardsClient} />}</main>
    </>
  );
}
