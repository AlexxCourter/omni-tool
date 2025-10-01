"use client";

import React, { useEffect, useState } from "react";

const EMOJI_POOL = ["🍎", "🚗", "🐶", "🌟", "🍕", "🎵", "🍩", "🌈", "⚽️", "🐱", "🎲", "🍀", "🧩", "🍓", "🛸"];

type Card = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Memoji() {
  const [cards, setCards] = useState<Card[]>([]);
  const [first, setFirst] = useState<number | null>(null);
  const [second, setSecond] = useState<number | null>(null);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (first === null || second === null) return;
    const f = cards.find((c) => c.id === first);
    const s = cards.find((c) => c.id === second);
    if (!f || !s) return;

    setLock(true);
    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => {
          if (c.id === f.id || c.id === s.id) {
            if (f.emoji === s.emoji) {
              return { ...c, matched: true };
            }
            return { ...c, flipped: false };
          }
          return c;
        })
      );
      setFirst(null);
      setSecond(null);
      setLock(false);
      setMoves((m) => m + 1);
    }, 700);
  }, [first, second, cards]);

  function reset() {
    // pick 6 random unique emojis from the pool for variety
    const poolShuffled = shuffle(EMOJI_POOL).slice(0, 6);
    const pairEmojis = poolShuffled.concat(poolShuffled);
    const shuffled = shuffle(pairEmojis).map((emoji, idx) => ({
      id: idx,
      emoji,
      flipped: false,
      matched: false,
    }));
    setCards(shuffled);
    setFirst(null);
    setSecond(null);
    setLock(false);
    setMoves(0);
  }

  function flipCard(id: number) {
    if (lock) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    if (first === null) setFirst(id);
    else if (second === null) setSecond(id);
  }

  const completed = cards.length > 0 && cards.every((c) => c.matched);

  return (
    <div className="memoji-root">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Memoji — Memory Game</h2>
        <div className="text-sm opacity-70">Moves: {moves}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 memoji-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={`memoji-card ${card.flipped ? "selected" : ""} ${card.matched ? "matched" : ""}`}
            aria-label={card.flipped || card.matched ? `Card ${card.emoji}` : `Hidden card`}
          >
            <div className="memoji-card-inner">
              {/* front is emoji, back is the face-down card color */}
              <div className="memoji-card-front" aria-hidden={!card.flipped && !card.matched}>
                {card.emoji}
              </div>
              <div className="memoji-card-back" aria-hidden={card.flipped || card.matched} />
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 border rounded" onClick={reset} aria-label="Restart game">
          Restart
        </button>
        {completed && <div className="text-green-600 font-semibold">You solved it in {moves} moves 🎉</div>}
      </div>
    </div>
  );
}
