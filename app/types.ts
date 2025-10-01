export interface Note {
  id: string;
  title: string;
  dateCreated: string; // ISO
  noteContent: string;
  tags: string[];
}

export interface NoteBook {
  id: string;
  title: string;
  dateCreated: string;
  color?: string;
  notes: Note[];
}

export type View = "dashboard" | "calculator" | "notebook" | "counter" | "dice" | "worldclock" | "quickmarks" | "soundboard" | "memoji" | "budget" | "checkers" | "chess";
