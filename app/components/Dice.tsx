"use client";

import React, { useState } from "react";

const DICE = [4, 6, 8, 10, 12, 20, 100];

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

export default function Dice() {
  const [selected, setSelected] = useState<number>(6);
  const [result, setResult] = useState<number | string | null>(null);

  function doRoll() {
    if (selected === 0) {
      // coin flip
      const coin = Math.random() < 0.5 ? "Heads" : "Tails";
      setResult(coin);
      return;
    }
    const r = rollDie(selected);
    setResult(r);
  }

  return (
    <div className="p-6 border rounded max-w-md mx-auto">
      <div className="mb-4">
        <div className="text-sm opacity-60">Select a die</div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {DICE.map((d) => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`dice-btn ${selected === d ? "selected-dice" : ""}`}
            >
              d{d}
            </button>
          ))}
          <button onClick={() => setSelected(0)} className={`dice-btn ${selected === 0 ? "selected-dice" : ""}`}>Coin</button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs opacity-60">Result</div>
        <div className="text-center text-6xl font-mono p-6 border rounded bg-white/5 mt-2">{result ?? "-"}</div>
      </div>

      <div className="flex justify-center">
        <button onClick={doRoll} className="px-6 py-3 bg-blue-600 text-white rounded text-xl">Roll</button>
      </div>
    </div>
  );
}
