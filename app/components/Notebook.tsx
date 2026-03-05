"use client";

import React, { useState } from "react";
import type { Note, NoteBook } from "../types";

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function getTutorialNote(): Note {
  return {
    id: makeId(),
    title: "Welcome to Notebooks",
    dateCreated: new Date().toISOString(),
    noteContent: `Welcome to the Notebook mini app!

Here's how to use it:

📓 NOTEBOOKS
• Click the + button to create new notebooks
• Choose a name and color for organization
• Use the ✏️ button to edit notebook settings

📄 PAGES
• Each notebook can have multiple pages
• Click the 📄 icon to add a new page
• Click any page name to view and edit it
• Your notes auto-save when you click Save

💡 TIPS
• Open the hamburger menu (☰) to access your notebooks
• Notes are saved to your browser's local storage
• Use different colored notebooks to organize topics
• The chevron (▸/▾) expands/collapses notebook contents

Happy note-taking!`,
    tags: ["tutorial"],
  };
}

function createDefaultNotebook(): NoteBook {
  return {
    id: makeId(),
    title: "My Notes",
    dateCreated: new Date().toISOString(),
    color: "#7be8ff",
    notes: [getTutorialNote()],
  };
}

export default function NotebookApp() {
  const STORAGE_KEY = "omni_notebooks_v1";

  // Initialize notebooks from localStorage or use default
  const [notebooks, setNotebooks] = useState<NoteBook[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as NoteBook[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    return [createDefaultNotebook()];
  });

  const [expandedNotebookIds, setExpandedNotebookIds] = useState<Record<string, boolean>>(() => {
    return { [notebooks[0]?.id]: true };
  });
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>(() => notebooks[0]?.id ?? "");
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => notebooks[0]?.notes[0]?.id ?? "");

  // Persist notebooks when they change
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
    } catch (e) {
      // ignore
    }
  }, [notebooks]);

  // Local editing state for the current note
  const currentNotebook = notebooks.find((n) => n.id === selectedNotebookId) as NoteBook | undefined;
  const currentNote = currentNotebook?.notes.find((x) => x.id === selectedNoteId);

  const [draftTitle, setDraftTitle] = useState(currentNote?.title ?? "");
  const [draftContent, setDraftContent] = useState(currentNote?.noteContent ?? "");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotebookId, setEditingNotebookId] = useState<string>("");
  const [modalNotebookTitle, setModalNotebookTitle] = useState("");
  const [modalNotebookColor, setModalNotebookColor] = useState("#7be8ff");

  // Delete mode states
  const [deleteMode, setDeleteMode] = useState<Record<string, boolean>>({});
  const [markedForDeletion, setMarkedForDeletion] = useState<Record<string, string[]>>({});
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingNotebookId, setDeletingNotebookId] = useState<string>("");

  // Keep drafts in sync when selection changes
  React.useEffect(() => {
    setDraftTitle(currentNote?.title ?? "");
    setDraftContent(currentNote?.noteContent ?? "");
  }, [selectedNoteId, selectedNotebookId, currentNote]);

  // Detect unsaved changes
  const hasUnsavedChanges = React.useMemo(() => {
    if (!currentNote) return false;
    return draftTitle !== currentNote.title || draftContent !== currentNote.noteContent;
  }, [draftTitle, draftContent, currentNote]);

  function toggleExpand(notebookId: string) {
    setExpandedNotebookIds((s) => ({ ...s, [notebookId]: !s[notebookId] }));
  }

  function createNote(notebookId: string) {
    const newNote: Note = {
      id: makeId(),
      title: "Untitled",
      dateCreated: new Date().toISOString(),
      noteContent: "",
      tags: [],
    };
    setNotebooks((list) =>
      list.map((nb) => (nb.id === notebookId ? { ...nb, notes: [newNote, ...nb.notes] } : nb))
    );
    setSelectedNotebookId(notebookId);
    setSelectedNoteId(newNote.id);
  }

  function openCreateModal() {
    setModalNotebookTitle(`Notebook ${notebooks.length + 1}`);
    setModalNotebookColor("#7be8ff");
    setShowCreateModal(true);
  }

  function createNotebook() {
    if (!modalNotebookTitle.trim()) return;
    const book = {
      id: makeId(),
      title: modalNotebookTitle,
      dateCreated: new Date().toISOString(),
      color: modalNotebookColor,
      notes: [],
    } as NoteBook;
    setNotebooks((list) => [book, ...list].slice(0, 20));
    setSelectedNotebookId(book.id);
    setExpandedNotebookIds((s) => ({ ...s, [book.id]: true }));
    setShowCreateModal(false);
    setModalNotebookTitle("");
  }

  function openEditModal(notebookId: string) {
    const notebook = notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;
    setEditingNotebookId(notebookId);
    setModalNotebookTitle(notebook.title);
    setModalNotebookColor(notebook.color || "#7be8ff");
    setShowEditModal(true);
  }

  function updateNotebook() {
    if (!modalNotebookTitle.trim()) return;
    setNotebooks((list) =>
      list.map((nb) =>
        nb.id === editingNotebookId
          ? { ...nb, title: modalNotebookTitle, color: modalNotebookColor }
          : nb
      )
    );
    setShowEditModal(false);
    setEditingNotebookId("");
    setModalNotebookTitle("");
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

  function toggleDeleteMode(notebookId: string) {
    const isCurrentlyInDeleteMode = deleteMode[notebookId];
    
    if (isCurrentlyInDeleteMode) {
      // If there are marked pages, show confirmation
      const markedPages = markedForDeletion[notebookId] || [];
      if (markedPages.length > 0) {
        setDeletingNotebookId(notebookId);
        setShowDeleteConfirmModal(true);
      } else {
        // No pages marked, just exit delete mode
        setDeleteMode((prev) => ({ ...prev, [notebookId]: false }));
      }
    } else {
      // Enter delete mode
      setDeleteMode((prev) => ({ ...prev, [notebookId]: true }));
      setMarkedForDeletion((prev) => ({ ...prev, [notebookId]: [] }));
    }
  }

  function toggleMarkForDeletion(notebookId: string, noteId: string) {
    setMarkedForDeletion((prev) => {
      const current = prev[notebookId] || [];
      if (current.includes(noteId)) {
        return { ...prev, [notebookId]: current.filter((id) => id !== noteId) };
      } else {
        return { ...prev, [notebookId]: [...current, noteId] };
      }
    });
  }

  function confirmDeletePages() {
    const markedPages = markedForDeletion[deletingNotebookId] || [];
    if (markedPages.length === 0) return;

    setNotebooks((list) =>
      list.map((nb) => {
        if (nb.id !== deletingNotebookId) return nb;
        return {
          ...nb,
          notes: nb.notes.filter((note) => !markedPages.includes(note.id)),
        };
      })
    );

    // Clear delete mode and marked pages
    setDeleteMode((prev) => ({ ...prev, [deletingNotebookId]: false }));
    setMarkedForDeletion((prev) => ({ ...prev, [deletingNotebookId]: [] }));
    setShowDeleteConfirmModal(false);
    setDeletingNotebookId("");

    // If the selected note was deleted, clear selection
    if (markedPages.includes(selectedNoteId)) {
      setSelectedNoteId("");
    }
  }

  function cancelDeleteConfirmation() {
    setShowDeleteConfirmModal(false);
    setDeletingNotebookId("");
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  function closeDrawer() {
    // Check if any notebook is in delete mode
    const isAnyNotebookInDeleteMode = Object.values(deleteMode).some((mode) => mode);
    if (isAnyNotebookInDeleteMode) {
      return; // Don't close drawer in delete mode
    }
    setDrawerOpen(false);
  }

  return (
    <div className={`notebook-root ${drawerOpen ? "drawer-open" : ""}`}>
      <div className="notebook-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="mobile-hamburger mr-2" onClick={() => setDrawerOpen((s) => !s)} aria-label="Open notebooks menu">
            ☰
          </button>
          <div className="font-bold text-lg">Notes</div>
        </div>
      </div>

      <div className="notebook-body flex">
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
              <button 
                onClick={openCreateModal} 
                className="w-8 h-8 flex items-center justify-center border rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="New notebook"
                aria-label="New notebook"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-auto notebook-list">
            {notebooks.map((nb) => (
              <div key={nb.id} className="p-3 border rounded bg-white/3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded flex-shrink-0" style={{ background: nb.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate" title={nb.title}>
                        {nb.title.length > 20 ? `${nb.title.substring(0, 20)}...` : nb.title}
                      </div>
                      <div className="text-xs opacity-60">{nb.notes.length} pages</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNotebookId(nb.id);
                      toggleExpand(nb.id);
                    }}
                    className="px-2 py-1 border rounded flex-shrink-0"
                    aria-expanded={!!expandedNotebookIds[nb.id]}
                  >
                    {expandedNotebookIds[nb.id] ? "▾" : "▸"}
                  </button>
                </div>

                {expandedNotebookIds[nb.id] && (
                  <div className="mt-3 space-y-2 pl-2">
                    {/* Action buttons row */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => createNote(nb.id)} 
                        className="flex-1 px-3 py-1.5 border rounded flex items-center justify-center gap-1 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="New page"
                        disabled={deleteMode[nb.id]}
                      >
                        📄
                      </button>
                      <button
                        onClick={() => openEditModal(nb.id)}
                        className="flex-1 px-3 py-1.5 border rounded flex items-center justify-center gap-1 hover:bg-white/5 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit notebook"
                        disabled={deleteMode[nb.id]}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleDeleteMode(nb.id)}
                        className={`flex-1 px-3 py-1.5 border rounded flex items-center justify-center gap-1 transition-colors text-sm ${deleteMode[nb.id] ? "bg-red-600/20 border-red-500 hover:bg-red-600/30" : "hover:bg-white/5"}`}
                        title={deleteMode[nb.id] ? "Confirm deletion" : "Delete pages"}
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Pages list */}
                    <div className="text-xs opacity-60 mt-3">Pages</div>
                    <div className="space-y-1">
                      {nb.notes.map((note) => (
                        <div key={note.id} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (deleteMode[nb.id]) return;
                              setSelectedNotebookId(nb.id);
                              setSelectedNoteId(note.id);
                              closeDrawer();
                            }}
                            className={`flex-1 text-left px-2 py-1 rounded transition-colors ${
                              markedForDeletion[nb.id]?.includes(note.id)
                                ? "bg-red-600/20 border border-red-500"
                                : note.id === selectedNoteId
                                ? "bg-white/5 font-medium"
                                : "hover:bg-white/2"
                            } ${deleteMode[nb.id] ? "cursor-default" : ""}`}
                          >
                            <div className="text-sm">{note.title || "Untitled"}</div>
                            <div className="text-xs opacity-50">{new Date(note.dateCreated).toLocaleDateString()}</div>
                          </button>
                          {deleteMode[nb.id] && (
                            <button
                              onClick={() => toggleMarkForDeletion(nb.id, note.id)}
                              className={`px-2 py-1 border rounded text-xs transition-colors flex-shrink-0 ${
                                markedForDeletion[nb.id]?.includes(note.id)
                                  ? "bg-red-600 border-red-500 text-white"
                                  : "hover:bg-white/5"
                              }`}
                              title={markedForDeletion[nb.id]?.includes(note.id) ? "Unmark" : "Mark for deletion"}
                            >
                              {markedForDeletion[nb.id]?.includes(note.id) ? "✓" : "✕"}
                            </button>
                          )}
                        </div>
                      ))}
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
            <div className="notebook-canvas px-6 py-8">
              <div className="text-center opacity-60">No page selected. Create a page from the sidebar.</div>
            </div>
          )}

          {currentNote && (
            <div className="notebook-canvas">
              <div className="notebook-title-area px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <input 
                    value={draftTitle} 
                    onChange={(e) => setDraftTitle(e.target.value)} 
                    className="text-3xl font-bold bg-transparent border-none outline-none w-full" 
                    placeholder="Untitled"
                  />
                  <div className="text-xs opacity-50 mt-1">Created {new Date(currentNote.dateCreated).toLocaleString()}</div>
                </div>
                <div>
                  <button onClick={saveNote} className="notebook-save-btn relative">
                    Save
                    {hasUnsavedChanges && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--background)]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="notebook-editor-area px-6 py-4">
                <textarea 
                  value={draftContent} 
                  onChange={(e) => setDraftContent(e.target.value)} 
                  className="w-full h-full bg-transparent border-none outline-none resize-none" 
                  placeholder="Start writing..."
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div className="notebook-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="notebook-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Create New Notebook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-80">Notebook Name</label>
                <input
                  type="text"
                  value={modalNotebookTitle}
                  onChange={(e) => setModalNotebookTitle(e.target.value)}
                  maxLength={20}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500"
                  placeholder="My Notebook"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && createNotebook()}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 opacity-80">Color Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {["#7be8ff", "#a78bfa", "#ff9ee3", "#8ef6a9", "#ffd966", "#ff6b6b", "#4ecdc4", "#ffe66d", "#a8dadc", "#f4a261"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setModalNotebookColor(color)}
                      className={`w-12 h-12 rounded border-2 transition-all ${
                        modalNotebookColor === color ? "border-white scale-110" : "border-transparent hover:border-white/30"
                      }`}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createNotebook}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={!modalNotebookTitle.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notebook Modal */}
      {showEditModal && (
        <div className="notebook-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="notebook-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Edit Notebook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-80">Notebook Name</label>
                <input
                  type="text"
                  value={modalNotebookTitle}
                  onChange={(e) => setModalNotebookTitle(e.target.value)}
                  maxLength={20}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:border-blue-500"
                  placeholder="My Notebook"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && updateNotebook()}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 opacity-80">Color Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {["#7be8ff", "#a78bfa", "#ff9ee3", "#8ef6a9", "#ffd966", "#ff6b6b", "#4ecdc4", "#ffe66d", "#a8dadc", "#f4a261"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setModalNotebookColor(color)}
                      className={`w-12 h-12 rounded border-2 transition-all ${
                        modalNotebookColor === color ? "border-white scale-110" : "border-transparent hover:border-white/30"
                      }`}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateNotebook}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={!modalNotebookTitle.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="notebook-modal-overlay">
          <div className="notebook-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-red-400">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{markedForDeletion[deletingNotebookId]?.length || 0}</span> page(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteConfirmation}
                className="px-4 py-2 border rounded hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePages}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Yes, Delete Them
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
