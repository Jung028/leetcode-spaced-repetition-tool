// notes/capture-entry.tsx
import { createRoot } from "react-dom/client";
import NotesView from "./NotesView";
import { createGithubClient } from "./github-client";

const TOKEN_KEY = "notes-capture-token";

function getOrPromptToken(): string {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;
  const entered = window.prompt(
    "Paste your GitHub personal access token (scoped to the notes-data repo):",
  );
  const token = entered?.trim() ?? "";
  if (token) localStorage.setItem(TOKEN_KEY, token);
  return token;
}

const token = getOrPromptToken();
const client = createGithubClient({
  owner: "Jung028",
  repo: "notes-data",
  token,
  storage: localStorage,
});

createRoot(document.getElementById("root")!).render(<NotesView client={client} />);
