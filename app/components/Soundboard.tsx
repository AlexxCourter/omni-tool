"use client";

import React, { useEffect, useCallback } from "react";

declare global {
  interface Window {
    // older Safari exposes webkitAudioContext
    webkitAudioContext?: typeof AudioContext;
  }
}

function playTone(freq: number, duration = 0.6) {
  try {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
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
      try {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      } catch (err) {
        /* ignore */
      }
      try {
        o.stop();
      } catch (err) {
        /* ignore */
      }
      try {
        ctx.close();
      } catch (err) {
        /* ignore */
      }
    }, duration * 1000);
  } catch (e) {
    // ignore if audio fails
  }
}

export default function Soundboard() {
  const freqs = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];

  // Piano keys: C4 to C5 (13 keys - 8 white, 5 black)
  const pianoKeys = [
    { note: 'C', freq: 261.63, key: 'a', isBlack: false },
    { note: 'C#', freq: 277.18, key: 'w', isBlack: true },
    { note: 'D', freq: 293.66, key: 's', isBlack: false },
    { note: 'D#', freq: 311.13, key: 'e', isBlack: true },
    { note: 'E', freq: 329.63, key: 'd', isBlack: false },
    { note: 'F', freq: 349.23, key: 'f', isBlack: false },
    { note: 'F#', freq: 369.99, key: 't', isBlack: true },
    { note: 'G', freq: 392.00, key: 'g', isBlack: false },
    { note: 'G#', freq: 415.30, key: 'y', isBlack: true },
    { note: 'A', freq: 440.00, key: 'h', isBlack: false },
    { note: 'A#', freq: 466.16, key: 'u', isBlack: true },
    { note: 'B', freq: 493.88, key: 'j', isBlack: false },
    { note: 'C5', freq: 523.25, key: 'k', isBlack: false },
  ];

  const playPianoKey = useCallback((freq: number) => {
    playTone(freq, 0.4);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent repeat when key is held
      if (e.repeat) return;
      
      const key = e.key.toLowerCase();
      const pianoKey = pianoKeys.find(k => k.key === key);
      
      if (pianoKey) {
        e.preventDefault();
        playPianoKey(pianoKey.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playPianoKey]);

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

      {/* Mini Piano Keyboard */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Mini Piano</h2>
        <p className="text-xs opacity-60 mb-4">Click keys or use keyboard: A S D F G H J K (white) • W E T Y U (black)</p>
        
        <div className="inline-block bg-gray-800 p-3 rounded-lg max-w-full overflow-x-auto">
          <div className="relative flex" style={{ height: '160px', minWidth: 'fit-content' }}>
            {/* White keys first (in order with proper indexing) */}
            {pianoKeys.filter(k => !k.isBlack).map((k, whiteIdx) => {
              const originalIdx = pianoKeys.indexOf(k);
              return (
                <button
                  key={originalIdx}
                  onClick={() => playPianoKey(k.freq)}
                  className="bg-white border-2 border-gray-700 rounded-b hover:bg-gray-100 transition-colors flex flex-col items-center justify-end pb-2"
                  style={{
                    width: '36px',
                    height: '160px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                  title={`${k.note} (${k.key.toUpperCase()})`}
                >
                  <span className="text-xs text-gray-600 font-medium">{k.key.toUpperCase()}</span>
                </button>
              );
            })}
            
            {/* Black keys positioned absolutely over white keys */}
            {pianoKeys.filter(k => k.isBlack).map((k, blackIdx) => {
              const originalIdx = pianoKeys.indexOf(k);
              // Calculate position based on which white keys it sits between
              let leftPosition = 0;
              if (originalIdx === 1) leftPosition = 24; // C# (between C and D)
              else if (originalIdx === 3) leftPosition = 60; // D# (between D and E)
              else if (originalIdx === 6) leftPosition = 132; // F# (between F and G)
              else if (originalIdx === 8) leftPosition = 168; // G# (between G and A)
              else if (originalIdx === 10) leftPosition = 204; // A# (between A and B)
              
              return (
                <button
                  key={originalIdx}
                  onClick={() => playPianoKey(k.freq)}
                  className="absolute bg-gray-900 border-2 border-gray-700 rounded-b hover:bg-gray-800 transition-colors flex flex-col items-center justify-end pb-1"
                  style={{
                    width: '24px',
                    height: '100px',
                    left: `${leftPosition}px`,
                    zIndex: 2,
                  }}
                  title={`${k.note} (${k.key.toUpperCase()})`}
                >
                  <span className="text-xs text-white/60">{k.key.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
