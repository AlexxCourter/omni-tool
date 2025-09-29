"use client";

import React from "react";

type View = "calculator" | "notebook" | "counter" | "dice" | "worldclock";

export default function Header({
  view,
  setView,
}: {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>>;
}) {
  return (
    <header className="w-full border-b py-3 px-6 flex items-center gap-4">
      <div className="font-bold text-lg flex items-center gap-2">
        <img src="/omnitool.png" alt="OMNI-TOOL logo" className="logo-img" />
        <span>OMNI-TOOL</span>
      </div>

      <div className="flex-1 flex justify-center">
        <select
          aria-label="Select mini app"
          value={view}
          onChange={(e) => setView(e.target.value as View)}
          className="px-3 py-1 border rounded"
        >
          <option value="calculator">Calculator</option>
          <option value="notebook">Notebook</option>
          <option value="counter">Counter</option>
          <option value="dice">Dice</option>
          <option value="worldclock">World Clock</option>
        </select>
      </div>

      <div className="opacity-60 text-sm">mini-apps</div>
    </header>
  );
}
