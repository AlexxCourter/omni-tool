"use client";

import React, { useEffect, useState } from "react";

type Quick = { url: string } | null;

const STORAGE_KEY = "omni_quickmarks_v1";

function domainFromUrl(u: string) {
  try {
    const url = new URL(u);
    return url.hostname;
  } catch (e) {
    // try to treat as domain
    return u.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function faviconFor(url: string) {
  const d = domainFromUrl(url);
  // Use Google's favicon service (works well for most sites)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64`;
}

export default function Quickmarks() {
  const [items, setItems] = useState<Quick[]>(Array(8).fill(null));
  const [editMode, setEditMode] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [modalValue, setModalValue] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Array<Quick>;
        const filled = Array(8).fill(null).map((_, i) => parsed[i] ?? null);
        setItems(filled);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function openAdd(i: number) {
    setModalIndex(i);
    setModalValue(items[i]?.url ?? "");
  }

  function saveModal() {
    if (modalIndex == null) return;
    const v = modalValue.trim();
    setItems((arr) => arr.map((a, idx) => (idx === modalIndex ? (v ? { url: v } : null) : a)));
    setModalIndex(null);
    setModalValue("");
  }

  function removeAt(i: number) {
    setItems((arr) => arr.map((a, idx) => (idx === i ? null : a)));
  }

  // Drag & drop (simple swap implementation)
  function onDragStart(e: React.DragEvent, idx: number) {
    e.dataTransfer.setData("text/plain", String(idx));
  }

  function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const src = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isFinite(src)) {
      setItems((arr) => {
        const copy = [...arr];
        const tmp = copy[src];
        copy[src] = copy[idx];
        copy[idx] = tmp;
        return copy;
      });
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quickmarks</h2>
          <div className="text-sm opacity-70">Your fast links (up to 8)</div>
        </div>
        <div>
          <button
            onClick={() => setEditMode((s) => !s)}
            className="px-3 py-1 border rounded bg-transparent"
            title="Edit quickmarks"
          >
            ✎
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it, idx) => (
          <div
            key={idx}
            draggable={editMode}
            onDragStart={(e) => onDragStart(e, idx)}
            onDrop={(e) => onDrop(e, idx)}
            onDragOver={onDragOver}
            className="relative p-4 border rounded h-32 flex flex-col items-center justify-center bg-white/3"
          >
            {editMode && (
              <button
                onClick={() => removeAt(idx)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                title="Remove"
              >
                ×
              </button>
            )}

            {it ? (
              <a href={it.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 w-full text-center">
                <img src={faviconFor(it.url)} alt="icon" className="w-10 h-10 object-contain" />
                <div className="text-xs truncate px-1 break-all opacity-90">{it.url}</div>
              </a>
            ) : (
              <button
                onClick={() => openAdd(idx)}
                className="w-full h-full flex flex-col items-center justify-center text-3xl text-opacity-80"
                aria-label={`Add quickmark ${idx + 1}`}
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {/* modal */}
      {modalIndex != null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalIndex(null)} />
          <div className="p-6 rounded z-70 w-full max-w-md" style={{ background: 'var(--background)', color: 'var(--foreground)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
            <div className="mb-2 font-semibold">Add Quickmark</div>
            <input
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 rounded border"
              style={{ background: 'transparent', color: 'var(--foreground)' }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalIndex(null)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={saveModal} className="px-3 py-1 border rounded bg-blue-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
