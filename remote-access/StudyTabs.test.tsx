import { test, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import StudyTabs from "./StudyTabs";
import type { NotesClient } from "./notes/notes-client";
import type { FlashcardsClient } from "./flashcards-page/flashcards-client";

const notesClient: NotesClient = {
  listNotes: () => Promise.resolve([]),
  addNote: () => Promise.reject(new Error("not used in this test")),
  updateNote: () => Promise.reject(new Error("not used in this test")),
  checkForUpdates: () => Promise.resolve(false),
  pull: () => Promise.resolve([]),
  sync: () => Promise.resolve(),
};

const flashcardsClient: FlashcardsClient = {
  listDecks: () => Promise.resolve([]),
  saveDeck: () => Promise.reject(new Error("not used in this test")),
};

test("both Notes and Flashcards views are always mounted, with only the inactive one hidden", () => {
  const html = renderToStaticMarkup(React.createElement(StudyTabs, { notesClient, flashcardsClient }));

  // The default active tab is "notes" — both views' markup must still be present
  // in the output (hidden, not unmounted), so a ternary that drops the inactive
  // view entirely would fail this assertion.
  expect(html).toContain("notes-view");
  expect(html).toContain("flashcards-view");
  expect(html).toContain('hidden=""');
});
