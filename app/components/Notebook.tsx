"use client";

import React, { useState } from "react";
import type { Note, NoteBook } from "../types";

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const sampleNotebook: NoteBook = {
  id: makeId(),
  title: "My Notes",
  dateCreated: new Date().toISOString(),
  color: "#ffd966",
  notes: [
    {
      id: makeId(),
      title: "First note",
      dateCreated: new Date().toISOString(),
      noteContent: "This is a sample note.",
      tags: ["sample"],
    },
  ],
};

export default function NotebookApp() {
  // Support multiple notebooks for future expansion; start with sample
  const [notebooks, setNotebooks] = useState<NoteBook[]>([sampleNotebook]);
  const [expandedNotebookIds, setExpandedNotebookIds] = useState<Record<string, boolean>>({ [sampleNotebook.id]: true });
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>(sampleNotebook.id);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(sampleNotebook.notes[0]?.id ?? "");

  // Local editing state for the current note
  const currentNotebook = notebooks.find((n) => n.id === selectedNotebookId) as NoteBook | undefined;
  const currentNote = currentNotebook?.notes.find((x) => x.id === selectedNoteId);

  const [draftTitle, setDraftTitle] = useState(currentNote?.title ?? "");
  const [draftContent, setDraftContent] = useState(currentNote?.noteContent ?? "");

  // Keep drafts in sync when selection changes
  React.useEffect(() => {
    setDraftTitle(currentNote?.title ?? "");
    setDraftContent(currentNote?.noteContent ?? "");
  }, [selectedNoteId, selectedNotebookId]);

  function toggleExpand(notebookId: string) {
    setExpandedNotebookIds((s) => ({ ...s, [notebookId]: !s[notebookId] }));
  }

  function createNote() {
    const newNote: Note = {
      id: makeId(),
      title: "Untitled",
      dateCreated: new Date().toISOString(),
      noteContent: "",
      tags: [],
    };
    setNotebooks((list) =>
      list.map((nb) => (nb.id === selectedNotebookId ? { ...nb, notes: [newNote, ...nb.notes] } : nb))
    );
    setSelectedNoteId(newNote.id);
  }

  function createNotebook() {
    const colors = ["#ffd966", "#7be8ff", "#a78bfa", "#ff9ee3", "#8ef6a9"];
    const book = {
      id: makeId(),
      title: `Notebook ${notebooks.length + 1}`,
      dateCreated: new Date().toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      notes: [],
    } as NoteBook;
    setNotebooks((list) => [book, ...list].slice(0, 20));
    // select newly created notebook
    setSelectedNotebookId(book.id);
    setExpandedNotebookIds((s) => ({ ...s, [book.id]: true }));
  }

  function saveNote() {
    if (!currentNotebook || !currentNote) return;
    setNotebooks((list) =>
      list.map((nb) => {
        if (nb.id !== currentNotebook.id) return nb;
        return {
          ...nb,
          notes: nb.notes.map((n) => (n.id === currentNote.id ? { ...n, title: draftTitle, noteContent: draftContent } : n)),
        };
      })
    );
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div className={`p-4 notebook-root ${drawerOpen ? "drawer-open" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="mobile-hamburger mr-2" onClick={() => setDrawerOpen((s) => !s)} aria-label="Open notebooks menu">
            ☰
          </button>
          <div className="font-bold">Notes</div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-[260px] notebook-aside" aria-hidden={!drawerOpen && undefined}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded" style={{ background: currentNotebook?.color ?? "#222" }} />
              <div>
                <div className="font-bold">Notebooks</div>
                <div className="text-sm opacity-60">Manage notebooks and pages</div>
              </div>
            </div>
            <div>
              <button onClick={createNotebook} className="px-2 py-1 border rounded bg-blue-600 text-white">+ New notebook</button>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-auto">
            {notebooks.map((nb) => (
              <div key={nb.id} className="p-3 border rounded bg-white/3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded" style={{ background: nb.color }} />
                    <div>
                      <div className="font-semibold">{nb.title}</div>
                      <div className="text-xs opacity-60">{nb.notes.length} pages</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedNotebookId(nb.id);
                        toggleExpand(nb.id);
                      }}
                      className="px-2 py-1 border rounded"
                      aria-expanded={!!expandedNotebookIds[nb.id]}
                    >
                      {expandedNotebookIds[nb.id] ? "▾" : "▸"}
                    </button>
                  </div>
                </div>

                {expandedNotebookIds[nb.id] && (
                  <div className="mt-2 space-y-2 pl-2">
                    <div className="text-xs opacity-60">Pages</div>
                    <div className="space-y-1">
                      {nb.notes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => {
                            setSelectedNotebookId(nb.id);
                            setSelectedNoteId(note.id);
                          }}
                          className={`w-full text-left px-2 py-1 rounded ${note.id === selectedNoteId ? "bg-white/5 font-medium" : "hover:bg-white/2"}`}
                        >
                          <div className="text-sm">{note.title || "Untitled"}</div>
                          <div className="text-xs opacity-50">{new Date(note.dateCreated).toLocaleDateString()}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <button onClick={createNote} className="px-3 py-1 border rounded">+ New page</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
  </aside>

  {/* Overlay for drawer on mobile */}
  {drawerOpen && <div className="drawer-overlay" onClick={closeDrawer} />}

        {/* Main content area */}
  <section className="flex-1 main-content">
          {!currentNote && (
            <div className="p-6 border rounded">No page selected. Create a page from the sidebar.</div>
          )}

          {currentNote && (
            <div className="border rounded p-4">
              <div className="mb-4 flex items-center justify-between note-header">
                <div>
                  <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="text-2xl font-semibold bg-transparent border-b pb-1" />
                  <div className="text-xs opacity-60">Created {new Date(currentNote.dateCreated).toLocaleString()}</div>
                </div>
                <div>
                  <button onClick={saveNote} className="px-3 py-1 border rounded bg-blue-600 text-white save-btn">Save</button>
                </div>
              </div>

              <div>
                <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} rows={20} className="w-full p-3 border rounded font-mono" placeholder="Write your note here..." />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
