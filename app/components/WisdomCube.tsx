"use client";

import React, { useState } from "react";
import type { View } from "../types";

const AFFIRMATIVE = [
  "Yes — the cosmos quietly concurs.",
  "It is ordained; move forward.",
  "The currents of fate flow in your favor.",
  "The answer is yes, as certain as dawn.",
  "By the deep wisdom I perceive — proceed.",
  "The pattern affirms this; go forth.",
  "The path opens; the reply is yes.",
  "Without hesitation: yes."
];

const NEGATIVE = [
  "No — the currents run against it.",
  "It is not ordained; stand back.",
  "The pattern forbids this course.",
  "The answer is no; the gates remain closed.",
  "By what I perceive, do not proceed.",
  "The omen is contrary; the reply is no.",
  "The path is barred; choose differently.",
  "Without doubt: no."
];

const ANSWERS = [...AFFIRMATIVE, ...NEGATIVE];

export default function WisdomCube({ onClose }: { onClose?: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  function resetCube() {
    setAnswer(null);
    setOverlayVisible(false);
    setSpinning(false);
  }

  function obtainWisdom() {
    if (answer) {
      // reset to start state
      setAnswer(null);
      setOverlayVisible(false);
      return;
    }

    setAnswer(null);
    setOverlayVisible(false);
    setSpinning(true);

    // simulate a spin then settle
    setTimeout(() => {
      // slow down and show result
      const pick = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(pick);
      setSpinning(false);

      // briefly allow cube to finish settle, then show overlay
      setTimeout(() => setOverlayVisible(true), 220);
    }, 1400);
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6 wisdom-root">
      <h2 className="text-2xl font-semibold">Wisdom Cube</h2>

      <div className="cube-stage">
        <div className={`cube ${spinning ? "spin" : "settle"}`} aria-hidden>
          <div className="cube-face cube-face-front"></div>
          <div className="cube-face cube-face-back"></div>
          <div className="cube-face cube-face-left"></div>
          <div className="cube-face cube-face-right"></div>
          <div className="cube-face cube-face-top"></div>
          <div className="cube-face cube-face-bottom"></div>
        </div>

        {/* overlay when answer is present */}
        {overlayVisible && answer && (
          <div className="cube-overlay" role="status" aria-live="polite" onClick={() => { resetCube(); }}>
            <div className="cube-overlay-card">{answer}</div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button onClick={obtainWisdom} className="btn btn-eq px-4 py-2">
          {answer ? "Ask another question" : "Obtain wisdom from the cube"}
        </button>
      </div>

      <div className="mt-2 text-sm opacity-70 text-center max-w-xl">
        The cube's wisdom is too powerful for anything simpler than a yes or no question. Anything more would corrupt our feeble minds.
      </div>

      {/* overlay is the primary live region now; remove duplicate inline status text */}

      {onClose && (
        <div className="mt-4">
          <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
        </div>
      )}
    </div>
  );
}
