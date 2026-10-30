// notes/capture-entry.tsx
import { createRoot } from "react-dom/client";
import StudyTabs from "../StudyTabs";
import { createGithubClient, TOKEN_STORAGE_KEY } from "./github-client";
import { createFlashcardsGithubClient } from "../flashcards-page/flashcards-github-client";

function getOrPromptToken(): string {
  const existing = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (existing) return existing;
  const entered = window.prompt(
    "Paste your GitHub personal access token (scoped to the notes-data repo):",
  );
  const token = entered?.trim() ?? "";
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  return token;
}

const token = getOrPromptToken();
const notesClient = createGithubClient({
  owner: "Jung028",
  repo: "notes-data",
  token,
  storage: localStorage,
});
const flashcardsClient = createFlashcardsGithubClient({
  owner: "Jung028",
  repo: "notes-data",
  token,
  storage: localStorage,
});

createRoot(document.getElementById("root")!).render(
  <StudyTabs notesClient={notesClient} flashcardsClient={flashcardsClient} />,
);
