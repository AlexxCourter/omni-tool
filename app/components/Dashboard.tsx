"use client";

import React from "react";
import type { View } from "../types";

export default function Dashboard({ setView }: { setView: React.Dispatch<React.SetStateAction<View>> }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm opacity-70 mt-2">Quick access to your mini-apps and status at a glance.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setView("calculator")}
          className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2"
          aria-label="Open Calculator"
        >
          <img src="/calculator.png" alt="Calculator" className="w-20 h-20 object-contain" />
          <div className="font-semibold">Calculator</div>
        </button>

        <button
          onClick={() => setView("notebook")}
          className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2"
          aria-label="Open Notebook"
        >
          <img src="/notebook.png" alt="Notebook" className="w-20 h-20 object-contain" />
          <div className="font-semibold">Notebook</div>
        </button>

        <button
          onClick={() => setView("worldclock")}
          className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2"
          aria-label="Open World Clock"
        >
          <img src="/clock.png" alt="World Clock" className="w-20 h-20 object-contain" />
          <div className="font-semibold">World Clock</div>
        </button>

        <button
          onClick={() => setView("dice")}
          className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2"
          aria-label="Open Dice"
        >
          <img src="/die.png" alt="Dice" className="w-20 h-20 object-contain" />
          <div className="font-semibold">Dice</div>
        </button>

        <button
          onClick={() => setView("quickmarks")}
          className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2"
          aria-label="Open Quickmarks"
        >
          <img src="/quickmark.png" alt="Quickmarks" className="w-20 h-20 object-contain" />
          <div className="font-semibold">Quickmarks</div>
        </button>

        <button
          onClick={() => setView("counter")}
          className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2"
          aria-label="Open Counter"
        >
          <img src="/counter.png" alt="Counter" className="w-20 h-20 object-contain" />
          <div className="font-semibold">Counter</div>
        </button>
      </div>
    </div>
  );
}

