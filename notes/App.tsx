// notes/App.tsx
import NotesView from "./NotesView";
import { createLocalClient } from "./local-client";

const client = createLocalClient();

export default function NotesApp() {
  return <NotesView client={client} />;
}
