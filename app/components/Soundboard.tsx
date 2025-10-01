"use client";

import React from "react";

function playTone(freq: number, duration = 0.6) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    o.start();
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      try { o.stop(); } catch (e) {}
      try { ctx.close(); } catch (e) {}
    }, duration * 1000);
  } catch (e) {
    // ignore if audio fails
  }
}

export default function Soundboard() {
  const freqs = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Soundboard</h1>
        <p className="text-sm opacity-70 mt-2">Tap a pad to play a sound.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {freqs.map((f, i) => (
          <button
            key={i}
            onClick={() => playTone(f)}
            className="p-4 border rounded bg-white/3 flex items-center justify-center text-xl font-semibold"
          >
            Pad {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
