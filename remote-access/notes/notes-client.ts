export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface NotesClient {
  listNotes(): Promise<Note[]>;
  addNote(text: string): Promise<Note>;
  updateNote(id: string, text: string): Promise<Note>;
  checkForUpdates(): Promise<boolean>;
  pull(): Promise<Note[]>;
  sync(): Promise<void>;
}
