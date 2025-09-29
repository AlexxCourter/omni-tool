"use client";

import React, { useEffect, useState } from "react";
import type { View } from "../types";

const STORAGE_KEY = "omni_quickselect_v1";

const AVAILABLE: { id: View; label: string; icon: string }[] = [
  { id: "calculator", label: "Calculator", icon: "/calculator.png" },
  { id: "notebook", label: "Notebook", icon: "/notebook.png" },
  { id: "worldclock", label: "World Clock", icon: "/clock.png" },
  { id: "dice", label: "Dice", icon: "/die.png" },
  { id: "counter", label: "Counter", icon: "/counter.png" },
  { id: "dashboard", label: "Dashboard", icon: "/omnitool.png" },
  { id: "quickmarks", label: "Quickmarks", icon: "/quickmark.png" },
];

export default function BottomQuickMenu({ setView }: { setView: React.Dispatch<React.SetStateAction<View>> }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<View[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as View[];
        setSelected(parsed.slice(0, 4));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch (e) {
      // ignore
    }
  }, [selected]);

  function toggleApp(app: View) {
    setSelected((s) => {
      const idx = s.indexOf(app);
      if (idx !== -1) {
        return s.filter((x) => x !== app);
      }
      if (s.length >= 4) return s;
      return [...s, app];
    });
  }

  return (
    <>
      <div className="bottom-quick-menu fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end p-3 pointer-events-auto">
        <div className="w-full max-w-4xl mx-auto relative">
          <div className="bg-transparent h-12 rounded flex items-center justify-end px-4">
            <button onClick={() => setOpen(true)} className="p-2 rounded text-xl" title="Open quick menu settings">🔧</button>
          </div>
        </div>
      </div>

      {/* Drawer on right */}
      <div className={`fixed top-0 right-0 bottom-0 w-[320px] z-60 transform transition-transform ${open ? "translate-x-0" : "translate-x-full"}`} style={{ background: 'var(--background)', color: 'var(--foreground)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">Add up to 4 to your quick select menu</div>
            <div className="text-xs opacity-60">Tap icons to toggle</div>
          </div>
          <div>
            <button onClick={() => setOpen(false)} className="px-2 py-1 border rounded">Close</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-3 gap-3">
          {AVAILABLE.map((a) => {
            const idx = selected.indexOf(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggleApp(a.id)}
                className="relative p-2 border rounded flex flex-col items-center gap-1"
                style={{ opacity: idx !== -1 ? 0.5 : 1 }}
              >
                {a.icon ? (
                  <img src={a.icon} alt={a.label} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-white">{a.label[0]}</div>
                )}
                <div className="text-xs opacity-70">{a.label}</div>
                {idx !== -1 && (
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <div className="font-semibold">Preview</div>
          <div className="mt-2 flex gap-2">
            {selected.map((s, i) => (
              <button key={s} onClick={() => setView(s)} className="p-2 border rounded">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
