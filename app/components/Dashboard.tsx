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

  {/* Artist Pack moved below games */}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Omni-tools</h2>
        <p className="text-sm opacity-60">Useful utilities and productivity helpers</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <button onClick={() => setView("calculator")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Calculator">
            <img src="/calculator.png" alt="Calculator" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Calculator</div>
          </button>

          <button onClick={() => setView("counter")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Counter">
            <img src="/counter.png" alt="Counter" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Counter</div>
          </button>

          <button onClick={() => setView("notebook")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Notebook">
            <img src="/notebook.png" alt="Notebook" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Notebook</div>
          </button>

          <button onClick={() => setView("quickmarks")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Quickmarks">
            <img src="/quickmark.png" alt="Quickmarks" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Quickmarks</div>
          </button>

          <button onClick={() => setView("budget")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Budget">
            <img src="/budget.png" alt="Budget" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Budget</div>
          </button>

          <button onClick={() => setView("worldclock")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open World Clock">
            <img src="/clock.png" alt="World Clock" className="w-20 h-20 object-contain" />
            <div className="font-semibold">World Clock</div>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Omni-Games</h2>
        <p className="text-sm opacity-60">Fun mini-games and playful tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <button onClick={() => setView("checkers")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Checkers">
            <img src="/checkers.png" alt="Checkers" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Checkers</div>
          </button>

          <button onClick={() => setView("chess")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Chess">
            <img src="/chess.png" alt="Chess" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Chess</div>
          </button>

          <button onClick={() => setView("dice")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Dice">
            <img src="/die.png" alt="Dice" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Dice</div>
          </button>

          <button onClick={() => setView("memoji")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Memoji">
            <img src="/memoji.png" alt="Memoji" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Memoji</div>
          </button>

          <button onClick={() => setView("soundboard")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Soundboard">
            <img src="/soundboard.png" alt="Soundboard" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Soundboard</div>
          </button>

          <button onClick={() => setView("wisdomcube")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Wisdom Cube">
            <img src="/wisdomcube.png" alt="Wisdom Cube" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Wisdom Cube</div>
          </button>

          <button onClick={() => setView("omnipet")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Omni-pet">
            <img src="/omnipet.png" alt="Omni-pet" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Omni-pet</div>
          </button>

          <button onClick={() => setView("omniwheel")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Omni Wheel">
            <img src="/spinner.png" alt="Omni Wheel" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Omni Wheel</div>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Artist Pack</h2>
        <p className="text-sm opacity-60">Tools for color, composition, sketching, and value checks</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <button onClick={() => setView("colorpicker")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Color Picker">
            <img src="/colorpicker.png" alt="Color Picker" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Color Picker</div>
          </button>

          <button onClick={() => setView("contrast")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Contrast Checker">
            <img src="/contrastchecker.png" alt="Contrast Checker" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Contrast Checker</div>
          </button>

          <button onClick={() => setView("sketch")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Sketch Pad">
            <img src="/sketchpad.png" alt="Sketch Pad" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Sketch Pad</div>
          </button>

          <button onClick={() => setView("gridoverlay")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Grid Overlay">
            <img src="/gridoverlay.png" alt="Grid Overlay" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Grid Overlay</div>
          </button>

          <button onClick={() => setView("value")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Open Value Checker">
            <img src="/valuechecker.png" alt="Value Checker" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Value Checker</div>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Financial Planning</h2>
        <p className="text-sm opacity-60">Simple calculators for savings, loans and ROI.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <button onClick={() => setView("savings")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Savings Growth">
            <img src="/budget.png" alt="Savings" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Savings Growth</div>
          </button>

          <button onClick={() => setView("loan")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="Loan Calculator">
            <img src="/calculator.png" alt="Loan" className="w-20 h-20 object-contain" />
            <div className="font-semibold">Loan Calculator</div>
          </button>

          <button onClick={() => setView("roi")} className="p-4 border rounded hover:shadow-md flex flex-col items-center gap-2" aria-label="ROI Calculator">
            <img src="/valuechecker.png" alt="ROI" className="w-20 h-20 object-contain" />
            <div className="font-semibold">ROI Calculator</div>
          </button>
        </div>
      </div>
    </div>
  );
}

